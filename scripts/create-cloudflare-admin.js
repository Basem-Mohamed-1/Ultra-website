import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { randomBytes, pbkdf2Sync } from 'node:crypto';

function readHiddenPassword(prompt) {
  if (!stdin.isTTY || typeof stdin.setRawMode !== 'function') throw new Error('Run this command in an interactive terminal.');
  stdout.write(prompt);
  stdin.setRawMode(true);
  stdin.setEncoding('utf8');
  stdin.resume();
  return new Promise((resolve, reject) => {
    let password = '';
    const finish = error => { stdin.off('data', onData); stdin.setRawMode(false); stdin.pause(); stdout.write('\n'); error ? reject(error) : resolve(password); };
    const onData = chunk => { for (const character of chunk) { if (character === '\u0003') return finish(new Error('Cancelled.')); if (character === '\r' || character === '\n') return finish(); if (character === '\u007f' || character === '\b') password = [...password].slice(0, -1).join(''); else if (character >= ' ') password += character; } };
    stdin.on('data', onData);
  });
}

const readline = createInterface({ input: stdin, output: stdout });
try {
  const email = (await readline.question('Admin email: ')).trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Enter a valid email address.');
  const password = await readHiddenPassword('Admin password (8–72 bytes, input hidden): ');
  if (Buffer.byteLength(password, 'utf8') < 8 || Buffer.byteLength(password, 'utf8') > 72) throw new Error('Password must be between 8 and 72 bytes.');
  if (password !== await readHiddenPassword('Confirm admin password: ')) throw new Error('Passwords did not match.');
  const salt = randomBytes(16).toString('base64url');
  const hash = pbkdf2Sync(password, Buffer.from(salt, 'base64url'), 210000, 32, 'sha256').toString('hex');
  console.log('\nRun this command in the project folder to save the account in D1:');
  console.log(`npx wrangler d1 execute ultra-leads --remote --command "INSERT INTO admin_users (email, password_hash) VALUES ('${email.replaceAll("'", "''")}', '${salt}$${hash}') ON CONFLICT(email) DO UPDATE SET password_hash = excluded.password_hash;"`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally { readline.close(); }

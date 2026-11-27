import { clearCsrfCookie, json, makeToken, sessionCookie, sessionHash } from '../../_middleware.js';

function decodeBase64Url(value) {
  const normalized = value.replaceAll('-', '+').replaceAll('_', '/');
  return Uint8Array.from(atob(normalized + '='.repeat((4 - normalized.length % 4) % 4)), character => character.charCodeAt(0));
}

async function hashPassword(password, salt) {
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: decodeBase64Url(salt), iterations: 210000 }, material, 256);
  return [...new Uint8Array(bits)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function onRequestPost({ request, env, data }) {
  if (!data.csrfValid) return json({ message: 'Security check expired. Refresh the page and try again.' }, 403);
  let body;
  try { body = await request.json(); } catch { return json({ message: 'Request body must be valid JSON.' }, 400); }
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body?.password === 'string' ? body.password : '';
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password || new TextEncoder().encode(password).length > 72) return json({ message: 'Enter a valid email and password.' }, 400);

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const ipHash = await sessionHash(ip);
  const now = Math.floor(Date.now() / 1000);
  const attempts = await env.DB.prepare('SELECT attempts, window_started_at, blocked_until FROM login_attempts WHERE ip_hash = ?').bind(ipHash).first();
  if (attempts?.blocked_until > now) return json({ message: 'Too many sign-in attempts. Please wait and try again.' }, 429);

  const admin = await env.DB.prepare('SELECT id, email, password_hash FROM admin_users WHERE email = ? COLLATE NOCASE').bind(email).first();
  const [salt, expected] = (admin?.password_hash || '').split('$');
  const actual = salt ? await hashPassword(password, salt) : '';
  if (!admin || !expected || actual !== expected) {
    const windowStart = attempts && now - attempts.window_started_at < 900 ? attempts.window_started_at : now;
    const count = attempts && windowStart === attempts.window_started_at ? attempts.attempts + 1 : 1;
    const blockedUntil = count >= 5 ? now + 900 : 0;
    await env.DB.prepare(`INSERT INTO login_attempts (ip_hash, attempts, window_started_at, blocked_until) VALUES (?, ?, ?, ?)
      ON CONFLICT(ip_hash) DO UPDATE SET attempts = excluded.attempts, window_started_at = excluded.window_started_at, blocked_until = excluded.blocked_until`)
      .bind(ipHash, count, windowStart, blockedUntil).run();
    return json({ message: blockedUntil ? 'Too many sign-in attempts. Please wait and try again.' : 'Email or password is incorrect.' }, blockedUntil ? 429 : 401);
  }

  if (!data.csrfValid) return json({ message: 'Your session expired. Refresh and try again.' }, 403);
  await env.DB.prepare('DELETE FROM login_attempts WHERE ip_hash = ?').bind(ipHash).run();
  const sid = makeToken();
  const csrf = makeToken();
  const nowSeconds = Math.floor(Date.now() / 1000);
  await env.DB.prepare('DELETE FROM admin_sessions WHERE sid_hash = ?').bind(await sessionHash(data.sessionId || '')).run();
  await env.DB.prepare('INSERT INTO admin_sessions (sid_hash, admin_id, csrf_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?)')
    .bind(await sessionHash(sid), admin.id, await sessionHash(csrf), nowSeconds + 8 * 60 * 60, nowSeconds).run();
  return json({ authenticated: true, email: admin.email, csrfToken: csrf }, 200, { 'Set-Cookie': `${sessionCookie(sid)}, ${clearCsrfCookie()}` });
}

const SESSION_TTL_SECONDS = 8 * 60 * 60;
const CSRF_TTL_SECONDS = 10 * 60;

async function sha256(value) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

function bytesToBase64Url(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}

function randomToken() {
  return bytesToBase64Url(crypto.getRandomValues(new Uint8Array(32)));
}

function parseCookies(header = '') {
  return Object.fromEntries(header.split(';').map(part => part.trim().split(/=(.*)/s, 2)).filter(([key, value]) => key && value !== undefined).map(([key, value]) => [key, decodeURIComponent(value)]));
}

function cookie(value, maxAge = SESSION_TTL_SECONDS) {
  return `ultra_admin_session=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;
}

async function sign(value, secret) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value));
  return bytesToBase64Url(new Uint8Array(signature));
}

function csrfCookie(value, maxAge = CSRF_TTL_SECONDS) {
  return `ultra_admin_csrf=${encodeURIComponent(value)}; Path=/; Secure; SameSite=Strict; Max-Age=${maxAge}`;
}

export async function onRequest(context) {
  const { request, env, next, data } = context;
  const url = new URL(request.url);
  if (!url.pathname.startsWith('/api/admin/')) return next();

  const cookies = parseCookies(request.headers.get('Cookie') || '');
  const rawSession = cookies.ultra_admin_session;
  let session = null;
  if (rawSession && env.DB) {
    session = await env.DB.prepare('SELECT admin_id, csrf_hash, expires_at FROM admin_sessions WHERE sid_hash = ? AND expires_at > ?')
      .bind(await sha256(rawSession), Math.floor(Date.now() / 1000)).first();
  }

  if (!session && url.pathname === '/api/admin/session') {
    const csrfToken = randomToken();
    data.csrfToken = csrfToken;
    data.setCsrfCookie = csrfCookie(`${csrfToken}.${await sign(csrfToken, env.ADMIN_CSRF_SECRET)}`);
    data.session = null;
    return next();
  }

  if (!session && url.pathname !== '/api/admin/login') {
    data.session = null;
    data.sessionId = rawSession;
    data.csrfValid = false;
    const response = await next();
    const headers = new Headers(response.headers);
    headers.set('Cache-Control', 'no-store');
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  }

  data.session = session?.admin_id ? session : null;
  data.sessionId = rawSession;
  if (session?.admin_id) {
    data.csrfValid = request.method === 'GET' || (await sha256(request.headers.get('X-CSRF-Token') || '')) === session.csrf_hash;
  } else if (url.pathname === '/api/admin/login') {
    const provided = request.headers.get('X-CSRF-Token') || '';
    const csrfCookieValue = cookies.ultra_admin_csrf || '';
    const [cookieToken, cookieSignature] = csrfCookieValue.split('.');
    const expectedSignature = cookieToken ? await sign(cookieToken, env.ADMIN_CSRF_SECRET) : '';
    data.csrfValid = Boolean(cookieToken && cookieToken === provided && cookieSignature === expectedSignature && (!session || (await sha256(provided)) === session.csrf_hash));
  } else {
    data.csrfValid = false;
  }

  const response = await next();
  const headers = new Headers(response.headers);
  if (data.setCsrfCookie) headers.append('Set-Cookie', data.setCsrfCookie);
  if (response.status === 401 && session?.admin_id) {
    headers.append('Set-Cookie', cookie('', 0));
    await env.DB.prepare('DELETE FROM admin_sessions WHERE sid_hash = ?').bind(await sha256(rawSession)).run();
  }
  headers.set('Cache-Control', 'no-store');
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

export async function sessionHash(value) {
  return sha256(value);
}

export function makeToken() {
  return randomToken();
}

export function sessionCookie(value, maxAge = SESSION_TTL_SECONDS) {
  return cookie(value, maxAge);
}

export function clearCsrfCookie() {
  return csrfCookie('', 0);
}

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers } });
}

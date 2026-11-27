import { json, sessionCookie, sessionHash } from '../../_middleware.js';

export async function onRequestPost({ env, data }) {
  if (!Number.isInteger(data.session?.admin_id)) return json({ message: 'Please sign in to continue.' }, 401);
  if (!data.csrfValid) return json({ message: 'Your session expired. Refresh and try again.' }, 403);
  await env.DB.prepare('DELETE FROM admin_sessions WHERE sid_hash = ?').bind(await sessionHash(data.sessionId)).run();
  return json({ message: 'Signed out.' }, 200, { 'Set-Cookie': sessionCookie('', 0) });
}

import { json } from '../../../../_middleware.js';

const statuses = ['New', 'Contacted', 'Qualified', 'Converted', 'Lost'];

export async function onRequestPatch({ request, params, env, data }) {
  if (!Number.isInteger(data.session?.admin_id)) return json({ message: 'Please sign in to continue.' }, 401);
  if (!data.csrfValid) return json({ message: 'Your session expired. Refresh and try again.' }, 403);
  if (!/^\d+$/.test(params.id)) return json({ message: 'Lead ID is invalid.' }, 400);
  let body;
  try { body = await request.json(); } catch { return json({ message: 'Request body must be valid JSON.' }, 400); }
  if (typeof body?.status !== 'string' || !statuses.includes(body.status)) return json({ message: 'Choose a valid lead status.' }, 400);
  const result = await env.DB.prepare('UPDATE leads SET status = ? WHERE id = ?').bind(body.status, Number(params.id)).run();
  if (!result.meta.changes) return json({ message: 'Lead was not found.' }, 404);
  const lead = await env.DB.prepare('SELECT id, full_name, phone_number, email, service_required, status, created_at FROM leads WHERE id = ?').bind(Number(params.id)).first();
  return json({ lead });
}

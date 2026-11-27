import { json } from '../../../_middleware.js';

const selection = 'id, full_name, phone_number, email, service_required, status, created_at';

export async function onRequestGet({ params, env, data }) {
  if (!Number.isInteger(data.session?.admin_id)) return json({ message: 'Please sign in to continue.' }, 401);
  if (!/^\d+$/.test(params.id)) return json({ message: 'Lead ID is invalid.' }, 400);
  const lead = await env.DB.prepare(`SELECT ${selection} FROM leads WHERE id = ?`).bind(Number(params.id)).first();
  return lead ? json({ lead }) : json({ message: 'Lead was not found.' }, 404);
}

export async function onRequestDelete({ params, env, data }) {
  if (!Number.isInteger(data.session?.admin_id)) return json({ message: 'Please sign in to continue.' }, 401);
  if (!data.csrfValid) return json({ message: 'Your session expired. Refresh and try again.' }, 403);
  if (!/^\d+$/.test(params.id)) return json({ message: 'Lead ID is invalid.' }, 400);
  const result = await env.DB.prepare('DELETE FROM leads WHERE id = ?').bind(Number(params.id)).run();
  return result.meta.changes ? json({ message: 'Lead deleted.' }) : json({ message: 'Lead was not found.' }, 404);
}

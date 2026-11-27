import { json } from '../../_middleware.js';

export async function onRequestGet({ env, data }) {
  if (!Number.isInteger(data.session?.admin_id)) return json({ message: 'Please sign in to continue.' }, 401);
  const counts = await env.DB.prepare(`SELECT COUNT(*) AS total,
    COALESCE(SUM(CASE WHEN status = 'New' THEN 1 ELSE 0 END), 0) AS new_leads,
    COALESCE(SUM(CASE WHEN status = 'Contacted' THEN 1 ELSE 0 END), 0) AS contacted_leads,
    COALESCE(SUM(CASE WHEN status = 'Converted' THEN 1 ELSE 0 END), 0) AS converted_leads FROM leads`).first();
  const byService = await env.DB.prepare('SELECT service_required AS service, COUNT(*) AS total FROM leads GROUP BY service_required ORDER BY service_required').all();
  return json({ total: counts.total, new: counts.new_leads, contacted: counts.contacted_leads, converted: counts.converted_leads, byService: byService.results });
}

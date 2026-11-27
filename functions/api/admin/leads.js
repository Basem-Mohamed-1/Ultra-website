import { json } from '../../_middleware.js';

const statuses = ['New', 'Contacted', 'Qualified', 'Converted', 'Lost'];
const services = ['Project Execution', 'Project design', 'Design and execution', 'Mechanical services', 'Electrical services', 'Plumbing services'];
const validDate = value => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T00:00:00.000Z`).getTime()) && new Date(`${value}T00:00:00.000Z`).toISOString().slice(0, 10) === value;

export async function onRequestGet({ request, env, data }) {
  if (!Number.isInteger(data.session?.admin_id)) return json({ message: 'Please sign in to continue.' }, 401);
  const params = new URL(request.url).searchParams;
  const page = params.get('page') || '1';
  const limit = params.get('limit') || '10';
  const q = params.get('q') || '';
  const service = params.get('service') || '';
  const status = params.get('status') || '';
  const from = params.get('from') || '';
  const to = params.get('to') || '';
  if (!/^\d+$/.test(page) || Number(page) < 1 || Number(page) > 1_000_000 || !['10', '25', '50'].includes(limit)) return json({ message: 'Page or page size is invalid.' }, 400);
  if (q.length > 120 || (service && !services.includes(service)) || (status && !statuses.includes(status))) return json({ message: 'Search or filter is invalid.' }, 400);
  if ((from && !validDate(from)) || (to && !validDate(to)) || (from && to && from > to)) return json({ message: 'Date range is invalid.' }, 400);

  const where = [];
  const values = [];
  if (q.trim()) { where.push('(instr(lower(full_name), lower(?)) > 0 OR instr(lower(phone_number), lower(?)) > 0 OR instr(lower(email), lower(?)) > 0)'); values.push(q.trim(), q.trim(), q.trim()); }
  if (service) { where.push('service_required = ?'); values.push(service); }
  if (status) { where.push('status = ?'); values.push(status); }
  if (from) { where.push('created_at >= ?'); values.push(`${from}T00:00:00.000Z`); }
  if (to) { where.push('created_at <= ?'); values.push(`${to}T23:59:59.999Z`); }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const totalResult = await env.DB.prepare(`SELECT COUNT(*) AS total FROM leads ${whereSql}`).bind(...values).first();
  const total = Number(totalResult.total);
  const results = await env.DB.prepare(`SELECT id, full_name, phone_number, email, service_required, status, created_at FROM leads ${whereSql}
    ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`).bind(...values, Number(limit), (Number(page) - 1) * Number(limit)).all();
  return json({ leads: results.results, page: Number(page), limit: Number(limit), total, totalPages: Math.max(1, Math.ceil(total / Number(limit))) });
}

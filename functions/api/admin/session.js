import { json } from '../../_middleware.js';

export function onRequestGet({ data }) {
  return json({ authenticated: Number.isInteger(data.session?.admin_id), csrfToken: data.csrfToken || '' });
}

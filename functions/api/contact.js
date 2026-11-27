import { json } from '../_middleware.js';

const services = new Set(['Project Execution', 'Project design', 'Design and execution']);

function clean(value) {
  return typeof value === 'string' ? value.replace(/[\u0000-\u001f\u007f]/g, ' ').trim() : '';
}

export async function onRequestPost({ request, env }) {
  let body;
  try { body = await request.json(); } catch { return json({ message: 'Request body must be valid JSON.' }, 400); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return json({ message: 'Please provide your contact details.' }, 400);

  const lead = {
    fullName: clean(body.fullName),
    phoneNumber: clean(body.phoneNumber),
    email: clean(body.email).toLowerCase(),
    serviceRequired: clean(body.serviceRequired),
  };
  if (!lead.fullName || lead.fullName.length > 100) return json({ message: 'Enter your name (up to 100 characters).' }, 400);
  const digits = (lead.phoneNumber.match(/\d/g) || []).length;
  if (!lead.phoneNumber || lead.phoneNumber.length > 30 || !/^[+()\d.\s-]+$/.test(lead.phoneNumber) || digits < 7 || digits > 15) return json({ message: 'Enter a valid phone number.' }, 400);
  if (lead.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) return json({ message: 'Enter a valid email address.' }, 400);
  if (!services.has(lead.serviceRequired)) return json({ message: 'Choose one of the listed services.' }, 400);

  const result = await env.DB.prepare('INSERT INTO leads (full_name, phone_number, email, service_required) VALUES (?, ?, ?, ?)')
    .bind(lead.fullName, lead.phoneNumber, lead.email, lead.serviceRequired).run();
  let emailSent = false;
  if (env.RESEND_API_KEY && env.CONTACT_RECIPIENT && env.SMTP_FROM) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST', headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: env.SMTP_FROM, to: [env.CONTACT_RECIPIENT], reply_to: lead.email,
          subject: 'New Contact Request – Ultra',
          text: `A new contact request was submitted on the Ultra website.\n\nFull Name: ${lead.fullName}\nPhone Number: ${lead.phoneNumber}\nEmail: ${lead.email}\nService Required: ${lead.serviceRequired}`,
        }),
      });
      emailSent = response.ok;
    } catch (error) { console.error('Lead notification email failed:', error); }
  }
  return json({ message: 'Thank you. Your request has been received.', emailSent, id: result.meta.last_row_id }, 201);
}

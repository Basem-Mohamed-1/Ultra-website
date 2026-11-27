import { randomBytes } from 'node:crypto';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import express from 'express';
import helmet from 'helmet';
import session from 'express-session';
import { database, databasePath, saveLead } from './database.js';
import { sendLeadNotification } from './email.js';
import { validateLead } from './validation.js';
import { createAdminRouter } from './admin-routes.js';
import { SQLiteSessionStore, sessionLifetimeMs } from './session-store.js';

const app = express();
const port = Number(process.env.PORT || 3000);
const production = process.env.NODE_ENV === 'production';
const staticDirectory = resolve('dist');
const sessionSecret = process.env.ADMIN_SESSION_SECRET || (!production ? randomBytes(48).toString('base64url') : '');
if (!sessionSecret || Buffer.byteLength(sessionSecret) < 32) {
  throw new Error('Set ADMIN_SESSION_SECRET to a random secret of at least 32 bytes.');
}

app.disable('x-powered-by');
app.set('trust proxy', production ? Number(process.env.TRUST_PROXY_HOPS || 1) : false);
app.use(helmet());
app.use(express.json({ limit: '10kb', type: 'application/json' }));
app.use(session({
  name: 'ultra_admin_session',
  secret: sessionSecret,
  store: new SQLiteSessionStore(database),
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    httpOnly: true,
    sameSite: 'strict',
    secure: production,
    maxAge: sessionLifetimeMs,
    path: '/',
  },
}));

app.post('/api/contact', async (request, response, next) => {
  const { lead, error } = validateLead(request.body);
  if (error) return response.status(400).json({ message: error });

  let savedLead;
  try {
    savedLead = saveLead(lead);
  } catch (saveError) {
    return next(saveError);
  }

  let emailSent = false;
  try {
    emailSent = await sendLeadNotification(savedLead);
  } catch (emailError) {
    console.error(`Lead ${savedLead.id} was saved, but its notification email failed:`, emailError);
  }

  return response.status(201).json({
    message: 'Thank you. Your request has been received.',
    emailSent,
  });
});

app.use('/api/admin', createAdminRouter(database));
app.use('/api', (_request, response) => response.status(404).json({ message: 'API endpoint not found.' }));

app.get('/healthz', (_request, response) => response.status(200).json({ status: 'ok' }));

if (production) {
  if (!existsSync(staticDirectory)) {
    throw new Error('Production frontend files are missing. Run npm run build before starting the server.');
  }

  const cleanRoutes = new Map([
    ['/about', 'about.html'],
    ['/services', 'services.html'],
    ['/services/hvac', 'services-hvac.html'],
    ['/services/electrical-power', 'services-electrical-power.html'],
    ['/services/plumbing-drainage', 'services-plumbing-drainage.html'],
    ['/services/fire-fighting', 'services-fire-fighting.html'],
    ['/services/fire-alarm', 'services-fire-alarm.html'],
    ['/services/low-current-elv', 'services-low-current-elv.html'],
    ['/services/shop-drawings', 'services-shop-drawings.html'],
    ['/services/maintenance', 'services-maintenance.html'],
    ['/projects', 'projects.html'],
    ['/blogs', 'blogs.html'],
    ['/blogs/bathroom-kitchen-plumbing-installation', 'blogs-bathroom-kitchen-plumbing-installation.html'],
    ['/blogs/ceiling-electrical-installation', 'blogs-ceiling-electrical-installation.html'],
    ['/blogs/central-heating-systems', 'blogs-central-heating-systems.html'],
    ['/blogs/electrical-load-distribution-boards', 'blogs-electrical-load-distribution-boards.html'],
    ['/blogs/fire-alarm-system-design-installation', 'blogs-fire-alarm-system-design-installation.html'],
    ['/blogs/vrf-air-conditioning-systems', 'blogs-vrf-air-conditioning-systems.html'],
    ['/blogs/air-conditioning-piping-before-plastering', 'blogs-air-conditioning-piping-before-plastering.html'],
    ['/blogs/electrical-infrastructure-works', 'blogs-electrical-infrastructure-works.html'],
    ['/approach', 'approach.html'],
    ['/contact', 'index.html'],
    ['/admin', 'admin.html'],
  ]);
  const legacyRoutes = new Map([
    ['/index.html', '/'], ['/about.html', '/about'], ['/services.html', '/services'],
    ['/projects.html', '/projects'], ['/blogs.html', '/blogs'], ['/approach.html', '/approach'],
    ['/contact.html', '/contact'], ['/admin.html', '/admin'], ['/services-bms.html', '/services/shop-drawings'],
  ]);

  app.get([...legacyRoutes.keys()], (request, response) => response.redirect(301, legacyRoutes.get(request.path)));
  app.use(express.static(staticDirectory, { index: false, maxAge: '1h' }));
  app.get('/', (_request, response) => response.sendFile(resolve(staticDirectory, 'index.html')));
  app.get([...cleanRoutes.keys()], (request, response) => response.sendFile(resolve(staticDirectory, cleanRoutes.get(request.path))));
  app.use((_request, response) => response.status(404).sendFile(resolve(staticDirectory, 'index.html')));
}

app.use((error, _request, response, _next) => {
  if (error.type === 'entity.parse.failed') {
    return response.status(400).json({ message: 'Request body must be valid JSON.' });
  }
  if (error.type === 'entity.too.large') {
    return response.status(413).json({ message: 'Request body is too large.' });
  }
  console.error('Contact API error:', error);
  return response.status(500).json({ message: 'We could not save your request. Please try again.' });
});

export const server = app.listen(port, () => console.log(`Ultra API listening on http://localhost:${port} (database: ${databasePath})`));

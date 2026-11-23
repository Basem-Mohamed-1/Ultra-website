import fs from 'node:fs';
import path from 'node:path';
import { loadEnv } from 'vite';
import { seoPages } from './src/data/seo-pages.js';

const cleanRoutes = new Map([
  ['/about', '/about.html'],
  ['/services', '/services.html'],
  ['/services/hvac', '/services-hvac.html'],
  ['/services/electrical-power', '/services-electrical-power.html'],
  ['/services/plumbing-drainage', '/services-plumbing-drainage.html'],
  ['/services/fire-fighting', '/services-fire-fighting.html'],
  ['/services/fire-alarm', '/services-fire-alarm.html'],
  ['/services/low-current-elv', '/services-low-current-elv.html'],
  ['/services/shop-drawings', '/services-shop-drawings.html'],
  ['/services/maintenance', '/services-maintenance.html'],
  ['/projects', '/projects.html'],
  ['/blogs', '/blogs.html'],
  ['/blogs/bathroom-kitchen-plumbing-installation', '/blogs-bathroom-kitchen-plumbing-installation.html'],
  ['/blogs/ceiling-electrical-installation', '/blogs-ceiling-electrical-installation.html'],
  ['/blogs/central-heating-systems', '/blogs-central-heating-systems.html'],
  ['/blogs/electrical-load-distribution-boards', '/blogs-electrical-load-distribution-boards.html'],
  ['/blogs/fire-alarm-system-design-installation', '/blogs-fire-alarm-system-design-installation.html'],
  ['/blogs/vrf-air-conditioning-systems', '/blogs-vrf-air-conditioning-systems.html'],
  ['/blogs/air-conditioning-piping-before-plastering', '/blogs-air-conditioning-piping-before-plastering.html'],
  ['/blogs/electrical-infrastructure-works', '/blogs-electrical-infrastructure-works.html'],
  ['/approach', '/approach.html'],
  ['/contact', '/index.html'],
  ['/admin', '/admin.html'],
]);

const legacyRoutes = new Map([
  ['/services/bms', '/services/shop-drawings'],
  ['/services-bms.html', '/services/shop-drawings'],
  ['/contact.html', '/contact'],
  ['/admin.html', '/admin'],
]);

for (const [fileName, page] of Object.entries(seoPages)) {
  if (page.path !== '/') legacyRoutes.set(`/${fileName}`, page.path);
}
legacyRoutes.set('/index.html', '/');

function cleanUrlMiddleware() {
  return (request, response, next) => {
    if (request.method !== 'GET' && request.method !== 'HEAD') return next();

    const requestUrl = new URL(request.url, 'http://vite.local');
    const pathname = requestUrl.pathname;
    const cleanPath = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;

    if (cleanPath !== pathname && (cleanRoutes.has(cleanPath) || cleanPath === '/')) {
      response.statusCode = 301;
      response.setHeader('Location', `${cleanPath || '/'}${requestUrl.search}`);
      return response.end();
    }

    const legacyTarget = legacyRoutes.get(pathname);
    if (legacyTarget) {
      response.statusCode = 301;
      response.setHeader('Location', `${legacyTarget}${requestUrl.search}`);
      return response.end();
    }

    const htmlEntry = cleanRoutes.get(pathname);
    if (htmlEntry) request.url = `${htmlEntry}${requestUrl.search}`;
    else if (
      request.method === 'GET' &&
      request.headers.accept?.includes('text/html') &&
      !path.extname(pathname) &&
      !pathname.startsWith('/@') &&
      !pathname.startsWith('/__') &&
      pathname !== '/'
    ) {
      response.statusCode = 404;
      response.setHeader('Content-Type', 'text/html; charset=utf-8');
      return response.end('<!doctype html><html lang="en"><meta charset="utf-8"><meta name="robots" content="noindex,follow"><title>Page not found | Ultra</title><body><main><h1>Page not found</h1><p>The page you requested could not be found.</p><a href="/">Return to Ultra</a></main></body></html>');
    }
    return next();
  };
}

const cleanUrls = {
  name: 'ultra-clean-urls',
  configureServer(server) {
    server.middlewares.use(cleanUrlMiddleware());
  },
  configurePreviewServer(server) {
    server.middlewares.use(cleanUrlMiddleware());
  },
};

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

function prerenderSeoMarkup(page) {
  const navigation = [
    ['Home', '/'], ['About', '/about'], ['Services', '/services'],
    ['Projects', '/projects'], ['Blogs', '/blogs'], ['Approach', '/approach'], ['Contact', '/contact'],
  ];
  const links = items => items?.map(([label, href]) => `<a href="${href}">${escapeHtml(label)}</a>`).join(' ') || '';
  const sections = page.sections.map(section => `<section><h2>${escapeHtml(section.heading)}</h2>${section.text ? `<p>${escapeHtml(section.text)}</p>` : ''}${section.items?.length ? `<ul>${section.items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : ''}${section.links ? `<p class="seo-prerender-links">${links(section.links)}</p>` : ''}</section>`).join('');
  const breadcrumbMarkup = page.breadcrumbs?.length > 1 ? `<nav class="seo-prerender-breadcrumbs" aria-label="Breadcrumb"><ol>${page.breadcrumbs.map((item, index) => `<li>${index === page.breadcrumbs.length - 1 ? `<span aria-current="page">${escapeHtml(item.name)}</span>` : `<a href="${item.path}">${escapeHtml(item.name)}</a>`}</li>`).join('')}</ol></nav>` : '';
  const imageMarkup = page.image ? `<figure class="seo-prerender-image"><img src="${page.image}" alt="${escapeHtml(page.imageAlt || '')}" loading="eager"></figure>` : '';
  return `<div class="seo-prerender"><header class="seo-prerender-header"><a href="/" aria-label="Ultra home"><img src="/images/ultra-logo.svg" alt="Ultra MEP Engineering"></a><nav aria-label="Main navigation">${links(navigation)}</nav></header><main>${breadcrumbMarkup}<p class="seo-prerender-eyebrow">${escapeHtml(page.eyebrow)}</p><h1>${escapeHtml(page.heading)}</h1><p class="seo-prerender-intro">${escapeHtml(page.introduction)}</p>${imageMarkup}${sections}</main><footer><a href="/">Ultra</a> · Mechanical, electrical and plumbing engineering</footer></div>`;
}

function structuredDataMarkup(page, siteUrl) {
  const organization = { '@type': 'Organization', name: 'Ultra' };
  const website = { '@type': 'WebSite', name: 'Ultra' };
  if (siteUrl) {
    organization['@id'] = `${siteUrl}/#organization`;
    organization.url = `${siteUrl}/`;
    organization.logo = `${siteUrl}/images/ultra-logo.svg`;
    website['@id'] = `${siteUrl}/#website`;
    website.url = `${siteUrl}/`;
    website.publisher = { '@id': organization['@id'] };
  }
  const graph = [organization, website];

  if (page.schemaType === 'Service') {
    const service = {
      '@type': 'Service',
      name: page.heading,
      serviceType: page.serviceType,
      description: page.description,
      provider: siteUrl ? { '@id': organization['@id'] } : organization,
      areaServed: { '@type': 'Country', name: 'Egypt' },
    };
    if (siteUrl) service.url = `${siteUrl}${page.path}`;
    graph.push(service);
  }

  if (page.schemaType === 'BlogPosting') {
    const article = {
      '@type': 'BlogPosting',
      headline: page.heading,
      description: page.description,
      datePublished: page.datePublished,
      publisher: siteUrl ? { '@id': organization['@id'] } : organization,
    };
    if (siteUrl) {
      article.mainEntityOfPage = `${siteUrl}${page.path}`;
      article.image = `${siteUrl}${page.image}`;
    }
    graph.push(article);
  }

  if (siteUrl && page.breadcrumbs?.length > 1) {
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: page.breadcrumbs.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: `${siteUrl}${item.path}`,
      })),
    });
  }

  return `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replaceAll('<', '\\u003c')}</script>`;
}

const fontHints = {
  name: 'ultra-font-hints',
  transformIndexHtml(html) {
    const fontLinks = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">';
    return html.includes('fonts.googleapis.com/css2?family=DM+Sans') ? html : html.replace('</head>', `${fontLinks}</head>`);
  },
};

function seoFoundation() {
  let siteUrl = '';
  let outputDirectory = '';
  return {
    name: 'ultra-seo-foundation',
    config(_config, { mode }) {
      const configuredUrl = loadEnv(mode, process.cwd(), 'VITE_').VITE_SITE_URL?.trim();
      if (!configuredUrl) return;
      try {
        const parsed = new URL(configuredUrl);
        if (!['https:', 'http:'].includes(parsed.protocol)) throw new Error('VITE_SITE_URL must use HTTP or HTTPS.');
        siteUrl = parsed.origin;
      } catch (error) {
        console.warn(`SEO canonical URLs are disabled: ${error.message}`);
      }
    },
    configResolved(config) {
      outputDirectory = path.resolve(config.root, config.build.outDir);
    },
    transformIndexHtml(html, context) {
      // The SEO snapshot is for static production output. In Vite dev mode it
      // masks the app whenever a module fails during refresh, so keep the mount empty.
      if (context.server) return html;
      const page = seoPages[path.basename(context.filename)];
      if (!page) return html;

      const canonical = siteUrl ? `<link rel="canonical" href="${siteUrl}${page.path}"><meta property="og:url" content="${siteUrl}${page.path}">` : '';
      const imageMeta = siteUrl && page.image ? `<meta property="og:image" content="${siteUrl}${page.image}">` : '';
      const social = `<meta property="og:type" content="${page.schemaType === 'BlogPosting' ? 'article' : 'website'}"><meta property="og:site_name" content="Ultra"><meta property="og:title" content="${escapeHtml(page.title)}"><meta property="og:description" content="${escapeHtml(page.description)}">${imageMeta}<meta name="twitter:card" content="${page.image && siteUrl ? 'summary_large_image' : 'summary'}"><meta name="twitter:title" content="${escapeHtml(page.title)}"><meta name="twitter:description" content="${escapeHtml(page.description)}">`;
      const robots = `<meta name="robots" content="${escapeHtml(page.robots || 'index,follow')}">`;
      const jsonLd = structuredDataMarkup(page, siteUrl);
      return html
        .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(page.title)}</title>`)
        .replace(/<meta\s+name="description"[^>]*>/, `<meta name="description" content="${escapeHtml(page.description)}">`)
        .replace('</head>', `${canonical}${robots}${social}${jsonLd}</head>`)
        .replace('<div id="app"></div>', `<div id="app" class="is-prerendered">${prerenderSeoMarkup(page)}</div>`);
    },
    closeBundle() {
      const sitemapPath = path.join(outputDirectory, 'sitemap.xml');
      if (siteUrl) {
        const urls = [...new Set(Object.values(seoPages).filter(page => page.robots !== 'noindex,follow').map(page => page.path))];
        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(url => `  <url><loc>${siteUrl}${url === '/' ? '/' : url}</loc></url>`).join('\n')}\n</urlset>\n`;
        fs.writeFileSync(sitemapPath, sitemap);
      }
      for (const fileName of ['robots.txt', 'sitemap.xml']) {
        const filePath = path.join(outputDirectory, fileName);
        if (!fs.existsSync(filePath)) continue;
        let content = fs.readFileSync(filePath, 'utf8');
        if (fileName === 'sitemap.xml' && !siteUrl) {
          fs.rmSync(filePath, { force: true });
          console.warn('No production sitemap was emitted: set VITE_SITE_URL to Ultra’s verified public domain before building for deployment.');
          continue;
        }
        if (fileName === 'robots.txt' && !siteUrl) content = content.replace(/^Sitemap:.*\n?/m, '');
        if (siteUrl) content = content.replaceAll('__SITE_URL__', siteUrl);
        fs.writeFileSync(filePath, content);
      }
    },
  };
}

export default {
  plugins: [cleanUrls, fontHints, seoFoundation()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        about: 'about.html',
        services: 'services.html',
        serviceHvac: 'services-hvac.html',
        serviceElectricalPower: 'services-electrical-power.html',
        servicePlumbingDrainage: 'services-plumbing-drainage.html',
        serviceFireFighting: 'services-fire-fighting.html',
        serviceFireAlarm: 'services-fire-alarm.html',
        serviceLowCurrentElv: 'services-low-current-elv.html',
        serviceShopDrawings: 'services-shop-drawings.html',
        serviceMaintenance: 'services-maintenance.html',
        approach: 'approach.html',
        projects: 'projects.html',
        blogs: 'blogs.html',
        blogPlumbing: 'blogs-bathroom-kitchen-plumbing-installation.html',
        blogCeilingElectrical: 'blogs-ceiling-electrical-installation.html',
        blogCentralHeating: 'blogs-central-heating-systems.html',
        blogElectricalLoads: 'blogs-electrical-load-distribution-boards.html',
        blogFireAlarm: 'blogs-fire-alarm-system-design-installation.html',
        blogVrf: 'blogs-vrf-air-conditioning-systems.html',
        blogAcPiping: 'blogs-air-conditioning-piping-before-plastering.html',
        blogElectricalInfrastructure: 'blogs-electrical-infrastructure-works.html',
        admin: 'admin.html',
      },
    },
  },
};

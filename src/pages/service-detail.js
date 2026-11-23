import '../styles.css';
import { servicePages } from '../data/service-pages.js';
import { imageDimensionAttributes } from '../data/image-dimensions.js';
import { arrow, headerMarkup, footerMarkup, whatsappButtonMarkup, stickyWhatsAppMarkup, contactFormMarkup, initSiteShell } from '../components/site-shell.js';

const slug = window.location.pathname.split('/').filter(Boolean).at(-1);
const service = servicePages.find(item => item.slug === slug) || servicePages[0];
const otherServices = servicePages.filter(item => item.slug !== service.slug);
const appRoot = document.querySelector('#app');
appRoot.innerHTML = `
  ${headerMarkup('services')}
  <main class="service-detail-page">
    <section class="service-detail-hero">
      <div class="service-detail-heading"><nav class="page-breadcrumbs" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li><a href="/services">Services</a></li><li aria-current="page">${service.title}</li></ol></nav><p class="eyebrow"><span class="eyebrow-line"></span>ULTRA · MEP SERVICES</p><h1>${service.title}</h1><p>${service.summary}</p></div>
      <img class="service-detail-image" src="${service.image}" alt="${service.title} for building projects" ${imageDimensionAttributes(service.image)} fetchpriority="high" onerror="this.style.display='none'">
    </section>
    <section class="service-detail-layout section-pad">
      <article class="service-detail-content"><p class="eyebrow"><span class="eyebrow-line"></span>OUR SCOPE</p><h2>Planned for your project.<br><em>Coordinated for delivery.</em></h2><p>${service.description}</p><h3>What this service can include</h3><ul>${service.scope.map(item => `<li>${item}</li>`).join('')}</ul></article>
      <aside class="other-services"><p class="eyebrow"><span class="eyebrow-line"></span>OTHER SERVICES</p><h2>Explore our services</h2><nav aria-label="Other services">${otherServices.map(item => `<a href="/services/${item.slug}">${item.title}${arrow}</a>`).join('')}</nav></aside>
    </section>
    <section class="portfolio-contact section-pad"><div class="portfolio-contact-layout"><div class="portfolio-contact-copy"><p class="eyebrow"><span class="eyebrow-line"></span>HAVE A PROJECT IN MIND?</p><h2>Start Your Project<br><em>with Ultra.</em></h2><p class="contact-intro">Tell us a little about what you need and our team will get back to you.</p></div>${contactFormMarkup()}</div></section>
  </main>
  ${stickyWhatsAppMarkup()}
  ${footerMarkup('services')}
`;
appRoot.classList.remove('is-prerendered');
initSiteShell();

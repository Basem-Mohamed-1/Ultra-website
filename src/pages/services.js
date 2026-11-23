import '../styles.css';
import { servicePages } from '../data/service-pages.js';
import { imageSlots } from '../data/site.js';
import { imageDimensionAttributes } from '../data/image-dimensions.js';
import { arrow, headerMarkup, footerMarkup, whatsappButtonMarkup, stickyWhatsAppMarkup, contactFormMarkup, initSiteShell } from '../components/site-shell.js';

const cards = servicePages.map((service, index) => `
  <article class="service-card image-slot reveal">
    <img src="${service.image}" alt="${service.title}" ${imageDimensionAttributes(service.image)} loading="lazy" onerror="this.style.display='none'">
    <div class="service-card-wash"></div>
    <div class="service-card-copy">
      <span class="service-number">${String(index + 1).padStart(2, '0')} / MEP SERVICES</span>
      <h3>${service.title}</h3>
      <p>${service.summary}</p>
      <a class="service-card-arrow" href="/services/${service.slug}" aria-label="View ${service.title}">${arrow}</a>
    </div>
  </article>`).join('');

const appRoot = document.querySelector('#app');
appRoot.innerHTML = `
  ${headerMarkup('services')}
  <main class="services-page">
    <section class="service-page-hero">
      <div class="service-page-hero-image image-slot"><img src="${imageSlots.servicesHero}" alt="" ${imageDimensionAttributes(imageSlots.servicesHero)} fetchpriority="high" onerror="this.style.display='none'"><div class="service-page-hero-shade"></div></div>
      <div class="service-page-hero-copy"><p class="eyebrow"><span class="eyebrow-line"></span>WHAT WE DO</p><h1>Building systems<br>that work <em>together.</em></h1><p>Integrated MEP expertise for safer, more comfortable, better-performing spaces.</p></div>
      <div class="page-hero-actions"><a class="service-page-hero-link" href="#service-disciplines">Explore our services ${arrow}</a>${whatsappButtonMarkup('Contact us on WhatsApp')}</div>
    </section>
    <section class="service-disciplines section-pad" id="service-disciplines">
      <div class="section-kicker"><span>OUR SERVICES</span><span>MECHANICAL · ELECTRICAL · FIRE · ELV</span></div>
      <div class="service-disciplines-heading"><h2>Expertise for every<br><em>essential system.</em></h2><p>Select a service to see its scope and how it supports your project.</p></div>
      <div class="service-discipline-grid">${cards}</div>
    </section>
    <section class="portfolio-contact section-pad"><div class="portfolio-contact-layout"><div class="portfolio-contact-copy"><p class="eyebrow"><span class="eyebrow-line"></span>HAVE A PROJECT IN MIND?</p><h2>Start Your Project<br><em>with Ultra.</em></h2><p class="contact-intro">Tell us a little about what you need and our team will get back to you.</p></div>${contactFormMarkup()}</div></section>
  </main>
  ${stickyWhatsAppMarkup()}
  ${footerMarkup('services')}
`;
appRoot.classList.remove('is-prerendered');

initSiteShell();
const reveal = new IntersectionObserver(entries => entries.forEach(entry => {
  if (!entry.isIntersecting) return;
  entry.target.classList.add('is-visible');
  reveal.unobserve(entry.target);
}), { threshold: 0.1 });
document.querySelectorAll('.service-disciplines .section-kicker, .service-disciplines-heading, .service-discipline-grid .service-card').forEach((item, index) => {
  item.style.setProperty('--reveal-delay', `${(index % 3) * 100}ms`);
  reveal.observe(item);
});

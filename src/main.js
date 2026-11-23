import './styles.css';
import { slides, services, imageSlots } from './data/site.js';
import { projects } from './data/projects.js';
import { imageDimensionAttributes, imageDimensions } from './data/image-dimensions.js';
import { arrow, headerMarkup, footerMarkup, whatsappButtonMarkup, stickyWhatsAppMarkup, contactFormMarkup, initSiteShell } from './components/site-shell.js';
const projectCards = () => projects.map((p, i) => `<article class="project-card" style="--project-delay:${i * 90}ms"><div class="project-image image-slot"><img class="project-lazy-image" src="${p.image}" alt="${p.imageAlt}" ${imageDimensionAttributes(p.image)} loading="lazy" onload="this.classList.add('is-loaded')" onerror="this.style.display='none'"><span class="project-index">${String(i + 1).padStart(2, '0')}</span><span class="image-slot-label">PROJECT PHOTO ${String(i + 1).padStart(2, '0')}</span><span class="project-open" aria-hidden="true">${arrow}</span></div><h3>${p.name}</h3><p>${p.type}</p></article>`).join('');

document.querySelector('#app').innerHTML = `
  ${headerMarkup('home')}
  <main>
    <section class="hero" id="home" aria-roledescription="carousel" aria-label="Ultra introduction">
      <div class="hero-media"><img src="${slides[0].image}" alt="${slides[0].alt}" ${imageDimensionAttributes(slides[0].image)} fetchpriority="high" onerror="this.style.display='none'" /></div><div class="hero-shade"></div>
      <div class="hero-content">
        <p class="eyebrow"><span class="eyebrow-line"></span><span class="slide-eyebrow"></span></p>
        <h1 class="slide-title"></h1>
        <div class="hero-bottom-row"><p class="hero-copy slide-copy"></p><div class="hero-actions"><a class="button button-light" href="#projects">Explore our work ${arrow}</a>${whatsappButtonMarkup('Chat on WhatsApp')}</div></div>
      </div>
      <div class="hero-footer"><span class="hero-note">MEP ENGINEERING · EGYPT</span>
        <div class="carousel-controls"><button class="slide-prev" aria-label="Previous slide">←</button><div class="slide-dots" role="tablist" aria-label="Choose hero slide"></div><button class="slide-next" aria-label="Next slide">→</button></div>
        <span class="slide-count"><b>01</b><i>/</i>03</span>
      </div>
      <div class="hero-index">M</div>
    </section>

    <section class="intro section-pad" id="about">
      <div class="section-kicker"><span>01 / WHO WE ARE</span><span>ENGINEERED AROUND PEOPLE</span></div>
      <div class="intro-card image-slot reveal"><img src="${imageSlots.intro}" alt="" ${imageDimensionAttributes(imageSlots.intro)} loading="lazy" onerror="this.style.display='none'"><div class="intro-card-shade"></div><div class="intro-grid"><h2>One Team. One Vision.<br><em>Seamless Engineering.</em></h2><div class="intro-text"><p>Ultra is an MEP construction and engineering company delivering the essential systems that make spaces comfortable, safe, and ready for what’s next.</p><a class="text-link" href="/about">Get to know us ${arrow}</a></div></div><span class="image-slot-label">INTRO IMAGE · construction-site-engineer.webp</span></div>
    </section>

    <section class="stats-section section-pad"><div class="stats"><div class="stat" data-value="18" data-suffix="+" aria-label="18 plus years of experience"><strong><span class="stat-value" data-target="18" data-digits="2"></span><span class="stat-suffix">+</span></strong><small>YEARS OF EXPERIENCE</small></div><div class="stat" data-value="120" data-suffix="+" aria-label="120 plus projects delivered"><strong><span class="stat-value" data-target="120" data-digits="3"></span><span class="stat-suffix">+</span></strong><small>PROJECTS DELIVERED</small></div><div class="stat" data-value="4" data-suffix="" aria-label="4 core MEP disciplines"><strong><span class="stat-value" data-target="4" data-digits="2"></span></strong><small>CORE MEP DISCIPLINES</small></div><div class="stat" data-value="1" data-suffix="" aria-label="1 connected team"><strong><span class="stat-value" data-target="1" data-digits="2"></span></strong><small>CONNECTED TEAM</small></div></div>
    </section>

    <section class="services section-pad" id="services"><div class="section-kicker"><span>02 / WHAT WE DO</span><span>ONE CONNECTED APPROACH</span></div><div class="services-head"><h2>Integrated Services.<br><em>Unified Project Delivery.</em></h2><p>From the first drawing to the final switch-on, every detail is considered, coordinated, and cared for.</p></div>
      <div class="service-grid">${services.map(s => `<article class="service-card image-slot"><img src="${s.image}" alt="" ${imageDimensionAttributes(s.image)} loading="lazy" onerror="this.style.display='none'"><div class="service-card-wash"></div><div class="service-card-copy"><span class="service-number">${s.number} / MEP SERVICES</span><h3>${s.title}</h3><p>${s.copy}</p><span class="service-card-arrow" aria-hidden="true">${arrow}</span></div><span class="image-slot-label">SERVICE IMAGE · ${s.image.split('/').pop()}</span></article>`).join('')}</div>
    </section>

    <section class="feature" id="approach"><div class="feature-image image-slot"><img src="${imageSlots.feature}" alt="" ${imageDimensionAttributes(imageSlots.feature)} loading="lazy" onerror="this.style.display='none'"/><span class="image-slot-label">APPROACH IMAGE · technician-installing-mechanical-system.webp</span></div><div class="feature-copy"><div class="section-kicker"><span>03 / HOW WE WORK</span><span>BUILT ON CLARITY</span></div><p class="eyebrow"><span class="eyebrow-line"></span>OUR APPROACH</p><h2>Quality That Speaks<br><em>Through Every Detail.</em></h2><p class="feature-body">We uphold the highest standards of quality across every stage of our work, ensuring precision, consistency, and excellence in every detail.</p><a class="text-link" href="#contact">Work with our team ${arrow}</a></div></section>

    <section class="clients section-pad" id="clients" hidden><div class="section-kicker"><span>CLIENTS & PARTNERS</span><span>LOGOS TO BE ADDED</span></div><div class="client-grid">${imageSlots.clients.map((src,i) => `<div class="client-image image-slot"><img src="${src}" alt="" loading="lazy" onerror="this.style.display='none'"/><span class="image-slot-label">CLIENT LOGO 0${i+1}</span></div>`).join('')}</div></section>

    <section class="projects section-pad" id="projects"><div class="section-kicker"><span>04 / SELECTED WORK</span><span>MADE TO MOVE LIFE FORWARD</span></div><div class="projects-heading"><h2>A Diverse Portfolio.<br><em>A Proven Ability to Deliver</em></h2><a class="text-link" href="/projects">View all projects ${arrow}</a></div><div class="project-carousel" role="region" aria-label="Selected projects" tabindex="0"><div class="project-track"><div class="project-track-group">${projectCards()}</div><div class="project-track-group" aria-hidden="true">${projectCards()}</div></div></div></section>

    <section class="contact section-pad" id="contact"><div class="section-kicker"><span>05 / START A CONVERSATION</span><span>CAIRO · EGYPT</span></div><div class="contact-layout"><div class="contact-inner"><p class="eyebrow"><span class="eyebrow-line"></span>HAVE A PROJECT IN MIND?</p><h2>Start Your Project<br><em>with Ultra.</em></h2><p class="contact-intro">Tell us a little about what you need and our team will get back to you.</p></div>${contactFormMarkup()}</div><div class="contact-orbit" aria-hidden="true"></div></section>
  </main>
  ${stickyWhatsAppMarkup()}
  ${footerMarkup('home')}
`;

initSiteShell();

if (window.location.pathname.replace(/\/+$/, '') === '/contact') {
  window.requestAnimationFrame(() => document.querySelector('#contact')?.scrollIntoView({ block: 'start' }));
}

let active = 0;
let timer;
const title = document.querySelector('.slide-title');
const media = document.querySelector('.hero-media');
const dots = document.querySelector('.slide-dots');
dots.innerHTML = slides.map((_, i) => `<button role="tab" aria-label="Slide ${i + 1}" aria-selected="false"></button>`).join('');
const dotButtons = [...dots.querySelectorAll('button')];
function showSlide(index, animate = true) {
  active = (index + slides.length) % slides.length;
  const slide = slides[active];
  const hero = document.querySelector('.hero');
  if (animate) hero.classList.add('is-changing');
  window.setTimeout(() => {
    title.innerHTML = slide.title.split('\n').map(line => window.ultraTranslate?.(line) || line).join('<br>');
    const slideImage = media.querySelector('img');
    slideImage.src = slide.image;
    slideImage.alt = slide.alt;
    const dimensions = imageDimensions(slide.image);
    if (dimensions) {
      slideImage.width = dimensions.width;
      slideImage.height = dimensions.height;
    }
    document.querySelector('.slide-eyebrow').textContent = window.ultraTranslate?.(slide.eyebrow) || slide.eyebrow;
    document.querySelector('.slide-copy').textContent = window.ultraTranslate?.(slide.description) || slide.description;
    document.querySelector('.slide-count b').textContent = slide.number;
    dotButtons.forEach((dot, i) => { dot.setAttribute('aria-selected', String(i === active)); dot.classList.toggle('active', i === active); });
    hero.classList.remove('is-changing');
  }, animate ? 240 : 0);
}
function restartTimer() { clearInterval(timer); timer = setInterval(() => showSlide(active + 1), 6500); }
showSlide(0, false); restartTimer();
document.querySelector('.slide-prev').addEventListener('click', () => { showSlide(active - 1); restartTimer(); });
document.querySelector('.slide-next').addEventListener('click', () => { showSlide(active + 1); restartTimer(); });
dotButtons.forEach((dot, i) => dot.addEventListener('click', () => { showSlide(i); restartTimer(); }));

const projectCarousel = document.querySelector('.project-carousel');
const projectTrack = document.querySelector('.project-track');
const projectTrackGroup = projectTrack.querySelector('.project-track-group');
const setProjectLoopDistance = () => {
  projectTrack.style.setProperty('--project-loop-offset', `-${projectTrackGroup.getBoundingClientRect().width}px`);
};
setProjectLoopDistance();
new ResizeObserver(setProjectLoopDistance).observe(projectTrackGroup);
let projectDrag = null;
projectCarousel.addEventListener('pointerdown', event => {
  if (event.pointerType === 'mouse' && event.button !== 0) return;
  projectDrag = { pointerId: event.pointerId, startX: event.clientX, startScrollLeft: projectCarousel.scrollLeft, distance: 0 };
  projectTrack.style.animationPlayState = 'paused';
  projectCarousel.classList.add('is-dragging');
  projectCarousel.setPointerCapture(event.pointerId);
});
projectCarousel.addEventListener('pointermove', event => {
  if (!projectDrag || projectDrag.pointerId !== event.pointerId) return;
  const delta = event.clientX - projectDrag.startX;
  projectDrag.distance = Math.max(projectDrag.distance, Math.abs(delta));
  if (projectDrag.distance > 4) projectCarousel.scrollLeft = projectDrag.startScrollLeft - delta;
});
function finishProjectDrag() {
  if (!projectDrag) return;
  projectTrack.style.animationPlayState = '';
  projectCarousel.classList.remove('is-hovering');
  projectCarousel.classList.remove('is-dragging');
  projectDrag = null;
}
projectCarousel.addEventListener('pointerup', event => {
  if (projectDrag && projectDrag.pointerId === event.pointerId) finishProjectDrag();
});
projectCarousel.addEventListener('pointercancel', finishProjectDrag);
projectCarousel.addEventListener('lostpointercapture', finishProjectDrag);
projectCarousel.addEventListener('wheel', event => {
  const horizontalDelta = event.deltaX || (event.shiftKey ? event.deltaY : 0);
  if (!horizontalDelta) return;
  event.preventDefault();
  projectCarousel.classList.remove('is-hovering');
  projectTrack.style.animationPlayState = '';
  projectCarousel.scrollLeft += horizontalDelta;
}, { passive: false });
projectCarousel.addEventListener('pointerenter', () => projectCarousel.classList.add('is-hovering'));
projectCarousel.addEventListener('pointerleave', () => {
  projectCarousel.classList.remove('is-hovering');
  if (!projectDrag) projectTrack.style.animationPlayState = '';
});

let statsCounted = false;
function countStats() {
  if (statsCounted) return;
  statsCounted = true;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stats = [...document.querySelectorAll('.stats .stat')];
  const digitStrip = '0123456789'.repeat(3);
  stats.forEach((stat, statIndex) => {
    const value = stat.querySelector('.stat-value');
    const target = value.dataset.target.padStart(Number(value.dataset.digits), '0');
    value.setAttribute('aria-hidden', 'true');
    value.innerHTML = [...target].map((digit, digitIndex) => {
      const landingIndex = 10 + Number(digit);
      const delay = statIndex * 120 + digitIndex * 70;
      return `<span class="odometer-digit" style="--roll-index:${landingIndex};--roll-delay:${delay}ms"><span class="odometer-strip">${[...digitStrip].map(number => `<span>${number}</span>`).join('')}</span></span>`;
    }).join('');
    if (reducedMotion) stat.classList.add('is-counted');
    else requestAnimationFrame(() => stat.classList.add('is-counted'));
  });
}

const reveal = new IntersectionObserver(entries => entries.forEach(entry => {
  if (!entry.isIntersecting) return;
  entry.target.classList.add('is-visible');
  reveal.unobserve(entry.target);
}), { threshold: 0.08, rootMargin: '0px 0px -5% 0px' });

document.querySelectorAll('.intro, .services, .feature, .clients, .projects, .contact, .section-kicker, .intro-card, .intro-grid, .service-card, .feature-copy > *, .projects-heading, .contact-inner')
  .forEach(el => {
    if (el.closest('[aria-hidden="true"]')) return;
    el.classList.add(el.matches('section') ? 'section-reveal' : 'reveal');
    reveal.observe(el);
  });

const statsObserver = new IntersectionObserver(entries => {
  if (entries.some(entry => entry.isIntersecting)) {
    countStats();
    statsObserver.disconnect();
  }
}, { threshold: 0.45, rootMargin: '0px 0px -18% 0px' });
statsObserver.observe(document.querySelector('.stats-section'));

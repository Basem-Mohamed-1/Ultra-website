import '../styles.css';
import { blogs, blogTranslations } from '../data/blogs.js';
import { servicePages } from '../data/service-pages.js';
import { imageDimensionAttributes } from '../data/image-dimensions.js';
import { arrow, headerMarkup, footerMarkup, stickyWhatsAppMarkup, initSiteShell } from '../components/site-shell.js';

const appRoot = document.querySelector('#app');
const slug = window.location.pathname.split('/').filter(Boolean).at(-1);
const article = blogs.find(item => item.slug === slug);
const blogCard = item => `<article class="blog-card"><a class="blog-card-image" href="/blogs/${item.slug}"><img src="${item.image}" alt="${item.imageAlt}" ${imageDimensionAttributes(item.image)} loading="lazy"><span class="blog-card-arrow" aria-hidden="true">${arrow}</span></a><div class="blog-card-copy"><time datetime="${new Date(item.date).toISOString().slice(0, 10)}">${item.date}</time><h2><a href="/blogs/${item.slug}">${item.title}</a></h2><p>${item.excerpt}</p><a class="blog-read-link" href="/blogs/${item.slug}">READ ARTICLE ${arrow}</a></div></article>`;

if (!article) {
  document.title = 'Blogs | Ultra';
  document.querySelector('meta[name="description"]')?.setAttribute('content', 'Practical MEP guidance for project teams, from planning and coordination through installation and handover.');
  appRoot.innerHTML = `
    ${headerMarkup('blogs')}
    <main class="blogs-page">
      <section class="blogs-intro section-pad"><p class="eyebrow"><span class="eyebrow-line"></span>ULTRA · MEP ENGINEERING</p><h1>Blogs</h1><p>Practical MEP guidance for project teams, from planning and coordination through installation and handover.</p></section>
      <section class="blog-list section-pad" aria-label="Articles"><div class="blog-grid">${blogs.map(blogCard).join('')}</div></section>
    </main>
    ${stickyWhatsAppMarkup()}${footerMarkup('blogs')}`;
} else {
  document.title = `${article.title} | Ultra`;
  document.querySelector('meta[name="description"]')?.setAttribute('content', article.excerpt);
  const otherBlogs = blogs.filter(item => item.slug !== article.slug);
  const relatedServices = servicePages.filter(service => article.relatedServices.includes(service.slug));
  appRoot.innerHTML = `
    ${headerMarkup('blogs')}
    <main class="blog-article-page">
      <header class="blog-article-heading section-pad"><nav class="page-breadcrumbs" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li><a href="/blogs">Blogs</a></li><li aria-current="page">${article.title}</li></ol></nav><p class="eyebrow"><span class="eyebrow-line"></span>ULTRA · FIELD NOTES</p><time datetime="${new Date(article.date).toISOString().slice(0, 10)}">${article.date}</time><h1>${article.title}</h1><p class="blog-article-lead">${article.excerpt}</p></header>
      <div class="blog-article-layout section-pad">
        <article class="blog-article-content"><figure class="blog-article-image"><img src="${article.image}" alt="${article.imageAlt}" ${imageDimensionAttributes(article.image)} fetchpriority="high"></figure><div class="blog-article-body">${article.sections.map(section => `<section><h2>${section.heading}</h2><p>${section.text}</p></section>`).join('')}<section class="blog-related-services"><h2>Related services</h2><nav aria-label="Related services">${relatedServices.map(service => `<a href="/services/${service.slug}">${service.title}${arrow}</a>`).join('')}</nav></section><p class="blog-technical-note"><strong>Technical note</strong> — The guidance in this article is general. Project requirements, approved drawings, specifications, applicable codes, and manufacturer instructions govern the final design and installation.</p><a class="blog-contact-link" href="/contact">Talk to our team ${arrow}</a></div></article>
        <aside class="other-blogs"><p class="eyebrow"><span class="eyebrow-line"></span>ULTRA · BLOGS</p><h2>Other articles</h2><p class="other-blogs-intro">Explore more MEP guidance.</p><nav aria-label="Other articles">${otherBlogs.map(item => `<a href="/blogs/${item.slug}"><span><time>${item.date}</time><strong>${item.title}</strong></span>${arrow}</a>`).join('')}</nav></aside>
      </div>
    </main>
    ${stickyWhatsAppMarkup()}${footerMarkup('blogs')}`;
}

appRoot.classList.remove('is-prerendered');
initSiteShell(blogTranslations);

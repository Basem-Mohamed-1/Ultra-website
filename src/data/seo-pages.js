import { blogs } from './blogs.js';
import { servicePages } from './service-pages.js';

const homeCrumb = { name: 'Home', path: '/' };
const breadcrumbs = (items) => [homeCrumb, ...items];

const basePages = {
  'index.html': {
    path: '/',
    title: 'MEP Engineering & Contracting in Egypt | Ultra',
    description: 'Ultra delivers coordinated mechanical, electrical, and plumbing systems for building projects in Egypt, from engineering and installation to testing and handover.',
    eyebrow: 'Integrated MEP · Egypt',
    heading: 'Engineering Systems That Power Every Building.',
    introduction: 'Integrated mechanical, electrical, and plumbing delivery for dependable building performance.',
    image: '/images/home-hero-ultra-site-engineer.webp',
    imageAlt: 'Engineer installing building services on site',
    breadcrumbs: [homeCrumb],
    sections: [
      { heading: 'One Team. One Vision. Seamless Engineering.', text: 'Ultra delivers mechanical, electrical, and plumbing systems that support comfortable, safe, dependable buildings.', links: [['About Ultra', '/about']] },
      { heading: 'Integrated Services. Unified Project Delivery.', text: 'Explore HVAC, electrical power, plumbing and drainage, fire systems, ELV, shop drawings, and maintenance.', links: [['MEP services', '/services']] },
      { heading: 'Quality That Speaks Through Every Detail.', text: 'Our approach connects planning, coordination, installation, testing, and handover across project stages.', links: [['Our approach', '/approach']] },
      { heading: 'A Diverse Portfolio. A Proven Ability to Deliver', text: 'Browse Ultra’s project portfolio and discuss the requirements of your next project.', links: [['View projects', '/projects']] },
      { heading: 'Start Your Project with Ultra.', text: 'Tell us what your project needs and our team will get back to you.', links: [['Contact Ultra', '/contact']] },
    ],
  },
  'about.html': {
    path: '/about',
    title: 'About Ultra | MEP Engineering & Construction',
    description: 'Meet Ultra, an MEP engineering and construction company in Egypt delivering mechanical, electrical, and plumbing systems from coordination through handover.',
    eyebrow: 'Who we are',
    heading: 'Your Partner in Engineering and Construction',
    introduction: 'Ultra brings mechanical, electrical, and plumbing expertise together for coordinated building projects.',
    breadcrumbs: breadcrumbs([{ name: 'About', path: '/about' }]),
    sections: [
      { heading: 'Good work happens when we work together.', text: 'Our people coordinate engineering and construction work across project stages.' },
      { heading: 'Our founders.', text: 'Learn about the people behind Ultra’s engineering and construction work.' },
      { heading: 'Start Your Project with Ultra.', text: 'Tell us what your project needs and our team will get back to you.', links: [['Contact Ultra', '/contact']] },
    ],
  },
  'services.html': {
    path: '/services',
    title: 'MEP Services in Egypt | Ultra Engineering',
    description: 'Explore Ultra’s MEP services in Egypt, including HVAC, electrical power, plumbing and drainage, fire systems, low current, shop drawings, and maintenance.',
    eyebrow: 'What we do',
    heading: 'Building systems that work together.',
    introduction: 'Integrated MEP engineering and construction services for building projects.',
    breadcrumbs: breadcrumbs([{ name: 'Services', path: '/services' }]),
    sections: servicePages.map(service => ({ heading: service.title, text: service.summary, links: [[`Explore ${service.title}`, `/services/${service.slug}`]] })),
  },
  'projects.html': {
    path: '/projects',
    title: 'MEP Projects | Ultra Engineering & Construction',
    description: 'Explore Ultra’s MEP project portfolio, including coordinated mechanical, electrical, and plumbing systems for building projects.',
    eyebrow: 'Ultra · Selected work',
    heading: 'Projects built to work better.',
    introduction: 'Explore project imagery and the building systems associated with Ultra’s MEP work.',
    robots: 'noindex,follow',
    breadcrumbs: breadcrumbs([{ name: 'Projects', path: '/projects' }]),
    sections: [
      { heading: 'Selected MEP work.', text: 'Project names, types, and locations on this page are temporary placeholders. Replace them with verified project details before making this portfolio indexable.' },
      { heading: 'Have a project in mind?', text: 'Tell us what your project needs and our team will get back to you.', links: [['Contact Ultra', '/contact']] },
    ],
  },
  'approach.html': {
    path: '/approach',
    title: 'MEP Project Delivery Approach | Ultra',
    description: 'See how Ultra coordinates MEP planning, engineering, project management, installation, testing, commissioning, and maintenance.',
    eyebrow: 'How we work',
    heading: 'One clear process. Better built outcomes.',
    introduction: 'A coordinated approach connects each stage of MEP project delivery.',
    breadcrumbs: breadcrumbs([{ name: 'Approach', path: '/approach' }]),
    sections: [
      { heading: 'Planning and installation', text: 'Coordinate work with project requirements, drawings, and site conditions.' },
      { heading: 'Engineering and project management', text: 'Connect technical coordination with delivery planning and site execution.' },
      { heading: 'Testing, commissioning, and handover', text: 'Verify installed systems and prepare clear project handover information.' },
      { heading: 'Operation and maintenance', text: 'Plan service activities around the facility, equipment, and operating priorities.' },
      { heading: 'Explore our services', text: 'See the MEP services that support each project stage.', links: [['Our services', '/services']] },
    ],
  },
  'blogs.html': {
    path: '/blogs',
    title: 'MEP Engineering Blog | Ultra Egypt',
    description: 'Practical MEP articles on HVAC, electrical installation, plumbing, fire alarm systems, coordination, and building services in Egypt.',
    eyebrow: 'Ultra · MEP Engineering',
    heading: 'MEP Engineering Articles and Guides',
    introduction: 'Practical MEP guidance for project teams, from planning and coordination through installation and handover.',
    breadcrumbs: breadcrumbs([{ name: 'Blogs', path: '/blogs' }]),
    sections: blogs.map(blog => ({ heading: blog.title, text: blog.excerpt, links: [['Read article', `/blogs/${blog.slug}`]] })),
  },
};

const serviceTitleTags = {
  hvac: 'HVAC Installation & Systems | Ultra',
  'electrical-power': 'Electrical Power & Distribution | Ultra',
  'plumbing-drainage': 'Plumbing & Drainage Services | Ultra',
  'fire-fighting': 'Fire Fighting Systems | Ultra',
  'fire-alarm': 'Fire Alarm Systems | Ultra',
  'low-current-elv': 'Low Current & ELV Systems | Ultra',
  'shop-drawings': 'MEP Shop Drawings | Ultra',
  maintenance: 'MEP Maintenance Services | Ultra',
};

const servicePagesForSeo = Object.fromEntries(servicePages.map(service => {
  const details = [
    { heading: service.title, text: service.description },
    { heading: 'Service scope', text: 'Project scope is confirmed against approved drawings, specifications, coordination requirements, and handover needs.', items: service.scope },
  ];
  if (service.slug === 'hvac') details.push({ heading: 'Related service', text: 'Explore coordinated MEP shop drawings for installation planning.', links: [['Shop drawings', '/services/shop-drawings']] });
  if (service.slug === 'shop-drawings') details.push({ heading: 'Related services', text: 'Shop drawings coordinate with the systems being installed across the project.', links: [['HVAC systems', '/services/hvac'], ['Electrical power', '/services/electrical-power'], ['Plumbing and drainage', '/services/plumbing-drainage']] });

  return [`services-${service.slug}.html`, {
    path: `/services/${service.slug}`,
    title: serviceTitleTags[service.slug],
    description: service.summary,
    eyebrow: 'Ultra · MEP Services',
    heading: service.title,
    introduction: service.summary,
    image: service.image,
    imageAlt: `${service.title} for building projects`,
    breadcrumbs: breadcrumbs([{ name: 'Services', path: '/services' }, { name: service.title, path: `/services/${service.slug}` }]),
    schemaType: 'Service',
    serviceType: service.title,
    sections: details,
  }];
}));

const blogTitleTags = {
  'bathroom-kitchen-plumbing-installation': 'Bathroom & Kitchen Plumbing Installation | Ultra',
  'ceiling-electrical-installation': 'Ceiling Electrical Installation | Ultra',
  'central-heating-systems': 'Central Heating Systems Guide | Ultra',
  'electrical-load-distribution-boards': 'Electrical Loads & Distribution Boards | Ultra',
  'fire-alarm-system-design-installation': 'Fire Alarm Design & Installation | Ultra',
  'vrf-air-conditioning-systems': 'VRF Air Conditioning Systems Guide | Ultra',
  'air-conditioning-piping-before-plastering': 'AC Piping Before Plastering Checklist | Ultra',
  'electrical-infrastructure-works': 'Electrical Infrastructure Works | Ultra',
};

const blogPagesForSeo = Object.fromEntries(blogs.map(blog => {
  const relatedServices = servicePages.filter(service => blog.relatedServices.includes(service.slug));
  const sections = blog.sections.map(section => ({ heading: section.heading, text: section.text }));
  if (relatedServices.length) sections.push({ heading: 'Related services', text: 'Explore related Ultra MEP services for this topic.', links: relatedServices.map(service => [service.title, `/services/${service.slug}`]) });
  return [`blogs-${blog.slug}.html`, {
  path: `/blogs/${blog.slug}`,
  title: blogTitleTags[blog.slug],
  description: blog.excerpt,
  eyebrow: 'Ultra · MEP Field Notes',
  heading: blog.title,
  introduction: blog.excerpt,
  image: blog.image,
  imageAlt: blog.imageAlt,
  breadcrumbs: breadcrumbs([{ name: 'Blogs', path: '/blogs' }, { name: blog.title, path: `/blogs/${blog.slug}` }]),
  schemaType: 'BlogPosting',
  datePublished: new Date(blog.date).toISOString(),
  sections,
}];
}));

export const seoPages = { ...basePages, ...servicePagesForSeo, ...blogPagesForSeo };

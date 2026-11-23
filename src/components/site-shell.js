import { whatsappNumber, socialLinks } from '../data/site.js';
import { servicePages } from '../data/service-pages.js';
import { blogs, blogTranslations } from '../data/blogs.js';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons/faWhatsapp';

export const arrow = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12h15M13 5l7 7-7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const [whatsappWidth, whatsappHeight, , , whatsappPathData] = faWhatsapp.icon;
const whatsappPaths = (Array.isArray(whatsappPathData) ? whatsappPathData : [whatsappPathData])
  .map(path => `<path fill="currentColor" d="${path}"/>`).join('');
const whatsappIcon = `<svg class="whatsapp-brand-icon" viewBox="0 0 ${whatsappWidth} ${whatsappHeight}" aria-hidden="true" focusable="false">${whatsappPaths}</svg>`;

export function contactFormMarkup() {
  return `<form id="contact-form" class="contact-form" data-contact-form>
    <div class="contact-form-fields">
      <label>Full name<input name="fullName" type="text" autocomplete="name" maxlength="100" required></label>
      <label>Phone number<input name="phoneNumber" type="tel" autocomplete="tel" maxlength="30" pattern="[+()0-9.\\s-]{7,30}" required></label>
      <label>Email address<input name="email" type="email" autocomplete="email" maxlength="254" required></label>
      <label>Service required<select name="serviceRequired" required><option value="" disabled selected>Select a service</option><option>Project Execution</option><option>Project design</option><option>Design and execution</option></select></label>
    </div>
    <div class="contact-form-submit"><p class="contact-form-status" data-contact-status role="status" aria-live="polite"></p><button class="button button-light" type="submit">Send request ${arrow}</button></div>
  </form>`;
}

const logo = '<img class="brand-logo" src="/images/ultra-logo.svg" alt="Ultra MEP Engineering">';

export function headerMarkup(page = 'home') {
  const home = page === 'home' ? '' : '/';
  const contact = page === 'home' ? '#contact' : '#contact-form';
  return `<header class="site-header">
    <a class="brand" href="${home}#home" aria-label="Ultra home">${logo}</a>
    <button class="language-toggle" type="button" aria-label="Switch language" data-language-toggle>العربية</button>
    <button class="menu-toggle" aria-label="Open navigation" aria-expanded="false"><span></span><span></span></button>
    <nav class="main-nav" aria-label="Main navigation">
      <a href="${home}#home">Home</a><a href="/about"${page === 'about' ? ' aria-current="page"' : ''}>About</a><a href="/services"${page === 'services' ? ' aria-current="page"' : ''}>Services</a><a href="/projects"${page === 'projects' ? ' aria-current="page"' : ''}>Projects</a><a href="/blogs"${page === 'blogs' ? ' aria-current="page"' : ''}>Blogs</a><a href="/approach"${page === 'approach' ? ' aria-current="page"' : ''}>Approach</a>
      <a class="nav-contact" href="${contact}">Let's talk ${arrow}</a>
    </nav>
  </header>`;
}

export function footerMarkup(page = 'home') {
  const home = page === 'home' ? '' : '/';
  const contact = page === 'home' ? '#contact' : '/contact';
  const serviceLinks = servicePages.map(service => `<a href="/services/${service.slug}">${service.title}</a>`).join('');
  const blogLinks = blogs.map(blog => `<a href="/blogs/${blog.slug}">${blog.title}</a>`).join('');
  return `<footer class="footer">
    <div class="footer-top">
      <div class="footer-brand-column">
        <a class="footer-brand" href="${home}#home" aria-label="Ultra home"><img src="/images/ultra-icon.svg" alt=""><span>ULTRA</span></a>
        <p>Ultra delivers mechanical, electrical, and plumbing systems that help buildings work safely, comfortably, and reliably.</p>
        <div class="footer-social"><span>FOLLOW US</span>
          <a href="${socialLinks.facebook}" target="_blank" rel="noopener noreferrer" aria-label="Ultra on Facebook"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 21v-8.2h2.8l.4-3.2h-3.2v-2c0-.9.3-1.6 1.6-1.6h1.7V3.1c-.3 0-1.4-.1-2.6-.1-2.6 0-4.4 1.6-4.4 4.5v2.1H7v3.2h2.8V21h3.7Z" fill="currentColor"/></svg></a>
          <a href="${socialLinks.instagram}" target="_blank" rel="noopener noreferrer" aria-label="Ultra on Instagram"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="17.7" cy="6.7" r="1" fill="currentColor"/></svg></a>
          <a href="https://wa.me/${whatsappNumber}" target="_blank" rel="noopener noreferrer" aria-label="Chat with Ultra on WhatsApp">${whatsappIcon}</a>
        </div>
      </div>
      <nav class="footer-menu footer-nav" aria-label="Explore Ultra">
        <h2>Explore</h2><a href="${home}#home">Home</a><a href="/about">About</a><a href="/services">Services</a><a href="/projects">Projects</a><a href="/blogs">Blogs</a><a href="/approach">Approach</a><a href="${contact}">Contact</a>
      </nav>
      <nav class="footer-menu footer-services" aria-label="Services"><h2>Services</h2>${serviceLinks}</nav>
      <nav class="footer-menu footer-blog-menu" aria-label="Blogs"><h2>Blogs</h2>${blogLinks}</nav>
    </div>
    <div class="footer-bottom"><span>© ${new Date().getFullYear()} Ultra. All rights reserved.</span><a href="#top" class="back-top">BACK TO TOP ↑</a></div>
  </footer>`;
}

export function whatsappButtonMarkup(label = 'Chat on WhatsApp') {
  return `<a class="button button-whatsapp" href="https://wa.me/${whatsappNumber}" target="_blank" rel="noopener noreferrer" aria-label="${label}">
    ${whatsappIcon}
    <span>${label}</span>
  </a>`;
}

export function stickyWhatsAppMarkup() {
  return `<a class="whatsapp-sticky" href="https://wa.me/${whatsappNumber}" target="_blank" rel="noopener noreferrer" aria-label="I want more information on WhatsApp">
    <span>I want more information</span>${whatsappIcon}
  </a>`;
}

export function initSiteShell(extraTranslations = {}) {
  const languageToggle = document.querySelector('[data-language-toggle]');
  const translations = {
    'Home':'الرئيسية','About':'من نحن','Services':'الخدمات','Projects':'المشروعات','Approach':'منهجيتنا',
    "Let's talk":"تواصل معنا",'Contact':'اتصل بنا','BACK TO TOP ↑':'العودة إلى الأعلى ↑',
    'Integrated MEP · Since 2006':'حلول متكاملة للأعمال الكهروميكانيكية','The systems behind':'الأنظمة التي تصنع','better spaces.':'مساحات أفضل.','Engineering with intent':'هندسة مدروسة','Built to perform.':'أداء موثوق.','Made to last.':'مصممة لتدوم.','A better built environment':'بيئة عمرانية أفضل','Precision in every':'دقة في كل','connection.':'تفصيلة.','Engineering comfort, performance, and reliability into every place people live and work.':'نصمم أنظمة توفر الراحة والكفاءة والاعتمادية في المباني التي نعيش ونعمل بها.',
    '01 / WHO WE ARE':'01 / من نحن','ENGINEERED AROUND PEOPLE':'هندسة تتمحور حول الناس','We make buildings ':'نجعل المباني ','work better.':'تعمل بكفاءة أفضل.','Get to know us':'تعرف علينا','02 / WHAT WE DO':'02 / ماذا نقدم','ONE CONNECTED APPROACH':'منهج متكامل','Good engineering.':'هندسة دقيقة.','Seamless delivery.':'تنفيذ متناسق.','03 / HOW WE WORK':'03 / كيف نعمل','BUILT ON CLARITY':'نعمل بوضوح','OUR APPROACH':'منهجيتنا','Complex systems.':'أنظمة معقدة.','Clear thinking.':'حلول واضحة.','04 / SELECTED WORK':'04 / مشروعات مختارة','MADE TO MOVE LIFE FORWARD':'لنبني ما يدفع الحياة إلى الأمام','Spaces we help':'مساحات نساهم في','bring to life.':'إنشائها.','View all projects':'عرض كل المشروعات','05 / START A CONVERSATION':'05 / لنبدأ حواراً','CAIRO · EGYPT':'القاهرة · مصر','HAVE A PROJECT IN MIND?':'هل لديكم مشروع؟',"Let's build":"لنبنِ", "what's next.":"ما هو قادم.",'Tell us a little about what you need and our team will get back to you.':'أخبرونا عن احتياجات مشروعكم وسيتواصل معكم فريقنا.','YEARS OF EXPERIENCE':'سنوات خبرة','PROJECTS DELIVERED':'مشروعات منفذة','CORE MEP DISCIPLINES':'تخصصات كهروميكانيكية','CONNECTED TEAM':'فريق متكامل',
    'WHAT WE DO':'ماذا نقدم','Building systems':'أنظمة مبانٍ','that work ':'تعمل ','together.':'بتكامل.','Explore our services':'اكتشف خدماتنا','OUR CORE SERVICES':'خدماتنا الأساسية','MECHANICAL · ELECTRICAL · PLUMBING':'ميكانيكا · كهرباء · سباكة','Expertise for every':'خبرة لكل','essential system.':'نظام أساسي.','Mechanical services':'الأعمال الميكانيكية','Electrical services':'الأعمال الكهربائية','Plumbing services':'أعمال السباكة','ULTRA · SELECTED WORK':'ألترا · مشروعات مختارة','Projects built':'مشروعات مصممة','to work better.':'لأداء أفضل.','OUR PROJECTS':'مشروعاتنا','Selected ':'أعمال ','work.':'مختارة.','How we work':'كيف نعمل','One clear process.':'منهج واضح.','Better built outcomes.':'ونتائج تنفيذ أفضل.','OUR DELIVERY PROCESS':'مراحل التنفيذ','PLANNING THROUGH OPERATION':'من التخطيط إلى التشغيل','Planning & Installation':'التخطيط والتركيب','Engineering':'الهندسة','Project Management':'إدارة المشروعات','Testing & Commissioning':'الاختبار والتشغيل التجريبي','Procurement & Inspection':'التوريد والفحص','Operation & Maintenance':'التشغيل والصيانة',
    'Full name':'الاسم بالكامل','Phone number':'رقم الهاتف','Email address':'البريد الإلكتروني','Service required':'الخدمة المطلوبة','Select a service':'اختر الخدمة','Project Execution':'تنفيذ المشروعات','Project design':'تصميم المشروعات','Design and execution':'التصميم والتنفيذ','Send request':'إرسال الطلب','FOLLOW US':'تابعونا','All rights reserved.':'جميع الحقوق محفوظة.',
    'Ultra is an MEP construction and engineering company delivering the essential systems that make spaces comfortable, safe, and ready for what’s next.':'ألترا شركة متخصصة في تنفيذ وهندسة أنظمة MEP التي تجعل المباني مريحة وآمنة وجاهزة للمستقبل.',
    'From the first drawing to the final switch-on, every detail is considered, coordinated, and cared for.':'من أول مخطط حتى التشغيل، ننسق كل تفصيلة ونتابعها بعناية.',
    'Great MEP work is felt in the comfort of a room and the confidence of a client. Our teams bring disciplines together early, solve challenges openly, and stay accountable through every stage.':'تظهر جودة أعمال MEP في راحة مستخدمي المبنى وثقة العميل. ننسق التخصصات مبكراً، ونعالج التحديات بوضوح، ونتابع التنفيذ في كل مرحلة.',
    'Ultra is an MEP construction and engineering company delivering the essential building systems that make places comfortable, safe, and ready for what’s next. Our team brings mechanical, electrical, and plumbing expertise together from design and coordination through installation, testing, and handover.':'ألترا شركة لهندسة وتنفيذ أنظمة MEP الأساسية التي تجعل المباني مريحة وآمنة وجاهزة للمستقبل. نجمع خبرات الميكانيكا والكهرباء والسباكة من التصميم والتنسيق حتى التركيب والاختبار والتسليم.',
    'Integrated MEP expertise for safer, more comfortable, better-performing spaces.':'خبرات متكاملة في أنظمة MEP لمبانٍ أكثر أماناً وراحة وكفاءة.',
    'Our teams coordinate each discipline from design through installation, testing, and handover.':'ينسق فريقنا مختلف التخصصات من التصميم إلى التركيب والاختبار والتسليم.',
    'Innovative and reliable engineering for integrated mechanical systems. We deliver high-quality solutions designed around efficiency, comfort, and dependable performance.':'حلول هندسية موثوقة للأنظمة الميكانيكية المتكاملة، مصممة لتحقيق الكفاءة والراحة والأداء المستقر.',
    'Power distribution, lighting, low current, and controls coordinated into safe, reliable systems that support every building.':'ننسق توزيع الطاقة والإضاءة وأنظمة التيار الخفيف والتحكم ضمن أنظمة آمنة وموثوقة تناسب احتياجات كل مبنى.',
    'Clear, buildable engineering from early design through BIM coordination, helping every discipline work together smoothly.':'تصميم هندسي واضح وقابل للتنفيذ، من المراحل الأولى وحتى تنسيق BIM، لضمان تكامل التخصصات.',
    'Careful testing, commissioning, and handover so each system performs as intended from the first day of operation.':'اختبارات وتشغيل تجريبي وتسليم دقيق لضمان أداء الأنظمة كما خُطط لها منذ اليوم الأول للتشغيل.',
    'Comfort, air quality, and reliable building performance through carefully coordinated HVAC, ventilation, and mechanical systems.':'راحة وجودة هواء وأداء موثوق للمبنى عبر تنسيق أنظمة HVAC والتهوية والأنظمة الميكانيكية.',
    'Safe, dependable power and lighting systems planned to support the way each building is used.':'أنظمة طاقة وإضاءة آمنة وموثوقة، مصممة بما يتناسب مع استخدام المبنى.',
    'Thoughtfully designed water supply, drainage, and plumbing systems for efficient everyday operation.':'أنظمة مدروسة لتغذية المياه والصرف والسباكة لضمان تشغيل يومي فعّال.',
    'Explore the places and systems made possible through thoughtful MEP engineering.':'اكتشف المشروعات والأنظمة التي تدعمها هندسة MEP المدروسة.',
    'Each project below is a placeholder for Ultra’s project photography and details.':'هذه نماذج مؤقتة لحين إضافة صور المشروعات وتفاصيلها الفعلية.',
    'From the first plan to ongoing operation, we connect every stage of MEP delivery.':'من التخطيط الأولي إلى التشغيل المستمر، ننسق جميع مراحل تنفيذ أنظمة MEP.',
    'A coordinated process helps our teams deliver dependable systems with clarity from start to finish.':'يساعدنا التنسيق المنهجي على تنفيذ أنظمة موثوقة بوضوح من البداية حتى التسليم.',
    'Our people bring the experience, care, and coordination that move every project forward.':'يسهم فريقنا بخبرته واهتمامه وتنسيقه في دفع كل مشروع إلى الأمام.',
    'The people behind Ultra’s engineering and construction work.':'الفريق الذي يقف وراء أعمال ألترا الهندسية والتنفيذية.',
    'MEP ENGINEERING · EGYPT':'هندسة MEP · مصر','Explore our work':'استكشف أعمالنا','Chat on WhatsApp':'تواصل عبر واتساب','Work with our team':'اعمل مع فريقنا','Selected work.':'أعمال مختارة.','Selected work':'أعمال مختارة','Explore our projects':'استكشف مشروعاتنا','Explore our approach':'اكتشف منهجيتنا','Contact us on WhatsApp':'تواصل معنا عبر واتساب','OUR PEOPLE, OUR PURPOSE':'فريقنا، هدفنا','Good work happens':'العمل الجيد يبدأ','when we work ':'عندما نعمل ','together.':'معاً.','THE PEOPLE BEHIND THE WORK':'فريقنا وراء التنفيذ','ONE CONNECTED TEAM':'فريق واحد متكامل','Meet the ':'تعرف على ','team.':'فريقنا.','Services':'الخدمات','Design & coordination':'التصميم والتنسيق','Testing & commissioning':'الاختبار والتشغيل التجريبي','PLUMBING SERVICES':'أعمال السباكة','Electrical works':'الأعمال الكهربائية','Fire fighting systems':'أنظمة مكافحة الحريق','Fire alarm systems':'أنظمة إنذار الحريق','Low current systems':'أنظمة التيار الخفيف','Maintenance':'الصيانة',
    'CLIENTS & PARTNERS':'العملاء والشركاء','LOGOS TO BE ADDED':'ستُضاف الشعارات لاحقاً','LET’S WORK TOGETHER':'لنعمل معاً','LET\'S WORK TOGETHER':'لنعمل معاً','BUILD WHAT\'S NEXT':'نبني ما هو قادم','HAVE A PROJECT IN MIND?':'هل لديكم مشروع؟','OUR PROJECTS':'مشروعاتنا','ENGINEERED FOR EVERYDAY LIFE':'هندسة تخدم الحياة اليومية','ULTRA · SELECTED WORK':'ألترا · أعمال مختارة','ULTRA · ADMINISTRATION':'ألترا · الإدارة','Contact Ultra':'تواصل مع ألترا','About Ultra':'عن ألترا','Our services':'خدماتنا','Our approach':'منهجيتنا','View projects':'عرض المشروعات','Explore':'استكشف','Ultra delivers mechanical, electrical, and plumbing systems that help buildings work safely, comfortably, and reliably.':'تقدم ألترا أنظمة ميكانيكية وكهربائية وأنظمة سباكة تساعد المباني على العمل بأمان وراحة واعتمادية.',
    'Engineering the systems behind':'هندسة الأنظمة التي تدعم','everyday life.':'حياتنا اليومية.','Ultra is an MEP construction and engineering company delivering the essential building systems that make places comfortable, safe, and ready for what’s next. Our team brings mechanical, electrical, and plumbing expertise together from design and coordination through installation, testing, and handover.':'ألترا شركة لهندسة وتنفيذ أنظمة MEP الأساسية التي تجعل المباني مريحة وآمنة وجاهزة للمستقبل. نجمع خبرات الميكانيكا والكهرباء والسباكة من التصميم والتنسيق حتى التركيب والاختبار والتسليم.',
    'Comfort, air quality, and reliable building performance through carefully coordinated HVAC, ventilation, and mechanical systems.':'راحة وجودة هواء وأداء موثوق للمبنى عبر تنسيق أنظمة HVAC والتهوية والأنظمة الميكانيكية.','Safe, dependable power and lighting systems planned to support the way each building is used.':'أنظمة طاقة وإضاءة آمنة وموثوقة، مصممة بما يتناسب مع استخدام المبنى.','Thoughtfully designed water supply, drainage, and plumbing systems for efficient everyday operation.':'أنظمة مدروسة لتغذية المياه والصرف والسباكة لضمان تشغيل يومي فعّال.',
    'Projects built':'مشروعات مصممة','to work better.':'لأداء أفضل.','Explore the places and systems made possible through thoughtful MEP engineering.':'اكتشف المشروعات والأنظمة التي تدعمها هندسة MEP المدروسة.','Each project below is a placeholder for Ultra’s project photography and details.':'هذه نماذج مؤقتة لحين إضافة صور المشروعات وتفاصيلها الفعلية.','Every stage,':'كل مرحلة','working as one.':'تعمل بتكامل.','A coordinated process helps our teams deliver dependable systems with clarity from start to finish.':'يساعدنا التنسيق المنهجي على تنفيذ أنظمة موثوقة بوضوح من البداية حتى التسليم.',
    'Good work happens':'العمل الجيد يبدأ','when we work':'عندما نعمل','together.':'معاً.','Meet the':'تعرف على','team.':'فريقنا.','Project type · Location':'نوع المشروع · الموقع','Leadership':'الإدارة','Mechanical engineering':'الهندسة الميكانيكية','Electrical engineering':'الهندسة الكهربائية','Project management':'إدارة المشروعات','Site operations':'عمليات الموقع','Design coordination':'تنسيق التصميم',
    'MEP SERVICES':'خدمات MEP','Design & coordination':'التصميم والتنسيق','Testing & commissioning':'الاختبار والتشغيل التجريبي','Plumbing services':'أعمال السباكة','Fire fighting':'مكافحة الحريق','Fire alarm':'إنذار الحريق','Low current / ELV':'التيار الخفيف / ELV','Shop Drawings':'مخططات الورش التنفيذية','Maintenance':'الصيانة',
    'Our teams coordinate each discipline from design through installation, testing, and handover.':'ينسق فريقنا مختلف التخصصات من التصميم إلى التركيب والاختبار والتسليم.','From the first plan to ongoing operation, we connect every stage of MEP delivery.':'من التخطيط الأولي إلى التشغيل المستمر، ننسق جميع مراحل تنفيذ أنظمة MEP.',
    'MEP engineering and construction':'هندسة وتنفيذ أنظمة MEP','Services | Ultra':'الخدمات | ألترا','Projects | Ultra':'المشروعات | ألترا','About Us | Ultra':'من نحن | ألترا','Our Approach | Ultra':'منهجيتنا | ألترا','Ultra | Building the systems behind better spaces':'ألترا | أنظمة تصنع مساحات أفضل',
    'OUR SERVICES':'خدماتنا','MECHANICAL · ELECTRICAL · FIRE · ELV':'ميكانيكا · كهرباء · حريق · تيار خفيف','Select a service to see its scope and how it supports your project.':'اختر الخدمة للتعرّف على نطاقها ودورها في دعم مشروعك.','OUR SCOPE':'نطاق خدماتنا','Planned for your project.':'مخطط لمشروعك.','Coordinated for delivery.':'ومنسق لضمان التنفيذ.','What this service can include':'يشمل نطاق الخدمة','OTHER SERVICES':'خدمات أخرى','Related services':'خدمات ذات صلة','Explore our services':'اكتشف خدماتنا',
    'HVAC Systems':'أنظمة التكييف والتهوية','Electrical Power & Distribution':'القوى والتوزيع الكهربائي','Plumbing & Drainage':'أعمال السباكة والصرف','Fire Fighting Systems':'أنظمة مكافحة الحريق','Fire Alarm Systems':'أنظمة إنذار الحريق','Low Current & ELV':'التيار الخفيف وأنظمة ELV','Shop Drawings':'مخططات الورش التنفيذية','Maintenance':'الصيانة',
    'HVAC design, installation, testing, and commissioning for comfortable, dependable building operation.':'تصميم وتركيب واختبار وتشغيل أنظمة HVAC لتوفير بيئة مريحة وأداء موثوق للمبنى.','Electrical works that support safe, coordinated power distribution throughout your project.':'أعمال كهربائية تدعم توزيعاً آمناً ومنسقاً للطاقة في مشروعك.','Water supply, drainage, and plumbing systems coordinated for reliable day-to-day use.':'أنظمة تغذية المياه والصرف والسباكة، منسقة لضمان تشغيل يومي موثوق.','Fire suppression and firefighting networks delivered with careful coordination and testing.':'شبكات مكافحة وإخماد الحريق، تنفذ مع التنسيق والاختبارات اللازمة.','Fire detection and alarm systems installed and coordinated to support life-safety strategies.':'أنظمة كشف وإنذار الحريق، تركب وتنسق لدعم متطلبات سلامة الأرواح.','Low current and ELV infrastructure coordinated around project requirements and connected systems.':'بنية أنظمة التيار الخفيف وELV، منسقة وفق متطلبات المشروع والأنظمة المتصلة.','Construction-ready MEP drawings with coordinated layouts, dimensions, sections, and details to guide accurate site installation.':'مخططات MEP تنفيذية منسقة، تتضمن المساقط والأبعاد والقطاعات والتفاصيل لتوجيه التركيب الدقيق بالموقع.','Planned and corrective maintenance for building services, with clear records and practical follow-up.':'صيانة وقائية وتصحيحية لخدمات المبنى، مع سجلات واضحة ومتابعة عملية.',
    'HVAC system installation':'تركيب أنظمة HVAC','Ventilation and air distribution':'التهوية وتوزيع الهواء','Equipment and controls coordination':'تنسيق المعدات وأنظمة التحكم','Testing, balancing, and commissioning':'الاختبار والموازنة والتشغيل','Power distribution and switchgear':'توزيع الطاقة ولوحات التوزيع','Cable containment and wiring':'مسارات الكابلات والتوصيلات','Lighting and small power':'الإضاءة والقوى الخفيفة','Inspection, testing, and handover':'الفحص والاختبار والتسليم','Domestic water supply':'شبكات تغذية المياه','Drainage and waste networks':'شبكات الصرف والمخلفات','Pumps, tanks, and plumbing equipment':'المضخات والخزانات ومعدات السباكة','Testing and commissioning':'الاختبار والتشغيل','Firefighting pipework and equipment':'شبكات ومعدات مكافحة الحريق','Sprinkler and hose systems where specified':'أنظمة الرش والخراطيم حسب نطاق المشروع','Pump room installation and coordination':'تركيب وتنسيق غرف المضخات','Pressure testing and commissioning':'اختبار الضغط والتشغيل','Fire alarm panels and field devices':'لوحات وأجهزة إنذار الحريق','Detection and notification circuits':'دوائر الكشف والتنبيه','Interfaces with other building systems':'الربط مع أنظمة المبنى الأخرى','Testing, cause-and-effect checks, and handover':'الاختبار والتحقق من السيناريوهات والتسليم','Structured cabling and network infrastructure':'الكابلات المنظمة وبنية الشبكات','CCTV and access control':'كاميرات المراقبة والتحكم في الدخول','Intercom and communication systems':'أنظمة الاتصال الداخلي والتواصل','Containment, integration, and testing':'المسارات والتكامل والاختبار','Coordinated MEP plans, elevations, sections, and installation details':'مخططات MEP منسقة تشمل المساقط والواجهات والقطاعات وتفاصيل التركيب','Service routing, levels, clearances, and access coordination':'تنسيق مسارات الخدمات والمناسيب والخلوص وإمكانية الوصول','Equipment locations, builders’ work, sleeves, and openings coordination':'تنسيق مواقع المعدات والأعمال المدنية المساندة والأكمام والفتحات','Drawing registers, revision control, and updates following approved changes':'سجلات المخططات وضبط المراجعات والتحديثات بعد اعتماد التغييرات','Preventive maintenance visits':'زيارات الصيانة الوقائية','Inspection and fault diagnosis':'الفحص وتشخيص الأعطال','Corrective maintenance coordination':'تنسيق أعمال الصيانة التصحيحية','Service reports and recommendations':'تقارير الخدمة والتوصيات'
  };
  Object.assign(translations, {
    'We deliver heating, ventilation, and air conditioning systems planned around the building, its use, and its operating requirements. Our scope can include equipment selection, ductwork and piping, controls coordination, installation, testing, and commissioning.':'ننفذ أنظمة التدفئة والتهوية وتكييف الهواء بما يتناسب مع المبنى واستخدامه ومتطلبات تشغيله. وقد يشمل نطاقنا اختيار المعدات ومجاري الهواء والأنابيب وتنسيق التحكم والتركيب والاختبار والتشغيل.',
    'We install and coordinate electrical power systems from incoming supply and distribution through final circuits. Work is planned against project drawings and applicable requirements, with coordination across MEP trades and clear testing and handover records.':'نركب وننسق أنظمة القوى الكهربائية من التغذية الرئيسية والتوزيع حتى الدوائر النهائية. ينفذ العمل وفق مخططات المشروع ومتطلباته، مع التنسيق بين تخصصات MEP وتوثيق الاختبارات والتسليم.',
    'We install plumbing and drainage systems to suit the building layout and operating needs. Coordination with structure and other services helps keep routes buildable and supports access for inspection and maintenance.':'نركب أنظمة السباكة والصرف بما يتناسب مع تصميم المبنى واحتياجات تشغيله. ويساعد التنسيق مع الهيكل والخدمات الأخرى على تنفيذ المسارات وإتاحة الوصول للفحص والصيانة.',
    'We execute firefighting systems in line with approved project requirements and applicable codes. Our teams coordinate pipework, equipment, valves, and interfaces with other building services, then test the completed installation before handover.':'ننفذ أنظمة مكافحة الحريق وفق متطلبات المشروع المعتمدة والأكواد المنطبقة. ننسق شبكات الأنابيب والمعدات والصمامات والربط مع خدمات المبنى الأخرى، ثم نختبر الأعمال قبل التسليم.',
    'We install fire alarm devices, circuits, panels, and interfaces in accordance with the approved design. Coordination with electrical, mechanical, and life-safety systems supports clear cause-and-effect testing and an orderly handover.':'نركب أجهزة ودوائر ولوحات إنذار الحريق وواجهاتها وفق التصميم المعتمد. ويدعم التنسيق مع الأنظمة الكهربائية والميكانيكية وأنظمة السلامة اختبارات واضحة للسيناريوهات وتسليماً منظماً.',
    'We deliver low current and extra-low-voltage systems as defined by the project scope. Cable routes, equipment locations, containment, and interfaces are coordinated with the wider MEP installation to support testing and future operation.':'ننفذ أنظمة التيار الخفيف والجهد المنخفض جداً وفق نطاق المشروع. ننسق مسارات الكابلات ومواقع المعدات والمسارات والواجهات مع أعمال MEP لدعم الاختبار والتشغيل.',
    'We develop MEP shop drawings that translate approved design information into clear, buildable instructions for site teams. Our work coordinates mechanical, electrical, plumbing, fire, and low-current routes against architectural and structural information, with attention to levels, access, equipment locations, and interfaces. Drawings are reviewed and updated through the project’s agreed coordination and approval process so installation teams can work from current information.':'نعد مخططات الورش لأنظمة MEP لتحويل معلومات التصميم المعتمدة إلى تعليمات واضحة وقابلة للتنفيذ لفرق الموقع. ننسق مسارات الأعمال الميكانيكية والكهربائية والسباكة والحريق والتيار الخفيف مع المخططات المعمارية والإنشائية، مع مراعاة المناسيب وإمكانية الوصول ومواقع المعدات والواجهات. وتتم مراجعة المخططات وتحديثها وفق إجراءات التنسيق والاعتماد المتفق عليها للمشروع، ليعمل فريق التركيب باستخدام أحدث المعلومات.',
    'We support building operators with maintenance activities across MEP systems. The service scope is agreed around the facility, equipment, and operating priorities, helping teams plan inspections, respond to faults, and keep maintenance records current.':'ندعم مشغلي المباني بأعمال صيانة أنظمة MEP. ويحدد نطاق الخدمة وفق المنشأة ومعداتها وأولويات التشغيل، لمساعدة الفرق على تخطيط الفحوص والاستجابة للأعطال وتحديث سجلات الصيانة.'
  });
  Object.assign(translations, {
    'Engineering Systems':'هندسة الأنظمة','That Power Every Building.':'التي تدعم كل مبنى.','Intelligent MEP Solutions.':'حلول MEP ذكية.','Built for Performance.':'مصممة لتحقيق الأداء.','Engineering the Infrastructure':'هندسة البنية التحتية','Behind Every Great Project.':'وراء كل مشروع ناجح.','One Team. One Vision.':'فريق واحد. رؤية واحدة.','Seamless Engineering.':'هندسة متكاملة.','Integrated Services.':'خدمات متكاملة.','Unified Project Delivery.':'تنفيذ موحد للمشروعات.','Quality That Speaks':'جودة تتحدث','Through Every Detail.':'في كل تفصيلة.','A Diverse Portfolio.':'تاريخ من المشاريع المتعددة في شتي المجالات','A Proven Ability to Deliver':'و قدرة مثبتة علي الانجاز','Start Your Project':'ابدأ مشروعك','with Ultra.':'مع ألترا.','Your Partner in Engineering and Construction':'شريككم في الهندسة والإنشاءات','Our founders.':'مؤسسونا',
    'We deliver integrated Mechanical, Electrical, and Plumbing solutions that ensure performance, efficiency, and reliability across every stage of your project.':'نقدم حلولاً متكاملة للأعمال الميكانيكية والكهربائية والسباكة، تضمن الأداء والكفاءة والاعتمادية في كل مرحلة من مراحل مشروعك.',
    'From system design to execution, we provide engineered MEP solutions that combine technical precision, energy efficiency, and seamless building integration.':'من تصميم الأنظمة إلى التنفيذ، نقدم حلول MEP هندسية تجمع بين الدقة الفنية وكفاءة الطاقة والتكامل السلس لأنظمة المبنى.',
    'Ultra delivers comprehensive MEP services designed to meet demanding project requirements, ensuring dependable systems, operational efficiency, and lasting performance.':'تقدم ألترا خدمات MEP متكاملة تلبي متطلبات المشروعات الدقيقة، وتضمن أنظمة موثوقة وكفاءة تشغيلية وأداءً مستداماً.',
    'We uphold the highest standards of quality across every stage of our work, ensuring precision, consistency, and excellence in every detail.':'نلتزم بأعلى معايير الجودة في جميع مراحل عملنا، لضمان الدقة والاتساق والتميز في كل تفصيلة.'
  }, blogTranslations, extraTranslations);
  const originalText = new WeakMap();
  const englishTitle = document.title;
  const applyLanguage = language => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.body.classList.toggle('is-arabic', language === 'ar');
    document.title = language === 'ar' ? translations[englishTitle] || englishTitle : englishTitle;
    document.querySelectorAll('[data-language-toggle]').forEach(button => { button.textContent = language === 'ar' ? 'English' : 'العربية'; button.setAttribute('aria-label', language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'); });
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const original = originalText.get(node) || node.textContent.trim();
      if (translations[original]) {
        originalText.set(node, original);
        const translated = language === 'ar' ? translations[original] : original;
        if (node.textContent !== translated) node.textContent = translated;
      }
    }
    localStorage.setItem('ultra-language', language);
  };
  window.ultraTranslate = value => document.documentElement.lang === 'ar' ? translations[value] || value : value;
  const savedLanguage = localStorage.getItem('ultra-language') || 'en';
  applyLanguage(savedLanguage);
  languageToggle?.addEventListener('click', () => applyLanguage(document.documentElement.lang === 'ar' ? 'en' : 'ar'));
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  menu?.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  });
  nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    menu.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
  }));

  document.querySelectorAll('[data-contact-form]').forEach(form => {
    const submit = form.querySelector('button[type="submit"]');
    const status = form.querySelector('[data-contact-status]');
    if (!submit || !status) return;
    const defaultButtonMarkup = submit.innerHTML;

    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (!form.reportValidity() || submit.disabled) return;

      submit.disabled = true;
      submit.textContent = 'Sending…';
      status.textContent = '';
      status.classList.remove('is-error', 'is-success');

      try {
        const formData = new FormData(form);
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(Object.fromEntries(formData)),
        });
        const result = await response.json().catch(() => null);
        if (!response.ok) throw new Error(result?.message || 'We could not send your request. Please try again.');

        form.reset();
        status.textContent = result?.message || 'Thank you. Your request has been received.';
        status.classList.add('is-success');
      } catch (error) {
        status.textContent = error instanceof TypeError
          ? 'We could not reach the server. Please try again in a moment.'
          : error.message;
        status.classList.add('is-error');
      } finally {
        submit.disabled = false;
        submit.innerHTML = defaultButtonMarkup;
      }
    });
  });

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    window.requestAnimationFrame(() => {
      document.querySelector('.site-header').classList.toggle('is-scrolled', window.scrollY > 36);
      ticking = false;
    });
    ticking = true;
  }, { passive: true });
}

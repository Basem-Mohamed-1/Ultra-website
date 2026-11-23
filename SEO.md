# Ultra website SEO audit and implementation report

## Audit findings

- The frontend is a Vite multi-page vanilla JavaScript site with an Express API. It is not a React application.
- The original production build emitted SEO snapshots for only a subset of pages. Individual service and blog routes lacked distinct build-time metadata, and the sitemap omitted service details.
- The site has no verified public domain configured in `VITE_SITE_URL`. Without it, a production build cannot safely emit canonical URLs, absolute Open Graph URLs, or a valid absolute-URL sitemap. The build now omits the sitemap and removes its robots.txt reference until the real origin is configured.
- Arabic and English currently share the same URL and the language toggle stores its choice in browser storage. Search crawlers cannot reliably discover two separately addressable language versions this way, so hreflang is not emitted.
- Project names/types, some team content, statistics, contact/social destinations, and blog bylines need company confirmation. I have not added Organization address/contact details, ratings, author names, or credentials that are not verified in the codebase.
- No Google Analytics, Tag Manager, or Search Console verification integration was found. No tracking or verification ID was available to configure.

## Implemented

- Added unique title, description, primary heading, introductory text, internal links, and a static HTML SEO snapshot for the homepage, About, Services, Approach, Blogs, eight service detail pages, and eight blog articles.
- Added Open Graph and Twitter summary metadata. Absolute canonical and social URLs are added only when the real `VITE_SITE_URL` is set.
- Added JSON-LD for Organization and WebSite across the public SEO page set; Service for service details; BlogPosting for articles; and BreadcrumbList where a verified site origin is configured. Article author and dateModified are omitted because no verified values exist.
- Generated the sitemap from the same route registry as the metadata. It includes indexable public pages and excludes the projects portfolio while its project details are placeholders. `/contact` remains an in-page home contact destination and is not listed separately. `/admin` remains noindex and is excluded.
- Added visible breadcrumb navigation on service and article details, article-to-service links, article related-content navigation, and descriptive image alt text where the image subject is known.
- Added image intrinsic dimensions to reduce layout shifts; existing WebP images remain in use, with above-the-fold images prioritized and lower-page images lazy-loaded.
- Added Vite dev/preview redirects from legacy `.html` URLs to clean URLs and a 404 for unknown clean document routes. The production static host still needs equivalent redirects and 404 behavior.
- Preserved the existing design and interactive content. The build-time snapshot supplies headings, copy, and crawlable links before client JavaScript runs.

## Keyword and page map

These are relevant search-intent targets based on the site's actual service scope and wording visible in Egypt's MEP sector. They are not search-volume estimates or ranking forecasts.

| Existing page | Primary intent and target phrases | Secondary phrases |
| --- | --- | --- |
| Home | MEP contractor in Egypt; MEP engineering services Egypt | mechanical electrical plumbing contractor; integrated MEP services |
| About | MEP engineering and construction company Egypt | building services contractor; MEP project delivery |
| Services | MEP services Egypt | HVAC, electrical, plumbing, fire protection, ELV, shop drawings, maintenance |
| HVAC | HVAC systems contractor Egypt; HVAC installation | ventilation systems; testing and commissioning |
| Electrical Power | electrical power and distribution works Egypt | electrical installation; power distribution systems |
| Plumbing & Drainage | plumbing and drainage contractor Egypt | water supply systems; building drainage installation |
| Fire Fighting | fire fighting systems contractor Egypt | fire suppression systems; sprinkler installation |
| Fire Alarm | fire alarm systems installation Egypt | fire detection systems; alarm system testing |
| Low Current & ELV | low current systems contractor Egypt | ELV systems; CCTV and access control installation |
| Shop Drawings | MEP shop drawings Egypt | coordinated MEP drawings; construction drawings |
| Maintenance | MEP maintenance services Egypt | building services maintenance; preventive maintenance |
| Approach | MEP project delivery and coordination | MEP installation, testing, commissioning, handover |
| Blogs | MEP engineering articles Egypt | HVAC, electrical, plumbing and fire-system guidance |
| Individual articles | Match each article's specific installation topic | Related service phrases should appear naturally in useful explanatory copy |
| Projects | Keep noindex until project names, scopes, locations, and imagery are verified | Then target project-type and location searches supported by those facts |

Search phrasing was checked against public Egypt-based MEP contractor pages for vocabulary and intent only. Their company claims and project facts were not used for Ultra.

## Content opportunities

Publish only when Ultra can provide technically reviewed, project-relevant guidance. Good next topics include:

- MEP coordination before construction: drawings, interfaces, and approval workflow.
- HVAC testing, adjusting, and balancing: scope, records, and handover.
- Electrical distribution board installation and pre-energization checks.
- Fire fighting and fire alarm: system boundaries, coordination, and integrated testing.
- MEP shop drawing review: levels, access, clearances, and revision control.
- Building services maintenance planning: asset registers, inspection frequency, and service records.
- Lessons from a verified Ultra project, with client permission and approved project details.

## Remaining work and manual setup

1. Set `VITE_SITE_URL` to Ultra's verified production origin in the deployment environment, then rebuild and check that `/robots.txt`, `/sitemap.xml`, canonical URLs, Open Graph URLs, and JSON-LD contain that exact origin. Do not deploy with a sample or placeholder domain.
2. Configure the production host to serve the clean routes, 301 redirect legacy `.html` URLs, and return a real 404 for unknown pages. Vite dev/preview middleware does not configure the production host.
3. If Arabic SEO is required, create crawlable Arabic URLs with Arabic-rendered HTML, translated titles/descriptions, self-canonical URLs, and reciprocal `hreflang` links (including `x-default` if appropriate). The current localStorage toggle alone is not a distinct indexable language version.
4. Verify Ultra's real project names, scopes, locations, team names, experience/client statistics, company contact details, social links, and article authors. Replace temporary or placeholder content before indexing those claims.
5. Verify the production domain in Google Search Console (prefer DNS verification), submit its generated `/sitemap.xml`, inspect representative URLs, and monitor Indexing, Core Web Vitals, and Search Performance. Search Console verification and indexing cannot be completed from this repository.
6. If analytics is wanted, create/confirm the GA4 property and provide its measurement ID, or a GTM container ID. No tracking scripts were added because no verified ID or consent requirements were supplied.

## References

- [Google guidance on canonical URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Google guidance on sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Google guidance on localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [Google Article structured data](https://developers.google.com/search/docs/appearance/structured-data/article)
- [Google Breadcrumb structured data](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb)
- [Egypt MEP market vocabulary reference: IES](https://ies-mep.com/)
- [Egypt MEP market vocabulary reference: MEPCO](https://www.mepcoeg.com/index.html)

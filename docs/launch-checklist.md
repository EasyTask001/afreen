# Launch checklist — owner review required

This is a local demo. There has been no public deployment, search-engine submission, live message delivery or business-profile creation.

- [ ] Verify Afreen’s business identity, authority to use the brand and the intended domain `afreen.cl`.
- [ ] Confirm the exact listed address with the owner: **LT 5 PC 30 DESP CAMPESIN NULL MARIA PINTO**. Keep it unchanged unless the owner explicitly authorizes a revision. Confirm visiting arrangements. Do not infer a postal code or coordinates.
- [ ] Obtain owner-approved real email and WhatsApp/phone values. Replace clearly labelled demo values in `src/data/contact.ts` only after verification. Do not expose clickable sales links to the fictional number.
- [ ] Choose and implement a real delivery integration with appropriate server-side validation, consent/privacy behavior, failure handling and truthful acknowledgements. A configuration edit alone does not enable delivery. Test with authorized recipients before enabling real enquiries.
- [ ] Review products, translations, sourcing/origin information and all commercial claims. Confirm availability, packing, quantities, pricing/MOQ and delivery terms per enquiry; do not imply unverified stock or guarantees.
- [ ] Review the illustrative imagery disclosure. Replace images with approved real product photography if desired; an illustration does not establish a particular variety, pack format, facility or stock.
- [ ] Complete real desktop/mobile E2E and screenshot review in an environment that permits sandboxed Chromium and a loopback server. Resolve failures; do not use bypass flags. Check actual clipboard/download, keyboard and touch behavior, no-JS content, forms, console/network errors and 404 status.
- [ ] Run `npm ci`, `npm run check`, `npm test`, `npm run build`, `npm run test:site`, `npm run test:e2e`, and a network-connected `npm audit`. Inspect the audit rather than treating an offline install as security clearance.
- [ ] Obtain explicit hosting/publication approval. Configure the domain, DNS and HTTPS with the authorized provider. Serve nested directory indexes and a true 404 response; route unknown `/es/` URLs to the Spanish error page. Do not rewrite all errors to a 200 homepage.
- [ ] Apply response headers equivalent to `scripts/static-handler.mjs`, including CSP, nosniff and referrer policy. Review any changes needed for the authorized delivery integration.
- [ ] Review the privacy notice against actual hosting logs, integration recipients, data retention, legal identity and contact channels. Review browser form-restoration behavior and confirm no contact PII enters site storage or analytics.
- [ ] Verify canonical HTTPS URLs, alternate languages, product/schema content, robots and sitemap on the actual approved host. Keep private previews access-controlled or noindex; local development is not publicly indexed. The generated production sitemap contains 40 indexable URLs.
- [ ] With owner authorization, verify the domain in Google Search Console and Bing Webmaster Tools, then submit `https://afreen.cl/sitemap.xml`. Check live indexing, crawl errors and coverage; indexing/rankings are not guaranteed.
- [ ] Confirm genuine Google Business Profile eligibility and the owner-approved customer-facing address/service model before creating or changing a listing. Do not assume that a listed address establishes eligibility or public visiting hours.

The implementation uses ordinary crawlable HTML, unique metadata, internal links and factual schema. Google states that its AI search features require no special AI schema or files, and inclusion is not guaranteed. See [Google’s AI features guidance](https://developers.google.com/search/docs/appearance/ai-features). Reciprocal, absolute language alternates follow [Google’s localized-version guidance](https://developers.google.com/search/docs/specialty/international/localized-versions). These technical measures do not promise rich results, rankings or citations.

Design research used the catalogue/contact patterns at [Andes Harvest](https://andesharvest.com/) as inspiration only. Afreen’s copy, layout and illustrative image assets are original; no competitor claims, certifications, statistics, photography or contact details were imported.

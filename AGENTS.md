# Project instructions

Work only in this Afreen project. Commits, pushes, deployment, spending, global configuration changes and production access require explicit owner authorization; do not access secrets or add bypass flags. The requirements and operational invariants below are the portable project context; local worker instruction files are intentionally not versioned. Keep installs, caches, outputs, logs and browser artifacts here. Do not alter the original AI images or independently supplied audit scripts.

## Commands and architecture

- Setup: `npm ci` (or `npm ci --offline` with the session cache).
- Run: `npm run dev` → `http://127.0.0.1:4321/`; Spanish at `/es/`.
- Type/syntax check: `npm run check`.
- Unit tests: `npm test`.
- Build: `npm run build`.
- Generated-site and server integration tests, after building: `npm run test:site`.
- E2E: install Chromium with `npx playwright install chromium`, then `npm run test:e2e`.
- Dependency security audit: `npm audit`.

This is a TypeScript catalogue and browser workflow with a native Node static renderer. Runtime has no npm dependencies. `src/data/catalog.ts` owns all product copy; `src/lib/routes.ts` owns localized URL equivalents; `scripts/` renders and serves the site; `public/` contains styles/assets. Product detail pages render optional structured product specs (`specs`) from catalogue copy into the `.detail-specs` list via `scripts/catalogue.mjs`. Edit source, then regenerate `dist/`. The dev command builds once and serves; it does not hot reload.

## Invariants

- English `/`, Spanish `/es/`, no locale redirects. Keep all equivalent routes and reciprocal `en`, `es-CL`, `x-default` links correct.
- All 12 products must remain present. Beetroot is a vegetable within fresh produce.
- Preserve `LT 5 PC 30 DESP CAMPESIN NULL MARIA PINTO` exactly. Never invent postal codes, coordinates, real contacts or business claims.
- Contact configuration: `src/data/contact.ts`. Demo email `test@example.com`, fictional WhatsApp `+1 202-555-0147`; neither is a sales channel. No live send/WhatsApp links. No backend or false delivery confirmations.
- Persist **only known product IDs**, using `afreen:products:v1`. Never persist contact PII, quantities, consent or enquiry text in local/session storage, cookies or a server.
- Use safe DOM APIs (`textContent`, `value`, element creation); do not render user input as HTML.
- Keep meaningful static content, accessible native controls, visible keyboard focus, touch targets, responsive images and reduced-motion behavior.
- No fabricated stock, prices, MOQ, certifications, statistics, testimonials, farm ownership or guaranteed delivery.
- Do not overwrite original `public/images/{id}.webp` files. Generated illustrative images must remain disclosed in both languages.
- The EasyTask AI Corp. centred technology-partner credit in the footer is content; keep it alongside the AI-imagery disclosure, and do not alter original imagery.

## Verification and launch

Use test-first vertical slices for behavior changes; retain actual failing and passing evidence. Playwright configuration is fixed to a disposable loopback preview, rejects external requests, enables Chromium sandboxing and saves reports/screenshots in `artifacts/`. Never point tests at production or weaken assertions to obtain a green run. A blocked browser, missing network or unavailable audit service is a **blocked gate**, not a pass. Record exact commands, exit codes and limitations in `artifacts/implementation-report.md`.

Before any public launch: complete `docs/launch-checklist.md` for owner-approved real contacts/delivery, verified business and address, domain/HTTPS/hosting authorization, privacy review, browser QA, network dependency audit, Search Console/Bing verification and sitemap submission, and genuine Google Business Profile eligibility. Do not deploy as part of this assignment.

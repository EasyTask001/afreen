# Afreen wholesale catalogue

A bilingual, prerendered wholesale catalogue for retailers in Chile. English is the default at `/`; Chilean Spanish lives under `/es/`. All 12 products have substantive detail pages, with equivalent language switching and structured product specs — botanical names, varieties, kernel grades or cuts and composition — rendered when present. The quote workflow is a **local demo**: it validates a selection and creates a usable copyable/downloadable request. It never sends email, opens WhatsApp or claims delivery.

The footer credits **EasyTask AI Corp.** (`https://www.easytask.ca/`) as a centred technology partner, using the EasyTask logo (`public/easytask-logo.png`), while retaining the AI-imagery disclosure. The home page opens with a credential band covering the two product families, the wholesale focus, per-inquiry details and the listed address.

## Run locally

Requires Node.js 22 or newer and npm. Everything installs within this project.

```sh
npm ci
npm run dev
```

Open **http://127.0.0.1:4321/** or **http://127.0.0.1:4321/es/**. The server binds only to `127.0.0.1`. `npm run dev` builds and starts a static preview; it does not hot reload. After editing source, stop and rerun it. Set a different local port with `PORT=4322 npm run dev` if needed.

For an already-built site: `npm run preview`. There is no public deployment command. The generated `dist/` is ready for review, but publishing requires the [launch checklist](docs/launch-checklist.md).

## Quality gates

Run in this order from the project root:

```sh
npm run check
npm test
npm run build
npm run test:site
npx playwright install chromium
npm run test:e2e
npm audit
```

`check` runs strict TypeScript checking and JavaScript syntax checks. Ten domain tests cover catalogue/search, localized routes, valid and malformed retailer emails, quote validation, storage filtering and summaries. Nine site/integration tests check all generated pages, accessible language labels, metadata, language alternates, schemas, links, responsive images, sitemap, and the actual static HTTP handler including error responses, path confinement and encoded-path redirect regressions.

The 28 Playwright cases run desktop Chromium and mobile Chromium emulating iPhone 13. They use Spanish browser locale to verify English remains the default. Tests cover language switching, categories/search/empty state, selection, validation, safe summary rendering, actual clipboard/download, Spanish outcomes, privacy, keyboard/menu/reduced motion, no-JS pages, 404s, and all 40 indexable routes. They also verify malformed-email rejection, computed field-boundary contrast, 44px standalone link targets, and bilingual detail-button accessible names in each selection state. They block external browser requests and launch a disposable **loopback-only** preview. An existing server on port 4321 must be stopped first. Chromium sandboxing is explicitly enabled; do not add bypass flags if the environment cannot support it.

Reports and screenshots are configured under `artifacts/`. See the [independent final verification](artifacts/final-verification.md) for the latest executed checks, review fixes and limits. The [implementation report](artifacts/implementation-report.md) preserves worker-stage results and sandbox restrictions. Final parent verification executed all 28 E2E cases, an 18-page/viewport axe scan and a zero-vulnerability network dependency audit. **Browser tests and network audit must not be assumed passed from test discovery or offline installation.**

Public package caches used during the initial local build are not included in Git. Fresh clones use `npm ci`; `npm ci --offline` only works when the required package tarballs are already cached locally. No credentials are required by the website.

## Architecture

Astro was preferred in the assignment. The coding worker's restricted sandbox could not resolve the npm registry, and Astro was not cached, so the implementation uses the allowed simpler static-stack alternative: a small Node static-page generator plus strict TypeScript and native HTML/CSS/JavaScript. The parent verification environment has working network access and completed the dependency audit. There are no runtime npm dependencies, framework hydration, authentication, database, checkout, analytics or third-party scripts.

| Source | Responsibility |
| --- | --- |
| `src/data/catalog.ts` | Twelve products, English/Spanish content, categories and accent-insensitive bilingual search |
| `src/lib/routes.ts` | Equivalent localized routes and complete route inventory |
| `src/data/contact.ts` | Editable demo contact values, exact address and canonical domain |
| `src/lib/quote.ts` | Validation, safe selection storage parsing and plain-text enquiry summaries |
| `src/client.ts` | Disclosure menu, live search, product selection and local quote workflow |
| `scripts/` | Shared rendering, localized pages, metadata/schema, build and local static server |
| `public/` | Styles, favicon, original illustrative photography and responsive WebP variants |
| `tests/` | Domain tests, generated-site/server integration tests and local-only Playwright E2E |
| `dist/` | Generated HTML, scripts, assets, robots and sitemap; rebuild rather than edit |

There are 42 localized route pages (40 indexable pages plus two noindex 404 pages), with an additional `404.html` hosting fallback. All content is available in static HTML. Product, Organization and BreadcrumbList JSON-LD use visible supported facts, without offers, ratings, phone numbers or fabricated commercial claims. FAQ answers are visible HTML; no special AI schema or AI text files are required.

Original Hermes-supplied `public/images/{id}.webp` files are preserved. Responsive `-480` and `-768` copies ship with the project, so building has no Python dependency. Optional asset maintenance uses `python3 scripts/optimize-images.py` with Pillow; it never overwrites an existing image. See `artifacts/image-provenance.json` for original image provenance. Photographs are AI illustrations, not actual facilities, varieties or stock.

## Demo contacts and privacy

Edit `src/data/contact.ts` for approved contact information. Current values are **test@example.com** and the reserved fictional **+1 202-555-0147**. They appear as clearly labelled text only. Changing configuration does not enable sending; delivery integration and verified real contacts remain launch requirements. The WhatsApp simulation provides only an on-page confirmation that nothing was sent.

Preserve this exact address everywhere, including structured data:

```text
LT 5 PC 30 DESP CAMPESIN NULL MARIA PINTO
```

Only product IDs are saved to local storage (`afreen:products:v1`). Contact details, quantities and consent stay in the current form; no PII is written to site storage or transmitted. Removing all products removes the storage key. Copy/download happen only on the visitor’s explicit action, and those user-controlled summaries contain their entered details. Browsers may independently offer autofill or restore form state.

The demo publishes no prices, stock, MOQ, certifications, delivery guarantees, reviews or invented company history. Availability, packing, quantities, prices and delivery arrangements require individual confirmation. It is not publicly deployed or indexed.

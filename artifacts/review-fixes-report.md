# Focused review fixes

Implemented only the four defects in `.codex-review-fixes.md`.

| Defect | Change and regression coverage | Disposition |
| --- | --- | --- |
| Encoded-separator redirect | Normalize decoded slash/backslash paths within `dist`, retain traversal confinement, and construct percent-encoded root-relative redirects from the confined file path. Handler tests cover the reported exploit, backslashes, dot segments, root redirects, localized missing pages and 404 routes. | Local red/green verified. |
| Malformed email accepted | Shared validator restricts local-part characters and validates domain labels; client also checks native `validity.typeMismatch`. Unit tests reject all three reported addresses and accept plus tags, subdomains and apostrophes. Bilingual E2E checks native validity, localized errors, hidden/cleared invalid summaries, decimal commas, text-only output and ID-only storage. | Domain red/green verified; browser reverify pending. |
| Field boundary contrast | Both affected border rules now use existing `--muted`. E2E computes contrast from actual browser border, fill and ancestor background colors for company, name, email, message, quantity and unit, requiring at least 3:1 on every side. Focus and error rules remain intact. | Supplied browser red evidence retained; browser green pending. |
| Narrow mobile targets | Breadcrumb and footer-bottom links now have `min-width:44px` alongside existing 44px minimum height. E2E measures both localized pages at exactly 390×844 and checks overflow. | Supplied browser red evidence retained; browser green pending. |

## Executed commands

All logs below are in `artifacts/`. Red runs occurred before their corresponding fixes.

| Exact command | Exit | Result / log |
| --- | --- | --- |
| `node tests/site/server.test.mjs > artifacts/review-server-red.log 2>&1` | 1 | Reported redirect assertion failed: actual `//example.com/../es/`, expected `/es/`. |
| `node tests/site/server.test.mjs > artifacts/review-server-green.log 2>&1` | 0 | 3 handler tests pass after fixing redirect construction and root handling. |
| `npm test > artifacts/review-email-red.log 2>&1` | 1 | All three malformed-email regressions failed; valid retailer cases passed. |
| `npm test > artifacts/review-email-green.log 2>&1` | 0 | All 10 domain tests pass. |
| `npm run check > artifacts/review-check.log 2>&1` | 0 | TypeScript and syntax checks pass. |
| `npm test > artifacts/review-unit.log 2>&1` | 0 | Final 10 domain tests pass. |
| `npm run build > artifacts/review-build.log 2>&1` | 0 | Regenerated 42 localized pages and assets, 40 indexable routes. |
| `npm run test:site > artifacts/review-site.log 2>&1` | 0 | Final 4 generated-site and 3 handler tests pass. |
| `npm run test:e2e -- --list --reporter=line > artifacts/review-e2e-discovery.log 2>&1` | 0 | 24 tests discovered; no browser assertions executed. |

An intermediate handler run failed because root normalization skipped the expected redirect for `/%2fexample.com%2f..`; directory redirect detection was corrected to use the original trailing-slash flag before the final green run. The initial exploit red log and final green log are retained.

## Files and remaining verification

Edited source/tests: `scripts/static-handler.mjs`, `src/lib/quote.ts`, `src/client.ts`, `public/styles.css`, `tests/site/server.test.mjs`, `tests/unit/quote.test.mjs`, `tests/e2e/site.spec.mjs`. Added this report and appended the review handoff to `artifacts/implementation-report.md`; retained the nine `review-*.log` files listed above. Regenerated `.build/` and `dist/` through the existing build command.

Parent must restart its preview to load the revised handler, run the 24 browser tests and unchanged independent review harness, and perform browser/network audits. No browser/network attempt was made in this worker run, per instruction; these are pending gates, not passes. Existing independent artifacts, harnesses, original images and Playwright configuration were not edited. No packages installed, preview stopped, commits, pushes, deployment, spending, production access or bypass flags.

## Narrow label-in-name follow-up — 2026-10-27

Implemented only `.codex-accessibility-fix.md`'s two instances. `scripts/layout.mjs` now shows full **English / Español** labels matching their existing accessible names; equivalent URLs, hreflang, current states and existing 44px CSS remain intact. `src/client.ts` now names detail buttons using their visible label followed by the localized product (for example, **Add to my quote: Walnut** / **Remove from my quote: Walnut**, and Spanish equivalents). Icon-only card names are unchanged. The static detail template already derives its default accessible name from its visible text, so it needed no change.

`tests/site/site.test.mjs` adds two assertion-level regressions covering language text/name matching, equivalent destinations and current state on all 42 routes. `tests/e2e/site.spec.mjs` adds English and Spanish detail checks for visible text, accessible name and pressed state through add → remove → add, in both configured viewports. Existing four-fix tests remain.

| Exact command | Exit | Result |
| --- | --- | --- |
| `node tests/site/site.test.mjs > artifacts/accessibility-labels-red.log 2>&1` | 1 | Before source edits: two assertion failures, `EN !== English` and `ES !== Español`; four existing tests pass. |
| `npm run check > artifacts/accessibility-labels-check.log 2>&1` | 0 | TypeScript and 15-module syntax gate pass. |
| `npm test > artifacts/accessibility-labels-unit.log 2>&1` | 0 | 10 unit tests pass. |
| `npm run build > artifacts/accessibility-labels-build.log 2>&1` | 0 | Regenerated `.build/` and `dist/`; 42 localized pages. |
| `npm run test:site > artifacts/accessibility-labels-site.log 2>&1` | 0 | 6 generated-site and 3 handler tests pass. |
| `npm run test:e2e -- --list --reporter=line > artifacts/accessibility-labels-e2e-discovery.log 2>&1` | 0 | 28 cases discovered only; no browser execution. |

The parent's supplied `accessibility-audit.json` / `.log` remains the actual browser RED evidence for both instances. This worker did not execute the new E2E assertions, browser/axe audits or network checks, and claims no browser red/green cycle. Parent owns full E2E, unchanged `artifacts/accessibility-audit.mjs` and responsive-layout re-verification against the rebuilt preview. No audit scripts, original images, dependencies, styles, Playwright controls or unrelated source changed; no commits, pushes, deployment or bypasses.

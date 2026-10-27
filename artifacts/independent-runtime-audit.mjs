import { chromium } from 'playwright';
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const origin = 'http://127.0.0.1:4321';
const sitemap = await readFile(path.join(root, 'dist/sitemap.xml'), 'utf8');
const routes = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => new URL(m[1]).pathname);
const browser = await chromium.launch({ headless: true, chromiumSandbox: true, ...(existsSync('/usr/bin/google-chrome') ? { executablePath: '/usr/bin/google-chrome' } : {}) });
const issues = [];
const results = [];
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
await context.route('**/*', route => {
  const url = new URL(route.request().url());
  if (url.origin === origin || url.protocol === 'data:' || url.protocol === 'blob:') return route.continue();
  issues.push(`Unexpected external request: ${url.origin}${url.pathname}`);
  return route.abort();
});
const page = await context.newPage();
let expectingNotFound = false;
page.on('pageerror', e => issues.push(`JS error ${page.url()}: ${e.message}`));
page.on('console', m => {
  if (m.type() !== 'error') return;
  if (expectingNotFound && m.text() === 'Failed to load resource: the server responded with a status of 404 (Not Found)') return;
  issues.push(`Console ${page.url()}: ${m.text()}`);
});
for (const route of routes) {
  const response = await page.goto(origin + route, { waitUntil: 'networkidle' });
  if (response.status() !== 200) issues.push(`${route}: status ${response.status()}`);
  const state = await page.evaluate(async () => {
    for (const image of document.images) {
      if (image.loading === 'lazy') image.loading = 'eager';
      try { await image.decode(); } catch { /* reported below */ }
    }
    return { title: document.title, lang: document.documentElement.lang,
      overflow: document.documentElement.scrollWidth > innerWidth + 1,
      missingImages: [...document.images].filter(i => !i.complete || !i.naturalWidth).map(i => i.src),
      h1: [...document.querySelectorAll('h1')].map(x => x.textContent),
      forms: [...document.forms].length };
  });
  if (state.overflow) issues.push(`${route}: desktop horizontal overflow`);
  if (state.missingImages.length) issues.push(`${route}: missing images ${state.missingImages.join(', ')}`);
  results.push({ route, status: response.status(), ...state });
}
await page.goto(origin, { waitUntil: 'networkidle' });
await page.screenshot({ path: path.join(root, 'artifacts/independent-desktop.png'), fullPage: true });
const es = page.getByRole('link', { name: 'Español', exact: true });
await es.click();
if (!new URL(page.url()).pathname.startsWith('/es/')) issues.push('Desktop Spanish switch failed');
await page.screenshot({ path: path.join(root, 'artifacts/independent-spanish.png'), fullPage: true });
await page.setViewportSize({ width: 390, height: 844 });
for (const route of ['/', '/es/', '/catalogue/', '/contact/', '/products/walnut/', '/es/productos/nueces/']) {
  await page.goto(origin + route, { waitUntil: 'networkidle' });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
  if (overflow) issues.push(`${route}: mobile horizontal overflow`);
  if (route === '/') {
    await page.screenshot({ path: path.join(root, 'artifacts/independent-mobile.png'), fullPage: true });
    const menu = page.getByRole('button', { name: 'Menu', exact: true });
    await menu.click();
    if (await menu.getAttribute('aria-expanded') !== 'true') issues.push('Mobile menu did not expand');
    await page.getByRole('navigation', { name: 'Main navigation', exact: true }).getByRole('link', { name: 'Catalogue', exact: true }).click();
    if (new URL(page.url()).pathname !== '/catalogue/') issues.push('Mobile catalogue navigation failed');
  }
}
expectingNotFound = true;
const missing = await page.goto(origin + '/this-route-does-not-exist/', { waitUntil: 'networkidle' });
if (missing.status() !== 404) issues.push(`Unknown route status ${missing.status()}, expected 404`);
await browser.close();
const report = { passed: issues.length === 0, auditedRoutes: results.length, issues: [...new Set(issues)], results };
await writeFile(path.join(root, 'artifacts/independent-runtime-audit.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ passed: report.passed, auditedRoutes: report.auditedRoutes, issues: report.issues }, null, 2));
process.exitCode = report.passed ? 0 : 1;

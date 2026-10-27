import { chromium } from 'playwright';
import { writeFile } from 'node:fs/promises';
import { staticHandler } from '../scripts/static-handler.mjs';
import { validateQuote } from '../.build/lib/quote.js';

const failures = [];
const evidence = {};
const response = { status: null, headers: {}, writeHead(s,h) { this.status=s; this.headers=h; }, end() {} };
await staticHandler({ method: 'GET', url: '/%2fexample.com%2f..%2fes' }, response);
evidence.redirect = response;
if (response.headers.Location && new URL(response.headers.Location, 'http://127.0.0.1:4321').origin !== 'http://127.0.0.1:4321') failures.push('Encoded path redirects outside preview origin');
const invalidEmails = ['x<@example.org', 'buyer@example..org', 'buyer@-example.org'];
evidence.emailValidation = [];
for (const email of invalidEmails) {
  const errors = validateQuote({ company:'Test Shop', name:'Test Buyer', email, message:'Packing information', consent:true, items:[{ id:'walnut', quantity:'25', unit:'kg' }] });
  evidence.emailValidation.push({ email, rejected: Boolean(errors.email) });
  if (!errors.email) failures.push(`Shared validator accepted malformed email: ${email}`);
}
const browser = await chromium.launch({ headless:true, chromiumSandbox:true });
const page = await browser.newPage({ viewport:{ width:390, height:844 } });
await page.goto('http://127.0.0.1:4321/contact/');
await page.locator('[data-product-picker] summary').click();
await page.getByLabel('Walnut', { exact:true }).check();
await page.getByLabel('Quantity for Walnut').fill('25');
await page.getByLabel('Company or store').fill('Test Shop');
await page.getByLabel('Contact name').fill('Test Buyer');
await page.getByLabel('What does your business need?').fill('Packing information');
await page.locator('#consent').check();
evidence.browserEmailValidation = [];
for (const email of invalidEmails) {
  await page.getByLabel('Contact email').fill(email);
  await page.getByRole('button', { name:'Prepare my request', exact:true }).click();
  const invalid = await page.locator('#error-email').isVisible();
  const nativeMismatch = await page.locator('#email').evaluate(e => e.validity.typeMismatch);
  const prepared = await page.locator('#quote-result').isVisible();
  evidence.browserEmailValidation.push({ email, invalid, nativeMismatch, prepared });
  if (!invalid || prepared) failures.push(`Browser prepared summary for malformed email: ${email}`);
}
const colours = await page.evaluate(() => {
  const ids = ['company','email','message','quantity-walnut','unit-walnut'];
  const background = getComputedStyle(document.body).backgroundColor;
  return ids.map(id => { const style=getComputedStyle(document.getElementById(id)); return { id,border:style.borderTopColor,fill:style.backgroundColor,background }; });
});
function luminance(rgb) {
  const channels = rgb.match(/[\d.]+/g).slice(0,3).map(Number).map(n => { const s=n/255; return s<=0.04045 ? s/12.92 : ((s+0.055)/1.055)**2.4; });
  return .2126*channels[0]+.7152*channels[1]+.0722*channels[2];
}
function contrast(a,b) { const aa=luminance(a),bb=luminance(b); return (Math.max(aa,bb)+.05)/(Math.min(aa,bb)+.05); }
evidence.boundaries = colours.map(c => ({ ...c, contrast:contrast(c.border,c.background) }));
for (const c of evidence.boundaries) if (c.contrast < 3) failures.push(`${c.id} boundary contrast ${c.contrast.toFixed(2)} is below 3:1`);
await page.goto('http://127.0.0.1:4321/catalogue/');
evidence.touchTargets = await page.locator('.breadcrumbs a, .footer-bottom>a').evaluateAll(links => links.map(a => { const r=a.getBoundingClientRect(); return { text:a.textContent.trim(),width:r.width,height:r.height }; }));
for (const a of evidence.touchTargets) if (a.width<44 || a.height<44) failures.push(`${a.text} target ${a.width.toFixed(2)}x${a.height.toFixed(2)} is below 44x44`);
await browser.close();
const report={ passed:failures.length===0,failures,evidence };
await writeFile('artifacts/review-regressions.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
process.exitCode=report.passed?0:1;

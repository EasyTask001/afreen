import { test as base, expect } from 'playwright/test';
import { readFile } from 'node:fs/promises';

// All browser traffic is local; any attempted external request fails the test.
const test = base.extend({
  page: async ({ page }, use) => {
    const failures = [];
    await page.route('**/*', route => {
      const url = new URL(route.request().url());
      if (!['127.0.0.1', 'localhost'].includes(url.hostname)) {
        failures.push(`External request: ${url.href}`);
        return route.abort();
      }
      return route.continue();
    });
    page.on('pageerror', e => failures.push(e.message));
    page.on('console', msg => { if (msg.type() === 'error' && !msg.text().includes('404 (Not Found)')) failures.push(msg.text()); });
    page.on('response', r => { if (r.status() >= 400 && !r.url().includes('missing-page') && !r.url().includes('/404')) failures.push(`${r.status()} ${r.url()}`); });
    await use(page);
    expect(failures, 'No console errors, external traffic or missing assets').toEqual([]);
  },
});

async function menuIfNeeded(page, isMobile) {
  if (isMobile) await page.getByRole('button', { name: 'Menu', exact: true }).click();
}

async function screenshot(page, path) {
  // Load lazy images before full-page capture; offscreen lazy placeholders are
  // not useful visual evidence even when the later route crawl verifies them.
  await page.evaluate(async () => {
    for (const image of document.images) {
      image.loading = 'eager';
      await image.decode();
    }
  });
  await page.screenshot({ path, fullPage: true });
}

test('English is default regardless of locale; language links keep exact product equivalents', async ({ page, isMobile }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Good produce.');
  await menuIfNeeded(page, isMobile);
  await page.getByRole('link', { name: 'Español', exact: true }).click();
  await expect(page).toHaveURL('/es/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'es-CL');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Buenos productos.');
  await page.goto('/products/walnut/');
  await menuIfNeeded(page, isMobile);
  await page.getByRole('link', { name: 'Español', exact: true }).click();
  await expect(page).toHaveURL('/es/productos/nueces/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Nueces');
  if (isMobile) await page.getByRole('button', { name: 'Menú', exact: true }).click();
  await page.getByRole('link', { name: 'English', exact: true }).click();
  await expect(page).toHaveURL('/products/walnut/');
});

test('catalogue filters, bilingual accent-insensitive search, empty state and product links work', async ({ page }) => {
  await page.goto('/catalogue/');
  await expect(page.locator('[data-product-card]')).toHaveCount(12);
  await page.getByRole('searchbox', { name: 'Search products' }).fill('nueces');
  await expect(page.locator('[data-product-card]:visible')).toHaveCount(1);
  await expect(page.locator('[data-results]')).toContainText('1 product');
  await page.getByRole('searchbox').fill('nothing-matches');
  await expect(page.getByRole('heading', { name: 'No products found.' })).toBeVisible();
  await expect(page.locator('[data-product-card]:visible')).toHaveCount(0);
  await page.getByRole('button', { name: 'Clear search' }).click();
  await expect(page.locator('[data-product-card]:visible')).toHaveCount(12);
  await page.getByRole('navigation', { name: 'Product categories' }).getByRole('link', { name: /Dry fruits/ }).click();
  await expect(page.locator('[data-product-card]')).toHaveCount(3);
  await page.getByRole('navigation', { name: 'Product categories' }).getByRole('link', { name: /Fresh produce/ }).click();
  await expect(page.locator('[data-product-card]')).toHaveCount(9);
  await expect(page.getByRole('heading', { name: 'Beetroot', exact: true })).toBeVisible();
  await page.goto('/es/catalogo/');
  await page.getByRole('searchbox', { name: 'Buscar productos' }).fill('limón');
  await expect(page.locator('[data-product-card]:visible')).toHaveCount(1);
  await page.getByRole('heading', { name: 'Limones', exact: true }).getByRole('link').click();
  await expect(page).toHaveURL('/es/productos/limones/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Limones');
});

test('card and detail selection persists only IDs, supports removal and carries into the enquiry', async ({ page }) => {
  await page.goto('/catalogue/');
  await page.getByRole('button', { name: 'Add Walnut to quote', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Remove Walnut from quote', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.goto('/products/cherry/');
  await page.locator('.detail-copy [data-add]').click();
  await page.goto('/contact/');
  await expect(page.locator('.selected-product')).toHaveCount(2);
  await expect(page.getByLabel('Quantity for Walnut')).toBeVisible();
  await page.getByRole('button', { name: 'Remove Cherry', exact: true }).click();
  await expect(page.locator('.selected-product')).toHaveCount(1);
  await expect(page.getByLabel('Cherry', { exact: true })).not.toBeChecked();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('afreen:products:v1')))).toEqual(['walnut']);
  await page.reload();
  await expect(page.locator('.selected-product')).toHaveCount(1);
  await page.getByRole('button', { name: 'Remove Walnut', exact: true }).click();
  await expect(page.getByText('Your selection is empty.')).toBeVisible();
});

for (const [lang, path, name, add, remove] of [
  ['en', '/products/walnut/', 'Walnut', 'Add to my quote', 'Remove from my quote'],
  ['es', '/es/productos/nueces/', 'Nueces', 'Agregar a mi cotización', 'Quitar de mi cotización'],
]) {
  test(`${lang} detail quote button accessible name includes its visible label before and after toggling`, async ({ page }) => {
    await page.goto(path);
    const button = page.locator('.detail-copy [data-add="walnut"]');
    const label = button.locator('[data-add-label]');
    const states = [[add, 'false'], [remove, 'true'], [add, 'false']];
    for (const [index, [visible, pressed]] of states.entries()) {
      await expect(button).toBeVisible();
      await expect(label).toHaveText(visible);
      await expect(button).toHaveAccessibleName(`${visible}: ${name}`);
      await expect(button).toHaveAttribute('aria-pressed', pressed);
      if (index < states.length - 1) await button.click();
    }
  });
}

test('quote validation, safe preview, copy, download and simulated demo contact have honest outcomes', async ({ page, context, isMobile }) => {
  await page.goto('/contact/');
  await page.getByRole('button', { name: 'Prepare my request' }).click();
  await expect(page.getByRole('heading', { name: 'Review your request' })).toBeVisible();
  await expect(page.locator('#form-errors')).toBeFocused();
  await page.locator('[data-product-picker] summary').click();
  await page.getByLabel('Walnut', { exact: true }).check();
  await page.getByLabel('Quantity for Walnut').fill('0');
  await page.getByLabel('Company or store').fill('Store <script>alert(1)</script>');
  await page.getByLabel('Contact name').fill('Ana Pérez');
  await page.getByLabel('Contact email').fill('invalid');
  await page.getByLabel('What does your business need?').fill('<img src=x onerror=alert(1)> Please confirm packing.');
  await page.getByRole('button', { name: 'Prepare my request' }).click();
  await expect(page.locator('#error-items')).toBeVisible();
  await expect(page.locator('#error-email')).toBeVisible();
  await expect(page.locator('#error-consent')).toBeVisible();
  await page.getByLabel('Quantity for Walnut').fill('25');
  await page.getByLabel('Contact email').fill('ana@example.org');
  await page.locator('#consent').check();
  await page.getByRole('button', { name: 'Prepare my request' }).click();
  await expect(page.getByRole('heading', { name: 'Ready for your review.' })).toBeVisible();
  await expect(page.locator('#quote-result')).toBeFocused();
  await expect(page.locator('#quote-summary')).toHaveValue(/Walnut: 25 kg/);
  await expect(page.locator('#quote-summary')).toHaveValue(/Nothing has been sent/);
  await expect(page.locator('#quote-result img')).toHaveCount(0);
  const storage = await page.evaluate(() => ({ local: { ...localStorage }, session: { ...sessionStorage } }));
  expect(storage).toEqual({ local: { 'afreen:products:v1': '["walnut"]' }, session: {} });
  expect(await context.cookies()).toEqual([]);
  // The actual browser clipboard is tested where Chromium supports permissions.
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.getByRole('button', { name: 'Copy summary' }).click();
  await expect(page.locator('#quote-action-status')).toHaveText('Copied to your clipboard. Nothing has been sent.');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('Walnut: 25 kg');
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download .txt' }).click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe('afreen-quote-en.txt');
  const data = await readFile(await download.path(), 'utf8');
  expect(data).toContain('ana@example.org');
  expect(data).toContain('Nothing has been sent');
  expect(data).toContain('<img src=x onerror=alert(1)>');
  await page.getByRole('button', { name: 'Simulate demo contact' }).click();
  await expect(page.locator('#demo-outcome')).toContainText('Simulation complete. Nothing has been sent');
  await screenshot(page, `artifacts/quote-${isMobile ? 'mobile' : 'desktop'}.png`);
  await page.reload();
  await expect(page.getByLabel('Company or store')).toHaveValue('');
  await expect(page.getByLabel('Contact email')).toHaveValue('');
  await expect(page.locator('#quote-result')).toBeHidden();
});

test('Spanish quote flow is translated through validation and generated output', async ({ page }) => {
  await page.goto('/es/contacto/');
  await page.getByRole('button', { name: 'Preparar mi solicitud' }).click();
  await expect(page.getByRole('heading', { name: 'Revisa tu solicitud' })).toBeVisible();
  await page.locator('[data-product-picker] summary').click();
  await page.getByLabel('Paltas', { exact: true }).check();
  await page.getByLabel('Cantidad de Paltas').fill('2');
  await page.getByLabel('Unidad de Paltas').selectOption('boxes');
  await page.getByLabel('Empresa o negocio').fill('Almacén Sur');
  await page.getByLabel('Nombre de contacto').fill('Ana');
  await page.getByLabel('Email de contacto').fill('ana@example.org');
  await page.getByLabel('¿Qué necesitas para tu negocio?').fill('Consultar madurez y formato.');
  await page.locator('#consent').check();
  await page.getByRole('button', { name: 'Preparar mi solicitud' }).click();
  await expect(page.locator('#quote-summary')).toHaveValue(/Paltas: 2 cajas/);
  await expect(page.locator('#quote-summary')).toHaveValue(/No se ha enviado/);
  await page.getByRole('button', { name: 'Simular contacto demo' }).click();
  await expect(page.locator('#demo-outcome')).toContainText('No se ha enviado nada');
});

for (const [lang, path] of [['en', '/contact/'], ['es', '/es/contacto/']]) {
  test(`${lang} email validation rejects malformed addresses and accepts retailer addresses`, async ({ page, context }) => {
    await page.goto(path);
    await page.locator('[data-product-picker] summary').click();
    await page.locator('[data-choose-product][value="walnut"]').check();
    await page.locator('#quantity-walnut').fill('0,5');
    await page.locator('#company').fill('Almacén Sur');
    await page.locator('#name').fill('Ana');
    await page.locator('#message').fill('<img src=x onerror=alert(1)> Confirm packing.');
    await page.locator('#consent').check();
    for (const email of ['orders+fresh@example.cl', 'buyer@retail.example.co.cl', "o'connor@example.org"]) {
      await page.locator('#email').fill(email);
      expect(await page.locator('#email').evaluate(input => input.validity.typeMismatch), email).toBe(false);
      await page.locator('#prepare-quote').click();
      await expect(page.locator('#error-email')).toBeHidden();
      await expect(page.locator('#quote-result')).toBeVisible();
      await expect(page.locator('#quote-summary')).toHaveValue(new RegExp(lang === 'es' ? 'Nueces: 0,5 kg' : 'Walnut: 0.5 kg'));
      expect(await page.locator('#quote-summary').inputValue()).toContain(`Email: ${email}`);
    }
    for (const email of ['x<@example.org', 'buyer@example..org', 'buyer@-example.org']) {
      await page.locator('#email').fill(email);
      expect(await page.locator('#email').evaluate(input => input.validity.typeMismatch), email).toBe(true);
      await page.locator('#prepare-quote').click();
      await expect(page.locator('#email')).toHaveAttribute('aria-invalid', 'true');
      await expect(page.locator('#error-email')).toBeVisible();
      await expect(page.locator('#form-errors')).toBeFocused();
      await expect(page.locator('[data-error-links] a[href="#email"]')).toHaveText(await page.locator('#error-email').textContent());
      await expect(page.locator('#quote-result')).toBeHidden();
      await expect(page.locator('#quote-summary')).toHaveValue('');
    }
    await expect(page.locator('#quote-result img')).toHaveCount(0);
    expect(await page.evaluate(() => ({ local: { ...localStorage }, session: { ...sessionStorage } }))).toEqual({
      local: { 'afreen:products:v1': '["walnut"]' }, session: {},
    });
    expect(await context.cookies()).toEqual([]);
  });
}

test('enquiry field boundaries have at least 3:1 contrast against actual surrounding colors', async ({ page }) => {
  await page.goto('/contact/');
  await page.locator('[data-product-picker] summary').click();
  await page.getByLabel('Walnut', { exact: true }).check();
  const fields = page.locator('#company, #name, #email, #message, #quantity-walnut, #unit-walnut');
  await expect(fields).toHaveCount(6);
  const boundaries = await fields.evaluateAll(controls => {
    const rgba = color => {
      const values = color.match(/[\d.]+/g).map(Number);
      return [...values.slice(0, 3), values[3] ?? 1];
    };
    const composite = (front, back) => front.slice(0, 3).map((channel, i) => channel * front[3] + back[i] * (1 - front[3]));
    const luminance = color => color.slice(0, 3).map(channel => {
      const s = channel / 255;
      return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    }).reduce((sum, channel, i) => sum + channel * [0.2126, 0.7152, 0.0722][i], 0);
    const contrast = (a, b) => (Math.max(luminance(a), luminance(b)) + 0.05) / (Math.min(luminance(a), luminance(b)) + 0.05);
    return controls.map(control => {
      const ancestors = [];
      for (let node = control.parentElement; node; node = node.parentElement) ancestors.unshift(node);
      const background = ancestors.reduce((color, node) => composite(rgba(getComputedStyle(node).backgroundColor), color), [255, 255, 255]);
      const style = getComputedStyle(control);
      const fill = composite(rgba(style.backgroundColor), background);
      return {
        id: control.id,
        sides: ['Top', 'Right', 'Bottom', 'Left'].map(side => ({
          side, width: parseFloat(style[`border${side}Width`]), style: style[`border${side}Style`],
          outside: contrast(composite(rgba(style[`border${side}Color`]), background), background),
          inside: contrast(composite(rgba(style[`border${side}Color`]), fill), fill),
        })),
      };
    });
  });
  for (const field of boundaries) for (const border of field.sides) {
    expect(border.width, `${field.id} ${border.side} boundary width`).toBeGreaterThan(0);
    expect(border.style).not.toBe('none');
    expect(border.outside, `${field.id} ${border.side} boundary against surrounding background`).toBeGreaterThanOrEqual(3);
    expect(border.inside, `${field.id} ${border.side} boundary against field fill`).toBeGreaterThanOrEqual(3);
  }
});

test('standalone breadcrumb and footer links meet 44 by 44 at 390 by 844', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ['/contact/', '/es/contacto/']) {
    await page.goto(path);
    await page.evaluate(() => document.fonts.ready);
    const links = page.locator('.breadcrumbs a, .footer-bottom > a');
    await expect(links).toHaveCount(2);
    for (const link of await links.all()) {
      await expect(link).toBeVisible();
      const box = await link.boundingBox();
      expect(box.width, await link.textContent()).toBeGreaterThanOrEqual(44);
      expect(box.height, await link.textContent()).toBeGreaterThanOrEqual(44);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test('keyboard focus, responsive menu, reduced motion and local 404 work', async ({ page, isMobile }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
  if (isMobile) {
    const toggle = page.getByRole('button', { name: 'Menu', exact: true });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.focus();
    await page.keyboard.press('Enter');
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toBeFocused();
    const box = await toggle.boundingBox();
    expect(box.height).toBeGreaterThanOrEqual(44);
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.locator('#main').focus();
  await screenshot(page, `artifacts/home-${isMobile ? 'mobile' : 'desktop'}.png`);
  const response = await page.goto('/missing-page/');
  expect(response.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Back to the good things.');
  const esResponse = await page.goto('/es/missing-page/');
  expect(esResponse.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Volvamos a lo esencial.');
});

test('catalogue and meaningful details are usable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4321/es/catalogo/');
  await expect(page.locator('[data-product-card]')).toHaveCount(12);
  await page.getByRole('heading', { name: 'Betarragas', exact: true }).getByRole('link').click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Betarragas');
  await expect(page.getByText(/La betarraga es una hortaliza de raíz/)).toBeVisible();
  await context.close();
});

test('all forty indexable routes load without broken images, overflow or runtime errors', async ({ page, request, isMobile }) => {
  test.setTimeout(90000);
  const sitemap = await (await request.get('/sitemap.xml')).text();
  const paths = [...sitemap.matchAll(/<loc>https:\/\/afreen.cl([^<]+)<\/loc>/g)].map(m => m[1]);
  expect(paths).toHaveLength(40);
  for (const path of paths) {
    const response = await page.goto(path);
    expect(response.status(), path).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    const issues = await page.evaluate(async () => {
      for (const image of document.images) {
        image.loading = 'eager';
        try { await image.decode(); } catch { /* Reported below. */ }
      }
      return {
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
        missing: [...document.images].filter(image => !image.naturalWidth).map(image => image.src),
      };
    });
    expect(issues, path).toEqual({ overflow: false, missing: [] });
  }
  await page.goto('/catalogue/');
  await screenshot(page, `artifacts/catalogue-${isMobile ? 'mobile' : 'desktop'}.png`);
  await page.goto('/es/productos/nueces/');
  await screenshot(page, `artifacts/product-es-${isMobile ? 'mobile' : 'desktop'}.png`);
});

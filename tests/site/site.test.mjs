import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { allRoutes, pathFor } from '../../.build/lib/routes.js';
import { products } from '../../.build/data/catalog.js';

const root = 'dist';
const htmlAt = path => readFileSync(join(root, path, 'index.html'), 'utf8');
const meta = (html, name) => html.match(new RegExp(`<meta (?:name|property)="${name}" content="([^"]+)"`))?.[1];

for (const [target, code, label] of [['en', 'en', 'English'], ['es', 'es-CL', 'Español']]) {
  test(`${label} language links include their visible label in their accessible name on every route`, () => {
    for (const { key, lang, path } of allRoutes()) {
      const switcher = htmlAt(path).match(/<div class="language-switch"[^>]*>(.*?)<\/div>/s)?.[1];
      assert.ok(switcher, `${path}: language switch`);
      const links = [...switcher.matchAll(/<a\b([^>]*)>([^<]*)<\/a>/g)];
      const link = links.find(([, attrs]) => attrs.includes(`hreflang="${code}"`));
      assert.ok(link, `${path}: ${label} link`);
      const [, attrs, visible] = link;
      assert.equal(visible, label, `${path}: full visible language name`);
      assert.equal(attrs.match(/aria-label="([^"]+)"/)?.[1], visible, `${path}: label in name`);
      assert.ok(attrs.includes(`href="${pathFor(key, target)}"`), `${path}: equivalent route`);
      assert.ok(attrs.includes(`lang="${code}"`), `${path}: link language`);
      assert.equal(attrs.includes('aria-current="true"'), lang === target, `${path}: current language`);
    }
  });
}

test('all bilingual pages are rendered with unique localized metadata and reciprocal equivalent URLs', () => {
  const titles = new Set(), descriptions = new Set();
  for (const { key, lang, path } of allRoutes()) {
    const html = htmlAt(path);
    assert.match(html, new RegExp(`<html lang="${lang === 'es' ? 'es-CL' : 'en'}"`), path);
    assert.equal((html.match(/<h1[\s>]/g) ?? []).length, 1, path);
    assert.match(html, new RegExp(`<link rel="canonical" href="https://afreen.cl${path}"`));
    for (const [code, target] of [['en', 'en'], ['es-CL', 'es'], ['x-default', 'en']]) {
      assert.ok(html.includes(`<link rel="alternate" hreflang="${code}" href="https://afreen.cl${pathFor(key, target)}"`), path);
    }
    const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
    const description = meta(html, 'description');
    assert.ok(title && !titles.has(title), `unique title ${path}`);
    assert.ok(description?.length > 75 && !descriptions.has(description), `unique description ${path}`);
    titles.add(title); descriptions.add(description);
    assert.equal(meta(html, 'og:url'), `https://afreen.cl${path}`);
    assert.equal(meta(html, 'twitter:card'), 'summary_large_image');
    assert.match(meta(html, 'og:image'), /^https:\/\/afreen.cl\/images\/.+\.webp$/);
    assert.ok(existsSync(join(root, new URL(meta(html, 'og:image')).pathname)));
    assert.match(html, /LT 5 PC 30 DESP CAMPESIN NULL MARIA PINTO/);
    assert.doesNotMatch(html, /https:\/\/(wa\.me|api\.whatsapp)|mailto:test@example\.com|tel:\+?1202555/);
    if (key === '404') assert.equal(meta(html, 'robots'), 'noindex, follow');
    else assert.notEqual(meta(html, 'robots'), 'noindex, follow');
  }
});

test('structured data contains only supported business and product facts and valid breadcrumb paths', () => {
  for (const { key, lang, path } of allRoutes()) {
    const html = htmlAt(path);
    const schemas = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map(m => JSON.parse(m[1]));
    const org = schemas.find(s => s['@type'] === 'Organization');
    assert.equal(org.address.streetAddress, 'LT 5 PC 30 DESP CAMPESIN NULL MARIA PINTO');
    assert.equal(org.address.addressLocality, 'Maria Pinto');
    assert.equal(org.address.addressCountry, 'CL');
    assert.equal(org.telephone, undefined);
    assert.equal(org.email, undefined);
    assert.equal(org.address.postalCode, undefined);
    for (const schema of schemas) {
      assert.equal(schema.offers, undefined);
      assert.equal(schema.aggregateRating, undefined);
      assert.equal(schema.review, undefined);
      if (schema['@type'] === 'BreadcrumbList') {
        schema.itemListElement.forEach((crumb, i) => {
          assert.equal(crumb.position, i + 1);
          assert.ok(existsSync(join(root, new URL(crumb.item).pathname, 'index.html')));
        });
      }
    }
    if (key.startsWith('product:')) {
      const product = products.find(p => p.id === key.slice(8));
      const schema = schemas.find(s => s['@type'] === 'Product');
      assert.equal(schema.name, product[lang].name);
      assert.ok(html.includes(product[lang].description));
      assert.equal(schema.description, product[lang].description);
      assert.equal(schema.url, `https://afreen.cl${path}`);
      assert.equal(schema.brand, undefined, 'Wholesaler identity does not establish an own-brand product');
    }
  }
});

test('every internal destination, script, stylesheet and image exists and all image dimensions are explicit', () => {
  for (const { path } of allRoutes()) {
    const html = htmlAt(path);
    for (const match of html.matchAll(/\b(?:href|src)="(\/[^"#?]*)(?:[?#][^"]*)?"/g)) {
      const target = match[1];
      assert.ok(existsSync(join(root, target.endsWith('/') ? `${target}index.html` : target)), `${path} → ${target}`);
    }
    for (const match of html.matchAll(/<img\b([^>]+)>/g)) {
      assert.match(match[1], /alt="[^"]+"/, path);
      assert.match(match[1], /width="\d+"/, path);
      assert.match(match[1], /height="\d+"/, path);
      assert.match(match[1], /sizes="[^"]+"/, path);
      const srcset = match[1].match(/srcset="([^"]+)"/)?.[1];
      assert.ok(srcset, `${path}: responsive image sources`);
      for (const source of srcset.split(',')) {
        assert.ok(existsSync(join(root, source.trim().split(' ')[0])), `${path}: image variant ${source}`);
      }
    }
    assert.doesNotMatch(html, /<iframe|googletagmanager|google-analytics/);
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
    assert.equal(new Set(ids).size, ids.length, `${path}: unique IDs`);
    for (const match of html.matchAll(/\bhref="#([^"]+)"/g)) assert.ok(ids.includes(match[1]), `${path}: fragment ${match[1]}`);
  }
});

test('sitemap lists every indexable canonical once and omits both error pages', () => {
  const sitemap = readFileSync(join(root, 'sitemap.xml'), 'utf8');
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  assert.equal(urls.length, 40);
  assert.equal(new Set(urls).size, 40);
  assert.ok(urls.includes('https://afreen.cl/es/productos/cerezas/'));
  assert.ok(urls.includes('https://afreen.cl/products/walnut/'));
  assert.equal(urls.some(u => u.includes('/404/')), false);
  for (const { path, key } of allRoutes()) if (key !== '404') assert.ok(urls.includes(`https://afreen.cl${path}`));
  assert.match(readFileSync(join(root, 'robots.txt'), 'utf8'), /Sitemap: https:\/\/afreen.cl\/sitemap.xml/);
});

test('AI imagery disclaimer remains on every rendered page in both languages', () => {
  const disclaimer = {
    en: 'AI-generated illustrative imagery; not evidence of actual facilities or stock.',
    es: 'Imágenes ilustrativas generadas con IA; no acreditan instalaciones ni stock real.',
  };
  for (const { lang, path } of allRoutes()) {
    const html = htmlAt(path);
    assert.equal(html.includes(disclaimer[lang]), true, `${path}: ${lang} disclaimer present`);
    assert.equal(html.includes(disclaimer[lang === 'es' ? 'en' : 'es']), false, `${path}: other-language disclaimer absent`);
  }
});

test('every page credits EasyTask AI Corp. in the footer with a crawlable link and matching entity data', () => {
  for (const { key, lang, path } of allRoutes()) {
    const html = htmlAt(path);
    assert.ok(html.indexOf('class="footer-partner') > html.indexOf('class="site-footer"'), `${path}: credit inside the footer`);
    const partner = html.match(/<div class="footer-partner[^"]*">([\s\S]*?)<\/div>/)?.[1];
    assert.ok(partner, `${path}: footer partner block`);
    assert.ok(partner.includes(lang === 'es' ? 'SOCIO TECNOLÓGICO' : 'TECH PARTNER'), `${path}: localized partner label`);
    assert.ok(partner.includes('EasyTask AI Corp.'), `${path}: partner name`);
    const [, attrs, inner] = partner.match(/<a\b([^>]*)>([\s\S]*?)<\/a>/) ?? [];
    assert.ok(attrs, `${path}: logo anchor`);
    assert.ok(attrs.includes('href="https://www.easytask.ca/"'), `${path}: studio URL`);
    assert.ok(attrs.includes('rel="noopener noreferrer"'), `${path}: safe external link`);
    assert.equal(/\brel="[^"]*(?:nofollow|sponsored|ugc)/.test(attrs), false, `${path}: editorial credit stays crawlable`);
    assert.equal(/target="_blank"/.test(attrs), false, `${path}: credit does not hijack navigation`);
    assert.ok(inner.includes('alt="EasyTask AI Corp. logo"'), `${path}: branded logo alt text`);
    assert.ok(inner.includes('src="/easytask-logo.png"'), `${path}: logo asset`);

    const schemas = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map(m => JSON.parse(m[1]));
    const studio = schemas.find(schema => schema['@id'] === 'https://www.easytask.ca/#organization');
    assert.ok(studio, `${path}: studio entity`);
    assert.equal(studio['@type'], 'Organization');
    assert.equal(studio.name, 'EasyTask AI Corp.');
    assert.equal(studio.url, 'https://www.easytask.ca/');
    const webpage = schemas.find(schema => schema['@type'] === 'WebPage');
    assert.equal(webpage['@id'], `https://afreen.cl${path}#webpage`, `${path}: page entity`);
    assert.equal(webpage.url, `https://afreen.cl${path}`);
    assert.deepEqual(webpage.creator, { '@id': 'https://www.easytask.ca/#organization' }, `${path}: studio credited as creator`);
    const website = schemas.find(schema => schema['@type'] === 'WebSite');
    assert.equal(website['@id'], 'https://afreen.cl/#website');
    assert.deepEqual(website.publisher, { '@id': 'https://afreen.cl/#organization' }, `${path}: Afreen remains publisher`);
    assert.equal(studio.parentOrganization, undefined, 'No ownership claim between the two organizations');
  }
});

test('almond and walnut detail pages render their trade specification lists in both languages', () => {
  const cases = [
    ['/products/walnut/', ['Product details', 'Juglans regia', 'Serr and Chandler', '90% halves, quarters, pieces', 'light amber']],
    ['/es/productos/nueces/', ['Detalles del producto', 'Juglans regia', 'Serr y Chandler', '90% mitades, cuartos, trozos', 'light amber']],
    ['/products/almonds/', ['Product details', 'Prunus dulcis', 'Non Pareil, Carmel', '34/40, 40+', 'sliced, roasted, salted']],
    ['/es/productos/almendras/', ['Detalles del producto', 'Prunus dulcis', 'Non Pareil, Carmel', '34/40, 40+', 'laminadas, tostadas, saladas']],
  ];
  for (const [path, expected] of cases) {
    const html = htmlAt(path);
    const block = html.match(/<dl class="detail-specs"[^>]*>.*?<\/dl>/s)?.[0];
    assert.ok(block, `${path}: spec list rendered`);
    assert.equal((block.match(/<dt>/g) ?? []).length, (block.match(/<dd>/g) ?? []).length, `${path}: paired terms`);
    for (const text of expected) assert.ok(block.includes(text), `${path}: contains ${text}`);
  }
  const raisins = htmlAt('/products/raisins/');
  assert.equal(raisins.includes('detail-specs'), false, 'raisins: no spec list');
});

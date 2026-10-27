import test from 'node:test';
import assert from 'node:assert/strict';
import { products, searchProducts } from '../../.build/data/catalog.js';
import { allRoutes, pathFor, equivalentPath } from '../../.build/lib/routes.js';

test('the retailer catalogue contains all twelve requested products in the right categories', () => {
  assert.deepEqual(products.map(p => p.id).sort(), ['almonds','apple','avocado','beetroot','cherry','grapefruit','grapes','lemon','mandarin','orange','raisins','walnut']);
  assert.equal(products.filter(p => p.category === 'dry').length, 3);
  assert.equal(products.filter(p => p.category === 'fresh').length, 9);
  assert.equal(products.find(p => p.id === 'beetroot').category, 'fresh');
  for (const p of products) {
    for (const lang of ['en', 'es']) {
      assert.ok(p[lang].description.length > 80, `${p.id}: meaningful ${lang} description`);
      assert.ok(p[lang].buying.length > 80, `${p.id}: useful buying guidance`);
      assert.ok(p[lang].handling.length > 60, `${p.id}: useful handling guidance`);
    }
  }
});

test('Spanish search understands accents, bilingual product names, categories and empty results', () => {
  assert.deepEqual(searchProducts('NUECES', 'all').map(p => p.id), ['walnut']);
  assert.deepEqual(searchProducts('limón', 'fresh').map(p => p.id), ['lemon']);
  assert.deepEqual(searchProducts('walnut', 'dry').map(p => p.id), ['walnut']);
  assert.equal(searchProducts('', 'dry').length, 3);
  assert.equal(searchProducts('almond', 'fresh').length, 0);
  assert.equal(searchProducts('dragonfruit', 'all').length, 0);
});

test('language switches keep every page equivalent, including product pages and 404', () => {
  assert.equal(pathFor('home', 'en'), '/');
  assert.equal(pathFor('home', 'es'), '/es/');
  assert.equal(pathFor('product:walnut', 'es'), '/es/productos/nueces/');
  assert.equal(equivalentPath('/products/walnut/', 'es'), '/es/productos/nueces/');
  assert.equal(equivalentPath('/es/productos/cerezas/', 'en'), '/products/cherry/');
  assert.equal(equivalentPath('/es/catalogo/frutas-y-verduras/', 'en'), '/catalogue/fresh-produce/');
  assert.equal(equivalentPath('/es/404/', 'en'), '/404/');
  assert.throws(() => pathFor('product:unknown', 'en'), /Unknown/);
  assert.equal(allRoutes().length, 42);
  assert.equal(new Set(allRoutes().map(r => r.path)).size, 42);
  for (const route of allRoutes()) {
    const other = route.lang === 'en' ? 'es' : 'en';
    assert.equal(equivalentPath(equivalentPath(route.path, other), route.lang), route.path);
  }
});

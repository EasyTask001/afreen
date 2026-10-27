import test from 'node:test';
import assert from 'node:assert/strict';
import { validateQuote, parseSelection, serializeSelection, quoteSummary } from '../../.build/lib/quote.js';

const valid = { company: 'Almacén Sur', name: 'Ana Pérez', email: 'ana@example.org', message: 'Need packing information.', consent: true, items: [{ id: 'walnut', quantity: '25', unit: 'kg' }] };

for (const email of ['x<@example.org', 'buyer@example..org', 'buyer@-example.org']) {
  test(`malformed retailer email is rejected: ${email}`, () => {
    assert.equal(validateQuote({ ...valid, email }).email, true);
    assert.throws(() => quoteSummary({ ...valid, email }, 'en'), /Invalid quote/);
  });
}

test('retailer emails support plus tags, subdomains and apostrophes', () => {
  for (const email of ['buyer@example.org', 'orders+fresh@example.cl', 'buyer@retail.example.co.cl', "o'connor@example.org", "o'connor+orders@retail.example.cl"]) {
    assert.deepEqual(validateQuote({ ...valid, email }), {}, email);
    assert.ok(quoteSummary({ ...valid, email }, 'en').includes(`Email: ${email}`));
  }
});

test('a usable enquiry requires contact details, selected products, positive quantities and consent', () => {
  assert.deepEqual(validateQuote(valid), {});
  assert.deepEqual(Object.keys(validateQuote({ company: ' ', name: '', email: 'invalid', message: '', consent: false, items: [] })).sort(), ['company', 'consent', 'email', 'items', 'message', 'name']);
  for (const quantity of ['', '0', '-2', 'Infinity', 'NaN', '1e3', '0x10', '1000000000']) {
    assert.ok(validateQuote({ ...valid, items: [{ id: 'walnut', quantity, unit: 'kg' }] }).items, quantity);
  }
  assert.ok(validateQuote({ ...valid, items: [{ id: 'unknown', quantity: '1', unit: 'kg' }] }).items);
  assert.ok(validateQuote({ ...valid, items: [{ id: 'walnut', quantity: '1', unit: 'pallets' }] }).items);
  assert.ok(validateQuote({ ...valid, items: [...valid.items, ...valid.items] }).items);
  assert.ok(validateQuote({ ...valid, name: 'A'.repeat(121) }).name);
  assert.deepEqual(validateQuote({ ...valid, items: [{ id: 'orange', quantity: '0.5', unit: 'kg' }] }), {});
  assert.deepEqual(validateQuote({ ...valid, items: [{ id: 'orange', quantity: '0,5', unit: 'kg' }] }), {});
  assert.ok(validateQuote({ ...valid, items: [{ id: 'orange', quantity: '0.5', unit: 'boxes' }] }).items);
});

test('only known unique product IDs survive storage, including corrupt or malicious storage', () => {
  assert.deepEqual(parseSelection('{bad'), []);
  assert.deepEqual(parseSelection(JSON.stringify({ email: 'secret@example.org' })), []);
  assert.deepEqual(parseSelection('["walnut","walnut","unknown","orange",12]'), ['walnut', 'orange']);
  assert.equal(serializeSelection([{ id: 'walnut', email: 'secret@example.org' }, 'orange', 'orange']), '["orange"]');
  assert.equal(serializeSelection(['walnut', 'cherry']), '["walnut","cherry"]');
});

test('downloaded and copied summaries contain actual line items and honest local-only outcomes in both languages', () => {
  const en = quoteSummary(valid, 'en');
  assert.match(en, /Walnut: 25 kg/);
  assert.match(en, /Almacén Sur/);
  assert.match(en, /ana@example.org/);
  assert.match(en, /Nothing has been sent/);
  assert.doesNotMatch(en, /test@example.com|202-555/);
  const es = quoteSummary(valid, 'es');
  assert.match(es, /Nueces: 25 kg/);
  assert.match(es, /No se ha enviado/);
  assert.match(quoteSummary({ ...valid, items: [{ id: 'walnut', quantity: '0,5', unit: 'kg' }] }, 'es'), /Nueces: 0,5 kg/);
  assert.throws(() => quoteSummary({ ...valid, consent: false }, 'en'), /Invalid/);
  const unsafe = quoteSummary({ ...valid, message: '<img src=x onerror=alert(1)>' }, 'en');
  assert.match(unsafe, /<img/); // Plain text: the browser must render with textContent, covered in E2E.
});

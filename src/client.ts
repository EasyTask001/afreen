import { products, searchProducts, type Category, type Lang } from './data/catalog.js';
import { selectionKey, parseSelection, serializeSelection, validateQuote, quoteSummary, type Quote, type QuoteItem } from './lib/quote.js';

const lang: Lang = document.body.dataset.lang === 'es' ? 'es' : 'en';
const es = lang === 'es';
const text = (en: string, spanish: string) => es ? spanish : en;
const byId = <T extends HTMLElement>(id: string) => document.getElementById(id) as T | null;
const announce = (message: string) => { const status = byId('selection-status'); if (status) status.textContent = message; };
let selected: string[] = [];
try { selected = parseSelection(localStorage.getItem(selectionKey)); } catch { /* Storage can be disabled; the current page remains usable. */ }

// A disclosure navigation: visible links without JS, keyboard operable with JS.
const menuButton = document.querySelector<HTMLButtonElement>('.menu-toggle');
const nav = byId('main-nav');
if (menuButton && nav) {
  const mobile = matchMedia('(max-width: 850px)');
  const setMenu = (open: boolean) => {
    menuButton.setAttribute('aria-expanded', String(open));
    if (mobile.matches) nav.dataset.mobileOpen = String(open);
    else delete nav.dataset.mobileOpen;
  };
  menuButton.hidden = false;
  setMenu(false);
  menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
  mobile.addEventListener('change', () => setMenu(false));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && mobile.matches && menuButton.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      menuButton.focus();
    }
  });
}

const quoteForm = byId<HTMLFormElement>('quote-form');
const quoteResult = byId('quote-result');
const summaryField = byId<HTMLTextAreaElement>('quote-summary');
const actionStatus = byId('quote-action-status');
const selectedContainer = byId('selected-products');
function invalidateSummary(): void {
  if (quoteResult) quoteResult.hidden = true;
  if (summaryField) summaryField.value = '';
  if (actionStatus) actionStatus.textContent = '';
}

function currentItems(): QuoteItem[] {
  return selected.map(id => ({
    id,
    quantity: byId<HTMLInputElement>(`quantity-${id}`)?.value ?? '',
    unit: byId<HTMLSelectElement>(`unit-${id}`)?.value ?? 'kg',
  }));
}

function renderSelection(): void {
  document.querySelectorAll<HTMLElement>('[data-quote-count]').forEach(count => {
    count.hidden = selected.length === 0;
    count.textContent = String(selected.length);
    count.setAttribute('aria-label', text(`${selected.length} selected products`, `${selected.length} productos seleccionados`));
  });
  document.querySelectorAll<HTMLButtonElement>('[data-add]').forEach(button => {
    const product = products.find(p => p.id === button.dataset.add);
    if (!product) return;
    const active = selected.includes(product.id), name = product[lang].name;
    button.hidden = false;
    button.setAttribute('aria-pressed', String(active));
    const label = button.querySelector('[data-add-label]');
    if (label) {
      label.textContent = active ? text('Remove from my quote', 'Quitar de mi cotización') : text('Add to my quote', 'Agregar a mi cotización');
      button.setAttribute('aria-label', `${label.textContent}: ${name}`);
    } else {
      button.setAttribute('aria-label', active ? text(`Remove ${name} from quote`, `Quitar ${name} de la cotización`) : text(`Add ${name} to quote`, `Agregar ${name} a la cotización`));
    }
  });
  document.querySelectorAll<HTMLInputElement>('[data-choose-product]').forEach(input => { input.checked = selected.includes(input.value); });
  if (!selectedContainer) return;
  const prior = new Map(currentItems().map(item => [item.id, item]));
  selectedContainer.replaceChildren();
  if (!selected.length) {
    const empty = document.createElement('p');
    empty.className = 'selection-empty';
    empty.textContent = text('Your selection is empty.', 'Tu selección está vacía.');
    selectedContainer.append(empty);
    return;
  }
  for (const id of selected) {
    const product = products.find(p => p.id === id)!;
    const name = product[lang].name;
    const row = document.createElement('div');
    row.className = 'selected-product';
    row.dataset.selectedId = id;
    const identity = document.createElement('div');
    const image = document.createElement('img');
    image.src = `/images/${id}.webp`;
    image.alt = '';
    image.width = image.height = 48;
    const heading = document.createElement('p');
    heading.className = 'selected-product-name';
    heading.textContent = name;
    identity.append(image, heading);
    const quantityGroup = document.createElement('div');
    const quantityLabel = document.createElement('label');
    quantityLabel.htmlFor = `quantity-${id}`;
    quantityLabel.textContent = text('Quantity', 'Cantidad');
    const quantity = document.createElement('input');
    quantity.id = `quantity-${id}`;
    quantity.name = `quantity-${id}`;
    quantity.type = 'text';
    quantity.inputMode = 'decimal';
    quantity.required = true;
    quantity.maxLength = 10;
    quantity.setAttribute('aria-label', text(`Quantity for ${name}`, `Cantidad de ${name}`));
    quantity.setAttribute('aria-describedby', 'error-items');
    quantity.value = prior.get(id)?.quantity ?? '';
    quantityGroup.append(quantityLabel, quantity);
    const unitGroup = document.createElement('div');
    const unitLabel = document.createElement('label');
    unitLabel.htmlFor = `unit-${id}`;
    unitLabel.textContent = text('Unit', 'Unidad');
    const unit = document.createElement('select');
    unit.id = `unit-${id}`;
    unit.name = `unit-${id}`;
    unit.setAttribute('aria-label', text(`Unit for ${name}`, `Unidad de ${name}`));
    unit.setAttribute('aria-describedby', 'error-items');
    for (const [value, label] of [['kg', 'kg'], ['boxes', text('Boxes', 'Cajas')]]) {
      const option = document.createElement('option');
      option.value = value!;
      option.textContent = label!;
      unit.append(option);
    }
    unit.value = prior.get(id)?.unit ?? 'kg';
    unitGroup.append(unitLabel, unit);
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'remove-product';
    remove.textContent = '×';
    remove.setAttribute('aria-label', text(`Remove ${name}`, `Quitar ${name}`));
    remove.addEventListener('click', () => {
      const index = selected.indexOf(id);
      updateSelection(selected.filter(item => item !== id), text(`${name} removed from your quote.`, `${name}: eliminado de tu cotización.`));
      const next = selectedContainer.querySelectorAll<HTMLButtonElement>('.remove-product')[Math.min(index, selected.length - 1)];
      if (next) next.focus();
      else selectedContainer.focus();
    });
    row.append(identity, quantityGroup, unitGroup, remove);
    selectedContainer.append(row);
  }
}

function updateSelection(ids: string[], message: string): void {
  selected = parseSelection(serializeSelection(ids));
  invalidateSummary();
  let persisted = true;
  try {
    if (selected.length) localStorage.setItem(selectionKey, serializeSelection(selected));
    else localStorage.removeItem(selectionKey);
  } catch { persisted = false; }
  renderSelection();
  announce(message + (persisted ? '' : text(' Browser storage is unavailable; keep this page open.', ' El almacenamiento no está disponible; mantén esta página abierta.')));
}

document.querySelectorAll<HTMLButtonElement>('[data-add]').forEach(button => {
  button.addEventListener('click', () => {
    const id = button.dataset.add!;
    const active = selected.includes(id), name = products.find(p => p.id === id)![lang].name;
    updateSelection(active ? selected.filter(item => item !== id) : [...selected, id], active ? text(`${name} removed from your quote.`, `${name}: eliminado de tu cotización.`) : text(`${name} added to your quote.`, `${name}: agregado a tu cotización.`));
  });
});
document.querySelectorAll<HTMLInputElement>('[data-choose-product]').forEach(input => {
  input.addEventListener('change', () => updateSelection(input.checked ? [...selected, input.value] : selected.filter(id => id !== input.value), text('Product selection updated.', 'Selección de productos actualizada.')));
});
document.querySelectorAll<HTMLElement>('[data-product-picker]').forEach(picker => { picker.hidden = false; });
renderSelection();

const catalogue = document.querySelector<HTMLElement>('[data-catalogue]');
const search = byId<HTMLInputElement>('product-search');
if (catalogue && search) {
  const box = document.querySelector<HTMLElement>('[data-search-box]');
  if (box) box.hidden = false;
  const filter = () => {
    const matches = searchProducts(search.value, catalogue.dataset.category as Category | 'all');
    document.querySelectorAll<HTMLElement>('[data-product-card]').forEach(card => { card.hidden = !matches.some(p => p.id === card.dataset.id); });
    const results = document.querySelector('[data-results]');
    if (results) results.textContent = text(`${matches.length} ${matches.length === 1 ? 'product' : 'products'}`, `${matches.length} ${matches.length === 1 ? 'producto' : 'productos'}`);
    const empty = document.querySelector<HTMLElement>('[data-empty]');
    if (empty) empty.hidden = matches.length !== 0;
  };
  search.addEventListener('input', filter);
  document.querySelector('[data-clear-search]')?.addEventListener('click', () => { search.value = ''; filter(); search.focus(); });
}

if (quoteForm && quoteResult && summaryField) {
  const prepare = byId<HTMLButtonElement>('prepare-quote');
  if (prepare) prepare.disabled = false;
  quoteForm.addEventListener('input', invalidateSummary);
  quoteForm.addEventListener('change', invalidateSummary);
  quoteForm.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(quoteForm);
    const quote: Quote = {
      company: String(data.get('company') ?? ''), name: String(data.get('name') ?? ''),
      email: String(data.get('email') ?? ''), message: String(data.get('message') ?? ''),
      consent: data.get('consent') === 'on', items: currentItems(),
    };
    const errors = validateQuote(quote);
    if (byId<HTMLInputElement>('email')?.validity.typeMismatch) errors.email = true;
    const errorSummary = byId('form-errors')!;
    const links = document.querySelector('[data-error-links]')!;
    links.replaceChildren();
    quoteForm.querySelectorAll<HTMLElement>('[data-error]').forEach(error => {
      const field = error.dataset.error as keyof Quote;
      const invalid = Boolean(errors[field]);
      error.hidden = !invalid;
      const input = byId(field === 'items' ? 'selected-products' : field);
      if (input) {
        if (invalid) input.setAttribute('aria-invalid', 'true');
        else input.removeAttribute('aria-invalid');
      }
      if (field === 'items') selectedContainer?.querySelectorAll('input,select').forEach(control => {
        if (invalid) control.setAttribute('aria-invalid', 'true');
        else control.removeAttribute('aria-invalid');
      });
      if (invalid) {
        const item = document.createElement('li');
        const link = document.createElement('a');
        link.href = `#${field === 'items' ? 'selected-products' : field}`;
        link.textContent = error.textContent;
        item.append(link); links.append(item);
      }
    });
    if (Object.keys(errors).length) {
      invalidateSummary();
      errorSummary.hidden = false;
      errorSummary.focus();
      return;
    }
    errorSummary.hidden = true;
    summaryField.value = quoteSummary(quote, lang);
    quoteResult.hidden = false;
    quoteResult.focus();
  });
  byId('copy-quote')?.addEventListener('click', async () => {
    if (!summaryField.value || !actionStatus) return;
    try {
      await navigator.clipboard.writeText(summaryField.value);
      actionStatus.textContent = text('Copied to your clipboard. Nothing has been sent.', 'Copiado al portapapeles. No se ha enviado nada.');
    } catch {
      summaryField.focus(); summaryField.select();
      actionStatus.textContent = text('Clipboard unavailable. The summary is selected; copy it manually or download the file. Nothing has been sent.', 'Portapapeles no disponible. El resumen está seleccionado; cópialo manualmente o descarga el archivo. No se ha enviado nada.');
    }
  });
  byId('download-quote')?.addEventListener('click', () => {
    if (!summaryField.value || !actionStatus) return;
    const url = URL.createObjectURL(new Blob([summaryField.value], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url; link.download = `afreen-quote-${lang}.txt`;
    document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    actionStatus.textContent = text('Download started. Nothing has been sent.', 'Descarga iniciada. No se ha enviado nada.');
  });
}

const demoButton = byId<HTMLButtonElement>('demo-whatsapp');
if (demoButton) {
  demoButton.hidden = false;
  demoButton.addEventListener('click', () => {
    const outcome = byId('demo-outcome')!;
    outcome.hidden = false;
    outcome.textContent = text('Simulation complete. Nothing has been sent and WhatsApp has not been opened. Confirm a real Afreen contact before sharing your request.', 'Simulación completada. No se ha enviado nada ni se ha abierto WhatsApp. Confirma un contacto real de Afreen antes de compartir tu solicitud.');
  });
}

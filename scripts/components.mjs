import { categories } from '../.build/data/catalog.js';
import { contact } from '../.build/data/contact.js';
import { pathFor } from '../.build/lib/routes.js';

export const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
export const arrow = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 12h15M13 5l7 7-7 7"/></svg>';
export const plus = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
export const leaf = '<svg class="brand-leaf" viewBox="0 0 32 32" width="24" height="24" fill="none" aria-hidden="true"><path d="M7 25C4 9 18 5 27 5c0 13-5 23-20 20Z" stroke="currentColor" stroke-width="1.5"/><path d="M4 29 22 11" stroke="currentColor" stroke-width="1.5"/></svg>';
export const wordmark = `<span class="wordmark">afreen<span class="wordmark-dot">.</span>${leaf}</span>`;
export function buttonLink(label, href, secondary = false) {
  return `<a class="button${secondary ? ' button-outline' : ''}" href="${href}">${esc(label)}${arrow}</a>`;
}
export function photo(id, alt, { hero = false, className = '', eager = false } = {}) {
  return `<img class="${className}" src="/images/${id}.webp" srcset="/images/${id}-480.webp 480w, /images/${id}-768.webp 768w, /images/${id}.webp 1024w" alt="${esc(alt)}" width="1024" height="${hero ? 576 : 1024}" sizes="${hero ? '(max-width: 600px) 100vw, 55vw' : '(max-width: 600px) 90vw, (max-width: 1000px) 45vw, 30vw'}" loading="${eager ? 'eager' : 'lazy'}" ${eager ? 'fetchpriority="high"' : ''} decoding="async">`;
}
export function productCard(product, lang, level = 3) {
  const es = lang === 'es', copy = product[lang];
  return `<article class="product-card" data-product-card data-id="${product.id}">
    <a class="product-photo" href="${pathFor(`product:${product.id}`, lang)}">${photo(product.id, copy.alt)}<span class="photo-link">${arrow}<span class="sr-only">${es ? 'Ver' : 'View'} ${esc(copy.name)}</span></span></a>
    <div class="product-card-body"><span class="eyebrow">${esc(categories[product.category][lang])}</span>
    <div class="product-title-row"><h${level}><a href="${pathFor(`product:${product.id}`, lang)}">${esc(copy.name)}</a></h${level}><button type="button" class="add-product" data-add="${product.id}" aria-label="${es ? 'Agregar' : 'Add'} ${esc(copy.name)} ${es ? 'a la cotización' : 'to quote'}" aria-pressed="false" hidden>${plus}</button></div>
    <p>${esc(copy.note)}</p></div>
  </article>`;
}
export function breadcrumbs(key, lang, name, product) {
  if (key === 'home') return [];
  const es = lang === 'es';
  const crumbs = [{ label: es ? 'Inicio' : 'Home', path: pathFor('home', lang) }];
  if (product || key === 'dry' || key === 'fresh') crumbs.push({ label: es ? 'Catálogo' : 'Catalogue', path: pathFor('catalogue', lang) });
  if (product) crumbs.push({ label: categories[product.category][lang], path: pathFor(product.category, lang) });
  crumbs.push({ label: name, path: pathFor(key, lang) });
  return crumbs;
}
export function breadcrumbHtml(crumbs, lang) {
  return crumbs.length ? `<nav class="breadcrumbs wrap" aria-label="${lang === 'es' ? 'Ruta de navegación' : 'Breadcrumb'}"><ol>${crumbs.map((c, i) => `<li>${i === crumbs.length - 1 ? `<span aria-current="page">${esc(c.label)}</span>` : `<a href="${c.path}">${esc(c.label)}</a>`}</li>`).join('')}</ol></nav>` : '';
}
export function ctaBand(lang) {
  const es = lang === 'es';
  return `<section class="cta-band wrap"><div><p class="eyebrow">${es ? 'PENSEMOS EN TU PRÓXIMA COMPRA' : 'LET’S PLAN YOUR NEXT ORDER'}</p><h2>${es ? 'Tu surtido empieza<br>con una conversación.' : 'A better-stocked store<br>starts with a conversation.'}</h2></div><div><p>${es ? 'Elige tus productos y prepara una solicitud con lo que tu negocio necesita.' : 'Choose your products and put together a request around what your business needs.'}</p>${buttonLink(es ? 'Preparar cotización' : 'Build your quote', pathFor('contact', lang))}<small>${es ? 'Demo local: no se envían solicitudes.' : 'Local demo: requests are not sent.'}</small></div></section>`;
}
export function demoNotice(lang) {
  return `<div class="demo-notice"><span class="status-dot" aria-hidden="true"></span><p>${lang === 'es' ? '<strong>Modo demo.</strong> Prepara, copia o descarga tu solicitud. No se envía a Afreen.' : '<strong>Demo mode.</strong> Prepare, copy or download your request. It is not sent to Afreen.'}</p></div>`;
}
export function addressBlock(lang) {
  return `<address><span>${esc(contact.address)}</span><span>Maria Pinto, Chile</span></address><p class="small muted">${lang === 'es' ? 'La dirección y las condiciones de atención deben confirmarse antes de coordinar una visita.' : 'The address and visiting arrangements must be confirmed before planning a visit.'}</p>`;
}

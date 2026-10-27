import { contact } from '../.build/data/contact.js';
import { pathFor } from '../.build/lib/routes.js';
import { esc, wordmark, arrow, breadcrumbHtml } from './components.mjs';

export function layout({ key, lang, title, description, body, crumbs = [], product }) {
  const es = lang === 'es';
  const path = pathFor(key, lang), canonical = contact.site + path;
  const image = `${contact.site}/images/${product?.id ?? 'hero'}.webp`;
  const org = { '@context': 'https://schema.org', '@type': 'Organization', '@id': `${contact.site}/#organization`, name: 'Afreen', url: contact.site,
    description: es ? 'Frutas, verduras y frutos secos al por mayor para comerciantes en Chile.' : 'Wholesale fresh produce and dry fruits for retailers in Chile.',
    address: { '@type': 'PostalAddress', streetAddress: contact.address, addressLocality: contact.locality, addressCountry: 'CL' } };
  const schemas = [org];
  if (crumbs.length && key !== '404') schemas.push({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.label, item: contact.site + c.path })) });
  if (product) schemas.push({ '@context': 'https://schema.org', '@type': 'Product', name: product[lang].name, description: product[lang].description, category: es ? (product.category === 'dry' ? 'Frutos secos' : 'Frutas y verduras') : (product.category === 'dry' ? 'Dry fruits & nuts' : 'Fresh produce'), image, url: canonical });
  const nav = [ ['catalogue', es ? 'Catálogo' : 'Catalogue'], ['about', es ? 'Nosotros' : 'Our story'], ['faq', es ? 'Preguntas frecuentes' : 'FAQ'] ];
  const active = target => target === key || (target === 'catalogue' && (product || key === 'dry' || key === 'fresh'));
  return `<!doctype html>
<html lang="${es ? 'es-CL' : 'en'}"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(description)}">
<meta name="robots" content="${key === '404' ? 'noindex, follow' : 'index, follow'}">
<link rel="canonical" href="${canonical}">
${[['en', 'en'], ['es-CL', 'es'], ['x-default', 'en']].map(([code, target]) => `<link rel="alternate" hreflang="${code}" href="${contact.site + pathFor(key, target)}">`).join('\n')}
<meta property="og:type" content="website"><meta property="og:site_name" content="Afreen"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${image}"><meta property="og:image:alt" content="${esc(product ? product[lang].alt : (es ? 'Surtido ilustrativo de frutas y frutos secos de Afreen' : 'Illustrative Afreen fresh produce and dry fruit assortment'))}"><meta property="og:locale" content="${es ? 'es_CL' : 'en_US'}"><meta property="og:locale:alternate" content="${es ? 'en_US' : 'es_CL'}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(description)}"><meta name="twitter:image" content="${image}">
<meta name="theme-color" content="#173d31"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/styles.css">
${schemas.map(s => `<script type="application/ld+json">${JSON.stringify(s).replace(/</g, '\\u003c')}</script>`).join('\n')}
<script type="module" src="/js/client.js"></script></head>
<body data-lang="${lang}"><a class="skip-link" href="#main">${es ? 'Saltar al contenido' : 'Skip to content'}</a>
<div class="topline"><div class="wrap"><span>${es ? 'FRUTAS Y FRUTOS SECOS · VENTA MAYORISTA' : 'FRESH PRODUCE & DRY FRUITS · WHOLESALE'}</span><span>MARIA PINTO, CHILE</span></div></div>
<header class="site-header"><div class="header-inner wrap"><a class="brand" href="${pathFor('home', lang)}" aria-label="${es ? 'Afreen, inicio' : 'Afreen home'}">${wordmark}</a>
<button class="menu-toggle" type="button" aria-expanded="false" aria-controls="main-nav" hidden><span>${es ? 'Menú' : 'Menu'}</span><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M3 7h18M3 12h18M3 17h18"/></svg></button>
<nav class="main-nav" id="main-nav" aria-label="${es ? 'Navegación principal' : 'Main navigation'}">${nav.map(([target, label]) => `<a href="${pathFor(target, lang)}" ${active(target) ? 'aria-current="page"' : ''}>${label}</a>`).join('')}<div class="language-switch" aria-label="${es ? 'Idioma' : 'Language'}"><a href="${pathFor(key, 'en')}" lang="en" hreflang="en" aria-label="English" ${!es ? 'aria-current="true"' : ''}>English</a><span aria-hidden="true">/</span><a href="${pathFor(key, 'es')}" lang="es-CL" hreflang="es-CL" aria-label="Español" ${es ? 'aria-current="true"' : ''}>Español</a></div><a class="header-quote" href="${pathFor('contact', lang)}">${es ? 'Cotizar' : 'Request a quote'} <span data-quote-count hidden>0</span>${arrow}</a></nav>
</div></header>
<main id="main" tabindex="-1">${breadcrumbHtml(crumbs, lang)}${body}</main>
<div class="selection-feedback sr-only" role="status" aria-live="polite" id="selection-status"></div>
<footer class="site-footer"><div class="footer-grid wrap"><div><a class="brand" href="${pathFor('home', lang)}" aria-label="${es ? 'Afreen, inicio' : 'Afreen home'}">${wordmark}</a><p>${es ? 'Frutas, verduras y frutos secos.<br>Un catálogo pensado para tu negocio.' : 'Fresh produce. Dry fruits & nuts.<br>A catalogue with your business in mind.'}</p><span class="footer-location">MARIA PINTO · CHILE</span></div><div><h2>${es ? 'Explora' : 'Explore'}</h2><a href="${pathFor('catalogue', lang)}">${es ? 'Todos los productos' : 'All products'}</a><a href="${pathFor('dry', lang)}">${es ? 'Frutos secos' : 'Dry fruits & nuts'}</a><a href="${pathFor('fresh', lang)}">${es ? 'Frutas y verduras' : 'Fresh produce'}</a><a href="${pathFor('about', lang)}">${es ? 'Sobre Afreen' : 'About Afreen'}</a></div><div><h2>${es ? 'Conversemos' : 'Let’s talk'}</h2><a href="${pathFor('contact', lang)}">${es ? 'Preparar una cotización' : 'Prepare a quote'}</a><a href="${pathFor('faq', lang)}">${es ? 'Preguntas frecuentes' : 'Frequently asked questions'}</a><address>${esc(contact.address)}<br>Maria Pinto, Chile</address></div></div>
<div class="footer-bottom wrap"><span>© ${new Date().getFullYear()} Afreen</span><a href="${pathFor('privacy', lang)}">${es ? 'Privacidad' : 'Privacy'}</a><p>${es ? 'Imágenes ilustrativas generadas con IA; no acreditan instalaciones ni stock real.' : 'AI-generated illustrative imagery; not evidence of actual facilities or stock.'}</p></div>
<div class="footer-demo wrap">${es ? 'Vista previa local · Contactos de prueba · No se envían solicitudes' : 'Local preview · Test contacts · Requests are not sent'}</div></footer>
</body></html>`;
}

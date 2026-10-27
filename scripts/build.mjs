import { mkdir, rm, cp, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { products } from '../.build/data/catalog.js';
import { allRoutes, pathFor } from '../.build/lib/routes.js';
import { contact } from '../.build/data/contact.js';
import { breadcrumbs } from './components.mjs';
import { layout } from './layout.mjs';
import { home } from './home.mjs';
import { catalogue, detail } from './catalogue.mjs';
import { contactPage } from './contact-page.mjs';
import { contentPage } from './content.mjs';

// Static HTML is generated once. No runtime server-side state or production calls.
const names = {
  home: { en: 'Home', es: 'Inicio' }, catalogue: { en: 'Catalogue', es: 'Catálogo' },
  dry: { en: 'Dry fruits & nuts', es: 'Frutos secos' }, fresh: { en: 'Fresh produce', es: 'Frutas y verduras' },
  about: { en: 'About Afreen', es: 'Sobre Afreen' }, contact: { en: 'Request a quote', es: 'Solicitar cotización' },
  faq: { en: 'Frequently asked questions', es: 'Preguntas frecuentes' }, privacy: { en: 'Privacy', es: 'Privacidad' }, '404': { en: 'Page not found', es: 'Página no encontrada' },
};
const metadata = {
  home: {
    en: ['Afreen | Wholesale fresh produce & dry fruits in Chile', 'Explore Afreen’s wholesale catalogue of fresh produce, walnuts, raisins and almonds for retailers in Chile. Prepare a local quote request around your store’s needs.'],
    es: ['Afreen | Frutas y frutos secos al por mayor en Chile', 'Conoce el catálogo mayorista de Afreen: frutas, verduras, nueces, pasas y almendras para comerciantes en Chile. Prepara una solicitud local para tu negocio.'],
  },
  catalogue: {
    en: ['Wholesale catalogue for retailers in Chile | Afreen', 'Browse all 12 products in the Afreen wholesale catalogue. Explore fresh produce and dry fruits, learn what to ask and prepare a request for your retail business.'],
    es: ['Catálogo mayorista para comerciantes en Chile | Afreen', 'Explora los 12 productos del catálogo mayorista de Afreen. Conoce frutas, verduras y frutos secos, revisa qué consultar y prepara una solicitud para tu negocio.'],
  },
  dry: {
    en: ['Wholesale dry fruits & nuts: walnuts, raisins, almonds | Afreen', 'Explore walnuts, raisins and almonds in Afreen’s wholesale dry-fruit catalogue for Chilean retailers. Learn about formats, handling and what to confirm in an enquiry.'],
    es: ['Frutos secos al por mayor: nueces, pasas y almendras | Afreen', 'Conoce las nueces, pasas y almendras del catálogo mayorista de Afreen para comerciantes en Chile. Revisa formatos, conservación y detalles que conviene consultar.'],
  },
  fresh: {
    en: ['Wholesale fresh produce for retailers in Chile | Afreen', 'Explore citrus, apples, grapes, avocados, beetroot and cherries in the Afreen fresh-produce catalogue. Varieties, packing and availability are confirmed per enquiry.'],
    es: ['Frutas y verduras al por mayor para comercios | Afreen', 'Explora cítricos, manzanas, uvas, paltas, betarragas y cerezas en el catálogo de Afreen. Variedades, envases y disponibilidad se confirman para cada consulta mayorista.'],
  },
  about: {
    en: ['About Afreen | A wholesale catalogue for Chilean retailers', 'Get to know Afreen’s wholesale catalogue of fresh produce and dry fruits for retailers in Chile, with listed locality Maria Pinto and details confirmed by enquiry.'],
    es: ['Sobre Afreen | Catálogo mayorista para comercios en Chile', 'Conoce el catálogo mayorista de frutas, verduras y frutos secos de Afreen para comerciantes en Chile, con localidad informada Maria Pinto y condiciones por consulta.'],
  },
  contact: {
    en: ['Prepare a wholesale quote request | Afreen local demo', 'Select products, add quantities and prepare a wholesale enquiry summary for Afreen. Copy or download locally; this demo does not send requests or use live contacts.'],
    es: ['Prepara una solicitud de cotización mayorista | Afreen demo', 'Selecciona productos, indica cantidades y prepara una consulta mayorista para Afreen. Copia o descarga un resumen local; esta demo no envía solicitudes ni usa contactos reales.'],
  },
  faq: {
    en: ['Wholesale catalogue & quote questions answered | Afreen', 'Find answers about Afreen’s products, wholesale enquiries, packing, availability, listed location and privacy. Understand how the local quote demonstration works.'],
    es: ['Preguntas sobre catálogo y cotizaciones mayoristas | Afreen', 'Resuelve tus dudas sobre productos, consultas mayoristas, envases, disponibilidad, ubicación informada y privacidad de Afreen. Conoce cómo funciona la cotización local.'],
  },
  privacy: {
    en: ['Privacy & local quote data | Afreen catalogue demo', 'Understand how Afreen’s local demo stores selected product IDs, handles form details in memory and creates copied or downloaded enquiry summaries at your request.'],
    es: ['Privacidad y datos de la cotización local | Afreen demo', 'Conoce cómo la demo local de Afreen guarda identificadores de productos, maneja los datos del formulario en memoria y crea resúmenes para copiar o descargar a tu solicitud.'],
  },
  '404': {
    en: ['Page not found | Return to the Afreen catalogue', 'This page is not part of the Afreen catalogue. Return to the homepage or explore the wholesale fresh-produce and dry-fruit assortment for retailers in Chile.'],
    es: ['Página no encontrada | Vuelve al catálogo de Afreen', 'Esta página no forma parte del catálogo de Afreen. Vuelve al inicio o explora el surtido mayorista de frutas, verduras y frutos secos para comerciantes en Chile.'],
  },
};

await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
await cp('public', 'dist', { recursive: true });
await cp('.build', 'dist/js', { recursive: true });
for (const { key, lang, path } of allRoutes()) {
  const product = key.startsWith('product:') ? products.find(p => p.id === key.slice(8)) : undefined;
  const name = product ? product[lang].name : names[key][lang];
  const [title, description] = product ? [lang === 'es' ? `${name} al por mayor para comercios | Afreen` : `Wholesale ${name.toLowerCase()} for retailers | Afreen`, product[lang].description] : metadata[key][lang];
  const body = product ? detail(lang, product) : key === 'home' ? home(lang) : ['catalogue', 'dry', 'fresh'].includes(key) ? catalogue(lang, key) : key === 'contact' ? contactPage(lang) : contentPage(lang, key);
  const html = layout({ key, lang, title, description, body, crumbs: breadcrumbs(key, lang, name, product), product });
  const dir = join('dist', path);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, 'index.html'), html);
}
await writeFile('dist/404.html', await (await import('node:fs/promises')).readFile('dist/404/index.html', 'utf8'));
const urls = allRoutes().filter(r => r.key !== '404').map(r => `<url><loc>${contact.site + pathFor(r.key, r.lang)}</loc></url>`).join('\n');
await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
await writeFile('dist/robots.txt', 'User-agent: *\nAllow: /\nDisallow: /404/\nDisallow: /es/404/\nSitemap: https://afreen.cl/sitemap.xml\n');
console.log('Built 42 localized static pages, 40 indexable canonical routes, sitemap and robots.txt.');

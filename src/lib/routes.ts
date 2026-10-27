import { products, type Lang } from '../data/catalog.js';

export type PageKey = 'home' | 'catalogue' | 'dry' | 'fresh' | 'about' | 'contact' | 'faq' | 'privacy' | '404' | `product:${string}`;
const pages: Record<Exclude<PageKey, `product:${string}`>, Record<Lang, string>> = {
  home: { en: '', es: '' },
  catalogue: { en: 'catalogue', es: 'catalogo' },
  dry: { en: 'catalogue/dry-fruits', es: 'catalogo/frutos-secos' },
  fresh: { en: 'catalogue/fresh-produce', es: 'catalogo/frutas-y-verduras' },
  about: { en: 'about', es: 'nosotros' },
  contact: { en: 'contact', es: 'contacto' },
  faq: { en: 'faq', es: 'preguntas-frecuentes' },
  privacy: { en: 'privacy', es: 'privacidad' },
  '404': { en: '404', es: '404' },
};

export function pathFor(key: PageKey, lang: Lang): string {
  const prefix = lang === 'es' ? '/es/' : '/';
  if (key.startsWith('product:')) {
    const product = products.find(p => p.id === key.slice(8));
    if (!product) throw new Error(`Unknown product: ${key}`);
    return `${prefix}${lang === 'es' ? 'productos' : 'products'}/${product[lang].slug}/`;
  }
  const slug = pages[key as keyof typeof pages]?.[lang];
  if (slug === undefined) throw new Error(`Unknown page: ${key}`);
  return `${prefix}${slug}${slug ? '/' : ''}`;
}

export function allRoutes(): { key: PageKey; lang: Lang; path: string }[] {
  const keys: PageKey[] = [...Object.keys(pages) as PageKey[], ...products.map(p => `product:${p.id}` as const)];
  return (['en', 'es'] as const).flatMap(lang => keys.map(key => ({ key, lang, path: pathFor(key, lang) })));
}

export function equivalentPath(path: string, lang: Lang): string {
  const route = allRoutes().find(r => r.path === path);
  return pathFor(route?.key ?? '404', lang);
}

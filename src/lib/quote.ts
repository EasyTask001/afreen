import { products, type Lang } from '../data/catalog.js';

export const selectionKey = 'afreen:products:v1';
export const units = ['kg', 'boxes'] as const;
export interface QuoteItem { id: string; quantity: string; unit: string }
export interface Quote {
  company: string;
  name: string;
  email: string;
  message: string;
  consent: boolean;
  items: QuoteItem[];
}
export type QuoteErrors = Partial<Record<keyof Quote, true>>;
const decimal = (value: string) => value.trim().replace(',', '.');
const emailAddress = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;

export function parseSelection(raw: string | null): string[] {
  try {
    const parsed: unknown = JSON.parse(raw ?? '[]');
    if (!Array.isArray(parsed)) return [];
    return [...new Set(parsed.filter((id): id is string => typeof id === 'string' && products.some(p => p.id === id)))];
  } catch {
    return [];
  }
}

export function serializeSelection(ids: unknown[]): string {
  return JSON.stringify(parseSelection(JSON.stringify(ids)));
}

export function validateQuote(quote: Quote): QuoteErrors {
  const errors: QuoteErrors = {};
  if (!quote.company.trim() || quote.company.length > 160) errors.company = true;
  if (!quote.name.trim() || quote.name.length > 120) errors.name = true;
  if (quote.email.length > 254 || !emailAddress.test(quote.email.trim())) errors.email = true;
  if (!quote.message.trim() || quote.message.length > 3000) errors.message = true;
  if (!quote.consent) errors.consent = true;
  if (!quote.items.length || new Set(quote.items.map(i => i.id)).size !== quote.items.length || quote.items.some(item => {
    const quantity = decimal(item.quantity);
    const amount = Number(quantity);
    return !products.some(p => p.id === item.id) || !/^\d+(\.\d{1,3})?$/.test(quantity) ||
      !Number.isFinite(amount) || amount <= 0 || amount > 999999 ||
      !units.includes(item.unit as typeof units[number]) || (item.unit === 'boxes' && !Number.isInteger(amount));
  })) errors.items = true;
  return errors;
}

export function quoteSummary(quote: Quote, lang: Lang): string {
  if (Object.keys(validateQuote(quote)).length) throw new Error('Invalid quote');
  const es = lang === 'es';
  const lines = quote.items.map(item => {
    const product = products.find(p => p.id === item.id)!;
    const quantity = es ? decimal(item.quantity).replace('.', ',') : decimal(item.quantity);
    return `- ${product[lang].name}: ${quantity} ${item.unit === 'boxes' ? (es ? 'cajas' : 'boxes') : 'kg'}`;
  });
  return [
    es ? 'AFREEN — Solicitud de cotización (demo local)' : 'AFREEN — Quote request (local demo)',
    es ? 'No se ha enviado esta solicitud. Confirma un contacto real de Afreen antes de compartirla.' : 'Nothing has been sent. Confirm a real Afreen contact before sharing this request.',
    '',
    `${es ? 'Empresa' : 'Company'}: ${quote.company.trim()}`,
    `${es ? 'Nombre' : 'Name'}: ${quote.name.trim()}`,
    `Email: ${quote.email.trim()}`,
    '', es ? 'Productos solicitados:' : 'Requested products:', ...lines,
    '', `${es ? 'Mensaje' : 'Message'}: ${quote.message.trim()}`,
    '', es ? 'Consentimiento para preparar este resumen local: sí.' : 'Consent to prepare this local summary: yes.',
    es ? 'Disponibilidad, envases, cantidades, precios y condiciones por confirmar.' : 'Availability, packing, quantities, pricing and terms to be confirmed.',
  ].join('\n');
}

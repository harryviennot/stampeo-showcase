import { MARKETS, type Market } from "@/lib/markets";

/** A copy template with its `{token}`s filled in; a token with no value stays as written. */
export function fill(template: string, values: Readonly<Record<string, string | number>>): string {
  return template.replace(/\{(\w+)\}/g, (token, name: string) => (name in values ? String(values[name]) : token));
}

/** A whole number as `locale` writes it (`2,770` in English, `2 770` in French). */
export function formatCount(locale: string, count: number): string {
  return count.toLocaleString(locale);
}

/** A sample amount of money as `locale` writes it in the currency `market` bills in (`$14.00`, `14,00 €`). */
export function formatSampleMoney(locale: string, market: Market, amount: number, cents = false): string {
  return amount.toLocaleString(locale, {
    style: "currency",
    currency: MARKETS[market].currency.code,
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: cents ? 2 : 0,
  });
}

/** A list as a sentence reads it: `a, b and c`, with `and` in the page's language (none of the four languages writes a comma before it). */
export function listAnd(items: readonly string[], and: string): string {
  if (items.length < 2) return items.join("");
  return `${items.slice(0, -1).join(", ")} ${and} ${items[items.length - 1]}`;
}

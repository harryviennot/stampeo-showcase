import type { Market } from "../types";

/** A no-break space: French typography puts one before « : ; ? ! » and between a number and its unit. */
export const NBSP = "\u00a0";

/** The language each comparison market is written in. */
export const MARKET_LOCALE: Record<Market, string> = { us: "en", fr: "fr" };

/** `2026-10-05` as "October 5, 2026" or "5 octobre 2026": the day written, whatever the server's time zone. */
export function formatDate(isoDate: string, market: Market): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Intl.DateTimeFormat(MARKET_LOCALE[market], { dateStyle: "long", timeZone: "UTC" }).format(
    new Date(Date.UTC(year, month - 1, day)),
  );
}

/** The host of a URL without `www.`: what a source line shows instead of the address. */
export function domainOf(url: string): string {
  return new URL(url).hostname.replace(/^www\./, "");
}

/** "English, Spanish, French and Polish": the market's own language first, the others by code, each named in the market's language. */
export function languageList(market: Market, codes: readonly string[], and: string): string {
  const locale = MARKET_LOCALE[market];
  const language = new Intl.DisplayNames(locale, { type: "language" });
  const names = [...codes]
    .sort((a, b) => (a === locale ? -1 : b === locale ? 1 : a.localeCompare(b)))
    .map((code) => language.of(code) ?? code);
  const list = names.length > 1 ? `${names.slice(0, -1).join(", ")} ${and} ${names[names.length - 1]}` : names.join("");
  return list.charAt(0).toUpperCase() + list.slice(1);
}

/** The anchor of a heading: what the MDX pipeline's own headings get, so a component's heading is linkable the same way. */
export function headingId(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}\p{Pc}\- ]/gu, "")
    .replace(/ /g, "-");
}

/** A label without the colon that introduced what follows it, in English ("Stampeo:") or French ("Stampeo :"). */
export const withoutTrailingColon = (label: string) => label.replace(/[\s\u00a0\u202f]*:\s*$/, "");

/** A lead-in without its closing full stop, for when it is drawn as a title. */
export const withoutTrailingPeriod = (lead: string) => lead.replace(/\.\s*$/, "");

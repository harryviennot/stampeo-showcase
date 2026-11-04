import type { Market } from "../types";

const LOCALE: Record<Market, string> = { us: "en-US", fr: "fr-FR" };

/** `2026-10-05` as "October 5, 2026" or "5 octobre 2026": the day written, whatever the server's time zone. */
export function formatDate(isoDate: string, market: Market): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Intl.DateTimeFormat(LOCALE[market], { dateStyle: "long", timeZone: "UTC" }).format(
    new Date(Date.UTC(year, month - 1, day)),
  );
}

/** The host of a URL without `www.`: what a source line shows instead of the address. */
export function domainOf(url: string): string {
  return new URL(url).hostname.replace(/^www\./, "");
}

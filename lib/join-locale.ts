/** The language of the /join page: the NEXT_LOCALE cookie when it names one we ship, else French. */
export type JoinLocale = "en" | "fr" | "es" | "pl";

const LOCALES: readonly JoinLocale[] = ["en", "fr", "es", "pl"];

export function joinLocale(cookieValue: string | undefined): JoinLocale {
  return LOCALES.includes(cookieValue as JoinLocale) ? (cookieValue as JoinLocale) : "fr";
}

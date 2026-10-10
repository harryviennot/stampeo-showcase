import { routing } from "@/i18n/routing";
import { indexablePilotLanguages } from "@/lib/markets";

/**
 * hreflang helpers.
 *
 * Every page used to hand-write its `alternates.languages` map, which meant a
 * new locale had to be added page by page (and Spanish was missed on several).
 * These build the map from `routing.locales` instead, so the next locale is a
 * one-line change in `i18n/routing.ts`.
 */

/** Absolute-ish path for a locale — the default locale stays unprefixed. */
export function localePath(locale: string, path: string): string {
  const clean = path === "/" ? "" : path;
  if (locale === routing.defaultLocale) return clean || "/";
  return `/${locale}${clean}`;
}

interface AlternatesOptions {
  /** Locale-specific paths for pages whose slug differs per language. */
  overrides?: Partial<Record<string, string>>;
  /** Restrict the map to a subset of locales (e.g. the ones that have a blog). */
  locales?: readonly string[];
  /** Prefix every entry with an origin (some pages emit absolute URLs). */
  baseUrl?: string;
}

/** The locale `x-default` points at: most organic visitors read English. */
const X_DEFAULT_LOCALE = "en";

/**
 * hreflang map for one page: `x-default` plus one entry per locale.
 * `x-default` points at the English URL.
 */
export function localeAlternates(
  path: string,
  { overrides = {}, locales = routing.locales, baseUrl = "" }: AlternatesOptions = {}
): Record<string, string> {
  const url = (locale: string) =>
    `${baseUrl}${localePath(locale, overrides[locale] ?? path)}`;

  const languages: Record<string, string> = {
    "x-default": url(X_DEFAULT_LOCALE),
  };
  for (const locale of locales) languages[locale] = url(locale);
  return languages;
}

/**
 * hreflang map for a page that also exists inside the country pilots
 * (the homepage and /pricing): every locale, plus each indexable pilot's
 * version of the same page, e.g. `en-US -> /us/pricing`.
 */
export function marketAlternates(
  path: string,
  { baseUrl = "" }: Pick<AlternatesOptions, "baseUrl"> = {}
): Record<string, string> {
  const pilots = Object.entries(indexablePilotLanguages(path)).map(
    ([hreflang, pilotPath]) => [hreflang, `${baseUrl}${pilotPath}`]
  );
  return { ...localeAlternates(path, { baseUrl }), ...Object.fromEntries(pilots) };
}

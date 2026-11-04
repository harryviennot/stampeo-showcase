/**
 * Pages that exist in one language only: switching language there would land
 * on a 404. Takes the locale-stripped path, as `usePathname` from
 * `@/i18n/navigation` gives it.
 */
const SINGLE_LANGUAGE_PAGES = /^\/(?:blog|comparatif|us\/vs)\/.+/;

export function hidesLanguageSwitcher(pathname: string): boolean {
  return SINGLE_LANGUAGE_PAGES.test(pathname);
}

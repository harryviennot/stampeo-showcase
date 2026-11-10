/**
 * Blog posts (slug differs per language) and comparison pages (one language)
 * would 404 on a switch. Takes the locale-stripped path, as `usePathname` from
 * `@/i18n/navigation` gives it.
 */
const SINGLE_LANGUAGE_PAGES = /^\/(?:blog|comparatif|us\/vs)\/.+/;

export function hidesLanguageSwitcher(pathname: string): boolean {
  return SINGLE_LANGUAGE_PAGES.test(pathname);
}

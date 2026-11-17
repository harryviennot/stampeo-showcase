/**
 * Blog posts (slug differs per language) and comparison pages (one language)
 * would 404 on a switch. Takes the locale-stripped path, as `usePathname` from
 * `@/i18n/navigation` gives it.
 */
const SINGLE_LANGUAGE_PAGES = /^\/(?:blog|comparatif|us\/vs)\/.+/;

export function hidesLanguageSwitcher(pathname: string): boolean {
  return SINGLE_LANGUAGE_PAGES.test(pathname);
}

/** The part of the router a language switch uses. */
export interface LocaleRouter {
  replace(pathname: string, options: { locale: string }): void;
}

/** What picking a language does: the same page in that language, replacing this one in the history. */
export const switchLanguage = (router: LocaleRouter, pathname: string) => (locale: string) => router.replace(pathname, { locale });

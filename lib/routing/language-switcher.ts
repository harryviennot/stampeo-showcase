import { isHelpPath } from "../help/config";

/**
 * Pages with nothing to switch to: a blog post has a different slug per
 * language, and the help center is English only. Takes the locale-stripped
 * pathname that `usePathname` from `@/i18n/navigation` returns.
 */
export function hidesLanguageSwitcher(pathname: string): boolean {
  return /^\/blog\/.+/.test(pathname) || isHelpPath(pathname);
}

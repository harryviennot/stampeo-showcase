import { routing } from "@/i18n/routing";
import { localePath } from "@/lib/hreflang";
import { MARKETS, type Market } from "@/lib/markets";

/**
 * The segment the earlier versions of the homepage, the feature pages and the loyalty programs page live under.
 * They are reachable by URL and listed nowhere: no sitemap, no `llms.txt`, no hreflang cluster, no menu.
 */
export const LEGACY_SEGMENT = "legacy";

/**
 * A legacy page's path in a locale: `legacyPath("en")` is `/en/legacy`, and
 * `legacyPath("fr", "/features/design-de-carte")` is `/legacy/features/design-de-carte`.
 */
export function legacyPath(locale: string, path = "/"): string {
  return localePath(locale, `/${LEGACY_SEGMENT}${path === "/" ? "" : path}`);
}

/**
 * Is this URL a legacy page? The locale prefix and the pilot root come first, then the legacy segment:
 * `/legacy`, `/en/legacy/features/card-design`, `/us/legacy`, `/en/us/legacy` (what the pilot rewrite serves).
 */
export function isLegacyPath(pathname: string): boolean {
  let rest = pathname.split(/[?#]/)[0].split("/").filter(Boolean);

  if ((routing.locales as readonly string[]).includes(rest[0])) rest = rest.slice(1);
  if (isPilotRoot(rest[0])) rest = rest.slice(1);

  return rest[0] === LEGACY_SEGMENT;
}

const isPilotRoot = (segment: string | undefined) =>
  (Object.keys(MARKETS) as Market[]).some((market) => market !== "int" && MARKETS[market].path === `/${segment}`);

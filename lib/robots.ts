import { routing } from "@/i18n/routing";

/** Private areas, disallowed at the root and under every locale prefix. */
export const PRIVATE_PATHS = ["/api", "/auth", "/onboarding", "/login"];

/**
 * Three rules per private path, because a bare `Disallow: /login` would also
 * hide any business enrollment page whose slug starts with the same letters
 * (`/authentic-cafe` under `/auth`), and a lone `Disallow: /login/` matches
 * neither the page itself nor `/login?redirect=…`, which is the form the
 * dashboard actually links to:
 *   `/login/`  everything below the path
 *   `/login$`  the path exactly ($ anchors the end of the URL)
 *   `/login?`  the path with a query string
 */
export function rulesFor(path: string): string[] {
  return [`${path}/`, `${path}$`, `${path}?`];
}

/**
 * Every `Disallow:` value, derived from `routing.locales` so a newly added
 * locale hides its funnel routes without a second edit here. Previously the
 * `/en` prefix was hardcoded, which left `/es/*` and `/pl/*` crawlable.
 */
export const DISALLOW_PATHS = [
  ...PRIVATE_PATHS.flatMap(rulesFor),
  ...routing.locales
    .filter((locale) => locale !== routing.defaultLocale)
    .flatMap((locale) =>
      PRIVATE_PATHS.flatMap((path) => rulesFor(`/${locale}${path}`))
    ),
  "/*opengraph-image*",
];

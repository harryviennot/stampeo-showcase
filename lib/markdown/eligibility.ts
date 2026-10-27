import { routing } from "@/i18n/routing";

/** Paths that never serve Markdown, in every locale prefix we ship. */
const PRIVATE_PATHS = ["/api", "/auth", "/onboarding", "/login"];

/**
 * Public but not for search yet: a Markdown response carries no robots meta,
 * so the help center's noindex would not travel with it.
 */
const UNINDEXED_PATHS = ["/help"];

const NO_MARKDOWN_PATHS = [...PRIVATE_PATHS, ...UNINDEXED_PATHS];

const EXCLUDED_PREFIXES = [
  ...NO_MARKDOWN_PATHS,
  "/_next",
  "/_vercel",
  ...routing.locales
    .filter((locale) => locale !== routing.defaultLocale)
    .flatMap((locale) =>
      NO_MARKDOWN_PATHS.map((path) => `/${locale}${path}`)
    ),
];

export function isMarkdownEligible(pathname: string): boolean {
  if (!pathname.startsWith("/")) return false;
  if (pathname.includes("..")) return false;
  if (/\.[a-z0-9]+$/i.test(pathname)) return false;
  for (const prefix of EXCLUDED_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) return false;
  }
  return true;
}

import { routing } from "@/i18n/routing";

/** Paths that never serve Markdown, in every locale prefix we ship. */
const PRIVATE_PATHS = ["/api", "/auth", "/onboarding", "/login"];

const EXCLUDED_PREFIXES = [
  ...PRIVATE_PATHS,
  "/_next",
  "/_vercel",
  ...routing.locales
    .filter((locale) => locale !== routing.defaultLocale)
    .flatMap((locale) =>
      PRIVATE_PATHS.map((path) => `/${locale}${path}`)
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

/**
 * Permanent redirects for URLs that no longer exist, served by `redirects()`
 * in `next.config.ts`. Next runs these before the proxy, so each one is a
 * single 308 straight to the page that replaced it.
 *
 * `next.config.ts` is compiled to CommonJS and loads this file at build time,
 * so it imports nothing from next-intl or `@/i18n/routing`, and it may read
 * the blog folders from disk.
 */

import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { BLOG_LOCALES } from "./blog/locales";
import { MARKETS, type Market } from "./markets";

export interface LegacyRedirect {
  source: string;
  destination: string;
  permanent: true;
}

/** `i18n/routing` restated; `legacy-redirects.test.ts` pins the two together. */
export const SITE_LOCALES = ["fr", "en", "es", "pl"] as const;
export const DEFAULT_LOCALE = "fr";

const PREFIXED_LOCALES = SITE_LOCALES.filter((locale) => locale !== DEFAULT_LOCALE);

/** Search Console 404s and renamed posts, each with the page that replaced it. */
const EXPLICIT: ReadonlyArray<readonly [source: string, destination: string]> = [
  // Search Console 404s with a real destination
  ["/en/en/onboarding", "/en/onboarding"],
  ["/blog/apple-wallet-loyalty-card", "/en/blog/apple-wallet-loyalty-card"],
  ["/blog/paper-vs-digital-loyalty-card", "/en/blog/paper-vs-digital-loyalty-card"],
  ["/blog/como-crear-tarjeta-fidelidad-digital", "/es/blog/como-crear-tarjeta-fidelidad-digital"],
  ["/blog/mejor-app-fidelizacion-comercios", "/es/blog/mejor-app-fidelizacion-comercios"],
  ["/blog/coffee-shop-loyalty-card", "/en/blog/coffee-shop-loyalty-card"],
  ["/features/notificaciones", "/es/features/notificaciones-push"],
  ["/blog/best-loyalty-card-system-small-business", "/en/blog/best-loyalty-card-system-small-business"],
  ["/en/blog/carte-fidelite-dematerialisee", "/blog/carte-fidelite-dematerialisee"],
  ["/en/blog/carte-fidelite-sans-application", "/blog/carte-fidelite-sans-application"],
  ["/en/blog/carte-fidelite-cafe", "/blog/carte-fidelite-cafe"],
  ["/en/blog/carte-fidelite-papier-vs-digitale", "/blog/carte-fidelite-papier-vs-digitale"],
  // Posts and pages renamed or removed in git history
  ["/en/blog/apple-wallet-loyalty-cards-setup", "/en/blog/apple-wallet-loyalty-card"],
  ["/en/blog/why-digital-loyalty-cards", "/en/blog/digital-loyalty-card-small-business"],
  ["/en/blog/founding-partner-program", "/en/pricing"],
  ["/blog/configurer-cartes-fidelite-apple-wallet", "/blog/apple-wallet-carte-fidelite"],
  ["/blog/pourquoi-cartes-fidelite-digitales", "/blog/carte-fidelite-dematerialisee"],
  ["/blog/programme-partenaire-fondateur", "/pricing"],
  ["/signup", "/onboarding"],
  ["/en/signup", "/en/onboarding"],
  ["/fr/signup", "/onboarding"],
  // The founding programme is closed; its pages send visitors to pricing.
  ["/programme-fondateur", "/pricing"],
  ["/founding-partner", "/pricing"],
  ["/en/programme-fondateur", "/en/pricing"],
  ["/en/founding-partner", "/en/pricing"],
];

/** The post slugs in each blog locale, read from `content/blog/<locale>/`. */
function blogSlugs(contentDir: string): Map<string, string[]> {
  const slugs = new Map<string, string[]>();
  for (const locale of BLOG_LOCALES) {
    const dir = join(contentDir, locale);
    const files = existsSync(dir) ? readdirSync(dir) : [];
    slugs.set(
      locale,
      files.filter((file) => file.endsWith(".mdx")).map((file) => file.replace(/\.mdx$/, "")),
    );
  }
  return slugs;
}

/**
 * Throws when two blog locales share a slug: the derived rules below would
 * send one language's post to the other's.
 */
function assertDisjoint(slugs: Map<string, string[]>): void {
  const owner = new Map<string, string>();
  for (const [locale, list] of slugs) {
    for (const slug of list) {
      const other = owner.get(slug);
      if (other) {
        throw new Error(
          `Blog slug "${slug}" exists in both ${other} and ${locale}; legacy blog redirects need every slug to belong to one locale.`,
        );
      }
      owner.set(slug, locale);
    }
  }
}

/** A blog post asked for under the wrong locale goes to the locale that has it. */
function blogRules(slugs: Map<string, string[]>): Array<[string, string]> {
  const rules: Array<[string, string]> = [];
  const prefixed = BLOG_LOCALES.filter((locale) => locale !== DEFAULT_LOCALE);

  for (const locale of prefixed) {
    for (const slug of slugs.get(locale) ?? []) {
      rules.push([`/blog/${slug}`, `/${locale}/blog/${slug}`]);
    }
  }
  for (const locale of prefixed) {
    for (const slug of slugs.get(DEFAULT_LOCALE) ?? []) {
      rules.push([`/${locale}/blog/${slug}`, `/blog/${slug}`]);
    }
  }
  return rules;
}

/** A doubled locale prefix (`/en/en/...`) loses one copy. `:path*` also matches the bare prefix. */
function doubledLocaleRules(): Array<[string, string]> {
  return [
    ...PREFIXED_LOCALES.map((locale): [string, string] => [
      `/${locale}/${locale}/:path*`,
      `/${locale}/:path*`,
    ]),
    // The default locale is unprefixed, so `/fr/fr/x` goes straight to `/x`.
    [`/${DEFAULT_LOCALE}/${DEFAULT_LOCALE}/:path+`, "/:path+"],
  ];
}

/** Pilots live at locale-free URLs, so a locale-prefixed copy goes to the real one. */
function pilotRules(): Array<[string, string]> {
  const pilots = (Object.keys(MARKETS) as Market[])
    .filter((market) => market !== "int")
    .map((market) => MARKETS[market].path);

  return PREFIXED_LOCALES.flatMap((locale) =>
    pilots.map((pilot): [string, string] => [`/${locale}${pilot}/:path*`, `${pilot}/:path*`]),
  );
}

/**
 * Every legacy redirect, explicit entries first. A derived rule whose source an
 * explicit entry already covers is dropped.
 */
export function legacyRedirects(
  contentDir: string = join(process.cwd(), "content", "blog"),
): LegacyRedirect[] {
  const slugs = blogSlugs(contentDir);
  assertDisjoint(slugs);

  const seen = new Set<string>();
  const redirects: LegacyRedirect[] = [];
  for (const [source, destination] of [
    ...EXPLICIT,
    ...blogRules(slugs),
    ...doubledLocaleRules(),
    ...pilotRules(),
  ]) {
    if (seen.has(source)) continue;
    seen.add(source);
    redirects.push({ source, destination, permanent: true });
  }
  return redirects;
}

import { routing } from "@/i18n/routing";
import { hasBlog } from "@/lib/blog/locales";
import { getLocalizedSlug } from "@/lib/feature-slugs";
import { FEATURE_ITEMS } from "@/lib/features";
import { loyaltyPath } from "@/lib/loyalty-routes";
import { marketLink, type Market } from "@/lib/markets";

/**
 * The sr-only navigation rendered in the header and the footer.
 *
 * These are raw `<a href>`, not next-intl `Link`s, so every href ships EXACTLY
 * as written: the locale prefix is built here by hand, and nothing downstream
 * normalises it.
 *
 * It lives in `lib/` for two reasons, both learned the hard way in STA-355.
 *
 * It was previously declared inline and BYTE-IDENTICALLY in both
 * `Header.tsx` and `Footer.tsx`, so every defect existed twice and a fix to one
 * copy silently left the other. And because the hrefs were assembled from
 * template strings inside a component, no test could read them — the STA-355
 * guard walks MDX and message catalogs and never saw this surface at all. That
 * is how `${seoPrefix}/` shipped: for French it is `/`, but for every other
 * locale it is `/en/`, `/es/`, `/pl/`, each of which 308s to the unslashed form.
 * A redirect on every page of the site, in the block that exists specifically
 * to be read by crawlers.
 *
 * As a pure function it is testable, and `seo-links.test.ts` runs every href
 * through the same classifier that guards the blog and the catalogs.
 */
export interface SeoLink {
  href: string;
  label: string;
}

/**
 * The locale prefix for hand-built paths. Empty for the default locale, which
 * is unprefixed under `localePrefix: "as-needed"`.
 */
export function seoPrefixFor(locale: string): string {
  return locale === routing.defaultLocale ? "" : `/${locale}`;
}

export function buildSeoLinks(locale: string, market: Market = "int"): SeoLink[] {
  const prefix = seoPrefixFor(locale);

  return [
    // `prefix || "/"`, never `${prefix}/`. The home path IS the prefix once the
    // prefix is non-empty; appending a slash produces `/en/`, which redirects.
    // `marketPath` in lib/markets.ts already uses this exact `base || "/"` shape.
    { href: prefix || "/", label: "Home" },
    { href: marketLink(market, prefix, "/pricing"), label: "Pricing" },
    { href: loyaltyPath(locale), label: "Loyalty programs" },
    ...(hasBlog(locale) ? [{ href: `${prefix}/blog`, label: "Blog" }] : []),
    { href: `${prefix}/contact`, label: "Contact" },
    { href: `${prefix}/about`, label: "About" },
    ...FEATURE_ITEMS.map(({ canonicalSlug }) => ({
      href: `${prefix}/features/${getLocalizedSlug(canonicalSlug, locale)}`,
      label: canonicalSlug,
    })),
  ];
}

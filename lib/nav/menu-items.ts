import { hasBlog } from "@/lib/blog/locales";
import { FEATURE_ITEMS } from "@/lib/features";
import { featureLink, isComingSoon, loyaltyLink } from "@/lib/landing-pages/preview-nav";
import { marketPath, type Market } from "@/lib/markets";

/** One entry of a header menu. */
export interface NavMenuItem {
  href: string;
  label: string;
  description?: string;
  /** A market path (`/us/...`) is final as written; without one, next-intl prefixes the locale. */
  market?: Market;
  /** The menu prints "Soon" beside it: the feature is not live yet. */
  soon?: boolean;
}

/** The Product menu's six features as the header's dropdown lists them: the pages of the international site, geolocation marked "Soon". */
export function productMenuItems(t: (key: string) => string, locale: string): NavMenuItem[] {
  return FEATURE_ITEMS.map(({ key, canonicalSlug }) => ({
    ...featureLink(canonicalSlug, locale),
    label: t(`common.nav.featuresItems.${key}.label`),
    soon: isComingSoon(canonicalSlug),
  }));
}

/**
 * The links of the header's other menus. A market is a set of routes, not one landing page: /us quotes dollars,
 * so Pricing is the market's own page, not the euro ladder. The blog only exists in the locales that have articles.
 */
export function pageMenuItems(
  t: (key: string) => string,
  locale: string,
  market: Market,
): { navItems: Array<NavMenuItem & { market: Market }>; resourceItems: NavMenuItem[] } {
  return {
    navItems: [
      { label: t("common.nav.loyalty"), ...loyaltyLink(locale) },
      { label: t("common.nav.pricing"), href: marketPath(market, "/pricing"), market },
    ],
    resourceItems: [
      ...(hasBlog(locale) ? [{ href: "/blog", label: t("common.nav.blog") }] : []),
      { href: "/changelog", label: t("common.nav.changelog") },
      { href: "/about", label: t("common.nav.about") },
      { href: "/contact", label: t("common.nav.contact") },
    ],
  };
}

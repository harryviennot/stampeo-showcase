/**
 * Centralized pricing configuration.
 * Change prices here and they propagate to all pages
 * (pricing section, FAQ, terms, comparison table, etc.)
 */

export const PRICING = {
  starter: {
    price: 20,
    foundingPrice: 10,
  },
  growth: {
    price: 40,
    foundingPrice: 20,
  },
  pro: {
    price: 60,
    // No founding price — Pro is full-price only.
  },
  /** Founding partner discount percentage */
  foundingDiscount: 50,
  /** Free months for founding partners */
  freeMonths: 3,
} as const;

/**
 * Founding partner program CLOSED at this instant (UTC). Mirrors the backend
 * constant in `app/core/stripe_config.py` and `web/src/lib/pricing.ts` — keep
 * all three in sync. Since this moment:
 *   - new signups no longer get founding pricing
 *   - the pricing page hides founding badges and strikethroughs
 *   - /founding-partner + /programme-fondateur 307 to /pricing
 *
 * Existing founding partners are grandfathered server-side via the DB flag,
 * with no expiry.
 */
export const FOUNDING_PROGRAM_END_DATE = new Date(
  Date.UTC(2026, 7, 4) // month is 0-indexed → 7 = August. 2026-08-04T00:00:00Z
);

export function isFoundingProgramOpen(now: Date = new Date()): boolean {
  return now < FOUNDING_PROGRAM_END_DATE;
}

/**
 * Sitewide promo banner (`components/sections/PromoBanner.tsx`) master switch.
 *
 * Off since the founding program closed. The component and its
 * `common.promoBanner.*` copy are kept for the next promo — but that copy is
 * founding-specific ("50% off for life"), so REWRITE IT before flipping this
 * back on.
 */
export const PROMO_BANNER_ENABLED = false;

/** Format a price for display (e.g. 10 → "10", 14.99 → "14.99") */
export function formatPrice(price: number, locale?: string): string {
  if (locale === "fr" || locale === "es") {
    return price % 1 === 0 ? `${price}` : price.toFixed(2).replace(".", ",");
  }
  return price % 1 === 0 ? `${price}` : price.toFixed(2);
}

/**
 * Replace pricing placeholders in raw translation strings.
 * Use this for strings from t.raw() that contain {starterPrice}, {growthPrice}, etc.
 */
export function interpolatePricing(text: string): string {
  return text
    .replaceAll("{starterPrice}", String(PRICING.starter.price))
    .replaceAll("{starterFoundingPrice}", String(PRICING.starter.foundingPrice))
    .replaceAll("{growthPrice}", String(PRICING.growth.price))
    .replaceAll("{growthFoundingPrice}", String(PRICING.growth.foundingPrice))
    .replaceAll("{proPrice}", String(PRICING.pro.price))
    .replaceAll("{freeMonths}", String(PRICING.freeMonths));
}

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
    // No founding price — Pro is "coming soon"
  },
  /** Founding partner discount percentage */
  foundingDiscount: 50,
  /** Free months for founding partners */
  freeMonths: 3,
} as const;

/**
 * Founding partner program closes at this instant (UTC). Mirrors the backend
 * constant in `app/core/stripe_config.py`. After this moment:
 *   - new signups no longer get founding pricing
 *   - the FoundingPartnerStep loses its badge + strikethrough price
 *   - /founding-partner + /programme-fondateur 307 to /pricing
 *   - the pricing page hides founding badges
 *
 * Existing founding partners are grandfathered server-side via the DB flag.
 */
export const FOUNDING_PROGRAM_END_DATE = new Date(
  Date.UTC(2026, 4, 19, 23, 59, 59) // month is 0-indexed → 4 = May
);

export function isFoundingProgramOpen(now: Date = new Date()): boolean {
  return now < FOUNDING_PROGRAM_END_DATE;
}

/** Format a price for display (e.g. 10 → "10", 14.99 → "14.99") */
export function formatPrice(price: number, locale?: string): string {
  if (locale === "fr") {
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

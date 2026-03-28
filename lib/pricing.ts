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
  /** Number of founding spots remaining */
  spotsLeft: 9,
} as const;

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
    .replaceAll("{freeMonths}", String(PRICING.freeMonths))
    .replaceAll("{spotsLeft}", String(PRICING.spotsLeft));
}

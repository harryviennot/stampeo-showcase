/**
 * Centralized pricing configuration.
 * Change prices here and they propagate to all pages
 * (pricing section, FAQ, terms, comparison table, etc.)
 */

export const PRICING = {
  starter: {
    price: 20,
    yearlyPrice: 192,
    foundingPrice: 10,
    foundingYearlyPrice: 96,
  },
  growth: {
    price: 40,
    yearlyPrice: 384,
    foundingPrice: 20,
    foundingYearlyPrice: 192,
  },
  pro: {
    price: 60,
    yearlyPrice: 576,
    // No founding price — Pro is full-price only, on both cadences.
  },
  /** Founding partner discount percentage */
  foundingDiscount: 50,
  /** Free months for founding partners */
  freeMonths: 3,
  /**
   * Yearly discount, advertised on the toggle badge. Every yearly price is
   * exactly this much off 12 monthly payments, landing each tier on a whole
   * euro per month (€16 / €32 / €48). Mirrored in web/src/lib/pricing.ts,
   * where a test asserts the exactness.
   */
  yearlyDiscountPercent: 20,
} as const;

export type BillingInterval = "month" | "year";
export type TierId = "starter" | "growth" | "pro";

/** Public list price for a tier on a given cadence. */
export function tierPrice(tier: TierId, interval: BillingInterval): number {
  return interval === "year" ? PRICING[tier].yearlyPrice : PRICING[tier].price;
}

/** What a yearly plan works out to per month, rounded to cents. */
export function monthlyEquivalent(yearlyPrice: number): number {
  return Math.round((yearlyPrice / 12) * 100) / 100;
}

export type PricingCardView = {
  isYearly: boolean;
  /** The price the card leads with, as a per-month rate. */
  price: number;
  /** Struck-through original, when one applies. Yearly cards have none: the
   *  saving is spelled out in words underneath instead. */
  discount?: { targetPrice: number };
  /** What the customer is actually charged once a year. */
  yearlyTotal: number;
  /** Euros saved over a year versus paying monthly. */
  yearlySaving: number;
};

/**
 * How one pricing card should read for a given cadence.
 *
 * Both cadences headline a PER-MONTH figure, because that is the only way the
 * reader can see at a glance that yearly is cheaper: "€20 → €16" lands,
 * "€20 → €192" reads as ten times more expensive until you do the division.
 * The real yearly charge is stated immediately below the price, never hidden.
 */
export function yearlyCardView(
  tier: TierId,
  interval: BillingInterval,
  foundingOpen: boolean,
): PricingCardView {
  const cfg = PRICING[tier];
  const founding = foundingOpen ? (cfg as { foundingPrice?: number }).foundingPrice : undefined;
  const foundingYearly = foundingOpen
    ? (cfg as { foundingYearlyPrice?: number }).foundingYearlyPrice
    : undefined;

  const monthlyRate = founding ?? cfg.price;
  const yearlyTotal = foundingYearly ?? cfg.yearlyPrice;
  const yearlySaving = monthlyRate * 12 - yearlyTotal;

  if (interval === "year") {
    return {
      isYearly: true,
      price: monthlyEquivalent(yearlyTotal),
      yearlyTotal,
      yearlySaving,
    };
  }
  return {
    isYearly: false,
    price: cfg.price,
    discount: founding ? { targetPrice: founding } : undefined,
    yearlyTotal,
    yearlySaving,
  };
}

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
    .replaceAll("{starterYearlyPrice}", String(PRICING.starter.yearlyPrice))
    .replaceAll("{growthYearlyPrice}", String(PRICING.growth.yearlyPrice))
    .replaceAll("{proYearlyPrice}", String(PRICING.pro.yearlyPrice))
    .replaceAll("{yearlyDiscount}", String(PRICING.yearlyDiscountPercent))
    .replaceAll("{freeMonths}", String(PRICING.freeMonths));
}

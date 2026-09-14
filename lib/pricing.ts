/**
 * Pricing shapes, formatting, and the founding-era constants.
 *
 * Public list prices are NOT here any more. They live in Stripe and arrive via
 * `lib/plan-catalog.ts`, so a reprice is a dashboard action rather than a
 * deploy. What stays below is the baked fallback for when the backend is
 * unreachable, plus the founding prices — those are frozen history, not live
 * config: the programme closed on 2026-08-04 and its rates can never change.
 */

export type BillingInterval = "month" | "year";
export type TierId = "starter" | "growth" | "pro";

/** A full ladder for one currency, in major units. */
export type Pricing = {
  currency: string;
  tiers: Record<TierId, Record<BillingInterval, number>>;
};

/**
 * Last-resort ladder, used only when the backend cannot be reached.
 *
 * It WILL go stale — that is the trade. A pricing page showing last release's
 * price beats one showing nothing, and the window is one revalidate cycle.
 *
 * CRITICAL: this must only ever contain currencies Stripe can actually bill.
 * Quoting a currency checkout cannot charge is worse than quoting a stale price,
 * because the visitor is shown one number and debited another. USD lands here in
 * the same change that adds USD `currency_options` to the Stripe Prices (B1) —
 * not before. Until then a request for USD falls back to euros, which is what
 * the backend would have answered anyway.
 */
export const FALLBACK_PRICING: Record<string, Pricing> = {
  eur: {
    currency: "eur",
    tiers: {
      starter: { month: 20, year: 192 },
      growth: { month: 40, year: 384 },
      pro: { month: 60, year: 576 },
    },
  },
};

/** Currency glyphs. Placement is decided per locale in `formatMoney`. */
const CURRENCY_SYMBOLS: Record<string, string> = { eur: "€", usd: "$" };

export function currencySymbol(currency: string): string {
  return CURRENCY_SYMBOLS[currency] ?? currency.toUpperCase();
}

/**
 * Money, written the way a locale writes it.
 *
 * English leads with the symbol; French, Spanish and Polish trail it behind a
 * non-breaking space. The NBSP matters: a plain space lets the amount and its
 * symbol wrap onto separate lines. Mirrors backend/app/core/money.py.
 */
export function formatMoney(amount: number, currency: string, locale?: string): string {
  const symbol = currencySymbol(currency);
  const value = formatPrice(amount, locale);
  return locale === "en" || !locale ? `${symbol}${value}` : `${value}\u00a0${symbol}`;
}

/** Founding-partner rates. Frozen: the programme closed 2026-08-04. */
export const FOUNDING_PRICING = {
  starter: {
    foundingPrice: 10,
    foundingYearlyPrice: 96,
  },
  growth: {
    foundingPrice: 20,
    foundingYearlyPrice: 192,
  },
  pro: {
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

/** Public list price for a tier on a given cadence, from the live ladder. */
export function tierPrice(
  pricing: Pricing, tier: TierId, interval: BillingInterval,
): number {
  return pricing.tiers[tier][interval];
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
  /** Saved over a year versus paying monthly, in major units. */
  yearlySaving: number;
};

/**
 * How one pricing card should read for a given cadence.
 *
 * Both cadences headline a PER-MONTH figure, because that is the only way the
 * reader can see at a glance that yearly is cheaper: "€20 → €16" lands,
 * "€20 → €192" reads as ten times more expensive until you do the division.
 * The real yearly charge is stated immediately below the price, never hidden.
 *
 * `pricing` carries the live public ladder; founding rates come from the frozen
 * table, and only apply while the programme is open (it is not).
 */
export function yearlyCardView(
  pricing: Pricing,
  tier: TierId,
  interval: BillingInterval,
  foundingOpen: boolean,
): PricingCardView {
  const cfg = FOUNDING_PRICING[tier] as {
    foundingPrice?: number;
    foundingYearlyPrice?: number;
  };
  const listMonthly = pricing.tiers[tier].month;
  const listYearly = pricing.tiers[tier].year;

  const founding = foundingOpen ? cfg.foundingPrice : undefined;
  const foundingYearly = foundingOpen ? cfg.foundingYearlyPrice : undefined;

  const monthlyRate = founding ?? listMonthly;
  const yearlyTotal = foundingYearly ?? listYearly;
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
    price: listMonthly,
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

/** Locales that write the decimal separator as a comma (10,99 not 10.99). */
const COMMA_DECIMAL_LOCALES = new Set(["fr", "es", "pl"]);

/** Format a price for display (e.g. 10 → "10", 14.99 → "14.99") */
export function formatPrice(price: number, locale?: string): string {
  if (locale && COMMA_DECIMAL_LOCALES.has(locale)) {
    return price % 1 === 0 ? `${price}` : price.toFixed(2).replace(".", ",");
  }
  return price % 1 === 0 ? `${price}` : price.toFixed(2);
}

/**
 * Replace pricing placeholders in raw translation strings.
 *
 * For strings from `t.raw()` that contain {starterPrice}, {growthPrice}, etc.
 * Substitutes a *formatted* amount, symbol included, so the translations do not
 * have to hardcode a currency glyph — which is what stopped them from ever being
 * repriced into another currency.
 */
import { MARKETS } from "./markets";

export function interpolatePricing(
  text: string, pricing: Pricing, locale?: string, trialDays?: number,
): string {
  const money = (amount: number) => formatMoney(amount, pricing.currency, locale);
  return text
    .replaceAll("{starterPrice}", money(pricing.tiers.starter.month))
    .replaceAll("{growthPrice}", money(pricing.tiers.growth.month))
    .replaceAll("{proPrice}", money(pricing.tiers.pro.month))
    .replaceAll("{starterYearlyPrice}", money(pricing.tiers.starter.year))
    .replaceAll("{growthYearlyPrice}", money(pricing.tiers.growth.year))
    .replaceAll("{proYearlyPrice}", money(pricing.tiers.pro.year))
    // What a yearly plan works out to per month — the figure the "save 20%"
    // FAQ answer compares against the monthly rate.
    .replaceAll("{starterYearlyMonthly}", money(monthlyEquivalent(pricing.tiers.starter.year)))
    .replaceAll("{growthYearlyMonthly}", money(monthlyEquivalent(pricing.tiers.growth.year)))
    .replaceAll("{proYearlyMonthly}", money(monthlyEquivalent(pricing.tiers.pro.year)))
    // Founding rates are frozen history and always euros.
    .replaceAll("{starterFoundingPrice}", formatMoney(FOUNDING_PRICING.starter.foundingPrice, "eur", locale))
    .replaceAll("{growthFoundingPrice}", formatMoney(FOUNDING_PRICING.growth.foundingPrice, "eur", locale))
    // "0 to start" is a price claim and has to follow the market's currency.
    .replaceAll("{zero}", money(0))
    .replaceAll("{yearlyDiscount}", String(FOUNDING_PRICING.yearlyDiscountPercent))
    .replaceAll("{freeMonths}", String(FOUNDING_PRICING.freeMonths))
    // The trial length is a PROMISE, and it differs by market: the US gets 14
    // days where everywhere else gets 30. Hardcoding it in copy is how /us came
    // to offer 30 days one click before Stripe granted 14.
    .replaceAll("{trialDays}", String(trialDays ?? MARKETS.int.trialDays));
}

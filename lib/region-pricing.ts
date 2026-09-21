/**
 * STA-330: which ladder and trial length the visitor's DETECTED region gets.
 *
 * Display-side mirror of the backend's `app/core/pricing_region.py`: the maps
 * below must widen together with COUNTRY_CURRENCY / TRIAL_DAYS_BY_COUNTRY
 * there, never independently — the number shown here has to be the number the
 * backend will bill once the business types its address at onboarding.
 *
 * This module deliberately does NOT read the timezone table itself. Detection
 * stays `detectBrowserCountry()` (lib/phone-utils.ts), and
 * `lib/timezone-country.ts` stays untouched: the consent regime derives the
 * visitor's legal opt-in/opt-out status from that same table, so widening or
 * caching it "for pricing" would silently move visitors between GDPR and
 * US-opt-out consent regimes.
 */

import type { Pricing } from "./pricing";

export type RegionCurrency = "eur" | "usd";

export interface RegionBilling {
  currency: RegionCurrency;
  trialDays: number;
}

/** Mirrors backend COUNTRY_CURRENCY. Widen only alongside it. */
const COUNTRY_CURRENCY: Record<string, RegionCurrency> = {
  US: "usd",
};

/** Mirrors backend TRIAL_DAYS_BY_COUNTRY. Widen only alongside it. */
const TRIAL_DAYS_BY_COUNTRY: Record<string, number> = {
  US: 14,
};

const DEFAULT_CURRENCY: RegionCurrency = "eur";
const TRIAL_DAYS_STANDARD = 30;

/**
 * The billing terms a visitor detected in `country` should be shown.
 *
 * Returns null when the country is unknown or malformed, and the caller falls
 * back to the page's market default. Junk must not degrade to "eur/30": the
 * page default may itself be usd (/us), and a bad detection is not evidence
 * the visitor is European. Note GB is eur/30 on purpose — /uk bills in euros.
 */
export function regionBilling(
  country: string | null | undefined,
): RegionBilling | null {
  const code = (country ?? "").trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return null;
  return {
    currency: COUNTRY_CURRENCY[code] ?? DEFAULT_CURRENCY,
    trialDays: TRIAL_DAYS_BY_COUNTRY[code] ?? TRIAL_DAYS_STANDARD,
  };
}

/**
 * The ladder to display for a resolved region.
 *
 * Guard: a ladder can come back in the WRONG currency (`getPlanCatalog` falls
 * back to whatever the baked table holds when the backend is down). Showing a
 * euro ladder to a detected-US visitor is exactly the mixed-currency display
 * this feature exists to end, so a mismatched ladder loses to the page's own
 * default. When the default slot is the mismatched one, it is returned as-is:
 * that is what the server rendered and there is no third ladder to prefer.
 */
export function resolveRegionLadder(
  ladders: Record<RegionCurrency, Pricing>,
  wanted: RegionCurrency,
  pageDefault: RegionCurrency,
): Pricing {
  const ladder = ladders[wanted];
  if (ladder.currency.toLowerCase() === wanted) return ladder;
  return ladders[pageDefault];
}

/**
 * Every placeholder `interpolatePricing` (lib/pricing.ts) replaces — kept in
 * lockstep by the parity test in region-pricing.test.ts, which feeds each one
 * through the real replacer and requires the braces to be gone.
 */
export const PRICING_TOKENS = [
  "starterPrice",
  "growthPrice",
  "proPrice",
  "starterYearlyPrice",
  "growthYearlyPrice",
  "proYearlyPrice",
  "starterYearlyMonthly",
  "growthYearlyMonthly",
  "proYearlyMonthly",
  "starterFoundingPrice",
  "growthFoundingPrice",
  "zero",
  "yearlyDiscount",
  "freeMonths",
  "trialDays",
] as const;

export type RawPart = { type: "text" | "token"; value: string };

const TOKEN_PATTERN = new RegExp(`\\{(${PRICING_TOKENS.join("|")})\\}`, "g");

/**
 * Split a raw i18n string into text and pricing-token parts, so a held render
 * can skeleton ONLY the tokens while the translator's sentence stays visible.
 * Unknown placeholders (ICU arguments like {count}) are plain text: they
 * belong to next-intl, not to pricing, and must never be blanked.
 */
export function splitPricingParts(raw: string): RawPart[] {
  const parts: RawPart[] = [];
  let last = 0;
  TOKEN_PATTERN.lastIndex = 0;
  for (let m = TOKEN_PATTERN.exec(raw); m !== null; m = TOKEN_PATTERN.exec(raw)) {
    if (m.index > last) parts.push({ type: "text", value: raw.slice(last, m.index) });
    parts.push({ type: "token", value: m[1] });
    last = m.index + m[0].length;
  }
  if (last < raw.length || parts.length === 0) {
    parts.push({ type: "text", value: raw.slice(last) });
  }
  return parts;
}

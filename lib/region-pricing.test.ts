import { describe, expect, test } from "bun:test";

import {
  PRICING_TOKENS,
  regionBilling,
  resolveRegionLadder,
  splitPricingParts,
} from "./region-pricing";
import { FALLBACK_PRICING, interpolatePricing, type Pricing } from "./pricing";

/**
 * STA-330: displayed pricing follows the visitor's detected region, not the
 * page's market. The resolver here is the display-side mirror of the backend's
 * `app/core/pricing_region.py` (COUNTRY_CURRENCY / TRIAL_DAYS_BY_COUNTRY) —
 * the two must widen together, never independently, or the number a visitor
 * is shown stops matching the number they are billed.
 */

describe("regionBilling", () => {
  test("US resolves to usd and the 14-day trial", () => {
    expect(regionBilling("US")).toEqual({ currency: "usd", trialDays: 14 });
  });

  test("case and whitespace are normalized, matching the backend's _norm_country", () => {
    expect(regionBilling("us")).toEqual({ currency: "usd", trialDays: 14 });
    expect(regionBilling(" us ")).toEqual({ currency: "usd", trialDays: 14 });
  });

  test("every other detected country is eur/30", () => {
    for (const country of ["FR", "PL", "ES", "DE", "JP", "CA", "AU"]) {
      expect(regionBilling(country)).toEqual({ currency: "eur", trialDays: 30 });
    }
  });

  test("GB is eur/30 — /uk deliberately bills in euros, no GBP ladder exists", () => {
    expect(regionBilling("GB")).toEqual({ currency: "eur", trialDays: 30 });
  });

  test("undetectable or junk input resolves to null so the caller falls back to the page market", () => {
    // null: not a browser / detection failed. The rest: values that are not a
    // 2-letter ISO code and must not be read as "some non-US country → eur",
    // because the page default may itself be usd (/us).
    expect(regionBilling(null)).toBeNull();
    expect(regionBilling(undefined)).toBeNull();
    expect(regionBilling("")).toBeNull();
    expect(regionBilling("   ")).toBeNull();
    expect(regionBilling("USA")).toBeNull();
    expect(regionBilling("1A")).toBeNull();
  });
});

describe("splitPricingParts", () => {
  test("round-trips: reassembling the parts yields the raw string", () => {
    const raw =
      "Try free for {trialDays} days, then from {starterPrice}/month or {starterYearlyMonthly} billed yearly.";
    const parts = splitPricingParts(raw);
    const reassembled = parts
      .map((p) => (p.type === "token" ? `{${p.value}}` : p.value))
      .join("");
    expect(reassembled).toBe(raw);
  });

  test("marks exactly the pricing tokens as tokens, in order", () => {
    const parts = splitPricingParts("A {starterPrice} B {trialDays} C");
    expect(parts).toEqual([
      { type: "text", value: "A " },
      { type: "token", value: "starterPrice" },
      { type: "text", value: " B " },
      { type: "token", value: "trialDays" },
      { type: "text", value: " C" },
    ]);
  });

  test("plain text yields a single text part", () => {
    expect(splitPricingParts("No numbers here.")).toEqual([
      { type: "text", value: "No numbers here." },
    ]);
  });

  test("an unknown placeholder is NOT treated as a pricing token", () => {
    // ICU arguments like {count} belong to next-intl, not to us; skeletoning
    // them would blank text the translator owns.
    expect(splitPricingParts("Hello {name}")).toEqual([
      { type: "text", value: "Hello {name}" },
    ]);
  });

  test("token list parity: interpolatePricing replaces every token we would skeleton", () => {
    // If interpolatePricing learns a token this list does not know, the chip
    // never covers it and a raw "{newToken}" flashes; if the list knows one
    // interpolatePricing dropped, the chip resolves to a literal token. Feed
    // each token through the real replacer and require the braces to be gone.
    const pricing: Pricing = FALLBACK_PRICING.eur;
    for (const token of PRICING_TOKENS) {
      const out = interpolatePricing(`{${token}}`, pricing, "en", 30);
      expect(out).not.toContain("{");
      expect(out).not.toContain("}");
    }
  });
});

describe("resolveRegionLadder", () => {
  const eur: Pricing = { currency: "eur", tiers: FALLBACK_PRICING.eur.tiers };
  const usd: Pricing = {
    currency: "usd",
    tiers: {
      starter: { month: 49, year: 468 },
      growth: { month: 79, year: 756 },
      pro: { month: 119, year: 1140 },
    },
  };

  test("returns the requested region's ladder when it really is in that currency", () => {
    expect(resolveRegionLadder({ eur, usd }, "usd", "eur")).toBe(usd);
    expect(resolveRegionLadder({ eur, usd }, "eur", "usd")).toBe(eur);
  });

  test("unpriceable → page default: a ladder that fell back to another currency is not shown", () => {
    // The old FALLBACK_PRICING had no usd entry, so a backend outage served the
    // EUR ladder under a usd request. Showing that to a detected-US visitor is
    // the mixed-currency display AC8 forbids; the page's own default wins.
    const usdCameBackEur: Pricing = { ...eur, isFallback: true };
    expect(resolveRegionLadder({ eur, usd: usdCameBackEur }, "usd", "eur")).toBe(eur);
  });

  test("page default wins even when it is the mismatched side's twin", () => {
    // /us with a broken usd ladder: default IS usd, so the mismatched ladder is
    // all there is — return the default slot as-is rather than invent a third.
    const usdCameBackEur: Pricing = { ...eur, isFallback: true };
    expect(resolveRegionLadder({ eur, usd: usdCameBackEur }, "usd", "usd")).toBe(
      usdCameBackEur,
    );
  });
});

describe("FALLBACK_PRICING.usd", () => {
  test("exists — USD currency_options went live 2026-09-15, the baked ladder must carry it", () => {
    expect(FALLBACK_PRICING.usd).toBeDefined();
    expect(FALLBACK_PRICING.usd.currency).toBe("usd");
  });

  test("mirrors the eur ladder's shape with positive whole-major-unit amounts", () => {
    const eur = FALLBACK_PRICING.eur;
    const usd = FALLBACK_PRICING.usd;
    expect(Object.keys(usd.tiers).sort()).toEqual(Object.keys(eur.tiers).sort());
    for (const tier of Object.keys(eur.tiers) as Array<keyof typeof eur.tiers>) {
      expect(Object.keys(usd.tiers[tier]).sort()).toEqual(
        Object.keys(eur.tiers[tier]).sort(),
      );
      for (const interval of ["month", "year"] as const) {
        expect(usd.tiers[tier][interval]).toBeGreaterThan(0);
      }
    }
  });
});

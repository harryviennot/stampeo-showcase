import { afterEach, describe, expect, it } from "bun:test";
import { MARKETS } from "../markets";
import { PLAN_FACTS } from "../plans/plan-facts";
import { FALLBACK_PRICING, formatMoney, type Pricing } from "../pricing";
import { findCurrencyAmounts } from "./body-checks";
import { STAMPEO_FACT_IDS, buildStampeoColumn, getStampeoColumn, isStampeoFactId } from "./stampeo";
import { STANDARD_FACT_IDS, type Market } from "./types";

/** A ladder that differs from the baked one, so a match proves the amounts came from the catalog. */
const CATALOG: Record<Market, Pricing> = {
  us: { currency: "usd", tiers: { starter: { month: 51, year: 480 }, growth: { month: 81, year: 768 }, pro: { month: 121, year: 1152 } } },
  fr: { currency: "eur", tiers: { starter: { month: 23, year: 216 }, growth: { month: 43, year: 408 }, pro: { month: 63, year: 600 } } },
};
const LOCALE: Record<Market, string> = { us: "en", fr: "fr" };
const TRIAL_DAYS: Record<Market, number> = { us: MARKETS.us.trialDays, fr: MARKETS.int.trialDays };
const PRICE_IDS = ["stampeo.price.starter", "stampeo.price.growth", "stampeo.price.pro"] as const;

describe.each(["us", "fr"] as const)("Stampeo's side on the %s market", (market) => {
  const column = buildStampeoColumn(market, CATALOG[market]);
  const money = (amount: number) => formatMoney(amount, CATALOG[market].currency, LOCALE[market]);

  it("answers every standard table row with plain text and no em dash", () => {
    for (const id of STANDARD_FACT_IDS) {
      expect(column.rows[id].trim().length).toBeGreaterThan(0);
      expect(column.rows[id]).not.toContain("—");
    }
    for (const id of STAMPEO_FACT_IDS) expect(column.facts[id].trim().length).toBeGreaterThan(0);
  });

  it("prices each plan monthly from the catalog it was given, in the market's currency", () => {
    expect(column.facts["stampeo.price.starter"]).toContain(money(CATALOG[market].tiers.starter.month));
    expect(column.facts["stampeo.price.growth"]).toContain(money(CATALOG[market].tiers.growth.month));
    expect(column.facts["stampeo.price.pro"]).toContain(money(CATALOG[market].tiers.pro.month));
    expect(column.rows["price.entry"]).toContain(money(CATALOG[market].tiers.starter.month));
    expect(column.currency).toBe(CATALOG[market].currency);
  });

  it("types no currency amount outside its price rows", () => {
    const priceRows = new Set<string>(["price.entry", ...PRICE_IDS]);
    const values = [
      ...Object.entries(column.rows),
      ...Object.entries(column.facts),
    ].filter(([id]) => !priceRows.has(id));
    for (const [id, value] of values) expect({ id, amounts: findCurrencyAmounts(value) }).toEqual({ id, amounts: [] });
  });

  it("takes the trial length from the market", () => {
    expect(column.facts["stampeo.trial"]).toContain(String(TRIAL_DAYS[market]));
    expect(column.rows.trial).toContain(String(TRIAL_DAYS[market]));
  });

  it("states the Growth broadcast allowance and that multiple locations are Pro-only, from the plan facts", () => {
    expect(column.rows["push.broadcasts"]).toContain(String(PLAN_FACTS.growth.broadcastsPerMonth));
    expect(column.rows["locations.multiple"]).toContain("Pro");
    expect(column.rows["locations.multiple"]).not.toMatch(/Starter|Growth/);
  });

  it("says no VAT applies on the French market only", () => {
    const priced = [column.rows["price.entry"], ...PRICE_IDS.map((id) => column.facts[id])];
    for (const value of priced) {
      if (market === "fr") expect(value).toContain("TVA non applicable");
      else expect(value).not.toMatch(/TVA|VAT|tax/i);
    }
  });
});

describe("Stampeo's inline facts", () => {
  it("are the three monthly prices and the trial, and nothing else", () => {
    expect([...STAMPEO_FACT_IDS]).toEqual([...PRICE_IDS, "stampeo.trial"]);
    expect(isStampeoFactId("stampeo.trial")).toBe(true);
    expect(isStampeoFactId("stampeo.price.enterprise")).toBe(false);
    expect(isStampeoFactId("price.entry")).toBe(false);
  });
});

describe("Stampeo's side from the live catalog", () => {
  const realFetch = globalThis.fetch;
  const realBase = process.env.NEXT_PUBLIC_API_URL;
  const requested: string[] = [];

  afterEach(() => {
    globalThis.fetch = realFetch;
    if (realBase === undefined) delete process.env.NEXT_PUBLIC_API_URL;
    else process.env.NEXT_PUBLIC_API_URL = realBase;
    requested.length = 0;
  });

  const respondWith = (ladder: Pricing) => {
    process.env.NEXT_PUBLIC_API_URL = "http://backend.test";
    globalThis.fetch = (async (input: RequestInfo | URL) => {
      requested.push(String(input));
      const tiers = Object.fromEntries(
        Object.entries(ladder.tiers).map(([tier, { month, year }]) => [
          tier,
          { month: { amount: month * 100 }, year: { amount: year * 100 } },
        ]),
      );
      return new Response(JSON.stringify({ currency: ladder.currency, tiers }), { status: 200 });
    }) as typeof fetch;
  };

  it.each(["us", "fr"] as const)("asks for the %s market's own currency and shows the catalog's amounts", async (market) => {
    respondWith(CATALOG[market]);

    const column = await getStampeoColumn(market);

    expect(requested[0]).toContain(`currency=${CATALOG[market].currency}`);
    expect(column.facts["stampeo.price.starter"]).toContain(
      formatMoney(CATALOG[market].tiers.starter.month, CATALOG[market].currency, LOCALE[market]),
    );
  });

  it.each(["us", "fr"] as const)("falls back to the baked ladder on %s when the backend is down, as /pricing does", async (market) => {
    process.env.NEXT_PUBLIC_API_URL = "http://backend.test";
    globalThis.fetch = (async () => {
      throw new Error("connection refused");
    }) as typeof fetch;
    const baked = FALLBACK_PRICING[CATALOG[market].currency];

    const column = await getStampeoColumn(market);

    expect(column.facts["stampeo.price.growth"]).toContain(
      formatMoney(baked.tiers.growth.month, baked.currency, LOCALE[market]),
    );
  });
});

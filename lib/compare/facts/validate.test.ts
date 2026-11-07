import { describe, expect, it } from "bun:test";
import { ACME_FIDELITE, ACME_LOYALTY, BRAVO_CARTE, FIXTURE_FACTS, withUsFacts } from "../__fixtures__";
import type { CompetitorFacts, SourcedFact } from "../types";
import { COMPETITOR_FACTS } from "./index";
import { missingShortValues, todayIso, validateCompetitorFacts } from "./validate";

const TODAY = "2026-11-04";

/** The fixture competitor with its US price fact changed. */
const withPrice = (change: Partial<SourcedFact>) =>
  withUsFacts(ACME_LOYALTY, (facts) => facts.map((fact) => (fact.id === "price.entry" ? { ...fact, ...change } : fact)));

/** The fixture French competitor with its price fact's value changed. */
const withFrenchPrice = (value: string): CompetitorFacts => {
  const fr = ACME_FIDELITE.markets.fr!;
  return { ...ACME_FIDELITE, markets: { fr: { ...fr, facts: fr.facts.map((fact) => (fact.id === "price.entry" ? { ...fact, value } : fact)) } } };
};

describe("today, for the check dates", () => {
  // A fact read at 00:30 in Paris is dated that day, even though UTC is still on the day before.
  it.each([
    ["00:30 in winter (UTC+1)", "2026-11-03T23:30:00Z", "2026-11-04"],
    ["00:30 in summer (UTC+2)", "2026-06-30T22:30:00Z", "2026-07-01"],
    ["23:59 in winter", "2026-11-04T22:59:00Z", "2026-11-04"],
    ["noon", "2026-11-04T11:00:00Z", "2026-11-04"],
  ])("is the Paris calendar day at %s", (_name, instant, day) => {
    expect(todayIso(new Date(instant))).toBe(day);
  });
});

describe("competitor facts", () => {
  it("accept sourced facts read today or earlier, in either market", () => {
    expect(validateCompetitorFacts(FIXTURE_FACTS, TODAY)).toEqual([]);
    expect(validateCompetitorFacts([withPrice({ checkedAt: TODAY })], TODAY)).toEqual([]);
  });

  it("accept a fact read long ago: staleness is a refresh task, not a failure", () => {
    expect(validateCompetitorFacts([withPrice({ checkedAt: "2025-01-15" })], TODAY)).toEqual([]);
  });

  // Each problem names the competitor, market and fact it is about.
  const US_PRICE = "acme-loyalty/us/price\\.entry";
  it.each([
    ["a source that is not https", [withPrice({ sourceUrl: "http://acme-loyalty.example/pricing" })], `${US_PRICE}.*sourceUrl`],
    ["no source URL", [withPrice({ sourceUrl: "" })], `${US_PRICE}.*sourceUrl`],
    ["a source that is not a URL", [withPrice({ sourceUrl: "acme-loyalty.example/pricing" })], `${US_PRICE}.*sourceUrl`],
    ["no quote", [withPrice({ quote: "  " })], `${US_PRICE}.*quote`],
    ["no source title", [withPrice({ sourceTitle: "" })], `${US_PRICE}.*sourceTitle`],
    ["no checked date", [withPrice({ checkedAt: "" })], `${US_PRICE}.*checkedAt`],
    ["a date written day first", [withPrice({ checkedAt: "01/11/2026" })], `${US_PRICE}.*checkedAt`],
    ["a date that does not exist", [withPrice({ checkedAt: "2026-02-30" })], `${US_PRICE}.*checkedAt`],
    ["a date after today", [withPrice({ checkedAt: "2026-11-05" })], `${US_PRICE}.*after today`],
    ["no value", [withPrice({ value: "" })], `${US_PRICE}.*value`],
    ["an empty fact id", [withPrice({ id: "" })], "acme-loyalty/us/.*id is empty"],
    ["a website that is not https", [{ ...ACME_LOYALTY, website: "http://acme-loyalty.example" }], "acme-loyalty.*website"],
    ["no market", [{ ...ACME_LOYALTY, markets: {} }], "acme-loyalty.*no market"],
    ["a market with no facts", [withUsFacts(ACME_LOYALTY, () => [])], "acme-loyalty/us.*no facts"],
    [
      "a pricing page that is not https",
      [{ ...ACME_LOYALTY, markets: { us: { ...ACME_LOYALTY.markets.us!, pricingUrl: "http://acme-loyalty.example/p" } } }],
      "acme-loyalty/us.*pricingUrl",
    ],
    ["a competitor listed twice", [ACME_LOYALTY, ACME_LOYALTY], "acme-loyalty.*twice"],
    ["a French price with no tax basis", [withFrenchPrice("19 € par mois")], "acme-fidelite/fr/price\\.entry.*HT or TTC"],
  ])("are rejected with %s", (_name, registry, message) => {
    expect(validateCompetitorFacts(registry, TODAY).join("\n")).toMatch(new RegExp(message));
  });

  it.each([
    ["an HT price", "19 € HT par mois"],
    ["a TTC price", "29 € TTC par mois"],
    ["a quote-only price", "Sur devis, après une démo : aucun prix publié"],
    ["a price that is not published", "Non communiqué"],
    ["a fee that is none", "aucuns frais d'installation"],
  ])("accept a French price that is %s", (_name, value) => {
    expect(validateCompetitorFacts([withFrenchPrice(value)], TODAY)).toEqual([]);
  });

  describe("short value", () => {
    it.each([
      ["a single character", "$"],
      ["exactly 40 characters", "x".repeat(40)],
      ["a French price with its basis", "Premium, 19 € HT par mois"],
    ])("accepts %s", (_name, short) => {
      expect(validateCompetitorFacts([withPrice({ short })], TODAY)).toEqual([]);
    });

    it.each([
      ["empty", "", "short is empty"],
      ["blank", "   ", "short is empty"],
      ["on two lines", "Yes\nbut only on Pro", "short must be one line"],
      ["over 40 characters", "x".repeat(41), "short is 41 characters"],
    ])("is rejected when it is %s, naming the fact", (_name, short, message) => {
      expect(validateCompetitorFacts([withPrice({ short })], TODAY).join("\n")).toMatch(
        new RegExp(`${US_PRICE}: ${message}`),
      );
    });
  });

  it("do not ask a US price for a tax basis", () => {
    expect(validateCompetitorFacts([withPrice({ value: "$25 a month" })], TODAY)).toEqual([]);
  });

  it("are rejected when a fact id repeats within a market, and not across markets", () => {
    const repeated = withUsFacts(ACME_LOYALTY, (facts) => [...facts, { ...facts[0] }]);
    expect(validateCompetitorFacts([repeated], TODAY).join("\n")).toMatch(/card\.where.*more than once/);

    const bothMarkets: CompetitorFacts = {
      ...ACME_LOYALTY,
      markets: { ...ACME_LOYALTY.markets, fr: ACME_FIDELITE.markets.fr },
    };
    expect(validateCompetitorFacts([bothMarkets], TODAY)).toEqual([]);
  });

  it("hold for the French fixture that quotes TTC", () => {
    expect(validateCompetitorFacts([BRAVO_CARTE], TODAY)).toEqual([]);
  });

  it("hold for every competitor registered in the app, so a bad facts file fails the test run", () => {
    expect(validateCompetitorFacts(COMPETITOR_FACTS)).toEqual([]);
  });
});

describe("short values on the real pages", () => {
  it("lists every standard-row fact with no short value, and asks none of a competitor-specific fact", () => {
    // Acme has card.where, customer.app_required, price.entry and trial (standard) plus support.hours (not).
    const missing = missingShortValues([ACME_LOYALTY]);
    expect(missing).toHaveLength(4);
    expect(missing.join("\n")).toMatch(/acme-loyalty\/us\/price\.entry: no short value/);
    expect(missing.join("\n")).not.toMatch(/support\.hours/);
  });

  it("is satisfied once every standard-row fact has one", () => {
    const complete = withUsFacts(ACME_LOYALTY, (facts) => facts.map((fact) => ({ ...fact, short: "Short" })));
    expect(missingShortValues([complete])).toEqual([]);
  });

  it("holds for every competitor with a page, so no table row falls back to a full sentence", () => {
    expect(missingShortValues(COMPETITOR_FACTS)).toEqual([]);
  });
});

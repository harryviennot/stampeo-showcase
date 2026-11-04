import { describe, expect, it } from "bun:test";
import { ACME_FIDELITE, ACME_LOYALTY, FIXTURE_FACTS } from "../__fixtures__";
import type { CompetitorFacts, SourcedFact } from "../types";
import { COMPETITOR_FACTS } from "./index";
import { validateCompetitorFacts } from "./validate";

const TODAY = "2026-11-04";

/** The fixture competitor with one of its US facts changed. */
function withFact(id: string, change: Partial<SourcedFact>): CompetitorFacts {
  const us = ACME_LOYALTY.markets.us!;
  return {
    ...ACME_LOYALTY,
    markets: { us: { ...us, facts: us.facts.map((fact) => (fact.id === id ? { ...fact, ...change } : fact)) } },
  };
}

describe("competitor facts", () => {
  it("accept sourced facts read today or earlier, in either market", () => {
    expect(validateCompetitorFacts(FIXTURE_FACTS, TODAY)).toEqual([]);
    expect(validateCompetitorFacts([withFact("trial", { checkedAt: TODAY })], TODAY)).toEqual([]);
  });

  it.each([
    ["a source that is not https", { sourceUrl: "http://acme-loyalty.example/pricing" }, /price\.entry.*sourceUrl/],
    ["no source URL", { sourceUrl: "" }, /price\.entry.*sourceUrl/],
    ["a source that is not a URL", { sourceUrl: "acme-loyalty.example/pricing" }, /price\.entry.*sourceUrl/],
    ["no quote", { quote: "  " }, /price\.entry.*quote/],
    ["no source title", { sourceTitle: "" }, /price\.entry.*sourceTitle/],
    ["no checked date", { checkedAt: "" }, /price\.entry.*checkedAt/],
    ["a date written day first", { checkedAt: "01/11/2026" }, /price\.entry.*checkedAt/],
    ["a date that does not exist", { checkedAt: "2026-02-30" }, /price\.entry.*checkedAt/],
    ["a date after today", { checkedAt: "2026-11-05" }, /price\.entry.*after today/],
    ["no value", { value: "" }, /price\.entry.*value/],
  ])("are rejected with %s", (_name, change, message) => {
    const problems = validateCompetitorFacts([withFact("price.entry", change)], TODAY);
    expect(problems.length).toBeGreaterThan(0);
    expect(problems.join("\n")).toMatch(message);
    expect(problems.join("\n")).toContain("acme-loyalty");
  });

  it("are rejected when a fact id repeats within a market, and not across markets", () => {
    const us = ACME_LOYALTY.markets.us!;
    const repeated: CompetitorFacts = {
      ...ACME_LOYALTY,
      markets: { us: { ...us, facts: [...us.facts, { ...us.facts[0] }] } },
    };
    expect(validateCompetitorFacts([repeated], TODAY).join("\n")).toMatch(/card\.where.*more than once/);

    const bothMarkets: CompetitorFacts = {
      ...ACME_LOYALTY,
      markets: { ...ACME_LOYALTY.markets, fr: ACME_FIDELITE.markets.fr },
    };
    expect(validateCompetitorFacts([bothMarkets], TODAY)).toEqual([]);
  });

  it("are rejected when a competitor id repeats", () => {
    expect(validateCompetitorFacts([ACME_LOYALTY, ACME_LOYALTY], TODAY).join("\n")).toMatch(/acme-loyalty.*twice/);
  });

  it("are rejected when a competitor has no market, or a market has no facts or no https pricing page", () => {
    const empty = validateCompetitorFacts([{ ...ACME_LOYALTY, markets: {} }], TODAY);
    expect(empty.join("\n")).toMatch(/no market/);

    const noFacts = validateCompetitorFacts(
      [{ ...ACME_LOYALTY, markets: { us: { pricingUrl: "https://acme-loyalty.example/pricing", facts: [] } } }],
      TODAY,
    );
    expect(noFacts.join("\n")).toMatch(/no facts/);

    const badPricing = validateCompetitorFacts(
      [{ ...ACME_LOYALTY, markets: { us: { ...ACME_LOYALTY.markets.us!, pricingUrl: "http://acme-loyalty.example/p" } } }],
      TODAY,
    );
    expect(badPricing.join("\n")).toMatch(/pricingUrl/);
  });

  it("hold for every competitor registered in the app, so a bad facts file fails the test run", () => {
    expect(validateCompetitorFacts(COMPETITOR_FACTS)).toEqual([]);
  });
});

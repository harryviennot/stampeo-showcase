import { describe, expect, it } from "bun:test";
import { ACME_LOYALTY } from "./__fixtures__";
import { checkedDate } from "./checked";
import type { ComparisonPage } from "./types";

const page = (content: string): ComparisonPage => ({
  market: "us",
  locale: "en",
  slug: "acme-loyalty",
  competitor: "acme-loyalty",
  title: "Acme Loyalty vs Stampeo",
  description: "A description.",
  faqs: [{ question: "Q?", answer: "A." }],
  draft: false,
  content,
});

describe("the date a page was checked", () => {
  it("is the oldest check among the standard rows the competitor has, whether or not the prose uses them", () => {
    // Standard rows were read 20 Oct, 28 Oct, 1 Nov and 5 Oct; the 30 Sep fact is not a row.
    expect(checkedDate(page("No facts in the prose."), ACME_LOYALTY)).toBe("2026-10-05");
  });

  it("goes back further when the prose cites an older fact that is not a standard row", () => {
    expect(checkedDate(page('Support: <Fact id="support.hours" />.'), ACME_LOYALTY)).toBe("2026-09-30");
  });

  it("does not look fresher because one fact was read again", () => {
    const reread = {
      ...ACME_LOYALTY,
      markets: {
        us: {
          ...ACME_LOYALTY.markets.us!,
          facts: ACME_LOYALTY.markets.us!.facts.map((fact) =>
            fact.id === "trial" ? { ...fact, checkedAt: "2026-11-03" } : fact,
          ),
        },
      },
    };
    expect(checkedDate(page(""), reread)).toBe("2026-10-20");
  });

  it("ignores Stampeo's own facts, which carry no check date", () => {
    const body = 'Ours: <Fact id="stampeo.price.starter" /> and <Fact id="stampeo.trial" />.';
    expect(checkedDate(page(body), ACME_LOYALTY)).toBe("2026-10-05");
  });

  it("reads only the page's own market", () => {
    const bothMarkets = {
      ...ACME_LOYALTY,
      markets: {
        ...ACME_LOYALTY.markets,
        fr: {
          pricingUrl: "https://acme-loyalty.example/tarifs",
          facts: [
            {
              id: "card.where",
              value: "Dans l'application",
              sourceUrl: "https://acme-loyalty.example/fr",
              sourceTitle: "Acme",
              quote: "Dans l'application",
              checkedAt: "2026-01-02",
            },
          ],
        },
      },
    };
    expect(checkedDate(page(""), bothMarkets)).toBe("2026-10-05");
  });

  it("fails loudly for a page that uses no competitor fact", () => {
    const noRows = { ...ACME_LOYALTY, markets: { us: { ...ACME_LOYALTY.markets.us!, facts: [ACME_LOYALTY.markets.us!.facts[4]] } } };
    expect(() => checkedDate(page("Nothing cited."), noRows)).toThrow(/no competitor fact/i);
  });
});

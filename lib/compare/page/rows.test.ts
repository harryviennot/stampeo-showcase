import { describe, expect, it } from "bun:test";
import { FALLBACK_PRICING } from "../../pricing";
import { ACME_FIDELITE, ACME_LOYALTY, withUsFacts } from "../__fixtures__";
import { buildStampeoColumn } from "../stampeo";
import { STANDARD_FACT_IDS, type CompetitorFacts, type SourcedFact } from "../types";
import { COPY } from "./copy";
import { COMPETITOR_FACTS } from "../facts";
import { ROW_GROUPS, competitorText, tableGroups, type TableGroup, type TableRow } from "./rows";

/** French typography uses no-break spaces; the tests read them as plain ones. */
const norm = (text: string) => text.replace(/[\u00a0\u202f]/g, " ");

const US = buildStampeoColumn("us", FALLBACK_PRICING.usd);
const FR = buildStampeoColumn("fr", FALLBACK_PRICING.eur);

const rowsOf = (groups: TableGroup[]) => groups.flatMap((group) => group.rows);
const find = (groups: TableGroup[], id: string): TableRow => rowsOf(groups).find((row) => row.id === id)!;

/** The fixture US competitor with one fact changed. */
const withFact = (id: string, change: Partial<SourcedFact>): CompetitorFacts =>
  withUsFacts(ACME_LOYALTY, (facts) => facts.map((fact) => (fact.id === id ? { ...fact, ...change } : fact)));

/** The fixture French competitor with its price fact changed. */
const withFrenchPrice = (change: Partial<SourcedFact>): CompetitorFacts => {
  const fr = ACME_FIDELITE.markets.fr!;
  return { ...ACME_FIDELITE, markets: { fr: { ...fr, facts: fr.facts.map((fact) => (fact.id === "price.entry" ? { ...fact, ...change } : fact)) } } };
};

describe("the themes of a comparison table", () => {
  it("are four, in a fixed order, and hold every standard row exactly once, except the languages the table does not show", () => {
    expect(ROW_GROUPS.map((group) => group.id)).toEqual(["customer", "program", "counter", "price"]);
    expect(ROW_GROUPS.flatMap((group) => group.rows).sort()).toEqual(STANDARD_FACT_IDS.filter((id) => id !== "languages").sort());
  });

  it("put each row under the theme the owner looks for it in", () => {
    expect(Object.fromEntries(ROW_GROUPS.map((group) => [group.id, group.rows]))).toEqual({
      customer: ["card.where", "customer.app_required"],
      program: ["program.types", "designer", "push.automatic", "push.broadcasts"],
      counter: ["staff.scanning", "pos.integration", "locations.multiple", "export"],
      price: ["price.entry", "trial", "commitment"],
    });
  });

  it("are named in the page's language", () => {
    expect(Object.values(COPY.us.groupLabels)).toEqual(["Your customer's side", "The program", "At the counter", "Price and commitment"]);
    expect(Object.values(COPY.fr.groupLabels)).toEqual(["Côté client", "Le programme", "Au comptoir", "Prix et engagement"]);
  });
});

describe("the rows of a comparison table", () => {
  const groups = tableGroups({ market: "us", competitor: ACME_LOYALTY, stampeo: US });

  it("are the standard rows the competitor has a fact for, grouped by theme in the themes' order, and no other fact", () => {
    // Acme has card.where, customer.app_required, price.entry and trial, plus support.hours (not a standard row).
    expect(groups.map((group) => [group.id, group.rows.map((row) => row.id)])).toEqual([
      ["customer", ["card.where", "customer.app_required"]],
      ["price", ["price.entry", "trial"]],
    ]);
  });

  it("drop a theme the competitor has no row for", () => {
    expect(groups.map((group) => group.id)).not.toContain("counter");
  });

  it("are labelled, and so are their themes, in the page's language", () => {
    const fr = tableGroups({ market: "fr", competitor: ACME_FIDELITE, stampeo: FR });
    expect(fr.map((group) => group.label)).toEqual(["Côté client", "Prix et engagement"]);
    expect(fr.flatMap((group) => group.rows.map((row) => row.label))).toEqual(["Où vit la carte du client", "Plan payant le moins cher"]);
  });

  it("leave out the languages a competitor lists: they are no argument for a small shop", () => {
    const withLanguages = withUsFacts(ACME_LOYALTY, (facts) => [
      ...facts,
      { ...facts[0], id: "languages", value: "English and Spanish", short: "English and Spanish" },
    ]);
    const shown = rowsOf(tableGroups({ market: "us", competitor: withLanguages, stampeo: US })).map((row) => row.id);

    expect(shown).toEqual(["card.where", "customer.app_required", "price.entry", "trial"]);
  });

  it("never include languages for any competitor with a page, in either market", () => {
    for (const competitor of COMPETITOR_FACTS) {
      for (const market of ["us", "fr"] as const) {
        if (!competitor.markets[market]) continue;
        const shown = rowsOf(tableGroups({ market, competitor, stampeo: market === "us" ? US : FR })).map((row) => row.id);
        expect({ competitor: competitor.id, market, languages: shown.includes("languages") }).toEqual({
          competitor: competitor.id,
          market,
          languages: false,
        });
      }
    }
  });

  it("carry no yes or no verdict: a cell is words, and is the same shape for both products", () => {
    for (const row of rowsOf(groups)) {
      expect(Object.keys(row.competitor).sort()).toEqual(Object.keys(row.stampeo).sort());
      expect(row.competitor).not.toHaveProperty("tone");
    }
  });
});

describe("the competitor's side of a row", () => {
  it("is the fact's short value, with nothing else to show", () => {
    const competitor = withFact("card.where", { short: "Their own app" });
    const { competitor: cell } = find(tableGroups({ market: "us", competitor, stampeo: US }), "card.where");

    expect(cell).toEqual({ short: "Their own app", taxLine: null });
  });

  it("falls back to the full value while a fact has no short value", () => {
    const { competitor: cell } = find(tableGroups({ market: "us", competitor: ACME_LOYALTY, stampeo: US }), "card.where");
    expect(cell).toEqual({ short: "Their own app on the customer's phone", taxLine: null });
  });
});

describe("Stampeo's side of a row", () => {
  it("is Stampeo's short value", () => {
    const { stampeo: cell } = find(tableGroups({ market: "us", competitor: ACME_LOYALTY, stampeo: US }), "card.where");
    expect(cell).toEqual({ short: US.rowsShort["card.where"], taxLine: null });
  });
});

describe("a competitor's price on a French page", () => {
  it("keeps the published HT price and adds its TTC equivalent at 20 %", () => {
    expect(norm(competitorText("19 € HT par mois", "fr"))).toBe("19 € HT (soit 22,80 € TTC, TVA à 20 %) par mois");
  });

  it("converts every HT amount in the value, with a decimal comma", () => {
    const text = norm(competitorText("9,90 € HT par mois ou 99 € HT par an", "fr"));
    expect(text).toContain("9,90 € HT (soit 11,88 € TTC");
    expect(text).toContain("99 € HT (soit 118,80 € TTC");
  });

  it.each([
    ["a space", "1 200 € HT par an"],
    ["a no-break space", "1\u00a0200 € HT par an"],
    ["a narrow no-break space", "1\u202f200 € HT par an"],
  ])("reads a thousands separator written as %s", (_name, value) => {
    expect(norm(competitorText(value, "fr"))).toBe("1 200 € HT (soit 1 440 € TTC, TVA à 20 %) par an");
  });

  it("converts a thousands amount with decimals", () => {
    expect(norm(competitorText("1 234,50 € HT", "fr"))).toContain("soit 1 481,40 € TTC");
  });

  it("leaves the number before an amount alone", () => {
    expect(norm(competitorText("Jusqu'à 5 000 clients, 19 € HT par mois", "fr"))).toBe(
      "Jusqu'à 5 000 clients, 19 € HT (soit 22,80 € TTC, TVA à 20 %) par mois",
    );
  });

  it.each([
    ["a price already given TTC", "23 € TTC par mois"],
    ["a quote-only price", "Sur devis"],
    ["an HT price with no amount to convert", "Tarif HT sur demande"],
  ])("leaves %s as published", (_name, value) => {
    expect(competitorText(value, "fr")).toBe(value);
  });

  it("is not touched on a US page", () => {
    expect(competitorText("$25 a month, billed monthly", "us")).toBe("$25 a month, billed monthly");
  });
});

describe("the tax line under a price", () => {
  const priceRow = (competitor: CompetitorFacts) => find(tableGroups({ market: "fr", competitor, stampeo: FR }), "price.entry");

  it("gives the TTC equivalent of an HT short price, and says Stampeo's price carries no VAT", () => {
    const row = priceRow(withFrenchPrice({ short: "Essentiel, 19 € HT par mois" }));

    expect(row.competitor.short).toBe("Essentiel, 19 € HT par mois");
    expect(norm(row.competitor.taxLine!)).toBe("soit 22,80 € TTC, TVA à 20 %");
    expect(row.stampeo.taxLine).toBe("TVA non applicable");
  });

  it.each([
    ["a price already given TTC", { short: "Essentiel, 23 € TTC par mois", value: "23 € TTC par mois" }],
    ["a quote-only price", { short: "Sur devis", value: "Sur devis" }],
  ])("is absent for %s", (_name, change) => {
    expect(priceRow(withFrenchPrice(change)).competitor.taxLine).toBeNull();
  });

  it("is absent on a US page, for both products", () => {
    const row = find(tableGroups({ market: "us", competitor: ACME_LOYALTY, stampeo: US }), "price.entry");
    expect(row.competitor.taxLine).toBeNull();
    expect(row.stampeo.taxLine).toBeNull();
  });

  it("only ever sits on the price row", () => {
    const rows = rowsOf(tableGroups({ market: "fr", competitor: withFrenchPrice({ short: "Essentiel, 19 € HT par mois" }), stampeo: FR }));
    expect(rows.filter((row) => row.stampeo.taxLine || row.competitor.taxLine).map((row) => row.id)).toEqual(["price.entry"]);
  });
});

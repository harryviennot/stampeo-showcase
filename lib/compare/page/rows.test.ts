import { describe, expect, it } from "bun:test";
import { FALLBACK_PRICING } from "../../pricing";
import { ACME_FIDELITE, ACME_LOYALTY, withUsFacts } from "../__fixtures__";
import { buildStampeoColumn } from "../stampeo";
import { STANDARD_FACT_IDS, type CompetitorFacts, type SourcedFact } from "../types";
import { COPY } from "./copy";
import { ROW_GROUPS, competitorText, hasDetail, openableRows, tableGroups, type Side, type TableGroup, type TableRow } from "./rows";

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
  it("are four, in a fixed order, and hold every standard row exactly once", () => {
    expect(ROW_GROUPS.map((group) => group.id)).toEqual(["customer", "program", "counter", "price"]);
    expect(ROW_GROUPS.flatMap((group) => group.rows).sort()).toEqual([...STANDARD_FACT_IDS].sort());
  });

  it("put each row under the theme the owner looks for it in", () => {
    expect(Object.fromEntries(ROW_GROUPS.map((group) => [group.id, group.rows]))).toEqual({
      customer: ["card.where", "customer.app_required", "languages"],
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

  it("carry no yes or no verdict: a cell is words, and is the same shape for both products", () => {
    for (const row of rowsOf(groups)) {
      expect(Object.keys(row.competitor).sort()).toEqual(Object.keys(row.stampeo).sort());
      expect(row.competitor).not.toHaveProperty("tone");
    }
  });
});

describe("the competitor's side of a row", () => {
  it("shows the fact's short value at a glance, the full sentence as the detail, and the page it was read on", () => {
    const competitor = withFact("card.where", { short: "Their own app" });
    const { competitor: cell } = find(tableGroups({ market: "us", competitor, stampeo: US }), "card.where");

    expect(cell.short).toBe("Their own app");
    expect(cell.detail).toBe("Their own app on the customer's phone");
    expect(cell.source).toEqual({ url: "https://acme-loyalty.example/pricing", title: "Acme Loyalty pricing" });
  });

  it("falls back to the full value, with nothing repeated under it, while a fact has no short value", () => {
    const { competitor: cell } = find(tableGroups({ market: "us", competitor: ACME_LOYALTY, stampeo: US }), "card.where");

    expect(cell.short).toBe("Their own app on the customer's phone");
    expect(cell.detail).toBeNull();
    expect(cell.source?.url).toBe("https://acme-loyalty.example/pricing");
  });

  it("shows no detail when the short value is the whole sentence", () => {
    const competitor = withFact("trial", { short: "7-day free trial" });
    expect(find(tableGroups({ market: "us", competitor, stampeo: US }), "trial").competitor.detail).toBeNull();
  });
});

describe("Stampeo's side of a row", () => {
  const groups = tableGroups({ market: "us", competitor: ACME_LOYALTY, stampeo: US });

  it("shows its short value at a glance and the full Stampeo value as the detail, with no source to read", () => {
    const { stampeo: cell } = find(groups, "card.where");

    expect(cell.short).toBe(US.rowsShort["card.where"]);
    expect(cell.detail).toBe(US.rows["card.where"]);
    expect(cell.source).toBeNull();
  });

  it("shows no detail when the short value says it all", () => {
    expect(find(groups, "trial").stampeo.detail).toBeNull();
    expect(find(groups, "price.entry").stampeo.detail).toBeNull();
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

  it("keeps the TTC equivalent in the full sentence under it, beside the source", () => {
    const row = priceRow(withFrenchPrice({ short: "Essentiel, 19 € HT par mois" }));

    expect(norm(row.competitor.detail!)).toBe("19 € HT (soit 22,80 € TTC, TVA à 20 %) par mois");
    expect(row.competitor.source?.url).toBe("https://acme-fidelite.example/tarifs");
  });

  it("is not repeated as a detail on Stampeo's side", () => {
    expect(priceRow(ACME_FIDELITE).stampeo.detail).toBeNull();
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

describe("the rows that open", () => {
  const side = (change: Partial<Side> = {}): Side => ({ short: "Answer", taxLine: null, detail: null, source: null, ...change });
  const row = (competitor: Partial<Side>, stampeo: Partial<Side>): TableRow => ({
    id: "card.where",
    label: "A row",
    competitor: side(competitor),
    stampeo: side(stampeo),
  });
  const SOURCE = { url: "https://acme-loyalty.example/pricing", title: "Acme pricing" };

  it.each([
    ["a competitor's full sentence", row({ detail: "Full" }, {})],
    ["Stampeo's full sentence", row({}, { detail: "Full" })],
    ["a source to read, with no sentence", row({ source: SOURCE }, {})],
  ])("are the rows with %s", (_name, openable) => {
    expect(hasDetail(openable)).toBe(true);
  });

  it("are not a row with no detail on either side, which gets no toggle", () => {
    expect(hasDetail(row({}, {}))).toBe(false);
  });

  it("are listed by id across the themes, in the table's order", () => {
    const groups = tableGroups({ market: "us", competitor: ACME_LOYALTY, stampeo: US });
    expect(openableRows(groups)).toEqual(["card.where", "customer.app_required", "price.entry", "trial"]);
  });
});

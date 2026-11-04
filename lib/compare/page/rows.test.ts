import { describe, expect, it } from "bun:test";
import { FALLBACK_PRICING } from "../../pricing";
import { ACME_FIDELITE, ACME_LOYALTY } from "../__fixtures__";
import { buildStampeoColumn } from "../stampeo";
import { STANDARD_FACT_IDS, type Market } from "../types";
import { COPY } from "./copy";
import { cellOf, competitorText, tableRows } from "./rows";

/** French typography uses no-break spaces; the tests read them as plain ones. */
const norm = (text: string) => text.replace(/[\u00a0\u202f]/g, " ");

const US = buildStampeoColumn("us", FALLBACK_PRICING.usd);
const FR = buildStampeoColumn("fr", FALLBACK_PRICING.eur);

describe("the rows of a comparison table", () => {
  const rows = tableRows({ market: "us", competitor: ACME_LOYALTY, stampeo: US });

  it("are the standard rows the competitor has a fact for, in the standard order, and no other fact", () => {
    // Acme has card.where, customer.app_required, price.entry and trial, plus support.hours (not a standard row).
    expect(rows.map((row) => row.id)).toEqual(["card.where", "customer.app_required", "price.entry", "trial"]);
  });

  it("put the competitor's sourced value on the left and Stampeo's value for the same row on the right", () => {
    const card = rows.find((row) => row.id === "card.where")!;
    expect(card.label).toBe(COPY.us.rowLabels["card.where"]);
    expect(card.competitor.text).toBe("Their own app on the customer's phone");
    expect(card.stampeo.text).toBe(US.rows["card.where"]);
  });

  it("mark the price row, so a table can show its period and tax basis", () => {
    expect(rows.filter((row) => row.price).map((row) => row.id)).toEqual(["price.entry"]);
  });

  it("show no yes/no icon on the customer-app row, where 'none' is the answer a shop wants", () => {
    const app = rows.find((row) => row.id === "customer.app_required")!;
    expect(US.rows["customer.app_required"]).toMatch(/^None\b/);
    expect(app.stampeo.tone).toBe("plain");
    expect(app.competitor.tone).toBe("plain");
  });

  it("are labelled in the page's language", () => {
    const fr = tableRows({ market: "fr", competitor: ACME_FIDELITE, stampeo: FR });
    expect(fr.map((row) => row.label)).toEqual(["Où vit la carte du client", "Plan payant le moins cher"]);
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

  it("shows up in the table's price row, beside Stampeo's price with no VAT", () => {
    const [, price] = tableRows({ market: "fr", competitor: ACME_FIDELITE, stampeo: FR });
    expect(norm(price.competitor.text)).toContain("22,80");
    expect(price.competitor.text).toContain("TTC");
    expect(price.stampeo.text).toContain("TVA non applicable");
  });
});

describe("a yes or a no in a cell", () => {
  it.each([
    ["us", "Yes, on every stamp", "yes"],
    ["us", "No, staff add them by hand", "no"],
    ["us", "None: no app to download", "no"],
    ["us", "Not published", "plain"],
    ["us", "Notifications on request", "plain"],
    ["us", "Their own app", "plain"],
    ["fr", "Oui, à chaque tampon", "yes"],
    ["fr", "Aucune : ni application, ni compte", "no"],
    ["fr", "Aucun engagement", "no"],
    ["fr", "Non.", "no"],
    ["fr", "Non, pas à ce jour", "no"],
    ["fr", "Non communiqué", "plain"],
    ["fr", "Nombre de points illimité", "plain"],
  ] as const)("on a %s page, %s reads as %s", (market, text, tone) => {
    expect(cellOf(text, market)).toEqual({ text, tone });
  });
});

describe("Stampeo's cells", () => {
  it.each(["us", "fr"] as Market[])("carry a yes or a no where Stampeo's own text starts with one (%s)", (market) => {
    const column = market === "us" ? US : FR;
    const stampeoTone = (id: (typeof STANDARD_FACT_IDS)[number]) => cellOf(column.rows[id], market).tone;
    expect(stampeoTone("push.automatic")).toBe("yes");
    expect(stampeoTone("customer.app_required")).toBe("no");
    expect(stampeoTone("pos.integration")).toBe("no");
  });
});

import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { ComparisonTable } from "@/components/compare/ComparisonTable";
import { ACME_LOYALTY, withUsFacts } from "../__fixtures__";
import { fixtureView } from "../__fixtures__/view";
import type { ComparisonView } from "./view";

/** The visible words: tags dropped, entities decoded, every kind of space a plain one. */
const text = (html: string) =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/[  ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** The fixture page with a short value on its competitor's facts. */
function withShorts(view: ComparisonView, shorts: Record<string, string>): ComparisonView {
  return {
    ...view,
    competitor:
      view.page.market === "us"
        ? withUsFacts(view.competitor, (facts) => facts.map((fact) => ({ ...fact, short: shorts[fact.id] ?? fact.short })))
        : {
            ...view.competitor,
            markets: {
              fr: {
                ...view.competitor.markets.fr!,
                facts: view.competitor.markets.fr!.facts.map((fact) => ({ ...fact, short: shorts[fact.id] ?? fact.short })),
              },
            },
          },
  };
}

const US_VIEW = withShorts(fixtureView("acme-loyalty"), {
  "card.where": "Their own app",
  "customer.app_required": "App and account",
  "price.entry": "$25 a month",
});
const FR_VIEW = withShorts(fixtureView("acme-fidelite"), { "price.entry": "Essentiel, 19 € HT par mois" });

/** The phone list and the table, as the page draws them. */
const split = (html: string) => ({ phone: html.slice(0, html.indexOf("<table")), table: html.slice(html.indexOf("<table")) });

describe("the comparison table on a phone", () => {
  const { phone } = split(renderToStaticMarkup(<ComparisonTable view={US_VIEW} />));

  it("is one card per theme, each with a title, holding one expandable row per fact", () => {
    const cards = phone.match(/<section\b/g) ?? [];
    expect(cards).toHaveLength(2);
    expect(phone.match(/<h3\b/g)).toHaveLength(2);
    expect(text(phone)).toContain("Your customer's side");
    expect(text(phone)).toContain("Price and commitment");
    expect(phone.match(/<details\b/g)).toHaveLength(4);
  });

  it("is closed at first, with both products' short answers side by side in each row's summary", () => {
    const row = phone.match(/<details\b[\s\S]*?<\/details>/)![0];
    const summary = row.match(/<summary\b[\s\S]*?<\/summary>/)![0];

    expect(row).not.toMatch(/<details[^>]*\sopen/);
    expect(text(summary)).toContain("Where the customer's card lives");
    expect(summary.indexOf("Their own app")).toBeGreaterThan(-1);
    expect(summary.indexOf("Their own app")).toBeLessThan(summary.indexOf("Apple Wallet and Google Wallet"));
  });

  it("opens on the full sentence of each product, and the competitor's ends with a link to where it was read", () => {
    const row = phone.match(/<details\b[\s\S]*?<\/details>/)![0];
    const open = row.slice(row.indexOf("</summary>"));

    expect(text(open)).toContain("Their own app on the customer's phone");
    expect(text(open)).toContain("Apple Wallet and Google Wallet, on the customer's phone");
    const link = open.match(/<a\b[^>]*>/)![0];
    expect(link).toContain('href="https://acme-loyalty.example/pricing"');
    expect(link).toContain('target="_blank"');
    expect(link).toContain('rel="noopener nofollow"');
    expect(text(open.match(/<a\b[\s\S]*?<\/a>/)![0])).toContain("Source");
  });

  it("names the two products once per theme, above the rows", () => {
    const card = phone.match(/<section\b[\s\S]*?<\/section>/)![0];
    expect(card.indexOf("Acme Loyalty")).toBeGreaterThan(-1);
    expect(card.indexOf("Acme Loyalty")).toBeLessThan(card.indexOf("<details"));
    expect(card.indexOf("Stampeo")).toBeLessThan(card.indexOf("<details"));
  });

  it("falls back to the full sentence while a fact has no short value, without saying it twice", () => {
    const { phone: bare } = split(renderToStaticMarkup(<ComparisonTable view={fixtureView("acme-loyalty")} />));
    const row = bare.match(/<details\b[\s\S]*?<\/details>/)![0];
    expect(text(row).match(/Their own app on the customer's phone/g)).toHaveLength(1);
  });

  it("keeps the tax line of a French price in the summary, for both products", () => {
    const { phone: fr } = split(renderToStaticMarkup(<ComparisonTable view={FR_VIEW} />));
    const price = fr.match(/<details\b(?:(?!<\/details>)[\s\S])*?Plan payant le moins cher[\s\S]*?<\/details>/)![0];
    const summary = price.match(/<summary\b[\s\S]*?<\/summary>/)![0];

    expect(text(summary)).toContain("soit 22,80 € TTC, TVA à 20 %");
    expect(text(summary)).toContain("TVA non applicable");
    expect(text(price.slice(price.indexOf("</summary>")))).not.toContain("TVA non applicable");
  });
});

describe("the comparison table from the tablet up", () => {
  const { table } = split(renderToStaticMarkup(<ComparisonTable view={US_VIEW} />));

  it("is one real table with the competitor on the left and Stampeo on the right, and one body per theme", () => {
    expect(table.match(/<table\b/g)).toHaveLength(1);
    expect(table.match(/<tbody\b/g)).toHaveLength(2);
    const head = table.match(/<thead[\s\S]*?<\/thead>/)![0];
    expect(head.indexOf("Acme Loyalty")).toBeLessThan(head.indexOf("Stampeo"));
    expect(table.match(/<th[^>]*scope="row"/g)).toHaveLength(4);
  });

  it("keeps the table's roles when the browser stops drawing a table", () => {
    expect(table).toContain('role="table"');
    expect(table.match(/role="row"/g)!.length).toBeGreaterThanOrEqual(7);
    expect(table).toContain('role="rowheader"');
    expect(table).toContain('role="cell"');
  });

  it("shows each cell's short answer with the full sentence and the source under it, no toggle to open", () => {
    const cell = table.match(/<th[^>]*scope="row"[\s\S]*?<\/th>\s*(<td\b[\s\S]*?<\/td>)/)![1];

    expect(text(cell)).toContain("Their own app");
    expect(text(cell)).toContain("Their own app on the customer's phone");
    expect(cell).toContain('href="https://acme-loyalty.example/pricing"');
    expect(cell).toContain('rel="noopener nofollow"');
    expect(table).not.toContain("<details");
  });

  it("repeats the two names above each theme's rows for the eye, hidden from screen readers", () => {
    const body = table.match(/<tbody\b[\s\S]*?<\/tbody>/)![0];
    const header = body.match(/<tr\b[\s\S]*?<\/tr>/)![0];

    expect(text(header)).toContain("Your customer's side");
    expect(header.match(/aria-hidden="true"/g)!.length).toBeGreaterThanOrEqual(2);
  });
});

describe("a French table", () => {
  it("is titled in French, and every theme the competitor has a row for appears in the fixed order", () => {
    const html = renderToStaticMarkup(<ComparisonTable view={FR_VIEW} />);
    expect(text(html)).toContain("Côté client");
    expect(text(html)).toContain("Prix et engagement");
    expect(html.indexOf("Côté client")).toBeLessThan(html.indexOf("Prix et engagement"));
    expect(text(html)).toContain("Source");
  });
});

describe("a table with nothing to compare", () => {
  it("draws nothing for a competitor that has no standard fact", () => {
    const view = { ...fixtureView("acme-loyalty"), competitor: withUsFacts(ACME_LOYALTY, (facts) => facts.filter((fact) => fact.id === "support.hours")) };
    expect(renderToStaticMarkup(<ComparisonTable view={view} />)).toBe("");
  });
});

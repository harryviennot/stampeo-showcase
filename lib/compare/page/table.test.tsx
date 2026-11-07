import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { ComparisonTable } from "@/components/compare/ComparisonTable";
import { ACME_LOYALTY, withUsFacts } from "../__fixtures__";
import { fixtureView } from "../__fixtures__/view";
import { tableGroups } from "./rows";
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
function parts(view: ComparisonView) {
  const html = renderToStaticMarkup(<ComparisonTable view={view} />);
  const tableAt = html.indexOf("<table");
  return { html, phone: html.slice(0, tableAt), table: html.slice(tableAt) };
}

/** Each phone row: its label and the two products' answers. */
const phoneRows = (phone: string) => [...phone.matchAll(/<dt\b[\s\S]*?<\/dd>\s*<dd\b[\s\S]*?<\/dd>/g)].map((match) => match[0]);
/** Each table row that answers a fact, without the theme rows. */
const tableRows = (table: string) => [...table.matchAll(/<tr\b[^>]*>\s*<th[^>]*scope="row"[\s\S]*?<\/tr>/g)].map((match) => match[0]);

describe("the comparison table on a phone", () => {
  const { phone } = parts(US_VIEW);

  it("has a titled section per theme, each listing one row per fact", () => {
    expect(phone.match(/<section\b/g)).toHaveLength(2);
    expect(phone.match(/<h3\b/g)).toHaveLength(2);
    expect(text(phone)).toContain("Your customer's side");
    expect(text(phone)).toContain("Price and commitment");
    expect(phoneRows(phone)).toHaveLength(4);
  });

  it("shows each row's label, then the competitor's short answer and Stampeo's, each named for a screen reader", () => {
    expect(text(phoneRows(phone)[0])).toBe("Where the customer's card lives Acme Loyalty: Their own app Stampeo: Apple Wallet and Google Wallet");
  });

  it("names the two products once per theme, above the rows", () => {
    const card = phone.match(/<section\b[\s\S]*?<\/section>/)![0];
    expect(card.indexOf("Acme Loyalty")).toBeGreaterThan(-1);
    expect(card.indexOf("Acme Loyalty")).toBeLessThan(card.indexOf("<dt"));
    expect(card.indexOf("Stampeo")).toBeLessThan(card.indexOf("<dt"));
  });

  it("falls back to the full sentence while a fact has no short value, and says it once", () => {
    const { phone: bare } = parts(fixtureView("acme-loyalty"));
    expect(text(bare).match(/Their own app on the customer's phone/g)).toHaveLength(1);
  });

  it("keeps the tax line of a French price under each product's short answer", () => {
    const price = phoneRows(parts(FR_VIEW).phone).find((row) => row.includes("Plan payant le moins cher"))!;

    expect(text(price)).toContain("Essentiel, 19 € HT par mois soit 22,80 € TTC, TVA à 20 %");
    expect(text(price)).toContain("TVA non applicable");
  });
});

describe("the comparison table from the tablet up", () => {
  const { table } = parts(US_VIEW);

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

  it("names the two products once, in the column header, whose label column carries no visible title", () => {
    const head = table.match(/<thead[\s\S]*?<\/thead>/)![0];
    const labelHeader = head.match(/<th\b[\s\S]*?<\/th>/)![0];

    expect(labelHeader).toMatch(/<span class="sr-only">Criterion<\/span>/);
    expect(text(head.replace(labelHeader, ""))).toBe("Acme Loyalty Stampeo");
    expect(table.slice(table.indexOf("</thead>"))).not.toContain("Acme Loyalty");
    expect(table.slice(table.indexOf("</thead>"))).not.toContain("Stampeo<");
  });

  it("opens each theme with a full-width label, a title and no product names", () => {
    const body = table.match(/<tbody\b[\s\S]*?<\/tbody>/)![0];
    const header = body.match(/<tr\b[\s\S]*?<\/tr>/)![0];

    expect(header).toContain('colSpan="3"');
    expect(text(header)).toBe("Your customer's side");
  });

  it("shows each row's label and the two short answers, competitor first", () => {
    expect(text(tableRows(table)[0])).toBe("Where the customer's card lives Their own app Apple Wallet and Google Wallet");
  });

  it("keeps the tax line of a French price under its short answer", () => {
    const price = tableRows(parts(FR_VIEW).table).find((row) => row.includes("Plan payant le moins cher"))!;

    expect(text(price)).toContain("Essentiel, 19 € HT par mois soit 22,80 € TTC, TVA à 20 %");
    expect(text(price)).toContain("TVA non applicable");
  });

  it("tints Stampeo's column and no other", () => {
    const head = table.match(/<thead[\s\S]*?<\/thead>/)![0];
    const cells = [...table.matchAll(/<td\b[^>]*>/g)].map((match) => match[0]);

    expect(head.match(/bg-\[var\(--accent\)\]\/5/g)).toHaveLength(1);
    expect(cells.filter((cell) => cell.includes("bg-[var(--accent)]/5"))).toHaveLength(cells.length / 2);
  });
});

describe.each([
  ["a US page", US_VIEW],
  ["a French page", FR_VIEW],
])("the comparison table of %s, at every width", (_name, view) => {
  const { html, phone, table } = parts(view);
  const rows = tableGroups({ market: view.page.market, competitor: view.competitor, stampeo: view.stampeo }).flatMap((group) => group.rows);
  const answer = (side: { short: string; taxLine: string | null }) => [side.short, side.taxLine].filter(Boolean).join(" ");

  it("shows every row's label and its two short answers, with any tax line, and nothing more", () => {
    expect(phoneRows(phone).map(text)).toEqual(
      rows.map((row) => text(`${row.label} ${view.competitor.name}: ${answer(row.competitor)} Stampeo: ${answer(row.stampeo)}`)),
    );
    expect(tableRows(table).map(text)).toEqual(rows.map((row) => text(`${row.label} ${answer(row.competitor)} ${answer(row.stampeo)}`)));
  });

  it("has nothing to open and nothing to follow: no button, no disclosure, no source link", () => {
    expect(html).not.toMatch(/<button\b/);
    expect(html).not.toMatch(/<details\b|<summary\b/);
    expect(html).not.toMatch(/<a\b/);
    expect(text(html)).not.toContain("Source");
  });
});

describe("a table whose facts have short values", () => {
  it("leaves the full sentences out, for both products", () => {
    const { html } = parts(US_VIEW);

    expect(text(html)).not.toContain("Their own app on the customer's phone");
    expect(text(html)).not.toContain("Apple Wallet and Google Wallet, on the customer's phone");
  });
});

describe("a table with nothing to compare", () => {
  it("draws nothing for a competitor that has no standard fact", () => {
    const view = { ...fixtureView("acme-loyalty"), competitor: withUsFacts(ACME_LOYALTY, (facts) => facts.filter((fact) => fact.id === "support.hours")) };
    expect(renderToStaticMarkup(<ComparisonTable view={view} />)).toBe("");
  });
});

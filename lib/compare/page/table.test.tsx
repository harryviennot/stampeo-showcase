import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { ComparisonTable } from "@/components/compare/ComparisonTable";
import { ACME_LOYALTY, withUsFacts } from "../__fixtures__";
import { fixtureView } from "../__fixtures__/view";
import { COPY } from "./copy";
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

/** The button above the table, the phone list and the table, as the page draws them. */
function parts(view: ComparisonView) {
  const html = renderToStaticMarkup(<ComparisonTable view={view} />);
  const phoneAt = html.lastIndexOf("<", html.indexOf("md:hidden"));
  return { html, before: html.slice(0, phoneAt), phone: html.slice(phoneAt, html.indexOf("<table")), table: html.slice(html.indexOf("<table")) };
}

/** The rows that are hidden until opened, and the rest of the table. */
const HIDDEN_ROW = /<tr\b[^>]*\shidden=""[\s\S]*?<\/tr>/g;
const hiddenRows = (table: string) => [...table.matchAll(HIDDEN_ROW)].map((match) => match[0]);
const shownTable = (table: string) => table.replace(HIDDEN_ROW, "");

describe("the comparison table on a phone", () => {
  const { phone } = parts(US_VIEW);

  it("is one card per theme, each with a title, holding one expandable row per fact", () => {
    expect(phone.match(/<section\b/g)).toHaveLength(2);
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
    const { phone: bare } = parts(fixtureView("acme-loyalty"));
    const row = bare.match(/<details\b[\s\S]*?<\/details>/)![0];
    expect(text(row).match(/Their own app on the customer's phone/g)).toHaveLength(1);
  });

  it("keeps the tax line of a French price in the summary, for both products", () => {
    const { phone: fr } = parts(FR_VIEW);
    const price = fr.match(/<details\b(?:(?!<\/details>)[\s\S])*?Plan payant le moins cher[\s\S]*?<\/details>/)![0];
    const summary = price.match(/<summary\b[\s\S]*?<\/summary>/)![0];

    expect(text(summary)).toContain("soit 22,80 € TTC, TVA à 20 %");
    expect(text(summary)).toContain("TVA non applicable");
    expect(text(price.slice(price.indexOf("</summary>")))).not.toContain("TVA non applicable");
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
    const shown = shownTable(table);
    expect(shown.slice(shown.indexOf("</thead>"))).not.toContain("Acme Loyalty");
    expect(shown.slice(shown.indexOf("</thead>"))).not.toContain("Stampeo<");
  });

  it("opens each theme with a full-width label, a title and no product names", () => {
    const body = table.match(/<tbody\b[\s\S]*?<\/tbody>/)![0];
    const header = body.match(/<tr\b[\s\S]*?<\/tr>/)![0];

    expect(header).toContain('colSpan="3"');
    expect(text(header)).toBe("Your customer's side");
  });

  it("shows only the label and the short answers of each row until it is opened", () => {
    const shown = shownTable(table);

    expect(text(shown)).toContain("Their own app");
    expect(text(shown)).toContain("Apple Wallet and Google Wallet");
    expect(text(shown)).not.toContain("on the customer's phone");
    expect(shown).not.toContain("<a ");
  });

  it("holds each row's full sentences and the competitor's source in a hidden row of the same markup, one per row", () => {
    const hidden = hiddenRows(table);

    expect(hidden).toHaveLength(4);
    expect(text(hidden[0])).toContain("Their own app on the customer's phone");
    expect(text(hidden[0])).toContain("Apple Wallet and Google Wallet, on the customer's phone");
    const link = hidden[0].match(/<a\b[^>]*>/)![0];
    expect(link).toContain('href="https://acme-loyalty.example/pricing"');
    expect(link).toContain('rel="noopener nofollow"');
    expect(link).toContain('target="_blank"');
  });

  it("gives each row a closed toggle in its label cell that points at its hidden row and is easy to tap", () => {
    const labelCell = table.match(/<th[^>]*scope="row"[\s\S]*?<\/th>/)![0];
    const button = labelCell.match(/<button\b[^>]*>/)![0];
    const controls = button.match(/aria-controls="([^"]+)"/)![1];

    expect(button).toContain('aria-expanded="false"');
    expect(button).toContain('type="button"');
    expect(button).toMatch(/class="[^"]*\bmin-h-11\b/);
    expect(text(labelCell)).toBe("Where the customer's card lives");
    expect(hiddenRows(table)[0]).toContain(`id="${controls}"`);
  });

  it("keeps the tax line of a French price under its short answer, in view before anything is opened", () => {
    const fr = shownTable(parts(FR_VIEW).table);
    const price = fr.match(/<th[^>]*scope="row"(?:(?!<\/tr>)[\s\S])*Plan payant le moins cher[\s\S]*?<\/tr>/)![0];

    expect(text(price)).toContain("soit 22,80 € TTC, TVA à 20 %");
    expect(text(price)).toContain("TVA non applicable");
  });

  it("tints Stampeo's column and no other", () => {
    const head = table.match(/<thead[\s\S]*?<\/thead>/)![0];
    const cells = [...shownTable(table).matchAll(/<td\b[^>]*>/g)].map((match) => match[0]);

    expect(head.match(/bg-\[var\(--accent\)\]\/5/g)).toHaveLength(1);
    expect(cells.filter((cell) => cell.includes("bg-[var(--accent)]/5"))).toHaveLength(cells.length / 2);
  });
});

describe("the button above the table", () => {
  it.each([
    ["English", US_VIEW, "Show all details and sources"],
    ["French", FR_VIEW, "Afficher le détail et les sources"],
  ])("offers to open every row, in %s", (_name, view, label) => {
    const { before } = parts(view);

    expect(text(before)).toBe(label);
    expect(before).toContain('type="button"');
    expect(text(before)).toBe(COPY[view.page.market].table.showAll);
  });

  it("has a word for its next press in both languages", () => {
    expect(COPY.us.table.hideAll).toBe("Hide details");
    expect(COPY.fr.table.hideAll).toBe("Masquer le détail");
  });
});

describe("a table with nothing to compare", () => {
  it("draws nothing for a competitor that has no standard fact", () => {
    const view = { ...fixtureView("acme-loyalty"), competitor: withUsFacts(ACME_LOYALTY, (facts) => facts.filter((fact) => fact.id === "support.hours")) };
    expect(renderToStaticMarkup(<ComparisonTable view={view} />)).toBe("");
  });
});

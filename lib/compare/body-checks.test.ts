import { describe, expect, it } from "bun:test";
import { factIdsIn, findCurrencyAmounts, findInternalLinks, findMarkdownTables, hasComparisonTable } from "./body-checks";

describe("typed currency amounts", () => {
  it.each([
    "Plans start at $25 a month.",
    "Plans start at $ 25.",
    "Starts at US$25.",
    "Plans start at 25 $.",
    "Costs €25 a month.",
    "Costs 25€ par mois.",
    "Coûte 25 € par mois.",
    "Coûte 19,90 € HT.",
    "Coûte 1 200 € par an.",
    "Costs $1,200.50 a year.",
    "Costs 25 EUR a month.",
    "Costs EUR 25 a month.",
    "Costs 25 USD a month.",
    "Costs USD 25 a month.",
    "Coûte 25 euros par mois.",
    "Costs 25 dollars a month.",
    "Costs £25 a month.",
  ])("flags: %s", (line) => {
    expect(findCurrencyAmounts(line)).toHaveLength(1);
    expect(findCurrencyAmounts(`First line\n\n${line}`)[0].line).toBe(3);
  });

  it.each([
    "A 14-day free trial.",
    "Two plans, 3 months, 20% off.",
    "Paid in dollars or euros, depending on the country.",
    "Il y a 25 clients.",
    "Version 2.5 of the app.",
    "Use <Fact id=\"stampeo.price.starter\" /> for Stampeo.",
    "",
  ])("lets through: %s", (line) => {
    expect(findCurrencyAmounts(line)).toEqual([]);
  });
});

describe("markdown tables", () => {
  const table = ["| Plan | Price |", "| --- | --- |", "| Starter | 1 |"].join("\n");

  it.each([
    ["a pipe table", table, 1],
    ["a table without outer pipes", "Plan | Price\n--- | ---\nStarter | 1", 1],
    ["an aligned table", "| a | b |\n|:--|--:|\n| 1 | 2 |", 1],
    ["a one-column table", "| a |\n|---|\n| 1 |", 1],
    ["a table after a paragraph", `Some text.\n\n${table}`, 3],
  ])("flags %s", (_name, body, line) => {
    expect(findMarkdownTables(body).map((hit) => hit.line)).toEqual([line]);
  });

  it.each([
    ["a horizontal rule", "Text\n\n---\n\nMore text"],
    ["a pipe in a sentence", "Pick A | B, then continue."],
    ["a front-matter-like rule under a heading", "Heading\n---\nText"],
    ["a table inside a code fence", "```\n| a | b |\n| - | - |\n```"],
    ["no table at all", "Just prose."],
  ])("lets through %s", (_name, body) => {
    expect(findMarkdownTables(body)).toEqual([]);
  });

  it("flags a raw HTML table too", () => {
    expect(findMarkdownTables("Text\n<table>\n<tr><td>1</td></tr>\n</table>").map((hit) => hit.line)).toEqual([2]);
  });
});

describe("fact ids in a body", () => {
  it("lists every <Fact> id, once each, in order of appearance", () => {
    const body = `One <Fact id="price.entry" /> two <Fact id='trial'/> three <Fact id="price.entry"></Fact>.`;
    expect(factIdsIn(body).map((hit) => hit.id)).toEqual(["price.entry", "trial", "price.entry"]);
  });

  it("reports the line of each use", () => {
    expect(factIdsIn('a\nb <Fact id="trial" />').map((hit) => hit.line)).toEqual([2]);
  });

  it("flags a <Fact> whose id is not a plain string", () => {
    expect(factIdsIn("Price: <Fact id={id} />").map((hit) => hit.id)).toEqual([null]);
    expect(factIdsIn("Price: <Fact />").map((hit) => hit.id)).toEqual([null]);
  });
});

describe("the comparison table in a body", () => {
  it.each(["<ComparisonTable />", "<ComparisonTable/>", "Intro.\n\n<ComparisonTable />\n\nOutro."])("is found in: %s", (body) => {
    expect(hasComparisonTable(body)).toBe(true);
  });

  it.each([
    ["no table at all", "Just prose."],
    ["a table inside a code fence", "```mdx\n<ComparisonTable />\n```"],
    ["another component", "<ComparisonTables />"],
  ])("is missing with %s", (_name, body) => {
    expect(hasComparisonTable(body)).toBe(false);
  });
});

describe("internal links in a body", () => {
  it("lists the site paths of markdown links and of href attributes, with their line", () => {
    const body = 'Read [the prices](/us/pricing) first.\n\nOr <a href="/onboarding?plan=growth">start</a>.\n\n[Docs](/docs "A title")';
    expect(findInternalLinks(body)).toEqual([
      { href: "/us/pricing", line: 1 },
      { href: "/onboarding?plan=growth", line: 3 },
      { href: "/docs", line: 5 },
    ]);
  });

  it.each([
    ["an external link", "[Them](https://acme.example/pricing)"],
    ["a protocol-relative link", "[Them](//acme.example/pricing)"],
    ["a mail link", "[Write](mailto:contact@stampeo.app)"],
    ["an anchor", "[Below](#sources)"],
    ["a link in a code fence", "```\n[Prices](/pricing)\n```"],
  ])("ignores %s", (_name, body) => {
    expect(findInternalLinks(body)).toEqual([]);
  });
});

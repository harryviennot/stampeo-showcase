import { afterAll, describe, expect, it } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import yaml from "js-yaml";
import { FIXTURES, FIXTURE_FACTS, FIXTURE_SLUGS } from "./__fixtures__";
import {
  allComparisonPages,
  comparisonPages,
  comparisonPath,
  comparisonsForMarket,
} from "./content";

const dirs: string[] = [];
afterAll(() => {
  for (const dir of dirs) rmSync(dir, { recursive: true, force: true });
});

const slugs = (pages: Array<{ slug: string }>) => pages.map((page) => page.slug).sort();

describe("comparison pages on disk", () => {
  it("lists every page with drafts, and only the published ones otherwise", () => {
    expect(slugs(allComparisonPages(FIXTURES))).toEqual(
      [...FIXTURE_SLUGS.us, ...FIXTURE_SLUGS.usDraft, ...FIXTURE_SLUGS.fr].sort(),
    );
    expect(slugs(comparisonPages(FIXTURES))).toEqual([...FIXTURE_SLUGS.us, ...FIXTURE_SLUGS.fr].sort());
  });

  it("puts English files on the US market and French files on the FR market, with the frontmatter and body", () => {
    const pages = allComparisonPages(FIXTURES);
    const us = pages.find((page) => page.slug === "acme-loyalty");
    const fr = pages.find((page) => page.slug === "acme-fidelite");

    expect(us).toMatchObject({
      market: "us",
      locale: "en",
      competitor: "acme-loyalty",
      title: "Acme Loyalty vs Stampeo: prices, pros and cons",
      draft: false,
    });
    expect(us?.faqs.map((faq) => faq.question)).toEqual([
      "Can I move my Acme Loyalty customers to Stampeo?",
      "Does Stampeo need an app for customers?",
    ]);
    expect(us?.content).toContain('<Fact id="price.entry" />');
    expect(fr).toMatchObject({ market: "fr", locale: "fr", competitor: "acme-fidelite", draft: false });
    expect(pages.find((page) => page.slug === "acme-loyalty-draft")?.draft).toBe(true);
  });

  it("serves US pages at /us/vs/<slug> and FR pages at /comparatif/<slug>", () => {
    const pages = comparisonPages(FIXTURES);

    expect(comparisonPath(pages.find((page) => page.slug === "acme-loyalty")!)).toBe("/us/vs/acme-loyalty");
    expect(comparisonPath(pages.find((page) => page.slug === "acme-fidelite")!)).toBe("/comparatif/acme-fidelite");
  });

  it("lists the other published pages of the same market, never a draft or the other market", () => {
    expect(slugs(comparisonsForMarket("us", { excludeSlug: "acme-loyalty", ...FIXTURES }))).toEqual(["globex-stamps"]);
    expect(slugs(comparisonsForMarket("us", FIXTURES))).toEqual([...FIXTURE_SLUGS.us].sort());
    expect(slugs(comparisonsForMarket("fr", { excludeSlug: "acme-fidelite", ...FIXTURES }))).toEqual([]);
  });

  it("loads an empty or missing content folder as no pages", () => {
    const empty = mkdtempSync(join(tmpdir(), "compare-empty-"));
    dirs.push(empty);
    mkdirSync(join(empty, "en"));

    expect(allComparisonPages({ root: empty, facts: FIXTURE_FACTS })).toEqual([]);
    expect(allComparisonPages({ root: join(empty, "missing"), facts: FIXTURE_FACTS })).toEqual([]);
  });

  it("holds for the pages in the repository, so a bad page fails the test run", () => {
    expect(() => allComparisonPages()).not.toThrow();
  });
});

const BODY = [
  '<ChooseIf side="competitor">',
  "",
  "- Theirs.",
  "",
  "</ChooseIf>",
  "",
  '<ChooseIf side="stampeo">',
  "",
  "- Ours.",
  "",
  "</ChooseIf>",
  "",
  "<ComparisonTable />",
  "",
].join("\n");

const FRONT = {
  competitor: "acme-loyalty",
  title: "Acme Loyalty vs Stampeo",
  description: "A description.",
  faqs: [{ question: "A question?", answer: "An answer." }],
  draft: false,
};

/** An MDX file with valid defaults; a key set to undefined is left out. */
const source = (front: Record<string, unknown> = {}, body = BODY) =>
  `---\n${yaml.dump({ ...FRONT, ...front }, { skipInvalid: true })}---\n\n${body}`;

/** Loads one file from a throwaway content folder against the fixture facts. */
function load(file: string, { locale = "en", slug = "acme-loyalty" } = {}) {
  const root = mkdtempSync(join(tmpdir(), "compare-"));
  dirs.push(root);
  mkdirSync(join(root, locale));
  writeFileSync(join(root, locale, `${slug}.mdx`), file);
  return allComparisonPages({ root, facts: FIXTURE_FACTS });
}

describe("comparison page validation", () => {
  it("accepts the baseline page the cases below break one rule at a time", () => {
    expect(load(source()).map((page) => page.slug)).toEqual(["acme-loyalty"]);
  });

  it.each([
    ["an unknown frontmatter key", source({ author: "Harry" }), /acme-loyalty\.mdx.*author/s],
    ["no title", source({ title: undefined }), /acme-loyalty\.mdx.*title/s],
    ["no description", source({ description: "" }), /acme-loyalty\.mdx.*description/s],
    ["no draft flag", source({ draft: undefined }), /acme-loyalty\.mdx.*draft/s],
    ["a draft flag that is not a boolean", source({ draft: "yes" }), /acme-loyalty\.mdx.*draft/s],
    ["no FAQ", source({ faqs: [] }), /acme-loyalty\.mdx.*faqs/s],
    ["an FAQ without an answer", source({ faqs: [{ question: "Q?" }] }), /acme-loyalty\.mdx.*faqs/s],
    ["a competitor missing from the index", source({ competitor: "nobody" }), /acme-loyalty\.mdx.*nobody/s],
    ["a typed price in an FAQ answer", source({ faqs: [{ question: "Q?", answer: "It costs $25." }] }), /acme-loyalty\.mdx:\d+.*\$25/s],
    ["an unknown Stampeo fact", source({}, `${BODY}<Fact id="stampeo.price.enterprise" />\n`), /stampeo\.price\.enterprise/],
    ["a Fact with a computed id", source({}, `${BODY}<Fact id={id} />\n`), /Fact.*id/],
    ["no comparison table", source({}, BODY.replace("<ComparisonTable />", "")), /acme-loyalty\.mdx.*<ComparisonTable \/>/s],
    ["no competitor side in Choose if", source({}, BODY.replace('side="competitor"', 'side="stampeo"')), /ChooseIf side="competitor"/],
    ["no Stampeo side in Choose if", source({}, BODY.replace(/side="stampeo"/, 'side="competitor"')), /ChooseIf side="stampeo"/],
  ])("rejects %s, naming the file", (_name, file, message) => {
    expect(() => load(file)).toThrow(message);
  });

  it("rejects a competitor with no facts in the page's market", () => {
    expect(() => load(source(), { locale: "fr" })).toThrow(/acme-loyalty.*fr/s);
    expect(() => load(source({ competitor: "acme-fidelite" }), { locale: "en" })).toThrow(/acme-fidelite.*us/s);
  });

  it("rejects a file name that is not a slug", () => {
    expect(() => load(source(), { slug: "Acme_Loyalty" })).toThrow(/Acme_Loyalty\.mdx.*slug/s);
  });

  it("accepts a Fact that is a competitor fact of the market or a Stampeo fact", () => {
    const body = `${BODY}<Fact id="support.hours" /> and <Fact id="stampeo.trial" />\n`;
    expect(load(source({}, body))).toHaveLength(1);
  });

  it.each([
    ["a fact the competitor has no row for", '<Fact id="price.nope" />', /price\.nope/],
    ["a typed price", "Plans start at $25 a month.", /typed currency amount.*\$25/],
    ["a typed euro price", "Les forfaits commencent à 25 € par mois.", /typed currency amount/],
    ["a markdown table", "| Plan | Price |\n| --- | --- |\n| Starter | 1 |", /markdown table/],
  ])("names the file and the line of %s", (_name, line, message) => {
    const file = source({}, `Intro.\n\n${line}\n\n${BODY}`);
    const expectedLine = file.split("\n").findIndex((text) => text === line.split("\n")[0]) + 1;

    expect(() => load(file)).toThrow(message);
    expect(() => load(file)).toThrow(new RegExp(`acme-loyalty\\.mdx:${expectedLine}\\b`));
  });

  it("reports every problem of a file at once", () => {
    const file = source({}, `$25 and <Fact id="price.nope" />\n\n${BODY}`);
    let message = "";
    try {
      load(file);
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toMatch(/typed currency amount/);
    expect(message).toMatch(/price\.nope/);
  });
});

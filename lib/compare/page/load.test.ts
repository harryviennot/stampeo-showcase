import { afterAll, describe, expect, it } from "bun:test";
import { copyFileSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { FIXTURES, FIXTURE_FACTS, FIXTURE_ROOT } from "../__fixtures__";
import { comparisonSlugs, loadComparison, otherComparisons } from "./load";

describe("opening a comparison by market, language and slug", () => {
  it("finds a published US page in English, with its competitor and its check date", () => {
    const loaded = loadComparison({ market: "us", locale: "en", slug: "acme-loyalty" }, FIXTURES);

    expect(loaded?.page.slug).toBe("acme-loyalty");
    expect(loaded?.competitor.name).toBe("Acme Loyalty");
    expect(loaded?.checkedAt).toBe("2026-10-05");
  });

  it("finds a French page in French", () => {
    expect(loadComparison({ market: "fr", locale: "fr", slug: "acme-fidelite" }, FIXTURES)?.checkedAt).toBe("2026-10-12");
  });

  it.each([
    ["us", "en", "acme-loyalty-draft"],
    ["fr", "fr", "acme-fidelite-brouillon"],
  ] as const)("opens the %s draft by its URL", (market, locale, slug) => {
    expect(loadComparison({ market, locale, slug }, FIXTURES)?.page.draft).toBe(true);
  });

  it.each([
    ["an unknown slug", { market: "us", locale: "en", slug: "nobody" }],
    ["a US page asked for in French", { market: "us", locale: "fr", slug: "acme-loyalty" }],
    ["a US page asked for in Spanish", { market: "us", locale: "es", slug: "acme-loyalty" }],
    ["a French page asked for in English", { market: "fr", locale: "en", slug: "acme-fidelite" }],
    ["a French page under the US route", { market: "us", locale: "en", slug: "acme-fidelite" }],
    ["a US page under the French route", { market: "fr", locale: "fr", slug: "acme-loyalty" }],
  ] as const)("is a 404 for %s", (_name, request) => {
    expect(loadComparison(request, FIXTURES)).toBeNull();
  });

  it("lists the slugs to prerender per market, drafts included since they open by URL", () => {
    expect(comparisonSlugs("us", FIXTURES).sort()).toEqual(["acme-loyalty", "acme-loyalty-draft", "globex-stamps"]);
    expect(comparisonSlugs("fr", FIXTURES).sort()).toEqual(["acme-fidelite", "acme-fidelite-brouillon", "bravo-carte"]);
  });

  it("lists nothing when there is no content folder yet, so the build still passes", () => {
    const empty = { ...FIXTURES, root: join(tmpdir(), "no-such-comparison-content") };
    expect(comparisonSlugs("us", empty)).toEqual([]);
    expect(comparisonSlugs("fr", empty)).toEqual([]);
  });
});

const folders: string[] = [];
afterAll(() => {
  for (const folder of folders) rmSync(folder, { recursive: true, force: true });
});

describe("the other comparisons listed on a page", () => {
  const view = (slug: string, market: "us" | "fr", locale: string) => loadComparison({ market, locale, slug }, FIXTURES)!;

  it("are the published pages of the same market, minus the page itself, as a link and a label", () => {
    expect(otherComparisons(view("acme-loyalty", "us", "en"), FIXTURES)).toEqual([
      { href: "/us/vs/globex-stamps", label: "Globex Stamps vs Stampeo" },
    ]);
  });

  it("never link to a draft, and never to the other market", () => {
    const hrefs = otherComparisons(view("globex-stamps", "us", "en"), FIXTURES).map((other) => other.href);

    expect(hrefs).toEqual(["/us/vs/acme-loyalty"]);
    expect(hrefs.some((href) => href.startsWith("/comparatif"))).toBe(false);
  });

  it("name a French page in French and link to it under /comparatif", () => {
    expect(otherComparisons(view("acme-fidelite", "fr", "fr"), FIXTURES)).toEqual([
      { href: "/comparatif/bravo-carte", label: "Bravo Carte ou Stampeo" },
    ]);
  });

  it("are empty for the only page of a market", () => {
    const root = mkdtempSync(join(tmpdir(), "compare-single-"));
    folders.push(root);
    mkdirSync(join(root, "fr"));
    copyFileSync(join(FIXTURE_ROOT, "fr", "acme-fidelite.mdx"), join(root, "fr", "acme-fidelite.mdx"));
    const alone = { root, facts: FIXTURE_FACTS };

    expect(otherComparisons(loadComparison({ market: "fr", locale: "fr", slug: "acme-fidelite" }, alone)!, alone)).toEqual([]);
  });
});

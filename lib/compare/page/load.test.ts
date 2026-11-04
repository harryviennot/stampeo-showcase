import { describe, expect, it } from "bun:test";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { FIXTURES } from "../__fixtures__";
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

  it("opens a draft by its URL", () => {
    expect(loadComparison({ market: "us", locale: "en", slug: "acme-loyalty-draft" }, FIXTURES)?.page.draft).toBe(true);
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
    expect(comparisonSlugs("fr", FIXTURES)).toEqual(["acme-fidelite"]);
  });

  it("lists nothing when there is no content folder yet, so the build still passes", () => {
    const empty = { ...FIXTURES, root: join(tmpdir(), "no-such-comparison-content") };
    expect(comparisonSlugs("us", empty)).toEqual([]);
    expect(comparisonSlugs("fr", empty)).toEqual([]);
  });
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
    expect(hrefs).not.toContain("/us/vs/acme-loyalty-draft");
    expect(hrefs.some((href) => href.startsWith("/comparatif"))).toBe(false);
  });

  it("are empty for the only page of a market", () => {
    expect(otherComparisons(view("acme-fidelite", "fr", "fr"), FIXTURES)).toEqual([]);
  });

  it("name a French page in French", () => {
    const fr = view("acme-fidelite", "fr", "fr");
    // Seen from another French page, so the fixture page is the one listed.
    const fromElsewhere = { ...fr, page: { ...fr.page, slug: "autre" } };

    expect(otherComparisons(fromElsewhere, FIXTURES)).toEqual([
      { href: "/comparatif/acme-fidelite", label: "Acme Fidélité ou Stampeo" },
    ]);
  });
});

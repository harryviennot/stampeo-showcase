import { afterAll, describe, expect, it } from "bun:test";
import { copyFileSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { FooterColumn, footerLinkGrid } from "@/components/sections/FooterColumn";
import { FooterComparisons } from "@/components/sections/FooterComparisons";
import { loadCatalog } from "@/lib/testing/catalogs";
import { FIXTURES, FIXTURE_FACTS, FIXTURE_ROOT } from "./__fixtures__";
import { comparisonPages, comparisonPath, type LoaderOptions } from "./content";
import { footerComparisons, footerComparisonsTitle } from "./footer";

const folders: string[] = [];
afterAll(() => {
  for (const folder of folders) rmSync(folder, { recursive: true, force: true });
});

/** A content root holding only the fixtures' drafts, as the real content is while no page is published. */
function onlyDrafts(): LoaderOptions {
  const root = mkdtempSync(join(tmpdir(), "compare-drafts-"));
  folders.push(root);
  for (const [locale, file] of [
    ["en", "acme-loyalty-draft.mdx"],
    ["fr", "acme-fidelite-brouillon.mdx"],
  ]) {
    mkdirSync(join(root, locale), { recursive: true });
    copyFileSync(join(FIXTURE_ROOT, locale, file), join(root, locale, file));
  }
  return { root, facts: FIXTURE_FACTS };
}

describe("the comparisons a footer lists", () => {
  it("are the published US pages on the US footer, in English", () => {
    expect(footerComparisons("us", "en", FIXTURES)).toEqual([
      { href: "/us/vs/acme-loyalty", label: "Acme Loyalty vs Stampeo" },
      { href: "/us/vs/globex-stamps", label: "Globex Stamps vs Stampeo" },
    ]);
  });

  it("are the published French pages on the international footer in French", () => {
    expect(footerComparisons("int", "fr", FIXTURES)).toEqual([
      { href: "/comparatif/acme-fidelite", label: "Acme Fidélité ou Stampeo" },
      { href: "/comparatif/bravo-carte", label: "Bravo Carte ou Stampeo" },
    ]);
  });

  it.each([
    ["the international footer in English", "int", "en"],
    ["the international footer in Spanish", "int", "es"],
    ["the international footer in Polish", "int", "pl"],
    ["the UK footer", "uk", "en"],
  ] as const)("are none on %s, where no comparison is written", (_name, market, locale) => {
    expect(footerComparisons(market, locale, FIXTURES)).toEqual([]);
  });

  it("never include a draft, so a footer with only drafts to show lists nothing", () => {
    const drafts = onlyDrafts();

    expect(footerComparisons("us", "en", drafts)).toEqual([]);
    expect(footerComparisons("int", "fr", drafts)).toEqual([]);
  });

  it("link the six live pages: the three US ones on the US footer, the three French ones on the French footer", () => {
    expect(footerComparisons("us", "en").map((link) => link.href).sort()).toEqual([
      "/us/vs/loopy-loyalty",
      "/us/vs/stamp-me",
      "/us/vs/winstamp",
    ]);
    expect(footerComparisons("int", "fr").map((link) => link.href).sort()).toEqual([
      "/comparatif/fidelatoo",
      "/comparatif/heypongo",
      "/comparatif/zerosix",
    ]);
  });

  it("are, on the real content, exactly the published pages and no draft", () => {
    for (const [market, locale, comparisonMarket] of [
      ["us", "en", "us"],
      ["int", "fr", "fr"],
    ] as const) {
      const published = comparisonPages()
        .filter((page) => page.market === comparisonMarket)
        .map(comparisonPath);
      expect(footerComparisons(market, locale).map((link) => link.href)).toEqual(published);
    }
  });
});

describe("the title over the comparisons of a footer", () => {
  it.each([
    ["us", "en", "Compare"],
    ["int", "fr", "Comparatifs"],
    ["int", "en", null],
    ["int", "es", null],
    ["int", "pl", null],
    ["uk", "en", null],
  ] as const)("on the %s footer in %s is %p", (market, locale, title) => {
    expect(footerComparisonsTitle(market, locale)).toBe(title);
  });
});

/** The footer's comparisons group as a page in the given language draws it. */
function render(locale: "en" | "fr", node: ReactNode): string {
  return renderToStaticMarkup(
    <NextIntlClientProvider locale={locale} messages={loadCatalog(locale)} timeZone="UTC">
      {node}
    </NextIntlClientProvider>,
  );
}

describe("the comparisons column in the footer", () => {
  it("is a column of its own, titled exactly like the footer's other columns", () => {
    const html = render(
      "fr",
      <FooterComparisons market="int" title="Comparatifs" comparisons={footerComparisons("int", "fr", FIXTURES)} />,
    );
    const column = render("fr", <FooterColumn title="Comparatifs">{null}</FooterColumn>);
    const heading = (markup: string) => markup.match(/<p\b[^>]*>[^<]*<\/p>/)![0];

    expect(heading(html)).toBe(heading(column));
    expect(html).not.toMatch(/uppercase/);
  });

  it("shows its title and one link per page on the US footer, staying under /us", () => {
    const html = render(
      "en",
      <FooterComparisons market="us" title="Compare" comparisons={footerComparisons("us", "en", FIXTURES)} />,
    );

    expect(html).toContain("Compare");
    expect(html).toContain('href="/us/vs/acme-loyalty"');
    expect(html).toContain("Globex Stamps vs Stampeo");
    expect(html).not.toContain("/en/");
  });

  it("links French pages through the site's French routes", () => {
    const html = render(
      "fr",
      <FooterComparisons market="int" title="Comparatifs" comparisons={footerComparisons("int", "fr", FIXTURES)} />,
    );

    expect(html).toContain("Comparatifs");
    expect(html).toContain('href="/comparatif/bravo-carte"');
    expect(html).toContain("Bravo Carte ou Stampeo");
  });

  it.each([
    ["no comparison is published", "Compare", []],
    ["the footer has no title for them", null, [{ href: "/us/vs/acme-loyalty", label: "Acme Loyalty vs Stampeo" }]],
  ] as const)("draws nothing when %s", (_name, title, comparisons) => {
    expect(render("en", <FooterComparisons market="us" title={title} comparisons={comparisons} />)).toBe("");
  });

  it("draws nothing new while every page is a draft", () => {
    const drafts = onlyDrafts();
    const html = render(
      "fr",
      <FooterComparisons market="int" title={footerComparisonsTitle("int", "fr")} comparisons={footerComparisons("int", "fr", drafts)} />,
    );

    expect(html).toBe("");
  });
});

describe("the footer's grid of link columns", () => {
  it("keeps four columns in a row from the tablet up when there is no comparisons column", () => {
    expect(footerLinkGrid(4)).toBe("grid grid-cols-2 gap-x-10 gap-y-10 md:grid-cols-4 flex-1");
  });

  it("wraps five columns two by two on a phone and three across on a tablet, then lines all five up from 1280px, each as wide as its longest link", () => {
    expect(footerLinkGrid(5)).toBe("grid grid-cols-2 gap-x-10 gap-y-10 sm:grid-cols-3 xl:flex xl:justify-between xl:gap-x-8 flex-1");
  });
});

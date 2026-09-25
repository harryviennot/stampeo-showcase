/**
 * The sr-only header/footer navigation (STA-355 QA, blocker 2).
 *
 * This surface shipped a redirect on EVERY page of the site and no test saw it.
 * Two reasons, both fixed here rather than documented:
 *
 *   1. The hrefs were built from template strings inside `Header.tsx` and
 *      `Footer.tsx`, so `internal-links.test.ts` — which walks MDX and message
 *      catalogs — could not reach them. `buildSeoLinks` is now a pure function,
 *      so it can be walked like any other link source.
 *   2. The block was declared BYTE-IDENTICALLY in both components, so the
 *      defect existed twice and fixing one copy would have left the other.
 *
 * The defect itself: `${seoPrefix}/` is `/` for French but `/en/`, `/es/`,
 * `/pl/` for everyone else, and Next redirects each to the unslashed form.
 *
 * These are raw `<a href>`, rendered verbatim, so every href is classified as
 * `raw-anchor`: it must carry its own locale prefix and must not redirect.
 */

import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { routing } from "../i18n/routing";
import { BLOG_LOCALES } from "./blog/locales";
import { getAllSlugs } from "./blog/index";
import { MARKETS, type Market } from "./markets";
import { classifyLink, type BlogInventory } from "./internal-links";
import { buildSeoLinks, seoPrefixFor } from "./seo-links";

const BLOG: BlogInventory = Object.fromEntries(
  BLOG_LOCALES.map((locale) => [locale, getAllSlugs(locale)])
);

const MARKET_KEYS = Object.keys(MARKETS) as Market[];

describe("buildSeoLinks", () => {
  test("every link resolves, in every locale and every market", () => {
    // The headline guard. Raw anchors ship verbatim, so this is the whole
    // contract: right prefix, real route, no redirect.
    const broken: Array<{ locale: string; market: string; href: string; problem: string }> = [];
    let checked = 0;

    for (const locale of routing.locales) {
      for (const market of MARKET_KEYS) {
        for (const { href } of buildSeoLinks(locale, market)) {
          checked += 1;
          const v = classifyLink(href, locale, "raw-anchor", BLOG);
          if (!v.ok) broken.push({ locale, market, href, problem: v.problem });
        }
      }
    }

    expect(broken).toEqual([]);
    // A floor, so a `buildSeoLinks` that returns [] cannot pass this vacuously
    // — the same hole the coverage audit found in internal-links.test.ts.
    expect(checked).toBeGreaterThanOrEqual(routing.locales.length * MARKET_KEYS.length * 6);
  });

  test("the home link is the bare prefix, never the prefix plus a slash", () => {
    // The exact regression. `/en/` 308s to `/en`, on every page that renders a
    // header or a footer, in the block written specifically for crawlers.
    for (const locale of routing.locales) {
      const home = buildSeoLinks(locale)[0];
      expect(home.label).toBe("Home");
      expect(home.href).toBe(seoPrefixFor(locale) || "/");
      expect(home.href).not.toMatch(/.\/$/);
    }
    expect(buildSeoLinks("fr")[0].href).toBe("/");
    expect(buildSeoLinks("en")[0].href).toBe("/en");
  });

  test("no href anywhere ends in a slash except the site root", () => {
    for (const locale of routing.locales) {
      for (const market of MARKET_KEYS) {
        for (const { href } of buildSeoLinks(locale, market)) {
          if (href === "/") continue;
          expect({ locale, market, href, trailing: href.endsWith("/") }).toEqual({
            locale,
            market,
            href,
            trailing: false,
          });
        }
      }
    }
  });

  test("a locale with no blog gets no blog link", () => {
    expect(buildSeoLinks("pl").some((l) => l.label === "Blog")).toBe(false);
    expect(buildSeoLinks("fr").some((l) => l.label === "Blog")).toBe(true);
  });

  test("the components use this function instead of rebuilding the list", () => {
    // The drift guard. The list used to be inline and identical in both files,
    // so a fix to one left the other broken. If either grows its own copy
    // again, this surface silently leaves the suite's reach.
    for (const file of ["Header.tsx", "Footer.tsx"]) {
      const source = readFileSync(
        join(import.meta.dir, "..", "components", "sections", file),
        "utf-8"
      );
      expect({ file, calls: source.includes("buildSeoLinks(locale, market)") }).toEqual({
        file,
        calls: true,
      });
      expect({ file, rebuilds: /const seoLinks = \[/.test(source) }).toEqual({
        file,
        rebuilds: false,
      });
    }
  });
});

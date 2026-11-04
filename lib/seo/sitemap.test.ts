/**
 * The sitemap Google and Bing read.
 *
 * Every entry carries the hreflang cluster of ITS OWN page. A cluster is only
 * honoured when it is reciprocal: if A lists B, B must list A with the same
 * set, or the annotation is dropped and the two URLs compete as duplicates.
 */

import { describe, expect, test } from "bun:test";
import sitemap from "../../app/sitemap";
import { routing } from "../../i18n/routing";
import { getAllSlugs } from "../blog/index";
import { BLOG_LOCALES } from "../blog/locales";
import { FIXTURES } from "../compare/__fixtures__";
import { allComparisonPages, comparisonPages } from "../compare/content";
import { PRIVATE_SEGMENTS, PRIVATE_SUBPATHS } from "../consent-routes";
import { FEATURE_SLUGS } from "../feature-slugs";
import { MARKETS, indexablePilotPaths, marketFromPath } from "../markets";
import { SITEMAP_BASE_URL, STATIC_PAGES, buildSitemap } from "./sitemap";

const entries = sitemap();
const byUrl = new Map(entries.map((entry) => [entry.url, entry]));

const pathOf = (url: string) => url.slice(SITEMAP_BASE_URL.length) || "/";
const languagesOf = (url: string) => byUrl.get(url)?.alternates?.languages ?? {};
const LOCALE_PREFIXES = new Set<string>(routing.locales);

/** Path segments with the locale prefix removed (/en/login -> ["login"]). */
function segmentsOf(url: string): string[] {
  const segments = pathOf(url).split("/").filter(Boolean);
  return LOCALE_PREFIXES.has(segments[0]) ? segments.slice(1) : segments;
}

describe("inventory", () => {
  test("lists every page once, and nothing else", () => {
    const perLocale = STATIC_PAGES.reduce(
      (sum, page) =>
        sum + routing.locales.filter((l) => !page.skipLocales?.includes(l)).length,
      0,
    );
    const posts = BLOG_LOCALES.reduce((sum, l) => sum + getAllSlugs(l).length, 0);
    const expected =
      BLOG_LOCALES.length + // blog index per blog locale
      perLocale +
      FEATURE_SLUGS.length * routing.locales.length +
      indexablePilotPaths().length +
      posts +
      comparisonPages().length;

    expect(entries.length).toBe(expected);
    expect(byUrl.size).toBe(entries.length);
  });

  test("every URL is on the production origin", () => {
    for (const { url } of entries) expect(url.startsWith(`${SITEMAP_BASE_URL}/`)).toBe(true);
  });

  test("no private route is listed", () => {
    for (const { url } of entries) {
      const [first, second] = segmentsOf(url);
      expect(PRIVATE_SEGMENTS.has(first)).toBe(false);
      for (const [segment, child] of PRIVATE_SUBPATHS) {
        expect(first === segment && second === child).toBe(false);
      }
    }
  });

  test("the /start forwarding page is not listed", () => {
    for (const { url } of entries) expect(segmentsOf(url)[0]).not.toBe("start");
  });

  test("no page of a noindex market is listed", () => {
    for (const { url } of entries) {
      const market = marketFromPath(pathOf(url));
      if (market) expect(MARKETS[market].indexable).toBe(true);
    }
  });

  test("only blog posts carry a lastModified date", () => {
    for (const entry of entries) {
      const isPost = segmentsOf(entry.url)[0] === "blog" && segmentsOf(entry.url).length === 2;
      expect(entry.lastModified !== undefined).toBe(isPost);
    }
  });
});

describe("hreflang clusters", () => {
  const clustered = entries.filter((entry) => entry.alternates?.languages);

  test("every entry with a cluster lists itself", () => {
    for (const entry of clustered) {
      expect(Object.values(languagesOf(entry.url))).toContain(entry.url);
    }
  });

  test("every alternate is listed, with the same cluster", () => {
    for (const entry of clustered) {
      const cluster = languagesOf(entry.url);
      for (const alternate of Object.values(cluster)) {
        expect(byUrl.has(alternate)).toBe(true);
        expect(languagesOf(alternate)).toEqual(cluster);
      }
    }
  });

  test("x-default is the English URL, or the French post when a post has no English version", () => {
    for (const entry of clustered) {
      const cluster = languagesOf(entry.url);
      expect(cluster["x-default"]).toBe(cluster.en ?? cluster.fr);
    }
  });

  test("/us/pricing carries the pricing cluster, including itself as en-US", () => {
    const cluster = languagesOf(`${SITEMAP_BASE_URL}/us/pricing`);
    expect(cluster["en-US"]).toBe(`${SITEMAP_BASE_URL}/us/pricing`);
    expect(cluster.fr).toBe(`${SITEMAP_BASE_URL}/pricing`);
    expect(cluster["x-default"]).toBe(`${SITEMAP_BASE_URL}/en/pricing`);
  });

  test("/us carries the homepage cluster", () => {
    const cluster = languagesOf(`${SITEMAP_BASE_URL}/us`);
    expect(cluster["en-US"]).toBe(`${SITEMAP_BASE_URL}/us`);
    expect(cluster.fr).toBe(`${SITEMAP_BASE_URL}/`);
    expect(cluster["x-default"]).toBe(`${SITEMAP_BASE_URL}/en`);
  });

  test("a translated post links to its translation", () => {
    const cluster = languagesOf(`${SITEMAP_BASE_URL}/en/blog/coffee-shop-loyalty-card`);
    expect(cluster.fr).toBe(`${SITEMAP_BASE_URL}/blog/carte-fidelite-cafe`);
  });
});

describe("comparison pages", () => {
  // Every fixture page, drafts included: the sitemap must drop the drafts itself.
  const withComparisons = buildSitemap(allComparisonPages(FIXTURES));
  const urls = withComparisons.map((entry) => entry.url);

  test("lists each published comparison once, at its own market's URL", () => {
    expect(urls).toContain(`${SITEMAP_BASE_URL}/us/vs/acme-loyalty`);
    expect(urls).toContain(`${SITEMAP_BASE_URL}/us/vs/globex-stamps`);
    expect(urls).toContain(`${SITEMAP_BASE_URL}/comparatif/acme-fidelite`);
    expect(urls).toContain(`${SITEMAP_BASE_URL}/comparatif/bravo-carte`);
    expect(new Set(urls).size).toBe(urls.length);
  });

  test("never lists a draft", () => {
    expect(urls.filter((url) => /acme-loyalty-draft|acme-fidelite-brouillon/.test(url))).toEqual([]);
  });

  test("lists them without an hreflang cluster, because each exists in one market only", () => {
    for (const entry of withComparisons) {
      if (/\/(?:us\/vs|comparatif)\//.test(entry.url)) expect(entry.alternates).toBeUndefined();
    }
  });

  test("leaves the US comparisons out while the US market is noindex, and keeps the French ones", () => {
    const wasIndexable = MARKETS.us.indexable;
    MARKETS.us.indexable = false;
    try {
      const held = buildSitemap(allComparisonPages(FIXTURES)).map((entry) => entry.url);
      expect(held.filter((url) => url.includes("/us/vs/"))).toEqual([]);
      expect(held).toContain(`${SITEMAP_BASE_URL}/comparatif/acme-fidelite`);
    } finally {
      MARKETS.us.indexable = wasIndexable;
    }
  });

  test("adds nothing to the sitemap while there are no published comparisons", () => {
    const none = buildSitemap([]).map((entry) => entry.url);
    expect(none.filter((url) => /\/(?:us\/vs|comparatif)(?:\/|$)/.test(url))).toEqual([]);
    expect(withComparisons.length - none.length).toBe(comparisonPages(FIXTURES).length);
  });
});

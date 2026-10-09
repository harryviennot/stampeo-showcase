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
import { PRIVATE_SEGMENTS, PRIVATE_SUBPATHS } from "../consent-routes";
import { FEATURE_SLUGS } from "../feature-slugs";
import { MARKETS, indexablePilotPaths, marketFromPath } from "../markets";
import { SITEMAP_BASE_URL, STATIC_PAGES } from "./sitemap";

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
      posts;

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

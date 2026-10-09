/**
 * hreflang clusters a page emits in its `<head>`.
 *
 * x-default is the English URL in every cluster: most organic visitors read
 * English, so a searcher whose language has no version lands on English rather
 * than French.
 */

import { describe, expect, test } from "bun:test";
import { BLOG_LOCALES } from "./blog/locales";
import { localeAlternates, marketAlternates } from "./hreflang";
import { LOYALTY_LANGUAGES } from "./loyalty-routes";
import { MARKETS, PILOT_HREFLANG, type Market } from "./markets";

const CLUSTERS: Array<[string, Record<string, string>]> = [
  ["a plain page (/about)", localeAlternates("/about")],
  ["the blog index (blog locales only)", localeAlternates("/blog", { locales: BLOG_LOCALES })],
  [
    "a page with per-locale slugs (features)",
    localeAlternates("/features/notifications-push", {
      overrides: { en: "/features/push-notifications" },
    }),
  ],
  ["the loyalty-programs page", LOYALTY_LANGUAGES],
  ["the homepage", PILOT_HREFLANG],
  ["the pricing page", marketAlternates("/pricing")],
  ["an absolute cluster (sitemap)", localeAlternates("/contact", { baseUrl: "https://stampeo.app" })],
];

describe("x-default", () => {
  test.each(CLUSTERS)("%s: points at the English URL", (_name, cluster) => {
    expect(cluster.en).toBeDefined();
    expect(cluster["x-default"]).toBe(cluster.en);
  });
});

describe("marketAlternates", () => {
  test("the pricing cluster: every locale's /pricing plus the live US pricing page", () => {
    expect(marketAlternates("/pricing")).toEqual({
      "x-default": "/en/pricing",
      fr: "/pricing",
      en: "/en/pricing",
      es: "/es/pricing",
      pl: "/pl/pricing",
      "en-US": "/us/pricing",
    });
  });

  test("the homepage cluster is exactly the one the homepage declares", () => {
    // The layout emits PILOT_HREFLANG and the sitemap emits marketAlternates("/");
    // if they drift, the homepage and /us stop reciprocating.
    expect(marketAlternates("/")).toEqual(PILOT_HREFLANG);
  });

  test.each(Object.keys(MARKETS).filter((m) => m !== "int") as Market[])(
    "%s pricing is advertised exactly when the market is indexable",
    (market) => {
      const cluster = marketAlternates("/pricing");
      const { hreflang, path, indexable } = MARKETS[market];
      if (indexable) expect(cluster[hreflang]).toBe(`${path}/pricing`);
      else expect(Object.values(cluster)).not.toContain(`${path}/pricing`);
    },
  );

  test("an absolute cluster prefixes the pilot entries too", () => {
    const cluster = marketAlternates("/pricing", { baseUrl: "https://stampeo.app" });
    expect(cluster["en-US"]).toBe("https://stampeo.app/us/pricing");
    expect(cluster["x-default"]).toBe("https://stampeo.app/en/pricing");
  });
});

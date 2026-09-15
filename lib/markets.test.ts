import { describe, expect, test } from "bun:test";

import {
  MARKET_COOKIE,
  MARKETS,
  PILOT_HREFLANG,
  indexablePilotPaths,
  type Market,
  cookieDomainForHost,
  isPilotPath,
  marketFromPath,
} from "./markets";

/**
 * A visitor who opened /us was shown $49 and a 14-day trial, then followed a
 * CTA to the generic /onboarding on another host and met a country field
 * defaulted by a 12-entry timezone table that falls back to `en -> GB`. GB has
 * no USD ladder, so they checked out at EUR 20 having been quoted $49.
 *
 * The cookie carries the market across that hop. It is a HINT: it prefills a
 * field the owner can change, and the backend never reads it. Pricing authority
 * stays with the postal address, then the country dropdown.
 */

describe("marketFromPath", () => {
  test("names the pilot a visitor is actually on", () => {
    expect(marketFromPath("/us")).toBe("us");
    expect(marketFromPath("/uk")).toBe("uk");
  });

  test("covers everything beneath a pilot root", () => {
    expect(marketFromPath("/us/pricing")).toBe("us");
  });

  test("the international site is not a market to remember", () => {
    // `int` has no country to imply, and stamping it would overwrite a real
    // market the moment a US visitor clicked through to the homepage.
    expect(marketFromPath("/")).toBeNull();
    expect(marketFromPath("/en")).toBeNull();
    expect(marketFromPath("/fr/pricing")).toBeNull();
  });

  test("a business slug that merely starts with a market is not a market", () => {
    // The trap `isPilotPath` was written for: /usual-cafe is a customer page.
    expect(marketFromPath("/usual-cafe")).toBeNull();
    expect(marketFromPath("/ukulele-bar")).toBeNull();
  });

  test("it agrees with isPilotPath on every path", () => {
    for (const p of ["/us", "/us/pricing", "/uk", "/", "/en", "/usual-cafe"]) {
      expect(marketFromPath(p) !== null).toBe(isPilotPath(p));
    }
  });

  test("every pilot in MARKETS is reachable", () => {
    for (const [key, market] of Object.entries(MARKETS)) {
      if (key === "int") continue;
      expect(marketFromPath(market.path)).toBe(key);
    }
  });
});

describe("cookieDomainForHost", () => {
  test("prod: the app subdomain can read what the showcase sets", () => {
    // showcase stampeo.app -> app.stampeo.app
    expect(cookieDomainForHost("stampeo.app")).toBe(".stampeo.app");
  });

  test("dev: the same rule, one level down", () => {
    // showcase dev.stampeo.app -> app.dev.stampeo.app
    expect(cookieDomainForHost("dev.stampeo.app")).toBe(".dev.stampeo.app");
  });

  test("a port is not part of the domain", () => {
    expect(cookieDomainForHost("dev.stampeo.app:3000")).toBe(".dev.stampeo.app");
  });

  test("localhost gets no domain attribute at all", () => {
    // Browsers reject a Domain on a single-label host, which would silently
    // drop the cookie in local dev rather than erroring.
    expect(cookieDomainForHost("localhost:3000")).toBeUndefined();
    expect(cookieDomainForHost("localhost")).toBeUndefined();
  });

  test("a missing host is survivable", () => {
    expect(cookieDomainForHost(null)).toBeUndefined();
    expect(cookieDomainForHost("")).toBeUndefined();
  });

  test("an IP address gets no domain attribute", () => {
    expect(cookieDomainForHost("127.0.0.1:3000")).toBeUndefined();
  });
});

describe("MARKET_COOKIE", () => {
  test("is not the locale cookie", () => {
    // Locale, market and billing currency are three axes the codebase keeps
    // deliberately apart (see backend app/core/pricing_region.py). Polish is a
    // locale and still quotes euros; /uk is English and is not GBP. Carrying a
    // market on NEXT_LOCALE is exactly that conflation.
    expect(MARKET_COOKIE).not.toBe("NEXT_LOCALE");
  });
});

/**
 * Indexing a pilot and advertising it via hreflang are the same decision, so
 * they read the same flag. They were two edits in two files before, and the
 * comment telling you to do both lived in a third.
 */
describe("indexable markets", () => {
  test("/us is live: dollars on the page, so Google may have it", () => {
    expect(MARKETS.us.indexable).toBe(true);
  });

  test("/uk is not: it declares EUR because no GBP ladder exists", () => {
    // Indexing it would rank a "UK" page that quotes euros. It goes live in the
    // same change as a GBP Price, per docs/billing/ADDING_A_CURRENCY.md.
    expect(MARKETS.uk.indexable).toBe(false);
  });

  test("the international homepage is not a pilot", () => {
    expect(MARKETS.int.indexable).toBe(false);
  });
});

describe("PILOT_HREFLANG", () => {
  test("advertises exactly the indexable pilots, and no others", () => {
    // The cluster used to be hand-written and contained `en-GB -> /uk` while
    // /uk was noindex. Telling Google "the British version is here" and
    // pointing it at a page marked noindex is an annotation it cannot honour.
    const advertised = Object.entries(PILOT_HREFLANG)
      .filter(([, path]) => path === "/us" || path === "/uk")
      .map(([code]) => code);

    expect(advertised).toEqual(["en-US"]);
  });

  test("every pilot path in the cluster belongs to an indexable market", () => {
    for (const [, path] of Object.entries(PILOT_HREFLANG)) {
      const market = (Object.keys(MARKETS) as Market[]).find(
        (m) => m !== "int" && MARKETS[m].path === path
      );
      if (market) expect(MARKETS[market].indexable).toBe(true);
    }
  });

  test("every indexable pilot appears in the cluster", () => {
    // The other direction. An indexable page missing from the homepage cluster
    // is an unreciprocated hreflang, which Google ignores outright — so /us
    // would compete with /en as a duplicate instead of being its US variant.
    for (const market of Object.keys(MARKETS) as Market[]) {
      if (market === "int" || !MARKETS[market].indexable) continue;
      expect(Object.values(PILOT_HREFLANG)).toContain(MARKETS[market].path);
      expect(PILOT_HREFLANG[MARKETS[market].hreflang]).toBe(MARKETS[market].path);
    }
  });

  test("still carries the plain locales and an x-default", () => {
    expect(PILOT_HREFLANG["x-default"]).toBe("/en");
    expect(PILOT_HREFLANG.fr).toBe("/");
    expect(PILOT_HREFLANG.en).toBe("/en");
    expect(PILOT_HREFLANG.es).toBe("/es");
    expect(PILOT_HREFLANG.pl).toBe("/pl");
  });
});

describe("indexablePilotPaths", () => {
  test("lists the landing page and the pricing page of each live pilot", () => {
    // Both are indexable and both quote money, so both belong in the sitemap.
    // /us/pricing is the one that actually renders $49 / $79 / $119.
    expect(indexablePilotPaths()).toEqual(["/us", "/us/pricing"]);
  });

  test("a noindex pilot contributes nothing", () => {
    // Listing /uk while it is noindex asks Google to crawl a page we told it
    // not to index, and it quotes euros under a UK flag.
    expect(indexablePilotPaths()).not.toContain("/uk");
    expect(indexablePilotPaths()).not.toContain("/uk/pricing");
  });

  test("the international homepage is not a pilot path", () => {
    // /en is already in the sitemap through the normal locale loop; emitting it
    // twice would be a duplicate entry.
    expect(indexablePilotPaths()).not.toContain("/en");
  });
});

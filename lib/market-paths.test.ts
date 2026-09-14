/**
 * A market is a set of routes, not a single page.
 *
 * STA-275. /us quoted dollars while the shared Header hardcoded href="/pricing"
 * and the pricing page hardcoded MARKETS.int, so one click walked a US visitor
 * from a $49 page to a EUR 20 page. /us/pricing did not exist at all, and the
 * middleware's pilot rewrite was exact-match, so the URL fell through to locale
 * detection and 404'd as /en/us/pricing.
 *
 * A quoted price the checkout will not honour is the defect this release exists
 * to close, so in-market navigation is part of the currency work, not polish.
 */

import { describe, expect, test } from "bun:test";
import { MARKETS, marketPath, marketLink, isPilotPath } from "./markets";
import { formatMoney } from "./pricing";

describe("marketPath", () => {
  test("keeps a US visitor inside the US market", () => {
    expect(marketPath("us", "/pricing")).toBe("/us/pricing");
  });

  test("keeps a UK visitor inside the UK market", () => {
    expect(marketPath("uk", "/pricing")).toBe("/uk/pricing");
  });

  test("leaves the international market on its bare paths", () => {
    // /en is handled by next-intl's locale prefixing, not by us.
    expect(marketPath("int", "/pricing")).toBe("/pricing");
  });

  test("the market home is the market root, not a doubled path", () => {
    expect(marketPath("us", "/")).toBe("/us");
    expect(marketPath("int", "/")).toBe("/");
  });

  test("every market in MARKETS produces a usable pricing path", () => {
    for (const market of Object.keys(MARKETS) as Array<keyof typeof MARKETS>) {
      const path = marketPath(market, "/pricing");
      expect(path.startsWith("/")).toBe(true);
      expect(path.endsWith("/pricing")).toBe(true);
      expect(path).not.toContain("//");
    }
  });
});

describe("isPilotPath", () => {
  test("matches a pilot home", () => {
    expect(isPilotPath("/us")).toBe(true);
    expect(isPilotPath("/uk")).toBe(true);
  });

  test("matches a page INSIDE a pilot", () => {
    // The bug: exact-match meant /us/pricing fell through to locale detection
    // and became /en/us/pricing, which does not exist.
    expect(isPilotPath("/us/pricing")).toBe(true);
  });

  test("does not swallow a business slug that merely starts with the letters", () => {
    // The reason the original was exact-match. /usual-cafe is a real shape.
    expect(isPilotPath("/usual-cafe")).toBe(false);
    expect(isPilotPath("/ukulele-bar")).toBe(false);
  });

  test("does not match an unrelated path", () => {
    expect(isPilotPath("/pricing")).toBe(false);
    expect(isPilotPath("/")).toBe(false);
    expect(isPilotPath("/en/us")).toBe(false);
  });
});

describe("marketLink", () => {
  test("a pilot ignores the next-intl locale prefix", () => {
    // Combining both schemes yields /us/en/pricing, which routes nowhere.
    expect(marketLink("us", "/en", "/pricing")).toBe("/us/pricing");
    expect(marketLink("uk", "/en", "/pricing")).toBe("/uk/pricing");
  });

  test("the international market keeps its locale prefix", () => {
    expect(marketLink("int", "/en", "/pricing")).toBe("/en/pricing");
    expect(marketLink("int", "", "/pricing")).toBe("/pricing");
  });

  test("no link ever carries both prefixes", () => {
    for (const market of ["int", "uk", "us"] as const) {
      for (const prefix of ["", "/en", "/es", "/pl"]) {
        expect(marketLink(market, prefix, "/pricing")).not.toMatch(/\/(us|uk)\/(en|es|pl)\//);
      }
    }
  });
});

describe("formatMoney groups thousands and narrows the symbol", () => {
  // QA saw "Billed $1140 a year" and "$9000/month" on /us. The whole yearly
  // ladder is four figures, so an ungrouped amount is the normal case.
  test("four-figure amounts are grouped", () => {
    expect(formatMoney(1140, "usd", "en")).toBe("$1,140");
    expect(formatMoney(1140, "eur", "fr")).toMatch(/1\s?140/);
  });

  test("a foreign currency is a symbol, not a name", () => {
    expect(formatMoney(49, "usd", "fr")).not.toContain("$US");
    expect(formatMoney(49, "usd", "pl")).not.toContain("USD");
  });

  test("placement still follows the locale", () => {
    expect(formatMoney(49, "usd", "en").startsWith("$")).toBe(true);
    expect(formatMoney(49, "eur", "fr").trim().endsWith("€")).toBe(true);
  });

  test("whole amounts show no decimals", () => {
    expect(formatMoney(49, "usd", "en")).toBe("$49");
  });

  test("an unknown currency does not blank the price", () => {
    expect(() => formatMoney(49, "zzz", "en")).not.toThrow();
    expect(formatMoney(49, "zzz", "en")).toContain("49");
  });
});

/**
 * Offering the right market, without geo-detecting the page itself.
 *
 * Until `/us` is indexed, hreflang protects nobody: every US visitor lands on a
 * euro page quoting EUR 20 and finds out about $49 at the final step of the
 * wizard. A dismissible link fixes that without redirecting on IP (which Google
 * discourages and which would break page caching).
 */

import { describe, expect, test } from "bun:test";
import { suggestedMarket, marketCountry } from "./market-suggestion";

describe("suggestedMarket", () => {
  test("a US visitor on the international page is offered /us", () => {
    expect(suggestedMarket("US", "int")).toBe("us");
  });

  test("a UK visitor is NOT offered /uk — same currency, nothing to warn about", () => {
    // /uk quotes euros today, so sending them there changes no number.
    expect(suggestedMarket("GB", "int")).toBeNull();
  });

  test("a visitor already on a market page is left alone", () => {
    expect(suggestedMarket("US", "us")).toBeNull();
    expect(suggestedMarket("GB", "us")).toBeNull();
  });

  test("a country with no market of its own gets nothing", () => {
    for (const country of ["FR", "ES", "PL", "DE", "JP"]) {
      expect(suggestedMarket(country, "int")).toBeNull();
    }
  });

  test("an undetectable country is not a guess", () => {
    // detectBrowserCountry returns null off the browser and when no signal
    // resolves. Guessing from the locale here would show a US banner to a
    // French visitor reading the English page.
    for (const bad of [null, undefined, "", "U", "USA", "  "]) {
      expect(suggestedMarket(bad, "int")).toBeNull();
    }
  });

  test("a lowercase country still resolves", () => {
    expect(suggestedMarket("us", "int")).toBe("us");
  });
});

describe("marketCountry", () => {
  test("is derived from the market's own hreflang", () => {
    expect(marketCountry("us")).toBe("US");
    expect(marketCountry("uk")).toBe("GB");
  });

  test("the international market targets no single country", () => {
    expect(marketCountry("int")).toBeNull();
  });

  test("every market's hreflang and its suggestion agree", () => {
    // Derived rather than stored precisely so these cannot drift: a market that
    // ranked for one region and priced for another would be the worst of both.
    expect(marketCountry("us")).toBe("US");
    expect(suggestedMarket(marketCountry("us"), "int")).toBe("us");
  });
});

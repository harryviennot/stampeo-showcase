import { describe, expect, test } from "bun:test";

import { marketScopedKey } from "./market-copy";
import { MARKETS, type Market } from "./markets";

/**
 * `/us` needs different English from `/en`, not a different language.
 *
 * A new `en-US` locale would have been the obvious move and is the wrong one:
 * locale, market and billing currency are three axes this codebase keeps apart
 * on purpose (see the headers of `lib/markets.ts` and the backend's
 * `app/core/pricing_region.py`). Polish is a locale that quotes euros. `/uk` is
 * English and is not GBP. A market is not a language, and `/us` renders only in
 * English, so its copy belongs in the English catalog under a market subtree.
 */

/** A `has` that answers for an explicit set of keys, so a test states its world. */
const knows = (...keys: string[]) => (key: string) => keys.includes(key);

describe("marketScopedKey", () => {
  test("prefers the market's own copy when it exists", () => {
    expect(marketScopedKey("hero.title", "us", knows("us.hero.title"))).toBe(
      "us.hero.title",
    );
  });

  test("falls back to the shared copy when the market overrides nothing", () => {
    // The common case: most of the page is the same in every market, and only
    // the strings that must differ are overridden.
    expect(marketScopedKey("hero.subtitle", "us", knows("us.hero.title"))).toBe(
      "hero.subtitle",
    );
  });

  test("the international site never resolves an override", () => {
    // `int` is /en, the page the overrides exist to differ FROM. If it ever
    // read `int.*`, a market subtree added later would silently rewrite the
    // homepage. It must not even ask.
    let asked = false;
    const spy = (key: string) => {
      asked = true;
      return knows("int.hero.title", "us.hero.title")(key);
    };
    expect(marketScopedKey("hero.title", "int", spy)).toBe("hero.title");
    expect(asked).toBe(false);
  });

  test("the mechanism is generic, not hardcoded to us", () => {
    // /uk has no overrides today and must still work the day it gets one,
    // without a second code path.
    expect(marketScopedKey("hero.title", "uk", knows("uk.hero.title"))).toBe(
      "uk.hero.title",
    );
  });

  test("scopes by exactly one segment, so a key cannot climb out of its market", () => {
    expect(marketScopedKey("faq.items", "us", knows("us.faq.items"))).toBe(
      "us.faq.items",
    );
  });

  test("every pilot market can be scoped", () => {
    for (const market of Object.keys(MARKETS) as Market[]) {
      if (market === "int") continue;
      expect(marketScopedKey("x", market, knows(`${market}.x`))).toBe(`${market}.x`);
    }
  });
});

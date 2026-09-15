import { describe, expect, test } from "bun:test";

import {
  countryForTimezone,
  countryFromE164,
  detectBrowserCountry,
  localeCountry,
} from "./phone-utils";

describe("localeCountry", () => {
  test("is deterministic per locale, which is what makes it SSR-safe", () => {
    expect(localeCountry("fr")).toBe("FR");
    expect(localeCountry("en")).toBe("US");
    expect(localeCountry("es")).toBe("ES");
    expect(localeCountry("pl")).toBe("PL");
  });

  test("falls back to FR on an unknown locale", () => {
    expect(localeCountry("ja")).toBe("FR");
    expect(localeCountry("")).toBe("FR");
  });

  test("reads nothing from the environment", () => {
    // The whole point: the server and the browser must agree. If this ever
    // starts consulting a timezone, the phone field's flag will flip on
    // hydration again and React will discard the form subtree.
    const src = localeCountry.toString();
    expect(src).not.toContain("navigator");
    expect(src).not.toContain("window");
    expect(src).not.toContain("timeZone");
  });
});

describe("detectBrowserCountry", () => {
  test("returns a country or null, never guesses from a locale", () => {
    // Bun's test env has no `window`, so this is the server path.
    const original = (globalThis as { window?: unknown }).window;
    delete (globalThis as { window?: unknown }).window;
    expect(detectBrowserCountry()).toBeNull();
    if (original !== undefined) (globalThis as { window?: unknown }).window = original;
  });
});

describe("countryFromE164", () => {
  test("reads the country out of a saved number", () => {
    expect(countryFromE164("+33612345678")).toBe("FR");
    expect(countryFromE164("+32470123456")).toBe("BE");
    expect(countryFromE164("+13125551234")).toBe("US");
  });

  test("is null for anything that is not a full international number", () => {
    // A national-format value carries no country of its own; the field's own
    // selection has to answer for it.
    expect(countryFromE164("0612345678")).toBeNull();
    expect(countryFromE164("")).toBeNull();
    expect(countryFromE164(undefined)).toBeNull();
    expect(countryFromE164("+")).toBeNull();
    expect(countryFromE164("not a phone")).toBeNull();
  });

  test("never throws on junk, because it runs during render", () => {
    for (const junk of ["+++", "+0", "+999999999999999999", "  "]) {
      expect(() => countryFromE164(junk)).not.toThrow();
    }
  });

  test("is the same answer on the server and in the browser", () => {
    // This is what makes it usable as the country source: it depends only on
    // the value, so it cannot flip after hydration the way detection does.
    const src = countryFromE164.toString();
    expect(src).not.toContain("navigator");
    expect(src).not.toContain("window");
  });
});

/**
 * A visitor the timezone table misses sees euro prices with no offer to switch
 * — `MarketSuggestion` only fires when `detectBrowserCountry` returns a country.
 * Four zones covered the coasts and left Arizona, Alaska, Hawaii, Michigan and
 * Indiana to fall through to `navigator.language`, which is a bare "en" often
 * enough to matter now that /us quotes different money.
 *
 * Exported as a pure function so the table can be tested without stubbing
 * `Intl.DateTimeFormat`.
 */
describe("countryForTimezone", () => {
  test("covers the US zones a browser actually reports", () => {
    for (const tz of [
      "America/New_York",
      "America/Chicago",
      "America/Denver",
      "America/Los_Angeles",
      "America/Phoenix",
      "America/Anchorage",
      "America/Detroit",
      "America/Indiana/Indianapolis",
      "America/Boise",
      "America/Juneau",
      "Pacific/Honolulu",
    ]) {
      expect(countryForTimezone(tz)).toBe("US");
    }
  });

  test("still resolves the European zones it always did", () => {
    expect(countryForTimezone("Europe/Paris")).toBe("FR");
    expect(countryForTimezone("Europe/London")).toBe("GB");
  });

  test("an unmapped or absent zone yields null, never a guess", () => {
    // Null is what lets `navigator.language` have its turn. A wrong country
    // here would offer a US visitor the wrong market with confidence.
    expect(countryForTimezone("Antarctica/Troll")).toBeNull();
    expect(countryForTimezone("")).toBeNull();
    expect(countryForTimezone(null)).toBeNull();
    expect(countryForTimezone(undefined)).toBeNull();
  });
});

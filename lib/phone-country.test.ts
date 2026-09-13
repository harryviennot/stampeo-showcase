import { describe, expect, test } from "bun:test";

import { detectBrowserCountry, localeCountry } from "./phone-utils";

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

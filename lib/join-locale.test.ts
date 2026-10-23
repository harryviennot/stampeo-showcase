import { describe, expect, test } from "bun:test";
import { joinLocale } from "./join-locale";

describe("joinLocale", () => {
  test.each(["en", "fr", "es", "pl"] as const)("keeps a supported cookie locale (%s)", (locale) => {
    expect(joinLocale(locale)).toBe(locale);
  });

  test.each([undefined, "", "de", "EN", "fr-FR"])("falls back to French for %p", (value) => {
    expect(joinLocale(value)).toBe("fr");
  });
});

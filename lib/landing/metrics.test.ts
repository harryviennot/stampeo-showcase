import { describe, expect, it } from "bun:test";
import { routing } from "@/i18n/routing";
import { loadCatalog } from "../testing/catalogs";

/**
 * The landing numbers strip (`variant.metrics`) is maintained by hand in four
 * catalogs. These checks catch the two ways a refresh goes wrong: one locale
 * left on the old figures, and a figure written in another locale's format.
 */

type Item = { value: string; label: string };

const items = (locale: string): Item[] =>
  loadCatalog(locale, "landing.json").variant.metrics.items;

const digits = (value: string) => Number(value.replace(/\D/g, ""));

/** "+20 000": a space, no-break space or narrow no-break space between groups. */
const SPACED_PREFIX = /^\+\d{1,3}(?:[ \u00a0\u202f]\d{3})*$/;

/** Each locale's way of writing a rounded-down count: separators and where "+" goes. */
const FLOOR_FORMAT: Record<string, RegExp> = {
  en: /^\d{1,3}(?:,\d{3})*\+$/,
  fr: SPACED_PREFIX,
  es: /^\+\d{1,3}(?:\.\d{3})*$/,
  pl: SPACED_PREFIX,
};

describe("landing numbers strip", () => {
  it("every locale carries the same figures as English", () => {
    const english = items("en").map((item) => digits(item.value));
    for (const locale of routing.locales) {
      expect({ locale, figures: items(locale).map((item) => digits(item.value)) }).toEqual({
        locale,
        figures: english,
      });
    }
  });

  it.each(routing.locales)("%s: every figure is a floor, written the locale's way", (locale) => {
    for (const { value } of items(locale)) {
      expect({ value, ok: FLOOR_FORMAT[locale].test(value) }).toEqual({ value, ok: true });
    }
  });

  it("pl: the countries label agrees with its number", () => {
    // Polish takes `kraje` after 2-4 (but not 12-14) and `krajów` after the rest.
    const countries = items("pl").find((item) => /^kraj/.test(item.label));
    expect(countries).toBeDefined();
    const form = new Intl.PluralRules("pl").select(digits(countries!.value));
    expect(countries!.label).toBe(form === "few" ? "kraje" : "krajów");
  });
});

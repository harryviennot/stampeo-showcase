import { describe, expect, test } from "bun:test";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * A currency glyph baked into a translation cannot be repriced into another
 * currency. "Billed €{price} a year" renders "Billed €39 a year" to an American
 * no matter what the ladder says, because only the number is a placeholder.
 *
 * That is how the site ended up with prices in four places and a /us page
 * quoting euros. The supported path is to interpolate an already-formatted
 * amount — `formatMoney(x, pricing.currency, locale)` — so the symbol and its
 * placement travel with the number.
 *
 * Scoped to the files that quote plan prices. Demo content elsewhere (an SMS
 * cost comparison, a sample reward worth €10) is illustrative copy, not a price
 * we charge, and is deliberately left alone.
 */

const MESSAGES = join(import.meta.dir, "..", "messages");
const PRICED_FILES = ["pricing.json"];
const GLYPHS = /[€$£]|zł|&euro;|&#8364;/;

function walk(value: unknown, path: string, out: Array<[string, string]>) {
  if (typeof value === "string") {
    if (GLYPHS.test(value)) out.push([path, value]);
  } else if (Array.isArray(value)) {
    value.forEach((v, i) => walk(v, `${path}[${i}]`, out));
  } else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) walk(v, path ? `${path}.${k}` : k, out);
  }
}

describe("plan-price translations carry no currency glyph", () => {
  const locales = readdirSync(MESSAGES).filter((entry) =>
    !entry.startsWith(".") && readdirSync(join(MESSAGES, entry)).length > 0,
  );

  test("every locale directory is checked", () => {
    // Guards the guard: a new locale must not silently escape it.
    expect(locales.length).toBeGreaterThanOrEqual(4);
  });

  for (const locale of locales) {
    for (const file of PRICED_FILES) {
      test(`${locale}/${file}`, () => {
        const raw = readFileSync(join(MESSAGES, locale, file), "utf8");
        const offenders: Array<[string, string]> = [];
        walk(JSON.parse(raw), "", offenders);
        expect(
          offenders.map(([path, value]) => `${path}: ${value}`),
        ).toEqual([]);
      });
    }
  }
});

import { describe, expect, test } from "bun:test";
import { catalogLocales, catalogStrings, loadCatalog } from "./testing/catalogs";

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

// metadata.json quotes plan prices in page descriptions, which are what Google
// prints in a search result. It was outside this guard, which is exactly how
// "1 month free, then EUR20/month for life" survived into the US launch: a
// snippet outlives the page by weeks.
const PRICED_FILES = ["pricing.json", "landing.json", "features.json", "metadata.json"];
/**
 * `zł` is anchored to a digit; every other glyph is not.
 *
 * A bare /zł/ fires inside ordinary Polish words: "członków" contains it, so
 * does "zły". That is the same trap the Polish gendered-past guard hit with
 * "właśnie" in lib/i18n-catalogs.test.ts. Polish writes currency AFTER the
 * amount with a space ("29 zł"), so requiring a preceding digit keeps the
 * guard useful without flagging prose. A symbol-first "zł 29" would slip
 * through, which is not a form Polish uses.
 *
 * `}` counts as well as a digit, because "{starterPrice} zł/mies." is the exact
 * shape this file exists to reject: the glyph baked, only the number
 * interpolated. A digit-only anchor let it through.
 */
const GLYPHS = /[€$£]|[\d}]\s*zł|&euro;|&#8364;/;

/**
 * features.json is mostly product copy: an SMS cost comparison, sample rewards,
 * a demo card. Only the price tokens had to be de-glyphed. The sector cards in
 * landing.json are NOT exempt: their amounts are `{m<amount>}` tokens formatted
 * in the page's market currency, so /us never shows a euro reward.
 */
const EXEMPT = /^features\.(?!.*\{(?:starter|growth|pro)\w*Price\})/;

describe("plan-price translations carry no currency glyph", () => {
  const locales = catalogLocales();

  test("every locale directory is checked", () => {
    // Guards the guard: a new locale must not silently escape it.
    expect(locales.length).toBeGreaterThanOrEqual(4);
  });

  for (const locale of locales) {
    for (const file of PRICED_FILES) {
      test(`${locale}/${file}`, () => {
        const offenders = catalogStrings(loadCatalog(locale, file))
          .filter(({ where, text }) => GLYPHS.test(text) && !EXEMPT.test(where))
          .map(({ where, text }) => `${where}: ${text}`);
        expect(offenders).toEqual([]);
      });
    }
  }
});

describe("the glyph pattern itself", () => {
  test.each([
    "Billed €39 a year",
    "$49/month",
    "£30 per month",
    "29 zł",
    "29zł",
    // Glyph baked, number interpolated: the shape this file exists to reject.
    "{starterPrice} zł/mies.",
    "Rozliczane {starterYearlyPrice} zł rocznie",
    "&euro;20",
  ])("flags %p", (text) => {
    expect(GLYPHS.test(text)).toBe(true);
  });

  test.each([
    // The trap: ordinary Polish words containing the letters z-ł.
    "Program członków założycieli Stampeo",
    "zły wybór",
    "Złoty program",
    "{starterPrice}/month",
  ])("does not flag %p", (text) => {
    expect(GLYPHS.test(text)).toBe(false);
  });
});

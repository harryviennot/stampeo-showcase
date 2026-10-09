import { describe, expect, it } from "bun:test";
import { BENCHMARK, BENCHMARK_SAMPLE, sourceLine } from "./benchmark";

/**
 * Production figures quoted on the site. Each one carries its sample, so a
 * figure is never published without "Stampeo data: n businesses, period".
 */
describe("benchmark figures", () => {
  it("each state what they measure and on how much data", () => {
    for (const [key, figure] of Object.entries(BENCHMARK)) {
      expect({ key, measures: figure.measures.length > 0 }).toEqual({ key, measures: true });
      expect({ key, n: figure.n.length > 0 }).toEqual({ key, n: true });
    }
    expect(BENCHMARK_SAMPLE.method.length).toBeGreaterThan(0);
  });
});

describe("sourceLine", () => {
  it.each([
    ["en", "Stampeo data, 86 businesses, Feb–Oct 2026"],
    ["fr", "Données Stampeo, 86 commerces, févr.–oct. 2026"],
    ["es", "Datos de Stampeo, 86 comercios, feb.–oct. 2026"],
    ["pl", "Dane Stampeo, 86 firm, luty–październik 2026"],
  ])("cites the sample in %s", (locale, line) => {
    expect(sourceLine(locale, 86)).toBe(line);
  });

  it("falls back to English for a locale it does not know", () => {
    expect(sourceLine("de", 86)).toBe(sourceLine("en", 86));
  });

  it("agrees Polish nouns with the business count", () => {
    expect(sourceLine("pl", 1)).toContain("1 firma,");
    expect(sourceLine("pl", 22)).toContain("22 firmy,");
    expect(sourceLine("pl", 25)).toContain("25 firm,");
  });
});

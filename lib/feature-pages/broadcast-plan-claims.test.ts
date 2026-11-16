import { describe, expect, it } from "bun:test";
import { routing } from "@/i18n/routing";
import { catalogStrings, loadCatalog } from "../testing/catalogs";

/**
 * Broadcasts are on every plan (Starter has a monthly allowance), so no pricing
 * string may pair them with a plan claim that leaves Starter out: "from Growth",
 * "Growth and Pro". A string that names Growth or Pro must name Starter too, or
 * say every plan.
 */
const BROADCAST: Record<string, RegExp> = {
  en: /broadcast/i,
  fr: /diffusion/i,
  es: /difusi/i,
  pl: /rozsył/i,
};
const EVERY_PLAN: Record<string, RegExp> = {
  en: /\b(?:every|all) plans?\b/i,
  fr: /\btous les plans\b|\bchaque plan\b/i,
  es: /\btodos los planes\b|\bcada plan\b/i,
  pl: /\bwe wszystkich planach\b|\bw ka[zż]dym planie\b|\bka[zż]dy plan\b|\bwszystkie plany\b/i,
};

function excludesStarter(text: string, locale: string): boolean {
  if (!BROADCAST[locale].test(text)) return false;
  const namesHigherPlan = /\bGrowth\b|\bPro\b/.test(text);
  const coversStarter = /\bStarter\b/.test(text) || EVERY_PLAN[locale].test(text);
  return namesHigherPlan && !coversStarter;
}

describe("broadcast plan claims", () => {
  it.each([
    ["en", "Broadcasts start on the Growth plan", true],
    ["en", "Unlimited broadcasts on Growth and Pro", true],
    ["en", "8 broadcasts a month on Starter, unlimited on Growth and Pro", false],
    ["en", "Broadcasts on every plan, unlimited on Growth and Pro", false],
    ["en", "Schedule broadcasts in advance (card styles coming soon)", false],
    ["fr", "Diffusions à partir du plan Growth", true],
    ["fr", "Programmez vos diffusions à l'avance", false],
    ["es", "Las difusiones entran a partir del plan Growth", true],
    ["pl", "Rozsyłki od planu Growth", true],
  ])("a %s string reading %p excludes Starter: %p", (locale, text, excluded) => {
    expect(excludesStarter(text, locale)).toBe(excluded);
  });

  it.each(routing.locales)("%s: no pricing string pairs broadcasts with a plan claim that excludes Starter", (locale) => {
    const excluding = catalogStrings(loadCatalog(locale, "pricing.json"), `${locale}/pricing.json::`)
      .filter(({ text }) => excludesStarter(text, locale))
      .map(({ where, text }) => `${where}: ${text}`);
    expect(excluding).toEqual([]);
  });
});

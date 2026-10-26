import { describe, expect, it } from "bun:test";
import { routing } from "@/i18n/routing";
import { PLAN_NAMES, TIERS, tiersWhere } from "../plans/plan-facts";
import { catalogStrings, loadCatalog } from "../testing/catalogs";
import { CAPTURE_PLAN } from "./dashboard-shots";

/**
 * The landing's dashboard section (`variant.dashboard`) sits beside real
 * captures of the Growth Analytics page. Its copy may only name what those
 * captures show: totals, on Growth. Analytics keeps no per-customer
 * prediction, shows no money for a stamp card, and its cohorts, per-location
 * stats and 1-year history are Pro.
 */
const END = "(?![\\p{L}\\p{N}])";

const OFF_PICTURE: Record<string, RegExp> = {
  prediction: new RegExp(
    `\\bwill (?:come back|return)\\b|\\bcoming back (?:tomorrow|next)|\\brevien(?:dra|dront|t demain)${END}|\\bvolver(?:á|án)${END}|\\bvuelve mañana|\\bwróc(?:i|ą)${END}|\\bwraca jutro`,
    "iu",
  ),
  customerName: /\p{Lu}\p{Ll}+ \p{Lu}\./u,
  money: /[€$£]|\bspen[dt]|\bdépens|\bgast(?:o|an|ado)|\bwyda(?:ją|tki|tek)/i,
  proOnly: new RegExp(
    `cohort|kohort|per[- ]location|par établissement|por local|każdego lokalu|\\b1[- ]year|\\bun an\\b|\\b12 mois|\\bun año|\\b12 meses|\\b1 rok${END}|\\b12 miesięcy`,
    "iu",
  ),
  export: /export|eksport/i,
};

const dashboard = (locale: string) => loadCatalog(locale, "landing.json").variant.dashboard;

describe("landing dashboard section copy", () => {
  it.each(routing.locales)("%s: says nothing the captures do not show", (locale) => {
    const offenders = catalogStrings(dashboard(locale), "variant.dashboard").flatMap(({ where, text }) =>
      Object.entries(OFF_PICTURE)
        .filter(([, pattern]) => pattern.test(text))
        .map(([rule]) => `${rule} at ${where}: ${text}`),
    );
    expect(offenders).toEqual([]);
  });

  it.each(routing.locales)("%s: the plan line leads with the captured plan and names only plans with charts", (locale) => {
    const line: string = dashboard(locale).planLine;
    const at = (tier: (typeof TIERS)[number]) => line.search(new RegExp(`\\b${PLAN_NAMES[tier]}\\b`));
    const withCharts = tiersWhere((facts) => facts.analyticsCharts);

    for (const tier of TIERS) {
      expect({ tier, named: at(tier) >= 0 }).toEqual({ tier, named: withCharts.includes(tier) });
    }
    const first = TIERS.filter((tier) => at(tier) >= 0).sort((a, b) => at(a) - at(b))[0];
    expect(first).toBe(CAPTURE_PLAN);
  });
});

describe("off-picture rules", () => {
  it.each([
    ["prediction", "Sophie's coming back tomorrow"],
    ["prediction", "She will come back next week."],
    ["prediction", "Sophie revient demain"],
    ["prediction", "Ils reviendront."],
    ["prediction", "Sophie vuelve mañana"],
    ["prediction", "Tu cliente volverá"],
    ["prediction", "Sophie wraca jutro"],
    ["prediction", "Klienci wrócą"],
    ["customerName", "Sophie M. visited today"],
    ["money", "Tracked spend: €1,240"],
    ["money", "Dépenses enregistrées"],
    ["proOnly", "Monthly cohorts"],
    ["proOnly", "Kohorty miesięczne"],
    ["proOnly", "Statystyki dla każdego lokalu"],
    ["proOnly", "Historia z 1 rok"],
    ["export", "Export your data anytime"],
  ] as const)("%s catches %p", (rule, text) => {
    expect(OFF_PICTURE[rule].test(text)).toBe(true);
  });

  it.each([
    ["prediction", "of first-time customers came back"],
    ["prediction", "des nouveaux venus sont revenus"],
    ["customerName", "Screens from the Growth plan. Charts come with Growth and Pro."],
    ["proOnly", "Wizyty w czasie, z historią z 90 dni"],
    ["proOnly", "Krok po kroku"],
  ] as const)("%s leaves %p alone", (rule, text) => {
    expect(OFF_PICTURE[rule].test(text)).toBe(false);
  });
});

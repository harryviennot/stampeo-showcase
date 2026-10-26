import { describe, expect, it } from "bun:test";
import { routing } from "@/i18n/routing";
import { PLAN_NAMES, TIERS, tiersWhere } from "../plans/plan-facts";
import { catalogStrings, loadCatalog } from "../testing/catalogs";
import { CAPTURE_PLAN } from "./dashboard-shots";
import { OFF_PICTURE } from "../testing/analytics-claims";

/**
 * The landing's dashboard section (`variant.dashboard`) sits beside real
 * captures of the Growth Analytics page. Its copy may only name what those
 * captures show: totals, on Growth. Analytics keeps no per-customer
 * prediction, shows no money for a stamp card, and its cohorts, per-location
 * stats and 1-year history are Pro.
 */
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

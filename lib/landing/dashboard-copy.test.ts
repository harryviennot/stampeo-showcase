import { describe, expect, it } from "bun:test";
import { routing } from "@/i18n/routing";
import { PLAN_NAMES, TIERS, tiersWhere } from "../plans/plan-facts";
import { loadCatalog } from "../testing/catalogs";
import { OFF_PICTURE, claimOffenders, plansNamed } from "../testing/analytics-claims";

/**
 * The landing's dashboard section (`variant.dashboard`) sits beside real
 * captures of the Analytics page, shown as a Pro account so nothing in frame
 * is locked. Its copy may only name what those captures show: totals.
 * Analytics keeps no per-customer prediction, shows no money for a stamp card,
 * and its cohorts, per-location stats and 1-year history are Pro.
 */
const dashboard = (locale: string) => loadCatalog(locale, "landing.json").variant.dashboard;

describe("landing dashboard section copy", () => {
  it.each(routing.locales)("%s: says nothing the captures do not show", (locale) => {
    expect(claimOffenders(dashboard(locale), "variant.dashboard", OFF_PICTURE)).toEqual([]);
  });

  it.each(routing.locales)("%s: is a heading, one caption and the plan line, the picture does the rest", (locale) => {
    expect(Object.keys(dashboard(locale)).sort()).toEqual(["alt", "caption", "planLine", "title"]);
  });

  it.each(routing.locales)("%s: the plan line names the plans with charts once each, not the plan the screens come from", (locale) => {
    const line = dashboard(locale).planLine;
    const withCharts = tiersWhere((facts) => facts.analyticsCharts);
    expect(plansNamed(line)).toEqual(withCharts);
    for (const tier of TIERS) expect(line.split(PLAN_NAMES[tier]).length - 1).toBe(withCharts.includes(tier) ? 1 : 0);
  });
});

import { describe, expect, it } from "bun:test";
import { routing } from "@/i18n/routing";
import { PLAN_NAMES, tiersWhere } from "../plans/plan-facts";
import { loadCatalog } from "../testing/catalogs";
import { CHART_PLANS, chartPillLabel } from "./analytics-chart-plans";

/**
 * The feature page's chart grid is illustrative; each card's pill names the
 * plans that have it. Analytics charts start on the lowest plan with
 * `analyticsCharts`; the 30-day return rate is a number on every plan. The
 * three charts the product does not have yet carry the charts' plan too, at
 * Harry's call (2026-10-26).
 */
const CHARTS_FROM = tiersWhere((facts) => facts.analyticsCharts)[0];
const NOT_BUILT_YET = ["timeToReward", "completionRate", "returnRate"];

describe("analytics chart pills", () => {
  it("covers every chart the grid shows", () => {
    const charts = Object.keys(loadCatalog("en", "features.json").features.analytiques.custom.proCharts).sort();
    expect(Object.keys(CHART_PLANS).sort()).toEqual(charts);
  });

  it("puts the 30-day return rate on every plan and every chart on the plans that have charts", () => {
    for (const [chart, plan] of Object.entries(CHART_PLANS)) {
      expect({ chart, plan }).toEqual({ chart, plan: chart === "donut" ? "every" : CHARTS_FROM });
    }
  });

  it("labels no chart Pro", () => {
    expect(Object.values(CHART_PLANS)).not.toContain("pro");
  });

  it("gives the charts not built yet the charts' plan", () => {
    for (const chart of NOT_BUILT_YET) expect(CHART_PLANS[chart as keyof typeof CHART_PLANS]).toBe(CHARTS_FROM);
  });

  it.each(routing.locales)("%s: a pill reads the plan's name, or the page's 'every plan' badge", (locale) => {
    const everyPlan: string = loadCatalog(locale, "features.json").features.analytiques.custom.proAnalytics.badge;
    expect(chartPillLabel("heatmap", everyPlan)).toBe(PLAN_NAMES[CHARTS_FROM]);
    expect(chartPillLabel("donut", everyPlan)).toBe(everyPlan);
  });
});

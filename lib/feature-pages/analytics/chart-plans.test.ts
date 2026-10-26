import { describe, expect, it } from "bun:test";
import { PLAN_NAMES, tiersWhere } from "../../plans/plan-facts";
import { loadCatalog } from "../../testing/catalogs";
import { CHART_PLANS, chartPillLabel } from "./chart-plans";

/**
 * Each card of the feature page's chart grid names the plans that have it:
 * Analytics charts start on the lowest plan with `analyticsCharts`, and the
 * 30-day return rate is a number on every plan.
 */
const CHARTS_FROM = tiersWhere((facts) => facts.analyticsCharts)[0];

describe("analytics chart pills", () => {
  it("covers every chart the grid shows", () => {
    const charts = Object.keys(loadCatalog("en", "features.json").features.analytiques.custom.proCharts).sort();
    expect(Object.keys(CHART_PLANS).sort()).toEqual(charts);
  });

  it("puts the 30-day return rate on every plan and every other chart, built or not yet, on the plans that have charts", () => {
    for (const [chart, plan] of Object.entries(CHART_PLANS)) {
      expect({ chart, plan }).toEqual({ chart, plan: chart === "donut" ? "every" : CHARTS_FROM });
    }
  });

  it("labels a chart with its plan's name, or with the page's own 'every plan' wording", () => {
    expect(chartPillLabel("heatmap", "Every plan")).toBe(PLAN_NAMES[CHARTS_FROM]);
    expect(chartPillLabel("donut", "Tous les plans")).toBe("Tous les plans");
  });
});

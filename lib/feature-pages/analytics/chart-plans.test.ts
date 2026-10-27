import { describe, expect, it } from "bun:test";
import { routing } from "@/i18n/routing";
import { tiersWhere } from "../../plans/plan-facts";
import { loadCatalog } from "../../testing/catalogs";
import { plansNamed } from "../../testing/analytics-claims";
import { CHART_PLANS, chartPillLabel } from "./chart-plans";

/**
 * Each card of the feature page's chart grid names the plans that have it.
 * Weekly scans, the reward completion rate and the 30-day return rate are on
 * every plan's dashboard; every other chart, built or not yet, comes with the
 * plans that have Analytics charts, named together.
 */
const custom = (locale: string) => loadCatalog(locale, "features.json").features.analytiques.custom;
const EVERY_PLAN = ["completionRate", "donut", "lineChart"];

describe("analytics chart pills", () => {
  it("covers every chart the grid shows", () => {
    expect(Object.keys(CHART_PLANS).sort()).toEqual(Object.keys(custom("en").proCharts).sort());
  });

  it("puts weekly scans, completion rate and 30-day return on every plan, every other chart on the plans with charts", () => {
    for (const [chart, plans] of Object.entries(CHART_PLANS)) {
      expect({ chart, plans }).toEqual({ chart, plans: EVERY_PLAN.includes(chart) ? "every" : "charts" });
    }
  });

  it.each(routing.locales)("%s: a charts pill names every plan with charts, together", (locale) => {
    const { badge, chartsBadge } = custom(locale).proAnalytics;
    expect(plansNamed(chartPillLabel("heatmap", { every: badge, charts: chartsBadge }))).toEqual(
      tiersWhere((facts) => facts.analyticsCharts),
    );
    expect(chartPillLabel("lineChart", { every: badge, charts: chartsBadge })).toBe(badge);
  });
});

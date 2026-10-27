/**
 * The plans each chart card's pill names: `every` plan (weekly scans, the
 * reward completion rate and the 30-day return rate are on every plan's
 * dashboard), or the plans with Analytics `charts`, named together. Cards for
 * charts not built yet name the charts' plans.
 */
export const CHART_PLANS = {
  lineChart: "every",
  heatmap: "charts",
  donut: "every",
  segments: "charts",
  churn: "charts",
  bestDays: "charts",
  timeToReward: "charts",
  completionRate: "every",
  returnRate: "charts",
} as const satisfies Record<string, "every" | "charts">;

export type ChartKey = keyof typeof CHART_PLANS;

/** The pill text, in the page's own words for "every plan" and for the plans with charts ("Growth and Pro"). */
export function chartPillLabel(chart: ChartKey, labels: { every: string; charts: string }): string {
  return labels[CHART_PLANS[chart]];
}

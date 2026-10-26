import type { TierId } from "../../pricing";
import { PLAN_NAMES } from "../../plans/plan-facts";

/** The plan each chart card's pill names (`every` = all plans); cards for charts not built yet name the charts' plan. */
export const CHART_PLANS = {
  lineChart: "growth",
  heatmap: "growth",
  donut: "every",
  segments: "growth",
  churn: "growth",
  bestDays: "growth",
  timeToReward: "growth",
  completionRate: "growth",
  returnRate: "growth",
} as const satisfies Record<string, TierId | "every">;

export type ChartKey = keyof typeof CHART_PLANS;

/** The pill text: the plan's name, or the page's "every plan" wording. */
export function chartPillLabel(chart: ChartKey, everyPlan: string): string {
  const plan = CHART_PLANS[chart];
  return plan === "every" ? everyPlan : PLAN_NAMES[plan];
}

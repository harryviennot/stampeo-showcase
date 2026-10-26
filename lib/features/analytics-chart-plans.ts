import type { TierId } from "../pricing";
import { PLAN_NAMES } from "../plans/plan-facts";

/**
 * The plan each card of the Analytics feature page's chart grid names in its
 * pill. Charts are on Growth and up; the 30-day return rate is a number on
 * every plan. The cards for charts the product does not have yet
 * (`timeToReward`, `completionRate`, `returnRate`) also name Growth.
 */
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

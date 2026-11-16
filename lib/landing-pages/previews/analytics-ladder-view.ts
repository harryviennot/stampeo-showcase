import { PLAN_FACTS } from "@/lib/plans/plan-facts";
import type { TierId } from "@/lib/pricing";

/** What a plan shows of the three questions, and what Pro adds under them. */
export interface LadderView {
  /** Starter answers each question in a sentence; the other plans chart it. */
  layer: "sentence" | "chart";
  /** Monthly cohorts, which only the advanced analytics have. */
  cohorts: boolean;
  /** The location filter, which only plans with per-location analytics have. */
  location: boolean;
}

/** The ladder for one plan, read from the plan's facts so a change to them changes what the page shows. */
export function ladderView(tier: TierId): LadderView {
  const facts = PLAN_FACTS[tier];

  return {
    layer: facts.analyticsCharts ? "chart" : "sentence",
    cohorts: facts.analytics === "advanced",
    location: facts.locationAnalytics,
  };
}

import type { HelpPlan } from "./types";

/** Which plan pill a page carries, as a key into the `help.badges.plan` strings. */
export type PlanBadge = "pro" | "growthPro";

/**
 * A page gated to some plans shows one pill. A page on every plan shows none,
 * and Growth is never named without Pro (the loader refuses that combination).
 */
export function planBadge(plans: readonly HelpPlan[] | undefined): PlanBadge | null {
  if (!plans || plans.length === 0 || plans.includes("starter")) return null;
  return plans.includes("growth") ? "growthPro" : "pro";
}

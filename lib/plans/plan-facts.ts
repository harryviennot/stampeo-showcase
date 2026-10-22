/**
 * What each plan includes: the one place the marketing site states plan facts.
 *
 * Mirrors `PLAN_FEATURES` in backend/app/core/features.py, which decides what
 * a business can actually use; when the two disagree, the backend is right and
 * this file changes. llms.txt and the structured-data Offers read from here,
 * translated copy that quotes a number takes it through `planMessageArgs()`,
 * and lib/plans/plan-facts.test.ts checks the pricing page feature lists against it.
 */

import type { TierId } from "../pricing";

export type Unlimited = "unlimited";
export type LoyaltyType = "stamps" | "points";

export interface PlanFacts {
  /** Program types the plan may run (`programs.type`); one program per business. */
  loyaltyTypes: readonly LoyaltyType[];
  /** `team.max_members`, owner included. */
  teamMembers: number | Unlimited;
  /** See which team member made each scan (`team.employee_tracking`). */
  employeeTracking: boolean;
  /** `notifications.broadcast_limit`, per calendar month. */
  broadcastsPerMonth: number | Unlimited;
  /** `notifications.scheduled`. */
  scheduledBroadcasts: boolean;
  /** Custom milestones per program (`notifications.milestone_limit`). */
  milestoneNotifications: number | Unlimited;
  /** `locations.multiple`. */
  multipleLocations: boolean;
  /** `locations.analytics`. */
  locationAnalytics: boolean;
  /** "advanced" means basic plus advanced (`analytics.advanced`): monthly cohorts. */
  analytics: "basic" | "advanced";
  /** `analytics.charts`: the charts of visits, busiest times, how often customers come and reward progress. Without it each section shows one highlight sentence instead. */
  analyticsCharts: boolean;
  /** `analytics.history_days`: the longest period the Analytics page serves, in days. */
  analyticsHistoryDays: number | Unlimited;
  /**
   * Gated on for Pro (`designs.scheduled`), but the dashboard has no screen to
   * schedule a card style yet, so it is sold as coming soon.
   */
  scheduledDesigns: boolean | "coming_soon";
  /**
   * Gated on for Pro, but the pass generator does not emit locations yet
   * (backend/app/services/pass_generator.py), so it is sold as coming soon.
   */
  geofencing: boolean | "coming_soon";
}

export const TIERS: readonly TierId[] = ["starter", "growth", "pro"];

export const PLAN_NAMES: Record<TierId, string> = {
  starter: "Starter",
  growth: "Growth",
  pro: "Pro",
};

export const PLAN_FACTS: Readonly<Record<TierId, PlanFacts>> = {
  starter: {
    loyaltyTypes: ["stamps", "points"],
    teamMembers: 2,
    employeeTracking: false,
    broadcastsPerMonth: 0,
    scheduledBroadcasts: false,
    milestoneNotifications: 0,
    multipleLocations: false,
    locationAnalytics: false,
    analytics: "basic",
    analyticsCharts: false,
    analyticsHistoryDays: 30,
    scheduledDesigns: false,
    geofencing: false,
  },
  growth: {
    loyaltyTypes: ["stamps", "points"],
    teamMembers: "unlimited",
    employeeTracking: true,
    broadcastsPerMonth: 8,
    scheduledBroadcasts: false,
    milestoneNotifications: 3,
    multipleLocations: false,
    locationAnalytics: false,
    analytics: "basic",
    analyticsCharts: true,
    analyticsHistoryDays: 90,
    scheduledDesigns: false,
    geofencing: false,
  },
  pro: {
    loyaltyTypes: ["stamps", "points"],
    teamMembers: "unlimited",
    employeeTracking: true,
    broadcastsPerMonth: "unlimited",
    scheduledBroadcasts: true,
    milestoneNotifications: "unlimited",
    multipleLocations: true,
    locationAnalytics: true,
    analytics: "advanced",
    analyticsCharts: true,
    analyticsHistoryDays: 365,
    scheduledDesigns: "coming_soon",
    geofencing: "coming_soon",
  },
};

/** ICU arguments for translated copy that quotes a plan number. */
export function planMessageArgs(): { growthBroadcasts: number } {
  const growthBroadcasts = PLAN_FACTS.growth.broadcastsPerMonth;
  if (typeof growthBroadcasts !== "number") {
    throw new Error("Growth broadcasts must be a number to be quoted in copy");
  }
  return { growthBroadcasts };
}

/** The plans where `has` holds, cheapest first. */
export function tiersWhere(has: (facts: PlanFacts) => boolean): TierId[] {
  return TIERS.filter((tier) => has(PLAN_FACTS[tier]));
}

/** "every plan", "Growth and Pro", "Pro": where a feature is available, in English. */
export function availability(has: (facts: PlanFacts) => boolean): string {
  const tiers = tiersWhere(has);
  if (tiers.length === TIERS.length) return "every plan";
  if (tiers.length === 0) return "no plan";
  return tiers.map((tier) => PLAN_NAMES[tier]).join(" and ");
}

/** "30 days", "1 year", "unlimited": a length of Analytics history, in English. */
export function analyticsHistoryLabel(days: number | Unlimited): string {
  if (days === "unlimited") return "unlimited";
  if (days % 365 === 0) return days === 365 ? "1 year" : `${days / 365} years`;
  return `${days} days`;
}

const count = (value: number | Unlimited, noun: string) =>
  value === "unlimited" ? `unlimited ${noun}` : `${value} ${noun}`;

/** One English phrase per fact the plan has, for llms.txt and Offer descriptions. */
export function planFactLines(tier: TierId): string[] {
  const facts = PLAN_FACTS[tier];
  const lines: string[] = [facts.loyaltyTypes.join(" or ")];

  lines.push(
    typeof facts.teamMembers === "number"
      ? `${facts.teamMembers} team members (owner + ${facts.teamMembers - 1})`
      : count(facts.teamMembers, "team members")
  );
  if (facts.employeeTracking) lines.push("employee scan tracking");

  if (facts.broadcastsPerMonth === 0) lines.push("no broadcasts");
  else if (facts.broadcastsPerMonth === "unlimited") lines.push("unlimited broadcasts");
  else lines.push(`${facts.broadcastsPerMonth} broadcasts per month`);
  if (facts.scheduledBroadcasts) lines.push("scheduled broadcasts");

  if (facts.milestoneNotifications !== 0) {
    lines.push(
      facts.milestoneNotifications === "unlimited"
        ? "unlimited custom milestones"
        : `${facts.milestoneNotifications} custom milestones per program`
    );
  }

  lines.push(facts.multipleLocations ? "multiple locations" : "single location");
  if (facts.locationAnalytics) lines.push("per-location analytics");
  const history = analyticsHistoryLabel(facts.analyticsHistoryDays);
  lines.push(facts.analyticsHistoryDays === "unlimited" ? `${history} analytics history` : `${history} of analytics history`);
  lines.push(facts.analyticsCharts ? "analytics charts" : "analytics highlights instead of charts");
  if (facts.analytics === "advanced") lines.push("monthly cohorts");
  if (facts.scheduledDesigns === "coming_soon") lines.push("scheduled card designs (coming soon)");
  else if (facts.scheduledDesigns) lines.push("scheduled card designs");

  if (facts.geofencing === "coming_soon") lines.push("geofencing notifications (coming soon)");
  else if (facts.geofencing) lines.push("geofencing notifications");

  return lines;
}

/** The plan's facts as one comma-separated English phrase. */
export function planSummary(tier: TierId): string {
  return planFactLines(tier).join(", ");
}

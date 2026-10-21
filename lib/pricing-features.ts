/**
 * Feature comparison data for the pricing page.
 * Each row maps to a translation key under pricingPage.comparison.rows.{key}
 *
 * Keep in sync with backend/app/core/features.py (single source of truth).
 * In the future, this can be fetched from GET /config/features at build time.
 */

import { PLAN_FACTS, type PlanFacts } from "./plans/plan-facts";

export type CellType = "check" | "cross" | "text" | "soon";

export interface FeatureRow {
  key: string;
  starter: CellType;
  growth: CellType;
  pro: CellType;
}

export interface FeatureCategory {
  key: string;
  rows: FeatureRow[];
}

/** A row whose cell for each plan is read from that plan's facts (lib/plans/plan-facts.ts). */
function fromFacts(key: string, cell: (facts: PlanFacts) => CellType): FeatureRow {
  return {
    key,
    starter: cell(PLAN_FACTS.starter),
    growth: cell(PLAN_FACTS.growth),
    pro: cell(PLAN_FACTS.pro),
  };
}

export const FEATURE_CATEGORIES: FeatureCategory[] = [
  {
    key: "loyalty",
    rows: [
      { key: "unlimitedCustomers", starter: "check", growth: "check", pro: "check" },
      { key: "unlimitedScans", starter: "check", growth: "check", pro: "check" },
      { key: "savedTemplates", starter: "text", growth: "text", pro: "text" },
      { key: "loyaltyType", starter: "text", growth: "text", pro: "text" },
      { key: "earningCaps", starter: "cross", growth: "check", pro: "check" },
      { key: "basketBoost", starter: "cross", growth: "text", pro: "text" },
      { key: "rewardExpiry", starter: "cross", growth: "check", pro: "check" },
    ],
  },
  {
    key: "cardDesign",
    rows: [
      { key: "fullCustomisation", starter: "check", growth: "check", pro: "check" },
      { key: "scheduledChanges", starter: "cross", growth: "cross", pro: "soon" },
    ],
  },
  {
    key: "locations",
    rows: [
      { key: "locations", starter: "text", growth: "text", pro: "text" },
      { key: "locationAnalytics", starter: "cross", growth: "cross", pro: "check" },
      { key: "geofencing", starter: "cross", growth: "soon", pro: "soon" },
    ],
  },
  {
    key: "notifications",
    rows: [
      { key: "stampMilestoneReward", starter: "text", growth: "text", pro: "text" },
      { key: "milestoneLimit", starter: "cross", growth: "text", pro: "text" },
      { key: "broadcastNotifications", starter: "cross", growth: "text", pro: "text" },
      { key: "segmentation", starter: "cross", growth: "text", pro: "text" },
      { key: "scheduledSends", starter: "cross", growth: "cross", pro: "check" },
    ],
  },
  {
    key: "team",
    rows: [
      { key: "teamMembers", starter: "text", growth: "text", pro: "text" },
      { key: "employeeTracking", starter: "cross", growth: "check", pro: "check" },
    ],
  },
  {
    key: "analytics",
    rows: [
      fromFacts("analyticsHistory", () => "text"),
      fromFacts("analyticsCharts", (facts) => (facts.analyticsCharts ? "check" : "cross")),
      fromFacts("monthlyCohorts", (facts) => (facts.analytics === "advanced" ? "check" : "cross")),
    ],
  },
  {
    key: "mobileApp",
    rows: [
      { key: "offlineScanning", starter: "soon", growth: "soon", pro: "soon" },
    ],
  },
  {
    key: "support",
    rows: [
      { key: "supportLevel", starter: "text", growth: "text", pro: "text" },
    ],
  },
];

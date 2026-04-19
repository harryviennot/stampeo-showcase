/**
 * Feature comparison data for the pricing page.
 * Each row maps to a translation key under pricingPage.comparison.rows.{key}
 *
 * Keep in sync with backend/app/core/features.py (single source of truth).
 * In the future, this can be fetched from GET /config/features at build time.
 */

export type CellType = "check" | "cross" | "text";

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

export const FEATURE_CATEGORIES: FeatureCategory[] = [
  {
    key: "loyalty",
    rows: [
      { key: "unlimitedCustomers", starter: "check", growth: "check", pro: "check" },
      { key: "unlimitedScans", starter: "check", growth: "check", pro: "check" },
      { key: "activeTemplates", starter: "text", growth: "text", pro: "text" },
      { key: "savedTemplates", starter: "text", growth: "text", pro: "text" },
      { key: "loyaltyType", starter: "text", growth: "text", pro: "text" },
    ],
  },
  {
    key: "programs",
    rows: [
      { key: "multiplePrograms", starter: "cross", growth: "cross", pro: "check" },
      { key: "promotionalEvents", starter: "cross", growth: "check", pro: "check" },
    ],
  },
  {
    key: "cardDesign",
    rows: [
      { key: "fullCustomisation", starter: "check", growth: "check", pro: "check" },
      { key: "scheduledChanges", starter: "cross", growth: "cross", pro: "check" },
    ],
  },
  {
    key: "locations",
    rows: [
      { key: "locations", starter: "text", growth: "text", pro: "text" },
      { key: "locationAnalytics", starter: "cross", growth: "cross", pro: "check" },
      { key: "geofencing", starter: "cross", growth: "cross", pro: "check" },
    ],
  },
  {
    key: "notifications",
    rows: [
      { key: "stampMilestoneReward", starter: "text", growth: "text", pro: "text" },
      { key: "milestoneLimit", starter: "text", growth: "text", pro: "text" },
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
      { key: "basicStats", starter: "check", growth: "check", pro: "check" },
      { key: "advancedAnalytics", starter: "cross", growth: "cross", pro: "check" },
    ],
  },
  {
    key: "mobileApp",
    rows: [
      { key: "offlineScanning", starter: "check", growth: "check", pro: "check" },
    ],
  },
  {
    key: "support",
    rows: [
      { key: "supportLevel", starter: "text", growth: "text", pro: "text" },
    ],
  },
];

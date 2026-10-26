import { describe, expect, it } from "bun:test";
import { routing } from "@/i18n/routing";
import { buildLlmsTxt } from "../llms-txt";
import { PLAN_NAMES, TIERS, tiersWhere } from "../plans/plan-facts";
import { catalogStrings, loadCatalog } from "../testing/catalogs";
import { OFF_PICTURE, PER_CUSTOMER, REAL_TIME } from "../testing/analytics-claims";
import { CAPTURE_PLAN } from "../landing/dashboard-shots";

/**
 * The Analytics feature page sits next to real captures of the Growth
 * Analytics page, which shows totals and refreshes every ten minutes. The
 * page, its search snippet and llms.txt must say the same.
 */
const page = (locale: string) => loadCatalog(locale, "features.json").features.analytiques;

const offenders = (tree: unknown, root: string, rules: Record<string, RegExp>) =>
  catalogStrings(tree, root).flatMap(({ where, text }) =>
    Object.entries(rules)
      .filter(([, pattern]) => pattern.test(text))
      .map(([rule]) => `${rule} at ${where}: ${text}`),
  );

describe("analytics feature page copy", () => {
  it.each(routing.locales)("%s: the hero and the busiest row say nothing the captures do not show", (locale) => {
    const { hero, busiest } = page(locale);
    const rules = { ...OFF_PICTURE, realTime: REAL_TIME, perCustomer: PER_CUSTOMER };
    expect([...offenders(hero, "hero", rules), ...offenders(busiest, "busiest", rules)]).toEqual([]);
  });

  it.each(routing.locales)("%s: the hero's plan line leads with the captured plan and names only plans with charts", (locale) => {
    const line: string = page(locale).hero.planLine;
    const at = (tier: (typeof TIERS)[number]) => line.search(new RegExp(`\\b${PLAN_NAMES[tier]}\\b`));
    const withCharts = tiersWhere((facts) => facts.analyticsCharts);
    for (const tier of TIERS) {
      expect({ tier, named: at(tier) >= 0 }).toEqual({ tier, named: withCharts.includes(tier) });
    }
    expect(TIERS.filter((tier) => at(tier) >= 0).sort((a, b) => at(a) - at(b))[0]).toBe(CAPTURE_PLAN);
  });

  it.each(routing.locales)("%s: the busiest row says what Starter gets and which plans show the grid", (locale) => {
    const lead: string = page(locale).busiest.lead;
    for (const tier of TIERS) expect({ tier, named: lead.includes(PLAN_NAMES[tier]) }).toEqual({ tier, named: true });
  });

  it.each(routing.locales)("%s: the problem cards ask about customers as a group", (locale) => {
    expect(offenders(page(locale).custom.blindSpotCards, "blindSpotCards", { perCustomer: PER_CUSTOMER })).toEqual([]);
  });

  it.each(routing.locales)("%s: the activity feed shows the product's time labels, not a seconds counter", (locale) => {
    const feed = page(locale).custom.activityFeed;
    expect(catalogStrings(feed).filter(({ text }) => text.includes("{seconds}"))).toEqual([]);
  });

  it.each(routing.locales)("%s: the old dashboard mock and the unused sections list are gone", (locale) => {
    expect(page(locale).custom.dashboard).toBeUndefined();
    expect(page(locale).sections).toBeUndefined();
  });
});

describe("analytics outside the page", () => {
  it.each(routing.locales)("%s: the search title and description call Analytics neither live nor per-customer", (locale) => {
    const meta = loadCatalog(locale, "metadata.json").metadata.features.analytiques;
    expect(offenders(meta, "metadata", { realTime: REAL_TIME, perCustomer: PER_CUSTOMER })).toEqual([]);
  });

  it("llms.txt describes Analytics as totals", () => {
    const analytics = buildLlmsTxt()
      .split("\n")
      .filter((line) => /analytics/i.test(line));
    expect(analytics.filter((line) => PER_CUSTOMER.test(line) || REAL_TIME.test(line))).toEqual([]);
  });
});

import { describe, expect, it } from "bun:test";
import { routing } from "@/i18n/routing";
import { buildLlmsTxt } from "../../llms-txt";
import { tiersWhere } from "../../plans/plan-facts";
import { loadCatalog } from "../../testing/catalogs";
import { OFF_PICTURE, PER_CUSTOMER, REAL_TIME, claimOffenders, plansNamed } from "../../testing/analytics-claims";
import { CAPTURE_PLAN } from "../../landing/dashboard-shots";

/**
 * The Analytics feature page sits next to real captures of the Growth
 * Analytics page, which shows totals and refreshes every ten minutes. The
 * page, its search snippet and llms.txt must say the same.
 */
const page = (locale: string) => loadCatalog(locale, "features.json").features.analytiques;
const WITH_CHARTS = tiersWhere((facts) => facts.analyticsCharts);

describe("analytics feature page copy", () => {
  it.each(routing.locales)("%s: the hero and the busiest row say nothing the captures do not show", (locale) => {
    const { hero, busiest } = page(locale);
    const rules = { ...OFF_PICTURE, realTime: REAL_TIME, perCustomer: PER_CUSTOMER };
    expect([...claimOffenders(hero, "hero", rules), ...claimOffenders(busiest, "busiest", rules)]).toEqual([]);
  });

  it.each(routing.locales)("%s: the rest of the page calls Analytics neither live nor per-customer", (locale) => {
    const { problem, cta, custom } = page(locale);
    const rules = { realTime: REAL_TIME, perCustomer: PER_CUSTOMER };
    expect([
      ...claimOffenders(problem, "problem", rules),
      ...claimOffenders(cta, "cta", rules),
      ...claimOffenders(custom.blindSpotCards, "blindSpotCards", rules),
      ...claimOffenders(custom.proAnalytics, "proAnalytics", rules),
    ]).toEqual([]);
  });

  it.each(routing.locales)("%s: the hero's subtitle names no plan; its plan line leads with the captured plan and names only plans with charts", (locale) => {
    const { subtitle, planLine } = page(locale).hero;
    expect(plansNamed(subtitle)).toEqual([]);
    const named = plansNamed(planLine);
    expect([...named].sort()).toEqual([...WITH_CHARTS].sort());
    expect(named[0]).toBe(CAPTURE_PLAN);
  });

  it.each(routing.locales)("%s: the busiest row names Starter first, then the plans that show the grid", (locale) => {
    expect(plansNamed(page(locale).busiest.lead)).toEqual(["starter", ...WITH_CHARTS]);
  });
});

describe("analytics outside the page", () => {
  it.each(routing.locales)("%s: the search title and description call Analytics neither live nor per-customer", (locale) => {
    const meta = loadCatalog(locale, "metadata.json").metadata.features.analytiques;
    expect(claimOffenders(meta, "metadata", { realTime: REAL_TIME, perCustomer: PER_CUSTOMER })).toEqual([]);
  });

  it("llms.txt describes Analytics as totals, on its section and its feature-page line", () => {
    const analytics = buildLlmsTxt()
      .split("\n")
      .filter((line) => /analyti(?:cs|ques)/i.test(line));
    expect(analytics.some((line) => line.includes("/features/analytiques"))).toBe(true);
    expect(analytics.filter((line) => PER_CUSTOMER.test(line) || REAL_TIME.test(line))).toEqual([]);
  });
});

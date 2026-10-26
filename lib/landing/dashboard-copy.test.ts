import { describe, expect, it } from "bun:test";
import { routing } from "@/i18n/routing";
import { tiersWhere } from "../plans/plan-facts";
import { loadCatalog } from "../testing/catalogs";
import { CAPTURE_PLAN } from "./dashboard-shots";
import { OFF_PICTURE, claimOffenders, plansNamed } from "../testing/analytics-claims";

/**
 * The landing's dashboard section (`variant.dashboard`) sits beside real
 * captures of the Growth Analytics page. Its copy may only name what those
 * captures show: totals, on Growth. Analytics keeps no per-customer
 * prediction, shows no money for a stamp card, and its cohorts, per-location
 * stats and 1-year history are Pro.
 */
const dashboard = (locale: string) => loadCatalog(locale, "landing.json").variant.dashboard;

describe("landing dashboard section copy", () => {
  it.each(routing.locales)("%s: says nothing the captures do not show", (locale) => {
    expect(claimOffenders(dashboard(locale), "variant.dashboard", OFF_PICTURE)).toEqual([]);
  });

  it.each(routing.locales)("%s: is a heading, one caption and the plan line, the picture does the rest", (locale) => {
    expect(Object.keys(dashboard(locale)).sort()).toEqual(["alt", "caption", "planLine", "title"]);
  });

  it.each(routing.locales)("%s: the plan line leads with the captured plan and names only plans with charts", (locale) => {
    const named = plansNamed(dashboard(locale).planLine);
    expect([...named].sort()).toEqual([...tiersWhere((facts) => facts.analyticsCharts)].sort());
    expect(named[0]).toBe(CAPTURE_PLAN);
  });
});

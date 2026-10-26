import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { routing } from "@/i18n/routing";
import { PLAN_NAMES, TIERS, tiersWhere } from "./plans/plan-facts";
import { catalogStrings, loadCatalog } from "./testing/catalogs";

/**
 * The landing's dashboard section (`variant.dashboard`) sits beside real
 * captures of the Growth Analytics page. Its copy may only name what those
 * captures show: totals, on Growth. Analytics keeps no per-customer
 * prediction, shows no money for a stamp card, and its cohorts, per-location
 * stats and 1-year history are Pro.
 */
const OFF_PICTURE: Record<string, RegExp> = {
  prediction: /\bwill (?:come back|return)\b|\brevien(?:dra|dront)\b|\bvolver(?:á|án)\b|\bwróc(?:i|ą)\b/i,
  money: /[€$£]|\bspen[dt]|\bdépens|\bgast(?:o|an|ado)|\bwyda(?:ją|tki|tek)/i,
  proOnly: /cohort|kohort|per[- ]location|par établissement|por local|lokalizacj|\b1[- ]year|\bun an\b|\b12 mois\b|\bun año\b|\b12 meses\b|\b12 miesięcy\b/i,
  export: /export|eksport/i,
};

const dashboard = (locale: string) => loadCatalog(locale, "landing.json").variant.dashboard;

describe("landing dashboard section copy", () => {
  it.each(routing.locales)("%s: says nothing the captures do not show", (locale) => {
    const offenders = catalogStrings(dashboard(locale), "variant.dashboard").flatMap(({ where, text }) =>
      Object.entries(OFF_PICTURE)
        .filter(([, pattern]) => pattern.test(text))
        .map(([rule]) => `${rule} at ${where}: ${text}`),
    );
    expect(offenders).toEqual([]);
  });

  it.each(routing.locales)("%s: the plan line names the plans that have charts, and no other", (locale) => {
    const line: string = dashboard(locale).planLine;
    const withCharts = tiersWhere((facts) => facts.analyticsCharts);
    for (const tier of TIERS) {
      const named = new RegExp(`\\b${PLAN_NAMES[tier]}\\b`).test(line);
      expect({ tier, named }).toEqual({ tier, named: withCharts.includes(tier) });
    }
  });
});

describe("the /features/analytics mock's keys", () => {
  // components/features/analytics/DashboardSection.tsx still reads these from
  // `landing.dashboard` (STA-519 moves them). next-intl renders a missing key as
  // its raw path in prod, and the catalog parity test passes when a key is
  // deleted from all four locales at once, so this is the only thing that
  // notices.
  const source = readFileSync(
    join(import.meta.dir, "..", "components", "features", "analytics", "DashboardSection.tsx"),
    "utf8",
  );
  const used = [...source.matchAll(/\btd\("([^"]+)"\)/g)].map((match) => match[1]).sort();

  it("still reads them from landing.dashboard", () => {
    expect(source).toContain('useTranslations("landing.dashboard")');
    expect(used.length).toBeGreaterThan(0);
  });

  it.each(routing.locales)("%s: landing.dashboard holds exactly what that page reads", (locale) => {
    const held = catalogStrings(loadCatalog(locale, "landing.json").landing.dashboard)
      .map(({ where }) => where)
      .sort();
    expect(held).toEqual(used);
  });
});

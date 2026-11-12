/**
 * The plan chips of the `/us/landing-pages/*` pages are typed by hand; the
 * plans a feature comes with are decided in `lib/plans/plan-facts.ts`
 * (`PLAN_FACTS`, which mirrors the backend's `PLAN_FEATURES`). Every chip the
 * pages print is tied here to the fact that decides it, so a pricing change
 * (broadcasts opening to every plan, a fourth level cap) fails this file
 * instead of leaving a chip that is no longer true.
 */

import { describe, expect, test } from "bun:test";
import { FEATURE_CATEGORIES } from "../pricing-features";
import { PLAN_FACTS, TIERS, availability, type PlanFacts } from "../plans/plan-facts";
import { ALL, MODULES, mentions, objectsWith } from "../testing/landing-copy";
import { SHARED } from "./copy/shared";

type Gate = (facts: PlanFacts) => boolean;

/**
 * A feature `PLAN_FACTS` has no field for, read from the pricing page's feature table (`lib/pricing-features.ts`):
 * a plan has it when its cell is not a cross. A gate takes the facts, so it is found by the tier they belong to.
 */
function pricingRow(...keys: string[]): Gate {
  const rows = FEATURE_CATEGORIES.flatMap((category) => category.rows);
  return (facts) => {
    const tier = TIERS.find((candidate) => PLAN_FACTS[candidate] === facts);
    return keys.every((key) => {
      const row = rows.find((candidate) => candidate.key === key);
      if (!tier || !row) throw new Error(`no pricing row "${key}" for ${tier}`);
      return row[tier] !== "cross";
    });
  };
}

const BROADCASTS: Gate = (facts) => facts.broadcastsPerMonth !== 0;
const ANALYTICS_CHARTS: Gate = (facts) => facts.analyticsCharts;

/** Each chipped object of the copy (a Fact, Tile, Moment or program type) and the fact that decides its chip. */
const CHIPPED: Record<string, Gate> = {
  "PROGRAM_TYPES[0]": (facts) => facts.loyaltyTypes.includes("stamps"),
  "PROGRAM_TYPES[1]": (facts) => facts.loyaltyTypes.includes("points"),
  "PROGRAM_TYPES[1].facts[1]": pricingRow("basketBoost"),
  "PROGRAM_TYPES[2]": (facts) => facts.levels > 0,
  "OUTCOMES.levels": (facts) => facts.levels > 0,
  "FEATURES.messages.moments[0]": pricingRow("stampMilestoneReward"),
  "FEATURES.messages.moments[1]": pricingRow("stampMilestoneReward"),
  "FEATURES.messages.moments[2]": BROADCASTS,
  "FEATURES.more.tiles[4]": pricingRow("earningCaps", "rewardExpiry"),
  "FEATURES.more.tiles[5]": (facts) => facts.multipleLocations,
  "PLATFORM.platform.scanner.facts[2]": (facts) => facts.teamMembers === "unlimited",
};

/**
 * Chips on features that are on every plan because no plan gates them: neither `PLAN_FACTS` nor the pricing
 * table has a row for them. The reason sits beside each, and the chip has to stay "Every plan".
 */
const UNGATED: Record<string, string> = {
  "FEATURES.more.tiles[0]": "a welcome gift is part of every program",
  "FEATURES.more.tiles[1]": "granting a reward by hand is on every tier (backend features.py, rewards.expiry's note)",
  "FEATURES.more.tiles[2]": "the counter flyer is part of every dashboard",
  "FEATURES.more.tiles[3]": "a card's language follows the customer's phone on every plan",
  "OUTCOMES.regulars": "customer groups are part of the basic Analytics every plan has (analytics.basic)",
};

/** Lines of the copy that name a plan in a sentence rather than as a chip, and the fact that decides them. */
const PLAN_LINES: Record<string, Gate> = {
  "SHARED.broadcastPlans": BROADCASTS,
  "SHARED.dashboardPlans": ANALYTICS_CHARTS,
  "FEATURES.analytics.planLine": ANALYTICS_CHARTS,
};

/** How `availability` words a chip: lower case, as the chips are written with a capital. */
const label = (text: string) => text.trim().toLowerCase();

const chipAt = (path: string): string => {
  const found = Object.entries(MODULES)
    .flatMap(([name, value]) => objectsWith(value, ["plan"], name))
    .find((candidate) => candidate.path === path);
  return String(found?.object.plan);
};

const lineAt = (path: string): string => ALL.find((line) => line.path === path)?.value ?? "";

/** The plan a sentence names: the label at its end ("Growth and Pro", "Pro"), or the whole line when it is one. */
const planIn = (text: string) => /(Every plan|Growth and Pro|Pro)\.?$/.exec(text)?.[1] ?? "";

describe("every chip is what PLAN_FACTS says (AC20)", () => {
  test("the chips of the copy are all in the table, so a new chip fails here until its fact is named", () => {
    const chipped = Object.entries(MODULES).flatMap(([name, value]) => objectsWith(value, ["plan"], name));

    expect(chipped.map(({ path }) => path).sort()).toEqual([...Object.keys(CHIPPED), ...Object.keys(UNGATED)].sort());
  });

  test.each(Object.entries(CHIPPED))("%s", (path, gate) => {
    expect({ path, chip: label(chipAt(path)) }).toEqual({ path, chip: label(availability(gate)) });
  });

  test.each(Object.entries(UNGATED))("%s stays on every plan: %s", (path) => {
    expect({ path, chip: chipAt(path) }).toEqual({ path, chip: "Every plan" });
  });

  test.each(Object.entries(PLAN_LINES))("the plans %s names", (path, gate) => {
    expect({ path, plan: label(planIn(lineAt(path))) }).toEqual({ path, plan: label(availability(gate)) });
  });
});

describe("a broadcast is labelled with the plans that have broadcasts (STA-549 flips this)", () => {
  /**
   * The Platform dashboard's broadcast fact carries no chip on purpose (Harry, 13 Nov 2026): broadcasts open to
   * every plan right after these pages ship, so it is listed unbadged.
   */
  const NO_CHIP_ON_PURPOSE = ["PLATFORM.platform.dashboard.facts[2].text"];

  /** The two lines printed with `SHARED.broadcastPlans` in their paragraph by `PlanLine`. */
  const ON_A_PLAN_LINE = ["FEATURES.messages.broadcast", "OUTCOMES.slowDays.noFees"];

  const broadcasts = () =>
    Object.entries(MODULES)
      .flatMap(([name, value]) => mentions(value, /broadcast/i, name))
      .filter(({ path }) => !NO_CHIP_ON_PURPOSE.includes(path))
      .map(({ path, plan }) => ({ path, plan: plan ?? (ON_A_PLAN_LINE.includes(path) ? SHARED.broadcastPlans : "no label") }));

  test("every other mention carries the label PLAN_FACTS gives broadcasts, as a chip or on its plan line", () => {
    const expected = label(availability(BROADCASTS));

    expect(broadcasts().map(({ path }) => path)).toEqual([
      "FEATURES.messages.moments[2].title",
      "FEATURES.messages.broadcast",
      "OUTCOMES.slowDays.noFees",
    ]);
    expect(broadcasts().filter(({ plan }) => label(plan) !== expected)).toEqual([]);
  });

  test("the exempt mention is the one broadcast fact that has no chip, and is still a broadcast mention", () => {
    const exempt = Object.entries(MODULES).flatMap(([name, value]) => mentions(value, /broadcast/i, name));

    expect(exempt.filter(({ path }) => NO_CHIP_ON_PURPOSE.includes(path))).toEqual([
      { path: "PLATFORM.platform.dashboard.facts[2].text", plan: undefined },
    ]);
  });
});

describe("the number of levels is PLAN_FACTS' (AC20)", () => {
  const FIGURES = ALL.flatMap((line) =>
    [...line.value.matchAll(/\bup to (\d+) levels\b/gi)].map((match) => ({ path: line.path, count: Number(match[1]) })),
  );

  test("the copy says it twice, in the program types and on the Outcomes levels", () => {
    expect(FIGURES.map(({ path }) => path).sort()).toEqual(["OUTCOMES.levels.facts[0].text", "PROGRAM_TYPES[2].body"]);
  });

  test.each(FIGURES.map((figure) => [figure.path, figure.count] as const))(
    "%s: every plan has exactly %i levels, which is what its \"Every plan\" chip promises",
    (_path, count) => {
      expect(availability((facts) => facts.levels === count)).toBe("every plan");
    },
  );
});

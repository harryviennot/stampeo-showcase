/**
 * The words of the `/us/landing-pages/*` pages live in TypeScript, so the
 * catalog guards in `i18n-catalogs.test.ts` never see them. This applies the
 * same claim guards, plus the plan's own: what these pages may not say, how
 * long each line may run, and what a figure has to print under it.
 *
 * Every string of every copy module is checked with its path, so a failure
 * names the line (`OUTCOMES.regulars.example.text`), not just the file.
 */

import { describe, expect, test } from "bun:test";
import { NO_CARD_CLAIM, WORDED_TRIAL } from "../testing/copy-claims";
import { ALL, MODULES, PAGES, mentions, objectsWith, offenders } from "../testing/landing-copy";
import { splitAccent } from "./accent";
import * as shared from "./copy/shared";

/** A percentage ("34%") or a multiplier ("6×", "6X"): what only a sourced figure may print. */
const FIGURE = /\d+(?:\.\d+)?\s*%|\b\d+\s*[x×X](?![\p{L}\p{N}])/u;

/** The plan labels a broadcast may sit under. */
const BROADCAST_PLANS = ["Growth and Pro", "Pro"];

/** The two lines that carry their plan on the same line in the page, printed with the label by their component. */
const PLAN_LINES = ["FEATURES.messages.broadcast", "OUTCOMES.slowDays.noFees"];

/**
 * Mentions that carry no plan label by Harry's call (13 Nov 2026): broadcasts
 * open to every plan right after these pages ship (STA-549), so the Platform
 * page lists them without a badge.
 */
const UNBADGED = ["PLATFORM.platform.dashboard.facts[2].text"];

/** Mentions of `pattern` that no plan label qualifies and no plan line accounts for. */
const unlabelled = (pattern: RegExp) =>
  Object.entries(MODULES)
    .flatMap(([name, value]) => mentions(value, pattern, name))
    .filter(({ plan }) => !BROADCAST_PLANS.includes(plan ?? ""))
    .map(({ path }) => path)
    .sort();

describe("what these pages may not claim (AC10)", () => {
  test("there is copy to check", () => {
    expect(ALL.length).toBeGreaterThan(150);
  });

  test("no line promises a trial without a card", () => {
    expect(offenders(NO_CARD_CLAIM)).toEqual([]);
  });

  test("no line writes the trial length in words: it is the {trialDays} token", () => {
    expect(offenders(WORDED_TRIAL)).toEqual([]);
  });

  test.each([
    ["an em dash", /—/],
    ["a reminder", /remind/i],
    ["offline", /offline/i],
    ["a number of minutes", /\bminutes?\b/i],
    ["a count of days: the trial is the {trialDays} token", /\d+[\s-]*days?\b/i],
    ['tiers: the product\'s word is "levels"', /\btiers?\b/i],
  ])("no line says %s", (_what, pattern) => {
    expect(offenders(pattern)).toEqual([]);
  });

  test('levels are shown as live: the product\'s noun is in the copy', () => {
    expect(ALL.some((line) => /\blevels?\b/i.test(line.value))).toBe(true);
  });

  test('"punch" only ever appears in "punch card"', () => {
    const withoutCards = (value: string) => value.replace(/\bpunch cards?\b/gi, "");

    expect(ALL.filter((line) => /punch/i.test(withoutCards(line.value))).map((line) => line.path)).toEqual([]);
    expect(ALL.some((line) => /\bpunch cards?\b/i.test(line.value))).toBe(true);
  });

  test("no notification is sent by Stampeo: the card carries the business's name", () => {
    const banners = Object.entries(MODULES).flatMap(([name, value]) => objectsWith(value, ["sender", "body"], name));

    expect(banners.length).toBeGreaterThan(0);
    expect(banners.filter(({ object }) => /stampeo/i.test(String(object.sender))).map((b) => b.path)).toEqual([]);
  });

  // A new unlabelled mention fails here until someone decides where its plan label goes.
  test.each([
    ["broadcast", /broadcast/i],
    ["texting fees", /texting fees/i],
  ])("%s is mentioned only under a Growth and Pro or Pro label, or on a plan line", (_what, pattern) => {
    const loose = unlabelled(pattern).filter((path) => !UNBADGED.includes(path));

    expect(loose.filter((path) => !PLAN_LINES.includes(path))).toEqual([]);
    expect(loose).toEqual(PLAN_LINES);
  });

  test("the broadcast guard flags an unlabelled mention and accepts a labelled one", () => {
    const copy = {
      facts: [{ text: "Broadcasts to every card" }, { text: "Broadcasts to every card", plan: "Growth and Pro" }],
      tile: { title: "Broadcast", plan: "Every plan" },
      moment: { title: "Broadcast", banner: { body: "Hi" }, plan: "Pro" },
    };
    const plans = mentions(copy, /broadcast/i, "COPY").map(({ path, plan }) => [path, plan]);

    expect(plans).toEqual([
      ["COPY.facts[0].text", undefined],
      ["COPY.facts[1].text", "Growth and Pro"],
      ["COPY.tile.title", "Every plan"],
      ["COPY.moment.title", "Pro"],
    ]);
  });
});

describe("how much each line may say (AC11)", () => {
  test.each(Object.entries(PAGES))("%s: the hero fits above the fold", (_name, page) => {
    const hero = page.hero as { h1: string; sub?: string };

    expect(hero.h1.length).toBeLessThanOrEqual(46);
    if (hero.sub !== undefined) expect(hero.sub.length).toBeLessThanOrEqual(90);
  });

  /** The largest a `title` may be: the closing lines are shorter, a page's meta is not a heading. */
  const titleBudget = (path: string): number | null => {
    if (/\.meta\.title$/.test(path)) return null;
    return /\.(?:finalCta|band)\.title$/.test(path) ? 36 : 44;
  };

  const titles = ALL.filter((line) => /\.title$/.test(line.path) && titleBudget(line.path) !== null);
  const leads = ALL.filter((line) => /\.lead$/.test(line.path));
  const eyebrows = ALL.filter((line) => /\.eyebrow$/.test(line.path));

  test("the fields are found", () => {
    expect(titles.length).toBeGreaterThan(40);
    expect(leads.length).toBeGreaterThan(15);
    expect(eyebrows.length).toBeGreaterThan(8);
  });

  test("every title is at most 44 characters, the closing lines 36", () => {
    expect(titles.filter((line) => line.value.length > (titleBudget(line.path) ?? 0)).map((line) => line.path)).toEqual([]);
  });

  test("every lead is at most 85 characters", () => {
    expect(leads.filter((line) => line.value.length > 85).map((line) => line.path)).toEqual([]);
  });

  test("every eyebrow is at most 28 characters", () => {
    expect(eyebrows.filter((line) => line.value.length > 28).map((line) => line.path)).toEqual([]);
  });

  test("every accent is words of its headline", () => {
    const accented = Object.entries(MODULES).flatMap(([name, value]) => objectsWith(value, ["accent"], name));

    expect(accented.length).toBeGreaterThanOrEqual(8);
    for (const { path, object } of accented) {
      const text = String(object.h1 ?? object.title ?? "");
      expect({ path, found: text.includes(String(object.accent)) }).toEqual({ path, found: true });
      expect(String(object.accent).length).toBeGreaterThan(0);
    }
  });
});

describe("the accent words", () => {
  test("splits a headline around its accent, keeping the no-break hyphen", () => {
    expect(splitAccent("Turn first‑time customers into regulars.", "regulars.")).toEqual({
      before: "Turn first‑time customers into ",
      accent: "regulars.",
      after: "",
    });
    expect(splitAccent("Your punch card, in Apple & Google Wallet.", "punch card")).toEqual({
      before: "Your ",
      accent: "punch card",
      after: ", in Apple & Google Wallet.",
    });
  });

  test("leaves a headline whole when the accent is not in it", () => {
    expect(splitAccent("Make your card today.", "tomorrow")).toEqual({
      before: "Make your card today.",
      accent: "",
      after: "",
    });
  });
});

describe("figures from other people (AC12)", () => {
  const figures = Object.entries(MODULES).flatMap(([name, value]) => objectsWith(value, ["source"], name));

  test("every sourced figure says what it says and where it comes from", () => {
    expect(figures.map((figure) => figure.path).sort()).toEqual([
      "OUTCOMES.headStart.empty",
      "OUTCOMES.headStart.withHeadStart",
      "OUTCOMES.problem.figure",
    ]);
    for (const { object } of figures) {
      expect(String(object.text).trim()).not.toBe("");
      expect(String(object.source).trim()).not.toBe("");
    }
  });

  test.each([
    ["6×", true],
    ["6X more annual revenue", true],
    ["a 10x return", true],
    ["34% finished the card", true],
    ["3.5 %", true],
    ["5 of 8 stamps", false],
    ["2 free stamps", false],
    ["20 customers, 4 times a year", false],
  ])("a figure is a percentage or a multiplier: %s", (text, isFigure) => {
    expect(FIGURE.test(text)).toBe(isFigure);
  });

  test("a percentage or a multiplier is printed only as a sourced figure, or in the labelled example", () => {
    const allowed = new Set([
      ...figures.flatMap(({ path }) => [`${path}.value`, `${path}.text`]),
      "OUTCOMES.regulars.example.text",
    ]);

    expect(ALL.filter((line) => FIGURE.test(line.value) && !allowed.has(line.path)).map((line) => line.path)).toEqual([]);
    expect(ALL.filter((line) => FIGURE.test(line.value)).length).toBeGreaterThanOrEqual(4);
  });
});

describe("prices and the trial length (AC13)", () => {
  test("a dollar amount appears only in the worked example", () => {
    expect(offenders(/\$/)).toEqual(["OUTCOMES.regulars.example.text"]);
  });

  test("the reassurance carries the token", () => {
    expect(shared.SHARED.reassurance).toContain("{trialDays}");
  });
});

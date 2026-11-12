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
import { splitAccent } from "./accent";
import * as features from "./copy/features";
import * as howItWorks from "./copy/how-it-works";
import * as outcomes from "./copy/outcomes";
import * as shared from "./copy/shared";

interface Line {
  path: string;
  value: string;
}

/** Every string under `value`, with its path (`FAQ.items[0].answer`). Functions are not copy. */
function lines(value: unknown, path: string): Line[] {
  if (typeof value === "string") return [{ path, value }];
  if (Array.isArray(value)) return value.flatMap((item, index) => lines(item, `${path}[${index}]`));
  if (typeof value === "object" && value !== null) {
    return Object.entries(value).flatMap(([key, child]) => lines(child, `${path}.${key}`));
  }
  return [];
}

/** Every plain object under `value` that has all of `keys`, with its path. */
function objectsWith(value: unknown, keys: string[], path: string): Array<{ path: string; object: Record<string, unknown> }> {
  if (Array.isArray(value)) return value.flatMap((item, index) => objectsWith(item, keys, `${path}[${index}]`));
  if (typeof value !== "object" || value === null) return [];
  const object = value as Record<string, unknown>;
  const here = keys.every((key) => key in object) ? [{ path, object }] : [];
  return [...here, ...Object.entries(object).flatMap(([key, child]) => objectsWith(child, keys, `${path}.${key}`))];
}

const MODULES = { ...howItWorks, ...features, ...outcomes, ...shared } as Record<string, unknown>;
const ALL = Object.entries(MODULES).flatMap(([name, value]) => lines(value, name));

const PAGES = {
  HOW_IT_WORKS: howItWorks.HOW_IT_WORKS,
  FEATURES: features.FEATURES,
  OUTCOMES: outcomes.OUTCOMES,
};

/** A percentage ("34%") or a multiplier ("6\u00d7", "6X"): what only a sourced figure may print. */
const FIGURE = /\d+(?:\.\d+)?\s*%|\b\d+\s*[x\u00d7X](?![\p{L}\p{N}])/u;

/** The paths whose lines break `pattern`. */
const offenders = (pattern: RegExp) => ALL.filter((line) => pattern.test(line.value)).map((line) => line.path);

describe("what these pages may not claim (AC10)", () => {
  test("there is copy to check", () => {
    expect(ALL.length).toBeGreaterThan(60);
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
    ["levels, which a new US sign-up cannot turn on", /\blevels?\b/i],
  ])("no line says %s", (_what, pattern) => {
    expect(offenders(pattern)).toEqual([]);
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

  // A new mention fails here until someone decides where its plan label goes.
  test.each([
    ["broadcast", /broadcast/i, ["FEATURES.messages.broadcast", "OUTCOMES.slowDays.lead"]],
    ["texting fees", /texting fees/i, ["FEATURES.messages.broadcast", "OUTCOMES.slowDays.noFees"]],
  ])("%s is mentioned only where its component prints the plans it comes with", (_what, pattern, allowed) => {
    expect(offenders(pattern).sort()).toEqual([...allowed].sort());
  });
});

describe("how much each line may say (AC11)", () => {
  test.each(Object.entries(PAGES))("%s: the hero fits above the fold", (_name, page) => {
    expect(page.hero.h1.length).toBeLessThanOrEqual(46);
    expect(page.hero.sub.length).toBeLessThanOrEqual(90);
  });

  /** Every section of a page: whatever sits beside meta, hero and final CTA with a title. */
  const sectionsOf = (name: string, page: Record<string, unknown>) =>
    Object.entries(page)
      .filter(([key, value]) => !["meta", "hero", "finalCta"].includes(key) && typeof (value as { title?: unknown })?.title === "string")
      .map(([key, value]) => ({ path: `${name}.${key}`, ...(value as { title: string; lead?: string }) }));

  const SECTIONS = [
    ...Object.entries(PAGES).flatMap(([name, page]) => sectionsOf(name, page)),
    { path: "SHARED.demo", ...shared.SHARED.demo },
    { path: "SHARED.faq", title: shared.SHARED.faq.title, lead: undefined },
  ];

  test.each(SECTIONS.map((section) => [section.path, section] as const))(
    "%s: a title of at most 44 characters and a lead of at most 85",
    (_path, section) => {
      expect(section.title.length).toBeLessThanOrEqual(44);
      if (section.lead !== undefined) expect(section.lead.length).toBeLessThanOrEqual(85);
    },
  );

  test("the sections of every page are found", () => {
    expect(SECTIONS.length).toBeGreaterThanOrEqual(10);
  });

  test.each(Object.entries(PAGES))("%s: the closing headline is at most 36 characters", (_name, page) => {
    expect(page.finalCta.title.length).toBeLessThanOrEqual(36);
  });

  test("no list runs past three items, the FAQ apart", () => {
    const longLists = (value: unknown, path: string): string[] => {
      if (Array.isArray(value)) {
        const children = value.flatMap((item, index) => longLists(item, `${path}[${index}]`));
        return value.length > 3 ? [path, ...children] : children;
      }
      if (typeof value !== "object" || value === null) return [];
      return Object.entries(value).flatMap(([key, child]) => longLists(child, `${path}.${key}`));
    };

    const found = [...Object.entries(PAGES), ["SHARED", shared.SHARED] as const].flatMap(([name, page]) => longLists(page, name));

    expect(found).toEqual(["SHARED.faq.items"]);
    expect(shared.SHARED.faq.items).toHaveLength(5);
  });

  test.each(Object.entries(PAGES))("%s: each accent is words of its headline", (_name, page) => {
    for (const [text, accent] of [
      [page.hero.h1, page.hero.accent],
      [page.finalCta.title, page.finalCta.accent],
    ]) {
      expect(accent.length).toBeGreaterThan(0);
      expect(text).toContain(accent);
    }
  });
});

describe("the accent words", () => {
  test("splits a headline around its accent, keeping the no-break hyphen", () => {
    expect(splitAccent("Turn first\u2011time customers into regulars.", "regulars.")).toEqual({
      before: "Turn first\u2011time customers into ",
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
      "OUTCOMES.comeBack.headStart",
      "OUTCOMES.problem.figure",
    ]);
    for (const { object } of figures) {
      expect(String(object.text).trim()).not.toBe("");
      expect(String(object.source).trim()).not.toBe("");
    }
  });

  test.each([
    ["6\u00d7", true],
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
    expect(ALL.filter((line) => FIGURE.test(line.value)).length).toBeGreaterThanOrEqual(3);
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

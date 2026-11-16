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
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { DIGIT_DAYS, NO_CARD_CLAIM, WORDED_TRIAL } from "../testing/copy-claims";
import { ROOT, code } from "../testing/jsx-source";
import { ALL, MODULES, PAGES, inPreviews, objectsWith, offenders } from "../testing/landing-copy";
import { PLAN_FACTS, availability } from "../plans/plan-facts";
import { stampIcons } from "../../components/onboarding/StampIconPicker";
import { splitAccent } from "./accent";
import { CARD_DESIGN_PREVIEW } from "./copy/previews/card-design";
import { GEOLOCATION_PREVIEW } from "./copy/previews/geolocation";
import { PROMOTIONAL_CAMPAIGNS_PREVIEW } from "./copy/previews/promotional-campaigns";
import { PREVIEW_SHARED } from "./copy/previews/shared";
import * as shared from "./copy/shared";
import { LANDING_PAGES, PREVIEW_SLUGS } from "./pages";

/** A percentage ("34%") or a multiplier ("6×", "6X"): what only a sourced figure may print. */
const FIGURE = /\d+(?:\.\d+)?\s*%|\b\d+\s*[x×X](?![\p{L}\p{N}])/u;

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
    ["a count of days: the trial is the {trialDays} token", DIGIT_DAYS],
    ['tiers: the product\'s word is "levels"', /\btiers?\b/i],
  ])("no line says %s", (_what, pattern) => {
    expect(offenders(pattern)).toEqual([]);
  });

  test("levels are said as live, and every plan has them", () => {
    expect(availability((facts) => facts.levels > 0)).toBe("every plan");
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
      "PLATFORM.numbers.figures[0]",
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

describe("Platform's measured figure is the retention study's", () => {
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const study = readFileSync(join(ROOT, "docs", "features", "STA-552", "retention-study-2026-11-16.md"), "utf8");
  const day90 = /Still in the wallet at day 90 \| \*\*(\d+(?:\.\d+)?)%\*\* \| ([\d,]+) cards, from (\d+) businesses, first added (\d{4})-(\d{2})-\d{2} to \d{4}-(\d{2})-\d{2}/.exec(study);
  const [figure] = PAGES.PLATFORM.numbers.figures;

  test("the study records its day-90 result with the cards, the businesses and the months it covers", () => {
    expect(day90).not.toBeNull();
  });

  test("the figure is that share rounded down, and its source line is that cohort: the same cards, businesses and months", () => {
    const [, percent, cards, businesses, year, firstMonth, lastMonth] = day90 ?? [];

    expect(figure.value).toBe(`${Math.floor(Number(percent))}%`);
    expect(figure.text).toMatch(/still in the wallet three months later/);
    expect(figure.source).toBe(`Stampeo data: ${cards} cards from ${businesses} businesses, added ${MONTHS[Number(firstMonth) - 1]} to ${MONTHS[Number(lastMonth) - 1]} ${year}`);
  });
});

describe("percentages a component draws (AC12)", () => {
  /**
   * The components that print a percentage with no source line: drawn sample dashboards, not claims. Each computes
   * it from the sample it reads: Platform's `ANALYTICS`, so a preview's sample café shows the numbers Platform's does,
   * or the campaigns preview's counts for its campaign report.
   */
  const DRAWN_SAMPLE_DASHBOARDS: Array<[file: string, sample: RegExp]> = [
    ["components/landing-pages/platform/DeliverAnalytics.tsx", /\bANALYTICS\b/],
    ["components/landing-pages/feature-previews/analytics/KeyNumbersCard.tsx", /\bANALYTICS\b/],
    ["components/landing-pages/feature-previews/analytics/NumberCharts.tsx", /\bANALYTICS\b/],
    ["components/landing-pages/feature-previews/analytics/VisitsChart.tsx", /\bANALYTICS\b/],
    ["components/landing-pages/feature-previews/promotional-campaigns/DeliveryCard.tsx", /\bPROMOTIONAL_CAMPAIGNS_PREVIEW\b/],
  ];

  test.each(DRAWN_SAMPLE_DASHBOARDS)("%s is a drawn sample dashboard: its percentages come from %s, never typed in", (file, sample) => {
    const source = code(join(ROOT, file));

    expect(source).toMatch(sample);
    expect(source).not.toMatch(/(?<![\w[./#-])\d+(?:\.\d+)?\s*%/);
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

describe("the six previews' copy", () => {
  const previewLines = () => ALL.filter((line) => inPreviews(line.path));
  const previewModules = () => Object.entries(MODULES).filter(([name]) => inPreviews(name));

  test("there is copy to check, in all six pages and the shared links", () => {
    expect(previewModules().map(([name]) => name).sort()).toEqual([
      "ANALYTICS_PREVIEW",
      "CARD_DESIGN_PREVIEW",
      "GEOLOCATION_PREVIEW",
      "MOBILE_SCANNER_PREVIEW",
      "PREVIEW_SHARED",
      "PROMOTIONAL_CAMPAIGNS_PREVIEW",
      "PUSH_NOTIFICATIONS_PREVIEW",
    ]);
    expect(previewLines().length).toBeGreaterThan(150);
  });

  test("nothing is captioned Sample data, and no hero has a label above its headline", () => {
    expect(previewLines().filter((line) => /sample data/i.test(line.value)).map((line) => line.path)).toEqual([]);
    for (const slug of PREVIEW_SLUGS) expect(Object.keys(LANDING_PAGES[slug].hero)).not.toContain("eyebrow");
  });

  describe("every number is the product's, not typed from memory", () => {
    test("98 stamp icons, the library's own count", () => {
      expect(CARD_DESIGN_PREVIEW.icons.lead).toContain(`${stampIcons.length} ready-made icons`);
      expect(CARD_DESIGN_PREVIEW.icons.facts[0]).toContain(`${stampIcons.length} ready-made stamp icons`);
    });
  });

  test("the FAQs: card design's six questions and the campaigns page's six", () => {
    expect(CARD_DESIGN_PREVIEW.faq.items).toHaveLength(6);
    expect(PROMOTIONAL_CAMPAIGNS_PREVIEW.faq.items).toHaveLength(6);
  });

  test("each sibling link is a feature's name and one plain line of at most 50 characters", () => {
    const { cards } = PREVIEW_SHARED.related;
    const KEYS = ["cardDesign", "mobileScanner", "pushNotifications", "analytics", "promotionalCampaigns", "geolocation"];

    expect(Object.keys(cards).sort()).toEqual([...KEYS].sort());
    for (const key of KEYS) {
      const { title, line } = cards[key as keyof typeof cards];

      expect({ key, set: title.length > 0 && line.length > 0 }).toEqual({ key, set: true });
      expect({ key, short: line.length <= 50 }).toEqual({ key, short: true });
    }
    expect(PREVIEW_SHARED.related.title.length).toBeLessThanOrEqual(44);
  });

  test("no preview header has a label above the FAQ or the sibling links: they are utility, not sections", () => {
    expect(Object.keys(PREVIEW_SHARED.related)).not.toContain("eyebrow");
    for (const [name, module] of previewModules()) {
      const faq = (module as { faq?: object }).faq;

      expect({ name, label: faq && "eyebrow" in faq }).toEqual({ name, label: faq ? false : undefined });
    }
  });
});

describe("the geolocation preview says it is coming (AC12)", () => {
  const lines = () => ALL.filter((line) => line.path.startsWith("GEOLOCATION_PREVIEW."));
  const text = (path: string) => lines().find((line) => line.path === `GEOLOCATION_PREVIEW.${path}`)?.value ?? "";
  /** Every claim about geolocation is in the future, or says "soon" or "coming". */
  const FUTURE = /\b(?:will|won't|soon|coming|building)\b|'ll\b/i;

  test("it has no launch date, in any form", () => {
    const dated = /\b(?:20\d\d|Q[1-4]|January|February|March|April|May|June|July|August|September|October|November|December|spring|summer|autumn|fall|winter)\b/;

    expect(lines().filter((line) => dated.test(line.value)).map((line) => line.path)).toEqual([]);
  });

  /**
   * The lines that need not be in the future tense, and why. Every other line of the page is held to it, so a
   * new line fails here until it is written in the future or listed with its reason.
   */
  const NOT_FUTURE: Array<[path: RegExp, why: string]> = [
    [/^hero\.accent$/, "words of the headline, which is future"],
    [/^band\.accent$/, "words of the closing line, an instruction"],
    [/^hero\.alt$/, "the description of the picture, for a screen reader"],
    [/^banner\./, "the sample café's own notification: the owner's words, not a claim about the product"],
    [/^privacy\.eyebrow$/, "a label"],
    [/^faq\.title$/, "a label"],
    [/^faq\.items\[\d\]\.question$/, "a question asks, it does not claim"],
    [/^band\.title$/, "an instruction to the visitor"],
    [/^related\.title$/, "an instruction to the visitor"],
  ];
  /** The step names, each exempt only while it reads as it does here: an instruction, or what the customer does. */
  const STEP_NAMES: Record<string, string> = {
    "how.cells[0].title": "Add your shop's address",
    "how.cells[1].title": "A customer walks nearby",
    "how.cells[2].title": "Their card appears on their lock screen",
  };
  const relative = (line: { path: string }) => line.path.replace("GEOLOCATION_PREVIEW.", "");
  const exempt = (line: { path: string; value: string }) =>
    NOT_FUTURE.some(([pattern]) => pattern.test(relative(line))) || STEP_NAMES[relative(line)] === line.value;

  test("every line of the page speaks of what will be, but the labels, questions and step names the list above gives a reason for", () => {
    const claims = lines().filter((line) => !exempt(line));

    expect(claims.length).toBeGreaterThan(15);
    expect(claims.filter((line) => !FUTURE.test(line.value)).map(relative)).toEqual([]);
  });

  test("the list of exceptions holds no pattern that matches nothing, and each step name is one the page has", () => {
    for (const [pattern] of NOT_FUTURE) {
      const matched = lines().filter((line) => pattern.test(relative(line)));

      expect({ pattern: String(pattern), matched: matched.length > 0 }).toEqual({ pattern: String(pattern), matched: true });
    }
    expect(Object.entries(STEP_NAMES).filter(([path, name]) => text(path) !== name)).toEqual([]);
  });

  test("the headline says coming soon, the sub says what it will do, and no label sits above the headline", () => {
    expect(GEOLOCATION_PREVIEW.hero.h1).toMatch(/^Geolocation notifications, coming soon\.$/);
    expect(GEOLOCATION_PREVIEW.hero.sub).toMatch(/\bwill appear\b/);
    expect(Object.keys(GEOLOCATION_PREVIEW.hero)).not.toContain("eyebrow");
    expect(PLAN_FACTS.pro.geofencing).toBe("coming_soon");
  });

  test("no line names a wallet: only Apple's location list is built", () => {
    expect(lines().filter((line) => /Apple|Google/.test(line.value)).map((line) => line.path)).toEqual([]);
  });

  test("the lock screen it shows is Aurevo's, and what it says is the owner's own line", () => {
    expect(GEOLOCATION_PREVIEW.banner.sender).toBe("Aurevo");
    expect(GEOLOCATION_PREVIEW.banner.title).toMatch(/^Aurevo /);
  });

  test("it asks for no sign-up for the feature itself: no notify-me, no waitlist", () => {
    expect(lines().filter((line) => /notify me|waitlist|join the list|get notified/i.test(line.value))).toEqual([]);
  });
});

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
import { join } from "node:path";
import { DIGIT_DAYS, NO_CARD_CLAIM, WORDED_TRIAL } from "../testing/copy-claims";
import { ROOT, code } from "../testing/jsx-source";
import { ALL, MODULES, PAGES, inPreviews, mentions, objectsWith, offenders } from "../testing/landing-copy";
import { PLAN_FACTS, analyticsHistoryLabel } from "../plans/plan-facts";
import { stampIcons } from "../../components/onboarding/StampIconPicker";
import { splitAccent } from "./accent";
import { ANALYTICS_PREVIEW } from "./copy/previews/analytics";
import { CARD_DESIGN_PREVIEW } from "./copy/previews/card-design";
import { GEOLOCATION_PREVIEW } from "./copy/previews/geolocation";
import { PROMOTIONAL_CAMPAIGNS_PREVIEW } from "./copy/previews/promotional-campaigns";
import { PREVIEW_SHARED } from "./copy/previews/shared";
import * as shared from "./copy/shared";
import { LANDING_PAGES } from "./pages";

/** A percentage ("34%") or a multiplier ("6×", "6X"): what only a sourced figure may print. */
const FIGURE = /\d+(?:\.\d+)?\s*%|\b\d+\s*[x×X](?![\p{L}\p{N}])/u;

/** The plan labels a broadcast may sit under. */
const BROADCAST_PLANS = ["Growth and Pro", "Pro"];

/** The two lines that carry their plan on the same line in the page, printed with the label by their component. */
const PLAN_LINES = ["FEATURES.messages.broadcast", "OUTCOMES.slowDays.noFees"];

/**
 * Mentions that carry no plan label because broadcasts are about to open to every plan: the Platform
 * page lists them without a badge, and so do geolocation's "Today" column and the link to the broadcasts
 * preview that the other previews end on.
 */
const UNBADGED = [
  "PLATFORM.platform.dashboard.facts[2].text",
  "GEOLOCATION_PREVIEW.status.today.facts[2].text",
  "PREVIEW_SHARED.related.cards.promotionalCampaigns.title",
];

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
    ["a count of days: the trial is the {trialDays} token", DIGIT_DAYS],
    ['tiers: the product\'s word is "levels"', /\btiers?\b/i],
  ])("no line says %s", (_what, pattern) => {
    expect(offenders(pattern)).toEqual([]);
  });

  /**
   * The mentions of levels that print no chip, and why. Everything else about levels sits under an "Every plan"
   * chip: the Features tab, and the Outcomes section.
   */
  const LEVELS_WITHOUT_CHIP: Record<string, string> = {
    "FEATURES.programTypes.title": "the headline over the three tabs; the Levels tab under it carries the chip",
    "FEATURES.scanner.facts[2].text": "a scanner fact about perks at the register",
    "PLATFORM.heroCards.stackAlt": "the hero cards' alt text",
    "PLATFORM.programTypes.title": "Platform's program rows carry no chips",
    "SHARED.levelCardsAlt": "the level cards' alt text",
    "MOBILE_SCANNER_PREVIEW.counter.options[3].title": "the counter's Level button, named for the program type; the previews print no Every plan chip",
    "PUSH_NOTIFICATIONS_PREVIEW.day.lead": "the walk from a first stamp to the next level; the previews print no Every plan chip",
    "PUSH_NOTIFICATIONS_PREVIEW.day.nodes[3].label": "the step where the card moves up a level; the previews print no Every plan chip",
  };

  const levelMentions = () =>
    Object.entries(MODULES)
      .flatMap(([name, value]) => mentions(value, /\blevels?\b/i, name))
      .filter(({ path }) => !path.endsWith(".key"));

  test('levels are shown as live: every mention carries the "Every plan" chip, but the few that say why they do not', () => {
    const chipped = levelMentions().filter(({ plan }) => plan !== undefined);

    expect(chipped.length).toBeGreaterThanOrEqual(7);
    expect(chipped.filter(({ plan }) => plan !== "Every plan")).toEqual([]);
    expect(levelMentions().filter(({ plan }) => plan === undefined).map(({ path }) => path)).toEqual(
      Object.keys(LEVELS_WITHOUT_CHIP),
    );
  });

  test("the levels mention guard flags one with no chip and one with another plan", () => {
    const copy = {
      shown: { title: "Levels", plan: "Every plan" },
      loose: { title: "Give regulars a level" },
      gated: { title: "Levels", plan: "Pro" },
    };

    expect(mentions(copy, /\blevels?\b/i, "COPY")).toEqual([
      { path: "COPY.shown.title", plan: "Every plan" },
      { path: "COPY.loose.title", plan: undefined },
      { path: "COPY.gated.title", plan: "Pro" },
    ]);
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
      "PROMOTIONAL_CAMPAIGNS_PREVIEW.numbers.figures[0]",
      "PROMOTIONAL_CAMPAIGNS_PREVIEW.numbers.figures[1]",
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

describe("percentages a component draws (AC12)", () => {
  /**
   * The components that print a percentage with no source line: drawn sample dashboards, not claims. Each reads
   * Platform's `ANALYTICS`, so a preview's sample café shows the numbers Platform's does.
   */
  const DRAWN_SAMPLE_DASHBOARDS = [
    "components/landing-pages/platform/DeliverAnalytics.tsx",
    "components/landing-pages/feature-previews/analytics/GlanceTiles.tsx",
    "lib/landing-pages/previews/analytics-sample.ts",
  ];

  test.each(DRAWN_SAMPLE_DASHBOARDS)("%s is a drawn sample dashboard: its percentages are ANALYTICS', never typed in", (file) => {
    const source = code(join(ROOT, file));

    expect(source).toMatch(/\bANALYTICS\b/);
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

  test("no chip says Every plan, and nothing is captioned Sample data", () => {
    const chips = previewModules().flatMap(([name, value]) => objectsWith(value, ["plan"], name));

    expect(chips.filter(({ object }) => object.plan === "Every plan").map(({ path }) => path)).toEqual([]);
    expect(previewLines().filter((line) => /sample data/i.test(line.value)).map((line) => line.path)).toEqual([]);
  });

  test("only the broadcasts preview states a plan for the whole page: Growth and Pro", () => {
    const pageWide = previewModules()
      .filter(([, value]) => typeof value === "object" && value !== null && "plan" in value)
      .map(([name, value]) => [name, (value as { plan: string }).plan]);

    expect(pageWide).toEqual([["PROMOTIONAL_CAMPAIGNS_PREVIEW", "Growth and Pro"]]);
  });

  test("a broadcast is named without a label in two places only: geolocation's Today column and the link to the broadcasts preview", () => {
    const loose = previewModules()
      .flatMap(([name, value]) => mentions(value, /broadcast|texting fees/i, name))
      .filter(({ plan }) => !BROADCAST_PLANS.includes(plan ?? ""))
      .map(({ path }) => path);

    expect(loose).toEqual(["GEOLOCATION_PREVIEW.status.today.facts[2].text", "PREVIEW_SHARED.related.cards.promotionalCampaigns.title"]);
  });

  describe("the broadcasts preview's figures are Stampeo's own, each with its source", () => {
    const { figures, sourceLine } = PROMOTIONAL_CAMPAIGNS_PREVIEW.numbers;

    test("88% and 95% carry their source line", () => {
      expect(figures.slice(0, 2).map((figure) => figure.value)).toEqual(["88%", "95%"]);
      for (const figure of figures.slice(0, 2)) {
        expect((figure as { source?: string }).source).toBe("Stampeo data, 86 businesses, February to October 2026");
      }
      expect(sourceLine).toBe("Stampeo data, 86 businesses, February to October 2026");
    });

    test("every figure under the source line is measured: the row holds only 88% and 95%", () => {
      expect(figures.map((figure) => figure.value)).toEqual(["88%", "95%"]);
    });

    test("the 95% line says three months, not a count of days", () => {
      expect(figures[1].text).toMatch(/three months/);
      const campaigns = previewLines().filter((line) => line.path.startsWith("PROMOTIONAL_CAMPAIGNS_PREVIEW"));

      expect(campaigns.filter((line) => /\b90\b/.test(line.value)).map((line) => line.path)).toEqual([]);
    });
  });

  describe("every number is the product's, not typed from memory", () => {
    test("98 stamp icons, the library's own count", () => {
      expect(CARD_DESIGN_PREVIEW.icons.figure.value).toBe(String(stampIcons.length));
    });

    test("analytics history is each plan's own: 30 days, 90 days and 1 year, with monthly cohorts on Pro alone", () => {
      const { plans } = ANALYTICS_PREVIEW.ladder;

      expect(plans.map((plan) => `${plan.history.value} ${plan.history.unit}`)).toEqual(
        (["starter", "growth", "pro"] as const).map((tier) => analyticsHistoryLabel(PLAN_FACTS[tier].analyticsHistoryDays)),
      );
      expect(plans.map((plan) => plan.history.value)).toEqual(["30", "90", "1"]);
      expect([PLAN_FACTS.starter.analytics, PLAN_FACTS.growth.analytics, PLAN_FACTS.pro.analytics]).toEqual(["basic", "basic", "advanced"]);
    });

    test("the plans table gives Growth its monthly number and Pro no limit and scheduling, as PLAN_FACTS has them", () => {
      const [growth, pro] = PROMOTIONAL_CAMPAIGNS_PREVIEW.plans.cells;

      expect(growth.body).toContain(`${PLAN_FACTS.growth.broadcastsPerMonth} broadcasts a month`);
      expect(PLAN_FACTS.pro.broadcastsPerMonth).toBe("unlimited");
      expect(PLAN_FACTS.pro.scheduledBroadcasts).toBe(true);
      expect(PLAN_FACTS.growth.scheduledBroadcasts).toBe(false);
      expect(pro.body).toMatch(/^Unlimited, scheduled/);
      expect(PROMOTIONAL_CAMPAIGNS_PREVIEW.faq.items[0].answer).toContain(`${PLAN_FACTS.growth.broadcastsPerMonth} broadcasts a month`);
    });
  });

  test("the FAQs are the five questions: card design's and the broadcasts page's", () => {
    expect(CARD_DESIGN_PREVIEW.faq.items).toHaveLength(5);
    expect(PROMOTIONAL_CAMPAIGNS_PREVIEW.faq.items).toHaveLength(5);
  });

  test("each sibling link says what its feature is in the words its own preview's headline uses", () => {
    const { cards } = PREVIEW_SHARED.related;
    const HEROES = {
      cardDesign: "platform/card-design",
      mobileScanner: "platform/mobile-scanner",
      pushNotifications: "platform/push-notifications",
      analytics: "platform/analytics",
      promotionalCampaigns: "platform/promotional-campaigns",
      geolocation: "platform/geolocation",
    } as const;

    expect(Object.keys(cards).sort()).toEqual(Object.keys(HEROES).sort());
    for (const [key, slug] of Object.entries(HEROES)) {
      expect({ key, line: cards[key as keyof typeof cards].line }).toEqual({ key, line: LANDING_PAGES[slug].hero.h1 });
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
    [/^hero\.eyebrow$/, "a label: the feature's name"],
    [/^hero\.accent$/, "words of the headline, which is future"],
    [/^band\.accent$/, "words of the closing line, an instruction"],
    [/^banner\./, "the sample café's own notification: the owner's words, not a claim about the product"],
    [/^status\.(?:eyebrow|title)$/, "the section's label and title, which name the two columns"],
    [/^status\.today\./, "the Today column: what is live is said as live"],
    [/^status\.soon\.(?:plan|facts)/, "the Pro chip and noun phrases listed under the Coming soon heading"],
    [/^how\.cells\[0\]\.body$/, "a noun phrase naming where the owner adds the address"],
    [/^privacy\.eyebrow$/, "a label"],
    [/^faq\.title$/, "a label"],
    [/^faq\.items\[\d\]\.question$/, "a question asks, it does not claim"],
    [/^band\.title$/, "an instruction to the visitor"],
    [/^related\.title$/, "an instruction to the visitor"],
  ];
  /** The step names, each exempt only while it reads as it does here: verbless, an instruction, or what the customer does. */
  const STEP_NAMES: Record<string, string> = {
    "how.cells[0].title": "Add your shop",
    "how.cells[1].title": "On their card",
    "how.cells[2].title": "They walk by",
  };
  const relative = (line: { path: string }) => line.path.replace("GEOLOCATION_PREVIEW.", "");
  const exempt = (line: { path: string; value: string }) =>
    NOT_FUTURE.some(([pattern]) => pattern.test(relative(line))) || STEP_NAMES[relative(line)] === line.value;

  test("every line of the page speaks of what will be, but the labels, questions and live facts the list above gives a reason for", () => {
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

  test("the page's headline says soon, and its chip says coming soon on Pro", () => {
    expect(GEOLOCATION_PREVIEW.hero.h1).toMatch(/^Soon,/);
    expect(GEOLOCATION_PREVIEW.heroChip).toBe("Coming soon · Pro");
    expect(PLAN_FACTS.pro.geofencing).toBe("coming_soon");
    expect(PLAN_FACTS.growth.geofencing).toBe(false);
  });

  test("what is live today is the only place a wallet is named", () => {
    const wallets = lines().filter((line) => /Apple|Google/.test(line.value));

    expect(wallets.map((line) => line.path)).toEqual(["GEOLOCATION_PREVIEW.status.today.facts[0].text"]);
  });

  test("the lock screen it shows is Aurevo's, and what it says is the owner's own line", () => {
    expect(GEOLOCATION_PREVIEW.banner.sender).toBe("Aurevo");
    expect(GEOLOCATION_PREVIEW.banner.title).toMatch(/^Aurevo /);
  });

  test("it asks for no sign-up for the feature itself: no notify-me, no waitlist", () => {
    expect(lines().filter((line) => /notify me|waitlist|join the list|get notified/i.test(line.value))).toEqual([]);
  });
});

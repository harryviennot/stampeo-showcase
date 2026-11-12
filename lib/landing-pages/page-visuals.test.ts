/**
 * What each landing page shows beside its words: the notifications on every
 * page, the Features page's hero, lock screen, gallery and capture, and the
 * Outcomes page's figure, spotlights and example. Read from the source, since
 * there is no component runner.
 */

import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { STAMP_SAMPLES } from "../loyalty-samples";
import { code, filesWith, findTag, openingTags, read, sourceFiles } from "../testing/jsx-source";
import {
  COMPONENTS_DIR,
  landingTree,
  pageFile,
  planLineWith,
  sectionSource,
  shared,
} from "../testing/landing-pages-source";
import { FEATURES } from "./copy/features";
import { STAMP_BANNER } from "./copy/shared";
import { LANDING_PAGES, LANDING_SLUGS } from "./pages";

describe("every notification on a page is still and the sample café's", () => {
  test.each(LANDING_SLUGS)("%s", (slug) => {
    const notifications = [...landingTree(pageFile(slug))].flatMap((file) =>
      openingTags(read(file))
        .filter((tag) => tag.name === "NotificationPhoneDemo" || tag.name === "NotificationBanner")
        .map((tag) => ({ file, tag })),
    );
    const unlike = ({ tag }: (typeof notifications)[number]) =>
      !/\blpBanner\b/.test(tag.attrs) || (tag.name === "NotificationPhoneDemo" && !tag.attrs.includes("animate={false}"));

    expect(notifications.length).toBeGreaterThan(0);
    expect(notifications.filter(unlike).map(({ file }) => file)).toEqual([]);
  });
});

describe("the stamp notification and the card beside it count the same stamps", () => {
  const [, stamp, total] = STAMP_BANNER.body.match(/(\d+) of (\d+) stamps/) ?? [];
  const aurevo = STAMP_SAMPLES.find((sample) => sample.id === "aurevo");

  // The Features hero draws that sample as it is, through HeroCardStack.
  test("the banner's count is the Aurevo sample's stamps and total", () => {
    expect([Number(stamp), Number(total)]).toEqual([aurevo?.stamps, aurevo?.design.total_stamps]);
  });

  test("How-to's step 3 draws the card at that count under the banner", () => {
    const steps = code(join(COMPONENTS_DIR, "how-it-works", "HowSteps.tsx"));
    const step = steps.slice(steps.indexOf("function StampedVisual"));

    expect(findTag(step, "AurevoCard")?.attrs).toContain(`stamps={${stamp}}`);
  });
});

describe("the Features page (AC5, AC9, AC10)", () => {
  const features = () => [...landingTree(pageFile("features"))];

  test("the hero shows the card stack with one banner from the sample café on it", () => {
    const visual = join(COMPONENTS_DIR, "features", "FeaturesHeroVisual.tsx");

    expect(findTag(read(pageFile("features")), "LpHero")?.attrs).toContain("visual={<FeaturesHeroVisual");
    expect(features()).toContain(visual);
    expect(openingTags(read(visual)).filter((tag) => tag.name === "HeroCardStack")).toHaveLength(1);
    expect(openingTags(read(visual)).filter((tag) => tag.name === "NotificationBanner")).toHaveLength(1);
  });

  test("the lock screen stacks the two banners of the copy, and is cropped on a phone", () => {
    const source = sectionSource("features", "spotlight_messages");

    expect(FEATURES.messages.banners).toHaveLength(2);
    expect(findTag(source, "NotificationPhoneDemo")?.attrs).toMatch(/\bnotifications=/);
    expect(findTag(source, "LpSpotlight")?.attrs).toMatch(/\bcropOnPhone\b/);
  });

  test("the card gallery speaks with the page's heading and without its own CTA", () => {
    const gallery = filesWith(features(), /<CardStyleGallery\b/).map((file) => findTag(read(file), "CardStyleGallery"));

    expect(gallery).toHaveLength(1);
    expect(gallery[0]?.attrs).toContain("showCta={false}");
    expect(gallery[0]?.attrs).toContain("heading={");
  });
});

describe("the Outcomes page: results, not how", () => {
  const OUTCOMES_DIR = join(COMPONENTS_DIR, "outcomes");
  const component = (name: string) => code(join(OUTCOMES_DIR, `${name}.tsx`));
  const ownFiles = () => [pageFile("outcomes"), ...sourceFiles(OUTCOMES_DIR)];
  const section = (id: string) => sectionSource("outcomes", id);
  /** Nothing between the two expressions opens or closes a block: they print on one line. */
  const shareALine = (source: string, first: string, second: string) => {
    const [a, b] = [source.indexOf(first), source.indexOf(second)];
    if (a === -1 || b === -1) return false;
    return !/<\/?(?:p|div|li|ul|ol|section|h[1-6]|br)\b/.test(source.slice(Math.min(a, b), Math.max(a, b)));
  };

  test("the hero is the lock screen with the stamp notification from the first paint", () => {
    const phone = findTag(component("OutcomesHeroVisual"), "NotificationPhoneDemo");

    expect(phone?.attrs).toContain("animate={false}");
    expect(phone?.attrs).toMatch(/\bSTAMP_BANNER\b/);
  });

  test('the H1 keeps its no-break hyphen, so "first-time" never splits across two lines', () => {
    const { h1 } = LANDING_PAGES.outcomes.hero;

    expect(h1).toContain("first‑time");
    expect(h1).not.toContain("first-time");
  });

  test("the problem is one figure in the page's handwriting, with its claim and its source, on the one tinted band", () => {
    const figure = component("RegularsFigure");
    const tags = openingTags(figure);

    expect(tags.some((tag) => /\bink-figure\b/.test(tag.attrs))).toBe(true);
    for (const part of ["OUTCOMES.problem", "figure.value", "figure.text", "figure.source"]) expect(figure).toContain(part);
    expect(tags.find((tag) => tag.name === "LpSection")?.attrs).toMatch(/\btinted\b/);
    const bands = ownFiles().flatMap((file) =>
      openingTags(read(file)).filter((tag) => /\btinted\b(?!=)/.test(tag.attrs)),
    );
    expect(bands).toHaveLength(1);
  });

  // AC12: a figure from someone else is never printed without where it comes from.
  test.each([
    ["RegularsFigure", "figure.source"],
    ["ReturnSpotlight", "headStart.source"],
  ])("%s renders %s", (name, accessor) => {
    expect(component(name)).toContain(accessor);
  });

  test("the return spotlight shows the part-filled Aurevo card under the lead, then the head start", () => {
    const source = section("outcome_return");

    expect(source).toContain("OUTCOMES.comeBack");
    expect(findTag(source, "AurevoCard")?.attrs).toMatch(/stamps=\{[1-7]\}/);
    expect(source).toContain("headStart.text");
  });

  test("the slow-days lead is followed at once by the plans a broadcast comes with", () => {
    const source = section("outcome_slow_days");
    const spotlight = findTag(source, "LpSpotlight");

    expect(spotlight?.attrs).toContain("lead={slowDays.lead}");
    expect(source.slice(spotlight?.end).trimStart().slice(0, "<PlanLine>".length)).toBe("<PlanLine>");
    expect(code(shared("LpSpotlight"))).toMatch(/<LpHeading\b[^>]*\/>\s*\{children\}/);
  });

  test("the slow-days phone shows the café's broadcast, cropped on a phone", () => {
    const source = section("outcome_slow_days");

    expect(findTag(source, "NotificationPhoneDemo")?.attrs).toContain("slowDays.banner");
    expect(findTag(source, "LpSpotlight")?.attrs).toMatch(/\bcropOnPhone\b/);
  });

  test("the regulars spotlight shows the shared sample capture, then the example on one line", () => {
    const source = section("outcome_regulars");

    expect(findTag(source, "SampleCapture")).toBeDefined();
    expect(shareALine(source, "example.label", "example.text")).toBe(true);
  });
});

describe("a broadcast prints with the plans it comes with (AC10)", () => {
  // The only places the copy mentions a broadcast (copy.test.ts holds that list); each is the plan line itself.
  test.each([
    ["features", "spotlight_messages", "messages.broadcast"],
    ["outcomes", "outcome_slow_days", "slowDays.noFees"],
  ] as const)("%s: %s prints %s inside the PlanLine", (slug, id, needle) => {
    expect([...landingTree(pageFile(slug))].filter((file) => code(file).includes(needle))).toHaveLength(1);
    expect(planLineWith(sectionSource(slug, id), needle)).not.toBe("");
  });
});

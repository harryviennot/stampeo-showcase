/**
 * The Outcomes page (`/us/landing-pages/outcomes`): what its own sections do
 * beyond the registry's order. The head-start toggle is rendered in both of
 * its states; async server components are read from the source (the same
 * split as the other landing-page tests).
 */

import { describe, expect, test } from "bun:test";
import { HeadStartToggle } from "@/components/landing-pages/outcomes/HeadStartToggle";
import { RegularsFigure } from "@/components/landing-pages/outcomes/RegularsFigure";
import { SegmentChips } from "@/components/landing-pages/outcomes/SegmentChips";
import { AUREVO } from "@/components/landing-pages/shared/samples";
import { code, findTag, literalAttr, openingTags, read } from "../testing/jsx-source";
import { pageComponent, planLineWith } from "../testing/landing-pages-source";
import { renderEn, textOf } from "../testing/render-en";
import { mockEnglishServerTranslations } from "../testing/server-intl";
import { OUTCOMES } from "./copy/outcomes";
import { SHARED } from "./copy/shared";

// The cards are async server components that ask next-intl for their words.
await mockEnglishServerTranslations();
const { AurevoCard } = await import("@/components/landing-pages/shared/AurevoCard");

const outcomes = (name: string) => pageComponent("outcomes", name);

/** The opening tag in `html` that carries `attr`: the toggle marks what it drives with data attributes. */
const tagWith = (html: string, attr: string) => html.match(new RegExp(`<[^<>]*${attr}[^<>]*>`))?.[0] ?? "";

describe("the head-start toggle drives the card and the highlighted bar (AC12)", () => {
  const render = (initial: "empty" | "headStart") =>
    renderEn(
      <HeadStartToggle
        heading={<h2>Heading</h2>}
        emptyCard={<i>empty card</i>}
        headStartCard={<i>head start card</i>}
        initial={initial}
      />,
    );
  const { empty, withHeadStart, toggle } = OUTCOMES.headStart;

  test.each([
    ["headStart", "headStart", "empty"],
    ["empty", "empty", "headStart"],
  ] as const)("with the %s tab chosen, its card shows and its bar is the lit one", (initial, on, off) => {
    const html = render(initial);

    expect(tagWith(html, `data-card="${on}"`)).not.toContain("inert");
    expect(tagWith(html, `data-card="${off}"`)).toContain("inert");
    expect(tagWith(html, `data-bar="${on}"`)).toContain('data-active="true"');
    expect(tagWith(html, `data-bar="${off}"`)).toContain('data-active="false"');
    expect(html.match(/aria-selected="true"[^>]*>([^<]*)</)?.[1]).toBe(toggle[on]);
  });

  test("offers the two tabs the copy names, the empty card first", () => {
    const labels = [...render("headStart").matchAll(/role="tab"[^>]*>([^<]*)</g)].map((match) => match[1]);

    expect(labels).toEqual([toggle.empty, toggle.headStart]);
  });

  test("draws each bar from its sourced figure's own value, whichever tab is chosen", () => {
    for (const initial of ["empty", "headStart"] as const) {
      const html = render(initial);

      for (const bar of ["empty", "headStart"]) {
        const tag = tagWith(html, `data-bar="${bar}"`);

        expect(tag).not.toBe("");
        expect(tag).not.toMatch(/\b(?:inert|hidden)\b/);
      }
      expect(html).toContain(`--bar:${empty.value}`);
      expect(html).toContain(`--bar:${withHeadStart.value}`);
      expect(html).toContain(`>${empty.value}<`);
      expect(html).toContain(`>${withHeadStart.value}<`);
      expect(html.split(OUTCOMES.headStart.barLabel).length - 1).toBe(2);
    }
  });

  test("names each bar by what the figure says, and prints the study under the bars", () => {
    const html = render("headStart");

    expect(html).toContain(empty.text);
    expect(html).toContain(withHeadStart.text);
    expect(empty.source).toBe(withHeadStart.source);
    expect(html).toContain(empty.source.replace("&", "&amp;"));
  });

  test("renders its heading, then the toggle, then the cards, then the bars (the phone's reading order)", () => {
    const html = render("headStart");
    const at = (needle: string) => html.indexOf(needle);

    expect(at("<h2>Heading</h2>")).toBeLessThan(at('role="tablist"'));
    expect(at('role="tablist"')).toBeLessThan(at('data-card="empty"'));
    expect(at('data-card="headStart"')).toBeLessThan(at('data-bar="empty"'));
  });
});

describe("the head-start section", () => {
  const section = () => code(outcomes("HeadStartSpotlight"));

  /** The stamps a visitor still has to collect on each card of the toggle, read from the props the section gives it. */
  const cards = () =>
    openingTags(section())
      .filter((tag) => tag.name === "AurevoCard")
      .map((tag) => {
        const stamps = Number(tag.attrs.match(/\bstamps=\{(\d+)\}/)?.[1]);
        const total = Number(tag.attrs.match(/\btotal=\{(\d+)\}/)?.[1] ?? AUREVO.design.total_stamps);
        return { stamps, total, toGo: total - stamps };
      });

  test("is the page's head-start section, with the cards from the Aurevo sample", () => {
    const tags = openingTags(section());

    expect(tags.some((tag) => literalAttr(tag.attrs, "section") === "outcome_head_start")).toBe(true);
    expect(cards()).toHaveLength(2);
  });

  // The study's cards: a plain 8-slot card, against a 10-slot one that came with 2 stamps. Both needed 8 more.
  test("the empty card is 0 of 8 and the head-start one is 2 of 10, so both need the same 8 stamps to finish", () => {
    const [empty, headStart] = cards();

    expect([empty.stamps, empty.total]).toEqual([0, 8]);
    expect([headStart.stamps, headStart.total]).toEqual([2, 10]);
    expect(headStart.toGo).toBe(empty.toGo);
  });

  // The card's reward field names the stamp that earns it, so a 10-slot card cannot say "8th free".
  test.each([
    ["Card starts empty", 0, "8th free"],
    ["2 stamps on the house", 1, "10th free"],
  ])("the %s card, drawn with the props the section gives it, shows its own count and its own reward", async (_tab, at, reward) => {
    const { stamps, total } = cards()[at];
    const text = textOf(renderEn(await AurevoCard({ stamps, total, width: 300 })));

    expect(text).toContain(`${stamps} / ${total}`);
    expect(text).toContain(reward);
    expect(text.match(/\d+(?:st|nd|rd|th) free/g)).toEqual([reward]);
  });
});

describe("motion honours prefers-reduced-motion", () => {
  test.each(["AlwaysThereVisual", "HeadStartBars"])("%s starts its animation on reveal and has a still version", (name) => {
    const source = code(outcomes(name));

    expect(source).toContain("in-[.revealed]:");
    expect(source).toContain("motion-reduce:");
    expect(source).toContain("motion-reduce:transition-none");
  });

  test("the banner that slides in is the default stamp notification, sent by the café", () => {
    const source = code(outcomes("AlwaysThereVisual"));

    expect(source).toContain("lpBanner(OUTCOMES.always.banner)");
    expect(findTag(source, "WalletPhone")).toBeDefined();
  });
});

describe("the quiet-hours section", () => {
  const section = () => code(outcomes("QuietHoursSpotlight"));
  const visual = () => code(outcomes("QuietHoursVisual"));

  test("prints the broadcast line in the paragraph that carries its Growth and Pro label", () => {
    const line = planLineWith(section(), "OUTCOMES.slowDays.noFees");

    expect(line).toContain("<PlanLine");
    expect(line).toContain("OUTCOMES.slowDays.noFees");
    expect(OUTCOMES.slowDays.noFees).toMatch(/broadcast/i);
    expect(SHARED.broadcastPlans).toBe("Growth and Pro");
  });

  test("shows the busiest-times capture, then the broadcast that fills the quiet hour, joined by an arrow", () => {
    const source = visual();
    const capture = findTag(source, "SampleCapture");

    expect(literalAttr(capture?.attrs ?? "", "view")).toBe("phone-busiest");
    expect(capture?.attrs).toContain("OUTCOMES.slowDays.alt");
    expect(source).toContain("lpBanner(OUTCOMES.slowDays.banner)");
    expect(findTag(source, "NotificationPhoneDemo")?.attrs).toMatch(/\bnotifications=/);
    expect(findTag(source, "InkArrow")).toBeDefined();
    expect(source.indexOf("<SampleCapture")).toBeLessThan(source.indexOf("<InkArrow"));
    expect(source.indexOf("<InkArrow")).toBeLessThan(source.indexOf("<NotificationPhoneDemo"));
  });
});

describe("the levels section", () => {
  const section = () => code(outcomes("LevelsSpotlight"));

  test("fans the level cards under the level-up banner, beside three facts and the plan chip", () => {
    const source = section();

    expect(findTag(source, "LevelCards")?.attrs).toMatch(/\bbanner\b/);
    expect(findTag(source, "FactList")?.attrs).toContain("OUTCOMES.levels.facts");
    expect(OUTCOMES.levels.facts).toHaveLength(3);
    expect(findTag(source, "PlanChip")?.attrs).toContain("OUTCOMES.levels.plan");
  });
});

describe("the regulars section", () => {
  test("lists the five customer segments in the dashboard's order, under the plan chip", () => {
    const html = renderEn(<SegmentChips />);
    const chips = [...html.matchAll(/data-segment[^>]*>([^<]*)</g)].map((match) => match[1]);

    expect(chips).toEqual(["New", "Regular", "VIP", "At risk", "Ghost"]);
    expect(chips).toEqual([...OUTCOMES.regulars.segments]);
    expect(textOf(html)).toContain(OUTCOMES.regulars.plan);
  });

  test("shows the Analytics capture and the labelled example", () => {
    const source = code(outcomes("RegularsSpotlight"));

    expect(findTag(source, "SampleCapture")?.attrs).toContain("OUTCOMES.regulars.alt");
    expect(findTag(source, "SegmentChips")).toBeDefined();
    expect(source).toContain("example.label");
    expect(source).toContain("example.text");
  });
});

describe("the problem figure", () => {
  test("prints the 6x claim with the study it comes from", () => {
    const html = renderEn(<RegularsFigure />);
    const { figure } = OUTCOMES.problem;

    expect(html).toContain(figure.value);
    expect(html).toContain(figure.text);
    expect(html).toContain(figure.source);
    expect(html).toContain('data-landing-section="problem"');
  });
});

describe("the page's trial buttons", () => {
  test("repeat the offer twice, between the hero and the closing ask", () => {
    const owners = ["HeadStartSpotlight", "RegularsSpotlight"];
    const mine = owners.flatMap((name) => openingTags(read(outcomes(name))).filter((tag) => tag.name === "LpTrialButton"));

    expect(mine).toHaveLength(2);
  });
});

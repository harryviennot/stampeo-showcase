/**
 * What a visitor can do on the analytics preview, as the pure rules behind it: flipping the six blind-spot
 * cards (all at once from the control, or one at a time by tapping), the one automatic flip that shows a
 * scroller the answers, and which plan shows what on the ladder. What each section renders is in
 * `analytics.test.tsx`.
 */

import { describe, expect, test } from "bun:test";
import {
  AUTO_FLIP,
  allPaper,
  autoFlipDue,
  createAutoFlip,
  faceShown,
  flipCard,
  flipDelayMs,
  flipMotion,
  setAll,
} from "@/lib/landing-pages/previews/analytics-flip";
import { fakeScheduler } from "../../testing/fake-scheduler";
import { ladderView } from "@/lib/landing-pages/previews/analytics-ladder-view";
import { PLAN_FACTS, TIERS, analyticsHistoryLabel } from "@/lib/plans/plan-facts";
import { ANALYTICS_PREVIEW } from "../copy/previews/analytics";

const COUNT = ANALYTICS_PREVIEW.blindSpots.cards.length;

describe("the blind-spot cards: a visitor flips them", () => {
  test("they open on paper: six cards showing ???, and the control says With a paper card", () => {
    const flips = allPaper(COUNT);

    expect(COUNT).toBe(6);
    expect(flips).toEqual([false, false, false, false, false, false]);
    expect(faceShown(flips)).toBe("paper");
  });

  test("choosing With Stampeo turns every card to its answer, and choosing With a paper card turns them back", () => {
    const answered = setAll(COUNT, "stampeo");

    expect(answered.every(Boolean)).toBe(true);
    expect(faceShown(answered)).toBe("stampeo");
    expect(setAll(COUNT, "paper")).toEqual(allPaper(COUNT));
  });

  test("tapping one card turns that card alone, and the control still says paper", () => {
    const flips = flipCard(allPaper(COUNT), 3);

    expect(flips).toEqual([false, false, false, true, false, false]);
    expect(faceShown(flips)).toBe("paper");
  });

  test("tapping a turned card turns it back", () => {
    expect(flipCard(flipCard(allPaper(COUNT), 1), 1)).toEqual(allPaper(COUNT));
  });

  test("tapping all six cards one by one reads, on the control, as With Stampeo", () => {
    const flips = [0, 1, 2, 3, 4, 5].reduce((state, index) => flipCard(state, index), allPaper(COUNT));

    expect(faceShown(flips)).toBe("stampeo");
  });

  test("tapping a card never changes the others, and returns a new list", () => {
    const before = setAll(COUNT, "stampeo");
    const after = flipCard(before, 0);

    expect(after).not.toBe(before);
    expect(before.every(Boolean)).toBe(true);
    expect(after.slice(1).every(Boolean)).toBe(true);
    expect(faceShown(after)).toBe("paper");
  });
});

describe("how the cards move", () => {
  const motion = flipMotion(false);

  test("the control turns the cards in a wave, one after another, and a tap turns its own card at once", () => {
    expect([0, 1, 5].map((index) => flipDelayMs(index, motion, "control"))).toEqual([0, AUTO_FLIP.staggerMs, 5 * AUTO_FLIP.staggerMs]);
    expect([0, 1, 5].map((index) => flipDelayMs(index, motion, "tap"))).toEqual([0, 0, 0]);
  });

  test("a reader who asks for less motion gets an instant swap: no duration, no wave, no automatic flip", () => {
    const calm = flipMotion(true);

    expect(calm).toEqual({ auto: false, durationMs: 0, staggerMs: 0 });
    expect([0, 3, 5].map((index) => flipDelayMs(index, calm, "control"))).toEqual([0, 0, 0]);
  });
});

describe("the automatic flip: a scroller sees the punchline and then the answers, once", () => {
  const ready = { amountVisible: 0.5, touched: false, played: false, reduced: false };

  test.each([
    ["half the section is in view", {}, true],
    ["less than half is in view", { amountVisible: 0.49 }, false],
    ["the visitor already touched a card or the control", { touched: true }, false],
    ["it already ran once", { played: true }, false],
    ["the reader asks for less motion", { reduced: true }, false],
  ])("%s", (_what, change, due) => {
    expect(autoFlipDue({ ...ready, ...change })).toBe(due);
  });

  describe("the wait, as a scroller lives it", () => {
    const setup = (reduced = false) => {
      const scheduler = fakeScheduler();
      let flips = 0;
      const auto = createAutoFlip({ scheduler, onFlip: () => flips++ });

      return { scheduler, auto, reduced, flips: () => flips };
    };

    test("half the section in view for the wait turns every card once, then never again", () => {
      const { scheduler, auto, flips } = setup();

      auto.report(0.6, false);
      scheduler.advance(AUTO_FLIP.waitMs - 1);
      expect(flips()).toBe(0);
      scheduler.advance(1);
      expect(flips()).toBe(1);
      auto.report(0.9, false);
      scheduler.advance(AUTO_FLIP.waitMs * 3);
      expect(flips()).toBe(1);
    });

    test("scrolling on before the wait is over cancels it, and coming back starts a fresh wait", () => {
      const { scheduler, auto, flips } = setup();

      auto.report(0.6, false);
      scheduler.advance(1000);
      auto.report(0.3, false);
      scheduler.advance(5000);
      expect(flips()).toBe(0);
      auto.report(0.7, false);
      scheduler.advance(AUTO_FLIP.waitMs);
      expect(flips()).toBe(1);
    });

    test("more reports while it waits do not push the wait back", () => {
      const { scheduler, auto, flips } = setup();

      auto.report(0.6, false);
      scheduler.advance(1000);
      auto.report(0.8, false);
      scheduler.advance(AUTO_FLIP.waitMs - 1000);
      expect(flips()).toBe(1);
    });

    test.each(["a tap on a card", "the control"])("%s during the wait means the scroller has taken over: nothing turns by itself", () => {
      const { scheduler, auto, flips } = setup();

      auto.report(0.6, false);
      scheduler.advance(500);
      auto.touch();
      scheduler.advance(AUTO_FLIP.waitMs * 2);
      expect(flips()).toBe(0);
    });

    test("a reader who asks for less motion is never turned anything", () => {
      const { scheduler, auto, flips } = setup();

      auto.report(0.9, true);
      scheduler.advance(AUTO_FLIP.waitMs * 2);
      expect(flips()).toBe(0);
    });

    test("leaving the page cancels the wait", () => {
      const { scheduler, auto, flips } = setup();

      auto.report(0.9, false);
      auto.stop();
      scheduler.advance(AUTO_FLIP.waitMs * 2);
      expect(flips()).toBe(0);
      expect(scheduler.pending).toBe(0);
    });
  });
});

describe("the plan ladder: which plan shows what", () => {
  test.each([
    ["starter", { layer: "sentence", cohorts: false, location: false }],
    ["growth", { layer: "chart", cohorts: false, location: false }],
    ["pro", { layer: "chart", cohorts: true, location: true }],
  ] as const)("%s", (tier, view) => {
    expect(ladderView(tier)).toEqual(view);
  });

  test.each(TIERS)("%s: the view is what PLAN_FACTS says the plan has", (tier) => {
    const facts = PLAN_FACTS[tier];

    expect(ladderView(tier)).toEqual({
      layer: facts.analyticsCharts ? "chart" : "sentence",
      cohorts: facts.analytics === "advanced",
      location: facts.locationAnalytics,
    });
  });

  test("the plan tabs run Starter, Growth, Pro, each with the history of its own plan", () => {
    const { plans } = ANALYTICS_PREVIEW.ladder;

    expect(plans.map((plan) => plan.label)).toEqual(["Starter", "Growth", "Pro"]);
    plans.forEach((plan, index) => {
      const [value, unit] = analyticsHistoryLabel(PLAN_FACTS[TIERS[index]].analyticsHistoryDays).split(" ");

      expect(plan.history).toEqual({ value, unit });
    });
    expect(plans.map((plan) => `${plan.history.value} ${plan.history.unit}`)).toEqual(["30 days", "90 days", "1 year"]);
  });
});

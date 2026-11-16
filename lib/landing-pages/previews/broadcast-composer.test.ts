/**
 * The broadcast composer on the campaigns preview: when the banner drops onto the phone and what the delivery
 * line counts, for a visitor who taps "Send now", one who scrolls past it, and one who asks for less motion.
 * The section itself is rendered in `previews/promotional-campaigns.test.tsx`.
 */

import { describe, expect, test } from "bun:test";
import { COUNT_MS, countedAt, deliveryOf, firstStage, shouldAutoPlay } from "./broadcast-composer";
import { PROMOTIONAL_CAMPAIGNS_PREVIEW as COPY } from "../copy/previews/promotional-campaigns";

describe("the sample broadcast's delivery", () => {
  test("reached 680 of 716 cards: Apple's 412 and Google's 268, out of everyone it was sent to", () => {
    expect(deliveryOf(COPY.delivery.metrics)).toEqual({ delivered: 680, total: 716 });
  });

  test("counts only what a wallet accepted: throttled and uninstalled cards are in the total, not the delivered", () => {
    const metrics = [
      { label: "Apple delivered", value: "10" },
      { label: "Google delivered", value: "5" },
      { label: "Google throttled", value: "3" },
      { label: "Wallet uninstalled", value: "2" },
    ];

    expect(deliveryOf(metrics)).toEqual({ delivered: 15, total: 20 });
  });
});

describe("the count under the card", () => {
  test("starts at 0, ends on the target after 900ms, and never goes past it or backwards", () => {
    expect(COUNT_MS).toBe(900);
    expect(countedAt(0, 680)).toBe(0);
    expect(countedAt(COUNT_MS, 680)).toBe(680);
    expect(countedAt(5000, 680)).toBe(680);
    expect(countedAt(-50, 680)).toBe(0);

    const steps = Array.from({ length: 19 }, (_, index) => countedAt(index * 50, 680));
    expect(steps).toEqual([...steps].sort((a, b) => a - b));
  });

  test("moves fast, then settles: it is past half way by a third of the time", () => {
    expect(countedAt(COUNT_MS / 3, 680)).toBeGreaterThan(340);
  });

  test("is always a whole number of cards", () => {
    for (let elapsed = 0; elapsed <= COUNT_MS; elapsed += 37) expect(Number.isInteger(countedAt(elapsed, 680))).toBe(true);
  });
});

describe("the first thing a visitor sees", () => {
  test("a reader who allows motion finds the phone with only its clock, waiting to be sent to", () => {
    expect(firstStage(false)).toBe("idle");
  });

  test("a reader who asks for less motion finds the finished state: the banner already on the phone, the count at its end", () => {
    expect(firstStage(true)).toBe("sent");
  });
});

describe("sending by itself, once, when the phone is on screen", () => {
  const base = { reducedMotion: false, played: false, visibleRatio: 0.5 };

  test("fires when half the phone is in view", () => {
    expect(shouldAutoPlay(base)).toBe(true);
    expect(shouldAutoPlay({ ...base, visibleRatio: 1 })).toBe(true);
  });

  test.each([
    ["less than half of it is in view", { visibleRatio: 0.49 }],
    ["it has already played, by itself or from a tap on Send now", { played: true }],
    ["the reader asks for less motion: nothing moves without a tap", { reducedMotion: true }],
  ])("does not fire when %s", (_why, change) => {
    expect(shouldAutoPlay({ ...base, ...change })).toBe(false);
  });
});

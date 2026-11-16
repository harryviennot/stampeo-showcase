/**
 * The broadcast composer on the campaigns preview: when the banner drops onto the phone and what the delivery
 * line counts, for a visitor who taps "Send now", one who scrolls past it, and one who asks for less motion.
 * The section itself is rendered in `previews/promotional-campaigns.test.tsx`.
 */

import { describe, expect, test } from "bun:test";
import { fakeScheduler } from "../../testing/fake-scheduler";
import { COUNT_MS, REPLAY_GAP_MS, countedAt, createSender, deliveryOf, firstStage, shouldAutoPlay, type ComposerView } from "./broadcast-composer";
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
  test("starts at 0, ends on the target when the count is over, and never goes past it or backwards", () => {
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

describe("Send now, Send again and a double tap", () => {
  const TARGET = 680;
  const setup = (reducedMotion: boolean) => {
    const scheduler = fakeScheduler();
    const views: ComposerView[] = [];
    const sender = createSender({ reducedMotion, target: TARGET, scheduler, onView: (view) => views.push(view) });

    return { scheduler, views, sender, last: () => views[views.length - 1] };
  };

  test("Send now from the waiting phone drops the banner at once and counts up to what was delivered, then rests on it", () => {
    const { scheduler, sender, last } = setup(false);

    sender.send("idle");
    expect(last()).toEqual({ pressed: "sent", count: 0 });
    scheduler.advance(COUNT_MS / 3);
    expect(last().count).toBeGreaterThan(340);
    scheduler.advance(COUNT_MS);
    expect(last()).toEqual({ pressed: "sent", count: null });
    expect(scheduler.pending).toBe(0);
  });

  test("Send again takes the banner off the phone, then drops it again after a short pause and counts once more", () => {
    const { scheduler, sender, last } = setup(false);

    sender.send("idle");
    scheduler.advance(COUNT_MS + 50);
    sender.send("sent");
    expect(last()).toEqual({ pressed: "idle", count: 0 });
    scheduler.advance(REPLAY_GAP_MS - 1);
    expect(last().pressed).toBe("idle");
    scheduler.advance(1);
    expect(last()).toEqual({ pressed: "sent", count: 0 });
    scheduler.advance(COUNT_MS + 50);
    expect(last()).toEqual({ pressed: "sent", count: null });
  });

  test("a second tap in the middle of the count starts it over and ends where one tap would: one banner, the full count, nothing left running", () => {
    const { scheduler, sender, views, last } = setup(false);

    sender.send("idle");
    scheduler.advance(300);
    sender.send("sent");
    expect(last()).toEqual({ pressed: "idle", count: 0 });
    scheduler.advance(REPLAY_GAP_MS + COUNT_MS + 50);
    expect(last()).toEqual({ pressed: "sent", count: null });
    expect(scheduler.pending).toBe(0);
    expect(views.filter((view) => view.count !== null && view.count > TARGET)).toEqual([]);
  });

  test("Send now during the pause of a replay does not wait for it: the banner drops at once, and the pause never fires on top", () => {
    const { scheduler, sender, last } = setup(false);

    sender.send("idle");
    scheduler.advance(COUNT_MS + 50);
    sender.send("sent");
    scheduler.advance(100);
    sender.send("idle");
    expect(last()).toEqual({ pressed: "sent", count: 0 });
    scheduler.advance(COUNT_MS + REPLAY_GAP_MS + 50);
    expect(last()).toEqual({ pressed: "sent", count: null });
    expect(scheduler.pending).toBe(0);
  });

  test("for a reader who asks for less motion the banner is there with the full count at once, and Send again is a blink, never a count", () => {
    const { scheduler, sender, views, last } = setup(true);

    sender.send("idle");
    expect(last()).toEqual({ pressed: "sent", count: null });
    expect(scheduler.pending).toBe(0);
    sender.send("sent");
    expect(last()).toEqual({ pressed: "idle", count: 0 });
    scheduler.advance(REPLAY_GAP_MS);
    expect(last()).toEqual({ pressed: "sent", count: null });
    expect(views.some((view) => view.count !== null && view.count > 0)).toBe(false);
    expect(scheduler.pending).toBe(0);
  });

  test("leaving the page stops a count and a pause in progress, and any tap counts as having played", () => {
    const { scheduler, sender, views } = setup(false);

    expect(sender.played).toBe(false);
    sender.send("idle");
    expect(sender.played).toBe(true);
    scheduler.advance(200);
    sender.stop();
    const seen = views.length;
    scheduler.advance(5000);
    expect(views).toHaveLength(seen);
    expect(scheduler.pending).toBe(0);
  });
});

/**
 * The /start page gives the attribution capture its moment, then sends the
 * visitor on to sign-up. It leaves as soon as THIS visit's landing is recorded
 * (a source cookie left by an earlier visit does not count), or when the
 * ceiling is reached for a visitor whose consent writes nothing.
 */

import { describe, expect, test } from "bun:test";
import { SOURCE_COOKIE } from "../attribution/cookie-names";
import { landingFromUrl } from "../attribution/landing";
import { buildSourceCarrier, serializeSourceCarrier } from "../attribution/source";
import {
  START_FORWARD_CEILING_MS,
  forwardWhenRecorded,
  shouldForwardFromStart,
  type ForwardTimers,
} from "./start-forward";

const EVIDENCE = { cv: 1, cr: "opt-out", ca: 0, p: 1, g: "US" } as const;

/** Epoch seconds at which the /start page loaded. */
const LOADED_AT = 1_760_000_000;

/** The cookie header of a visitor whose landing on `/start` was recorded at `landedAt`. */
function recordedAt(landedAt: number) {
  return `theme=dark; ${SOURCE_COOKIE}=${serializeSourceCarrier(
    buildSourceCarrier({
      landing: landingFromUrl("https://stampeo.app/en/start?utm_source=meta&utm_medium=paid&fbclid=IwAR3x", {
        referrer: "https://l.instagram.com/",
        variant: null,
        landedAt,
      }),
      evidence: EVIDENCE,
    }),
  )}`;
}

/** Written by this visit's landing. */
const RECORDED = recordedAt(LOADED_AT);
/** Left by a visit from the day before: a returning visitor's browser still holds it. */
const FROM_YESTERDAY = recordedAt(LOADED_AT - 86_400);

describe("shouldForwardFromStart", () => {
  test.each([
    ["this visit's landing is recorded", RECORDED, 0, true],
    ["this visit's landing is recorded in the second before the page loaded", recordedAt(LOADED_AT - 1), 0, true],
    ["only an earlier visit's landing is recorded and the ceiling is not reached", FROM_YESTERDAY, START_FORWARD_CEILING_MS - 1, false],
    ["only an earlier visit's landing is recorded and the ceiling is reached", FROM_YESTERDAY, START_FORWARD_CEILING_MS, true],
    ["the landing is not recorded and the ceiling is not reached", "theme=dark", START_FORWARD_CEILING_MS - 1, false],
    ["the landing is not recorded and the ceiling is reached", "theme=dark", START_FORWARD_CEILING_MS, true],
    ["a source cookie is unreadable and the ceiling is not reached", `${SOURCE_COOKIE}=%7Bnot-json`, 300, false],
    ["there is no cookie header at all and the ceiling is not reached", undefined, 0, false],
  ])("when %s", (_label, cookieHeader, elapsedMs, expected) => {
    expect(shouldForwardFromStart({ cookieHeader, elapsedMs, pageLoadedAt: LOADED_AT })).toBe(expected);
  });
});

/** A manual clock: intervals run only when the test advances it. */
function fakeClock() {
  let now = 0;
  const ticking = new Map<number, { every: number; next: number; fn: () => void }>();
  let nextId = 1;
  const timers: ForwardTimers = {
    setInterval: (fn, ms) => {
      const id = nextId++;
      ticking.set(id, { every: ms, next: now + ms, fn });
      return id;
    },
    clearInterval: (id) => {
      ticking.delete(id as number);
    },
  };
  const advance = (ms: number) => {
    const end = now + ms;
    while (true) {
      const due = [...ticking.values()].filter((t) => t.next <= end).sort((a, b) => a.next - b.next)[0];
      if (!due) break;
      now = due.next;
      due.next += due.every;
      due.fn();
    }
    now = end;
  };
  return { timers, advance, now: () => now, running: () => ticking.size };
}

function visit(cookieHeader: () => string) {
  const clock = fakeClock();
  const forwarded: number[] = [];
  const stop = forwardWhenRecorded({
    readCookies: cookieHeader,
    now: clock.now,
    pageLoadedAt: LOADED_AT,
    timers: clock.timers,
    forward: () => forwarded.push(clock.now()),
  });
  return { clock, forwarded, stop, running: clock.running };
}

describe("a visitor landing on /start", () => {
  test("whose landing this visit recorded is sent on at the first tick, not before", () => {
    const { clock, forwarded } = visit(() => RECORDED);

    expect(forwarded).toEqual([]);
    clock.advance(1000);

    expect(forwarded.length).toBe(1);
    expect(forwarded[0]).toBeGreaterThan(0);
    expect(forwarded[0]).toBeLessThanOrEqual(150);
  });

  test("with an earlier visit's cookie waits until this visit's landing replaces it", () => {
    let header = FROM_YESTERDAY;
    const { clock, forwarded } = visit(() => header);

    clock.advance(1000);
    expect(forwarded).toEqual([]);

    header = RECORDED;
    clock.advance(1000);

    expect(forwarded.length).toBe(1);
    expect(forwarded[0]).toBeGreaterThan(1000);
    expect(forwarded[0]).toBeLessThanOrEqual(1150);
  });

  test("whose landing is recorded a moment later is sent on right after", () => {
    let header = "theme=dark";
    const { clock, forwarded } = visit(() => header);

    clock.advance(500);
    expect(forwarded).toEqual([]);

    header = RECORDED;
    clock.advance(1000);

    expect(forwarded.length).toBe(1);
    expect(forwarded[0]).toBeGreaterThan(500);
    expect(forwarded[0]).toBeLessThanOrEqual(650);
  });

  test.each([
    ["no source cookie", "theme=dark"],
    ["only an earlier visit's source cookie", FROM_YESTERDAY],
  ])("whose consent writes nothing (%s) is sent on at the ceiling, once", (_label, header) => {
    const { clock, forwarded, running } = visit(() => header);

    clock.advance(START_FORWARD_CEILING_MS - 1);
    expect(forwarded).toEqual([]);

    clock.advance(1);
    clock.advance(5000);

    expect(forwarded).toEqual([START_FORWARD_CEILING_MS]);
    expect(running()).toBe(0);
  });

  test("is sent on with no destination from the helper: the caller's route is the only way out", () => {
    const calls: unknown[][] = [];
    const clock = fakeClock();
    forwardWhenRecorded({
      readCookies: () => RECORDED,
      now: clock.now,
      pageLoadedAt: LOADED_AT,
      timers: clock.timers,
      forward: (...args: unknown[]) => calls.push(args),
    });

    clock.advance(1000);

    expect(calls).toEqual([[]]);
  });

  test("who leaves the page first is never forwarded", () => {
    const { clock, forwarded, stop, running } = visit(() => RECORDED);

    stop();
    clock.advance(5000);

    expect(forwarded).toEqual([]);
    expect(running()).toBe(0);
  });
});

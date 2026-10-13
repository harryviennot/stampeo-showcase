/**
 * Did tapping the escape link actually take the visitor out of the in-app
 * browser? The page going hidden (or being unloaded) inside the wait says yes;
 * a page still in front of the visitor when the wait ends says no.
 */

import { describe, expect, test } from "bun:test";
import { attemptBrowserEscape, type EscapeDocument, type EscapeTimers, type EscapeWindow } from "./browser-escape";

type Listener = () => void;

/** A document and window that record their listeners and fire events on demand. */
function fakePage() {
  const listeners: Record<string, Set<Listener>> = {};
  const target = (name: string) => ({
    addEventListener: (type: string, fn: Listener) => {
      (listeners[`${name}:${type}`] ??= new Set()).add(fn);
    },
    removeEventListener: (type: string, fn: Listener) => {
      listeners[`${name}:${type}`]?.delete(fn);
    },
  });
  const doc = { visibilityState: "visible", ...target("doc") } as EscapeDocument & { visibilityState: string };
  const win = target("win") as EscapeWindow;
  const fire = (name: "doc" | "win", type: string) => {
    for (const fn of [...(listeners[`${name}:${type}`] ?? [])]) fn();
  };
  const listenerCount = () => Object.values(listeners).reduce((n, set) => n + set.size, 0);
  return { doc, win, fire, listenerCount };
}

/** A manual clock: timers run only when the test advances it. */
function fakeTimers() {
  let now = 0;
  let next = 1;
  const pending = new Map<number, { at: number; fn: () => void }>();
  const timers: EscapeTimers = {
    setTimeout: (fn, ms) => {
      const id = next++;
      pending.set(id, { at: now + ms, fn });
      return id;
    },
    clearTimeout: (id) => {
      pending.delete(id as number);
    },
  };
  const advance = (ms: number) => {
    now += ms;
    for (const [id, timer] of [...pending]) {
      if (timer.at <= now) {
        pending.delete(id);
        timer.fn();
      }
    }
  };
  return { timers, advance, pendingCount: () => pending.size };
}

const URL_TO_OPEN = "x-safari-https://stampeo.app/en/onboarding";

describe("attemptBrowserEscape", () => {
  test("hands the link to the browser, with the page already being watched", async () => {
    const page = fakePage();
    const clock = fakeTimers();
    let watchedWhenNavigating = 0;
    const opened: string[] = [];

    const result = attemptBrowserEscape({
      url: URL_TO_OPEN,
      navigate: (url) => {
        opened.push(url);
        watchedWhenNavigating = page.listenerCount();
      },
      doc: page.doc,
      win: page.win,
      timers: clock.timers,
    });
    page.fire("win", "pagehide");

    expect(await result).toBe("left");
    expect(opened).toEqual([URL_TO_OPEN]);
    expect(watchedWhenNavigating).toBeGreaterThan(0);
  });

  test("the page going hidden within the wait means the visitor left", async () => {
    const page = fakePage();
    const clock = fakeTimers();
    const result = attemptBrowserEscape({ url: URL_TO_OPEN, navigate: () => {}, doc: page.doc, win: page.win, timers: clock.timers });

    clock.advance(400);
    page.doc.visibilityState = "hidden";
    page.fire("doc", "visibilitychange");

    expect(await result).toBe("left");
  });

  test("the page being unloaded within the wait means the visitor left", async () => {
    const page = fakePage();
    const clock = fakeTimers();
    const result = attemptBrowserEscape({ url: URL_TO_OPEN, navigate: () => {}, doc: page.doc, win: page.win, timers: clock.timers });

    clock.advance(900);
    page.fire("win", "pagehide");

    expect(await result).toBe("left");
  });

  test("a page still visible when the wait ends means the visitor stayed", async () => {
    const page = fakePage();
    const clock = fakeTimers();
    const result = attemptBrowserEscape({ url: URL_TO_OPEN, navigate: () => {}, doc: page.doc, win: page.win, timers: clock.timers });

    clock.advance(1499);
    clock.advance(1);

    expect(await result).toBe("stayed");
  });

  test("a visibility change that leaves the page visible is not leaving", async () => {
    const page = fakePage();
    const clock = fakeTimers();
    const result = attemptBrowserEscape({ url: URL_TO_OPEN, navigate: () => {}, doc: page.doc, win: page.win, timers: clock.timers });

    page.doc.visibilityState = "visible";
    page.fire("doc", "visibilitychange");
    clock.advance(1500);

    expect(await result).toBe("stayed");
  });

  test("the wait can be set by the caller", async () => {
    const page = fakePage();
    const clock = fakeTimers();
    const result = attemptBrowserEscape({
      url: URL_TO_OPEN,
      navigate: () => {},
      doc: page.doc,
      win: page.win,
      timers: clock.timers,
      timeoutMs: 300,
    });

    clock.advance(300);

    expect(await result).toBe("stayed");
  });

  test("a navigation the browser refuses counts as staying", async () => {
    const page = fakePage();
    const clock = fakeTimers();
    const result = await attemptBrowserEscape({
      url: URL_TO_OPEN,
      navigate: () => {
        throw new Error("blocked");
      },
      doc: page.doc,
      win: page.win,
      timers: clock.timers,
    });

    expect(result).toBe("stayed");
  });

  test.each(["left", "stayed"] as const)("when the answer is %s, no listener or timer is left behind", async (outcome) => {
    const page = fakePage();
    const clock = fakeTimers();
    const result = attemptBrowserEscape({ url: URL_TO_OPEN, navigate: () => {}, doc: page.doc, win: page.win, timers: clock.timers });

    if (outcome === "left") page.fire("win", "pagehide");
    else clock.advance(1500);

    expect(await result).toBe(outcome);
    expect(page.listenerCount()).toBe(0);
    expect(clock.pendingCount()).toBe(0);
  });
});

import { describe, expect, test } from "bun:test";
import { createSessionSync, INACTIVITY_TIMEOUT_MS, type SessionSnapshot } from "./session-sync";

type Timer = { fn: () => Promise<void> | void; ms: number };

const pending = (): SessionSnapshot => ({ status: "pending", stamps: 0 });
const downloaded = (extra: Partial<SessionSnapshot> = {}): SessionSnapshot => ({
  status: "pass_downloaded",
  stamps: 0,
  ...extra,
});
const installed = (extra: Partial<SessionSnapshot> = {}): SessionSnapshot => ({
  status: "pass_installed",
  stamps: 0,
  ...extra,
});

/**
 * A visitor on the demo page, with a stub server and a hand-driven clock. The page
 * starts at `start` (the pass opened in Wallet by default) and the server answers
 * `server` (what the page shows by default; null is a read that fails). `tick()`
 * runs every live interval once, like the browser would.
 */
function visitor({
  cardType = "stamp",
  start = downloaded(),
  server = start,
}: {
  cardType?: "stamp" | "points";
  start?: SessionSnapshot;
  server?: SessionSnapshot | null;
} = {}) {
  const stub = { state: server };
  const applied: SessionSnapshot[] = [];
  const captured: { event: string; props: Record<string, unknown> }[] = [];
  const timers = new Set<Timer>();
  const page = { hidden: false, clock: 0, fetches: 0 };

  const sync = createSessionSync({
    cardType,
    fetchSession: async () => {
      page.fetches++;
      return stub.state;
    },
    apply: (snapshot) => applied.push(snapshot),
    capture: (event, props) => captured.push({ event, props }),
    isHidden: () => page.hidden,
    now: () => page.clock,
    startTimer: (fn, ms) => {
      const timer = { fn, ms };
      timers.add(timer);
      return timer;
    },
    stopTimer: (timer) => timers.delete(timer as Timer),
  });
  sync.adopt("tok", start);

  return {
    sync,
    server: stub,
    applied,
    captured,
    timers,
    page,
    tick: () => Promise.all([...timers].map((timer) => timer.fn())),
  };
}

describe.each(["stamp", "points"] as const)("a %s demo whose pass was opened in Wallet", (cardType) => {
  const extra = cardType === "points" ? { points: 0 } : {};

  test("the page becoming visible again shows the install Wallet registered while it was away", async () => {
    const v = visitor({ cardType, start: downloaded(extra), server: installed(extra) });
    v.page.hidden = true;
    v.sync.pageHidden();

    v.page.hidden = false;
    await v.sync.pageVisible();

    expect(v.applied).toEqual([installed(extra)]);
    expect(v.captured).toEqual([
      {
        event: "demo_step_reached",
        props: {
          step: "pass_installed",
          previous_step: "pass_downloaded",
          stamps: 0,
          points: cardType === "points" ? 0 : undefined,
          card_type: cardType,
        },
      },
    ]);
  });

  test("an event stream that never delivers the install is covered by the poll", async () => {
    const v = visitor({ cardType, start: downloaded(extra), server: installed(extra) });
    expect(v.timers.size).toBe(1);

    await v.tick();

    expect(v.applied).toEqual([installed(extra)]);
    expect(v.captured).toHaveLength(1);
    expect(v.timers.size).toBe(0);
  });
});

describe("the poll runs only while the install is unconfirmed", () => {
  test("it keeps polling while the server still says the pass was only opened", async () => {
    const v = visitor();

    await v.tick();
    await v.tick();

    expect(v.page.fetches).toBe(2);
    expect(v.timers.size).toBe(1);
    expect(v.captured).toHaveLength(0);
  });

  test.each([
    ["before the pass is opened", pending()],
    ["once it is installed", installed()],
  ])("there is no poll %s", (_when, start) => {
    expect(visitor({ start }).timers.size).toBe(0);
  });

  test("opening the pass (reported by the event stream) starts the poll", () => {
    const v = visitor({ start: pending() });

    v.sync.receive(downloaded());

    expect(v.timers.size).toBe(1);
  });

  test("hiding the page stops it, and coming back restarts it", async () => {
    const v = visitor();

    v.page.hidden = true;
    v.sync.pageHidden();
    expect(v.timers.size).toBe(0);

    v.page.hidden = false;
    await v.sync.pageVisible();
    expect(v.timers.size).toBe(1);
  });

  test("a hidden page that gets a state update does not restart it", () => {
    const v = visitor({ start: pending() });
    v.page.hidden = true;

    v.sync.receive(downloaded());

    expect(v.timers.size).toBe(0);
  });

  test("a reset or unmount stops it, and an answer already on its way is dropped", async () => {
    const v = visitor({ server: installed() });

    const reading = v.tick();
    v.sync.stop();
    await reading;

    expect(v.timers.size).toBe(0);
    expect(v.applied).toEqual([]);
    expect(v.captured).toEqual([]);
  });

  test("ten minutes without a change stops it without another request", async () => {
    const v = visitor();

    v.page.clock = INACTIVITY_TIMEOUT_MS + 1;
    await v.tick();

    expect(v.page.fetches).toBe(0);
    expect(v.timers.size).toBe(0);
    expect(v.sync.isIdle()).toBe(true);
  });
});

describe("one capture per real change, whichever path reports it", () => {
  test("the event stream then the poll reporting the same install capture once", async () => {
    const v = visitor({ server: installed() });

    v.sync.receive(installed());
    await v.sync.pageVisible();
    await v.tick();

    expect(v.captured).toHaveLength(1);
  });

  test("an answer to a read that started before the event stream spoke does not undo it", async () => {
    const v = visitor();

    const reading = v.sync.pageVisible();
    v.sync.receive(installed());
    await reading;

    expect(v.applied).toEqual([installed()]);
    expect(v.captured).toHaveLength(1);
  });
});

describe("a read that fails", () => {
  test("leaves the page as it was and the poll keeps trying", async () => {
    const v = visitor({ server: null });

    await v.sync.pageVisible();
    expect(v.applied).toEqual([]);
    expect(v.timers.size).toBe(1);

    v.server.state = installed();
    await v.tick();
    expect(v.applied).toEqual([installed()]);
  });
});

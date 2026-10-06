/**
 * Leaving the onboarding wizard for the dashboard, from each place a sign-up
 * is confirmed (AC6.5): an email code that verified with a phone number, one
 * that verified without, and a Google or Apple return.
 *
 * The page is about to be replaced, so the account sign-up call has to have
 * left before it is. These cases run the wizard's real orchestration against a
 * fake browser and read the order in its event log: the request is handed to
 * the browser first, then the draft is cleared and the page leaves.
 */

import { afterEach, describe, expect, test } from "bun:test";

import { installFakeBrowser, type FakeBrowser } from "../privacy/__fixtures__/fake-browser";
import { leaveOnboarding } from "./signup-flow";
import { recordAccountSignup } from "./signup-call";

let browser: FakeBrowser | null = null;
afterEach(() => {
  browser?.restore();
  browser = null;
});

const API = "https://api.stampeo.app";
const later = <T>(ms: number, value: T) => new Promise<T>((resolve) => setTimeout(() => resolve(value), ms));

/** The wizard's three call sites, as they wire the pieces. */
function leaving(over: { getAccessToken?: () => Promise<string | null>; dispatchTimeoutMs?: number } = {}) {
  const log = (event: string) => browser!.events.push(event);
  return {
    reportSignup: () =>
      recordAccountSignup({
        apiUrl: API,
        measurementId: "G-ZFZ6JLPFXN",
        getAccessToken: over.getAccessToken ?? (() => later(15, "user-jwt")),
        dispatchTimeoutMs: over.dispatchTimeoutMs,
        guard: { sent: false },
      }),
    clearDraft: () => log("clear-draft"),
    leave: () => log("leave"),
  };
}

/** What the wizard did before it cleared the draft and left, then those two last steps. */
function steps() {
  const done = browser!.events.filter((event) => ["fetch", "profile", "clear-draft", "leave"].includes(event));
  return { before: done.slice(0, -2).sort(), last: done.slice(-2) };
}

describe("an email code verified", () => {
  test("without a phone number: the sign-up request leaves before the page does", async () => {
    browser = installFakeBrowser({ timezone: "America/New_York", fetch: "hang" });

    await leaveOnboarding({ ...leaving() });

    expect(steps()).toEqual({ before: ["fetch"], last: ["clear-draft", "leave"] });
    expect(browser.fetches[0].url).toBe(`${API}/account/signup-recorded`);
  });

  test("with a phone number: the profile is synced too, and both are done before the page leaves", async () => {
    browser = installFakeBrowser({ timezone: "America/New_York", fetch: "hang" });

    await leaveOnboarding({
      ...leaving(),
      syncProfile: async () => {
        await later(30, null);
        browser!.events.push("profile");
      },
    });

    expect(steps()).toEqual({ before: ["fetch", "profile"], last: ["clear-draft", "leave"] });
  });
});

describe("a Google or Apple return", () => {
  test("the token is already in hand, and the request still leaves before the page does", async () => {
    browser = installFakeBrowser({ timezone: "America/New_York", fetch: "hang" });

    await leaveOnboarding({
      ...leaving({ getAccessToken: async () => "session-jwt" }),
      syncProfile: async () => {
        browser!.events.push("profile");
      },
    });

    expect(steps()).toEqual({ before: ["fetch", "profile"], last: ["clear-draft", "leave"] });
  });
});

describe("when the request cannot leave", () => {
  test("the page still leaves, after no more than the wait it was given", async () => {
    browser = installFakeBrowser({ timezone: "America/New_York", fetch: "hang" });
    const started = Date.now();

    await leaveOnboarding({
      ...leaving({ getAccessToken: () => new Promise(() => {}), dispatchTimeoutMs: 40 }),
    });

    expect(steps()).toEqual({ before: [], last: ["clear-draft", "leave"] });
    expect(Date.now() - started).toBeLessThan(1_000);
  });

  test("a request that throws does not stop it either", async () => {
    browser = installFakeBrowser({ timezone: "America/New_York", fetch: "throw" });

    await leaveOnboarding({ ...leaving() });

    expect(steps()).toEqual({ before: ["fetch"], last: ["clear-draft", "leave"] });
  });
});

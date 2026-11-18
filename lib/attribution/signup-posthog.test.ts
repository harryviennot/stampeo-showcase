/**
 * The sign-up call tells the backend which PostHog visitor just created the account, so it can join the visits to
 * the account. The browser sends the id as `ph` and nothing else: the backend queues the `$identify` itself, and
 * the browser never calls `identify`. The id goes only for a visitor PostHog is remembering; a visitor in memory,
 * or one who refused, sends none. The sign-up happens on `/onboarding`, a page PostHog does not record, usually
 * reached from a page it does; once the id is sent the browser starts a new one, so the next account created in
 * the same browser is never joined to this visitor.
 */

import { afterEach, describe, expect, test } from "bun:test";

import { CONSENT_COOKIE, CONSENT_VERSION } from "../consent";
import { GRANTED_COOKIE, REFUSED_COOKIE, installFakeBrowser, type FakeBrowser } from "../privacy/__fixtures__/fake-browser";
import { FIRST_ID, NEXT_ID, fakePostHog, type Call } from "../posthog/__fixtures__/fake-posthog";
import { syncPostHogForUrl } from "../posthog/consent-sync";
import { startPostHog } from "../posthog/start";
import { fakeStorage } from "../testing/fake-storage";
import { restoreGlobalsAfterEach } from "../testing/restore-globals";
import { buildSignupBody, signupBasis } from "./signup-body";
import { recordAccountSignup } from "./signup-call";
import { rowFor } from "../privacy/policy";

restoreGlobalsAfterEach("localStorage", "sessionStorage");

let browser: FakeBrowser | null = null;
let stop: (() => void) | null = null;
afterEach(() => {
  stop?.();
  stop = null;
  browser?.restore();
  browser = null;
});

const grantUnder = (version: number, madeIn: "EEA_UK_CH" | "US" = "EEA_UK_CH") =>
  `${CONSENT_COOKIE}=${encodeURIComponent(
    JSON.stringify({ v: version, a: 1, m: 1, t: 1_791_240_000, r: madeIn === "US" ? "opt-out" : "opt-in", g: madeIn }),
  )}`;
const refusalUnder = (version: number, madeIn: "EEA_UK_CH" | "US") =>
  `${CONSENT_COOKIE}=${encodeURIComponent(
    JSON.stringify({ v: version, a: 0, m: 1, t: 1_791_240_000, r: madeIn === "US" ? "opt-out" : "opt-in", g: madeIn }),
  )}`;

const names = (calls: Call[]) => calls.map(([name]) => name);

/**
 * A visitor who lands on a marketing page (or on `landedOn`), where PostHog starts the way the site starts it
 * (recording, if they said yes), and moves to the sign-up page. `confirmAccount` is the sign-up flow reporting a confirmed account, and
 * returns the body it sent.
 */
function visitor(options: { cookie: string; timezone: string; gpc?: boolean; id?: string; posthog?: boolean; landedOn?: string }) {
  browser = installFakeBrowser({ cookie: options.cookie, timezone: options.timezone, gpc: options.gpc, pathname: options.landedOn ?? "/pricing" });
  Object.defineProperty(globalThis, "localStorage", { value: fakeStorage(), configurable: true, writable: true });
  Object.defineProperty(globalThis, "sessionStorage", { value: fakeStorage(), configurable: true, writable: true });
  const posthog = fakePostHog(options.id);
  if (options.posthog !== false) stop = startPostHog(posthog, "phc_testkey", "https://eu.i.posthog.com");

  (globalThis.window as unknown as { location: { pathname: string } }).location.pathname = "/onboarding";
  syncPostHogForUrl("/onboarding");

  return {
    posthog,
    async confirmAccount() {
      await recordAccountSignup({
        apiUrl: "https://api.stampeo.app",
        measurementId: null,
        getAccessToken: async () => "user-access-token",
        guard: { sent: false },
      });
      return browser!.fetches.filter((fetch) => fetch.url.endsWith("/account/signup-recorded")).at(-1)!.body;
    },
  };
}

/** The body the owner sign-up flow sends for this visitor. */
const signUp = (options: Parameters<typeof visitor>[0]) => visitor(options).confirmAccount();

describe("the account sign-up call", () => {
  test.each([
    ["a European who accepted audience measurement", { cookie: GRANTED_COOKIE, timezone: "Europe/Paris" }],
    ["a United States visitor who made no choice", { cookie: "", timezone: "America/New_York" }],
    ["a United States visitor who saved the dialog with analytics on", { cookie: grantUnder(CONSENT_VERSION, "US"), timezone: "America/New_York" }],
    ["a visitor we cannot place who accepted", { cookie: GRANTED_COOKIE, timezone: "Antarctica/Troll" }],
  ])("%s: carries the PostHog id as ph", async (_who, options) => {
    expect((await signUp(options)).ph).toBe(FIRST_ID);
  });

  test.each([
    ["a European who made no choice", { cookie: "", timezone: "Europe/Paris" }],
    ["a European who refused", { cookie: REFUSED_COOKIE, timezone: "Europe/Paris" }],
    ["a European whose only grant is from the previous consent text", { cookie: grantUnder(CONSENT_VERSION - 1), timezone: "Europe/Paris" }],
    ["a United States visitor who refused analytics", { cookie: refusalUnder(CONSENT_VERSION, "US"), timezone: "America/New_York" }],
    ["a United States visitor who refused it under an older text", { cookie: refusalUnder(CONSENT_VERSION - 2, "US"), timezone: "America/New_York" }],
    ["a United States visitor whose browser sends Global Privacy Control", { cookie: "", timezone: "America/New_York", gpc: true }],
  ])("%s: sends no ph", async (_who, options) => {
    const body = await signUp(options);

    expect(body).not.toHaveProperty("ph");
    expect(body.basis).toBeDefined();
  });

  test("sends no ph when PostHog never started on the page (no key, or a page it stays off)", async () => {
    expect(await signUp({ cookie: GRANTED_COOKIE, timezone: "Europe/Paris", posthog: false })).not.toHaveProperty("ph");
  });

  test.each(["anonymous", "", FIRST_ID.toUpperCase(), `${FIRST_ID}0`, "$posthog_cookieless"])(
    "sends no ph for an id that is not a canonical lower-case UUID (%p)",
    async (id) => {
      expect(await signUp({ cookie: GRANTED_COOKIE, timezone: "Europe/Paris", id })).not.toHaveProperty("ph");
    },
  );

  test("the rest of the body is what it was: the subject, the basis and what the visitor refused", async () => {
    const body = await signUp({ cookie: GRANTED_COOKIE, timezone: "Europe/Paris" });

    expect(Object.keys(body).sort()).toEqual(["basis", "ph", "refused"]);
  });
});

describe("a visitor recorded on a marketing page who moves to the sign-up", () => {
  test("recording stops there and the id still goes with the sign-up", async () => {
    const { posthog, confirmAccount } = visitor({ cookie: GRANTED_COOKIE, timezone: "Europe/Paris" });

    expect(names(posthog.calls)).toEqual(expect.arrayContaining(["startSessionRecording", "stopSessionRecording"]));
    expect((await confirmAccount()).ph).toBe(FIRST_ID);
  });
});

describe("a visitor returning from Google or Apple", () => {
  test("lands on the sign-up page itself, where PostHog starts from the cookie, and the id goes with the sign-up", async () => {
    const { posthog, confirmAccount } = visitor({ cookie: GRANTED_COOKIE, timezone: "Europe/Paris", landedOn: "/onboarding" });

    expect(names(posthog.calls)).not.toContain("startSessionRecording");
    expect((await confirmAccount()).ph).toBe(FIRST_ID);
  });
});

describe("a second account confirmed in the same browser", () => {
  test("carries a new id, and PostHog keeps the visitor on the cookie", async () => {
    const { posthog, confirmAccount } = visitor({ cookie: GRANTED_COOKIE, timezone: "Europe/Paris" });

    const before = posthog.calls.length;
    const first = await confirmAccount();
    // The id and the device id are renewed and the geoip flag registered again; the storage mode is not touched.
    expect(posthog.calls.slice(before)).toEqual([
      ["reset", { resetDeviceId: true }],
      ["register", { $geoip_disable: true }],
    ]);
    const second = await confirmAccount();

    expect(first.ph).toBe(FIRST_ID);
    expect(second.ph).toBe(NEXT_ID);
  });

  test.each([
    ["a European who made no choice", { cookie: "", timezone: "Europe/Paris" }],
    ["a United States visitor whose browser sends Global Privacy Control", { cookie: "", timezone: "America/New_York", gpc: true }],
  ])("sends no id for %s, either time, and nothing is reset", async (_who, options) => {
    const { posthog, confirmAccount } = visitor(options);

    expect(await confirmAccount()).not.toHaveProperty("ph");
    expect(await confirmAccount()).not.toHaveProperty("ph");
    expect(names(posthog.calls)).not.toContain("reset");
  });
});

describe("the body builder", () => {
  const input = {
    cookieHeader: "",
    stored: { record: null, prior: null },
    measurementId: null,
    basis: signupBasis(rowFor("FR")),
  };

  test("puts the id it is given in ph, while analytics is allowed", () => {
    expect(buildSignupBody({ ...input, consent: { analytics: true, marketing: false }, posthogId: FIRST_ID }).ph).toBe(FIRST_ID);
  });

  test.each([
    ["none", { analytics: true, marketing: true }, null],
    ["not given", { analytics: true, marketing: true }, undefined],
    ["analytics not allowed", { analytics: false, marketing: true }, FIRST_ID],
  ])("leaves ph out when the id is %s", (_case, consent, posthogId) => {
    expect(buildSignupBody({ ...input, consent, posthogId })).not.toHaveProperty("ph");
  });
});

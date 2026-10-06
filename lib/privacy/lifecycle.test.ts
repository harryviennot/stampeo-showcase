/**
 * What a page load does about the subject and the stored choice.
 *
 * Two promises are kept here.
 *
 *   - In the US tracking starts without a choice, so the subject has to exist
 *     BEFORE any tag does: it is written to the jar, handed to the server, and
 *     only then does `ready` turn true for the tag gates. Anywhere else nothing
 *     is minted until the visitor decides.
 *   - A US refusal slides: every trackable page load re-issues it through the
 *     server, so a visitor who keeps coming back never sees it expire.
 *
 * Neither happens on a page where no tag may run: a business's QR enrollment
 * page belongs to our customers' customers.
 */

import { afterEach, describe, expect, test } from "bun:test";

import {
  CONSENT_VERSION,
  readStoredConsent,
  resolveConsent,
  writeConsentRecord,
  type ConsentRecord,
} from "../consent";
import { shouldLoadGa } from "../google-analytics";
import { shouldLoadMetaPixel } from "../meta-pixel";
import { installFakeBrowser, SUBJECT, type FakeBrowser } from "./__fixtures__/fake-browser";
import { planPageLoad, runPageLifecycle, type LifecycleSession } from "./lifecycle";
import { rowFor } from "./policy";
import { readConsentSnapshot } from "./snapshot";
import { readSidCookie, writeSidCookie } from "./subject";

const US = rowFor("US");
const EU = rowFor("FR");

const choice = (analytics: boolean, marketing: boolean): ConsentRecord => ({
  v: CONSENT_VERSION,
  analytics,
  marketing,
  at: 1_759_000_000,
  regime: "opt-out",
});

let browser: FakeBrowser | null = null;
afterEach(() => {
  browser?.restore();
  browser = null;
});

const fresh = (): LifecycleSession => ({ refreshed: false });

/** What GoogleAnalytics and MetaPixel decide, from the consent snapshot. */
function tagGates(trackable = true) {
  const { analytics, marketing, ready } = readConsentSnapshot();
  return {
    ga: shouldLoadGa({ measurementId: "G-ZFZ6JLPFXN", analytics, ready, trackable }),
    meta: shouldLoadMetaPixel({ pixelId: "1088158323750710", marketing, ready, trackable }),
  };
}

describe("planPageLoad", () => {
  const base = { row: US, sid: SUBJECT, stored: null, trackable: true, refreshedThisDocument: false };
  const NOTHING = { mintSid: false, syncSid: false, syncConsent: false };

  test.each([
    ["a US visitor with no subject yet", { sid: null }, { mintSid: true, syncSid: true, syncConsent: false }],
    ["a US visitor with a subject", {}, { mintSid: false, syncSid: true, syncConsent: false }],
    ["a US refusal slides", { stored: choice(true, false) }, { mintSid: false, syncSid: true, syncConsent: true }],
    ["a US grant does not slide", { stored: choice(true, true) }, { mintSid: false, syncSid: true, syncConsent: false }],
    ["an older US refusal slides too", { stored: { ...choice(false, false), v: CONSENT_VERSION - 1 } }, { mintSid: false, syncSid: true, syncConsent: true }],
    ["a page where no tag may run", { sid: null, stored: choice(false, false), trackable: false }, NOTHING],
    ["a page already refreshed this load", { stored: choice(false, false), refreshedThisDocument: true }, NOTHING],
    ["a missing subject is minted even after the refresh", { sid: null, refreshedThisDocument: true }, { mintSid: true, syncSid: true, syncConsent: false }],
    ["a French visitor with no choice has nothing minted", { row: EU, sid: null }, NOTHING],
    ["a French visitor who decided keeps their subject fresh", { row: EU }, { mintSid: false, syncSid: true, syncConsent: false }],
    ["a French refusal does not slide", { row: EU, stored: choice(false, false) }, { mintSid: false, syncSid: true, syncConsent: false }],
  ] as const)("%s", (_case, overrides, expected) => {
    expect(planPageLoad({ ...base, ...overrides })).toEqual(expected);
  });
});

describe("a US visitor with no choice arrives (AC3.1)", () => {
  test("the subject exists, and is on its way to the server, before any tag may load", async () => {
    browser = installFakeBrowser({ timezone: "America/New_York", fetch: "route" });

    // Before: the default would let both tags in, and the gate holds them back.
    expect(readConsentSnapshot()).toMatchObject({ analytics: true, marketing: true, ready: false });
    expect(tagGates()).toEqual({ ga: false, meta: false });

    runPageLifecycle("/us/pricing", fresh());

    // The jar has it, the request is out, and only then is the gate open.
    expect(browser.events).toEqual(["cookie:stampeo_sid", "fetch", "consent-change"]);
    expect(readSidCookie(browser.jar())).not.toBeNull();
    expect(readConsentSnapshot().ready).toBe(true);
    expect(tagGates()).toEqual({ ga: true, meta: true });

    // The server's answer replaces the script-written cookie with its own.
    await browser.settled();
    expect(browser.events).toContain("server-set:stampeo_sid");
    expect(browser.fetches[0].body).toEqual({ sid: "ensure" });
  });

  test("no subject is minted on a business's enrollment page", () => {
    browser = installFakeBrowser({ timezone: "America/New_York", fetch: "route" });

    runPageLifecycle("/en/chez-marie", fresh());

    expect(browser.writes).toEqual([]);
    expect(browser.fetches).toEqual([]);
  });

  test("a forged subject cookie is replaced", async () => {
    browser = installFakeBrowser({
      timezone: "America/New_York",
      fetch: "route",
      cookie: "stampeo_sid=forged",
    });

    runPageLifecycle("/pricing", fresh());
    await browser.settled();

    const sid = readSidCookie(browser.jar());
    expect(sid).not.toBeNull();
    expect(sid).not.toBe("forged");
  });

  test("a browser that will not keep the cookie still gets a subject for this page", () => {
    browser = installFakeBrowser({ timezone: "America/New_York", cookies: "silent" });

    runPageLifecycle("/pricing", fresh());

    expect(readConsentSnapshot().ready).toBe(true);

    // Leave the in-memory fallback empty for whatever runs next.
    browser.restore();
    browser = installFakeBrowser();
    writeSidCookie(SUBJECT);
  });

  test("a failing request changes nothing the visitor can see", async () => {
    browser = installFakeBrowser({ timezone: "America/New_York", fetch: "reject" });

    runPageLifecycle("/pricing", fresh());
    await browser.settled();

    expect(readConsentSnapshot().ready).toBe(true);
  });
});

describe("a French visitor with no choice (AC1.6)", () => {
  test("nothing is written, nothing is sent, and no tag may load", () => {
    browser = installFakeBrowser({ timezone: "Europe/Paris", fetch: "route" });

    runPageLifecycle("/pricing", fresh());

    expect(browser.writes).toEqual([]);
    expect(browser.fetches).toEqual([]);
    expect(readConsentSnapshot()).toMatchObject({ analytics: false, marketing: false, ready: true });
    expect(tagGates()).toEqual({ ga: false, meta: false });
  });

  test("once they decide, their subject is kept fresh on each load, and a refusal does not slide", async () => {
    browser = installFakeBrowser({ timezone: "Europe/Paris", fetch: "route" });
    writeConsentRecord({ analytics: false, marketing: false }, "opt-in", "EEA_UK_CH");
    await browser.settled();
    browser.fetches.length = 0;

    runPageLifecycle("/pricing", fresh());

    expect(browser.fetches).toHaveLength(1);
    expect(browser.fetches[0].body).toEqual({ sid: "ensure" });
  });
});

describe("a US refusal slides (AC2.1)", () => {
  test("each trackable load re-issues it at 400 days, so it is never reached by expiry", async () => {
    browser = installFakeBrowser({ timezone: "America/New_York", fetch: "route" });
    writeConsentRecord({ analytics: true, marketing: false }, "opt-out", "US");
    await browser.settled();

    // 300 days on, the visitor comes back.
    browser.advanceDays(300);
    browser.fetches.length = 0;
    runPageLifecycle("/us/pricing", fresh());
    await browser.settled();

    expect(browser.fetches).toHaveLength(1);
    expect(browser.fetches[0].body).toMatchObject({ sid: "ensure", consent: { a: 1, m: 0 } });

    // Without the re-issue the cookie would be gone 100 days from now.
    browser.advanceDays(183);
    const stored = readStoredConsent();
    expect(stored.record).not.toBeNull();
    expect(
      resolveConsent({ ...stored, regime: "opt-out", gpc: false, row: US }),
    ).toEqual({ analytics: true, marketing: false });
  });

  test("it is re-issued once per page load, not on every navigation", async () => {
    browser = installFakeBrowser({ timezone: "America/New_York", fetch: "route" });
    writeConsentRecord({ analytics: true, marketing: false }, "opt-out", "US");
    await browser.settled();
    browser.fetches.length = 0;

    const session = fresh();
    runPageLifecycle("/us/pricing", session);
    runPageLifecycle("/us/features", session);
    runPageLifecycle("/pricing", session);

    expect(browser.fetches).toHaveLength(1);
  });

  test("landing first on a private page does not use up the refresh", async () => {
    browser = installFakeBrowser({ timezone: "America/New_York", fetch: "route" });
    writeConsentRecord({ analytics: true, marketing: false }, "opt-out", "US");
    await browser.settled();
    browser.fetches.length = 0;

    const session = fresh();
    runPageLifecycle("/onboarding", session);
    expect(browser.fetches).toEqual([]);

    runPageLifecycle("/pricing", session);
    expect(browser.fetches).toHaveLength(1);
  });
});

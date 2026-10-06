/**
 * The snapshot `useConsent` serves: the row it names, when it is ready, and
 * that it keeps its identity while nothing changes (`useSyncExternalStore`
 * compares snapshots by identity). The key it is cached on is in
 * `lib/consent.test.ts`.
 */

import { afterEach, describe, expect, test } from "bun:test";

import { installFakeBrowser, SUBJECT, type FakeBrowser } from "./__fixtures__/fake-browser";
import { SERVER_SNAPSHOT, readConsentSnapshot } from "./snapshot";

let browser: FakeBrowser | null = null;
afterEach(() => {
  browser?.restore();
  browser = null;
});

const region = (country: string) =>
  `stampeo_region=${encodeURIComponent(JSON.stringify({ c: country, v: 1 }))}`;

describe("what the snapshot says about the row", () => {
  test("the server's answer is denied, not ready, and the strict row", () => {
    expect(SERVER_SNAPSHOT).toMatchObject({
      analytics: false,
      marketing: false,
      ready: false,
      row: "UNKNOWN",
      surface: "banner",
    });
  });

  test.each([
    ["a US visitor", "America/New_York", "", "US", "notice"],
    ["a French visitor", "Europe/Paris", "", "EEA_UK_CH", "banner"],
    ["a visitor we cannot place", "Antarctica/Troll", "", "UNKNOWN", "banner"],
    ["a US timezone with a region cookie naming France", "America/New_York", region("FR"), "US", "notice"],
  ] as const)("%s", (_case, timezone, cookie, row, surface) => {
    browser = installFakeBrowser({ timezone, cookie: `stampeo_sid=${SUBJECT}; ${cookie}` });

    expect(readConsentSnapshot()).toMatchObject({ row, surface, ready: true });
  });
});

describe("ready", () => {
  test("a US visitor is not ready until the subject exists", () => {
    browser = installFakeBrowser({ timezone: "America/New_York" });
    expect(readConsentSnapshot().ready).toBe(false);

    browser.setJar(`stampeo_sid=${SUBJECT}`);
    expect(readConsentSnapshot().ready).toBe(true);
  });

  test("a French visitor is ready without one, and still denied", () => {
    browser = installFakeBrowser({ timezone: "Europe/Paris" });
    expect(readConsentSnapshot()).toMatchObject({ ready: true, analytics: false, marketing: false });
  });
});

describe("identity", () => {
  test("the same facts give the same object", () => {
    browser = installFakeBrowser({ timezone: "America/New_York", cookie: `stampeo_sid=${SUBJECT}` });
    expect(readConsentSnapshot()).toBe(readConsentSnapshot());
  });

  test("a new row, or readiness, gives a new one", () => {
    browser = installFakeBrowser({ timezone: "America/New_York" });
    const notReady = readConsentSnapshot();

    browser.setJar(`stampeo_sid=${SUBJECT}`);
    const ready = readConsentSnapshot();
    expect(ready).not.toBe(notReady);

    browser.setJar(`stampeo_sid=${SUBJECT}`);
    browser = installFakeBrowser({ timezone: "Europe/Paris", cookie: `stampeo_sid=${SUBJECT}` });
    expect(readConsentSnapshot()).not.toBe(ready);
  });
});

/**
 * The snapshot `useConsent` serves, and the identity rule behind it.
 *
 * `useSyncExternalStore` compares snapshots by identity, so the snapshot is
 * rebuilt only when its key changes. The key therefore has to cover every field
 * the snapshot exposes (including the row and `ready`), and has to hold still
 * when nothing changed, or React loops.
 */

import { afterEach, describe, expect, test } from "bun:test";

import { CONSENT_VERSION, consentSnapshotKey, type ConsentRecord } from "../consent";
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
      refusal_ttl_days: 182,
      gpc_overrides_choice: false,
    });
  });

  test.each([
    ["a US visitor", "America/New_York", "", "US", "notice", 400, true],
    ["a French visitor", "Europe/Paris", "", "EEA_UK_CH", "banner", 182, false],
    ["a visitor we cannot place", "Antarctica/Troll", "", "UNKNOWN", "banner", 182, false],
    ["a US timezone with a server region of France", "America/New_York", region("FR"), "EEA_UK_CH", "banner", 182, false],
  ] as const)("%s", (_case, timezone, cookie, row, surface, ttl, overrides) => {
    browser = installFakeBrowser({ timezone, cookie: `stampeo_sid=${SUBJECT}; ${cookie}` });

    expect(readConsentSnapshot()).toMatchObject({
      row,
      surface,
      refusal_ttl_days: ttl,
      gpc_overrides_choice: overrides,
      ready: true,
    });
  });

  test("the regime follows the row", () => {
    browser = installFakeBrowser({ timezone: "America/New_York", cookie: `stampeo_sid=${SUBJECT}` });
    expect(readConsentSnapshot().regime).toBe("opt-out");
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

    browser.setJar(`stampeo_sid=${SUBJECT}; ${region("FR")}`);
    expect(readConsentSnapshot()).not.toBe(ready);
  });
});

describe("consentSnapshotKey covers every field the snapshot exposes", () => {
  const record: ConsentRecord = {
    v: CONSENT_VERSION,
    analytics: true,
    marketing: true,
    at: 1_759_000_000,
    regime: "opt-out",
    subjectId: SUBJECT,
    policyVersion: 1,
    regionRow: "US",
  };
  const base = { record, prior: null, regime: "opt-out" as const, gpc: false, row: "US", ready: true };

  test("the same facts give the same key", () => {
    expect(consentSnapshotKey(base)).toBe(consentSnapshotKey({ ...base, record: { ...record } }));
  });

  test.each([
    ["the row", { row: "EEA_UK_CH" }],
    ["readiness", { ready: false }],
    ["the policy version of the record", { record: { ...record, policyVersion: 2 } }],
    ["the row of the record", { record: { ...record, regionRow: "UNKNOWN" } }],
  ])("%s changes it", (_case, change) => {
    expect(consentSnapshotKey({ ...base, ...change })).not.toBe(consentSnapshotKey(base));
  });
});

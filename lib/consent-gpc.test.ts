/**
 * Global Privacy Control against what the visitor has stored.
 *
 * In the US the signal is an opt-out that wins even over a recorded choice,
 * "Got it" included: the CCPA regulations (§7025) require processing it as an
 * opt-out when it conflicts with an earlier setting. In the EU an explicit
 * choice still wins over the signal.
 *
 * While the override is in force, the trackers the recorded grant let in are
 * cleared on load, the attribution carrier included, so nothing they hold
 * crosses to the dashboard.
 */

import { describe, expect, test } from "bun:test";
import {
  CONSENT_COOKIE,
  CONSENT_VERSION,
  categoriesToClearOnLoad,
  cookieNamesToClear,
  resolveConsent,
  type ConsentRecord,
  type PriorConsent,
} from "./consent";

/** What "Got it" on the US notice records: the opt-out default, both on. */
const GRANT: ConsentRecord = {
  v: CONSENT_VERSION,
  analytics: true,
  marketing: true,
  at: 1_759_400_000,
  regime: "opt-out",
};
const REFUSAL: ConsentRecord = { ...GRANT, analytics: false, marketing: false };
const OLDER_AD_REFUSAL: PriorConsent = {
  v: CONSENT_VERSION - 1,
  analytics: true,
  marketing: false,
  at: 1_759_000_000,
};

const STORED = {
  "a recorded grant": { record: GRANT, prior: null },
  "a recorded refusal": { record: REFUSAL, prior: null },
  "no record": { record: null, prior: null },
  "an older advertising refusal": { record: null, prior: OLDER_AD_REFUSAL },
} as const;

const ON = { analytics: true, marketing: true };
const OFF = { analytics: false, marketing: false };
const ANALYTICS_ONLY = { analytics: true, marketing: false };

describe("resolveConsent: GPC against what is stored", () => {
  test.each([
    ["a recorded grant", "opt-out", false, ON],
    ["a recorded grant", "opt-out", true, OFF],
    ["a recorded grant", "opt-in", false, ON],
    ["a recorded grant", "opt-in", true, ON],
    ["a recorded refusal", "opt-out", false, OFF],
    ["a recorded refusal", "opt-out", true, OFF],
    ["a recorded refusal", "opt-in", false, OFF],
    ["a recorded refusal", "opt-in", true, OFF],
    ["no record", "opt-out", false, ON],
    ["no record", "opt-out", true, OFF],
    ["no record", "opt-in", false, OFF],
    ["no record", "opt-in", true, OFF],
    ["an older advertising refusal", "opt-out", false, ANALYTICS_ONLY],
    ["an older advertising refusal", "opt-out", true, OFF],
    ["an older advertising refusal", "opt-in", false, OFF],
    ["an older advertising refusal", "opt-in", true, OFF],
  ] as const)("%s, %s regime, GPC %p", (stored, regime, gpc, expected) => {
    expect(resolveConsent({ ...STORED[stored], regime, gpc })).toEqual(expected);
  });
});

describe("categoriesToClearOnLoad", () => {
  test("a US visitor who clicked Got it, then turned GPC on, loses the trackers but keeps the choice", () => {
    const jar = ["NEXT_LOCALE", CONSENT_COOKIE, "_ga", "_ga_ZFZ6JLPFXN", "_fbp", "stampeo_attribution"];

    const cleared = cookieNamesToClear(
      categoriesToClearOnLoad({ record: GRANT, regime: "opt-out", gpc: true }),
      jar,
    );

    expect(new Set(cleared)).toEqual(
      new Set(["_ga", "_ga_ZFZ6JLPFXN", "_fbp", "stampeo_attribution"]),
    );
  });

  const BOTH = ["analytics", "marketing"];

  test.each([
    ["a US analytics-only grant under GPC clears both", { ...GRANT, marketing: false }, "opt-out", true, BOTH],
    ["a US refusal under GPC clears nothing", REFUSAL, "opt-out", true, []],
    ["a US grant without GPC clears nothing", GRANT, "opt-out", false, []],
    ["an EU grant under GPC clears nothing", GRANT, "opt-in", true, []],
  ] as const)("%s", (_case, record, regime, gpc, categories) => {
    expect(categoriesToClearOnLoad({ record, regime, gpc })).toEqual(categories);
  });
});

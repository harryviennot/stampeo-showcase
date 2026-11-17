/**
 * How PostHog treats a visitor: remembered between visits, and recorded.
 *
 * Remembered is what GA4 is allowed (a stored current-version grant where the visitor must opt in; in the United
 * States, anything short of a refusal or a Global Privacy Control signal). Recorded (recordings and heatmaps) is
 * narrower: only a visitor who SAID yes (a stored grant, never the United States default), and only on a page
 * where a tag may run. Each case starts from the cookie a real visitor holds.
 */

import { describe, expect, test } from "bun:test";

import {
  CONSENT_COOKIE,
  CONSENT_VERSION,
  consentRecordFromCookieHeader,
  consentSurface,
  priorConsentFromCookieHeader,
} from "../consent";
import { rowFor } from "../privacy/policy";
import { POLICY_MATRIX } from "../privacy/policy-matrix";
import { posthogMode } from "./mode";

const EU = rowFor("FR");
const UNKNOWN = rowFor(null);
const US = rowFor("US");

type Answer = 1 | 0 | -1;

/** The `Cookie:` header of a visitor who stored this choice, under this version, made in this policy row. */
function chose(analytics: Answer, version = CONSENT_VERSION, madeIn = "EEA_UK_CH", marketing: Answer = 1) {
  const regime = madeIn === "US" ? "opt-out" : "opt-in";
  const value = { v: version, a: analytics, m: marketing, t: 1_791_240_000, r: regime, g: madeIn };
  return `${CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify(value))}`;
}

function modeOf(row: typeof EU, header: string, options: { gpc?: boolean; pathname?: string } = {}) {
  return posthogMode({
    row,
    record: consentRecordFromCookieHeader(header),
    prior: priorConsentFromCookieHeader(header),
    gpc: options.gpc ?? false,
    pathname: options.pathname ?? "/pricing",
  });
}

const REMEMBERED_AND_RECORDED = { remember: true, record: true };
const REMEMBERED_ONLY = { remember: true, record: false };
const NEITHER = { remember: false, record: false };

describe("a visitor who must opt in (the EU, the UK, Switzerland, a country we cannot place)", () => {
  test.each([
    ["Europe", EU],
    ["somewhere we cannot place", UNKNOWN],
  ])("%s: no choice yet is neither remembered nor recorded", (_where, row) => {
    expect(modeOf(row, "")).toEqual(NEITHER);
    expect(modeOf(row, chose(-1))).toEqual(NEITHER);
  });

  test.each([
    ["Europe", EU],
    ["somewhere we cannot place", UNKNOWN],
  ])("%s: a stored grant under this version is remembered and recorded", (_where, row) => {
    expect(modeOf(row, chose(1))).toEqual(REMEMBERED_AND_RECORDED);
  });

  test("a refusal of analytics is neither, even when advertising was accepted", () => {
    expect(modeOf(EU, chose(0, CONSENT_VERSION, "EEA_UK_CH", 1))).toEqual(NEITHER);
  });

  test("Global Privacy Control does not take back a grant the visitor gave: it only stops a default", () => {
    expect(modeOf(EU, chose(1), { gpc: true })).toEqual(REMEMBERED_AND_RECORDED);
    expect(modeOf(EU, "", { gpc: true })).toEqual(NEITHER);
  });
});

describe("a grant stored under another version", () => {
  test.each([1, 2, 3, 4, CONSENT_VERSION - 1])("version %i: the grant is not carried, the visitor stays in memory", (version) => {
    expect(modeOf(EU, chose(1, version))).toEqual(NEITHER);
  });

  test("the banner asks again", () => {
    const header = chose(1, CONSENT_VERSION - 1);

    expect(
      consentSurface({
        record: consentRecordFromCookieHeader(header),
        prior: priorConsentFromCookieHeader(header),
        gpc: false,
        trackable: true,
        row: EU,
      }),
    ).toBe("banner");
  });

  test("a grant written by a newer build is not carried either", () => {
    expect(modeOf(EU, chose(1, CONSENT_VERSION + 1))).toEqual(NEITHER);
  });

  test.each([1, 2, 3, 4, CONSENT_VERSION - 1, CONSENT_VERSION + 1])(
    "a refusal under version %i still stands, in the United States too",
    (version) => {
      expect(modeOf(EU, chose(0, version))).toEqual(NEITHER);
      expect(modeOf(US, chose(0, version, "US"))).toEqual(NEITHER);
    },
  );

  test("an older grant in the United States leaves the default in force: remembered, not recorded", () => {
    expect(modeOf(US, chose(1, CONSENT_VERSION - 1, "US"))).toEqual(REMEMBERED_ONLY);
  });
});

describe("a visitor in the United States", () => {
  test("with no choice and no signal is remembered and never recorded", () => {
    expect(modeOf(US, "")).toEqual(REMEMBERED_ONLY);
    expect(modeOf(US, chose(-1, CONSENT_VERSION, "US"))).toEqual(REMEMBERED_ONLY);
  });

  test("who refused analytics is neither", () => {
    expect(modeOf(US, chose(0, CONSENT_VERSION, "US"))).toEqual(NEITHER);
  });

  test("who saved the dialog with analytics on is recorded as well", () => {
    expect(modeOf(US, chose(1, CONSENT_VERSION, "US", 0))).toEqual(REMEMBERED_AND_RECORDED);
  });

  test("whose browser sends Global Privacy Control is neither, whatever they stored", () => {
    expect(modeOf(US, "", { gpc: true })).toEqual(NEITHER);
    expect(modeOf(US, chose(1, CONSENT_VERSION, "US"), { gpc: true })).toEqual(NEITHER);
  });

  test("is only ever asked a question in the dialog: the row shows no banner or notice, so a stored grant was saved there", () => {
    // Recording rests on this: a notice that stored the default as a grant would start recordings.
    expect(POLICY_MATRIX.rows.US.surface).toBe("none");
  });

  test("a grant made in Europe travels with a visitor who is now in the United States", () => {
    expect(modeOf(US, chose(1, CONSENT_VERSION, "EEA_UK_CH"))).toEqual(REMEMBERED_AND_RECORDED);
  });

  test("a grant made in the United States does not follow a visitor into a row that must opt in", () => {
    expect(modeOf(EU, chose(1, CONSENT_VERSION, "US"))).toEqual(NEITHER);
  });
});

describe("the page decides recording, never remembering", () => {
  const RECORDABLE = [
    "/",
    "/fr",
    "/pricing",
    "/us/pricing",
    "/en/features/analytics",
    "/blog/how-loyalty-works",
    "/demo",
    "/uk",
  ];
  const PRIVATE_OR_NOT_OURS = [
    "/onboarding",
    "/fr/onboarding",
    "/login",
    "/en/reset-password",
    "/email-preferences",
    "/demo/wallet-select/k3J9xQ2mWvT8",
    "/en/demo/wallet-select/k3J9xQ2mWvT8",
    "/join/ABC123",
    "/usual-cafe",
    "/pl/usual-cafe",
    "/usual-cafe/l/rue-de-rivoli",
  ];

  test.each(RECORDABLE)("a visitor who said yes is recorded on %s", (pathname) => {
    expect(modeOf(EU, chose(1), { pathname })).toEqual(REMEMBERED_AND_RECORDED);
  });

  test.each(PRIVATE_OR_NOT_OURS)("a visitor who said yes is remembered on %s but not recorded", (pathname) => {
    expect(modeOf(EU, chose(1), { pathname })).toEqual(REMEMBERED_ONLY);
  });

  test.each(PRIVATE_OR_NOT_OURS)("a United States visitor with no choice is remembered on %s and not recorded", (pathname) => {
    expect(modeOf(US, "", { pathname })).toEqual(REMEMBERED_ONLY);
  });
});

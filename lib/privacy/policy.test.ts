/**
 * The policy resolver, from the visitor's side.
 *
 * Every case starts from a person (a US visitor with no choice, a French one
 * who refused, someone whose timezone we cannot place) and asks what the
 * resolver decides. The resolver is pure, so none of this needs a browser.
 *
 * Two rules decide every expectation:
 *   - what we cannot place is held to the strict (opt-in) row;
 *   - a signal can only ever tighten, never loosen: the effective row is the
 *     stricter of the server's country and the timezone's.
 */

import { describe, expect, test } from "bun:test";

import {
  CONSENT_VERSION,
  type ConsentRecord,
  type PriorConsent,
} from "../consent";
import { SUBJECT } from "./__fixtures__/fake-browser";
import { POLICY_MATRIX, buildPolicyMatrix } from "./policy-matrix";
import raw from "./policy-matrix.v1.json";
import {
  consentMaxAgeSeconds,
  effectiveRow,
  recordRow,
  gpcDeniedCategories,
  readServerRegion,
  resolveWithPolicy,
  rowFor,
  strictestRow,
  subjectGateOpen,
  surfaceWithPolicy,
} from "./policy";

const ON = { analytics: true, marketing: true };
const OFF = { analytics: false, marketing: false };
const DAY = 86_400;

function region(value: unknown): string {
  return `stampeo_region=${encodeURIComponent(JSON.stringify(value))}`;
}

describe("rowFor", () => {
  test.each([
    ["FR", "EEA_UK_CH"],
    ["DE", "EEA_UK_CH"],
    ["GB", "EEA_UK_CH"],
    ["CH", "EEA_UK_CH"],
    ["NO", "EEA_UK_CH"],
    ["IS", "EEA_UK_CH"],
    ["PL", "EEA_UK_CH"],
    ["US", "US"],
    [" us ", "US"],
    ["fr", "EEA_UK_CH"],
    // An unvetted country, a US territory, and everything we cannot read.
    ["CA", "UNKNOWN"],
    ["BR", "UNKNOWN"],
    ["PR", "UNKNOWN"],
    ["GU", "UNKNOWN"],
    ["USA", "UNKNOWN"],
    ["U", "UNKNOWN"],
    ["", "UNKNOWN"],
    [null, "UNKNOWN"],
    [undefined, "UNKNOWN"],
  ] as const)("%p is the %s row", (country, key) => {
    expect(rowFor(country).key).toBe(key);
  });
});

describe("readServerRegion", () => {
  test("reads a region the proxy wrote, among other cookies", () => {
    const header = `NEXT_LOCALE=fr; ${region({ c: "FR", v: 1 })}; stampeo_market=us`;
    expect(readServerRegion(header)).toBe("FR");
  });

  test.each([
    ["an unknown version", region({ c: "US", v: 2 })],
    ["no version", region({ c: "US" })],
    ["a lowercase country", region({ c: "us", v: 1 })],
    ["a three-letter country", region({ c: "USA", v: 1 })],
    ["a numeric country", region({ c: 1, v: 1 })],
    ["an array", region(["US", 1])],
    ["a bare string", region("US")],
    ["broken JSON", "stampeo_region=%7Bnope"],
    ["broken percent-encoding", "stampeo_region=%"],
    ["an empty value", "stampeo_region="],
    ["a cookie that merely ends in our name", `x_${region({ c: "US", v: 1 })}`],
  ])("a forged or malformed cookie is ignored: %s", (_case, header) => {
    expect(readServerRegion(header)).toBeNull();
  });

  test("no cookie, no header", () => {
    expect(readServerRegion("NEXT_LOCALE=fr")).toBeNull();
    expect(readServerRegion("")).toBeNull();
    expect(readServerRegion(null)).toBeNull();
    expect(readServerRegion(undefined)).toBeNull();
  });
});

describe("effectiveRow: the stricter of the server and the timezone", () => {
  test.each([
    // The interim, until the proxy writes a region: timezone alone.
    ["a French timezone", null, "FR", "EEA_UK_CH"],
    ["a British timezone", null, "GB", "EEA_UK_CH"],
    ["a Swiss timezone", null, "CH", "EEA_UK_CH"],
    ["a Norwegian timezone", null, "NO", "EEA_UK_CH"],
    ["a US timezone", null, "US", "US"],
    ["an unmapped timezone", null, null, "UNKNOWN"],
    // The Cloudflare phase: the server's country decides on its own.
    ["a server region of France, timezone unreadable", "FR", null, "EEA_UK_CH"],
    ["a server region of the US, timezone unreadable", "US", null, "US"],
    ["a server region of France, whatever the timezone says", "FR", "US", "EEA_UK_CH"],
    // Strictest wins, both ways round.
    ["a server region of the US with a Paris timezone", "US", "FR", "EEA_UK_CH"],
    ["a server region of the US with a Canadian timezone", "US", "CA", "UNKNOWN"],
    ["a server region of Canada with a US timezone", "CA", "US", "UNKNOWN"],
    ["agreeing US signals", "US", "US", "US"],
    // A tie keeps the server row.
    ["two opt-in rows that differ: server first", "FR", "BR", "EEA_UK_CH"],
    ["two opt-in rows that differ: server unvetted", "BR", "FR", "UNKNOWN"],
  ] as const)("%s", (_case, serverCountry, timezoneCountry, key) => {
    expect(effectiveRow({ serverCountry, timezoneCountry }).key).toBe(key);
  });

  test("a forged region cookie is ignored and the timezone decides", () => {
    const forged = readServerRegion(region({ c: "FR", v: 99 }));
    expect(effectiveRow({ serverCountry: forged, timezoneCountry: "US" }).key).toBe("US");
    expect(effectiveRow({ serverCountry: forged, timezoneCountry: null }).key).toBe("UNKNOWN");
  });

  test("strictestRow with both signals missing is the UNKNOWN row", () => {
    expect(strictestRow(null, null).key).toBe("UNKNOWN");
    expect(strictestRow(rowFor("US"), null).key).toBe("US");
    expect(strictestRow(null, rowFor("US")).key).toBe("US");
  });
});

const RECORD: ConsentRecord = {
  v: CONSENT_VERSION,
  analytics: true,
  marketing: true,
  at: 1_759_000_000,
  regime: "opt-out",
};
const record = (analytics: boolean, marketing: boolean): ConsentRecord => ({
  ...RECORD,
  analytics,
  marketing,
});
/** A choice made where consent is asked for first, as a European or an unplaced visitor makes it. */
const optIn = (analytics: boolean, marketing: boolean): ConsentRecord => ({
  ...record(analytics, marketing),
  regime: "opt-in",
});
const older = (analytics: boolean, marketing: boolean): PriorConsent => ({
  v: CONSENT_VERSION - 1,
  analytics,
  marketing,
  at: 1_758_000_000,
});

describe("resolveWithPolicy: what a visitor is taken to have agreed to", () => {
  test.each([
    // [visitor, country, stored choice, older choice, GPC, expected]
    ["a US visitor with no choice", "US", null, null, false, ON],
    ["a US visitor with GPC and no choice", "US", null, null, true, OFF],
    ["a US visitor with GPC over a recorded grant", "US", record(true, true), null, true, OFF],
    ["a US visitor who refused everything", "US", record(false, false), null, false, OFF],
    ["a US visitor who refused marketing only", "US", record(true, false), null, false, { analytics: true, marketing: false }],
    ["a US visitor with an older advertising refusal", "US", null, older(true, false), false, { analytics: true, marketing: false }],
    ["a US visitor with an older refusal of everything", "US", null, older(false, false), false, OFF],
    ["a US visitor with an older grant", "US", null, older(true, true), false, ON],
    ["a French visitor who accepted", "FR", optIn(true, true), null, false, ON],
    ["a French visitor who refused", "FR", optIn(false, false), null, false, OFF],
    ["a French visitor with no choice", "FR", null, null, false, OFF],
    ["a French visitor with GPC and no choice", "FR", null, null, true, OFF],
    ["a French visitor with GPC who accepted", "FR", optIn(true, true), null, true, ON],
    ["a French visitor with an older grant", "FR", null, older(true, true), false, OFF],
    ["a visitor we cannot place, no choice", "BR", null, null, false, OFF],
    ["a visitor we cannot place, who accepted", "BR", optIn(true, true), null, false, ON],
  ] as const)("%s", (_visitor, country, stored, prior, gpc, expected) => {
    expect(
      resolveWithPolicy({ row: rowFor(country), record: stored, prior, gpc }),
    ).toEqual(expected);
  });

  test("an older refusal never becomes a grant, whatever the version", () => {
    for (const v of [1, CONSENT_VERSION - 1]) {
      const prior = { ...older(false, false), v };
      expect(resolveWithPolicy({ row: rowFor("US"), record: null, prior, gpc: false })).toEqual(OFF);
      expect(resolveWithPolicy({ row: rowFor("FR"), record: null, prior, gpc: false })).toEqual(OFF);
    }
  });

  test("a policy-version bump changes nothing about a stored choice (AC2.3)", () => {
    const bumped = buildPolicyMatrix({ ...raw, version: POLICY_MATRIX.version + 1 });
    const refusal = { ...record(false, false), policyVersion: POLICY_MATRIX.version };

    for (const country of ["US", "FR"]) {
      const row = rowFor(country, bumped);
      expect(resolveWithPolicy({ row, record: refusal, prior: null, gpc: false }, bumped)).toEqual(OFF);
    }
  });
});

describe("analytics under a US opt-out is a matrix setting", () => {
  const serviceProvider = buildPolicyMatrix({
    ...raw,
    analytics_under_us_opt_out: "service_provider",
  });
  const us = rowFor("US", serviceProvider);

  test("while it is off, GPC denies analytics as well as marketing", () => {
    expect(POLICY_MATRIX.analytics_under_us_opt_out).toBe("off");
    expect(gpcDeniedCategories(rowFor("US"), true)).toEqual(["analytics", "marketing"]);
  });

  test("as a service provider, GPC denies marketing only and analytics follows the choice", () => {
    expect(gpcDeniedCategories(us, true, serviceProvider)).toEqual(["marketing"]);
    const resolve = (stored: ConsentRecord | null, prior: PriorConsent | null = null) =>
      resolveWithPolicy({ row: us, record: stored, prior, gpc: true }, serviceProvider);

    expect(resolve(null)).toEqual({ analytics: true, marketing: false });
    expect(resolve(record(true, true))).toEqual({ analytics: true, marketing: false });
    expect(resolve(record(false, true))).toEqual(OFF);
    expect(resolve(null, older(false, true))).toEqual(OFF);
  });

  test("GPC changes nothing in a row it does not override", () => {
    expect(gpcDeniedCategories(rowFor("FR"), true)).toEqual([]);
    expect(gpcDeniedCategories(rowFor("US"), false)).toEqual([]);
  });
});

describe("surfaceWithPolicy", () => {
  const base = { record: null, prior: null, gpc: false, trackable: true } as const;

  test.each([
    ["a US visitor with no choice sees the notice", "US", {}, "notice"],
    ["a French visitor with no choice sees the banner", "FR", {}, "banner"],
    ["a visitor we cannot place sees the banner", "BR", {}, "banner"],
    ["GPC silences the US notice", "US", { gpc: true }, "none"],
    ["GPC does not silence the EU banner", "FR", { gpc: true }, "banner"],
    ["a stored choice silences both", "US", { record: record(false, false) }, "none"],
    ["an older refusal of everything leaves nothing to ask", "FR", { prior: older(false, false) }, "none"],
    ["an untrackable page shows nothing", "FR", { trackable: false }, "none"],
  ] as const)("%s", (_case, country, overrides, expected) => {
    expect(surfaceWithPolicy({ ...base, ...overrides, row: rowFor(country) })).toBe(expected);
  });
});

describe("how long a choice lives", () => {
  test.each([
    ["a US refusal of everything", "US", OFF, 400],
    ["a US refusal of marketing alone", "US", { analytics: true, marketing: false }, 400],
    ["a US grant", "US", ON, 182],
    ["a French refusal", "FR", OFF, 182],
    ["a French partial refusal", "FR", { analytics: true, marketing: false }, 182],
    ["a French grant", "FR", ON, 182],
  ] as const)("%s lasts %d days", (_case, country, state, days) => {
    expect(consentMaxAgeSeconds(rowFor(country), state)).toBe(days * DAY);
  });
});

describe("the row a stored choice was made under", () => {
  test.each([
    ["names its row", { regime: "opt-out", regionRow: "US" }, "US"],
    ["names a row that disagrees with its regime: the row wins", { regime: "opt-in", regionRow: "US" }, "US"],
    ["names no row, and is opt-out", { regime: "opt-out" }, "US"],
    ["names no row, and is opt-in", { regime: "opt-in" }, "UNKNOWN"],
    ["names a row we do not have", { regime: "opt-out", regionRow: "MARS" }, "US"],
  ] as const)("a record that %s", (_case, stored, key) => {
    expect(recordRow(stored).key).toBe(key);
  });
});

describe("the subject gate", () => {
  test("a row that mints before tags holds them back until the subject exists", () => {
    expect(subjectGateOpen(rowFor("US"), null)).toBe(false);
    expect(subjectGateOpen(rowFor("US"), SUBJECT)).toBe(true);
  });

  test("a row that mints at the first decision does not wait", () => {
    expect(subjectGateOpen(rowFor("FR"), null)).toBe(true);
    expect(subjectGateOpen(rowFor("BR"), null)).toBe(true);
  });
});

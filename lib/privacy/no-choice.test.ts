/**
 * A stored answer of `-1` is "no choice", and a grant only counts where it was
 * given.
 *
 * Two records reach the marketing site that are not a click on its banner:
 *
 *   - the web dashboard's restore, `{a:-1,m:0,r:"opt-out",o:"restore"}`, which
 *     brings a refusal made elsewhere into this browser without inventing an
 *     answer for the category nobody refused;
 *   - a US notice dismissal (`r:"opt-out"`, both on), which says "I saw the
 *     notice" and nothing about a regime that asks for consent.
 *
 * Each case starts from that record in a real cookie jar and a real timezone,
 * and asks what the page decides, what the visitor is shown, what a capture
 * rests on, and what survives the privacy route and the sliding refresh.
 */

import { afterEach, describe, expect, test } from "bun:test";

import { NO_LIVE_IDS, planCapture } from "../attribution/capture";
import { captureConsentEvidence, consentEvidence } from "../attribution/evidence";
import { META_LANDING } from "../attribution/__fixtures__/visitors";
import {
  CONSENT_VERSION,
  consentRecordFromCookieHeader,
  consentSnapshotKey,
  consentSurface,
  parseConsentCookie,
  readStoredConsent,
  writeConsentRecord,
  type ConsentRecord,
} from "../consent";
import { shouldLoadGa } from "../google-analytics";
import { shouldLoadMetaPixel } from "../meta-pixel";
import { installFakeBrowser, SUBJECT, type FakeBrowser } from "./__fixtures__/fake-browser";
import { noticeAcknowledgement } from "./choices-ui";
import { runPageLifecycle } from "./lifecycle";
import { resolveWithPolicy, rowFor, surfaceWithPolicy } from "./policy";
import { detectPolicyRow } from "./region";
import { readConsentSnapshot } from "./snapshot";

const US = rowFor("US");
const EU = rowFor("FR");
const UNKNOWN = rowFor(null);
const ON = { analytics: true, marketing: true };
const OFF = { analytics: false, marketing: false };

/** What the web dashboard writes when it restores a server-side marketing refusal (AC2.4). */
const RESTORED = { v: CONSENT_VERSION, a: -1, m: 0, t: 1_791_244_000, r: "opt-out", s: SUBJECT, o: "restore" };
const cookieOf = (record: object) => `stampeo_consent=${encodeURIComponent(JSON.stringify(record))}`;
const RESTORED_COOKIE = cookieOf(RESTORED);

let browser: FakeBrowser | null = null;
afterEach(() => {
  browser?.restore();
  browser = null;
});

/** A page load: what the resolver decides, and what the visitor is shown. */
function visit(cookie: string, timezone: string, options: { gpc?: boolean } = {}) {
  browser = installFakeBrowser({ cookie: `stampeo_sid=${SUBJECT}; ${cookie}`, timezone, fetch: "route", ...options });
  const snapshot = readConsentSnapshot();
  const row = detectPolicyRow();
  return {
    snapshot,
    row,
    state: { analytics: snapshot.analytics, marketing: snapshot.marketing },
    surface: consentSurface({
      record: snapshot.record,
      prior: snapshot.prior,
      gpc: snapshot.gpc,
      trackable: true,
      row,
    }),
  };
}

describe("the record the web dashboard restores (AC2.4)", () => {
  test("reads as a refusal of marketing and no choice about analytics", () => {
    expect(consentRecordFromCookieHeader(RESTORED_COOKIE)).toMatchObject({
      v: CONSENT_VERSION,
      analytics: null,
      marketing: false,
      at: RESTORED.t,
      regime: "opt-out",
      subjectId: SUBJECT,
      origin: "restore",
    });
  });

  test.each([
    ["a US visitor", "America/New_York", true, "none"],
    ["a French visitor", "Europe/Paris", false, "banner"],
    ["a visitor whose timezone we cannot place", "Antarctica/Troll", false, "banner"],
  ])("%s: analytics %p, marketing refused, surface %s", (_who, timezone, analytics, surface) => {
    const page = visit(RESTORED_COOKIE, timezone);

    expect(page.state).toEqual({ analytics, marketing: false });
    expect(page.surface).toBe(surface);
  });

  test("a US visitor under GPC has both denied, whatever was restored", () => {
    expect(visit(RESTORED_COOKIE, "America/New_York", { gpc: true }).state).toEqual(OFF);
  });

  test("the same record is read against the row the visitor is in NOW", () => {
    const record = parseConsentCookie(encodeURIComponent(JSON.stringify(RESTORED)))!;
    const resolve = (row: typeof US) => resolveWithPolicy({ row, record, prior: null, gpc: false });

    expect(resolve(US)).toEqual({ analytics: true, marketing: false });
    expect(resolve(EU)).toEqual(OFF);
  });
});

describe("a value that is not 1, 0 or -1 is no record", () => {
  test.each([2, "x", null, 1.5, true])("%p in either position drops the record", (value) => {
    for (const [a, m] of [[value, 0], [0, value]]) {
      expect(parseConsentCookie(encodeURIComponent(JSON.stringify({ ...RESTORED, a, m })))).toBeNull();
    }
  });

  test("an origin other than `restore` is ignored, and the choice stands", () => {
    const parsed = parseConsentCookie(encodeURIComponent(JSON.stringify({ ...RESTORED, a: 1, o: "banner" })));
    expect(parsed).toMatchObject({ analytics: true, marketing: false });
    expect(parsed?.origin).toBeUndefined();
  });
});

describe("what is shown for a record with a category undecided", () => {
  const record = (analytics: boolean | null, marketing: boolean | null, extra: Partial<ConsentRecord> = {}): ConsentRecord => ({
    v: CONSENT_VERSION,
    analytics,
    marketing,
    at: 1_791_244_000,
    regime: "opt-out",
    ...extra,
  });
  const surface = (row: typeof US, stored: ConsentRecord) =>
    surfaceWithPolicy({ row, record: stored, prior: null, gpc: false, trackable: true });

  test.each([
    ["an opt-in row asks about the category nobody answered", EU, record(null, false), "banner"],
    ["an opt-in row that is also unplaced does too", UNKNOWN, record(null, false), "banner"],
    ["the US row shows nothing: the refusal was the choice", US, record(null, false), "none"],
    ["an opt-in row has nothing left to ask when both are refused", EU, record(false, false), "none"],
    ["an opt-in row asks when one category is undecided and the other granted", EU, record(true, null, { regime: "opt-in" }), "banner"],
  ])("%s", (_case, row, stored, expected) => {
    expect(surface(row, stored)).toBe(expected);
  });
});

describe("a grant counts only where the visitor could have given it", () => {
  const dismissedInNewYork: ConsentRecord = {
    v: CONSENT_VERSION,
    analytics: true,
    marketing: true,
    at: 1_791_244_000,
    regime: "opt-out",
    regionRow: "US",
    policyVersion: 1,
    subjectId: SUBJECT,
  };
  const acceptedInParis: ConsentRecord = { ...dismissedInNewYork, regime: "opt-in", regionRow: "EEA_UK_CH" };
  const resolve = (row: typeof US, record: ConsentRecord) =>
    resolveWithPolicy({ row, record, prior: null, gpc: false });

  test.each([
    ["a US notice dismissal, once the visitor is in an opt-in row", EU, dismissedInNewYork, OFF, "banner"],
    ["a US notice dismissal, once the visitor cannot be placed", UNKNOWN, dismissedInNewYork, OFF, "banner"],
    ["a US notice dismissal, in the US", US, dismissedInNewYork, ON, "none"],
    ["an opt-in acceptance, travelling to the US", US, acceptedInParis, ON, "none"],
    ["an opt-in acceptance, in the EU", EU, acceptedInParis, ON, "none"],
  ])("%s", (_case, row, record, state, shown) => {
    expect(resolve(row, record)).toEqual(state);
    expect(surfaceWithPolicy({ row, record, prior: null, gpc: false, trackable: true })).toBe(shown);
  });

  test("a refusal stands in every row", () => {
    const refusedInNewYork = { ...dismissedInNewYork, analytics: false };
    for (const row of [US, EU, UNKNOWN]) {
      expect(resolve(row, refusedInNewYork).analytics).toBe(false);
    }
    expect(resolve(US, refusedInNewYork)).toEqual({ analytics: false, marketing: true });
    expect(resolve(EU, refusedInNewYork)).toEqual(OFF);
  });

  test("a record that names no row is read by its regime", () => {
    const { regionRow: _row, ...unnamed } = dismissedInNewYork;
    expect(resolve(EU, unnamed)).toEqual(OFF);
    expect(resolve(US, unnamed)).toEqual(ON);
  });

  test("dismiss the US notice in New York, move to Paris, reload: no tag, the banner, no EU evidence", async () => {
    browser = installFakeBrowser({ timezone: "America/New_York", fetch: "route" });
    runPageLifecycle("/us/pricing", { refreshed: false });
    const inNewYork = readConsentSnapshot();
    expect(inNewYork).toMatchObject({ analytics: true, marketing: true, ready: true });

    const dismissed = writeConsentRecord(noticeAcknowledgement(inNewYork), US);
    await browser.settled();
    const jar = browser.jar();
    browser.restore();

    browser = installFakeBrowser({ cookie: jar, timezone: "Europe/Paris", fetch: "route" });
    const inParis = readConsentSnapshot();
    const row = detectPolicyRow();

    expect({ analytics: inParis.analytics, marketing: inParis.marketing }).toEqual(OFF);
    expect(shouldLoadGa({ measurementId: "G-ZFZ6JLPFXN", analytics: inParis.analytics, ready: inParis.ready, trackable: true })).toBe(false);
    expect(shouldLoadMetaPixel({ pixelId: "1088158323750710", marketing: inParis.marketing, ready: inParis.ready, trackable: true })).toBe(false);
    expect(consentSurface({ record: inParis.record, prior: inParis.prior, gpc: false, trackable: true, row })).toBe("banner");

    // What a capture would rest on cites the New York dismissal, never Paris.
    const evidence = consentEvidence({ record: inParis.record, prior: inParis.prior, row: row.key })!;
    expect(evidence).toMatchObject({ cr: "opt-out", g: "US", ca: 0 });
    expect(evidence.ca).not.toBe(dismissed.at);
    const written = planCapture({
      landing: META_LANDING,
      consent: { analytics: inParis.analytics, marketing: inParis.marketing },
      evidence,
      live: NO_LIVE_IDS,
      stored: { src: null, ga: null, ad: null },
      now: dismissed.at + 60,
    });
    expect(written).toEqual({ src: null, ga: null, ad: null });
    expect(browser.writes.filter((w) => w.startsWith("stampeo_src=") || w.startsWith("stampeo_ad="))).toEqual([]);
  });
});

describe("the evidence a capture rests on cites the record's own row and its own click", () => {
  const record = (over: Partial<ConsentRecord>): ConsentRecord => ({
    v: CONSENT_VERSION,
    analytics: true,
    marketing: true,
    at: 1_791_244_000,
    regime: "opt-in",
    regionRow: "EEA_UK_CH",
    ...over,
  });

  test.each([
    ["an opt-in acceptance is the visitor's click", record({}), 1_791_244_000],
    ["an opt-in refusal of one category is a click", record({ marketing: false }), 1_791_244_000],
    ["a restored record has no click, whatever `t` says", record({ analytics: null, marketing: false, regime: "opt-out", regionRow: undefined, origin: "restore" }), 0],
    ["a record with a category undecided has no click", record({ analytics: true, marketing: null }), 0],
    ["a US notice dismissal is no click", record({ regime: "opt-out", regionRow: "US" }), 0],
    ["a US refusal of advertising is a click", record({ regime: "opt-out", regionRow: "US", marketing: false }), 1_791_244_000],
  ])("%s", (_case, stored, consentAt) => {
    expect(captureConsentEvidence(stored, null)).toEqual({ consentVersion: CONSENT_VERSION, consentAt });
  });

  test("the regime and row are the record's, whatever row the visitor is in now", () => {
    const dismissed = record({ regime: "opt-out", regionRow: "US" });
    expect(consentEvidence({ record: dismissed, prior: null, row: "EEA_UK_CH" })).toMatchObject({ cr: "opt-out", g: "US" });
    expect(consentEvidence({ record: record({}), prior: null, row: "US" })).toMatchObject({ cr: "opt-in", g: "EEA_UK_CH" });
  });

  test("a restored record names no row, so its regime names it: the US row", () => {
    const restored = parseConsentCookie(encodeURIComponent(JSON.stringify(RESTORED)))!;
    expect(consentEvidence({ record: restored, prior: null, row: "US" })).toMatchObject({
      cv: CONSENT_VERSION,
      cr: "opt-out",
      ca: 0,
      g: "US",
    });
  });

  test("a visitor with no record is evidenced by the row they are in", () => {
    expect(consentEvidence({ record: null, prior: null, row: "US" })).toMatchObject({ cr: "opt-out", g: "US", ca: 0 });
  });
});

describe("the privacy route and the sliding refresh keep a restored record as it is", () => {
  test("the sliding refresh re-posts the same record, and the route sets it back unchanged", async () => {
    browser = installFakeBrowser({
      cookie: `stampeo_sid=${SUBJECT}; ${RESTORED_COOKIE}`,
      timezone: "America/New_York",
      fetch: "route",
    });

    runPageLifecycle("/us/pricing", { refreshed: false });
    await browser.settled();

    expect(browser.fetches[0].body).toMatchObject({ sid: "ensure", consent: RESTORED });
    expect(browser.events).toContain("server-set:stampeo_consent");
    const { record } = readStoredConsent();
    expect(record).toMatchObject({ analytics: null, marketing: false, origin: "restore", at: RESTORED.t });
  });
});

describe("a visitor's own action replaces the restored record with a full choice", () => {
  test("`Got it` on the US notice never turns a restored refusal into a grant", async () => {
    const page = visit(RESTORED_COOKIE, "America/New_York");
    runPageLifecycle("/us/pricing", { refreshed: false });
    await browser!.settled();

    const record = writeConsentRecord(noticeAcknowledgement(page.snapshot), US);
    await browser!.settled();

    // Analytics takes the row default, marketing keeps its refusal, and the
    // record is the visitor's now: no longer a restore.
    expect(record).toMatchObject({ analytics: true, marketing: false });
    expect(record.origin).toBeUndefined();
    const after = readConsentSnapshot();
    expect({ analytics: after.analytics, marketing: after.marketing }).toEqual({ analytics: true, marketing: false });
    expect(shouldLoadMetaPixel({ pixelId: "1088158323750710", marketing: after.marketing, ready: after.ready, trackable: true })).toBe(false);
    expect(readStoredConsent().record).toMatchObject({ analytics: true, marketing: false });
  });

  test("Save in the dialog replaces a restore with exactly what was chosen", () => {
    visit(RESTORED_COOKIE, "America/New_York");

    const record = writeConsentRecord({ analytics: false, marketing: false }, US);

    expect(record).toMatchObject({ analytics: false, marketing: false });
    expect(record.origin).toBeUndefined();
    expect(readStoredConsent().record).toMatchObject({ analytics: false, marketing: false });
  });
});

describe("the snapshot is rebuilt when an answer becomes no choice", () => {
  const record: ConsentRecord = {
    v: CONSENT_VERSION,
    analytics: true,
    marketing: false,
    at: 1_791_244_000,
    regime: "opt-out",
  };
  const key = (stored: ConsentRecord) =>
    consentSnapshotKey({ record: stored, prior: null, gpc: false, row: "US", ready: true });

  test("granted, refused and no choice are three different keys", () => {
    const keys = [true, false, null].map((analytics) => key({ ...record, analytics }));
    expect(new Set(keys).size).toBe(3);
  });

  test("a restored record is not the same as one the visitor made", () => {
    expect(key({ ...record, origin: "restore" })).not.toBe(key(record));
  });
});

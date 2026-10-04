/**
 * The decisions `AttributionCapture` makes around `buildAttributionRecord`:
 * which consent evidence a capture carries, and whether an arrival is worth
 * waiting for the tags' browser ids at all.
 */

import { describe, expect, test } from "bun:test";
import {
  CONSENT_COOKIE,
  CONSENT_VERSION,
  consentRecordFromCookieHeader,
  priorConsentFromCookieHeader,
  resolveConsent,
  type ConsentRecord,
  type PriorConsent,
} from "./consent";
import {
  buildAttributionRecord,
  captureConsentEvidence,
  serializeAttributionCookie,
  shouldCaptureArrival,
  type AttributionRecord,
} from "./ad-attribution";

describe("captureConsentEvidence", () => {
  const CURRENT: ConsentRecord = {
    v: CONSENT_VERSION,
    analytics: true,
    marketing: true,
    at: 1_759_000_000,
    regime: "opt-in",
  };
  const OLDER: PriorConsent = { v: 2, analytics: true, marketing: false, at: 1_759_400_000 };

  test.each([
    [
      "a visitor who chose carries their own choice",
      CURRENT,
      null,
      { consentVersion: CONSENT_VERSION, consentAt: 1_759_000_000 },
    ],
    [
      "a visitor whose only choice is older carries that choice",
      null,
      OLDER,
      { consentVersion: 2, consentAt: 1_759_400_000 },
    ],
    [
      // Nobody clicked: the version is the notice text shown, with no moment.
      "a US visitor under the notice default carries the text in force and no moment",
      null,
      null,
      { consentVersion: CONSENT_VERSION, consentAt: 0 },
    ],
    ["an older choice with no moment is no evidence", null, { ...OLDER, at: 0 }, null],
  ])("%s", (_case, record, prior, evidence) => {
    expect(captureConsentEvidence(record, prior)).toEqual(evidence);
  });
});

describe("a US visitor who refused advertising under version 2 and kept analytics", () => {
  /**
   * What an organic landing on /us writes into the attribution cookie, decoded,
   * for a visitor carrying this consent cookie. `cookie` is null when nothing is
   * captured, the way `AttributionCapture` stops on null evidence.
   */
  function organicLanding(choice: Record<string, unknown>) {
    const header = `NEXT_LOCALE=en; ${CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify(choice))}`;
    const record = consentRecordFromCookieHeader(header);
    const prior = priorConsentFromCookieHeader(header);
    const consent = resolveConsent({ record, prior, regime: "opt-out", gpc: false });
    const evidence = captureConsentEvidence(record, prior);
    const captured =
      evidence &&
      buildAttributionRecord({
        search: "",
        gaClientId: "GA1.1.1234567890.1700000000",
        fbp: null,
        landingPath: "/us",
        landingVariant: null,
        referrer: null,
        consent,
        consentRegime: "opt-out",
        ...evidence,
        capturedAt: 1_759_500_000,
      });
    return {
      consent,
      cookie: captured
        ? JSON.parse(decodeURIComponent(serializeAttributionCookie(captured)))
        : null,
    };
  }

  test("an organic landing carries the version-2 choice, never the never-chose shape", () => {
    // `cv:3, ca:0, cr:"opt-out"` is what the backend reads as the opt-out
    // default, which grants advertising this visitor refused.
    const { consent, cookie } = organicLanding({
      v: 2,
      a: 1,
      m: 0,
      t: 1_759_400_000,
      r: "opt-out",
    });

    expect(consent).toEqual({ analytics: true, marketing: false });
    expect({ cv: cookie.cv, ca: cookie.ca, cr: cookie.cr, cc: cookie.cc }).toEqual({
      cv: 2,
      ca: 1_759_400_000,
      cr: "opt-out",
      cc: "analytics",
    });
    expect([cookie.cv, cookie.ca]).not.toEqual([CONSENT_VERSION, 0]);
  });

  test.each([undefined, 0, -1, "1759400000"])(
    "a version-2 cookie with moment %p captures nothing, and its refusal still stands",
    (t) => {
      const { consent, cookie } = organicLanding({ v: 2, a: 1, m: 0, t, r: "opt-out" });

      expect(consent).toEqual({ analytics: true, marketing: false });
      expect(cookie).toBeNull();
    },
  );
});

describe("shouldCaptureArrival — before waiting for the browser ids", () => {
  /** What a landing with this query builds before any tag cookie exists. */
  const arrival = (
    search: string,
    capturedAt: number,
    consent = { analytics: true, marketing: true },
  ) =>
    buildAttributionRecord({
      search,
      gaClientId: null,
      fbp: null,
      landingPath: "/pricing",
      landingVariant: null,
      referrer: null,
      consent,
      consentRegime: "opt-in",
      consentVersion: CONSENT_VERSION,
      consentAt: 1_759_000_000,
      capturedAt,
    });

  const stored = (search: string) => arrival(search, 1_759_000_100) as AttributionRecord;

  test.each([
    ["nothing stored, an organic visit: captured", null, "", true],
    ["a stored direct record, then a Meta click: captured", "", "?fbclid=f-new", true],
    ["a stored Google click, then an organic visit: stopped", "?gclid=g-old", "", false],
    ["a stored Meta click, then the same click again: stopped", "?fbclid=f-old", "?fbclid=f-old", false],
  ])("%s", (_case, storedSearch, landingSearch, captured) => {
    expect(
      shouldCaptureArrival(
        storedSearch === null ? null : stored(storedSearch),
        arrival(landingSearch, 1_759_086_400),
      ),
    ).toBe(captured);
  });

  test("an arrival nothing permits capturing replaces nothing", () => {
    // Marketing only and no ad click: there is no record to build.
    const nothing = arrival("", 1_759_086_400, { analytics: false, marketing: true });

    expect(nothing).toBeNull();
    expect(shouldCaptureArrival(stored(""), nothing)).toBe(false);
  });
});

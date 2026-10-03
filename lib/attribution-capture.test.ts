/**
 * The decisions `AttributionCapture` makes around `buildAttributionRecord`:
 * which consent evidence a capture carries, and whether an arrival is worth
 * waiting for the tags' browser ids at all.
 */

import { describe, expect, test } from "bun:test";
import { CONSENT_VERSION, type ConsentRecord } from "./consent";
import {
  buildAttributionRecord,
  captureConsentEvidence,
  shouldCaptureArrival,
  type AttributionRecord,
} from "./ad-attribution";

describe("captureConsentEvidence", () => {
  test("a visitor who chose carries their own choice as evidence", () => {
    const record: ConsentRecord = {
      v: CONSENT_VERSION,
      analytics: true,
      marketing: true,
      at: 1_759_000_000,
      regime: "opt-in",
    };

    expect(captureConsentEvidence(record)).toEqual({
      consentVersion: CONSENT_VERSION,
      consentAt: 1_759_000_000,
    });
  });

  test("a US visitor under the notice default carries the text in force and no moment", () => {
    // No click was made, so there is no consent time to record; the version is
    // the notice text the visitor was shown.
    expect(captureConsentEvidence(null)).toEqual({
      consentVersion: CONSENT_VERSION,
      consentAt: 0,
    });
  });
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

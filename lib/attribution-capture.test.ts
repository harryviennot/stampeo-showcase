/**
 * The decisions `AttributionCapture` makes around `buildAttributionRecord`:
 * which consent evidence a capture carries.
 */

import { describe, expect, test } from "bun:test";
import { CONSENT_VERSION, type ConsentRecord } from "./consent";
import { captureConsentEvidence } from "./ad-attribution";

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

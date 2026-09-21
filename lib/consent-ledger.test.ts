/**
 * Reporting a consent decision to the ledger (STA-324).
 *
 * The cookie is what APPLIES the choice; this is only what PROVES it. That
 * ordering decides every rule below.
 *
 * 1. NEVER BLOCK THE VISITOR. By the time this runs the cookie is written and
 *    the banner has closed. A failed report costs one row of evidence, and
 *    must cost nothing else — no throw, no error shown, no retry storm.
 *
 * 2. IT HAS TO SURVIVE THE RELOAD. Revoking consent reloads the page (a
 *    running gtag cannot be unloaded), which cancels an in-flight `fetch`.
 *    `sendBeacon` exists for exactly this and is why a revocation — the single
 *    most important decision to be able to prove — does not vanish.
 *
 * 3. THE PAYLOAD IS A CONTRACT. `validate_decision` in
 *    `backend/app/services/consent_ledger.py` allowlists every field and drops
 *    the row if one is wrong, silently, with a 204. A drifted key here would
 *    therefore look exactly like success.
 */

import { afterEach, describe, expect, test } from "bun:test";
import { CONSENT_VERSION, type ConsentRecord } from "./consent";
import {
  buildConsentPayload,
  consentLedgerEndpoint,
  recordConsentDecision,
} from "./consent-ledger";

const SUBJECT = "3f2504e0-4f89-41d3-9a0c-0305e82c3301";

const RECORD: ConsentRecord = {
  v: CONSENT_VERSION,
  analytics: true,
  marketing: false,
  at: 1_789_000_000,
  regime: "opt-in",
  subjectId: SUBJECT,
};

/** Captures what was sent without touching the network. */
function installBeacon(result = true) {
  const sent: Array<{ url: string; body: unknown }> = [];
  const previousNav = Object.getOwnPropertyDescriptor(globalThis, "navigator");
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {
      sendBeacon: (url: string, body: string) => {
        sent.push({ url, body: JSON.parse(body) });
        return result;
      },
    },
  });
  return {
    sent,
    restore: () => {
      if (previousNav) Object.defineProperty(globalThis, "navigator", previousNav);
      else delete (globalThis as Record<string, unknown>).navigator;
    },
  };
}

const ORIGINAL_API = process.env.NEXT_PUBLIC_API_URL;

afterEach(() => {
  if (ORIGINAL_API === undefined) delete process.env.NEXT_PUBLIC_API_URL;
  else process.env.NEXT_PUBLIC_API_URL = ORIGINAL_API;
});

describe("buildConsentPayload — the contract with the backend", () => {
  test("every field the backend allowlists is present, spelled its way", () => {
    const payload = buildConsentPayload({ record: RECORD, surface: "banner" });

    // Exactly the keys `validate_decision` reads. An extra key is dropped
    // server-side; a missing one drops the whole row.
    expect(Object.keys(payload).sort()).toEqual([
      "analytics",
      "decided_at",
      "marketing",
      "regime",
      "subject_id",
      "surface",
      "version",
    ]);
  });

  test("the values are carried through unchanged", () => {
    expect(buildConsentPayload({ record: RECORD, surface: "banner" })).toEqual({
      subject_id: SUBJECT,
      version: CONSENT_VERSION,
      analytics: true,
      marketing: false,
      regime: "opt-in",
      surface: "banner",
      decided_at: 1_789_000_000,
    });
  });

  test("a refusal is reported as a decision, not as an absence", () => {
    const refused = buildConsentPayload({
      record: { ...RECORD, analytics: false, marketing: false },
      surface: "preferences",
    });

    expect(refused.analytics).toBe(false);
    expect(refused.marketing).toBe(false);
    expect(refused.surface).toBe("preferences");
  });

  test("the categories are booleans, never 1 and 0", () => {
    // The cookie stores them as 1/0. The backend rejects anything that is not
    // a real bool — `isinstance(True, int)` is True in Python, so it checks
    // the type directly and an int would silently drop the row.
    const payload = buildConsentPayload({ record: RECORD, surface: "banner" });
    expect(typeof payload.analytics).toBe("boolean");
    expect(typeof payload.marketing).toBe("boolean");
  });

  test("it reports the version the visitor was SHOWN, not today's constant", () => {
    // plan.md's version-bump edge case. Every other fixture here sets
    // `v: CONSENT_VERSION`, which makes `record.v ?? CONSENT_VERSION`
    // indistinguishable from a hardcoded `CONSENT_VERSION` — replace the
    // expression with the constant and those tests all still pass. A record
    // written against the PREVIOUS version is what pins it: a visitor mid
    // session when the text changes must have their answer recorded against
    // the text they actually read.
    const previous = buildConsentPayload({
      record: { ...RECORD, v: CONSENT_VERSION - 1 },
      surface: "banner",
    });

    expect(previous.version).toBe(CONSENT_VERSION - 1);
    expect(previous.version).not.toBe(CONSENT_VERSION);
  });

  test("the US notice reports its own surface and regime", () => {
    const payload = buildConsentPayload({
      record: { ...RECORD, regime: "opt-out" },
      surface: "notice",
    });
    expect(payload.regime).toBe("opt-out");
    expect(payload.surface).toBe("notice");
  });

  test("a record without a subject id still reports one", () => {
    // `writeConsentRecord` always mints one, so this is defensive — but a
    // missing `subject_id` would be replaced server-side anyway, breaking the
    // chain silently. Sending null is honest; sending nothing is not.
    const { subjectId: _omitted, ...withoutSubject } = RECORD;
    const payload = buildConsentPayload({
      record: withoutSubject as ConsentRecord,
      surface: "banner",
    });
    expect("subject_id" in payload).toBe(true);
  });
});

describe("recordConsentDecision — fire and forget", () => {
  test("it posts to the ledger endpoint", () => {
    process.env.NEXT_PUBLIC_API_URL = "https://api.example.test";
    const beacon = installBeacon();
    try {
      recordConsentDecision({ record: RECORD, surface: "banner" });

      expect(beacon.sent.length).toBe(1);
      expect(beacon.sent[0].url).toBe("https://api.example.test/public/consent");
      expect(beacon.sent[0].body).toEqual(
        buildConsentPayload({ record: RECORD, surface: "banner" }),
      );
    } finally {
      beacon.restore();
    }
  });

  test("a trailing slash on the API base does not produce a double slash", () => {
    process.env.NEXT_PUBLIC_API_URL = "https://api.example.test/";
    const beacon = installBeacon();
    try {
      recordConsentDecision({ record: RECORD, surface: "banner" });
      expect(beacon.sent[0].url).toBe("https://api.example.test/public/consent");
    } finally {
      beacon.restore();
    }
  });

  test("no configured API means no send and no crash", () => {
    delete process.env.NEXT_PUBLIC_API_URL;
    const beacon = installBeacon();
    try {
      expect(() =>
        recordConsentDecision({ record: RECORD, surface: "banner" }),
      ).not.toThrow();
      expect(beacon.sent).toEqual([]);
    } finally {
      beacon.restore();
    }
  });

  test("a throwing sendBeacon never reaches the caller", () => {
    // AC6. The banner has already closed and the cookie is already written.
    process.env.NEXT_PUBLIC_API_URL = "https://api.example.test";
    const previousNav = Object.getOwnPropertyDescriptor(globalThis, "navigator");
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: {
        sendBeacon: () => {
          throw new Error("blocked by extension");
        },
      },
    });

    try {
      expect(() =>
        recordConsentDecision({ record: RECORD, surface: "banner" }),
      ).not.toThrow();
    } finally {
      if (previousNav) Object.defineProperty(globalThis, "navigator", previousNav);
      else delete (globalThis as Record<string, unknown>).navigator;
    }
  });

  test("a browser without sendBeacon is not a crash", () => {
    process.env.NEXT_PUBLIC_API_URL = "https://api.example.test";
    const previousNav = Object.getOwnPropertyDescriptor(globalThis, "navigator");
    Object.defineProperty(globalThis, "navigator", { configurable: true, value: {} });

    try {
      expect(() =>
        recordConsentDecision({ record: RECORD, surface: "banner" }),
      ).not.toThrow();
    } finally {
      if (previousNav) Object.defineProperty(globalThis, "navigator", previousNav);
      else delete (globalThis as Record<string, unknown>).navigator;
    }
  });
});

describe("consentLedgerEndpoint", () => {
  test("null when the API base is unset, so callers can skip the work", () => {
    delete process.env.NEXT_PUBLIC_API_URL;
    expect(consentLedgerEndpoint()).toBeNull();
  });

  test("null for a blank base rather than a relative URL", () => {
    // A Docker build arg set to "" is the realistic typo, and posting to
    // "/public/consent" would hit the marketing site, not the API.
    process.env.NEXT_PUBLIC_API_URL = "   ";
    expect(consentLedgerEndpoint()).toBeNull();
  });
});

/**
 * A choice stored under an older consent version, read after the policy text
 * changed.
 *
 * A REFUSAL CARRIES FORWARD. Someone who said no to the narrower processing an
 * older text described has said no to today's wider one too, so that category
 * stays refused: a US visitor who opted out is not tracked again, and a
 * European visitor who refused everything is not asked again.
 *
 * A GRANT DOES NOT. It was given for less than today's text describes, so the
 * category is asked again (the banner, opt-in) or falls to the notice default
 * (opt-out). Global Privacy Control still decides before any default.
 *
 * Each case starts from the cookie value an older banner wrote and runs it
 * through what a page decides from it: the surface shown, which tags load, and
 * which carriers the attribution capture writes.
 */

import { afterEach, describe, expect, test } from "bun:test";
import {
  CONSENT_COOKIE,
  CONSENT_VERSION,
  consentRecordFromCookieHeader,
  consentSnapshotKey,
  consentSurface,
  hasAnalyticsConsent,
  hasMarketingConsent,
  parsePriorConsent,
  parseStoredChoice,
  priorConsentFromCookieHeader,
  resolveConsent,
  serializeConsentCookie,
  type ConsentRegime,
} from "./consent";
import { planCapture } from "./attribution/capture";
import { consentEvidence } from "./attribution/evidence";
import { landingFromUrl } from "./attribution/landing";
import { shouldLoadGa } from "./google-analytics";
import { shouldLoadMetaPixel } from "./meta-pixel";
import { SUBJECT } from "./privacy/__fixtures__/fake-browser";
import { planPageLoad } from "./privacy/lifecycle";
import { rowFor } from "./privacy/policy";
import { restoreGlobalsAfterEach } from "./testing/restore-globals";

const OLDER = CONSENT_VERSION - 1;
const NEWER = CONSENT_VERSION + 1;

/** The cookie value a banner of version `v` wrote for this choice. */
function storedChoice(v: unknown, a: 0 | 1, m: 0 | 1, r: ConsentRegime): string {
  return encodeURIComponent(JSON.stringify({ v, a, m, t: 1_759_000_000, r, s: SUBJECT }));
}

/** What a marketing page decides for a visitor carrying `cookieValue`. */
function visit(cookieValue: string, regime: ConsentRegime, gpc = false) {
  const header = `NEXT_LOCALE=en; ${CONSENT_COOKIE}=${cookieValue}`;
  const record = consentRecordFromCookieHeader(header);
  const prior = priorConsentFromCookieHeader(header);
  const row = rowFor(regime === "opt-out" ? "US" : "FR");
  const state = resolveConsent({ record, prior, gpc, row });
  const evidence = consentEvidence({ record, prior, row: row.key });
  return {
    state,
    // The categories whose cookies the page load removes.
    clear: planPageLoad({
      sid: SUBJECT,
      trackable: true,
      refreshedThisDocument: false,
      row,
      stored: parseStoredChoice(cookieValue),
      consent: state,
    }).clear,
    surface: consentSurface({ record, prior, gpc, trackable: true, row }),
    metaLoads: shouldLoadMetaPixel({
      pixelId: "1088158323750710",
      marketing: state.marketing,
      ready: true,
      trackable: true,
    }),
    gaLoads: shouldLoadGa({
      measurementId: "G-ZFZ6JLPFXN",
      analytics: state.analytics,
      ready: true,
      trackable: true,
    }),
    // A Meta ad click landing on /us/pricing, with both tags' cookies present.
    captured:
      evidence &&
      planCapture({
        landing: landingFromUrl(
          "https://stampeo.app/us/pricing?fbclid=f-click&utm_source=facebook",
          { referrer: "https://www.facebook.com/", variant: null, landedAt: 1_759_100_000 },
        ),
        consent: state,
        evidence,
        live: {
          gaClientId: "1234567890.1700000000",
          gaSession: { sid: "1759100000", sn: 1 },
          fbp: "fb.1.1700000000.987654321",
        },
        stored: { src: null, ga: null, ad: null },
        now: 1_759_100_000,
      }),
  };
}

describe("an older refusal of everything stays a refusal", () => {
  test.each([
    [OLDER, "opt-out"],
    [1, "opt-out"],
    [OLDER, "opt-in"],
    [1, "opt-in"],
  ] as const)("version %d, %s regime: no surface, no tag, nothing captured", (v, regime) => {
    // AC26 (opt-out) and AC27 (opt-in).
    const page = visit(storedChoice(v, 0, 0, regime), regime);

    expect(page.state).toEqual({ analytics: false, marketing: false });
    expect(page.surface).toBe("none");
    expect(page.metaLoads).toBe(false);
    expect(page.gaLoads).toBe(false);
    expect(page.captured).toEqual({ src: null, ga: null, ad: null });
  });
});

describe("an older partial refusal keeps the refused category refused", () => {
  // AC28: `{a:1,m:0}` under an older text. Marketing stays refused; the
  // analytics grant is asked again.
  const partial = storedChoice(OLDER, 1, 0, "opt-in");

  test("in the EU the refusal stands, but the banner shows because the analytics grant is asked again", () => {
    const page = visit(partial, "opt-in");

    expect(page.surface).toBe("banner");
    expect(page.state).toEqual({ analytics: false, marketing: false });
    expect(page.metaLoads).toBe(false);
    expect(page.gaLoads).toBe(false);
    // The refused category's cookies are removed on load.
    expect(page.clear).toContain("marketing");
  });

  test("in the US the notice shows, GA loads by default, and Meta stays off", () => {
    // The state in force is also what "Got it" on the notice records.
    const page = visit(partial, "opt-out");

    expect(page.surface).toBe("notice");
    expect(page.state).toEqual({ analytics: true, marketing: false });
    expect(page.gaLoads).toBe(true);
    expect(page.metaLoads).toBe(false);
    // No click without marketing, so the capture is the source and the GA ids,
    // resting on the older choice: its version and its moment.
    expect(page.captured!.ad).toBeNull();
    for (const carrier of [page.captured!.src, page.captured!.ga]) {
      expect(carrier).toMatchObject({ cv: OLDER, ca: 1_759_000_000, cr: "opt-out" });
    }
  });

  test("GPC still turns off what the regime default would grant", () => {
    const page = visit(partial, "opt-out", true);

    expect(page.state).toEqual({ analytics: false, marketing: false });
    expect(page.surface).toBe("none");
  });
});

describe("an older grant is asked again", () => {
  test("in the EU it is no choice: the banner shows and nothing loads", () => {
    const page = visit(storedChoice(OLDER, 1, 1, "opt-in"), "opt-in");

    expect(page.surface).toBe("banner");
    expect(page.metaLoads).toBe(false);
    expect(page.gaLoads).toBe(false);
    // What the old grant let in is removed on load.
    expect(page.clear).toEqual(["analytics", "marketing"]);
  });

  test("in the US it falls to the notice default", () => {
    const page = visit(storedChoice(OLDER, 1, 1, "opt-out"), "opt-out");

    expect(page.surface).toBe("notice");
    expect(page.state).toEqual({ analytics: true, marketing: true });
  });
});

describe("the consent version a capture names across a version bump", () => {
  const dismissedOlderNotice = `${CONSENT_COOKIE}=${storedChoice(OLDER, 1, 1, "opt-out")}`;

  test.each([
    ["a US visitor who never touched the notice", CONSENT_VERSION, 0, "NEXT_LOCALE=en"],
    [
      "a US visitor who dismissed the previous notice, which evidences no click",
      CONSENT_VERSION,
      0,
      dismissedOlderNotice,
    ],
    [
      "a visitor whose current choice was made under the current version",
      CONSENT_VERSION,
      1_759_000_000,
      `${CONSENT_COOKIE}=${serializeConsentCookie({ v: CONSENT_VERSION, analytics: true, marketing: false, at: 1_759_000_000, regime: "opt-out" })}`,
    ],
    [
      "a visitor whose refusal dates from the previous version",
      OLDER,
      1_759_000_000,
      `${CONSENT_COOKIE}=${storedChoice(OLDER, 1, 0, "opt-out")}`,
    ],
  ] as const)("the capture evidence of %s names consent version %d", (_who, cv, ca, header) => {
    const evidence = consentEvidence({
      record: consentRecordFromCookieHeader(header),
      prior: priorConsentFromCookieHeader(header),
      row: "US",
    });

    expect(evidence).toMatchObject({ cv, ca });
  });
});

describe("a current choice is unchanged", () => {
  test.each([
    [{ analytics: true, marketing: false }, "opt-out"],
    [{ analytics: false, marketing: true }, "opt-in"],
  ] as const)("%o under %s is applied as stored", (choice, regime) => {
    const page = visit(
      serializeConsentCookie({ v: CONSENT_VERSION, ...choice, at: 1_759_000_000, regime }),
      regime,
    );

    expect(page.state).toEqual(choice);
    expect(page.surface).toBe("none");
  });
});

describe("parsePriorConsent", () => {
  test("reads the choices of an older version", () => {
    expect(parsePriorConsent(storedChoice(OLDER, 1, 0, "opt-in"))).toEqual({
      v: OLDER,
      analytics: true,
      marketing: false,
      at: 1_759_000_000,
    });
  });

  test("a current record is not a prior one", () => {
    expect(parsePriorConsent(storedChoice(CONSENT_VERSION, 0, 0, "opt-in"))).toBeNull();
  });

  test.each([0, -1, 1.5, "2", null])(
    "version %p is no choice at all",
    (v) => {
      expect(parsePriorConsent(storedChoice(v, 0, 0, "opt-in"))).toBeNull();
    },
  );

  test("choices we did not write are no choice", () => {
    const forged = encodeURIComponent(JSON.stringify({ v: OLDER, a: "no", m: 0 }));
    expect(parsePriorConsent(forged)).toBeNull();
    expect(parsePriorConsent("%7Bnope")).toBeNull();
  });
});

describe("a choice stored under a newer consent version", () => {
  // A rollback, or the dashboard shipping a version first: showcase reads what a
  // later text recorded. A refusal stands, a grant was given for text this build
  // does not know and is asked again.
  test.each(["opt-out", "opt-in"] as const)("a refusal of everything stays a refusal (%s)", (regime) => {
    const page = visit(storedChoice(NEWER, 0, 0, regime), regime);

    expect(page.state).toEqual({ analytics: false, marketing: false });
    expect(page.surface).toBe("none");
    expect(page.metaLoads).toBe(false);
    expect(page.gaLoads).toBe(false);
    expect(page.captured).toEqual({ src: null, ga: null, ad: null });
  });

  test("a refusal of advertising stands in the US, where Meta would load by default", () => {
    const page = visit(storedChoice(NEWER, 1, 0, "opt-out"), "opt-out");

    expect(page.state).toEqual({ analytics: true, marketing: false });
    expect(page.metaLoads).toBe(false);
    expect(page.captured!.ad).toBeNull();
  });

  test("a grant is no choice: the EU banner asks again and nothing loads", () => {
    const page = visit(storedChoice(NEWER, 1, 1, "opt-in"), "opt-in");

    expect(page.surface).toBe("banner");
    expect(page.state).toEqual({ analytics: false, marketing: false });
    expect(page.metaLoads).toBe(false);
    expect(page.gaLoads).toBe(false);
  });

  test("a grant is no choice: the US visitor falls to the notice default", () => {
    const page = visit(storedChoice(NEWER, 1, 1, "opt-out"), "opt-out");

    expect(page.surface).toBe("notice");
    expect(page.state).toEqual({ analytics: true, marketing: true });
  });

  test("a refusal the web dashboard restored under a newer version still withholds advertising", () => {
    // The mixed deploy window: web already writes the next version's restore
    // record (`-1` for the category left open) before this build knows it.
    const restored = encodeURIComponent(
      JSON.stringify({ v: NEWER, a: -1, m: 0, t: 1_759_400_000, r: "opt-out", s: SUBJECT, o: "restore" }),
    );
    const page = visit(restored, "opt-out");

    expect(page.state).toEqual({ analytics: true, marketing: false });
    expect(page.metaLoads).toBe(false);
    expect(page.captured!.ad).toBeNull();
  });

  test("it is read as a prior choice, never as a current one", () => {
    const raw = storedChoice(NEWER, 1, 0, "opt-in");

    expect(parsePriorConsent(raw)).toMatchObject({ v: NEWER, analytics: true, marketing: false });
    expect(consentRecordFromCookieHeader(`${CONSENT_COOKIE}=${raw}`)).toBeNull();
  });
});

test("an older record appearing, or its moment changing, changes the consent snapshot", () => {
  // The banner reads `prior` from the snapshot and the attribution capture
  // carries `prior.at` as evidence, so the snapshot must be rebuilt for both.
  const base = { record: null, gpc: false, row: "US", ready: true };
  const prior = { v: OLDER, analytics: false, marketing: false, at: 1_759_000_000 };
  const keys = [null, prior, { ...prior, at: prior.at + 60 }].map((p) =>
    consentSnapshotKey({ ...base, prior: p }),
  );
  expect(new Set(keys).size).toBe(3);
});

describe("a record the web dashboard restored, read after the next version bump", () => {
  // The cookie was written under the text before the bump, so it is read as an older choice.
  const RESTORED_AT = 1_759_400_000;
  const stored = (choice: object) =>
    encodeURIComponent(JSON.stringify({ v: OLDER, t: RESTORED_AT, r: "opt-out", s: SUBJECT, ...choice }));
  const evidenceOf = (raw: string) =>
    consentEvidence({ record: null, prior: parsePriorConsent(raw), row: "US" });

  test("keeps its origin and its no-choice answer", () => {
    expect(parsePriorConsent(stored({ a: -1, m: 0, o: "restore" }))).toEqual({
      v: OLDER,
      analytics: null,
      marketing: false,
      at: RESTORED_AT,
      origin: "restore",
    });
  });

  test("still refuses what it refused, and asks about nothing it left open", () => {
    const page = visit(stored({ a: -1, m: 0, o: "restore" }), "opt-out");

    expect(page.state).toEqual({ analytics: true, marketing: false });
    expect(page.metaLoads).toBe(false);
  });

  test.each([
    ["a restored refusal", { a: -1, m: 0, o: "restore" }],
    ["a refusal beside a category with no choice", { a: -1, m: 0 }],
    ["a restore of an answered category", { a: 1, m: 0, o: "restore" }],
  ])("%s evidences no click: the text in force and ca 0", (_case, choice) => {
    expect(evidenceOf(stored(choice))).toMatchObject({ cv: CONSENT_VERSION, ca: 0, cr: "opt-out", g: "US" });
  });

  test("a refusal the visitor clicked keeps its own version and moment", () => {
    expect(evidenceOf(stored({ a: 1, m: 0 }))).toMatchObject({ cv: OLDER, ca: RESTORED_AT });
  });
});

describe("the browser read path", () => {
  const RealDateTimeFormat = Intl.DateTimeFormat;

  restoreGlobalsAfterEach("document", "window", "navigator");
  afterEach(() => {
    Intl.DateTimeFormat = RealDateTimeFormat;
  });

  test("a US visitor who opted out under an older version is not tracked", () => {
    // AC26 through `hasMarketingConsent` / `hasAnalyticsConsent`, which the
    // click handlers read: a New York timezone and the older opt-out cookie.
    const browser = {
      document: { cookie: `${CONSENT_COOKIE}=${storedChoice(OLDER, 0, 0, "opt-out")}` },
      window: {},
      navigator: {},
    };
    for (const [name, value] of Object.entries(browser)) {
      Object.defineProperty(globalThis, name, { value, configurable: true, writable: true });
    }
    // @ts-expect-error replacing the constructor for one case
    Intl.DateTimeFormat = function FakeDateTimeFormat() {
      return { resolvedOptions: () => ({ timeZone: "America/New_York" }) };
    };

    expect(hasMarketingConsent()).toBe(false);
    expect(hasAnalyticsConsent()).toBe(false);
  });
});

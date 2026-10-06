/**
 * What a visit writes down, and when.
 *
 * Each case starts from a real visitor: a region, what they chose (or did not),
 * what they are carrying from earlier visits, and the landing they arrived on.
 * It asks for the three carriers that visit may write, and nothing it may not:
 *
 *   stampeo_src  the campaign source      either category allowed
 *   stampeo_ga   the GA ids               analytics allowed
 *   stampeo_ad   the paid click           marketing allowed AND a click id
 *
 * THE PAID CLICK IS NEVER REPLACED BY AN ORGANIC VISIT. The latest paid click
 * wins, the way the ad platforms attribute; the source is replaced only
 * together with it, or when there is none.
 *
 * `lib/consent.test.ts` and `lib/privacy/*` own what a visitor agreed to; the
 * consent here is resolved by the real resolver, never typed in by hand.
 */

import { describe, expect, test } from "bun:test";

import {
  CONSENT_COOKIE,
  CONSENT_VERSION,
  consentRecordFromCookieHeader,
  priorConsentFromCookieHeader,
  resolveConsent,
  type PriorConsent,
} from "../consent";
import { POLICY_MATRIX } from "../privacy/policy-matrix";
import {
  NO_LIVE_IDS,
  awaitedIds,
  planCapture,
  readLiveIds,
  readStoredCarriers,
  type CaptureInput,
  type LiveIds,
  type StoredCarriers,
} from "./capture";
import { consentEvidence } from "./evidence";
import {
  EU,
  FBP,
  GA_CID,
  LANDED,
  LIVE_ALL,
  META_LANDING,
  NOTHING_STORED,
  ORGANIC_LANDING,
  UNKNOWN,
  US,
  chose,
  landing,
  plan,
  visitor,
} from "./__fixtures__/visitors";

describe("a US visitor who has not chosen, landing on a Meta ad", () => {
  const state = visitor(US);

  test("is under the opt-out default, so all three carriers are written", () => {
    expect(state.consent).toEqual({ analytics: true, marketing: true });
    expect(plan(state)).toEqual({
      src: {
        v: 2,
        us: "meta",
        um: "paid_social",
        uc: "us-cr-broad",
        uo: "ugc-cafe-15s",
        ut: "us-broad",
        lp: "/us",
        lv: null,
        rh: "l.facebook.com",
        at: LANDED,
        cv: CONSENT_VERSION,
        cr: "opt-out",
        ca: 0,
        p: POLICY_MATRIX.version,
        g: "US",
      },
      ga: {
        v: 2,
        cid: GA_CID,
        sid: "1791244795",
        sn: 1,
        at: LANDED + 5,
        cv: CONSENT_VERSION,
        cr: "opt-out",
        ca: 0,
        p: POLICY_MATRIX.version,
        g: "US",
      },
      ad: {
        v: 2,
        vn: "meta",
        ci: "IwAR_TEST_fbclid_0001",
        ct: LANDED,
        fbp: FBP,
        cv: CONSENT_VERSION,
        cr: "opt-out",
        ca: 0,
        p: POLICY_MATRIX.version,
        g: "US",
      },
    });
  });
});

describe("a European visitor who accepted everything", () => {
  test("is written under the choice they made", () => {
    const acceptor = visitor(EU, { record: chose(true, true, "opt-in", 1_791_240_000) });
    const written = plan(acceptor);

    for (const carrier of [written.src, written.ga, written.ad]) {
      expect(carrier).toMatchObject({
        cv: CONSENT_VERSION,
        cr: "opt-in",
        ca: 1_791_240_000,
        p: POLICY_MATRIX.version,
        g: "EEA_UK_CH",
      });
    }
    expect(written.ad).toMatchObject({ vn: "meta", ci: "IwAR_TEST_fbclid_0001", fbp: FBP });
  });
});

describe("what each visitor's choice lets the capture write, on a Meta ad landing", () => {
  const CLICK = "IwAR_TEST_fbclid_0001";

  test.each([
    ["a US visitor under GPC", US, { gpc: true }, [], []],
    ["a US visitor who refused advertising", US, { record: chose(true, false, "opt-out") }, ["src", "ga"], [CLICK, FBP]],
    ["a European who refused only marketing", EU, { record: chose(true, false, "opt-in") }, ["src", "ga"], [CLICK, FBP]],
    ["a European who accepted only marketing", EU, { record: chose(false, true, "opt-in") }, ["src", "ad"], [GA_CID]],
    ["a European who has not chosen", EU, {}, [], []],
    ["a visitor we cannot place who has not chosen", UNKNOWN, {}, [], []],
    ["a European who refused everything", EU, { record: chose(false, false, "opt-in") }, [], []],
  ] as const)("%s: carriers %j, and nothing of %j", (_case, row, options, carriers, absent) => {
    const written = plan(visitor(row, options));

    expect((["src", "ga", "ad"] as const).filter((name) => written[name] !== null)).toEqual([...carriers]);
    for (const value of absent) expect(JSON.stringify(written)).not.toContain(value);
  });
});

describe("an arrival without a click", () => {
  test("never copies _fbp into any carrier: Meta's own cookie holds it, and sign-up forwards it live", () => {
    const written = plan(visitor(US), { landing: ORGANIC_LANDING });

    expect(written.ad).toBeNull();
    expect(JSON.stringify(written)).not.toContain(FBP);
    expect(written.src).toMatchObject({ lp: "/pricing", rh: "www.google.com", us: null });
  });

  test("with marketing only, writes the source and nothing else", () => {
    const written = plan(visitor(EU, { record: chose(false, true, "opt-in") }), {
      landing: ORGANIC_LANDING,
    });
    expect(written).toEqual({ src: expect.objectContaining({ lp: "/pricing" }), ga: null, ad: null });
  });
});

describe("a landing that is not ours to measure", () => {
  test.each([
    ["a business's enrollment page", "https://stampeo.app/mon-cafe?fbclid=f1"],
    ["the onboarding flow", "https://stampeo.app/onboarding?fbclid=f1"],
    ["the login page", "https://stampeo.app/en/login"],
    ["an email-preferences page", "https://stampeo.app/email-preferences"],
  ])("%s writes nothing, consent notwithstanding", (_case, url) => {
    expect(plan(visitor(US), { landing: landing(url) })).toEqual({ src: null, ga: null, ad: null });
  });
});

describe("a returning visitor: the latest paid click wins", () => {
  const first = plan(visitor(US), { landing: ORGANIC_LANDING });
  const withMeta = plan(visitor(US));

  /** Cookies a visitor already carries, as the carriers they decode to. */
  const carrying = (written: ReturnType<typeof plan>): StoredCarriers => ({
    src: written.src,
    ga: written.ga,
    ad: written.ad,
  });

  test("whose stored `direct` source is overtaken by a new Meta click: the click is written and the source replaced", () => {
    expect(first.ad).toBeNull();
    expect(first.src).toMatchObject({ us: null, lp: "/pricing", rh: "www.google.com" });

    const returning = plan(visitor(US), {
      stored: carrying(first),
      now: LANDED + 86_400 * 3,
    });

    expect(returning.ad).toMatchObject({ vn: "meta", ci: "IwAR_TEST_fbclid_0001" });
    expect(returning.src).toMatchObject({ us: "meta", uc: "us-cr-broad", lp: "/us" });
  });

  describe("which arrival replaces which stored visit", () => {
    /** The carriers a visit with this query leaves behind, as stored. */
    const left = (search: string) =>
      plan(visitor(US), {
        landing: landing(`https://stampeo.app/us${search}`),
        now: LANDED,
      });

    test.each([
      ["nothing stored, a paid click: written", null, "?fbclid=f-new", true, true],
      ["nothing stored, an organic visit: the source only", null, "", false, true],
      ["a direct visit, then a Meta click: replaced", "", "?fbclid=f-new", true, true],
      ["a Google click, then a newer Meta click: replaced", "?gclid=g-old", "?fbclid=f-new", true, true],
      ["a Meta click, then a newer Google click: replaced", "?fbclid=f-old", "?gclid=g-new", true, true],
      ["a Meta click, then a newer Meta click: replaced", "?fbclid=f-old", "?fbclid=f-new", true, true],
      ["a direct visit, then a TikTok click: replaced", "", "?ttclid=t-new", true, true],
      ["a Google click, then an organic visit: kept", "?gclid=g-old", "", false, false],
      ["a Meta click, then an organic visit: kept", "?fbclid=f-old", "", false, false],
      ["a TikTok click, then an organic visit: kept", "?ttclid=t-old", "", false, false],
      ["a direct visit, then another organic visit: kept", "", "?utm_source=newsletter", false, false],
      // A reload, or the capture re-running after a client-side navigation.
      ["a Meta click, then the same click again: kept", "?fbclid=f-old", "?fbclid=f-old", false, false],
    ])("%s", (_case, stored, arriving, adWritten, srcWritten) => {
      const written = plan(visitor(US), {
        landing: landing(`https://stampeo.app/us${arriving}`),
        stored: stored === null ? NOTHING_STORED : { ...left(stored), ga: null },
        now: LANDED + 60,
      });

      expect(written.ad !== null).toBe(adWritten);
      expect(written.src !== null).toBe(srcWritten);
    });
  });

  test("with a stored paid click, an organic revisit replaces nothing", () => {
    const revisit = plan(visitor(US), {
      landing: ORGANIC_LANDING,
      stored: carrying(withMeta),
      now: LANDED + 60,
    });

    expect(revisit).toEqual({ src: null, ga: null, ad: null });
  });

  test("the same click again, from a reload, replaces nothing", () => {
    expect(plan(visitor(US), { stored: carrying(withMeta), now: LANDED + 60 })).toEqual({
      src: null,
      ga: null,
      ad: null,
    });
  });

  test.each([
    ["a newer Meta click", "?fbclid=f-new", "meta", "f-new"],
    ["a Google click", "?gclid=g-new", "google", "g-new"],
    ["a TikTok click", "?ttclid=t-new", "tiktok", "t-new"],
  ])("%s replaces the stored Meta click, and the source with it", (_case, search, vn, ci) => {
    const later = plan(visitor(US), {
      landing: landing(`https://stampeo.app/us${search}&utm_source=other`),
      stored: carrying(withMeta),
      now: LANDED + 86_400 * 9,
    });

    expect(later.ad).toMatchObject({ vn, ci, ct: LANDED });
    expect(later.src).toMatchObject({ us: "other" });
  });

  test("a click seen with advertising refused replaces nothing: it was never captured", () => {
    const analyticsOnly = visitor(US, { record: chose(true, false, "opt-out") });
    const written = plan(analyticsOnly, {
      landing: landing("https://stampeo.app/us?fbclid=f-new&utm_source=other"),
      stored: carrying(first),
      now: LANDED + 86_400,
    });

    expect(written.ad).toBeNull();
    expect(written.src).toBeNull();
  });

  test("a stored click whose source was cleared gets its source back, and keeps the click", () => {
    const written = plan(visitor(US), {
      stored: { ...carrying(withMeta), src: null },
      now: LANDED + 60,
    });
    expect(written.src).toMatchObject({ us: "meta" });
    expect(written.ad).toBeNull();
  });

  test("the moment a click was first seen survives its browser id arriving later", () => {
    const early = plan(visitor(US), { live: { ...LIVE_ALL, fbp: null } });
    expect(early.ad).toMatchObject({ ci: "IwAR_TEST_fbclid_0001", fbp: null });

    // The pixel wrote `_fbp` a beat later, on a later page load.
    const repaired = plan(visitor(US), {
      landing: { ...META_LANDING, landedAt: LANDED + 86_400 },
      stored: { src: early.src, ga: early.ga, ad: early.ad },
      now: LANDED + 86_400,
    });
    expect(repaired.ad).toMatchObject({ fbp: FBP, ct: LANDED });
    expect(repaired.src).toBeNull();
  });

  test("a stored browser id is not replaced by a different one", () => {
    const stored = { ...NOTHING_STORED, ad: withMeta.ad, src: withMeta.src };
    expect(plan(visitor(US), { live: { ...LIVE_ALL, fbp: "fb.1.1.2" }, stored, now: LANDED + 60 }).ad).toBeNull();
  });
});

describe("stampeo_ga is refreshed as the visit goes on", () => {
  const stored = (over: object = {}): StoredCarriers => ({
    ...NOTHING_STORED,
    ga: { ...plan(visitor(US)).ga!, ...over },
  });
  const later = (live: LiveIds, now: number, base = stored()) =>
    plan(visitor(US), { landing: ORGANIC_LANDING, live, stored: { ...base, src: plan(visitor(US)).src }, now }).ga;

  test("unchanged ids, seen again at once, are not written again", () => {
    expect(later(LIVE_ALL, LANDED + 120)).toBeNull();
  });

  test.each([
    ["a new session", { gaSession: { sid: "1791250000", sn: 2 } }],
    ["a session number alone", { gaSession: { sid: "1791244795", sn: 2 } }],
    ["a different client id", { gaClientId: "999.888" }],
  ] as const)("%s is written", (_case, change) => {
    const live: LiveIds = { ...LIVE_ALL, ...change };
    expect(later(live, LANDED + 120)).toMatchObject({
      cid: live.gaClientId,
      sid: live.gaSession!.sid,
      sn: live.gaSession!.sn,
      at: LANDED + 120,
    });
  });

  test("the same ids a day later are written again, so the carrier keeps pace with the visitor", () => {
    expect(later(LIVE_ALL, LANDED + 86_400 + 5)).toMatchObject({ at: LANDED + 86_400 + 5 });
  });

  test("before Google has written the client id there is nothing to carry", () => {
    expect(plan(visitor(US), { live: NO_LIVE_IDS }).ga).toBeNull();
  });

  test("the client id without its session yet is carried alone, then completed", () => {
    const early = plan(visitor(US), { live: { ...LIVE_ALL, gaSession: null } }).ga;
    expect(early).toMatchObject({ cid: GA_CID, sid: null, sn: null });

    expect(later(LIVE_ALL, LANDED + 10, { ...NOTHING_STORED, ga: early })).toMatchObject({
      sid: "1791244795",
      sn: 1,
    });
  });
});

describe("what the capture still waits for", () => {
  const wait = (state: ReturnType<typeof visitor>, over: Partial<CaptureInput> = {}) =>
    awaitedIds({ landing: META_LANDING, live: NO_LIVE_IDS, stored: NOTHING_STORED, ...state, ...over });

  test("a visitor who allows analytics waits for Google's client id, until it exists", () => {
    expect(wait(visitor(US)).ga).toBe(true);
    expect(wait(visitor(US), { live: LIVE_ALL }).ga).toBe(false);
  });

  test("a visitor who refused analytics waits for nothing from Google", () => {
    expect(wait(visitor(US, { record: chose(false, true, "opt-out") })).ga).toBe(false);
  });

  test("a new Meta click waits for Meta's browser id, until the pixel writes it", () => {
    expect(wait(visitor(US)).fbp).toBe(true);
    expect(wait(visitor(US), { live: LIVE_ALL }).fbp).toBe(false);
  });

  test.each([
    ["a Google click", "https://stampeo.app/us?gclid=g1"],
    ["an organic arrival", "https://stampeo.app/us"],
  ])("%s does not wait for Meta's browser id", (_case, url) => {
    expect(wait(visitor(US), { landing: landing(url) }).fbp).toBe(false);
  });

  test("a visitor who refused advertising does not wait for Meta's browser id", () => {
    expect(wait(visitor(US, { record: chose(true, false, "opt-out") })).fbp).toBe(false);
  });

  test("a stored click that already has its browser id waits for nothing", () => {
    const stored = plan(visitor(US));
    expect(wait(visitor(US), { stored }).fbp).toBe(false);
    expect(wait(visitor(US), { stored: { ...stored, ad: { ...stored.ad!, fbp: null } } }).fbp).toBe(
      true,
    );
  });
});

describe("the consent evidence a capture rests on", () => {
  const CURRENT = chose(true, true, "opt-in", 1_759_000_000);
  const OLDER: PriorConsent = { v: 2, analytics: true, marketing: false, at: 1_759_400_000 };
  const row = EU.key;

  test.each([
    ["a visitor who chose carries their own choice", CURRENT, null, { cv: CONSENT_VERSION, ca: 1_759_000_000 }],
    ["a visitor whose only choice is older carries that choice", null, OLDER, { cv: 2, ca: 1_759_400_000 }],
    // Its grants are not carried, so the state in force is the opt-out default.
    ["a visitor whose older choice refused nothing carries the text in force and no moment", null, { ...OLDER, marketing: true }, { cv: CONSENT_VERSION, ca: 0 }],
    // Nobody clicked: the version is the notice text shown, with no moment.
    ["a visitor under the notice default carries the text in force and no moment", null, null, { cv: CONSENT_VERSION, ca: 0 }],
  ])("%s", (_case, record, prior, expected) => {
    expect(consentEvidence({ record, prior, row })).toEqual({
      ...expected,
      cr: "opt-in",
      p: POLICY_MATRIX.version,
      g: "EEA_UK_CH",
    });
  });

  test("an older choice with no moment is no evidence", () => {
    expect(consentEvidence({ record: null, prior: { ...OLDER, at: 0 }, row })).toBeNull();
  });

  test("a row we do not know is recorded as the strict one", () => {
    expect(consentEvidence({ record: null, prior: null, row: "MARS" })?.g).toBe("UNKNOWN");
  });

  describe("a US visitor who refused advertising under version 2 and kept analytics", () => {
    /** The carriers an organic landing on /us writes for a visitor carrying this cookie. */
    function organicLanding(choice: Record<string, unknown>) {
      const header = `NEXT_LOCALE=en; ${CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify(choice))}`;
      const record = consentRecordFromCookieHeader(header);
      const prior = priorConsentFromCookieHeader(header);
      const consent = resolveConsent({ record, prior, gpc: false, row: US });
      const evidence = consentEvidence({ record, prior, row: "US" });
      return {
        consent,
        written: evidence && planCapture({
          landing: landing("https://stampeo.app/us", ""),
          consent,
          evidence,
          live: LIVE_ALL,
          stored: NOTHING_STORED,
          now: LANDED,
        }),
      };
    }

    test("carries the version-2 choice, never the never-chose shape", () => {
      // `cv:3, ca:0` is what the backend reads as the opt-out default, which
      // grants advertising this visitor refused.
      const { consent, written } = organicLanding({ v: 2, a: 1, m: 0, t: 1_759_400_000, r: "opt-out" });

      expect(consent).toEqual({ analytics: true, marketing: false });
      for (const carrier of [written!.src, written!.ga]) {
        expect(carrier).toMatchObject({ cv: 2, ca: 1_759_400_000, cr: "opt-out" });
      }
      expect(written!.ad).toBeNull();
    });

    test.each([undefined, 0, -1, "1759400000"])(
      "a version-2 cookie with moment %p captures nothing, and its refusal still stands",
      (t) => {
        const { consent, written } = organicLanding({ v: 2, a: 1, m: 0, t, r: "opt-out" });

        expect(consent).toEqual({ analytics: true, marketing: false });
        expect(written).toBeNull();
      },
    );
  });
});

describe("reading what the browser already holds", () => {
  test("the live ids come from the jar, for the configured property only", () => {
    const jar = `_ga=GA1.1.${GA_CID}; _ga_ZFZ6JLPFXN=GS2.1.s1791244795$o1$g1$t1791244799$j0$l0$h0; _ga_OTHER12345=GS2.1.s1$o9; _fbp=${FBP}`;

    expect(readLiveIds(jar, "G-ZFZ6JLPFXN")).toEqual({
      gaClientId: GA_CID,
      gaSession: { sid: "1791244795", sn: 1 },
      fbp: FBP,
    });
    expect(readLiveIds(jar, null).gaSession).toBeNull();
    expect(readLiveIds("", "G-ZFZ6JLPFXN")).toEqual(NO_LIVE_IDS);
  });

  test("a forged carrier in the jar is no carrier", () => {
    const stored = readStoredCarriers(
      `stampeo_src=garbage; stampeo_ga=%7B; stampeo_ad=${encodeURIComponent(JSON.stringify({ v: 2, vn: "direct" }))}`,
    );
    expect(stored).toEqual({ src: null, ga: null, ad: null });
  });
});

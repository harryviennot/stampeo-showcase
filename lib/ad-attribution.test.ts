/**
 * Ad attribution capture (STA-323).
 *
 * What is captured on a landing page, and — far more important — what is NOT.
 * These rows become personal data stored against a business, so the negative
 * cases here carry more weight than the positive one.
 *
 * Three rules drive the cases.
 *
 * 1. CONSENT GATES CAPTURE, NOT ONLY SENDING. A click id is an advertising
 *    identifier; writing one into a cookie is already processing. With neither
 *    category granted there is no cookie at all, so there is nothing to forward
 *    and nothing to delete later.
 *
 * 2. THE TWO CATEGORIES BUY DIFFERENT FIELDS. `marketing` permits the ad
 *    platforms' click ids. `analytics` permits the GA4 client id. A visitor who
 *    granted one must not have the other's identifier captured, and the row
 *    records WHICH category permitted it.
 *
 * 3. THE COOKIE IS NOT AUTHENTICATION. It crosses to app.stampeo.app where the
 *    business is created, so it is attacker-editable by definition. Parsing is
 *    total: anything malformed, forged or from another version is null rather
 *    than a throw, and the backend validates again regardless.
 *
 * `lib/consent.test.ts` owns what a visitor agreed to. This file assumes that
 * answer and tests what is captured under it.
 */

import { describe, expect, test } from "bun:test";
import {
  ATTRIBUTION_VERSION,
  buildAttributionRecord,
  parseAttributionCookie,
  readClickIds,
  readUtm,
  referrerHost,
  serializeAttributionCookie,
  vendorForClickIds,
  type AttributionRecord,
} from "./ad-attribution";

const BOTH = { analytics: true, marketing: true };
const NEITHER = { analytics: false, marketing: false };

/** A landing arrival with everything present. Cases below remove one thing. */
const ARRIVAL = {
  search: "?gclid=abc123&utm_source=google&utm_medium=cpc&utm_campaign=launch",
  gaClientId: "GA1.1.1234567890.1700000000",
  landingPath: "/pricing",
  landingVariant: "b",
  referrer: "https://www.google.com/search?q=loyalty",
  consent: BOTH,
  consentVersion: 1,
  consentRegime: "opt-in" as const,
  consentAt: 1_700_000_000,
  capturedAt: 1_700_000_100,
};

describe("readClickIds", () => {
  test("each platform's click id is read from the query", () => {
    expect(readClickIds("?gclid=g1")).toEqual({
      gclid: "g1",
      fbclid: null,
      ttclid: null,
    });
    expect(readClickIds("?fbclid=f1")).toEqual({
      gclid: null,
      fbclid: "f1",
      ttclid: null,
    });
    expect(readClickIds("?ttclid=t1")).toEqual({
      gclid: null,
      fbclid: null,
      ttclid: "t1",
    });
  });

  test("an empty query yields no click ids", () => {
    expect(readClickIds("")).toEqual({ gclid: null, fbclid: null, ttclid: null });
  });

  test("an empty parameter value is null, not an empty string", () => {
    // `?gclid=` is what a broken ad template produces, and an empty string
    // would otherwise be stored as though it were a real click.
    expect(readClickIds("?gclid=").gclid).toBeNull();
  });
});

describe("readUtm", () => {
  test("the five utm fields are read", () => {
    expect(
      readUtm("?utm_source=google&utm_medium=cpc&utm_campaign=c&utm_content=ad1&utm_term=loyalty")
    ).toEqual({
      utmSource: "google",
      utmMedium: "cpc",
      utmCampaign: "c",
      utmContent: "ad1",
      utmTerm: "loyalty",
    });
  });

  test("absent utm fields are null", () => {
    expect(readUtm("?utm_source=newsletter").utmMedium).toBeNull();
  });
});

describe("vendorForClickIds", () => {
  test("each click id names its platform", () => {
    expect(vendorForClickIds({ gclid: "g", fbclid: null, ttclid: null })).toBe("google");
    expect(vendorForClickIds({ gclid: null, fbclid: "f", ttclid: null })).toBe("meta");
    expect(vendorForClickIds({ gclid: null, fbclid: null, ttclid: "t" })).toBe("tiktok");
  });

  test("no click id is direct", () => {
    expect(vendorForClickIds({ gclid: null, fbclid: null, ttclid: null })).toBe("direct");
  });

  test("google wins when several are present", () => {
    // Happens when a visitor arrives via one platform and a later link carries
    // another's parameter. One row per vendor is the schema, so the arrival
    // must resolve to exactly one; the order is fixed so it is reproducible
    // rather than dependent on parameter order.
    expect(vendorForClickIds({ gclid: "g", fbclid: "f", ttclid: "t" })).toBe("google");
  });
});

describe("referrerHost", () => {
  test("an external referrer yields its host", () => {
    expect(referrerHost("https://www.google.com/search?q=x", "stampeo.app")).toBe(
      "www.google.com"
    );
  });

  test("our own host is not a referrer", () => {
    // Internal navigation is not a traffic source, and recording it would make
    // every second page look like a referral from ourselves.
    expect(referrerHost("https://stampeo.app/pricing", "stampeo.app")).toBeNull();
  });

  test("an empty or unparseable referrer is null", () => {
    expect(referrerHost("", "stampeo.app")).toBeNull();
    expect(referrerHost("not a url", "stampeo.app")).toBeNull();
  });
});

describe("buildAttributionRecord — the consent gate", () => {
  test("no consent captures nothing at all", () => {
    expect(buildAttributionRecord({ ...ARRIVAL, consent: NEITHER })).toBeNull();
  });

  test("full consent captures the whole arrival", () => {
    const record = buildAttributionRecord(ARRIVAL) as AttributionRecord;
    expect(record).not.toBeNull();
    expect(record.vendor).toBe("google");
    expect(record.clickId).toBe("abc123");
    expect(record.browserId).toBe("GA1.1.1234567890.1700000000");
    expect(record.utmCampaign).toBe("launch");
    expect(record.landingPath).toBe("/pricing");
    expect(record.landingVariant).toBe("b");
    expect(record.referrerHost).toBe("www.google.com");
  });

  test("marketing alone captures the click id but NOT the GA client id", () => {
    // The GA4 client id is an analytics identifier. Accepting the ad pixels is
    // not an answer about it.
    const record = buildAttributionRecord({
      ...ARRIVAL,
      consent: { analytics: false, marketing: true },
    }) as AttributionRecord;
    expect(record.clickId).toBe("abc123");
    expect(record.browserId).toBeNull();
    expect(record.consentCategory).toBe("marketing");
  });

  test("analytics alone captures the GA client id but NOT the click id", () => {
    const record = buildAttributionRecord({
      ...ARRIVAL,
      consent: { analytics: true, marketing: false },
    }) as AttributionRecord;
    expect(record.browserId).toBe("GA1.1.1234567890.1700000000");
    expect(record.clickId).toBeNull();
    // With the ad identifier withheld, the row cannot claim a paid source.
    expect(record.vendor).toBe("direct");
    expect(record.consentCategory).toBe("analytics");
  });

  test("marketing alone with no ad click captures nothing", () => {
    // Nothing left that `marketing` permits: the click id is absent and the GA
    // client id needs the other category. A row here would be stored on a
    // basis nobody granted.
    expect(
      buildAttributionRecord({
        ...ARRIVAL,
        search: "?utm_source=newsletter",
        consent: { analytics: false, marketing: true },
      })
    ).toBeNull();
  });

  test("organic arrival with analytics consent is a direct row", () => {
    // The case the schema exists to keep answerable: where do signups come
    // from, not merely which ad.
    const record = buildAttributionRecord({
      ...ARRIVAL,
      search: "?utm_source=newsletter&utm_medium=email",
      consent: { analytics: true, marketing: false },
    }) as AttributionRecord;
    expect(record.vendor).toBe("direct");
    expect(record.clickId).toBeNull();
    expect(record.utmSource).toBe("newsletter");
  });

  test("the consent evidence travels with the record", () => {
    // The backend proves the lawful basis from the cookie rather than from a
    // second lookup it cannot make on another domain.
    const record = buildAttributionRecord(ARRIVAL) as AttributionRecord;
    expect(record.consentVersion).toBe(1);
    expect(record.consentRegime).toBe("opt-in");
    expect(record.consentAt).toBe(1_700_000_000);
    expect(record.capturedAt).toBe(1_700_000_100);
  });

  test("a US opt-out visitor records the regime that applied", () => {
    // Consent was implied, never clicked. An audit has to be able to tell the
    // two apart, so the regime is evidence and not decoration.
    const record = buildAttributionRecord({
      ...ARRIVAL,
      consentRegime: "opt-out",
    }) as AttributionRecord;
    expect(record.consentRegime).toBe("opt-out");
  });
});

describe("the cookie round-trip", () => {
  test("a record survives serialize then parse", () => {
    const record = buildAttributionRecord(ARRIVAL) as AttributionRecord;
    expect(parseAttributionCookie(serializeAttributionCookie(record))).toEqual(record);
  });

  test("an absent cookie is null", () => {
    expect(parseAttributionCookie(null)).toBeNull();
    expect(parseAttributionCookie("")).toBeNull();
  });

  test("a malformed cookie is null, not a throw", () => {
    expect(parseAttributionCookie("%7Bnope")).toBeNull();
    expect(parseAttributionCookie("null")).toBeNull();
    expect(parseAttributionCookie(encodeURIComponent("[1,2,3]"))).toBeNull();
  });

  test("a record from an older version is discarded", () => {
    // Same reasoning as the consent cookie: a stored shape from before a field
    // changed meaning is not evidence of anything.
    const stale = encodeURIComponent(
      JSON.stringify({ v: ATTRIBUTION_VERSION + 1, vendor: "google" })
    );
    expect(parseAttributionCookie(stale)).toBeNull();
  });

  test("a forged vendor is rejected", () => {
    // The cookie crosses to app.stampeo.app and is editable in devtools. An
    // unknown vendor must not reach the database's CHECK constraint and turn
    // into a 500 during signup.
    const forged = encodeURIComponent(
      JSON.stringify({
        v: ATTRIBUTION_VERSION,
        vendor: "'; DROP TABLE businesses; --",
        cc: "marketing",
        cv: 1,
        cr: "opt-in",
      })
    );
    expect(parseAttributionCookie(forged)).toBeNull();
  });

  test("a forged consent category is rejected", () => {
    const forged = encodeURIComponent(
      JSON.stringify({
        v: ATTRIBUTION_VERSION,
        vendor: "google",
        cc: "everything",
        cv: 1,
        cr: "opt-in",
      })
    );
    expect(parseAttributionCookie(forged)).toBeNull();
  });
});

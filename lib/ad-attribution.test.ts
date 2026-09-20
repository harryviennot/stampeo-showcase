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
  ATTRIBUTION_COOKIE,
  ATTRIBUTION_VERSION,
  attributionCookieAttributes,
  buildAttributionRecord,
  parseAttributionCookie,
  readClickIds,
  readUtm,
  referrerHost,
  serializeAttributionCookie,
  vendorForClickIds,
  writeAttributionRecord,
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
    //
    // Built by serializing a VALID record and editing one field, so the only
    // reason it can be null is the version. The first cut of this test
    // hand-rolled a two-key object that was null for three other reasons, and
    // so could not tell the version check from its absence.
    const valid = JSON.parse(
      decodeURIComponent(
        serializeAttributionCookie(buildAttributionRecord(ARRIVAL) as AttributionRecord)
      )
    );
    expect(parseAttributionCookie(encodeURIComponent(JSON.stringify(valid)))).not.toBeNull();

    for (const v of [ATTRIBUTION_VERSION + 1, ATTRIBUTION_VERSION - 1, "1", null]) {
      expect(
        parseAttributionCookie(encodeURIComponent(JSON.stringify({ ...valid, v }))),
        `version ${JSON.stringify(v)} should be discarded`
      ).toBeNull();
    }
  });

  test("a forged vendor is rejected", () => {
    // The cookie crosses to app.stampeo.app and is editable in devtools. An
    // unknown vendor must not reach the database's CHECK constraint and turn
    // into a 500 during signup.
    //
    // `vn` is the serialized key -- the first cut of this test wrote `vendor`,
    // which the parser never reads, so it returned null for an unrelated
    // missing field and would have passed with the allowlist deleted.
    const valid = JSON.parse(
      decodeURIComponent(
        serializeAttributionCookie(buildAttributionRecord(ARRIVAL) as AttributionRecord)
      )
    );
    for (const vn of ["'; DROP TABLE businesses; --", "doubleclick", "", null, 1]) {
      expect(
        parseAttributionCookie(encodeURIComponent(JSON.stringify({ ...valid, vn }))),
        `vendor ${JSON.stringify(vn)} should be rejected`
      ).toBeNull();
    }
  });

  test("a forged consent category is rejected", () => {
    const valid = JSON.parse(
      decodeURIComponent(
        serializeAttributionCookie(buildAttributionRecord(ARRIVAL) as AttributionRecord)
      )
    );
    for (const cc of ["everything", "", null, "analytics ", 1]) {
      expect(
        parseAttributionCookie(encodeURIComponent(JSON.stringify({ ...valid, cc }))),
        `category ${JSON.stringify(cc)} should be rejected`
      ).toBeNull();
    }
  });

  test("each rejection is caused by the field it names", () => {
    // The guard against this whole class of defect: prove the baseline parses,
    // so any null below is attributable to the single edited field.
    const valid = JSON.parse(
      decodeURIComponent(
        serializeAttributionCookie(buildAttributionRecord(ARRIVAL) as AttributionRecord)
      )
    );
    expect(parseAttributionCookie(encodeURIComponent(JSON.stringify(valid)))).not.toBeNull();
    expect(
      parseAttributionCookie(encodeURIComponent(JSON.stringify({ ...valid, lp: null })))
    ).toBeNull();
  });
});

describe("the cookie cannot be made huge", () => {
  /**
   * The cookie rides on EVERY request to both `stampeo.app` and
   * `app.stampeo.app`, alongside the chunked Supabase auth cookies, for 182
   * days. A crafted landing link — `?gclid=x&utm_campaign=<4KB>` — could plant
   * one big enough to push the victim over the request-header ceiling and give
   * them persistent 400/431 on the dashboard until they cleared it by hand.
   *
   * The 512-char field cap existed only server-side, AFTER the cookie had
   * already been set, so it protected the row and not the visitor.
   */
  const HUGE = "x".repeat(4000);

  test("an oversized campaign is truncated, not stored whole", () => {
    const record = buildAttributionRecord({
      ...ARRIVAL,
      search: `?gclid=abc123&utm_campaign=${HUGE}`,
    }) as AttributionRecord;
    expect(record).not.toBeNull();
    expect(record.utmCampaign!.length).toBeLessThanOrEqual(128);
  });

  test("the serialized cookie stays within a sane budget", () => {
    const record = buildAttributionRecord({
      ...ARRIVAL,
      search: `?gclid=${HUGE}&utm_campaign=${HUGE}&utm_source=${HUGE}&utm_term=${HUGE}&utm_content=${HUGE}&utm_medium=${HUGE}`,
      landingVariant: HUGE,
      referrer: `https://${"y".repeat(200)}.example.com/`,
    }) as AttributionRecord;
    expect(serializeAttributionCookie(record).length).toBeLessThanOrEqual(2048);
  });

  test("a real-length click id is never truncated", () => {
    // fbclid runs past 100 characters. Truncating one produces an identifier
    // that still looks like data and attributes to nothing — strictly worse
    // than not capturing it, so the ids get their own, larger budget.
    const realistic = `IwAR${"3".repeat(150)}`;
    const record = buildAttributionRecord({
      ...ARRIVAL,
      search: `?fbclid=${realistic}`,
      consent: { analytics: false, marketing: true },
    }) as AttributionRecord;
    expect(record.clickId).toBe(realistic);
    expect(record.vendor).toBe("meta");
  });

  test("the attribution survives truncation rather than being dropped", () => {
    // A long campaign name is a reason to shorten it, never a reason to lose
    // the click that paid for the visit.
    const record = buildAttributionRecord({
      ...ARRIVAL,
      search: `?gclid=abc123&utm_campaign=${HUGE}`,
    }) as AttributionRecord;
    expect(record.clickId).toBe("abc123");
    expect(record.vendor).toBe("google");
  });
});

/* =========================================================================
 * AC1 — the CARRIER, not the content.
 *
 * Added 2026-09-20, closing the gap-report's first row: `writeAttributionRecord`
 * and `attributionCookieAttributes` were imported by NO test. Everything above
 * pins what goes IN the cookie; nothing pinned the cookie itself.
 *
 * The `Domain` attribute is the single point the whole cross-domain design
 * rests on. Drop it and the cookie becomes host-only on the marketing site,
 * `web/` on app.stampeo.app can never read it, and the funnel dies silently --
 * no error, no row, just attribution that reads "direct" forever.
 * ====================================================================== */

describe("the attribution cookie as a carrier", () => {
  const record = (search: string, capturedAt = 1_700_000_000): AttributionRecord => {
    const built = buildAttributionRecord({
      search,
      gaClientId: "GA1.1.1234567890.1700000000",
      landingPath: "/us/pricing",
      landingVariant: "b",
      referrer: "https://www.google.com/",
      consent: { analytics: true, marketing: true },
      consentVersion: 2,
      consentRegime: "opt-in",
      consentAt: 1_700_000_000,
      capturedAt,
    });
    expect(built).not.toBeNull();
    return built as AttributionRecord;
  };

  /** A jar that actually stores — a write-only fake makes every write look failed. */
  function installJar(): { writes: string[]; restore: () => void } {
    const previous = Object.getOwnPropertyDescriptor(globalThis, "document");
    const writes: string[] = [];
    const jar = new Map<string, string>();
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        get cookie() {
          return [...jar].map(([n, v]) => `${n}=${v}`).join("; ");
        },
        set cookie(value: string) {
          writes.push(value);
          const pair = value.split(";")[0].trim();
          const split = pair.indexOf("=");
          if (split !== -1) jar.set(pair.slice(0, split), pair.slice(split + 1));
        },
      },
    });
    return {
      writes,
      restore: () => {
        if (previous) Object.defineProperty(globalThis, "document", previous);
        else delete (globalThis as Record<string, unknown>).document;
      },
    };
  }

  const withCookieDomain = <T,>(domain: string | undefined, run: () => T): T => {
    const previous = process.env.NEXT_PUBLIC_COOKIE_DOMAIN;
    if (domain === undefined) delete process.env.NEXT_PUBLIC_COOKIE_DOMAIN;
    else process.env.NEXT_PUBLIC_COOKIE_DOMAIN = domain;
    try {
      return run();
    } finally {
      if (previous === undefined) delete process.env.NEXT_PUBLIC_COOKIE_DOMAIN;
      else process.env.NEXT_PUBLIC_COOKIE_DOMAIN = previous;
    }
  };

  test("the cookie is scoped to the shared parent domain", () => {
    const attrs = withCookieDomain(".stampeo.app", () =>
      attributionCookieAttributes(record("?gclid=abc123")),
    );

    expect(attrs.domain).toBe(".stampeo.app");
    expect(attrs.name).toBe(ATTRIBUTION_COOKIE);
    expect(attrs.path).toBe("/");
    // Lax, not Strict: the visitor arrives by following a link from an ad.
    expect(attrs.sameSite).toBe("lax");
  });

  test("an unset cookie domain leaves the attribute off rather than guessing", () => {
    // Local dev has no shared parent. `Domain=undefined` would be a malformed
    // attribute; omitting it gives a host-only cookie, correct for localhost.
    const attrs = withCookieDomain(undefined, () =>
      attributionCookieAttributes(record("?gclid=abc123")),
    );

    expect(attrs.domain).toBeUndefined();
  });

  test("the written cookie carries Domain, Path, Max-Age and SameSite", () => {
    const jar = installJar();
    try {
      withCookieDomain(".stampeo.app", () => writeAttributionRecord(record("?gclid=abc123")));

      expect(jar.writes.length).toBe(1);
      const cookie = jar.writes[0];
      expect(cookie).toContain(`${ATTRIBUTION_COOKIE}=`);
      expect(cookie).toContain("; Domain=.stampeo.app");
      expect(cookie).toContain("; Path=/");
      expect(cookie).toContain("; SameSite=Lax");
      // Six months, so a signup weeks after the click still carries the ad.
      expect(cookie).toContain(`; Max-Age=${60 * 60 * 24 * 182}`);
    } finally {
      jar.restore();
    }
  });

  test("first touch wins — a later visit does not overwrite the ad click", () => {
    const jar = installJar();
    try {
      withCookieDomain(".stampeo.app", () => {
        writeAttributionRecord(record("?gclid=abc123"));
        // The organic return visit, a day later. Must not erase the gclid.
        writeAttributionRecord(record("", 1_700_086_400));
      });

      expect(jar.writes.length).toBe(1);
      expect(jar.writes[0]).toContain("abc123");
    } finally {
      jar.restore();
    }
  });

  test("a blocked cookie jar costs attribution, never the pageview", () => {
    const previous = Object.getOwnPropertyDescriptor(globalThis, "document");
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        get cookie() {
          return "";
        },
        set cookie(_value: string) {
          throw new Error("storage blocked");
        },
      },
    });

    try {
      expect(() =>
        withCookieDomain(".stampeo.app", () => writeAttributionRecord(record("?gclid=abc123"))),
      ).not.toThrow();
    } finally {
      if (previous) Object.defineProperty(globalThis, "document", previous);
      else delete (globalThis as Record<string, unknown>).document;
    }
  });
});

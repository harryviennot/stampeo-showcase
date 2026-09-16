/**
 * The consent gate: what a visitor is taken to have agreed to, and why.
 *
 * Two rules drive every case below.
 *
 * 1. ABSENCE OF CONSENT IS NOT CONSENT. Anything unknown — no cookie, a
 *    corrupt cookie, a country we cannot place, the server render — resolves
 *    to denied. A regression here is legal exposure, not a bug, which is why
 *    the denying paths are tested far more heavily than the granting one.
 *
 * 2. THE REGIME IS THE EXCEPTION, NOT THE RULE. Only a visitor we can place in
 *    the US gets the opt-out treatment; as of 2026 no US state law requires a
 *    prior-consent banner, while the EU, UK and Switzerland all do. Every
 *    other country, and every country we failed to detect, is opt-in.
 *
 * Region comes from the timezone, never from the IP: see the header of
 * `lib/market-suggestion.ts` for why this codebase geo-detects on the client
 * or not at all.
 */

import { describe, expect, test } from "bun:test";
import {
  CONSENT_COOKIE,
  CONSENT_VERSION,
  consentCookieAttributes,
  consentRecordFromCookieHeader,
  consentRegimeForCountry,
  consentSurface,
  cookieNamesToClear,
  parseConsentCookie,
  resolveConsent,
  serializeConsentCookie,
  type ConsentRecord,
} from "./consent";

const GRANTED: ConsentRecord = {
  v: CONSENT_VERSION,
  analytics: true,
  marketing: true,
  at: 1_758_019_200,
  regime: "opt-in",
};

const DENIED: ConsentRecord = { ...GRANTED, analytics: false, marketing: false };

describe("consentRegimeForCountry", () => {
  test("a US visitor is opt-out", () => {
    expect(consentRegimeForCountry("US")).toBe("opt-out");
    expect(consentRegimeForCountry("us")).toBe("opt-out");
    expect(consentRegimeForCountry(" US ")).toBe("opt-out");
  });

  test("Europe is opt-in", () => {
    for (const country of ["FR", "ES", "PL", "DE", "GB", "CH", "IE"]) {
      expect(consentRegimeForCountry(country)).toBe("opt-in");
    }
  });

  test("a country outside both blocs is opt-in", () => {
    // Quebec's Law 25 and Brazil's LGPD are closer to the EU than to the US,
    // and the rest of the world is too small a slice to be worth a table.
    for (const country of ["CA", "BR", "JP", "AU", "MA"]) {
      expect(consentRegimeForCountry(country)).toBe("opt-in");
    }
  });

  test("an undetectable country is opt-in, never a guess", () => {
    // This is the server render, a timezone we do not map, and a browser that
    // refuses Intl. All of them must land on the strict side.
    for (const bad of [null, undefined, "", "  ", "U", "USA"]) {
      expect(consentRegimeForCountry(bad)).toBe("opt-in");
    }
  });
});

describe("resolveConsent", () => {
  test("no choice in an opt-in region denies everything", () => {
    expect(resolveConsent({ record: null, regime: "opt-in", gpc: false })).toEqual({
      analytics: false,
      marketing: false,
    });
  });

  test("no choice in an opt-out region grants everything", () => {
    // The US default. Tags load on arrival; the notice tells them so and the
    // footer lets them opt out.
    expect(resolveConsent({ record: null, regime: "opt-out", gpc: false })).toEqual({
      analytics: true,
      marketing: true,
    });
  });

  test("Global Privacy Control denies, in BOTH regimes", () => {
    // Twelve US states require honouring GPC automatically, with no banner and
    // no confirmation. In the EU it is a plain objection signal.
    for (const regime of ["opt-in", "opt-out"] as const) {
      expect(resolveConsent({ record: null, regime, gpc: true })).toEqual({
        analytics: false,
        marketing: false,
      });
    }
  });

  test("an explicit choice beats GPC", () => {
    // Someone who was sent GPC by their browser and then deliberately clicked
    // Accept has said the more specific thing. Order matters: record first.
    expect(resolveConsent({ record: GRANTED, regime: "opt-in", gpc: true })).toEqual({
      analytics: true,
      marketing: true,
    });
  });

  test("an explicit refusal survives an opt-out region", () => {
    // A US visitor who opted out must not be re-granted by the regime default.
    expect(resolveConsent({ record: DENIED, regime: "opt-out", gpc: false })).toEqual({
      analytics: false,
      marketing: false,
    });
  });

  test("the two categories are independent", () => {
    const mixed: ConsentRecord = { ...GRANTED, marketing: false };
    expect(resolveConsent({ record: mixed, regime: "opt-in", gpc: false })).toEqual({
      analytics: true,
      marketing: false,
    });
  });
});

describe("consentSurface", () => {
  const base = { record: null, gpc: false, trackable: true } as const;

  test("an opt-in visitor with no choice gets the banner", () => {
    expect(consentSurface({ ...base, regime: "opt-in" })).toBe("banner");
  });

  test("an opt-out visitor with no choice gets the notice, not the banner", () => {
    expect(consentSurface({ ...base, regime: "opt-out" })).toBe("notice");
  });

  test("GPC silences the US notice entirely", () => {
    // They have already told us. Asking again would be noise, and the notice
    // says "we use cookies", which by then is no longer true for them.
    expect(consentSurface({ ...base, regime: "opt-out", gpc: true })).toBe("none");
  });

  test("GPC does NOT silence the EU banner", () => {
    // Denied by default, but they may still want to opt in deliberately, and
    // under the ePrivacy rules the choice has to be offered.
    expect(consentSurface({ ...base, regime: "opt-in", gpc: true })).toBe("banner");
  });

  test("a stored choice silences both surfaces", () => {
    for (const regime of ["opt-in", "opt-out"] as const) {
      expect(consentSurface({ ...base, record: DENIED, regime })).toBe("none");
      expect(consentSurface({ ...base, record: GRANTED, regime })).toBe("none");
    }
  });

  test("nothing is shown on an untrackable page", () => {
    // A business's QR enrollment page. No tag fires there, so there is nothing
    // to ask about, and the banner would be interrupting someone else's
    // customer mid-signup.
    expect(consentSurface({ ...base, regime: "opt-in", trackable: false })).toBe("none");
    expect(consentSurface({ ...base, regime: "opt-out", trackable: false })).toBe("none");
  });
});

describe("parseConsentCookie", () => {
  test("a value written by this version round-trips", () => {
    const raw = serializeConsentCookie(GRANTED);
    expect(parseConsentCookie(raw)).toEqual(GRANTED);
  });

  test("a refusal round-trips as a refusal, not as an absence", () => {
    // The distinction that stops us re-asking a refuser on every page view.
    const raw = serializeConsentCookie(DENIED);
    expect(parseConsentCookie(raw)).toEqual(DENIED);
  });

  test("garbage parses to null and never throws", () => {
    for (const bad of [
      null,
      undefined,
      "",
      "   ",
      "%7Bnope",
      "{",
      "not json at all",
      "%",
      encodeURIComponent("[]"),
      encodeURIComponent("null"),
      encodeURIComponent('"granted"'),
      encodeURIComponent("{}"),
    ]) {
      expect(() => parseConsentCookie(bad)).not.toThrow();
      expect(parseConsentCookie(bad)).toBeNull();
    }
  });

  test("a cookie from an older consent version is treated as absent", () => {
    // Bumping CONSENT_VERSION is how a new vendor gets re-consented. A stale
    // record must re-ask rather than silently cover a tracker nobody agreed to.
    const stale = encodeURIComponent(
      JSON.stringify({ v: CONSENT_VERSION - 1, a: 1, m: 1, t: 1, r: "opt-in" }),
    );
    expect(parseConsentCookie(stale)).toBeNull();
  });

  test("a record missing its choices is treated as absent", () => {
    const partial = encodeURIComponent(JSON.stringify({ v: CONSENT_VERSION, t: 1 }));
    expect(parseConsentCookie(partial)).toBeNull();
  });

  test("the audit fields are tolerated when missing, the choices are not", () => {
    // `t` and `r` exist to evidence the choice, not to make it. Losing them is
    // not a reason to re-interrupt a visitor who already answered.
    const noAudit = encodeURIComponent(JSON.stringify({ v: CONSENT_VERSION, a: 1, m: 0 }));
    expect(parseConsentCookie(noAudit)).toEqual({
      v: CONSENT_VERSION,
      analytics: true,
      marketing: false,
      at: 0,
      regime: "opt-in",
    });
  });

  test("a truthy-but-not-1 choice does not count as consent", () => {
    // "yes", 2 and "true" are not values we write. Anything we did not write
    // is a corrupt or forged cookie, and consent is not inferred from it.
    for (const value of ["yes", 2, "true", {}, []]) {
      const raw = encodeURIComponent(
        JSON.stringify({ v: CONSENT_VERSION, a: value, m: 0, t: 1, r: "opt-in" }),
      );
      expect(parseConsentCookie(raw)).toBeNull();
    }
  });
});

describe("consentRecordFromCookieHeader", () => {
  test("finds the consent cookie among the others we set", () => {
    const header = `NEXT_LOCALE=fr; stampeo_market=us; ${CONSENT_COOKIE}=${serializeConsentCookie(GRANTED)}; stampeo_last_login=%7B%7D`;
    expect(consentRecordFromCookieHeader(header)).toEqual(GRANTED);
  });

  test("is not fooled by a cookie whose name merely ends in ours", () => {
    // `x_stampeo_consent=…` is not our cookie, and reading it as ours would
    // let any other cookie on the domain grant consent on the visitor's behalf.
    const header = `x_${CONSENT_COOKIE}=${serializeConsentCookie(GRANTED)}`;
    expect(consentRecordFromCookieHeader(header)).toBeNull();
  });

  test("an empty or absent header is no choice", () => {
    for (const header of ["", "   ", "NEXT_LOCALE=fr", null, undefined]) {
      expect(consentRecordFromCookieHeader(header)).toBeNull();
    }
  });
});

describe("consentCookieAttributes", () => {
  const attrs = consentCookieAttributes(GRANTED);

  test("expires after six months, so the choice is re-asked but not re-nagged", () => {
    // CNIL: a choice may stand for at most six months. That applies to a
    // REFUSAL too — re-asking a refuser on every visit is the dark pattern the
    // rule exists to stop.
    expect(attrs.maxAge).toBe(60 * 60 * 24 * 182);
  });

  test("is readable by the page that has to act on it", () => {
    // Deliberately not httpOnly: the gate runs in the browser and the value is
    // a preference, not a credential.
    expect(attrs.name).toBe(CONSENT_COOKIE);
    expect(attrs.path).toBe("/");
    expect(attrs.sameSite).toBe("lax");
  });
});

describe("cookieNamesToClear", () => {
  const present = [
    "NEXT_LOCALE",
    "stampeo_market",
    CONSENT_COOKIE,
    "_ga",
    "_ga_ABC123",
    "_gid",
    "_fbp",
    "_fbc",
    "_ttp",
    // STA-323. First-party by origin, tracker by content: it carries the ad
    // platforms' click ids and the GA client id, so revoking must delete it.
    "stampeo_attribution",
  ];

  test("revoking marketing clears the marketing cookies only", () => {
    expect(cookieNamesToClear(["marketing"], present).sort()).toEqual([
      "_fbc",
      "_fbp",
      // STA-323: the attribution carrier holds click ids, so marketing owns it too.
      "_ttp",
      "stampeo_attribution",
    ].sort());
  });

  test("revoking analytics expands the per-property GA prefix", () => {
    // GA4 writes one `_ga_<MEASUREMENT_ID>` per property, so a literal list
    // would leave the actual session cookie behind and the visitor would stay
    // identified after opting out.
    expect(cookieNamesToClear(["analytics"], present).sort()).toEqual([
      "_ga",
      "_ga_ABC123",
      "_gid",
      // STA-323: it can also hold the GA client id, so analytics owns it too.
      "stampeo_attribution",
    ].sort());
  });

  test("never clears our own cookies", () => {
    // Clearing the consent cookie while acting on it would erase the refusal
    // we just recorded and show the banner again on the next page.
    const cleared = cookieNamesToClear(["analytics", "marketing"], present);
    for (const ours of [CONSENT_COOKIE, "NEXT_LOCALE", "stampeo_market"]) {
      expect(cleared).not.toContain(ours);
    }
  });

  test("only names cookies that are actually there", () => {
    expect(cookieNamesToClear(["analytics", "marketing"], ["_fbp"])).toEqual(["_fbp"]);
    expect(cookieNamesToClear(["analytics", "marketing"], [])).toEqual([]);
  });
});

/* -------------------------------------------------------------------------
 * The browser half.
 *
 * `bun test lib` has no DOM, so these install the two globals the module
 * actually touches — `document.cookie` and a `window` that is an EventTarget
 * with a hostname. That is enough to pin the parts the React components only
 * wire up: the cookie string we write, the cookies we delete, and the event
 * name three other issues are blocked on.
 * ---------------------------------------------------------------------- */

import { afterEach } from "bun:test";
import {
  CONSENT_CHANGED_EVENT,
  CONSENT_OPEN_EVENT,
  clearCookiesFor,
  detectConsentRegime,
  detectGpc,
  emitConsentChange,
  hasAnalyticsConsent,
  hasMarketingConsent,
  readConsentRecord,
  subscribeToConsentChange,
  writeConsentRecord,
} from "./consent";

interface FakeBrowser {
  /** Every value assigned to `document.cookie`, in order. */
  writes: string[];
  setJar: (value: string) => void;
}

/**
 * A cookie jar that actually stores, because a write-only fake lies.
 *
 * The first version of this helper only recorded assignments and never updated
 * `document.cookie`, so every write looked to the module like a write that had
 * failed. That made the storage-failure fallback engage in tests that were
 * meant to exercise the happy path, and made the cleanup helper below do the
 * exact opposite of its name.
 */
function parseJar(cookie: string): Map<string, string> {
  const jar = new Map<string, string>();
  for (const entry of cookie.split(";")) {
    const trimmed = entry.trim();
    if (!trimmed) continue;
    const split = trimmed.indexOf("=");
    if (split === -1) continue;
    jar.set(trimmed.slice(0, split), trimmed.slice(split + 1));
  }
  return jar;
}

function installBrowser(options: { cookie?: string; gpc?: boolean } = {}): FakeBrowser {
  const writes: string[] = [];
  let jar = parseJar(options.cookie ?? "");

  const document = {
    get cookie() {
      return [...jar].map(([name, value]) => `${name}=${value}`).join("; ");
    },
    set cookie(value: string) {
      writes.push(value);
      const [pair, ...attributes] = value.split(";");
      const split = pair.indexOf("=");
      const name = pair.slice(0, split).trim();
      // A real browser removes the cookie rather than storing the expiry, and
      // `clearCookiesFor` depends on that being what deletion looks like.
      if (attributes.some((a) => a.trim().toLowerCase() === "max-age=0")) jar.delete(name);
      else jar.set(name, pair.slice(split + 1));
    },
  };

  const window = Object.assign(new EventTarget(), {
    location: { hostname: "dev.stampeo.app" },
  });

  const navigator = { globalPrivacyControl: options.gpc };

  for (const [name, value] of Object.entries({ document, window, navigator })) {
    Object.defineProperty(globalThis, name, { value, configurable: true, writable: true });
  }

  return { writes, setJar: (value: string) => (jar = parseJar(value)) };
}

function uninstallBrowser() {
  for (const name of ["document", "window", "navigator"]) {
    Reflect.deleteProperty(globalThis, name);
  }
}

afterEach(uninstallBrowser);

describe("the event seam STA-318, STA-319 and STA-320 subscribe to", () => {
  test("the event names are part of the contract, not an implementation detail", () => {
    // Three unbuilt issues will listen for these exact strings. Renaming one is
    // a silent break in code that is not in this repo yet, so the name is
    // pinned here rather than discovered later by a pixel that never loads.
    expect(CONSENT_CHANGED_EVENT).toBe("stampeo:consent");
    expect(CONSENT_OPEN_EVENT).toBe("stampeo:consent-open");
  });

  test("a committed choice reaches a subscriber, carrying the new state", () => {
    installBrowser();
    const seen: unknown[] = [];
    const unsubscribe = subscribeToConsentChange(() => seen.push("fired"));

    let detail: unknown = null;
    window.addEventListener(CONSENT_CHANGED_EVENT, (event) => {
      detail = (event as CustomEvent).detail;
    });

    emitConsentChange({ analytics: true, marketing: false });

    expect(seen).toEqual(["fired"]);
    // The detail is how a pixel loader knows WHICH category was granted without
    // re-reading the cookie it may not be allowed to read yet.
    expect(detail).toEqual({ analytics: true, marketing: false });
    unsubscribe();
  });

  test("unsubscribing actually detaches", () => {
    installBrowser();
    let count = 0;
    const unsubscribe = subscribeToConsentChange(() => count++);
    emitConsentChange({ analytics: true, marketing: true });
    unsubscribe();
    emitConsentChange({ analytics: false, marketing: false });
    expect(count).toBe(1);
  });

  test("subscribing off the browser is a no-op that still returns a function", () => {
    // Imported by a server component during the build. Returning undefined here
    // would crash React's cleanup phase rather than the import.
    expect(() => subscribeToConsentChange(() => {})()).not.toThrow();
  });
});

describe("writeConsentRecord", () => {
  test("writes a cookie the site can read back", () => {
    const browser = installBrowser();
    const record = writeConsentRecord({ analytics: true, marketing: false }, "opt-in");

    expect(browser.writes).toHaveLength(1);
    const cookie = browser.writes[0];
    expect(cookie.startsWith(`${CONSENT_COOKIE}=`)).toBe(true);
    expect(cookie).toContain("Path=/");
    expect(cookie).toContain("SameSite=Lax");
    // Six months, in seconds. Spelled out because CNIL's ceiling is the reason
    // the number is this and not "a year like every other cookie we set".
    expect(cookie).toContain(`Max-Age=${60 * 60 * 24 * 182}`);

    // Round-trips through the reader without the test hand-feeding the jar,
    // which is what the next page load actually does.
    expect(readConsentRecord()).toEqual(record);
  });

  test("stamps the moment of the click, not a fixed value", () => {
    installBrowser();
    const before = Math.floor(Date.now() / 1000);
    const record = writeConsentRecord({ analytics: false, marketing: false }, "opt-out");
    expect(record.at).toBeGreaterThanOrEqual(before);
    expect(record.regime).toBe("opt-out");
  });

  /** A jar that accepts nothing, the way private mode behaves. */
  function installUnwritableBrowser(mode: "throws" | "silent") {
    Object.defineProperty(globalThis, "document", {
      value: {
        get cookie() {
          return "";
        },
        set cookie(_value: string) {
          if (mode === "throws") throw new Error("storage refused");
          // "silent": accepted and dropped, which is what a browser does to a
          // Secure cookie over plain http.
        },
      },
      configurable: true,
      writable: true,
    });
    Object.defineProperty(globalThis, "window", {
      value: Object.assign(new EventTarget(), { location: { hostname: "stampeo.app" } }),
      configurable: true,
      writable: true,
    });
  }

  /**
   * Leaves the module's in-memory fallback empty again.
   *
   * The fallback only survives a FAILED write, so this performs a successful
   * one against a jar that really stores. Without it, a refusal recorded by the
   * storage-failure tests would leak into any later test that expects an empty
   * jar to mean "never answered", and those tests would pass or fail depending
   * on the order they ran in.
   *
   * It asserts that it worked rather than assuming it: a cleanup helper that
   * quietly does nothing is worse than no cleanup helper, because it makes the
   * leak look impossible.
   */
  function clearSessionFallback() {
    installBrowser();
    writeConsentRecord({ analytics: false, marketing: false }, "opt-in");
    uninstallBrowser();

    installBrowser();
    expect(readConsentRecord()).toBeNull();
    uninstallBrowser();
  }

  test("a browser that refuses storage does not break the click", () => {
    // A thrown error inside the click handler would be a dead button.
    installUnwritableBrowser("throws");
    expect(() => writeConsentRecord({ analytics: false, marketing: false }, "opt-in")).not.toThrow();
    clearSessionFallback();
  });

  test("a refusal the browser will not store is still honoured on this page", () => {
    // The bug this exists to stop: the write fails, the reader re-reads an
    // unchanged jar, and the banner never goes away. Clicking Refuse looks
    // broken, and under the opt-out regime it is worse than cosmetic, because
    // a refusal that cannot be stored resolves straight back to granted.
    installUnwritableBrowser("throws");

    writeConsentRecord({ analytics: false, marketing: false }, "opt-out");

    expect(readConsentRecord()).toMatchObject({ analytics: false, marketing: false });
    expect(hasAnalyticsConsent()).toBe(false);
    expect(hasMarketingConsent()).toBe(false);
    clearSessionFallback();
  });

  test("a write that fails SILENTLY is caught too", () => {
    // Not every refusal throws. A browser may accept the assignment and drop
    // the cookie, so the write is verified by reading the jar back rather than
    // by trusting that no exception was raised.
    installUnwritableBrowser("silent");

    writeConsentRecord({ analytics: true, marketing: true }, "opt-in");

    expect(readConsentRecord()).toMatchObject({ analytics: true, marketing: true });
    clearSessionFallback();
  });

  test("a stored cookie always outranks the in-memory fallback", () => {
    // The fallback must never shadow a choice made in another tab. It exists
    // only while the cookie cannot be written, and clears as soon as one can.
    installUnwritableBrowser("throws");
    writeConsentRecord({ analytics: true, marketing: true }, "opt-in");
    uninstallBrowser();

    const browser = installBrowser();
    browser.setJar(`${CONSENT_COOKIE}=${serializeConsentCookie(DENIED)}`);

    expect(readConsentRecord()).toEqual(DENIED);
    clearSessionFallback();
  });

  test("off the browser it records nothing and still returns the record", () => {
    const record = writeConsentRecord({ analytics: true, marketing: true }, "opt-in");
    expect(record.v).toBe(CONSENT_VERSION);
  });
});

describe("consentCookieAttributes: the two fields that decide where the cookie works", () => {
  const originalEnv = process.env.NODE_ENV;
  const originalDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    if (originalDomain === undefined) delete process.env.NEXT_PUBLIC_COOKIE_DOMAIN;
    else process.env.NEXT_PUBLIC_COOKIE_DOMAIN = originalDomain;
  });

  test("carries the configured domain, so the dashboard can read the same choice", () => {
    // Shared with lib/last-login.ts. Without a Domain the cookie is host-only,
    // and the choice silently stops crossing to app.stampeo.app.
    process.env.NEXT_PUBLIC_COOKIE_DOMAIN = ".stampeo.app";
    expect(consentCookieAttributes(GRANTED).domain).toBe(".stampeo.app");
  });

  test("omits Domain entirely when none is configured", () => {
    // Browsers drop a cookie with a Domain they consider invalid, so an empty
    // string must become "no attribute", not "Domain=".
    delete process.env.NEXT_PUBLIC_COOKIE_DOMAIN;
    expect(consentCookieAttributes(GRANTED).domain).toBeUndefined();
  });

  test("is Secure in production and not in local dev", () => {
    // Secure on http://localhost would make the cookie unwritable there, which
    // reads as "the banner never remembers anything" during development.
    process.env.NODE_ENV = "production";
    expect(consentCookieAttributes(GRANTED).secure).toBe(true);
    process.env.NODE_ENV = "development";
    expect(consentCookieAttributes(GRANTED).secure).toBe(false);
  });
});

describe("clearCookiesFor", () => {
  test("issues an expiry for each matching cookie, across every plausible scope", () => {
    const browser = installBrowser({
      cookie: `NEXT_LOCALE=fr; ${CONSENT_COOKIE}=x; _fbp=abc; _ttp=def; _ga=ghi; stampeo_attribution=jkl`,
    });

    clearCookiesFor(["marketing"]);

    const cleared = new Set(browser.writes.map((w) => w.split("=")[0]));
    expect(cleared).toEqual(new Set(["_fbp", "_ttp", "stampeo_attribution"]));
    // And they are actually gone from the jar, not merely written at.
    expect(document.cookie).not.toContain("_fbp=");
    expect(document.cookie).not.toContain("_ttp=");
    expect(document.cookie).toContain("_ga=");
    // Every write must actually expire the cookie. A Max-Age we forgot would
    // look like a successful revocation and change nothing.
    for (const write of browser.writes) expect(write).toContain("Max-Age=0");

    // A cookie can only be deleted with the Domain it was set with, and GA and
    // Meta pick their own, so each name is expired at more than one scope.
    const fbpScopes = browser.writes.filter((w) => w.startsWith("_fbp="));
    expect(fbpScopes.length).toBeGreaterThan(1);
    expect(fbpScopes.some((w) => w.includes("Domain=.stampeo.app"))).toBe(true);
  });

  test("never expires a cookie of ours", () => {
    const browser = installBrowser({
      cookie: `NEXT_LOCALE=fr; stampeo_market=us; ${CONSENT_COOKIE}=x; _ga=y`,
    });
    clearCookiesFor(["analytics", "marketing"]);
    const cleared = browser.writes.map((w) => w.split("=")[0]);
    expect(cleared).not.toContain(CONSENT_COOKIE);
    expect(cleared).not.toContain("NEXT_LOCALE");
    expect(cleared).not.toContain("stampeo_market");
  });

  test("off the browser it does nothing rather than throwing", () => {
    expect(() => clearCookiesFor(["analytics"])).not.toThrow();
  });
});

describe("detectGpc", () => {
  test("only an explicit true counts as a signal", () => {
    // `undefined` is "this browser has no opinion", not "opt me out", and
    // treating it as a signal would silently disable measurement everywhere.
    installBrowser({ gpc: true });
    expect(detectGpc()).toBe(true);
    uninstallBrowser();

    installBrowser({ gpc: false });
    expect(detectGpc()).toBe(false);
    uninstallBrowser();

    installBrowser();
    expect(detectGpc()).toBe(false);
  });

  test("off the browser there is no signal", () => {
    expect(detectGpc()).toBe(false);
  });
});

describe("detectConsentRegime", () => {
  const RealDateTimeFormat = Intl.DateTimeFormat;

  function withTimezone(timeZone: string | null, run: () => void) {
    installBrowser();
    // @ts-expect-error deliberately replacing the constructor for one case
    Intl.DateTimeFormat = function FakeDateTimeFormat() {
      if (timeZone === null) throw new Error("Intl unavailable");
      return { resolvedOptions: () => ({ timeZone }) };
    };
    try {
      run();
    } finally {
      Intl.DateTimeFormat = RealDateTimeFormat;
    }
  }

  test("a US timezone is opt-out", () => {
    withTimezone("America/New_York", () => expect(detectConsentRegime()).toBe("opt-out"));
  });

  test("a European timezone is opt-in", () => {
    withTimezone("Europe/Paris", () => expect(detectConsentRegime()).toBe("opt-in"));
  });

  test("a timezone we do not map is opt-in, never a guess", () => {
    // The table is a fixed list, so this is the common case for most of the
    // world, and it has to land on the strict side.
    withTimezone("Antarctica/Troll", () => expect(detectConsentRegime()).toBe("opt-in"));
  });

  test("a browser that throws on Intl is opt-in", () => {
    withTimezone(null, () => expect(detectConsentRegime()).toBe("opt-in"));
  });

  test("off the browser it is opt-in", () => {
    expect(detectConsentRegime()).toBe("opt-in");
  });
});

describe("the read seam the pixel issues consume", () => {
  test("both readers deny on the server", () => {
    // Imported into a server component during a static build. Answering "true"
    // here would bake a granted tag into HTML served to everyone.
    expect(hasAnalyticsConsent()).toBe(false);
    expect(hasMarketingConsent()).toBe(false);
  });

  test("each reader answers for its own category", () => {
    installBrowser({
      cookie: `${CONSENT_COOKIE}=${serializeConsentCookie({ ...GRANTED, marketing: false })}`,
    });
    expect(hasAnalyticsConsent()).toBe(true);
    expect(hasMarketingConsent()).toBe(false);
  });

  test("a granted cookie is overridden by nothing once it exists", () => {
    installBrowser({
      cookie: `${CONSENT_COOKIE}=${serializeConsentCookie(GRANTED)}`,
      gpc: true,
    });
    expect(hasAnalyticsConsent()).toBe(true);
  });
});

describe("CONSENT_VERSION", () => {
  test("is 1, the wire format written into the cookie", () => {
    // Every other test uses the constant, so a bump would pass them all while
    // silently invalidating every visitor's stored choice. Bumping it IS the
    // mechanism for re-consenting a new vendor, so it should be a deliberate
    // edit here and not a side effect.
    expect(CONSENT_VERSION).toBe(1);
    expect(serializeConsentCookie(GRANTED)).toContain("%22v%22%3A1");
  });
});

/**
 * The attribution carrier (STA-323).
 *
 * `stampeo_attribution` holds the ad platforms' click ids and the GA client id
 * and travels to app.stampeo.app, where it becomes a database row. If revoking
 * does not delete it, the identifiers still cross and are still stored after
 * the refusal — a revocation that looks effective and is not.
 *
 * It is listed under BOTH categories because it can hold fields bought by
 * either, and a record half-authorised is not authorised.
 */
describe("the attribution carrier is revocable (STA-323)", () => {
  const jar = ["_ga", "_fbp", "stampeo_attribution", CONSENT_COOKIE];

  test("revoking analytics alone clears it", () => {
    expect(cookieNamesToClear(["analytics"], jar)).toContain("stampeo_attribution");
  });

  test("revoking marketing alone clears it", () => {
    expect(cookieNamesToClear(["marketing"], jar)).toContain("stampeo_attribution");
  });

  test("revoking everything clears it exactly once", () => {
    // It appears in both category lists; the result must be de-duplicated or
    // the caller writes the same expiry twice.
    const cleared = cookieNamesToClear(["analytics", "marketing"], jar);
    expect(cleared.filter((n) => n === "stampeo_attribution")).toHaveLength(1);
  });

  test("the consent cookie itself is never cleared", () => {
    // Clearing it would erase the very refusal being acted on, and the visitor
    // would be asked again on the next page as though they had never answered.
    expect(cookieNamesToClear(["analytics", "marketing"], jar)).not.toContain(
      CONSENT_COOKIE
    );
  });
});

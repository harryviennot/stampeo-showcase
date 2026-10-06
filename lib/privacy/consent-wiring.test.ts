/**
 * The consent module, wired to the policy matrix.
 *
 * `lib/consent.ts` keeps its names and signatures; what changed is where the
 * answers come from. These cases follow a visitor through it: which row they
 * are in, how long their answer lives, what a refusal clears, and what is left
 * of a US refusal half a year later.
 */

import { afterEach, describe, expect, test } from "bun:test";

import {
  CONSENT_COOKIE,
  CONSENT_VERSION,
  clearCookiesFor,
  consentCookieAttributes,
  consentSurface,
  cookieNamesToClear,
  detectConsentRegime,
  parseConsentCookie,
  readConsentRecord,
  readStoredConsent,
  resolveConsent,
  serializeConsentCookie,
  writeConsentRecord,
  type ConsentRecord,
} from "../consent";
import { installFakeBrowser, type FakeBrowser } from "./__fixtures__/fake-browser";
import { POLICY_MATRIX } from "./policy-matrix";
import { detectPolicyRow } from "./region";
import { rowFor } from "./policy";

const DAY = 86_400;
const RECORD: ConsentRecord = {
  v: CONSENT_VERSION,
  analytics: true,
  marketing: true,
  at: 1_759_000_000,
  regime: "opt-out",
};

let browser: FakeBrowser | null = null;
afterEach(() => {
  browser?.restore();
  browser = null;
});

const region = (value: unknown) =>
  `stampeo_region=${encodeURIComponent(JSON.stringify(value))}`;

describe("which row a visitor is in, from what the browser can tell us", () => {
  test.each([
    ["a US timezone and no region cookie", "America/New_York", "", "US", "opt-out"],
    ["a Paris timezone and no region cookie", "Europe/Paris", "", "EEA_UK_CH", "opt-in"],
    ["a London timezone", "Europe/London", "", "EEA_UK_CH", "opt-in"],
    ["a Zurich timezone", "Europe/Zurich", "", "EEA_UK_CH", "opt-in"],
    ["an Oslo timezone", "Europe/Oslo", "", "EEA_UK_CH", "opt-in"],
    ["a Canary Islands timezone", "Atlantic/Canary", "", "EEA_UK_CH", "opt-in"],
    ["a timezone we do not map", "Antarctica/Troll", "", "UNKNOWN", "opt-in"],
    ["UTC", "Etc/UTC", "", "UNKNOWN", "opt-in"],
    ["a browser that refuses Intl", null, "", "UNKNOWN", "opt-in"],
    // `stampeo_region` is not read: nothing signs it, so a value in it is the visitor's own.
    ["a Paris timezone with a region cookie naming the US", "Europe/Paris", region({ c: "US", v: 1 }), "EEA_UK_CH", "opt-in"],
    ["a US timezone with a region cookie naming France", "America/New_York", region({ c: "FR", v: 1 }), "US", "opt-out"],
    ["an unmapped timezone with a region cookie naming the US", "Antarctica/Troll", region({ c: "US", v: 1 }), "UNKNOWN", "opt-in"],
    ["UTC with a region cookie naming the US", "Etc/UTC", region({ c: "US", v: 1 }), "UNKNOWN", "opt-in"],
  ] as const)("%s", (_case, timezone, cookie, row, regime) => {
    browser = installFakeBrowser({ timezone, cookie });

    expect(detectPolicyRow().key).toBe(row);
    expect(detectConsentRegime()).toBe(regime);
  });

  test("off the browser every visitor is held to the strict row", () => {
    expect(detectPolicyRow().key).toBe("UNKNOWN");
    expect(detectConsentRegime()).toBe("opt-in");
  });
});

describe("the choice carries the policy it was made under", () => {
  test("the policy version and row survive the cookie", () => {
    const record = { ...RECORD, policyVersion: 1, regionRow: "US" };
    expect(parseConsentCookie(serializeConsentCookie(record))).toEqual(record);
  });

  test.each([
    ["a row we do not have", { g: "MARS" }],
    ["a row that is not text", { g: 7 }],
    ["a policy version that is not a whole number", { p: "one" }],
    ["a policy version below 1", { p: 0 }],
  ])("%s is dropped, and the choice itself stands", (_case, extra) => {
    const raw = encodeURIComponent(
      JSON.stringify({ v: CONSENT_VERSION, a: 0, m: 1, t: 5, r: "opt-in", ...extra }),
    );
    const parsed = parseConsentCookie(raw);

    expect(parsed).toMatchObject({ analytics: false, marketing: true });
    expect(parsed?.policyVersion).toBeUndefined();
    expect(parsed?.regionRow).toBeUndefined();
  });
});

describe("how long the cookie lives", () => {
  test.each([
    ["a US refusal of marketing", "US", { analytics: true, marketing: false }, 400],
    ["a US refusal of everything", "US", { analytics: false, marketing: false }, 400],
    ["a US grant", "US", { analytics: true, marketing: true }, 182],
    ["a French refusal", "FR", { analytics: false, marketing: false }, 182],
    ["a French grant", "FR", { analytics: true, marketing: true }, 182],
  ] as const)("%s: %d days", (_case, country, state, days) => {
    const row = rowFor(country);
    const attrs = consentCookieAttributes({
      ...RECORD,
      ...state,
      regime: row.regime,
      regionRow: row.key,
    });
    expect(attrs.maxAge).toBe(days * DAY);
  });

  test("with no row given, the record's own regime picks the lifetime", () => {
    expect(consentCookieAttributes({ ...RECORD, marketing: false }).maxAge).toBe(400 * DAY);
    expect(
      consentCookieAttributes({ ...RECORD, marketing: false, regime: "opt-in" }).maxAge,
    ).toBe(182 * DAY);
  });
});

describe("a visitor's answer to what the page shows", () => {
  test("the row decides the surface, GPC included", () => {
    const base = { record: null, prior: null, trackable: true } as const;
    expect(consentSurface({ ...base, gpc: false, row: rowFor("FR") })).toBe("banner");
    expect(consentSurface({ ...base, gpc: false, row: rowFor("US") })).toBe("notice");
    expect(consentSurface({ ...base, gpc: true, row: rowFor("US") })).toBe("none");
  });

  test("the row decides what is agreed", () => {
    const resolve = (country: string, gpc = false) =>
      resolveConsent({
        record: null,
        prior: null,
        gpc,
        row: rowFor(country),
      });
    expect(resolve("US")).toEqual({ analytics: true, marketing: true });
    expect(resolve("US", true)).toEqual({ analytics: false, marketing: false });
    expect(resolve("FR")).toEqual({ analytics: false, marketing: false });
  });
});

describe("what a refusal clears (AC4.6)", () => {
  const JAR = [
    "NEXT_LOCALE",
    CONSENT_COOKIE,
    "stampeo_sid",
    "stampeo_region",
    "_ga",
    "_ga_ZFZ6JLPFXN",
    "_gid",
    "stampeo_ga",
    "_fbp",
    "_fbc",
    "_ttp",
    "stampeo_ad",
    "stampeo_src",
    "stampeo_attribution",
  ];

  test.each([
    [
      "marketing alone",
      ["marketing"],
      ["_fbp", "_fbc", "_ttp", "stampeo_ad", "stampeo_attribution"],
    ],
    [
      "analytics alone",
      ["analytics"],
      ["_ga", "_ga_ZFZ6JLPFXN", "_gid", "stampeo_ga", "stampeo_attribution"],
    ],
    [
      "both, which takes the campaign source too",
      ["analytics", "marketing"],
      [
        "_ga", "_ga_ZFZ6JLPFXN", "_gid", "stampeo_ga",
        "_fbp", "_fbc", "_ttp", "stampeo_ad",
        "stampeo_src", "stampeo_attribution",
      ],
    ],
  ] as const)("refusing %s", (_case, categories, cleared) => {
    expect(cookieNamesToClear(categories, JAR).sort()).toEqual([...cleared].sort());
  });

  test("our own consent, subject and region cookies are never cleared", () => {
    const cleared = cookieNamesToClear(["analytics", "marketing"], JAR);
    for (const ours of [CONSENT_COOKIE, "stampeo_sid", "stampeo_region", "NEXT_LOCALE"]) {
      expect(cleared).not.toContain(ours);
    }
  });

  test("refusing marketing on stampeo.app leaves the analytics carriers standing", () => {
    browser = installFakeBrowser({
      cookie: [
        `${CONSENT_COOKIE}=x`, "stampeo_sid=y", "stampeo_ga=1", "stampeo_src=2",
        "stampeo_ad=3", "_fbp=4", "_ga=5",
      ].join("; "),
      hostname: "stampeo.app",
    });

    clearCookiesFor(["marketing"]);

    const left = browser.jar();
    expect(left).not.toContain("stampeo_ad=");
    expect(left).not.toContain("_fbp=");
    for (const kept of [CONSENT_COOKIE, "stampeo_sid", "stampeo_ga", "stampeo_src", "_ga"]) {
      expect(left).toContain(`${kept}=`);
    }
    // The carriers live on the parent domain, so it has to be an expiry scope.
    expect(browser.writes.some((w) => w.startsWith("stampeo_ad=") && w.includes("Domain=.stampeo.app"))).toBe(true);
  });
});

describe("writeConsentRecord: the answer is kept, then handed to the server", () => {
  test("a refusal in the US lives 400 days and is written before the server hears of it", () => {
    browser = installFakeBrowser({ timezone: "America/New_York" });

    const record = writeConsentRecord({ analytics: true, marketing: false }, rowFor("US"));

    expect(browser.writes[0]).toContain(`Max-Age=${400 * DAY}`);
    expect(record).toMatchObject({ policyVersion: POLICY_MATRIX.version, regionRow: "US" });
  });

  test("the request is the cookie's own value, keepalive, with the subject asked for", () => {
    browser = installFakeBrowser({ timezone: "Europe/Paris" });

    const record = writeConsentRecord({ analytics: false, marketing: false }, rowFor("FR"));

    expect(browser.fetches).toHaveLength(1);
    const [call] = browser.fetches;
    expect(call.url).toBe("/api/privacy/cookies");
    expect(call.init).toMatchObject({ method: "POST", keepalive: true });
    expect(call.body).toEqual({
      consent: {
        v: CONSENT_VERSION, a: 0, m: 0, t: record.at, r: "opt-in",
        s: record.subjectId, p: POLICY_MATRIX.version, g: "EEA_UK_CH",
      },
      sid: "ensure",
    });
  });

  test.each(["reject", "throw"] as const)(
    "a request that fails (%s) costs nothing: the cookie already holds the choice",
    async (fetchMode) => {
      browser = installFakeBrowser({ timezone: "Europe/Paris", fetch: fetchMode });

      const record = writeConsentRecord({ analytics: true, marketing: true }, rowFor("FR"));
      await browser.settled();

      expect(readConsentRecord()).toEqual(record);
    },
  );

  test("a browser that refuses the cookie still honours the refusal on this page", () => {
    browser = installFakeBrowser({ timezone: "America/New_York", cookies: "silent" });

    writeConsentRecord({ analytics: false, marketing: false }, rowFor("US"));

    expect(readConsentRecord()).toMatchObject({ analytics: false, marketing: false });
    // Leave the in-memory fallback empty for whatever runs next.
    browser.restore();
    browser = installFakeBrowser();
    writeConsentRecord({ analytics: false, marketing: false }, rowFor("FR"));
    browser.restore();
    browser = null;
  });
});

describe("a US refusal outlives six months (AC2.1, AC2.2)", () => {
  function usVisitor() {
    const visitor = installFakeBrowser({ timezone: "America/New_York", fetch: "route" });
    return visitor;
  }

  test("refusing marketing: the server answer re-sets the cookie at 400 days, and it is still there at day 183", async () => {
    browser = usVisitor();

    writeConsentRecord({ analytics: true, marketing: false }, rowFor("US"));
    await browser.settled();
    expect(browser.events).toContain(`server-set:${CONSENT_COOKIE}`);

    browser.advanceDays(183);

    const stored = readStoredConsent();
    expect(stored.record).not.toBeNull();
    expect(
      resolveConsent({ ...stored, gpc: false, row: rowFor("US") }),
    ).toEqual({ analytics: true, marketing: false });
  });

  test("a US visitor who only dismissed the notice reverts to the default after 182 days", async () => {
    browser = usVisitor();

    writeConsentRecord({ analytics: true, marketing: true }, rowFor("US"));
    await browser.settled();
    browser.advanceDays(183);

    expect(readStoredConsent().record).toBeNull();
  });
});

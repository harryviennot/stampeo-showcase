/**
 * The call that tells the backend a new account was just confirmed.
 *
 * It carries three things the backend cannot get from the browser itself: the
 * subject that chains the visitor's consent decisions, the three carriers as
 * they are stored, and the identifier cookies as they are at that moment.
 * Which of them may leave the page is the visitor's choice, so each category's
 * values are left out unless the CURRENT resolved consent allows them.
 *
 * The backend decides who is eligible (an account under a day old, once per
 * user); nothing here asks whether the account is new.
 */

import { afterEach, describe, expect, test } from "bun:test";

import { CONSENT_COOKIE, CONSENT_VERSION } from "../consent";
import { POLICY_MATRIX } from "../privacy/policy-matrix";
import { SUBJECT as SID, installFakeBrowser, type FakeBrowser } from "../privacy/__fixtures__/fake-browser";
import { serializeAdCarrier } from "./ad-ids";
import { serializeGaCarrier } from "./ga-ids";
import { buildSignupBody, signupBasis } from "./signup-body";
import { recordAccountSignup } from "./signup-call";
import { serializeSourceCarrier } from "./source";
import { EU, FBP, GA_CID, LANDED, UNKNOWN, US, chose, plan, visitor, wireOf } from "./__fixtures__/visitors";

const GA_SESSION = "GS2.1.s1791244795$o1$g1$t1791244799$j0$l0$h0";
const MEASUREMENT_ID = "G-ZFZ6JLPFXN";

const written = plan(visitor(US));
const COOKIES = {
  stampeo_sid: SID,
  stampeo_src: serializeSourceCarrier(written.src!),
  stampeo_ga: serializeGaCarrier(written.ga!),
  stampeo_ad: serializeAdCarrier(written.ad!),
  _ga: `GA1.1.${GA_CID}`,
  _ga_ZFZ6JLPFXN: GA_SESSION,
  _fbp: FBP,
};

/** What a European who accepted everything left in their jar: the same carriers, under their own choice. */
const EU_WRITTEN = plan(visitor(EU, { record: chose(true, true, "opt-in") }));
const EU_COOKIES = {
  ...COOKIES,
  stampeo_src: serializeSourceCarrier(EU_WRITTEN.src!),
  stampeo_ga: serializeGaCarrier(EU_WRITTEN.ga!),
  stampeo_ad: serializeAdCarrier(EU_WRITTEN.ad!),
};

const jar = (over: Record<string, string | null> = {}, base: Record<string, string> = COOKIES) =>
  Object.entries({ ...base, ...over })
    .filter(([, value]) => value !== null)
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");

const ALL = { analytics: true, marketing: true };
const US_BASIS = { cr: "opt-out", p: POLICY_MATRIX.version, g: "US" } as const;

const body = (
  cookieHeader: string,
  consent = ALL,
  measurementId: string | null = MEASUREMENT_ID,
  basis: ReturnType<typeof signupBasis> = US_BASIS,
) => buildSignupBody({ cookieHeader, consent, measurementId, basis });

describe("the body, for a US visitor who never touched the notice", () => {
  test("carries the subject, the carriers as stored, and the identifiers as they are now", () => {
    expect(body(jar())).toEqual({
      consent_subject_id: SID,
      ad_attribution_v2: {
        src: wireOf(written.src),
        ga: wireOf(written.ga),
        ad: wireOf(written.ad),
      },
      basis: US_BASIS,
      refused: [],
      live: {
        ga: `GA1.1.${GA_CID}`,
        ga_sessions: { ZFZ6JLPFXN: GA_SESSION },
        fbp: FBP,
      },
    });
  });

  test("carries the raw `_fbc` when the pixel wrote one", () => {
    expect(body(jar({ _fbc: "fb.1.1791244800000.IwAR_TEST_fbclid_0001" })).live?.fbc).toBe(
      "fb.1.1791244800000.IwAR_TEST_fbclid_0001",
    );
  });

});

describe("the version-1 carrier, while a browser still holds one", () => {
  const V1 = { click_id: "IwAR_old", platform: "meta", ga_client_id: GA_CID, utm_source: "meta", captured_at: LANDED };
  const v1 = (value: unknown = V1) => ({ stampeo_attribution: encodeURIComponent(JSON.stringify(value)) });

  test("is forwarded as `ad_attribution`, next to the version-2 carriers", () => {
    const sent = body(jar(v1()));

    expect(sent.ad_attribution).toEqual(V1);
    expect(sent.ad_attribution_v2).toBeDefined();
  });

  test("is forwarded alone when no version-2 carrier exists", () => {
    const sent = body(jar({ stampeo_src: null, stampeo_ga: null, stampeo_ad: null, ...v1() }));

    expect(sent.ad_attribution).toEqual(V1);
    expect(sent).not.toHaveProperty("ad_attribution_v2");
  });

  test.each([
    ["analytics refused", { analytics: false, marketing: true }],
    ["marketing refused", { analytics: true, marketing: false }],
    ["both refused", { analytics: false, marketing: false }],
  ])("is left out when %s, because it holds both categories' identifiers", (_case, consent) => {
    expect(body(jar(v1()), consent)).not.toHaveProperty("ad_attribution");
  });

  test.each([
    ["a value that is not JSON", { stampeo_attribution: "%7Bnope" }],
    ["a list", v1([1, 2])],
    ["text", v1("granted")],
    ["an object past the cookie's size cap", v1({ click_id: "x".repeat(3000) })],
  ])("%s is left out", (_case, cookies) => {
    expect(body(jar(cookies))).not.toHaveProperty("ad_attribution");
  });
});

describe("what leaves the page follows the current choice", () => {
  test.each([
    [
      "an EU visitor who accepted analytics only",
      { analytics: true, marketing: false },
      ["src", "ga"],
      ["ga", "ga_sessions"],
    ],
    [
      "an EU visitor who accepted advertising only",
      { analytics: false, marketing: true },
      ["src", "ad"],
      ["fbp"],
    ],
    ["an EU visitor who accepted everything", ALL, ["src", "ga", "ad"], ["ga", "ga_sessions", "fbp"]],
  ])("%s", (_case, consent, carriers, live) => {
    const eu = signupBasis(EU);
    const sent = body(jar({ _fbc: "fb.1.1.2" }, EU_COOKIES), consent, MEASUREMENT_ID, eu);

    expect(Object.keys(sent.ad_attribution_v2 ?? {}).sort()).toEqual([...carriers].sort());
    const expected = [...live, ...(consent.marketing ? ["fbc"] : [])];
    expect(Object.keys(sent.live ?? {}).sort()).toEqual(expected.sort());
    // The carriers carry the European's own choice, and the call the European basis.
    for (const carrier of Object.values(sent.ad_attribution_v2 ?? {})) {
      expect(carrier).toMatchObject({ cr: "opt-in", g: "EEA_UK_CH", ca: EU_WRITTEN.src!.ca });
    }
    expect(sent.basis).toEqual({ cr: "opt-in", p: POLICY_MATRIX.version, g: "EEA_UK_CH" });
    expect(sent.refused).toEqual((["analytics", "marketing"] as const).filter((c) => !consent[c]));
  });

  test.each([
    ["a US visitor under GPC", { analytics: false, marketing: false }],
    ["an EU visitor who refused everything", { analytics: false, marketing: false }],
  ])("%s sends the subject and the basis alone, which the backend needs to record the refusal", (_case, consent) => {
    expect(body(jar({ _fbc: "fb.1.1.2" }), consent)).toEqual({
      consent_subject_id: SID,
      basis: US_BASIS,
      refused: ["analytics", "marketing"],
    });
  });

  test("a visitor with no subject and no carriers still sends the basis and what they refuse", () => {
    expect(body("NEXT_LOCALE=fr")).toEqual({ basis: US_BASIS, refused: [] });
  });
});

describe("the basis: the regime the call was made under", () => {
  test.each([
    ["a US visitor", "US", { cr: "opt-out", p: POLICY_MATRIX.version, g: "US" }],
    ["a visitor in the EEA, UK or Switzerland", "FR", { cr: "opt-in", p: POLICY_MATRIX.version, g: "EEA_UK_CH" }],
    ["a visitor we cannot place", null, { cr: "opt-in", p: POLICY_MATRIX.version, g: "UNKNOWN" }],
  ])("%s", (_case, country, basis) => {
    const row = { US, FR: EU }[country ?? ""] ?? UNKNOWN;
    expect(signupBasis(row)).toEqual(basis);
  });

  test("goes out whatever else is left out, whichever the regime", () => {
    for (const row of [US, EU, UNKNOWN]) {
      const basis = signupBasis(row);
      const sent = body("", { analytics: false, marketing: false }, null, basis);
      expect(sent).toEqual({ basis, refused: ["analytics", "marketing"] });
    }
  });
});

describe("the subject", () => {
  test("falls back to the one in the consent record when the subject cookie is gone", () => {
    const record = encodeURIComponent(JSON.stringify({ v: CONSENT_VERSION, a: 1, m: 1, t: LANDED, r: "opt-out", s: SID }));
    expect(body(jar({ stampeo_sid: null, [CONSENT_COOKIE]: record }))?.consent_subject_id).toBe(SID);
  });

  test("is left out when there is none, and when it is not one we minted", () => {
    expect(body(jar({ stampeo_sid: null })).consent_subject_id).toBeUndefined();
    expect(body(jar({ stampeo_sid: "not-a-uuid" })).consent_subject_id).toBeUndefined();
  });
});

describe("what is not ours to forward", () => {
  test("only the configured property's session cookie is read", () => {
    const sent = body(jar({ _ga_OTHER12345: GA_SESSION }));
    expect(Object.keys(sent.live!.ga_sessions!)).toEqual(["ZFZ6JLPFXN"]);
  });

  test("with no property configured, no session cookie is forwarded", () => {
    expect(body(jar(), ALL, null).live).not.toHaveProperty("ga_sessions");
  });

  test.each([
    ["a forged source carrier", { stampeo_src: "garbage" }, "src"],
    ["a forged paid carrier", { stampeo_ad: encodeURIComponent(JSON.stringify({ v: 2, vn: "direct" })) }, "ad"],
    ["a truncated GA carrier", { stampeo_ga: "%7B" }, "ga"],
  ])("%s is left out, not forwarded", (_case, edit, carrier) => {
    const sent = body(jar(edit));
    expect(sent.ad_attribution_v2).not.toHaveProperty(carrier);
    expect(sent.ad_attribution_v2).toBeDefined();
  });

  test("an identifier past 512 characters is left out rather than cut", () => {
    const sent = body(jar({ _fbp: "x".repeat(513), _ga: `GA1.1.${"9".repeat(600)}` }));
    expect(sent.live).not.toHaveProperty("fbp");
    expect(sent.live).not.toHaveProperty("ga");
  });

  test("never throws on a jar of nonsense", () => {
    expect(() => body("=; ;;=x; stampeo_ad; %E0%A4%A=1", ALL)).not.toThrow();
    expect(() => body(undefined as unknown as string)).not.toThrow();
  });
});

describe("recordAccountSignup", () => {
  let browser: FakeBrowser | null = null;
  afterEach(() => {
    browser?.restore();
    browser = null;
  });

  const API = "https://api.stampeo.app";
  const ready = (over: object = {}) => ({
    apiUrl: API,
    measurementId: MEASUREMENT_ID,
    getAccessToken: async () => "user-jwt",
    guard: { sent: false },
    ...over,
  });
  const visit = (options: { cookie?: string; fetch?: "ignore" | "reject" | "throw"; gpc?: boolean } = {}) =>
    (browser = installFakeBrowser({
      cookie: jar(),
      timezone: "America/New_York",
      ...options,
    }));

  /** Resolves once the fire-and-forget request has had its turn. */
  const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

  test("posts the body to the account endpoint with the user's token, and survives the page leaving", async () => {
    visit();

    recordAccountSignup(ready());
    await flush();

    expect(browser!.fetches).toHaveLength(1);
    const [call] = browser!.fetches;
    expect(call.url).toBe(`${API}/account/signup-recorded`);
    expect(call.init).toMatchObject({ method: "POST", keepalive: true });
    expect(call.init.headers).toMatchObject({
      Authorization: "Bearer user-jwt",
      "Content-Type": "application/json",
    });
    expect(call.body).toEqual(JSON.parse(JSON.stringify(body(jar()))));
  });

  describe("what the wizard may wait for before it leaves", () => {
    test("the request being handed to the browser, and not its answer", async () => {
      visit({ fetch: "hang" });

      // A wait for the answer would outlast this test: the fetch never replies.
      await recordAccountSignup(ready({ dispatchTimeoutMs: 60_000 }));

      expect(browser!.fetches).toHaveLength(1);
    });

    test("no longer than the wait it is given, when the token never comes", async () => {
      visit();

      await recordAccountSignup(ready({ getAccessToken: () => new Promise(() => {}), dispatchTimeoutMs: 20 }));

      expect(browser!.fetches).toHaveLength(0);
    });

    test.each([
      ["a token that cannot be read", { getAccessToken: async () => Promise.reject(new Error("storage")) }],
      ["a session with no token", { getAccessToken: async () => null }],
      ["no API configured", { apiUrl: "" }],
    ])("resolves, and does not throw, for %s", async (_case, over) => {
      visit();

      await expect(recordAccountSignup(ready(over))).resolves.toBeUndefined();
    });

    test.each(["reject", "throw"] as const)("resolves when the request fails (%s)", async (fetch) => {
      visit({ fetch });

      await expect(recordAccountSignup(ready())).resolves.toBeUndefined();
    });

    test("a second report on the same page resolves at once and sends nothing more", async () => {
      visit();
      const options = ready();

      await recordAccountSignup(options);
      await recordAccountSignup(options);

      expect(browser!.fetches).toHaveLength(1);
    });
  });

  test("goes out once per page, however many times the flow reports success", async () => {
    visit();
    const options = ready();

    recordAccountSignup(options);
    recordAccountSignup(options);
    recordAccountSignup(options);
    await flush();

    expect(browser!.fetches).toHaveLength(1);
  });

  test("a GPC visitor's call carries the subject and no category's values", async () => {
    // The signal itself reaches the backend as the request's own Sec-GPC header.
    visit({ gpc: true });

    recordAccountSignup(ready());
    await flush();

    expect(browser!.fetches[0].body).toEqual({
      consent_subject_id: SID,
      basis: US_BASIS,
      refused: ["analytics", "marketing"],
    });
  });

  describe("declares what the browser refuses right now, after GPC, older refusals and the row in force", () => {
    const record = (choice: object) =>
      encodeURIComponent(JSON.stringify({ v: CONSENT_VERSION, t: LANDED, s: SID, ...choice }));
    const US_CHOICE = { r: "opt-out", p: 1, g: "US" };
    const EU_CHOICE = { r: "opt-in", p: 1, g: "EEA_UK_CH" };

    test.each([
      ["a US visitor who never touched the notice", { timezone: "America/New_York" }, []],
      ["a US visitor under GPC", { timezone: "America/New_York", gpc: true }, ["analytics", "marketing"]],
      [
        "a US visitor who refused advertising",
        { timezone: "America/New_York", cookie: jar({ [CONSENT_COOKIE]: record({ a: 1, m: 0, ...US_CHOICE }) }) },
        ["marketing"],
      ],
      [
        "a US visitor who refused advertising under version 2",
        { timezone: "America/New_York", cookie: jar({ [CONSENT_COOKIE]: record({ v: 2, a: 1, m: 0, ...US_CHOICE }) }) },
        ["marketing"],
      ],
      [
        "a US visitor whose refusal the web dashboard restored",
        {
          timezone: "America/New_York",
          cookie: jar({ [CONSENT_COOKIE]: record({ a: -1, m: 0, r: "opt-out", o: "restore" }) }),
        },
        ["marketing"],
      ],
      [
        "a US notice dismissal, now that the visitor is in Paris",
        { timezone: "Europe/Paris", cookie: jar({ [CONSENT_COOKIE]: record({ a: 1, m: 1, ...US_CHOICE }) }) },
        ["analytics", "marketing"],
      ],
      ["a European who has not chosen", { timezone: "Europe/Paris" }, ["analytics", "marketing"]],
      [
        "a European who accepted everything",
        { timezone: "Europe/Paris", cookie: jar({ [CONSENT_COOKIE]: record({ a: 1, m: 1, ...EU_CHOICE }) }) },
        [],
      ],
      [
        "a European who accepted analytics only",
        { timezone: "Europe/Paris", cookie: jar({ [CONSENT_COOKIE]: record({ a: 1, m: 0, ...EU_CHOICE }) }) },
        ["marketing"],
      ],
    ])("%s", async (_case, options, refused) => {
      browser = installFakeBrowser({ cookie: jar(), ...options } as Parameters<typeof installFakeBrowser>[0]);

      recordAccountSignup(ready());
      await flush();

      expect(browser.fetches[0].body.refused).toEqual(refused);
    });
  });

  describe("carries the basis in force at the moment of the call", () => {
    const consentCookie = (choice: object) =>
      encodeURIComponent(JSON.stringify({ v: CONSENT_VERSION, t: LANDED, s: SID, ...choice }));

    test.each([
      [
        "a US visitor who never touched the notice",
        { timezone: "America/New_York" },
        { cr: "opt-out", p: POLICY_MATRIX.version, g: "US" },
      ],
      [
        "a European visitor who accepted",
        {
          timezone: "Europe/Paris",
          cookie: jar({ [CONSENT_COOKIE]: consentCookie({ a: 1, m: 1, r: "opt-in", p: 1, g: "EEA_UK_CH" }) }),
        },
        { cr: "opt-in", p: POLICY_MATRIX.version, g: "EEA_UK_CH" },
      ],
      [
        "a US visitor under GPC",
        { timezone: "America/New_York", gpc: true },
        { cr: "opt-out", p: POLICY_MATRIX.version, g: "US" },
      ],
      [
        "a visitor whose timezone we do not map",
        { timezone: "Antarctica/Troll" },
        { cr: "opt-in", p: POLICY_MATRIX.version, g: "UNKNOWN" },
      ],
      [
        "a visitor whose browser refuses Intl",
        { timezone: null },
        { cr: "opt-in", p: POLICY_MATRIX.version, g: "UNKNOWN" },
      ],
    ])("%s", async (_case, options, basis) => {
      browser = installFakeBrowser({ cookie: jar(), ...options } as Parameters<typeof installFakeBrowser>[0]);

      recordAccountSignup(ready());
      await flush();

      expect(browser.fetches[0].body.basis).toEqual(basis);
    });

    test("a GPC visitor sends the basis with every carrier and identifier left out", async () => {
      visit({ gpc: true });

      recordAccountSignup(ready());
      await flush();

      const sent = browser!.fetches[0].body;
      expect(sent).toEqual({
        consent_subject_id: SID,
        basis: US_BASIS,
        refused: ["analytics", "marketing"],
      });
      expect(sent).not.toHaveProperty("ad_attribution_v2");
      expect(sent).not.toHaveProperty("live");
    });

    test("a European visitor who accepted sends the carriers and identifiers as well", async () => {
      browser = installFakeBrowser({
        cookie: jar({ [CONSENT_COOKIE]: consentCookie({ a: 1, m: 1, r: "opt-in", p: 1, g: "EEA_UK_CH" }) }),
        timezone: "Europe/Paris",
      });

      recordAccountSignup(ready());
      await flush();

      const sent = browser.fetches[0].body;
      expect(sent.basis).toEqual({ cr: "opt-in", p: POLICY_MATRIX.version, g: "EEA_UK_CH" });
      expect(Object.keys(sent.ad_attribution_v2 as object).sort()).toEqual(["ad", "ga", "src"]);
      expect(sent).toHaveProperty("live");
    });
  });

  test.each(["reject", "throw"] as const)("a request that fails (%s) is swallowed", async (fetch) => {
    visit({ fetch });

    expect(() => recordAccountSignup(ready())).not.toThrow();
    await flush();
  });

  test.each([
    ["a session with no token", { getAccessToken: async () => null }],
    ["a token that cannot be read", { getAccessToken: async () => Promise.reject(new Error("storage")) }],
    ["no API configured", { apiUrl: "" }],
  ])("%s sends nothing and costs nothing", async (_case, over) => {
    visit();

    expect(() => recordAccountSignup(ready(over))).not.toThrow();
    await flush();

    expect(browser!.fetches).toHaveLength(0);
  });
});

/**
 * `POST /api/privacy/cookies`, the first-party response that writes the consent
 * and subject cookies.
 *
 * It exists because a cookie a script writes is capped by Safari at seven days
 * (and one day after a link-decorated landing), while a cookie a server sets is
 * not. The route is reachable by anyone who can reach the site, so most of what
 * follows is what it refuses to do: it takes nothing from another origin,
 * trusts no value it has not re-parsed, writes no name outside its list, and
 * answers a bad request with nothing.
 */

import { beforeEach, describe, expect, spyOn, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { CONSENT_COOKIE, CONSENT_VERSION, parseConsentCookie } from "../consent";
import { handlePrivacyCookies } from "./cookie-route";
import { parseAdCookie } from "../attribution/ad-ids";
import { parseGaCookie } from "../attribution/ga-ids";
import { parseSourceCookie } from "../attribution/source";
import { PRIVACY_COOKIES_PATH } from "./cookies";
import { readSidCookie } from "./subject";
import { OTHER_SUBJECT as OTHER, SUBJECT } from "./__fixtures__/fake-browser";
import { restoreEnvAfterEach } from "../testing/restore-env";

const SITE = "https://stampeo.app";
const DAY = 86_400;

restoreEnvAfterEach("NEXT_PUBLIC_COOKIE_DOMAIN", "NEXT_PUBLIC_SHOWCASE_URL", "NODE_ENV");

beforeEach(() => {
  delete process.env.NEXT_PUBLIC_SHOWCASE_URL;
});

const CHOICE = {
  v: CONSENT_VERSION,
  a: 1,
  m: 0,
  t: 1_759_740_000,
  r: "opt-out",
  s: SUBJECT,
  p: 1,
  g: "US",
};

/** Carriers as showcase posts them: the JSON a cookie holds, in the contract's field names. */
const EVIDENCE = { cv: CONSENT_VERSION, cr: "opt-out", ca: 0, p: 1, g: "US" };
const CARRIERS = {
  src: {
    v: 2, us: "meta", um: "paid_social", uc: "us-cr-broad", uo: "ugc-cafe-15s", ut: "us-broad",
    lp: "/us", rh: "l.facebook.com", at: 1_791_244_800, ...EVIDENCE,
  },
  ga: { v: 2, cid: "1234567890.1700000000", sid: "1791244795", sn: 1, at: 1_791_244_800, ...EVIDENCE },
  ad: {
    v: 2, vn: "meta", ci: "IwAR_TEST_fbclid_0001", ct: 1_791_244_800,
    fbp: "fb.1.1791244790123.1122334455", ...EVIDENCE,
  },
};

interface PostOptions {
  origin?: string | null;
  contentType?: string | null;
  cookie?: string;
  host?: string;
  forwardedHost?: string;
  contentLength?: string;
  raw?: string;
}

function post(body: unknown, options: PostOptions = {}): Request {
  const headers = new Headers({ host: options.host ?? "stampeo.app" });
  const origin = options.origin === undefined ? SITE : options.origin;
  if (origin !== null) headers.set("origin", origin);
  const type = options.contentType === undefined ? "application/json" : options.contentType;
  if (type !== null) headers.set("content-type", type);
  if (options.cookie) headers.set("cookie", options.cookie);
  if (options.forwardedHost) headers.set("x-forwarded-host", options.forwardedHost);
  if (options.contentLength) headers.set("content-length", options.contentLength);
  return new Request(`${SITE}${PRIVACY_COOKIES_PATH}`, {
    method: "POST",
    headers,
    body: options.raw ?? JSON.stringify(body),
  });
}

/** One `Set-Cookie` string, taken apart. */
function parseSetCookie(setCookie: string) {
  const [pair, ...attributes] = setCookie.split(";").map((part) => part.trim());
  const split = pair.indexOf("=");
  const attrs = new Map(
    attributes.map((a) => {
      const at = a.indexOf("=");
      return at === -1 ? [a.toLowerCase(), ""] : [a.slice(0, at).toLowerCase(), a.slice(at + 1)];
    }),
  );
  return { name: pair.slice(0, split), value: pair.slice(split + 1), attrs };
}

async function run(request: Request) {
  const result = await handlePrivacyCookies(request);
  return { ...result, cookies: result.setCookies.map(parseSetCookie) };
}

describe("who may call it", () => {
  test("the site itself, with a JSON body", async () => {
    expect((await run(post({}))).status).toBe(204);
    expect((await run(post({}, { contentType: "application/json; charset=utf-8" }))).status).toBe(204);
  });

  test.each([
    ["no Origin header", null],
    ["another site", "https://evil.example"],
    ["a null origin", "null"],
    ["a look-alike host", "https://stampeo.app.evil.example"],
    ["a different scheme in production", "http://stampeo.app"],
  ])("%s is refused with nothing set", async (_case, origin) => {
    process.env.NODE_ENV = "production";
    const result = await run(post({ consent: CHOICE, sid: "ensure" }, { origin }));

    expect(result.status).toBe(403);
    expect(result.setCookies).toEqual([]);
  });

  test("behind a proxy, the forwarded host is the site", async () => {
    const request = post({}, { host: "0.0.0.0:3000", forwardedHost: "stampeo.app" });
    expect((await run(request)).status).toBe(204);
  });

  test("when no host is forwarded, the configured public URL is the site", async () => {
    process.env.NEXT_PUBLIC_SHOWCASE_URL = "https://stampeo.app";
    expect((await run(post({}, { host: "0.0.0.0:3000" }))).status).toBe(204);
    delete process.env.NEXT_PUBLIC_SHOWCASE_URL;
    expect((await run(post({}, { host: "0.0.0.0:3000" }))).status).toBe(403);
  });

  test("the configured public URL is accepted whatever its scheme, and nothing else is", async () => {
    process.env.NODE_ENV = "production";
    process.env.NEXT_PUBLIC_SHOWCASE_URL = "http://localhost:3987";

    const request = (origin: string) => post({}, { origin, host: "0.0.0.0:3000" });
    expect((await run(request("http://localhost:3987"))).status).toBe(204);
    expect((await run(request("http://localhost:3988"))).status).toBe(403);
    expect((await run(request("https://localhost:3987"))).status).toBe(403);
  });

  test.each([
    ["plain text, which is what sendBeacon sends cross-site", "text/plain;charset=UTF-8"],
    ["a form post", "application/x-www-form-urlencoded"],
    ["multipart", "multipart/form-data; boundary=x"],
    ["no content type", null],
  ])("%s is refused", async (_case, contentType) => {
    const result = await run(post({ consent: CHOICE }, { contentType }));
    expect(result.status).toBe(415);
    expect(result.setCookies).toEqual([]);
  });
});

describe("how much it will read", () => {
  test("a body over 8 KB is refused, however it arrives", async () => {
    const big = JSON.stringify({ consent: CHOICE, pad: "x".repeat(8 * 1024) });
    expect((await run(post(null, { raw: big }))).status).toBe(413);
    expect(
      (await run(post({}, { contentLength: String(9 * 1024) }))).status,
    ).toBe(413);
  });

  test.each([
    ["broken JSON", "{nope"],
    ["an array", "[1,2]"],
    ["a string", '"consent"'],
    ["null", "null"],
    ["an empty body", ""],
  ])("%s is a bad request", async (_case, raw) => {
    const result = await run(post(null, { raw }));
    expect(result.status).toBe(400);
    expect(result.setCookies).toEqual([]);
  });
});

describe("the consent cookie", () => {
  test("a US refusal is set for 400 days, readable by the page, on the shared domain", async () => {
    process.env.NEXT_PUBLIC_COOKIE_DOMAIN = ".stampeo.app";
    process.env.NODE_ENV = "production";

    const { status, cookies } = await run(post({ consent: CHOICE }));

    expect(status).toBe(204);
    expect(cookies).toHaveLength(1);
    const [cookie] = cookies;
    expect(cookie.name).toBe(CONSENT_COOKIE);
    expect(cookie.attrs.get("max-age")).toBe(String(400 * DAY));
    expect(cookie.attrs.get("path")).toBe("/");
    expect(cookie.attrs.get("samesite")).toBe("Lax");
    expect(cookie.attrs.get("domain")).toBe(".stampeo.app");
    expect(cookie.attrs.has("secure")).toBe(true);
    // The gate reads it in the browser, so it cannot be HttpOnly.
    expect(cookie.attrs.has("httponly")).toBe(false);
    // The value is the record, re-serialised from what was parsed.
    expect(parseConsentCookie(cookie.value)).toMatchObject({
      analytics: true,
      marketing: false,
      at: CHOICE.t,
      subjectId: SUBJECT,
      policyVersion: 1,
      regionRow: "US",
    });
  });

  test.each([
    ["a US grant", { ...CHOICE, a: 1, m: 1 }, 182],
    ["a French refusal", { ...CHOICE, a: 0, m: 0, r: "opt-in", g: "EEA_UK_CH" }, 182],
    ["a French partial refusal", { ...CHOICE, a: 1, m: 0, r: "opt-in", g: "EEA_UK_CH" }, 182],
    ["a refusal that names no row falls back on its regime", { ...CHOICE, g: undefined }, 400],
    ["an opt-in refusal that names no row", { ...CHOICE, g: undefined, r: "opt-in" }, 182],
  ])("%s lives %d days", async (_case, consent, days) => {
    const { cookies } = await run(post({ consent }));
    expect(cookies[0].attrs.get("max-age")).toBe(String(days * DAY));
  });

  test("an older refusal is re-issued as it was, so it keeps standing", async () => {
    const older = { ...CHOICE, v: CONSENT_VERSION - 1, a: 0, m: 0, p: undefined, g: undefined };
    const { cookies } = await run(post({ consent: older }));

    expect(cookies).toHaveLength(1);
    expect(JSON.parse(decodeURIComponent(cookies[0].value))).toMatchObject({
      v: CONSENT_VERSION - 1,
      a: 0,
      m: 0,
    });
  });

  test.each([
    ["a version from the future", { ...CHOICE, v: CONSENT_VERSION + 1 }],
    ["a choice that is not 0 or 1", { ...CHOICE, a: "yes" }],
    ["a missing choice", { ...CHOICE, m: undefined }],
    ["an array", [CHOICE]],
    ["text", "granted"],
  ])("%s is dropped without a word", async (_case, consent) => {
    const result = await run(post({ consent }));

    expect(result.status).toBe(204);
    expect(result.setCookies).toEqual([]);
  });

  test("a forged subject inside an otherwise valid choice costs only the subject", async () => {
    const { cookies } = await run(post({ consent: { ...CHOICE, s: "../../etc/passwd" } }));

    const parsed = parseConsentCookie(cookies[0].value);
    expect(parsed).toMatchObject({ analytics: true, marketing: false });
    expect(parsed?.subjectId).toBeUndefined();
  });
});

describe("the subject cookie", () => {
  test("a valid one is kept and its 400 days start again", async () => {
    const { cookies } = await run(post({ sid: "ensure" }, { cookie: `stampeo_sid=${SUBJECT}` }));

    expect(cookies).toHaveLength(1);
    expect(cookies[0]).toMatchObject({ name: "stampeo_sid", value: SUBJECT });
    expect(cookies[0].attrs.get("max-age")).toBe(String(400 * DAY));
  });

  test("with none, one is minted: a bare lowercase v4", async () => {
    const { cookies } = await run(post({ sid: "ensure" }));

    expect(cookies).toHaveLength(1);
    expect(readSidCookie(`stampeo_sid=${cookies[0].value}`)).toBe(cookies[0].value);
    expect(cookies[0].value).toBe(cookies[0].value.toLowerCase());
  });

  test.each([
    ["not a uuid", "not-a-uuid"],
    ["a v1 uuid", "2c1b0c3e-9a3a-11ee-b9d1-0242ac120002"],
    ["a v3 uuid", "3f2504e0-4f89-31d3-9a0c-0305e82c3301"],
    ["an empty value", ""],
  ])("a forged subject (%s) is replaced, never kept", async (_case, forged) => {
    const { cookies } = await run(post({ sid: "ensure" }, { cookie: `stampeo_sid=${forged}` }));

    expect(cookies).toHaveLength(1);
    expect(cookies[0].value).not.toBe(forged);
    expect(readSidCookie(`stampeo_sid=${cookies[0].value}`)).toBe(cookies[0].value);
  });

  test("with no subject cookie, the one inside the consent record is adopted", async () => {
    const { cookies } = await run(post({ sid: "ensure", consent: CHOICE }));
    const sid = cookies.find((c) => c.name === "stampeo_sid");
    expect(sid?.value).toBe(SUBJECT);
  });

  test("the consent record always carries the subject the cookie holds", async () => {
    const { cookies } = await run(
      post({ sid: "ensure", consent: CHOICE }, { cookie: `stampeo_sid=${OTHER}` }),
    );

    expect(cookies.find((c) => c.name === "stampeo_sid")?.value).toBe(OTHER);
    const consent = cookies.find((c) => c.name === CONSENT_COOKIE);
    expect(parseConsentCookie(consent!.value)?.subjectId).toBe(OTHER);
  });

  test("it is not asked for, so it is not touched", async () => {
    const { cookies } = await run(post({ consent: CHOICE }, { cookie: `stampeo_sid=${OTHER}` }));
    expect(cookies.map((c) => c.name)).toEqual([CONSENT_COOKIE]);
  });
});

describe("what else it will do", () => {
  test("it clears the carriers it set, and nothing of ours that matters", async () => {
    process.env.NEXT_PUBLIC_COOKIE_DOMAIN = ".stampeo.app";
    const { cookies } = await run(
      post({
        clear: [
          "stampeo_ad", "stampeo_ga", "stampeo_src", "stampeo_attribution",
          CONSENT_COOKIE, "stampeo_sid", "stampeo_region", "_ga", "session", 7,
        ],
      }),
    );

    expect(cookies.map((c) => c.name).sort()).toEqual(
      ["stampeo_ad", "stampeo_attribution", "stampeo_ga", "stampeo_src"],
    );
    for (const cookie of cookies) {
      expect(cookie.attrs.get("max-age")).toBe("0");
      expect(cookie.attrs.get("domain")).toBe(".stampeo.app");
    }
  });

  test("it sets the three carriers it is sent, as cookies the same parsers read back", async () => {
    process.env.NEXT_PUBLIC_COOKIE_DOMAIN = ".stampeo.app";
    const { status, cookies } = await run(post({ carriers: CARRIERS }));

    expect(status).toBe(204);
    expect(cookies.map((c) => c.name).sort()).toEqual(["stampeo_ad", "stampeo_ga", "stampeo_src"]);
    for (const cookie of cookies) {
      expect(cookie.attrs.get("max-age")).toBe(String(182 * DAY));
      expect(cookie.attrs.get("domain")).toBe(".stampeo.app");
      expect(cookie.attrs.get("path")).toBe("/");
      expect(cookie.attrs.get("samesite")).toBe("Lax");
    }
    const value = (name: string) => cookies.find((c) => c.name === name)!.value;
    expect(parseSourceCookie(value("stampeo_src"))).toMatchObject({ us: "meta", lp: "/us" });
    expect(parseGaCookie(value("stampeo_ga"))).toMatchObject({ cid: "1234567890.1700000000", sn: 1 });
    expect(parseAdCookie(value("stampeo_ad"))).toMatchObject({ vn: "meta", ci: "IwAR_TEST_fbclid_0001" });
  });

  test("a carrier it cannot validate is dropped, and the others still land", async () => {
    const { status, cookies } = await run(
      post({
        carriers: {
          ...CARRIERS,
          ad: { ...CARRIERS.ad, vn: "direct" },
          ga: "not an object",
        },
      }),
    );

    expect(status).toBe(204);
    expect(cookies.map((c) => c.name)).toEqual(["stampeo_src"]);
  });

  test.each([
    ["a name it does not own", { session: CARRIERS.src, stampeo_consent: CARRIERS.src, evil: {} }],
    ["a list", [CARRIERS.src]],
    ["text", "stampeo_src"],
    ["nothing", null],
  ])("carriers of %s set nothing", async (_case, carriers) => {
    const result = await run(post({ carriers }));
    expect(result.status).toBe(204);
    expect(result.setCookies).toEqual([]);
  });

  test("a carrier too big to be a cookie is dropped, not trimmed", async () => {
    const slashes = "/".repeat(128);
    const heavy = { ...CARRIERS.src, us: slashes, um: slashes, uc: slashes, uo: slashes, ut: slashes, lp: slashes, rh: slashes };
    expect((await run(post({ carriers: { src: heavy } }))).setCookies).toEqual([]);
  });

  test("it writes only the names it owns, whatever is asked", async () => {
    const result = await run(
      post({
        cookies: { evil: "1" },
        set: [{ name: "session", value: "x" }],
        consent: CHOICE,
        sid: "ensure",
      }),
    );

    expect(result.cookies.map((c) => c.name).sort()).toEqual([CONSENT_COOKIE, "stampeo_sid"]);
  });

  test("it never logs what it was sent", async () => {
    const spies = (["log", "info", "warn", "error", "debug"] as const).map((level) =>
      spyOn(console, level).mockImplementation(() => {}),
    );
    try {
      await run(post({ consent: CHOICE, sid: "ensure", clear: ["stampeo_ad"] }));
      await run(post({ consent: { ...CHOICE, a: "no" } }));
      await run(post(null, { raw: "{broken" }));
      await run(post({ consent: CHOICE }, { origin: "https://evil.example" }));

      for (const spy of spies) expect(spy).not.toHaveBeenCalled();
    } finally {
      for (const spy of spies) spy.mockRestore();
    }
  });
});

describe("the route file", () => {
  const route = join(import.meta.dir, "..", "..", "app", PRIVACY_COOKIES_PATH, "route.ts");

  test("lives at the path the client posts to", () => {
    expect(PRIVACY_COOKIES_PATH).toBe("/api/privacy/cookies");
    expect(existsSync(route)).toBe(true);
  });

  test("answers POST only", () => {
    const source = readFileSync(route, "utf8");
    expect(source).toMatch(/export async function POST/);
    expect(source).not.toMatch(/export (async )?function (GET|PUT|PATCH|DELETE|HEAD)/);
  });
});

/**
 * What the real-browser link may carry: the ad's UTM tags and the Meta or
 * ChatGPT click id from the attribution cookies, and nothing else. The link reaches
 * analytics, so no personal detail and no consent evidence ride along.
 */

import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { AD_COOKIE, SOURCE_COOKIE } from "../attribution/cookie-names";
import { cookieValue } from "../attribution/codec";
import { CONSENT_COOKIE, CONSENT_VERSION, serializeConsentCookie } from "../consent";
import { GRANTED_COOKIE, installFakeBrowser, type FakeBrowser } from "../privacy/__fixtures__/fake-browser";
import { buildAdCarrier, serializeAdCarrier } from "../attribution/ad-ids";
import { readClickIds, readUtm, landingFromUrl } from "../attribution/landing";
import { buildSourceCarrier, serializeSourceCarrier } from "../attribution/source";
import { parseAdCookie } from "../attribution/ad-ids";
import { escapeParamsFromCookies } from "./escape-params";

const US = "America/New_York";
const EU = "Europe/Paris";

let browser: FakeBrowser | null = null;

/** The browser the link is built in: the click ids follow what this visitor allows right now. */
function visit(options: { timezone: string; cookie?: string; gpc?: boolean }) {
  browser?.restore();
  browser = installFakeBrowser({ ...options, hostname: "stampeo.app" });
}

// A US visitor who never touched the notice: advertising is on.
beforeEach(() => visit({ timezone: US }));
afterEach(() => {
  browser?.restore();
  browser = null;
});

const usChoice = (marketing: boolean) =>
  `${CONSENT_COOKIE}=${serializeConsentCookie({
    v: CONSENT_VERSION,
    analytics: true,
    marketing,
    at: 1_791_240_000,
    regime: "opt-out",
    regionRow: "US",
  })}`;

const EVIDENCE = { cv: 1, cr: "opt-out", ca: 0, p: 1, g: "US" } as const;
const LANDED = 1_760_000_000;

function landing(url: string) {
  return landingFromUrl(url, { referrer: "https://l.instagram.com/", variant: "b", landedAt: LANDED });
}

/** The cookie header a visitor carries after landing on `url`. */
function cookieHeaderFor(url: string, extra: string[] = []): string {
  const ctx = landing(url);
  const src = serializeSourceCarrier(buildSourceCarrier({ landing: ctx, evidence: EVIDENCE }));
  const adCarrier = buildAdCarrier({ landing: ctx, fbp: "fb.1.1760000000.123456", evidence: EVIDENCE });
  const parts = [`${SOURCE_COOKIE}=${src}`];
  if (adCarrier) parts.push(`${AD_COOKIE}=${serializeAdCarrier(adCarrier)}`);
  return [...parts, ...extra].join("; ");
}

const META_LANDING =
  "https://stampeo.app/us?utm_source=meta&utm_medium=paid&utm_campaign=spring&utm_content=video1&utm_term=punch-card&fbclid=IwAR3abc";
const OPPREF = "OAI_TEST_oppref-0001.x~y";
const CHATGPT_LANDING = `https://stampeo.app/us?utm_source=chatgpt&utm_medium=cpc&utm_campaign=spring&oppref=${OPPREF}`;

describe("escapeParamsFromCookies", () => {
  test("a Meta ad visitor carries the five UTM tags and the click id", () => {
    const params = escapeParamsFromCookies(cookieHeaderFor(META_LANDING, ["_ga=GA1.1.1", "theme=dark"]));
    expect([...params.keys()].sort()).toEqual(
      ["fbclid", "utm_campaign", "utm_content", "utm_medium", "utm_source", "utm_term"],
    );
    expect(params.get("utm_source")).toBe("meta");
    expect(params.get("utm_term")).toBe("punch-card");
    expect(params.get("fbclid")).toBe("IwAR3abc");
  });

  test("a visit with only some tags and no click id carries just those tags", () => {
    const params = escapeParamsFromCookies(
      cookieHeaderFor("https://stampeo.app/us?utm_source=instagram&utm_medium=bio"),
    );
    expect(params.toString()).toBe("utm_source=instagram&utm_medium=bio");
  });

  test("nothing but the UTM tags and the click id is ever carried", () => {
    const params = escapeParamsFromCookies(cookieHeaderFor(META_LANDING));
    const allowed = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid", "oppref"];
    for (const key of params.keys()) expect(allowed).toContain(key);
    const text = params.toString();
    for (const leaked of ["l.instagram.com", "fb.1.", "opt-out", "1760000000"]) {
      expect(text).not.toContain(leaked);
    }
  });

  test("a Google ad click does not put a Meta or ChatGPT click id in the link", () => {
    const params = escapeParamsFromCookies(
      cookieHeaderFor("https://stampeo.app/?utm_source=google&utm_medium=cpc&gclid=g123"),
    );
    expect(params.has("fbclid")).toBe(false);
    expect(params.has("oppref")).toBe(false);
    expect(params.has("gclid")).toBe(false);
    expect(params.get("utm_source")).toBe("google");
  });

  test("a ChatGPT ad visitor carries the campaign tags and the oppref, next to where fbclid goes, and no Meta id", () => {
    const params = escapeParamsFromCookies(
      cookieHeaderFor(CHATGPT_LANDING, ["_ga=GA1.1.1", "theme=dark"]),
    );
    expect([...params.keys()].sort()).toEqual(["oppref", "utm_campaign", "utm_medium", "utm_source"]);
    expect(params.get("utm_source")).toBe("chatgpt");
    expect(params.get("oppref")).toBe(OPPREF);
    expect(params.has("fbclid")).toBe(false);
  });

  test("the ChatGPT link round-trips: the landing page reads back the same oppref, whatever it holds", () => {
    // Characters URLSearchParams writes differently from how they arrived.
    const tricky = "op~9-x_y.z+/=";
    const params = escapeParamsFromCookies(
      cookieHeaderFor(`https://stampeo.app/us?utm_source=chatgpt&oppref=${encodeURIComponent(tricky)}`),
    );
    expect(readClickIds(`?${params.toString()}`).oppref).toBe(tricky);
  });

  test.each([
    ["no cookie header", undefined],
    ["an empty header", ""],
    ["unrelated cookies only", "theme=dark; _ga=GA1.1.1"],
    ["a source cookie that is not JSON", `${SOURCE_COOKIE}=%7Bnot-json; ${AD_COOKIE}=garbage`],
    ["a source cookie of another version", `${SOURCE_COOKIE}=${encodeURIComponent('{"v":1,"us":"meta"}')}`],
    ["a forged source cookie with a non-string tag", `${SOURCE_COOKIE}=${encodeURIComponent('{"v":2,"us":7}')}`],
  ])("%s means no parameters", (_label, header) => {
    expect(escapeParamsFromCookies(header).size).toBe(0);
  });

  describe.each([
    ["a Meta click", META_LANDING, "fbclid", "meta"],
    ["a ChatGPT click", CHATGPT_LANDING, "oppref", "openai"],
  ])("%s, with the visitor no longer allowing advertising", (_click, url, param, vendor) => {
    // The carrier can outlive the choice: a capture response applied after a
    // refusal, or a notice dismissed and then a move to an opt-in region.
    test.each([
      ["a US visitor who switched advertising off", { timezone: US, cookie: usChoice(false) }],
      ["a US visitor under Global Privacy Control", { timezone: US, gpc: true }],
      ["a European who has chosen nothing", { timezone: EU }],
    ])("%s: the carrier is still stored, but its click id is not put in the link", (_state, state) => {
      const header = cookieHeaderFor(url);
      expect(parseAdCookie(cookieValue(header, AD_COOKIE))).toMatchObject({ vn: vendor });

      visit(state);
      const params = escapeParamsFromCookies(header);
      expect(params.has(param)).toBe(false);
      expect(params.get("utm_source")).toBe(vendor === "meta" ? "meta" : "chatgpt");
    });

    test("a European who accepted advertising still carries it", () => {
      visit({ timezone: EU, cookie: GRANTED_COOKIE });
      expect(escapeParamsFromCookies(cookieHeaderFor(url)).get(param)).not.toBeNull();
    });
  });

  test("the link round-trips: the landing page reads back the same tags and click id", () => {
    const params = escapeParamsFromCookies(cookieHeaderFor(META_LANDING));
    const search = `?${params.toString()}`;
    expect(readUtm(search)).toEqual({
      utmSource: "meta",
      utmMedium: "paid",
      utmCampaign: "spring",
      utmContent: "video1",
      utmTerm: "punch-card",
    });
    expect(readClickIds(search).fbclid).toBe("IwAR3abc");
  });
});

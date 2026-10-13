/**
 * What the real-browser link may carry: the ad's UTM tags and the Meta click
 * id from the attribution cookies, and nothing else. The link reaches
 * analytics, so no personal detail and no consent evidence ride along.
 */

import { describe, expect, test } from "bun:test";
import { AD_COOKIE, SOURCE_COOKIE } from "../attribution/cookie-names";
import { buildAdCarrier, serializeAdCarrier } from "../attribution/ad-ids";
import { readClickIds, readUtm, landingFromUrl } from "../attribution/landing";
import { buildSourceCarrier, serializeSourceCarrier } from "../attribution/source";
import { escapeParamsFromCookies } from "./escape-params";

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

describe("escapeParamsFromCookies", () => {
  test("a Meta ad visitor carries the five UTM tags and the click id, in a fixed order", () => {
    const params = escapeParamsFromCookies(cookieHeaderFor(META_LANDING, ["_ga=GA1.1.1", "theme=dark"]));
    expect([...params.keys()]).toEqual([
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
      "utm_term",
      "fbclid",
    ]);
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
    const allowed = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid"];
    for (const key of params.keys()) expect(allowed).toContain(key);
    const text = params.toString();
    for (const leaked of ["l.instagram.com", "fb.1.", "opt-out", "1760000000"]) {
      expect(text).not.toContain(leaked);
    }
  });

  test("a Google ad click does not put a Meta click id in the link", () => {
    const params = escapeParamsFromCookies(
      cookieHeaderFor("https://stampeo.app/?utm_source=google&utm_medium=cpc&gclid=g123"),
    );
    expect(params.has("fbclid")).toBe(false);
    expect(params.has("gclid")).toBe(false);
    expect(params.get("utm_source")).toBe("google");
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

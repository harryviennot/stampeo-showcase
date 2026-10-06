/**
 * The three carriers that take a visit's origin from showcase to the
 * dashboard: `stampeo_src` (campaign source), `stampeo_ga` (GA ids) and
 * `stampeo_ad` (the paid click). Each is a cookie of URL-encoded JSON on the
 * shared parent domain.
 *
 * THE COOKIE IS NOT AUTHENTICATION. It is editable in devtools and crosses a
 * subdomain boundary, and the privacy route sets it from a posted body. So the
 * rules that matter most are the negative ones: a parser is total (anything
 * malformed, forged, oversized or from another version is null, never a
 * throw), and a value is capped before it can make the cookie too big to ride
 * on every request.
 *
 * What a visitor agreed to is `capture.test.ts`'s question. These tests assume
 * the answer and pin the shape of what is written under it.
 */

import { describe, expect, test } from "bun:test";

import { CONSENT_VERSION } from "../consent";
import { serializeSetCookie } from "../privacy/cookies";
import { restoreEnvAfterEach } from "../testing/restore-env";
import { LANDED, META_URL, landing } from "./__fixtures__/visitors";
import {
  buildAdCarrier,
  paidClick,
  parseAdCarrier,
  parseAdCookie,
  readFbp,
  serializeAdCarrier,
  adCookieFor,
} from "./ad-ids";
import { AD_COOKIE, GA_COOKIE, SOURCE_COOKIE } from "./cookie-names";
import type { ConsentEvidence } from "./evidence";
import {
  buildGaCarrier,
  gaCookieFor,
  parseGaCarrier,
  parseGaCookie,
  serializeGaCarrier,
} from "./ga-ids";
import { readClickIds } from "./landing";
import {
  buildSourceCarrier,
  parseSourceCarrier,
  parseSourceCookie,
  serializeSourceCarrier,
  sourceCookieFor,
} from "./source";

const EVIDENCE: ConsentEvidence = { cv: CONSENT_VERSION, cr: "opt-out", ca: 0, p: 1, g: "US" };
const URL_META = META_URL;

const source = () => buildSourceCarrier({ landing: landing(URL_META), evidence: EVIDENCE });
const ga = () =>
  buildGaCarrier({
    cid: "1234567890.1700000000",
    session: { sid: "1791244795", sn: 1 },
    evidence: EVIDENCE,
    capturedAt: LANDED,
  });
const ad = () =>
  buildAdCarrier({
    landing: landing(URL_META),
    fbp: "fb.1.1791244790123.1122334455",
    evidence: EVIDENCE,
  }) as NonNullable<ReturnType<typeof buildAdCarrier>>;

/** Each carrier, driven through one table so none can drift from the others. */
const CARRIERS = [
  {
    name: SOURCE_COOKIE,
    make: source,
    serialize: serializeSourceCarrier,
    parseCookie: parseSourceCookie,
    parseObject: parseSourceCarrier,
    cookieFor: sourceCookieFor,
    keys: ["v", "us", "um", "uc", "uo", "ut", "lp", "rh", "at", "cv", "cr", "ca", "p", "g"],
  },
  {
    name: GA_COOKIE,
    make: ga,
    serialize: serializeGaCarrier,
    parseCookie: parseGaCookie,
    parseObject: parseGaCarrier,
    cookieFor: gaCookieFor,
    keys: ["v", "cid", "sid", "sn", "at", "cv", "cr", "ca", "p", "g"],
  },
  {
    name: AD_COOKIE,
    make: ad,
    serialize: serializeAdCarrier,
    parseCookie: parseAdCookie,
    parseObject: parseAdCarrier,
    cookieFor: adCookieFor,
    keys: ["v", "vn", "ci", "ct", "fbp", "cv", "cr", "ca", "p", "g"],
  },
] as const;

/** The wire JSON of a carrier, decoded: what the cookie holds. */
const wire = (serialized: string): Record<string, unknown> =>
  JSON.parse(decodeURIComponent(serialized));
const encode = (value: unknown) => encodeURIComponent(JSON.stringify(value));

describe.each(CARRIERS)("$name", (carrier) => {
  restoreEnvAfterEach("NEXT_PUBLIC_COOKIE_DOMAIN");

  test("is written with the contract's field names, and nothing else", () => {
    expect(Object.keys(wire(carrier.serialize(carrier.make() as never)))).toEqual([
      ...carrier.keys,
    ]);
  });

  test("survives serialize then parse", () => {
    const made = carrier.make();
    expect(carrier.parseCookie(carrier.serialize(made as never))).toEqual(made as never);
    expect(carrier.parseObject(wire(carrier.serialize(made as never)))).toEqual(made as never);
  });

  test("carries the consent evidence it was captured under", () => {
    expect(wire(carrier.serialize(carrier.make() as never))).toMatchObject({
      v: 2,
      cv: CONSENT_VERSION,
      cr: "opt-out",
      ca: 0,
      p: 1,
      g: "US",
    });
  });

  test.each([
    ["nothing", undefined],
    ["null", null],
    ["an empty string", ""],
    ["whitespace", "   "],
    ["a cookie that is not JSON", "%7Bnope"],
    ["JSON null", "null"],
    ["a JSON array", encode([1, 2, 3])],
    ["a JSON string", encode("stampeo")],
    ["a JSON number", encode(7)],
    ["an invalid escape", "%E0%A4%A"],
    ["a cookie far past the size cap", encode({ v: 2, pad: "x".repeat(5000) })],
  ])("a cookie of %s is null, not a throw", (_case, raw) => {
    expect(carrier.parseCookie(raw as string | undefined)).toBeNull();
  });

  test.each([[undefined], [null], ["text"], [3], [true], [[]], [[{ v: 2 }]]])(
    "an object of %p is null, not a throw",
    (value) => {
      expect(carrier.parseObject(value)).toBeNull();
    },
  );

  // Each forged value is a VALID carrier with one field edited, so the null can
  // only be caused by that field; the baseline is proven first.
  test.each([
    ["a version from before", { v: 1 }],
    ["a version from after", { v: 3 }],
    ["a version written as text", { v: "2" }],
    ["a consent version of text", { cv: "3" }],
    ["a consent version with a fraction", { cv: 3.5 }],
    ["a consent version of zero", { cv: 0 }],
    ["a regime we never write", { cr: "maybe" }],
    ["a regime that is not text", { cr: 1 }],
    ["a consent moment before the epoch", { ca: -1 }],
    ["a consent moment of text", { ca: "0" }],
    ["a policy version of zero", { p: 0 }],
    ["a policy version that is not a number", { p: "1" }],
    ["a region row that does not exist", { g: "MARS" }],
    ["a region row of the wrong type", { g: 1 }],
    ["a missing region row", { g: undefined }],
    ["a timestamp past the year 2100", carrier.name === AD_COOKIE ? { ct: 4_200_000_000 } : { at: 4_200_000_000 }],
    ["a timestamp that is not an integer", carrier.name === AD_COOKIE ? { ct: 1.5 } : { at: 1.5 }],
  ])("%s is null", (_case, edit) => {
    const valid = wire(carrier.serialize(carrier.make() as never));
    expect(carrier.parseCookie(encode(valid))).not.toBeNull();
    expect(carrier.parseCookie(encode({ ...valid, ...edit }))).toBeNull();
    expect(carrier.parseObject({ ...valid, ...edit })).toBeNull();
  });

  test("is set with the shared scope: parent domain, root path, Lax, six months", () => {
    process.env.NEXT_PUBLIC_COOKIE_DOMAIN = ".stampeo.app";
    const cookie = carrier.cookieFor(carrier.make());
    expect(cookie).toMatchObject({
      name: carrier.name,
      path: "/",
      sameSite: "lax",
      domain: ".stampeo.app",
      maxAge: 60 * 60 * 24 * 182,
    });
    const header = serializeSetCookie(cookie!);
    expect(header).toContain(`${carrier.name}=`);
    expect(header).toContain("; Domain=.stampeo.app");
    expect(header).toContain("; Path=/");
    expect(header).toContain("; SameSite=Lax");
    expect(header).toContain(`; Max-Age=${60 * 60 * 24 * 182}`);
  });

  test("with no cookie domain configured the attribute is left off", () => {
    delete process.env.NEXT_PUBLIC_COOKIE_DOMAIN;
    expect(carrier.cookieFor(carrier.make())!.domain).toBeUndefined();
  });

  test("a posted value is checked, and a bad one yields no cookie", () => {
    expect(carrier.cookieFor({ nonsense: true })).toBeNull();
    expect(carrier.cookieFor(null)).toBeNull();
  });
});

describe("stampeo_src, from a landing", () => {
  test("holds the tags, the landing and the referrer of the Meta click", () => {
    expect(source()).toEqual({
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
      ...EVIDENCE,
    });
  });

  test("holds no click id: that is the paid carrier's, under its own category", () => {
    expect(JSON.stringify(source())).not.toContain("IwAR_TEST_fbclid_0001");
  });

  test("an organic arrival keeps the landing and leaves the tags empty", () => {
    const organic = buildSourceCarrier({
      landing: landing("https://stampeo.app/pricing", "https://www.google.com/"),
      evidence: EVIDENCE,
    });
    expect(organic).toMatchObject({
      us: null,
      um: null,
      uc: null,
      lp: "/pricing",
      rh: "www.google.com",
    });
  });

  test("our own host is not a referrer", () => {
    const own = buildSourceCarrier({
      landing: landing("https://stampeo.app/pricing", "https://stampeo.app/us"),
      evidence: EVIDENCE,
    });
    expect(own.rh).toBeNull();
  });

  test("the A/B variant that bought the visit travels with it", () => {
    expect(
      buildSourceCarrier({ landing: landing(URL_META, undefined, "b"), evidence: EVIDENCE }).lv,
    ).toBe("b");
  });

  const HUGE = "x".repeat(4000);

  test("an oversized field is shortened to 128 characters, never dropped", () => {
    const built = buildSourceCarrier({
      landing: landing(`https://stampeo.app/us?utm_campaign=${HUGE}`, undefined, HUGE),
      evidence: EVIDENCE,
    });
    expect(built.uc).toHaveLength(128);
    expect(built.lv).toHaveLength(128);
    expect(parseSourceCarrier(built)).not.toBeNull();
  });

  test("a landing built to overflow the cookie still serializes within 2048 bytes", () => {
    const tags = ["source", "medium", "campaign", "term", "content"]
      .map((tag) => `utm_${tag}=${HUGE}`)
      .join("&");
    const built = buildSourceCarrier({
      landing: landing(
        `https://stampeo.app/us?${tags}`,
        `https://${"y".repeat(200)}.example.com/`,
        HUGE,
      ),
      evidence: EVIDENCE,
    });
    expect(serializeSourceCarrier(built).length).toBeLessThanOrEqual(2048);
  });

  test("a field longer than the cap is refused by the parser, not trimmed", () => {
    const valid = wire(serializeSourceCarrier(source()));
    expect(parseSourceCookie(encode({ ...valid, uc: "x".repeat(128) }))).not.toBeNull();
    expect(parseSourceCookie(encode({ ...valid, uc: "x".repeat(129) }))).toBeNull();
    expect(parseSourceCookie(encode({ ...valid, lp: "x".repeat(129) }))).toBeNull();
  });

  test("a value that is mostly escaped characters is too big to write, and is dropped", () => {
    // Percent-encoding triples the size of a `/`: seven 128-character fields of
    // them overflow the 2048-byte budget even though each is within its cap.
    const slashes = "/".repeat(128);
    const heavy = {
      ...wire(serializeSourceCarrier(source())),
      us: slashes, um: slashes, uc: slashes, uo: slashes, ut: slashes, lp: slashes, rh: slashes,
    };
    expect(parseSourceCarrier(heavy)).not.toBeNull();
    expect(sourceCookieFor(heavy)).toBeNull();
  });
});

describe("stampeo_ga", () => {
  test("holds the client id and the session id and number", () => {
    expect(ga()).toEqual({
      v: 2,
      cid: "1234567890.1700000000",
      sid: "1791244795",
      sn: 1,
      at: LANDED,
      ...EVIDENCE,
    });
  });

  test("before the property's session cookie exists, it holds the client id alone", () => {
    const early = buildGaCarrier({
      cid: "1234567890.1700000000",
      session: null,
      evidence: EVIDENCE,
      capturedAt: LANDED,
    });
    expect(early).toMatchObject({ sid: null, sn: null });
    expect(Object.keys(wire(serializeGaCarrier(early)))).not.toContain("sid");
    expect(parseGaCookie(serializeGaCarrier(early))).toEqual(early);
  });

  test.each([
    ["a client id in the GA1.1 form", { cid: "GA1.1.1234567890.1700000000" }],
    ["a client id of one number", { cid: "1234567890" }],
    ["a client id of text", { cid: "abc.def" }],
    ["a session id of text", { sid: "abc" }],
    ["a session id past any timestamp", { sid: "9".repeat(30) }],
    ["a session number of text", { sn: "1" }],
    ["a session number of zero", { sn: 0 }],
    ["a session number with a fraction", { sn: 1.5 }],
  ])("%s is null", (_case, edit) => {
    const valid = wire(serializeGaCarrier(ga()));
    expect(parseGaCookie(encode(valid))).not.toBeNull();
    expect(parseGaCookie(encode({ ...valid, ...edit }))).toBeNull();
  });
});

describe("stampeo_ad", () => {
  test("holds the click, when it was seen, and Meta's browser id", () => {
    expect(ad()).toEqual({
      v: 2,
      vn: "meta",
      ci: "IwAR_TEST_fbclid_0001",
      ct: LANDED,
      fbp: "fb.1.1791244790123.1122334455",
      ...EVIDENCE,
    });
  });

  test("leaves the browser id out until the pixel has written it", () => {
    const early = buildAdCarrier({ landing: landing(URL_META), fbp: null, evidence: EVIDENCE });
    expect(early).toMatchObject({ vn: "meta", fbp: null });
    expect(Object.keys(wire(serializeAdCarrier(early!)))).not.toContain("fbp");
  });

  test("an arrival without a click has no paid carrier at all", () => {
    expect(
      buildAdCarrier({
        landing: landing("https://stampeo.app/us?utm_source=newsletter"),
        // `_fbp` exists, and still is not copied: Meta's own cookie lives 90
        // days, and the sign-up call forwards it live.
        fbp: "fb.1.1791244790123.1122334455",
        evidence: EVIDENCE,
      }),
    ).toBeNull();
  });

  test("a click seen again later keeps the moment it was first seen", () => {
    const repeat = buildAdCarrier({
      landing: landing(URL_META),
      fbp: null,
      evidence: EVIDENCE,
      clickedAt: 1_790_000_000,
    });
    expect(repeat!.ct).toBe(1_790_000_000);
  });

  test.each([
    ["a vendor we do not report to", { vn: "direct" }],
    ["a vendor of text", { vn: "doubleclick" }],
    ["a vendor that is not text", { vn: 1 }],
    ["an injection attempt", { vn: "'; DROP TABLE businesses; --" }],
    ["an empty click id", { ci: "" }],
    ["a click id that is not text", { ci: 7 }],
    ["a click id past its cap", { ci: "x".repeat(513) }],
    ["a browser id past its cap", { fbp: "x".repeat(513) }],
    ["a click moment of text", { ct: "1791244800" }],
  ])("%s is null", (_case, edit) => {
    const valid = wire(serializeAdCarrier(ad()));
    expect(parseAdCookie(encode(valid))).not.toBeNull();
    expect(parseAdCookie(encode({ ...valid, ...edit }))).toBeNull();
  });

  test.each(["meta", "google", "tiktok"])("the vendor %s is accepted", (vn) => {
    const valid = wire(serializeAdCarrier(ad()));
    expect(parseAdCookie(encode({ ...valid, vn }))).toMatchObject({ vn });
  });

  test("a real-length click id is never truncated", () => {
    // fbclid runs past 100 characters; a shortened one attributes to nothing.
    const realistic = `IwAR${"3".repeat(150)}`;
    const built = buildAdCarrier({
      landing: landing(`https://stampeo.app/us?fbclid=${realistic}`),
      fbp: null,
      evidence: EVIDENCE,
    });
    expect(built!.ci).toBe(realistic);
    expect(parseAdCookie(serializeAdCarrier(built!))!.ci).toBe(realistic);
  });

  test("a hostile click id is cut at 512 and the carrier survives it", () => {
    const built = buildAdCarrier({
      landing: landing(`https://stampeo.app/us?gclid=${"g".repeat(4000)}`),
      fbp: null,
      evidence: EVIDENCE,
    });
    expect(built!.ci).toHaveLength(512);
    expect(built!.vn).toBe("google");
  });
});

describe("paidClick: which platform an arrival belongs to", () => {
  test.each([
    ["a Google click", "?gclid=g1", { vendor: "google", clickId: "g1" }],
    ["a Meta click", "?fbclid=f1", { vendor: "meta", clickId: "f1" }],
    ["a TikTok click", "?ttclid=t1", { vendor: "tiktok", clickId: "t1" }],
    // One carrier holds one platform, so a visitor carrying two resolves the
    // same way every time rather than by parameter order.
    ["Google over Meta over TikTok", "?ttclid=t&fbclid=f&gclid=g", { vendor: "google", clickId: "g" }],
    ["Meta over TikTok", "?ttclid=t&fbclid=f", { vendor: "meta", clickId: "f" }],
    ["tags with no click", "?utm_source=newsletter", null],
    ["an empty click id", "?gclid=", null],
    ["nothing", "", null],
  ])("%s", (_case, search, expected) => {
    expect(paidClick(readClickIds(search))).toEqual(expected);
  });
});

describe("readFbp: Meta's browser id", () => {
  test("is read whole, since it is already in the wire format", () => {
    expect(readFbp("_fbp=fb.1.1700000000.987654321")).toBe("fb.1.1700000000.987654321");
  });

  test("is found among other cookies", () => {
    expect(readFbp("NEXT_LOCALE=fr; _fbp=fb.1.1700000000.987654321; _ga=GA1.1.5.6")).toBe(
      "fb.1.1700000000.987654321",
    );
  });

  test("a lookalike cookie name is not ours", () => {
    expect(readFbp("x_fbp=fb.1.1.2")).toBeNull();
  });

  test("absent or empty is null, never a throw", () => {
    expect(readFbp(null)).toBeNull();
    expect(readFbp("")).toBeNull();
    expect(readFbp("_fbp=")).toBeNull();
  });
});

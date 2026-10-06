/**
 * The GA identifiers a visitor carries: the client id out of `_ga`, and the
 * session id and number out of the property's `_ga_<id>` cookie, which Google
 * writes in two formats (GS1, then GS2 from 2023).
 *
 * The values are typed by whoever opens devtools, so every reader is total:
 * a cookie we cannot read is null, never a throw and never a guess.
 */

import { describe, expect, test } from "bun:test";

import {
  gaSessionCookieName,
  parseGaSessionCookie,
  readGaClientId,
  readGaSession,
} from "./ga-ids";

const GS2 = "GS2.1.s1791244795$o1$g1$t1791244799$j0$l0$h0";
const GS1 = "GS1.1.1791244795.3.1.1791244799.0.0.0";

describe("parseGaSessionCookie", () => {
  test.each([
    ["GS2, the format Google writes today", GS2, { sid: "1791244795", sn: 1 }],
    ["GS2 on a returning visitor's twelfth session", "GS2.1.s1791244795$o12$g1$t1791244799$j0$l0$h0", { sid: "1791244795", sn: 12 }],
    ["GS2 with the dollar signs percent-encoded", "GS2.1.s1791244795%24o2%24g1%24t1791244799%24j0%24l0%24h0", { sid: "1791244795", sn: 2 }],
    ["GS2 on a two-component cookie domain", "GS2.2.s1791244795$o1$g0$t1791244799$j0$l0$h0", { sid: "1791244795", sn: 1 }],
    ["GS1, the older format", GS1, { sid: "1791244795", sn: 3 }],
    ["GS1 on a two-component cookie domain", "GS1.2.1791244795.1.0.1791244799.60.0.0", { sid: "1791244795", sn: 1 }],
  ])("%s", (_case, value, parsed) => {
    expect(parseGaSessionCookie(value)).toEqual(parsed);
  });

  test.each([
    ["nothing", undefined],
    ["null", null],
    ["an empty string", ""],
    ["a different cookie's value", "GA1.1.1234567890.1700000000"],
    ["a version we do not know", "GS3.1.s1791244795$o1$g1"],
    ["GS2 without a session number", "GS2.1.s1791244795$g1$t1"],
    ["GS2 without a session id", "GS2.1.o1$g1$t1"],
    ["GS2 with a non-numeric id", "GS2.1.sabc$o1$g1"],
    ["GS2 with an empty number", "GS2.1.s1791244795$o$g1"],
    ["GS1 with one number only", "GS1.1.1791244795"],
    ["GS1 with a letter for the number", "GS1.1.1791244795.x.1"],
    ["a negative number", "GS1.1.1791244795.-1.1"],
    ["a session id past any real timestamp", `GS2.1.s${"9".repeat(30)}$o1$g1`],
    ["a session number past any real count", `GS2.1.s1791244795$o${"9".repeat(15)}$g1`],
    ["an object", { sid: "1" } as unknown as string],
    ["a number", 17 as unknown as string],
  ])("%s is null, not a throw", (_case, value) => {
    expect(parseGaSessionCookie(value)).toBeNull();
  });

  test("a value that cannot be decoded is null", () => {
    expect(parseGaSessionCookie("GS2.1.s1%E0%A4%A$o1")).toBeNull();
  });
});

describe("readGaClientId", () => {
  test("is the two-number client id, never the GA1.1 form", () => {
    expect(readGaClientId("NEXT_LOCALE=fr; _ga=GA1.1.1234567890.1700000000")).toBe(
      "1234567890.1700000000",
    );
  });

  test("reads a cookie written on a two-component domain", () => {
    expect(readGaClientId("_ga=GA1.2.1234567890.1700000000")).toBe("1234567890.1700000000");
  });

  test.each([
    ["no cookies", null],
    ["an empty jar", ""],
    ["a lookalike name", "x_ga=GA1.1.1234567890.1700000000"],
    ["the property's session cookie", "_ga_ZFZ6JLPFXN=GS2.1.s1791244795$o1$g1"],
    ["a value with too few parts", "_ga=GA1.1.1234567890"],
    ["a value that is not numeric", "_ga=GA1.1.abc.def"],
    ["a value with extra parts", "_ga=GA1.1.1234567890.1700000000.9"],
  ])("%s is null", (_case, header) => {
    expect(readGaClientId(header)).toBeNull();
  });
});

describe("the property's session cookie", () => {
  test("is named after the measurement id without its G- prefix", () => {
    expect(gaSessionCookieName("G-ZFZ6JLPFXN")).toBe("_ga_ZFZ6JLPFXN");
  });

  test.each([null, "", "ZFZ6JLPFXN", "GTM-ABC123", "1088158323750710"])(
    "an id that is not a measurement id (%p) names no cookie",
    (id) => {
      expect(gaSessionCookieName(id)).toBeNull();
    },
  );

  test("only the configured property's cookie is read", () => {
    const jar = `_ga_OTHER12345=GS2.1.s1$o9$g1; _ga_ZFZ6JLPFXN=${GS2}; _ga=GA1.1.1.2`;
    expect(readGaSession(jar, "G-ZFZ6JLPFXN")).toEqual({ sid: "1791244795", sn: 1 });
  });

  test.each([
    ["no property configured", `_ga_ZFZ6JLPFXN=${GS2}`, null],
    ["another property only", `_ga_OTHER12345=${GS2}`, "G-ZFZ6JLPFXN"],
    ["an unreadable value", "_ga_ZFZ6JLPFXN=junk", "G-ZFZ6JLPFXN"],
    ["no cookies", "", "G-ZFZ6JLPFXN"],
  ])("%s gives no session", (_case, jar, id) => {
    expect(readGaSession(jar, id)).toBeNull();
  });
});

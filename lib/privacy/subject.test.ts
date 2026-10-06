/**
 * The compliance subject: one random id that chains a person's decisions, and
 * later joins them to the account they create.
 *
 * It lives in its own strictly necessary cookie, `stampeo_sid`, so a refusal's
 * long lifetime and a consent-version bump can neither shorten nor reset it.
 * It is ours to mint, so a value we did not write is not an id.
 *
 * It goes to exactly one place: the consent ledger. Nothing that talks to GA4
 * or Meta may ever be handed it.
 */

import { afterEach, describe, expect, test } from "bun:test";

import {
  CONSENT_COOKIE,
  CONSENT_VERSION,
  ensureSubjectId,
  readSubjectId,
  writeConsentRecord,
} from "../consent";
import {
  OTHER_SUBJECT as IN_RECORD,
  SUBJECT as SID,
  installFakeBrowser,
  type FakeBrowser,
} from "./__fixtures__/fake-browser";
import { ctaClick } from "../cta/events";
import { gaConfig } from "../google-analytics";
import { metaEventForContactForm, metaEventForLink, viewContentCategory } from "../meta-pixel";
import { rowFor } from "./policy";
import { readSidCookie, validSubjectId } from "./subject";

const V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

let browser: FakeBrowser | null = null;
afterEach(() => {
  browser?.restore();
  browser = null;
});

/** The cookie value a banner of version `v` wrote, carrying `s`. */
function consentCookie(v: number, s: unknown): string {
  const value = encodeURIComponent(
    JSON.stringify({ v, a: 1, m: 1, t: 1_759_000_000, r: "opt-in", s }),
  );
  return `${CONSENT_COOKIE}=${value}`;
}

describe("a subject cookie we did not write is not a subject (AC3.4)", () => {
  test("a bare v4 uuid is read", () => {
    expect(readSidCookie(`NEXT_LOCALE=fr; stampeo_sid=${SID}`)).toBe(SID);
  });

  test("an uppercase one is read as its lowercase self", () => {
    expect(readSidCookie(`stampeo_sid=${SID.toUpperCase()}`)).toBe(SID);
  });

  test.each([
    ["nothing", ""],
    ["not a uuid", "not-a-uuid"],
    ["a path", "../../etc/passwd"],
    ["a v1 uuid, which embeds a MAC address", "2c1b0c3e-9a3a-11ee-b9d1-0242ac120002"],
    ["a v3 uuid", "3f2504e0-4f89-31d3-9a0c-0305e82c3301"],
    ["a v4 uuid with a bad variant", "3f2504e0-4f89-41d3-1a0c-0305e82c3301"],
    ["a uuid with something after it", `${SID}x`],
  ])("%s is no subject", (_case, value) => {
    expect(readSidCookie(`stampeo_sid=${value}`)).toBeNull();
    expect(validSubjectId(value)).toBeNull();
  });

  test("a cookie that merely ends in our name is somebody else's", () => {
    expect(readSidCookie(`x_stampeo_sid=${SID}`)).toBeNull();
    expect(readSidCookie(null)).toBeNull();
  });
});

describe("ensureSubjectId: the subject cookie, then the consent record, then a new one", () => {
  test.each([
    ["both agree", `stampeo_sid=${SID}; ${consentCookie(CONSENT_VERSION, SID)}`, SID],
    ["they differ: the cookie wins", `stampeo_sid=${SID}; ${consentCookie(CONSENT_VERSION, IN_RECORD)}`, SID],
    ["only the consent record has one", consentCookie(CONSENT_VERSION, IN_RECORD), IN_RECORD],
    ["a forged cookie falls back on the record", `stampeo_sid=forged; ${consentCookie(CONSENT_VERSION, IN_RECORD)}`, IN_RECORD],
    ["a consent record of an older version still counts", consentCookie(CONSENT_VERSION - 1, IN_RECORD), IN_RECORD],
  ])("%s", (_case, cookie, expected) => {
    browser = installFakeBrowser({ cookie });
    expect(ensureSubjectId()).toBe(expected);
  });

  test.each([
    ["nothing at all", ""],
    ["only a forged cookie", "stampeo_sid=forged"],
    ["a forged subject in the record", consentCookie(CONSENT_VERSION, "1; DROP TABLE")],
  ])("with %s, a new random v4 is minted", (_case, cookie) => {
    browser = installFakeBrowser({ cookie });
    const minted = ensureSubjectId();

    expect(minted).toMatch(V4);
    expect(minted).not.toBe("forged");
  });

  test("two fresh visitors do not share one", () => {
    browser = installFakeBrowser();
    const first = ensureSubjectId();
    browser.restore();
    browser = installFakeBrowser();

    expect(ensureSubjectId()).not.toBe(first);
  });

  test("the consent record's own reader still finds the id inside it", () => {
    browser = installFakeBrowser({ cookie: consentCookie(CONSENT_VERSION - 1, IN_RECORD) });
    expect(readSubjectId(browser.jar())).toBe(IN_RECORD);
  });
});

describe("a consent-version bump leaves the subject alone (AC3.5)", () => {
  test("the new record is chained to the same subject", () => {
    browser = installFakeBrowser({
      cookie: `stampeo_sid=${SID}; ${consentCookie(CONSENT_VERSION - 1, SID)}`,
    });

    const record = writeConsentRecord({ analytics: false, marketing: false }, rowFor("FR"));

    expect(record.subjectId).toBe(SID);
    expect(browser.jar()).toContain(`stampeo_sid=${SID}`);
  });
});

describe("the subject never reaches GA4 or Meta (AC3.1)", () => {
  test("a visitor who carries one sends neither vendor anything that holds it", () => {
    browser = installFakeBrowser({ cookie: `stampeo_sid=${SID}; ${consentCookie(CONSENT_VERSION, SID)}` });
    const clicks = [
      { ctaLocation: "header", href: "/onboarding", pathname: "/pricing", locale: "en" },
      { ctaLocation: "header", href: "/contact", pathname: "/pricing", locale: "en" },
    ] as const;

    const sent = JSON.stringify([
      clicks.map((click) => ctaClick(click)),
      gaConfig("?debug_mode=1"),
      metaEventForLink("mailto:hello@stampeo.app"),
      metaEventForContactForm(200),
      viewContentCategory("/pricing"),
    ]);

    expect(sent).toContain("sign_up_cta_click");
    expect(sent).not.toContain(SID);
    expect(sent).not.toContain("stampeo_sid");
  });
});

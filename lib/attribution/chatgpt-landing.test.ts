/**
 * A visitor lands from a ChatGPT ad (`?oppref=`). The click is advertising
 * data, so it is recorded only under an advertising choice made against the
 * current consent version, the text that names OpenAI as a recipient:
 *
 *   - a European with a grant from the previous version is asked again, and
 *     accepting records the click under the current one;
 *   - a refusal from the previous version stays a refusal; only a refusal of
 *     everything goes unasked;
 *   - a US visitor on the notice default is captured under the current version,
 *     unless a previous-version refusal with a click moment still stands, which
 *     keeps its own version (the backend then holds the click back from OpenAI);
 *   - Global Privacy Control still beats a US choice.
 *
 * The browser never talks to OpenAI: the click rides in our own cookie and
 * reaches OpenAI from our servers only.
 */

import { afterEach, describe, expect, test } from "bun:test";

import { CONSENT_COOKIE, CONSENT_VERSION, consentSurface, writeConsentRecord } from "../consent";
import { SUBJECT, installFakeBrowser, type FakeBrowser } from "../privacy/__fixtures__/fake-browser";
import { runPageLifecycle } from "../privacy/lifecycle";
import { detectPolicyRow } from "../privacy/region";
import { readConsentSnapshot } from "../privacy/snapshot";
import { parseAdCookie } from "./ad-ids";
import { capturePass } from "./capture";
import { cookieValue } from "./codec";
import { AD_COOKIE, SOURCE_COOKIE } from "./cookie-names";
import { consentEvidence } from "./evidence";
import { parseSourceCookie } from "./source";
import { CHATGPT_LANDING, GA_CID, LANDED, OPPREF } from "./__fixtures__/visitors";

const CURRENT = CONSENT_VERSION;
const PREVIOUS = CONSENT_VERSION - 1;
const CHOSEN_AT = 1_759_000_000;
const GA_JAR = `_ga=GA1.1.${GA_CID}; _ga_ZFZ6JLPFXN=GS2.1.s1791244795$o1$g1$t1791244799$j0$l0$h0`;

let browser: FakeBrowser | null = null;
afterEach(() => {
  browser?.restore();
  browser = null;
});

/** The cookie value a banner of version `v` wrote for this choice. */
const choice = (v: number, fields: Record<string, unknown>) =>
  encodeURIComponent(JSON.stringify({ v, t: CHOSEN_AT, s: SUBJECT, ...fields }));

const EU = "Europe/Paris";
const US = "America/New_York";

/** A page load for a visitor carrying `consent` (the consent cookie's value), before any capture. */
function open(options: { consent?: string; timezone: string; gpc?: boolean }) {
  const jar = [`stampeo_sid=${SUBJECT}`, GA_JAR];
  if (options.consent) jar.push(`${CONSENT_COOKIE}=${options.consent}`);
  browser = installFakeBrowser({
    cookie: jar.join("; "),
    timezone: options.timezone,
    gpc: options.gpc,
    hostname: "stampeo.app",
    fetch: "route",
  });
  runPageLifecycle("/us", { refreshed: false });
}

/** What the page does when it captures the landing under the visitor's current state. */
function capture() {
  const snapshot = readConsentSnapshot();
  const evidence = consentEvidence({ record: snapshot.record, prior: snapshot.prior, row: snapshot.row });
  if (evidence === null) return;
  capturePass({
    landing: CHATGPT_LANDING,
    consent: { analytics: snapshot.analytics, marketing: snapshot.marketing },
    evidence,
    measurementId: "G-ZFZ6JLPFXN",
    now: LANDED + 5,
  });
}

const adCarrier = () => parseAdCookie(cookieValue(browser!.jar(), AD_COOKIE));

const surface = () => {
  const snapshot = readConsentSnapshot();
  return consentSurface({
    record: snapshot.record,
    prior: snapshot.prior,
    gpc: snapshot.gpc,
    trackable: true,
    row: detectPolicyRow(),
  });
};

test("a European with a grant from the previous version is asked again, and accepting records the ChatGPT click under the current one", async () => {
  open({ consent: choice(PREVIOUS, { a: 1, m: 1, r: "opt-in" }), timezone: EU });

  // The landing: the old grant is not carried, so the banner shows and nothing is recorded.
  expect(surface()).toBe("banner");
  capture();
  await browser!.settled();
  expect(adCarrier()).toBeNull();

  // "Accept all" in the banner, and the capture that follows it.
  writeConsentRecord({ analytics: true, marketing: true }, detectPolicyRow());
  capture();
  await browser!.settled();
  expect(adCarrier()).toMatchObject({ vn: "openai", ci: OPPREF, cv: CURRENT, cr: "opt-in", g: "EEA_UK_CH" });

  // The next page load keeps it.
  runPageLifecycle("/us/pricing", { refreshed: false });
  await browser!.settled();
  expect(adCarrier()).toMatchObject({ vn: "openai", ci: OPPREF, cv: CURRENT });

  // Nothing in the browser reached OpenAI: no script and no request.
  expect(browser!.scripts.filter((src) => /openai/i.test(src))).toEqual([]);
  expect(browser!.fetches.filter((call) => /openai/i.test(call.url))).toEqual([]);
});

describe("a refusal of advertising made under the previous version still stands", () => {
  // Only a refusal of everything goes unasked: a grant of the other category
  // was given for the older text, so that one is asked again.
  test.each([
    ["a European who refused everything", EU, { a: 0, m: 0, r: "opt-in" }, "none"],
    ["an American who opted out of everything", US, { a: 0, m: 0, r: "opt-out" }, "none"],
    ["a European who refused advertising only", EU, { a: 1, m: 0, r: "opt-in" }, "banner"],
    ["an American who opted out of advertising only", US, { a: 1, m: 0, r: "opt-out" }, "notice"],
  ])("%s: advertising stays off, the click is not recorded, and the surface is %s", async (_case, timezone, fields, shown) => {
    open({ consent: choice(PREVIOUS, fields), timezone });

    expect(readConsentSnapshot().marketing).toBe(false);
    expect(surface()).toBe(shown);
    capture();
    await browser!.settled();
    expect(adCarrier()).toBeNull();
  });
});

describe("a US visitor from a ChatGPT ad", () => {
  test.each([
    ["has no record", undefined],
    ["holds a previous-version grant, which is the notice dismissed", choice(PREVIOUS, { a: 1, m: 1, r: "opt-out", g: "US" })],
    ["holds a previous-version record with nothing chosen", choice(PREVIOUS, { a: -1, m: -1, r: "opt-out" })],
  ])("who %s is captured under the current notice, with nobody having clicked", async (_case, consent) => {
    open({ consent, timezone: US });

    expect(surface()).toBe("notice");
    capture();
    await browser!.settled();
    expect(adCarrier()).toMatchObject({
      vn: "openai",
      ci: OPPREF,
      cv: CURRENT,
      ca: 0,
      cr: "opt-out",
      g: "US",
    });
  });

  test("who refused analytics under the previous version is captured under that version and that moment", async () => {
    // Their state rests on the older text, so the backend holds the click back
    // from OpenAI until they choose again.
    open({ consent: choice(PREVIOUS, { a: 0, m: 1, r: "opt-out" }), timezone: US });

    capture();
    await browser!.settled();
    expect(adCarrier()).toMatchObject({ vn: "openai", ci: OPPREF, cv: PREVIOUS, ca: CHOSEN_AT, cr: "opt-out" });
  });

  test.each([
    ["a current-version grant", choice(CURRENT, { a: 1, m: 1, r: "opt-out", g: "US" })],
    ["no record", undefined],
  ])("under Global Privacy Control, whatever %s says, nothing is recorded", async (_case, consent) => {
    open({ consent, timezone: US, gpc: true });

    expect(readConsentSnapshot().marketing).toBe(false);
    capture();
    await browser!.settled();
    expect(adCarrier()).toBeNull();
  });

  test("who refuses advertising on the notice keeps the click out", async () => {
    open({ consent: choice(CURRENT, { a: 1, m: 0, r: "opt-out", g: "US" }), timezone: US });

    capture();
    await browser!.settled();
    expect(adCarrier()).toBeNull();
  });
});

describe("a visitor from a ChatGPT ad who allows analytics and refuses advertising", () => {
  // The source cookie belongs to analytics, so it is written; the click id is
  // advertising data and appears in no cookie and in no request.
  test.each([
    ["a European", EU, { a: 1, m: 0, r: "opt-in" }],
    ["an American", US, { a: 1, m: 0, r: "opt-out", g: "US" }],
  ])("%s keeps the campaign, and the oppref is nowhere in the jar or the route", async (_case, timezone, fields) => {
    open({ consent: choice(CURRENT, fields), timezone });

    capture();
    await browser!.settled();

    const jar = browser!.jar();
    expect(adCarrier()).toBeNull();
    expect(parseSourceCookie(cookieValue(jar, SOURCE_COOKIE))).toMatchObject({ us: "chatgpt", um: "cpc" });
    // The id's opening characters survive every spelling (raw, escaped once or twice).
    const opening = OPPREF.slice(0, 8);
    expect(jar).not.toContain(opening);
    expect(JSON.stringify(browser!.fetches.map((call) => call.body))).not.toContain(opening);
  });
});

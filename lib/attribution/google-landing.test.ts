/**
 * A European visitor who accepted everything under the previous consent text
 * lands from a Google ad. Their grant does not carry over, so the click is not
 * recorded until they answer the banner again; once they accept, the ad carrier
 * names Google, its click and the current consent version, and the next page
 * load keeps it.
 */

import { afterEach, expect, test } from "bun:test";

import { CONSENT_COOKIE, CONSENT_VERSION, consentSurface, writeConsentRecord } from "../consent";
import { SUBJECT, installFakeBrowser, type FakeBrowser } from "../privacy/__fixtures__/fake-browser";
import { runPageLifecycle } from "../privacy/lifecycle";
import { detectPolicyRow } from "../privacy/region";
import { readConsentSnapshot } from "../privacy/snapshot";
import { parseAdCookie } from "./ad-ids";
import { capturePass } from "./capture";
import { AD_COOKIE } from "./cookie-names";
import { cookieValue } from "./codec";
import { consentEvidence } from "./evidence";
import { GA_CID, GOOGLE_LANDING, LANDED } from "./__fixtures__/visitors";

let browser: FakeBrowser | null = null;
afterEach(() => {
  browser?.restore();
  browser = null;
});

const PREVIOUS_GRANT = encodeURIComponent(
  JSON.stringify({ v: CONSENT_VERSION - 1, a: 1, m: 1, t: 1_759_000_000, r: "opt-in", s: SUBJECT }),
);
const GA_JAR = `_ga=GA1.1.${GA_CID}; _ga_ZFZ6JLPFXN=GS2.1.s1791244795$o1$g1$t1791244799$j0$l0$h0`;

/** What the page does when it captures the landing under the visitor's current state. */
function capture() {
  const snapshot = readConsentSnapshot();
  return capturePass({
    landing: GOOGLE_LANDING,
    consent: { analytics: snapshot.analytics, marketing: snapshot.marketing },
    evidence: consentEvidence({ record: snapshot.record, prior: snapshot.prior, row: snapshot.row })!,
    measurementId: "G-ZFZ6JLPFXN",
    now: LANDED + 5,
  });
}

const adCarrier = () => parseAdCookie(cookieValue(browser!.jar(), AD_COOKIE));

test("a version 3 grantee from a Google ad is asked again, and accepting records the Google click under the current version", async () => {
  browser = installFakeBrowser({
    cookie: `stampeo_sid=${SUBJECT}; ${CONSENT_COOKIE}=${PREVIOUS_GRANT}; ${GA_JAR}`,
    timezone: "Europe/Paris",
    hostname: "stampeo.app",
    fetch: "route",
  });

  // The landing: the old grant is not carried, so the banner shows and nothing is recorded.
  runPageLifecycle("/fr", { refreshed: false });
  const landed = readConsentSnapshot();
  expect(consentSurface({ record: landed.record, prior: landed.prior, gpc: false, trackable: true, row: detectPolicyRow() })).toBe(
    "banner",
  );
  capture();
  await browser.settled();
  expect(adCarrier()).toBeNull();

  // "Accept all" in the banner, and the capture that follows it.
  writeConsentRecord({ analytics: true, marketing: true }, detectPolicyRow());
  capture();
  await browser.settled();
  expect(adCarrier()).toMatchObject({
    vn: "google",
    ci: "Cj0KCQ_TEST_gclid_0001",
    cv: CONSENT_VERSION,
    cr: "opt-in",
    g: "EEA_UK_CH",
  });

  // The next page load keeps it.
  runPageLifecycle("/fr/tarifs", { refreshed: false });
  await browser.settled();
  expect(adCarrier()).toMatchObject({ vn: "google", cv: CONSENT_VERSION });
});

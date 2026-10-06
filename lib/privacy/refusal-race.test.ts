/**
 * A refusal can be outrun: a capture request already on the wire carries the
 * cookies the browser had before the click, and a poll that started earlier
 * writes with the consent it started with. Neither may leave a refused
 * category's carrier behind: the write checks consent again when it happens,
 * and every trackable page load clears what the stored record refuses.
 */

import { afterEach, describe, expect, test } from "bun:test";

import { capturePass } from "../attribution/capture";
import { FBP, GA_CID, META_LANDING, US, visitor } from "../attribution/__fixtures__/visitors";
import {
  categoriesToClearOnChoice,
  clearCookiesFor,
  currentConsent,
  writeConsentRecord,
} from "../consent";
import { SUBJECT, installFakeBrowser, type FakeBrowser } from "./__fixtures__/fake-browser";
import { planPageLoad, runPageLifecycle } from "./lifecycle";
import { rowFor } from "./policy";

let browser: FakeBrowser | null = null;
afterEach(() => {
  browser?.restore();
  browser = null;
});

const GA_JAR = `_ga=GA1.1.${GA_CID}; _ga_ZFZ6JLPFXN=GS2.1.s1791244795$o1$g1$t1791244799$j0$l0$h0`;
const names = (jar: string) => jar.split("; ").map((entry) => entry.split("=")[0]);

/** What the page does when polling for the tags' cookies. */
const poll = (consent = visitor(US)) =>
  capturePass({
    landing: META_LANDING,
    ...consent,
    measurementId: "G-ZFZ6JLPFXN",
    pixelId: "1088158323750710",
    now: 1_791_244_805,
  });

/** What the banner does for a refusal of advertising. */
function refuseAdvertising() {
  const before = currentConsent();
  const next = { analytics: true, marketing: false };
  writeConsentRecord(next, rowFor("US"));
  clearCookiesFor(categoriesToClearOnChoice(before, next));
}

describe("a US visitor on a Meta ad refuses advertising while the capture is still polling for _fbp", () => {
  function landed() {
    browser = installFakeBrowser({
      timezone: "America/New_York",
      cookie: `stampeo_sid=${SUBJECT}; ${GA_JAR}`,
      hostname: "stampeo.app",
      fetch: "route",
    });
  }

  test("the response that lands after the clear is gone on the next load", async () => {
    landed();
    browser!.holdNext();
    expect(poll().awaited.fbp).toBe(true);
    expect(names(browser!.jar())).toContain("stampeo_ad");

    refuseAdvertising();
    await browser!.settled();
    expect(names(browser!.jar())).not.toContain("stampeo_ad");

    // The capture's own response, answered before the click and applied after it.
    browser!.release();
    expect(names(browser!.jar())).toContain("stampeo_ad");

    runPageLifecycle("/us/pricing", { refreshed: false });
    await browser!.settled();

    expect(names(browser!.jar())).not.toContain("stampeo_ad");
    // What the visitor still allows stays.
    expect(names(browser!.jar())).toEqual(expect.arrayContaining(["stampeo_src", "stampeo_ga"]));
  });

  test("a poll that started before the click writes nothing of the refused category", async () => {
    landed();
    const stale = visitor(US);
    poll(stale);
    refuseAdvertising();
    await browser!.settled();
    const writesBefore = browser!.writes.length;
    const requestsBefore = browser!.fetches.length;

    // The same poll, one tick later, still believing marketing is allowed, and the pixel has now written _fbp.
    browser!.setJar(`${browser!.jar()}; _fbp=${FBP}`);
    poll(stale);
    await browser!.settled();

    expect(browser!.writes.slice(writesBefore).some((write) => write.startsWith("stampeo_ad="))).toBe(false);
    for (const request of browser!.fetches.slice(requestsBefore)) {
      expect(Object.keys((request.body.carriers as object | undefined) ?? {})).not.toContain("ad");
    }
    expect(names(browser!.jar())).not.toContain("stampeo_ad");
  });
});

describe("every trackable load clears what the stored record explicitly refuses", () => {
  const record = (choice: object) =>
    `stampeo_consent=${encodeURIComponent(JSON.stringify({ v: 3, t: 1_791_244_000, s: SUBJECT, ...choice }))}`;
  const CARRIERS_JAR = "stampeo_src=1; stampeo_ga=2; stampeo_ad=3; _ga=4; _fbp=5; _fbc=6";

  test.each([
    ["a US refusal of advertising", "America/New_York", record({ a: 1, m: 0, r: "opt-out" }), ["stampeo_ad", "_fbp", "_fbc"], ["stampeo_src", "stampeo_ga", "_ga"]],
    ["a restored refusal of advertising", "America/New_York", record({ a: -1, m: 0, r: "opt-out", o: "restore" }), ["stampeo_ad", "_fbp", "_fbc"], ["stampeo_src", "stampeo_ga", "_ga"]],
    ["a European refusal of analytics", "Europe/Paris", record({ a: 0, m: 1, r: "opt-in" }), ["stampeo_ga", "_ga"], ["stampeo_src", "stampeo_ad", "_fbp"]],
    ["a refusal of advertising under the previous text", "Europe/Paris", record({ v: 2, a: 1, m: 0, r: "opt-in" }), ["stampeo_ad", "_fbp", "_fbc"], ["stampeo_src", "stampeo_ga", "_ga"]],
    ["a refusal of both", "Europe/Paris", record({ a: 0, m: 0, r: "opt-in" }), ["stampeo_src", "stampeo_ga", "stampeo_ad", "_ga", "_fbp"], []],
  ] as const)("%s", async (_case, timezone, consent, gone, kept) => {
    browser = installFakeBrowser({
      timezone,
      cookie: `${consent}; ${CARRIERS_JAR}; stampeo_sid=${SUBJECT}`,
      hostname: "stampeo.app",
      fetch: "route",
    });

    runPageLifecycle("/pricing", { refreshed: false });
    await browser.settled();

    const left = names(browser.jar());
    for (const name of gone) expect(left).not.toContain(name);
    for (const name of kept) expect(left).toContain(name);
  });

  test.each([
    ["no choice", record({ a: -1, m: -1, r: "opt-out" })],
    ["a grant", record({ a: 1, m: 1, r: "opt-out", g: "US" })],
    ["no record", ""],
  ])("%s clears nothing, and asks the server for nothing", async (_case, consent) => {
    browser = installFakeBrowser({
      timezone: "America/New_York",
      cookie: `${consent}; ${CARRIERS_JAR}; stampeo_sid=${SUBJECT}`,
      hostname: "stampeo.app",
      fetch: "route",
    });

    runPageLifecycle("/us/pricing", { refreshed: false });
    await browser.settled();

    expect(names(browser.jar())).toEqual(expect.arrayContaining(["stampeo_src", "stampeo_ga", "stampeo_ad", "_fbp"]));
    expect(browser.fetches.every((request) => !("clear" in request.body))).toBe(true);
  });

  test("a page where no tag may run clears nothing", async () => {
    browser = installFakeBrowser({
      timezone: "America/New_York",
      cookie: `${record({ a: 1, m: 0, r: "opt-out" })}; ${CARRIERS_JAR}`,
      hostname: "stampeo.app",
      fetch: "route",
    });

    runPageLifecycle("/onboarding", { refreshed: false });
    await browser.settled();

    expect(names(browser.jar())).toContain("stampeo_ad");
  });

  test.each([
    ["a refusal of advertising", { analytics: true, marketing: false }, ["marketing"]],
    ["a restored one", { analytics: null, marketing: false }, ["marketing"]],
    ["both", { analytics: false, marketing: false }, ["analytics", "marketing"]],
    ["a grant", { analytics: true, marketing: true }, []],
    ["no choice", { analytics: null, marketing: null }, []],
  ])("the plan for %s names %j", (_case, stored, clear) => {
    const base = { row: US, sid: SUBJECT, trackable: true, refreshedThisDocument: false };

    expect(planPageLoad({ ...base, stored }).clear).toEqual(clear);
    expect(planPageLoad({ ...base, stored, trackable: false }).clear).toEqual([]);
  });
});

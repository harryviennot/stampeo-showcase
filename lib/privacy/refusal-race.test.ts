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
  readStoredConsent,
  writeConsentRecord,
} from "../consent";
import { SUBJECT, installFakeBrowser, type FakeBrowser } from "./__fixtures__/fake-browser";
import { mountTags } from "./__fixtures__/mount-tags";
import { noticeAcknowledgement } from "./choices-ui";
import { readConsentSnapshot } from "./snapshot";
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
  const next = { analytics: true, marketing: false };
  writeConsentRecord(next, rowFor("US"));
  clearCookiesFor(categoriesToClearOnChoice(next));
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

describe("every trackable load clears the cookies of every category the resolved consent denies", () => {
  const record = (choice: object) =>
    `stampeo_consent=${encodeURIComponent(JSON.stringify({ v: 3, t: 1_791_244_000, s: SUBJECT, ...choice }))}`;
  const CARRIERS_JAR = "stampeo_src=1; stampeo_ga=2; stampeo_ad=3; _ga=4; _ga_ZFZ6JLPFXN=7; _fbp=5; _fbc=6";
  const EVERYTHING = ["stampeo_src", "stampeo_ga", "stampeo_ad", "_ga", "_ga_ZFZ6JLPFXN", "_fbp", "_fbc"];

  const load = async (timezone: string, consent: string, options: { gpc?: boolean } = {}) => {
    browser = installFakeBrowser({
      timezone,
      cookie: `${consent}; ${CARRIERS_JAR}; stampeo_sid=${SUBJECT}`,
      hostname: "stampeo.app",
      fetch: "route",
      ...options,
    });
    runPageLifecycle("/pricing", { refreshed: false });
    await browser.settled();
    return names(browser.jar());
  };

  test.each([
    ["a US refusal of advertising", "America/New_York", record({ a: 1, m: 0, r: "opt-out" }), ["stampeo_ad", "_fbp", "_fbc"], ["stampeo_src", "stampeo_ga", "_ga"]],
    ["a restored refusal of advertising", "America/New_York", record({ a: -1, m: 0, r: "opt-out", o: "restore" }), ["stampeo_ad", "_fbp", "_fbc"], ["stampeo_src", "stampeo_ga", "_ga"]],
    ["a European refusal of analytics", "Europe/Paris", record({ a: 0, m: 1, r: "opt-in", g: "EEA_UK_CH" }), ["stampeo_ga", "_ga", "_ga_ZFZ6JLPFXN"], ["stampeo_src", "stampeo_ad", "_fbp"]],
    ["a refusal of both", "Europe/Paris", record({ a: 0, m: 0, r: "opt-in" }), EVERYTHING, []],
    // Denied without being refused:
    ["a refusal of advertising under the previous text, which asks about analytics again", "Europe/Paris", record({ v: 2, a: 1, m: 0, r: "opt-in" }), EVERYTHING, []],
    ["a US notice dismissal, now in Paris", "Europe/Paris", record({ a: 1, m: 1, r: "opt-out", g: "US" }), EVERYTHING, []],
    ["a European who never chose", "Europe/Paris", "", EVERYTHING, []],
    ["a visitor whose timezone we cannot place, who never chose", "Antarctica/Troll", "", EVERYTHING, []],
  ] as const)("%s", async (_case, timezone, consent, gone, kept) => {
    const left = await load(timezone, consent);

    for (const name of gone) expect(left).not.toContain(name);
    for (const name of kept) expect(left).toContain(name);
  });

  test("a US visitor under GPC, whatever they chose", async () => {
    const left = await load("America/New_York", record({ a: 1, m: 1, r: "opt-out", g: "US" }), { gpc: true });

    for (const name of EVERYTHING) expect(left).not.toContain(name);
  });

  test.each([
    ["no choice", record({ a: -1, m: -1, r: "opt-out" })],
    ["a grant", record({ a: 1, m: 1, r: "opt-out", g: "US" })],
    ["no record", ""],
  ])("a US visitor with %s keeps everything, and nothing is asked of the server", async (_case, consent) => {
    const left = await load("America/New_York", consent);

    for (const name of EVERYTHING) expect(left).toContain(name);
    expect(browser!.fetches.every((request) => !("clear" in request.body))).toBe(true);
  });

  test("a page where no tag may run clears nothing", async () => {
    browser = installFakeBrowser({
      timezone: "Europe/Paris",
      cookie: `${CARRIERS_JAR}`,
      hostname: "stampeo.app",
      fetch: "route",
    });

    runPageLifecycle("/onboarding", { refreshed: false });
    await browser.settled();

    expect(names(browser.jar())).toContain("stampeo_ad");
  });

  test.each([
    ["a refusal of advertising", { analytics: true, marketing: false }, ["marketing"]],
    ["analytics only", { analytics: false, marketing: true }, ["analytics"]],
    ["both", { analytics: false, marketing: false }, ["analytics", "marketing"]],
    ["nothing", { analytics: true, marketing: true }, []],
  ])("the plan for a consent that denies %s names %j", (_case, consent, clear) => {
    const base = { row: US, sid: SUBJECT, stored: null, trackable: true, refreshedThisDocument: false };

    expect(planPageLoad({ ...base, consent }).clear).toEqual(clear);
    expect(planPageLoad({ ...base, consent, trackable: false }).clear).toEqual([]);
  });
});

describe("Got it in New York, then the same browser in Paris", () => {
  const stray = `_ga=GA1.1.${GA_CID}; _ga_ZFZ6JLPFXN=GS2.1.s1791244795$o1$g1; _fbp=${FBP}; _fbc=fb.1.1791244800000.IwAR_TEST_fbclid_0001`;

  test("the tags' cookies and the carriers are gone, no tag loads, and Refuse all clears again, every time", async () => {
    browser = installFakeBrowser({ timezone: "America/New_York", hostname: "stampeo.app", fetch: "route" });
    runPageLifecycle("/us/pricing", { refreshed: false });
    writeConsentRecord(noticeAcknowledgement(readConsentSnapshot()), US);
    // The tags ran and set their cookies, and the capture wrote the carriers.
    browser.setJar(`${browser.jar()}; ${stray}`);
    poll();
    await browser.settled();
    for (const name of ["_ga", "_fbp", "_fbc", "stampeo_src", "stampeo_ga", "stampeo_ad"]) {
      expect(names(browser.jar())).toContain(name);
    }
    const jar = browser.jar();
    browser.restore();

    // Paris: the live row is stricter than the row the notice was dismissed in.
    browser = installFakeBrowser({ cookie: jar, timezone: "Europe/Paris", hostname: "stampeo.app", fetch: "route" });
    runPageLifecycle("/pricing", { refreshed: false });
    await browser.settled();
    await mountTags("got-it-in-paris");

    for (const name of ["_ga", "_ga_ZFZ6JLPFXN", "_fbp", "_fbc", "stampeo_src", "stampeo_ga", "stampeo_ad"]) {
      expect(names(browser.jar())).not.toContain(name);
    }
    expect(browser.scripts).toEqual([]);

    // "Refuse all", though the live state already denies everything; and again.
    for (const round of [1, 2]) {
      browser.setJar(`${browser.jar()}; ${stray}; stampeo_ad=1`);
      expect(currentConsent()).toEqual({ analytics: false, marketing: false });

      const next = { analytics: false, marketing: false };
      writeConsentRecord(next, rowFor("FR"));
      clearCookiesFor(categoriesToClearOnChoice(next));
      await browser.settled();

      for (const name of ["_ga", "_ga_ZFZ6JLPFXN", "_fbp", "_fbc", "stampeo_ad"]) {
        expect(names(browser.jar()), `round ${round}`).not.toContain(name);
      }
      expect(readStoredConsent().record).toMatchObject({ analytics: false, marketing: false });
    }
  });
});

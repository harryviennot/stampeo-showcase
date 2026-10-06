/**
 * The capture as the browser runs it: carriers written to the jar and handed to
 * the privacy route, and a refusal taking only its own category's carrier away.
 *
 * Each case drives the real functions against a fake browser (a cookie jar that
 * ages, a timezone, and a `fetch` that can answer like the real route), so what
 * is asserted is what a visitor's cookie jar and the network would see.
 */

import { afterEach, describe, expect, test } from "bun:test";

import { CONSENT_COOKIE, clearCookiesFor } from "../consent";
import { SUBJECT, installFakeBrowser, type FakeBrowser } from "../privacy/__fixtures__/fake-browser";
import { restoreEnvAfterEach } from "../testing/restore-env";
import { serializeAdCarrier } from "./ad-ids";
import { capturePass, readStoredCarriers } from "./capture";
import { serializeGaCarrier } from "./ga-ids";
import { serializeSourceCarrier } from "./source";
import {
  FBP,
  GA_CID,
  LANDED,
  META_LANDING,
  namesIn,
  plan,
  visitor,
  US,
  wireOf,
} from "./__fixtures__/visitors";

describe("writing the carriers", () => {
  let browser: FakeBrowser | null = null;
  restoreEnvAfterEach("NEXT_PUBLIC_COOKIE_DOMAIN");

  afterEach(() => {
    browser?.restore();
    browser = null;
  });

  const GA_JAR = `_ga=GA1.1.${GA_CID}; _ga_ZFZ6JLPFXN=GS2.1.s1791244795$o1$g1$t1791244799$j0$l0$h0; _fbp=${FBP}`;

  const pass = (over: Partial<Parameters<typeof capturePass>[0]> = {}) =>
    capturePass({
      landing: META_LANDING,
      ...visitor(US),
      measurementId: "G-ZFZ6JLPFXN",
      now: LANDED + 5,
      ...over,
    });

  test.each([
    ["both tags configured", "G-ZFZ6JLPFXN", "1088158323750710", { ga: true, fbp: true }],
    ["no GA property configured", null, "1088158323750710", { ga: false, fbp: true }],
    ["no Meta pixel configured", "G-ZFZ6JLPFXN", null, { ga: true, fbp: false }],
    ["neither tag configured", null, null, { ga: false, fbp: false }],
  ])("a capture waits only for the tags this deployment runs: %s", (_case, measurementId, pixelId, awaited) => {
    browser = installFakeBrowser({ timezone: "America/New_York" });

    // A tag's browser id is awaited until it exists; a tag that is not
    // deployed never writes one, so waiting for it would only burn the wait.
    expect(pass({ measurementId, pixelId }).awaited).toEqual(awaited);
  });

  test("a US visitor on a Meta ad: the cookie is written, then the server is asked to set it, once", async () => {
    process.env.NEXT_PUBLIC_COOKIE_DOMAIN = ".stampeo.app";
    browser = installFakeBrowser({
      cookie: GA_JAR,
      timezone: "America/New_York",
      hostname: "stampeo.app",
      fetch: "route",
    });

    const { plan: written } = pass();
    await browser.settled();

    expect(browser.events.filter((e) => e.startsWith("cookie:"))).toEqual([
      "cookie:stampeo_src",
      "cookie:stampeo_ga",
      "cookie:stampeo_ad",
    ]);
    for (const write of browser.writes) {
      expect(write).toContain("; Domain=.stampeo.app");
      expect(write).toContain(`; Max-Age=${182 * 86_400}`);
    }

    expect(browser.fetches).toHaveLength(1);
    const [call] = browser.fetches;
    expect(call.url).toBe("/api/privacy/cookies");
    expect(call.init).toMatchObject({ method: "POST", keepalive: true });
    expect(call.body).toEqual({
      carriers: { src: wireOf(written.src), ga: wireOf(written.ga), ad: wireOf(written.ad) },
    });

    // The route re-validated them and set the same three cookies.
    expect(browser.events.filter((e) => e.startsWith("server-set:")).sort()).toEqual([
      "server-set:stampeo_ad",
      "server-set:stampeo_ga",
      "server-set:stampeo_src",
    ]);
    expect(readStoredCarriers(browser.jar())).toEqual(written);
  });

  test("the same visit again writes nothing and asks nothing", async () => {
    browser = installFakeBrowser({ cookie: GA_JAR, timezone: "America/New_York", fetch: "route" });

    pass();
    await browser.settled();
    const writes = browser.writes.length;
    const requests = browser.fetches.length;

    const again = pass({ now: LANDED + 20 });
    await browser.settled();

    expect(again.plan).toEqual({ src: null, ga: null, ad: null });
    expect(browser.writes).toHaveLength(writes);
    expect(browser.fetches).toHaveLength(requests);
  });

  test("a browser that refuses the cookie still gets the server's, and one that refuses the server keeps the cookie", async () => {
    browser = installFakeBrowser({ cookie: GA_JAR, timezone: "America/New_York", cookies: "throws", fetch: "route" });
    expect(() => pass()).not.toThrow();
    await browser.settled();
    expect(browser.fetches).toHaveLength(1);
    expect(readStoredCarriers(browser.jar()).ad).not.toBeNull();
    browser.restore();

    for (const fetch of ["reject", "throw"] as const) {
      browser = installFakeBrowser({ cookie: GA_JAR, timezone: "America/New_York", fetch });
      expect(() => pass()).not.toThrow();
      await browser.settled();
      expect(readStoredCarriers(browser.jar()).ad).not.toBeNull();
      browser.restore();
    }
    browser = null;
  });

  test("a jar that silently drops the write is not asked again on every poll", () => {
    browser = installFakeBrowser({ cookie: GA_JAR, timezone: "America/New_York", cookies: "silent" });

    const first = pass();
    const second = pass({ remembered: first.plan, now: LANDED + 1 });

    expect(first.plan.ad).not.toBeNull();
    expect(second.plan).toEqual({ src: null, ga: null, ad: null });
    expect(browser.fetches).toHaveLength(1);
  });

  test("the pass reports what it is still waiting for", () => {
    browser = installFakeBrowser({ timezone: "America/New_York" });
    // Nothing from either tag yet: the click and the source are written, then it waits.
    const early = pass();
    expect(early.plan.src).not.toBeNull();
    expect(early.plan.ad).toMatchObject({ ci: "IwAR_TEST_fbclid_0001", fbp: null });
    expect(early.plan.ga).toBeNull();
    expect(early.awaited).toEqual({ ga: true, fbp: true });
  });
});

describe("refusing a category clears only that category's carrier (AC4.6)", () => {
  let browser: FakeBrowser | null = null;
  afterEach(() => {
    browser?.restore();
    browser = null;
  });

  /** A visitor carrying every cookie the capture and the tags write. */
  function carrying() {
    const written = plan(visitor(US));
    return [
      `${CONSENT_COOKIE}=x`,
      `stampeo_sid=${SUBJECT}`,
      `stampeo_src=${serializeSourceCarrier(written.src!)}`,
      `stampeo_ga=${serializeGaCarrier(written.ga!)}`,
      `stampeo_ad=${serializeAdCarrier(written.ad!)}`,
      "_ga=GA1.1.1234567890.1700000000",
      "_ga_ZFZ6JLPFXN=GS2.1.s1791244795$o1$g1",
      "_fbp=fb.1.1.2",
      "_fbc=fb.1.1.3",
      "_ttp=t",
    ].join("; ");
  }

  test.each([
    [
      "marketing",
      ["marketing"],
      ["stampeo_ad", "_fbp", "_fbc", "_ttp"],
      ["stampeo_ga", "stampeo_src", "_ga", "_ga_ZFZ6JLPFXN"],
      ["stampeo_ad", "stampeo_attribution"],
    ],
    [
      "analytics",
      ["analytics"],
      ["stampeo_ga", "_ga", "_ga_ZFZ6JLPFXN"],
      ["stampeo_ad", "stampeo_src", "_fbp"],
      ["stampeo_ga", "stampeo_attribution"],
    ],
    [
      "both, which takes the campaign source too",
      ["analytics", "marketing"],
      ["stampeo_ga", "stampeo_ad", "stampeo_src", "_ga", "_fbp"],
      [CONSENT_COOKIE, "stampeo_sid"],
      ["stampeo_ga", "stampeo_ad", "stampeo_src", "stampeo_attribution"],
    ],
  ] as const)("refusing %s", async (_case, categories, removed, kept, asked) => {
    browser = installFakeBrowser({ cookie: carrying(), hostname: "stampeo.app", fetch: "route" });

    clearCookiesFor(categories);
    await browser.settled();

    const left = namesIn(browser.jar());
    for (const name of removed) expect(left.has(name)).toBe(false);
    for (const name of kept) expect(left.has(name)).toBe(true);

    // The server is asked as well, for the cookies it set itself, and the
    // request outlives the reload that follows a revocation.
    expect(browser.fetches).toHaveLength(1);
    expect(browser.fetches[0].init).toMatchObject({ method: "POST", keepalive: true });
    expect([...(browser.fetches[0].body.clear as string[])].sort()).toEqual([...asked].sort());
  });

  test("a server that cannot be reached still leaves the jar clean", async () => {
    browser = installFakeBrowser({ cookie: carrying(), hostname: "stampeo.app", fetch: "reject" });

    clearCookiesFor(["marketing"]);
    await browser.settled();

    expect(namesIn(browser.jar()).has("stampeo_ad")).toBe(false);
    expect(namesIn(browser.jar()).has("stampeo_ga")).toBe(true);
  });
});

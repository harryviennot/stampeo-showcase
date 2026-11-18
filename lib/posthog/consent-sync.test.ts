/**
 * PostHog follows what the visitor allows. It starts in memory (nothing stored on the device); a visitor who may be
 * remembered gets a host-only cookie that keeps the id they already had, and one who said yes also gets recordings
 * and heatmaps on the pages where a tag may run, every input masked. A choice taken back stops recording, removes
 * every `ph_*` cookie and storage key, drops the id and leaves a new one in memory.
 *
 * The tests drive `startPostHog` the way `instrumentation-client.ts` does, against a client that records what it
 * was told, a fake browser for cookies, Global Privacy Control and the timezone, and fake storages.
 */

import { afterEach, beforeEach, describe, expect, setSystemTime, test } from "bun:test";

import { CONSENT_COOKIE, CONSENT_VERSION, emitConsentChange, writeConsentRecord } from "../consent";
import { GRANTED_COOKIE, REFUSED_COOKIE, installFakeBrowser, type FakeBrowser } from "../privacy/__fixtures__/fake-browser";
import { rowFor } from "../privacy/policy";
import { fakeStorage } from "../testing/fake-storage";
import { restoreGlobalsAfterEach } from "../testing/restore-globals";
import { FIRST_ID, NEXT_ID, fakePostHog, type Call } from "./__fixtures__/fake-posthog";
import { isPostHogRemembering, rememberedPostHogId, syncPostHogForUrl } from "./consent-sync";
import { startPostHog } from "./start";

const PH_COOKIE = "ph_phc_testkey_posthog";

const names = (calls: Call[]) => calls.map(([name]) => name);
const configs = (calls: Call[]) => calls.filter(([name]) => name === "set_config").map(([, config]) => config!);
const initOptions = (calls: Call[]) => calls.find(([name]) => name === "init")![1]!;

const REMEMBER_182_DAYS = { persistence: "cookie", cross_subdomain_cookie: false, cookie_expiration: 182 };
const ALL_ON = { analytics: true, marketing: true };
const ALL_OFF = { analytics: false, marketing: false };

restoreGlobalsAfterEach("localStorage", "sessionStorage");

// The clock stands at the moment the fixture grants were made, so a grant is as old as a test says it is.
const GRANT_MOMENT = new Date(1_791_240_000 * 1000);
beforeEach(() => setSystemTime(GRANT_MOMENT));

let browser: FakeBrowser | null = null;
let stop: (() => void) | null = null;
afterEach(() => {
  setSystemTime();
  stop?.();
  stop = null;
  browser?.restore();
  browser = null;
});

interface Visit {
  cookie?: string;
  timezone?: string;
  gpc?: boolean;
  pathname?: string;
  /** What PostHog or an earlier visit left in the browser. */
  stored?: { cookies?: string; local?: Record<string, string>; session?: Record<string, string> };
}

/** A page load: the browser as the visitor left it, then PostHog started the way the site starts it. */
function visit({ cookie = "", timezone = "Europe/Paris", gpc, pathname, stored = {} }: Visit = {}) {
  const jar = [cookie, stored.cookies].filter(Boolean).join("; ");
  browser = installFakeBrowser({ cookie: jar, timezone, gpc, pathname });
  const local = fakeStorage(stored.local);
  const session = fakeStorage(stored.session);
  Object.defineProperty(globalThis, "localStorage", { value: local, configurable: true, writable: true });
  Object.defineProperty(globalThis, "sessionStorage", { value: session, configurable: true, writable: true });
  const posthog = fakePostHog();
  stop = startPostHog(posthog, "phc_testkey", "https://eu.i.posthog.com");
  return { browser, posthog, local, session };
}

const LEFTOVERS = {
  cookies: `${PH_COOKIE}=%7B%22distinct_id%22%3A%22old%22%7D`,
  local: { [PH_COOKIE]: "{}", ph_debug: "true", theme: "light" },
  session: { [PH_COOKIE]: "{}", ph_session_start: "1", cart: "1" },
};

describe("a page opened by a visitor PostHog may not remember", () => {
  test.each([
    ["a European with no choice", { cookie: "" }],
    ["a European whose only grant is from the previous consent text", { cookie: previousVersionGrant() }],
    ["a United States visitor whose browser sends Global Privacy Control", { cookie: "", timezone: "America/New_York", gpc: true }],
  ])("%s: starts in memory, with nothing recorded and nothing left of an earlier visit", (_who, options) => {
    const { browser: b, posthog, local, session } = visit({ ...options, stored: LEFTOVERS });

    expect(initOptions(posthog.calls)).toMatchObject({ persistence: "memory", capture_heatmaps: false, disable_session_recording: true });
    expect(names(posthog.calls)).not.toContain("startSessionRecording");
    expect(b.jar()).not.toContain("ph_");
    expect([...local.data.keys()].sort()).toEqual(["theme"]);
    expect([...session.data.keys()]).toEqual(["cart"]);
    expect(rememberedPostHogId()).toBeNull();
  });

  test("every event carries $geoip_disable, registered before the first page view is sent", () => {
    const { posthog } = visit();

    expect(posthog.calls.slice(0, 2)).toEqual([
      ["init", expect.objectContaining({ key: "phc_testkey" })],
      ["register", { $geoip_disable: true }],
    ]);
  });
});

describe("a page opened by a remembered visitor", () => {
  test("a European holding a grant keeps one id in a host-only cookie for 182 days, and is recorded", () => {
    const { posthog, browser: b } = visit({ cookie: GRANTED_COOKIE, stored: { cookies: LEFTOVERS.cookies } });

    expect(initOptions(posthog.calls)).toMatchObject(REMEMBER_182_DAYS);
    // The cookie holds the id they already had: PostHog reads it as it starts, so nothing is switched afterwards.
    expect(configs(posthog.calls).filter((config) => "persistence" in config)).toEqual([]);
    expect(b.jar()).toContain(PH_COOKIE);
    expect(rememberedPostHogId()).toBe(FIRST_ID);
    expect(names(posthog.calls)).toContain("startSessionRecording");
  });

  test("the cookie ends with the grant, not six months after the last visit: 12 days left for a grant made 170 days ago", () => {
    const { posthog } = visit({ cookie: grantMadeDaysAgo(170) });

    expect(initOptions(posthog.calls)).toMatchObject({ persistence: "cookie", cross_subdomain_cookie: false });
    expect(initOptions(posthog.calls).cookie_expiration).toBeCloseTo(12, 3);
  });

  test("a United States visitor with no choice is remembered from the first page and is not recorded", () => {
    const { posthog } = visit({ timezone: "America/New_York" });

    expect(initOptions(posthog.calls)).toMatchObject(REMEMBER_182_DAYS);
    expect(rememberedPostHogId()).toBe(FIRST_ID);
    expect(names(posthog.calls)).not.toContain("startSessionRecording");
    expect(configs(posthog.calls).some((config) => config.capture_heatmaps === true)).toBe(false);
  });

  test.each(["/onboarding", "/login", "/reset-password", "/email-preferences", "/demo/wallet-select/k3J9xQ2mWvT8", "/join/ABC123"])(
    "on %s they are remembered and not recorded",
    (pathname) => {
      const { posthog } = visit({ cookie: GRANTED_COOKIE, pathname });

      expect(initOptions(posthog.calls)).toMatchObject(REMEMBER_182_DAYS);
      expect(names(posthog.calls)).not.toContain("startSessionRecording");
    },
  );

  test("recordings start with every input masked, console and network capture off, and heatmaps on", () => {
    const { posthog } = visit({ cookie: GRANTED_COOKIE });
    const recording = configs(posthog.calls).find((config) => config.capture_heatmaps === true)!;

    expect(recording).toMatchObject({
      session_recording: { maskAllInputs: true, recordHeaders: false, recordBody: false },
      enable_recording_console_log: false,
      capture_performance: { network_timing: false },
    });
    // The settings are in place before the recorder starts.
    expect(posthog.calls.findIndex(([, arg]) => arg === recording)).toBeLessThan(names(posthog.calls).indexOf("startSessionRecording"));
  });
});

describe("a visitor who accepts audience measurement during a visit", () => {
  test("keeps the id they have, which is now stored, and starts recording", () => {
    const { posthog, browser: b } = visit();
    const before = posthog.calls.length;

    writeConsentRecord(ALL_ON, rowFor("FR"));
    emitConsentChange(ALL_ON);

    const after = posthog.calls.slice(before);
    expect(configs(after)[0]).toEqual(REMEMBER_182_DAYS);
    expect(names(after)).not.toContain("reset");
    expect(rememberedPostHogId()).toBe(FIRST_ID);
    expect(names(after)).toContain("startSessionRecording");
    expect(b.events).not.toContain("reload");
  });

  test("a grant made in another tab applies when this one is shown again", () => {
    const { posthog, browser: b } = visit();

    b.setJar(GRANTED_COOKIE);
    b.setVisibility("hidden");
    b.setVisibility("visible");

    expect(configs(posthog.calls)[0]).toEqual(REMEMBER_182_DAYS);
    expect(rememberedPostHogId()).toBe(FIRST_ID);
  });

  test("a grant made in another tab 170 days ago gives a cookie that ends with it", () => {
    const { posthog, browser: b } = visit();

    b.setJar(grantMadeDaysAgo(170));
    b.setVisibility("hidden");
    b.setVisibility("visible");

    const [remembering] = configs(posthog.calls).filter((config) => config.persistence === "cookie");
    expect(remembering).toMatchObject({ cross_subdomain_cookie: false });
    expect(remembering.cookie_expiration).toBeCloseTo(12, 3);
  });

  test("on a page where no tag may run they are remembered and not recorded", () => {
    const { posthog } = visit({ pathname: "/email-preferences" });

    writeConsentRecord(ALL_ON, rowFor("FR"));
    emitConsentChange(ALL_ON);

    expect(configs(posthog.calls)[0]).toEqual(REMEMBER_182_DAYS);
    expect(names(posthog.calls)).not.toContain("startSessionRecording");
  });

  test("a refusal changes nothing: nothing was stored", () => {
    const { posthog } = visit();
    const before = posthog.calls.length;

    writeConsentRecord(ALL_OFF, rowFor("FR"));
    emitConsentChange(ALL_OFF);

    expect(posthog.calls.slice(before)).toEqual([]);
  });
});

describe("recording follows the page", () => {
  test("it stops when the visitor moves to the sign-up flow, and starts again on a marketing page", () => {
    const { posthog } = visit({ cookie: GRANTED_COOKIE, pathname: "/pricing" });
    const started = () => names(posthog.calls).filter((name) => name === "startSessionRecording").length;
    expect(started()).toBe(1);

    syncPostHogForUrl("/onboarding");
    expect(names(posthog.calls).filter((name) => name === "stopSessionRecording")).toHaveLength(1);
    expect(configs(posthog.calls).at(-1)).toMatchObject({ capture_heatmaps: false });
    expect(rememberedPostHogId()).toBe(FIRST_ID);

    syncPostHogForUrl("https://stampeo.app/fr/pricing?utm_source=x#plans");
    expect(started()).toBe(2);
  });

  test("moving between two marketing pages starts nothing twice", () => {
    const { posthog } = visit({ cookie: GRANTED_COOKIE, pathname: "/pricing" });

    syncPostHogForUrl("/features/analytics");
    syncPostHogForUrl("/blog");

    expect(names(posthog.calls).filter((name) => name === "startSessionRecording")).toHaveLength(1);
    expect(names(posthog.calls)).not.toContain("stopSessionRecording");
  });
});

describe("a remembered visitor who takes the choice back", () => {
  /** Remembered, recorded, and with what PostHog keeps in the browser. */
  function rememberedVisit(options: Visit = {}) {
    return visit({ cookie: GRANTED_COOKIE, ...options, stored: LEFTOVERS });
  }

  test("recording stops, storage goes back to memory, the id is dropped and every ph_* entry is deleted", () => {
    const { posthog, browser: b, local, session } = rememberedVisit();
    const before = posthog.calls.length;

    writeConsentRecord(ALL_OFF, rowFor("FR"));
    emitConsentChange(ALL_OFF);

    const after = posthog.calls.slice(before);
    expect(names(after).filter((name) => name !== "set_config")).toEqual(["stopSessionRecording", "reset", "register"]);
    expect(configs(after)).toContainEqual({ capture_heatmaps: false });
    // Memory first, so the reset that follows has nowhere on the device to write the new id.
    const toMemory = after.findIndex(([name, arg]) => name === "set_config" && arg?.persistence === "memory");
    expect(toMemory).toBeGreaterThan(-1);
    expect(toMemory).toBeLessThan(names(after).indexOf("reset"));
    expect(after.at(-1)).toEqual(["register", { $geoip_disable: true }]);
    expect(b.jar()).not.toContain("ph_");
    expect(b.jar()).toContain(CONSENT_COOKIE);
    expect([...local.data.keys()].sort()).toEqual(["theme"]);
    expect([...session.data.keys()]).toEqual(["cart"]);
    expect(rememberedPostHogId()).toBeNull();
  });

  test("the next page starts under a new id that is never stored again without a new grant", () => {
    const { posthog } = rememberedVisit();

    writeConsentRecord(ALL_OFF, rowFor("FR"));
    emitConsentChange(ALL_OFF);
    syncPostHogForUrl("/pricing");

    expect(posthog.get_distinct_id()).toBe(NEXT_ID);
    expect(configs(posthog.calls).filter((config) => config.persistence === "cookie")).toEqual([]);
    expect(names(posthog.calls).filter((name) => name === "startSessionRecording")).toHaveLength(1);
  });

  test("a United States visitor who switches audience measurement off is treated the same", () => {
    const { posthog, browser: b } = visit({ timezone: "America/New_York", stored: LEFTOVERS });

    writeConsentRecord({ analytics: false, marketing: true }, rowFor("US"));
    emitConsentChange({ analytics: false, marketing: true });

    expect(names(posthog.calls)).toContain("reset");
    expect(b.jar()).not.toContain("ph_");
    expect(rememberedPostHogId()).toBeNull();
  });

  test("a refusal made in another tab takes effect when this one is shown again", () => {
    const { posthog, browser: b, local } = rememberedVisit();

    b.setVisibility("hidden");
    b.setJar(`${REFUSED_COOKIE}; ${LEFTOVERS.cookies}`);
    b.setVisibility("visible");

    expect(names(posthog.calls)).toContain("reset");
    expect(b.jar()).not.toContain("ph_");
    expect(local.data.has(PH_COOKIE)).toBe(false);
  });

  test("Global Privacy Control turned on mid-session takes a United States visitor back to memory", () => {
    const { posthog, browser: b } = visit({ timezone: "America/New_York", stored: LEFTOVERS });

    (globalThis.navigator as unknown as { globalPrivacyControl: boolean }).globalPrivacyControl = true;
    // A second window beside this one never fires visibilitychange: focus is what reaches it.
    (globalThis.window as unknown as EventTarget).dispatchEvent(new Event("focus"));

    expect(names(posthog.calls)).toContain("reset");
    expect(b.jar()).not.toContain("ph_");
    expect(rememberedPostHogId()).toBeNull();
  });

  test("a tab that was remembered still counts as holding PostHog storage until it reloads", () => {
    rememberedVisit();
    expect(isPostHogRemembering()).toBe(true);

    writeConsentRecord(ALL_OFF, rowFor("FR"));
    emitConsentChange(ALL_OFF);

    // The cross-tab watcher reloads on this: the page's PostHog cannot be unloaded.
    expect(isPostHogRemembering()).toBe(true);
  });
});

/** The `Cookie:` header of a European who accepted everything this many days ago. */
function grantMadeDaysAgo(days: number) {
  const value = { v: CONSENT_VERSION, a: 1, m: 1, t: Math.floor(Date.now() / 1000) - days * 86_400, r: "opt-in", g: "EEA_UK_CH" };
  return `${CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify(value))}`;
}

/** A grant stored under the previous consent text, in Europe. */
function previousVersionGrant() {
  const value = { v: CONSENT_VERSION - 1, a: 1, m: 1, t: 1_791_240_000, r: "opt-in", g: "EEA_UK_CH" };
  return `${CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify(value))}`;
}

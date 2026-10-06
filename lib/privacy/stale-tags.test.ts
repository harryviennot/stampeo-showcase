/**
 * A tag that is running cannot be unloaded, so a refusal made in another tab
 * only reaches this one when it reloads.
 *
 * Each case is a tab that has the tags loaded and is then hidden, while the
 * visitor does something elsewhere, and shown again.
 */

import { afterEach, describe, expect, test } from "bun:test";

import { writeConsentRecord } from "../consent";
import { installFakeBrowser, GRANTED_COOKIE, REFUSED_COOKIE, type FakeBrowser } from "./__fixtures__/fake-browser";
import { rowFor } from "./policy";
import { consentChangedSince, watchConsentAcrossTabs } from "./stale-tags";

let browser: FakeBrowser | null = null;
let stop: (() => void) | null = null;
afterEach(() => {
  stop?.();
  stop = null;
  browser?.restore();
  browser = null;
});

const ON = { analytics: true, marketing: true };
const OFF = { analytics: false, marketing: false };

/** A tab with the tags loaded, watching. */
function tab(cookie: string, options: { tagsLoaded?: boolean } = {}) {
  browser = installFakeBrowser({ cookie, timezone: "Europe/Paris" });
  stop = watchConsentAcrossTabs({ tagsLoaded: () => options.tagsLoaded ?? true });
  return browser;
}

const away = (b: FakeBrowser, whileAway: () => void) => {
  b.setVisibility("hidden");
  whileAway();
  b.setVisibility("visible");
};

describe("consentChangedSince", () => {
  test.each([
    ["nothing changed", ON, ON, false],
    ["marketing was refused", ON, { analytics: true, marketing: false }, true],
    ["analytics was refused", ON, { analytics: false, marketing: true }, true],
    ["something was granted", OFF, { analytics: true, marketing: false }, true],
  ])("%s", (_case, seen, now, changed) => {
    expect(consentChangedSince(seen, now)).toBe(changed);
  });
});

describe("a tab that comes back to the front", () => {
  test("reloads when a refusal was made elsewhere while it was away", () => {
    const b = tab(GRANTED_COOKIE);

    away(b, () => b.setJar(REFUSED_COOKIE));

    expect(b.events.filter((event) => event === "reload")).toHaveLength(1);
  });

  test("stays put when nothing changed", () => {
    const b = tab(GRANTED_COOKIE);

    away(b, () => {});

    expect(b.events).not.toContain("reload");
  });

  test("stays put while it is hidden, whatever changed", () => {
    const b = tab(GRANTED_COOKIE);

    b.setJar(REFUSED_COOKIE);
    b.setVisibility("hidden");

    expect(b.events).not.toContain("reload");
  });

  test("stays put when no tag was ever loaded: there is nothing to stop", () => {
    const b = tab(GRANTED_COOKIE, { tagsLoaded: false });

    away(b, () => b.setJar(REFUSED_COOKIE));

    expect(b.events).not.toContain("reload");
  });

  test("does not reload for a choice made in this tab", () => {
    const b = tab("");

    writeConsentRecord(ON, rowFor("FR"));
    away(b, () => {});

    expect(b.events).not.toContain("reload");
  });

  test("stops watching when told to", () => {
    const b = tab(GRANTED_COOKIE);
    stop?.();
    stop = null;

    away(b, () => b.setJar(REFUSED_COOKIE));

    expect(b.events).not.toContain("reload");
  });
});

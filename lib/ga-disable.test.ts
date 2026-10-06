/**
 * gtag's own off switch, `window['ga-disable-<id>']`, follows the route.
 *
 * Google's enhanced measurement can report a client-side hop onto a page we
 * never send an event for. While the visitor is on a private route the switch
 * is on, so gtag.js sends nothing at all; it is cleared when they are back on a
 * page where analytics is allowed. Console settings (GA4 setup, D7) still apply.
 */

import { afterEach, describe, expect, test } from "bun:test";

import { syncGaDisable } from "./google-analytics";
import { isTrackablePath } from "./consent-routes";
import { installFakeBrowser, type FakeBrowser } from "./privacy/__fixtures__/fake-browser";

const ID = "G-ZFZ6JLPFXN";
const KEY = `ga-disable-${ID}`;

let browser: FakeBrowser | null = null;
afterEach(() => {
  browser?.restore();
  browser = null;
});

const flag = () => (globalThis as unknown as { window: Record<string, unknown> }).window[KEY];

/** What the page does on each navigation: the route decides, and so does what the visitor allows. */
const visit = (path: string, analytics = true, measurementId: string | null = ID) =>
  syncGaDisable({ measurementId, trackable: isTrackablePath(path), analytics });

describe("the off switch follows the route", () => {
  test("a private route turns it on, on the first load as well as after a hop", () => {
    browser = installFakeBrowser();

    visit("/onboarding");
    expect(flag()).toBe(true);
  });

  test("a hop from a marketing page to sign-up and back", () => {
    browser = installFakeBrowser();

    visit("/pricing");
    expect(flag()).toBe(false);

    visit("/onboarding");
    expect(flag()).toBe(true);

    visit("/pricing");
    expect(flag()).toBe(false);
  });

  test.each(["/onboarding", "/login", "/reset-password", "/mon-cafe", "/fr/mon-cafe", "/demo/wallet-select/abc"])(
    "%s turns it on",
    (path) => {
      browser = installFakeBrowser();

      visit(path);

      expect(flag()).toBe(true);
    },
  );

  test("a page where analytics is not allowed does not turn it off", () => {
    browser = installFakeBrowser();

    visit("/onboarding");
    visit("/pricing", false);

    expect(flag()).toBe(true);
  });

  test("with no property configured there is nothing to switch", () => {
    browser = installFakeBrowser();

    visit("/onboarding", true, null);

    expect(Object.keys((globalThis as unknown as { window: object }).window).some((key) => key.startsWith("ga-disable-"))).toBe(false);
  });

  test("off the browser it does nothing", () => {
    expect(() => visit("/onboarding")).not.toThrow();
  });
});

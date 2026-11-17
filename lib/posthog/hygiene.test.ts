/**
 * PostHog stays off the pages that are not ours to measure. A business's enrollment page (`/{slug}` and
 * `/{slug}/l/{store}`, in the language the visitor picked or without one) is a customer of that business signing up
 * to its loyalty card: nothing from it is captured, and a page opened as one never starts PostHog. A page opened
 * with a sign-in token in its address starts nothing either. Every other event goes out scrubbed.
 */

import { describe, expect, test } from "bun:test";
import { posthogBeforeSend, posthogEnabledFor } from "./hygiene";

const ENROLLMENT_PAGES = [
  "https://stampeo.app/usual-cafe",
  "https://stampeo.app/usual-cafe?utm_source=qr",
  "https://stampeo.app/usual-cafe/",
  "https://stampeo.app/usual-cafe/l/rue-de-rivoli",
  "https://stampeo.app/pl/usual-cafe",
  "https://stampeo.app/en/usual-cafe/l/rue-de-rivoli?x=1",
];

const SITE_PAGES = [
  "https://stampeo.app/",
  "https://stampeo.app/us",
  "https://stampeo.app/uk",
  "https://stampeo.app/pricing",
  "https://stampeo.app/en",
  "https://stampeo.app/en/pricing",
  "https://stampeo.app/es/programa-de-fidelizacion",
  "https://stampeo.app/fr/demo",
  "https://stampeo.app/blog/how-loyalty-works",
  "https://stampeo.app/en/blog/how-loyalty-works",
  "https://stampeo.app/qr/usual-cafe",
  "https://stampeo.app/onboarding",
];

const pageview = (url: string, pathname = new URL(url).pathname) => ({
  uuid: "018f-uuid",
  event: "$pageview",
  properties: { $current_url: url, $pathname: pathname, $screen_width: 390 },
});

describe("events from an enrollment page", () => {
  test.each(ENROLLMENT_PAGES)("%s: nothing is captured", (url) => {
    expect(posthogBeforeSend(pageview(url))).toBeNull();
  });

  test("a click, a leave and a custom event on the page are dropped like the view", () => {
    for (const name of ["$autocapture", "$pageleave", "landing_cta_clicked"]) {
      expect(posthogBeforeSend({ ...pageview("https://stampeo.app/usual-cafe"), event: name })).toBeNull();
    }
  });

  test("the path alone is enough to tell", () => {
    expect(posthogBeforeSend({ uuid: "u", event: "$autocapture", properties: { $pathname: "/usual-cafe/l/rue-de-rivoli" } })).toBeNull();
  });
});

describe("events from the site", () => {
  test.each(SITE_PAGES)("%s: the event goes out", (url) => {
    const sent = posthogBeforeSend(pageview(url));

    expect(sent?.properties.$current_url).toBe(url);
    expect(sent?.properties.$screen_width).toBe(390);
  });

  test("goes out scrubbed: the ad click id is gone and its platform is named", () => {
    const sent = posthogBeforeSend(pageview("https://stampeo.app/us?gclid=abc&utm_source=google"));

    expect(sent?.properties.$current_url).toBe("https://stampeo.app/us?utm_source=google");
    expect(sent?.properties.ad_click_vendor).toBe("google");
  });

  test("a demo_started event goes out without a session token", () => {
    const started = { uuid: "u", event: "demo_started", properties: { $current_url: "https://stampeo.app/demo", session_token: "k3J9xQ2mWvT8", card_type: "stamps" } };

    expect(posthogBeforeSend(started)?.properties).toEqual({ $current_url: "https://stampeo.app/demo", card_type: "stamps" });
  });

  test("an event with no address of its own goes out", () => {
    expect(posthogBeforeSend({ uuid: "u", event: "$identify", properties: { distinct_id: "d" } })).not.toBeNull();
  });

  test("a dropped event stays dropped", () => {
    expect(posthogBeforeSend(null)).toBeNull();
  });
});

describe("whether PostHog starts on the page a visitor opened", () => {
  test.each([...ENROLLMENT_PAGES, "https://stampeo.app/en/reset-password?token_hash=secret&type=recovery"])("%s: it does not", (url) => {
    expect(posthogEnabledFor(url)).toBe(false);
  });

  test.each([...SITE_PAGES, "https://stampeo.app/fr/demo/wallet-select/abc"])("%s: it does", (url) => {
    expect(posthogEnabledFor(url)).toBe(true);
  });
});

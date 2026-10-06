/**
 * What is read from the landing page and nowhere else: the click ids and UTM
 * tags in the query, the referrer's host, and the snapshot of all of it taken
 * once per page load.
 */

import { describe, expect, test } from "bun:test";

import {
  captureLandingContext,
  landingFromUrl,
  readClickIds,
  readUtm,
  referrerHost,
  type LandingContext,
} from "./landing";

describe("readClickIds", () => {
  test("each platform's click id is read from the query", () => {
    expect(readClickIds("?gclid=g1")).toEqual({ gclid: "g1", fbclid: null, ttclid: null });
    expect(readClickIds("?fbclid=f1")).toEqual({ gclid: null, fbclid: "f1", ttclid: null });
    expect(readClickIds("?ttclid=t1")).toEqual({ gclid: null, fbclid: null, ttclid: "t1" });
  });

  test("an empty query yields no click ids", () => {
    expect(readClickIds("")).toEqual({ gclid: null, fbclid: null, ttclid: null });
  });

  test("an empty parameter value is null, not an empty string", () => {
    // `?gclid=` is what a broken ad template emits; stored, it would read as a click.
    expect(readClickIds("?gclid=").gclid).toBeNull();
  });

  test("a real-length click id is kept whole, and a hostile one is capped", () => {
    // A real fbclid runs past 100 characters; truncating one yields an
    // identifier that looks like data and attributes to nothing.
    const realistic = `IwAR${"3".repeat(150)}`;
    expect(readClickIds(`?fbclid=${realistic}`).fbclid).toBe(realistic);
    expect(readClickIds(`?fbclid=${"x".repeat(4000)}`).fbclid).toHaveLength(512);
  });
});

describe("readUtm", () => {
  test("the five utm fields are read", () => {
    expect(
      readUtm("?utm_source=google&utm_medium=cpc&utm_campaign=c&utm_content=ad1&utm_term=loyalty"),
    ).toEqual({
      utmSource: "google",
      utmMedium: "cpc",
      utmCampaign: "c",
      utmContent: "ad1",
      utmTerm: "loyalty",
    });
  });

  test("absent utm fields are null", () => {
    expect(readUtm("?utm_source=newsletter").utmMedium).toBeNull();
  });

  test("a long campaign name is shortened, never dropped", () => {
    expect(readUtm(`?utm_campaign=${"x".repeat(4000)}`).utmCampaign).toHaveLength(128);
  });
});

describe("referrerHost", () => {
  test("an external referrer yields its host", () => {
    expect(referrerHost("https://www.google.com/search?q=x", "stampeo.app")).toBe(
      "www.google.com",
    );
  });

  test("our own host is not a referrer", () => {
    // Internal navigation is not a traffic source.
    expect(referrerHost("https://stampeo.app/pricing", "stampeo.app")).toBeNull();
    expect(referrerHost("https://app.stampeo.app/", "stampeo.app")).toBeNull();
  });

  test("an empty or unparseable referrer is null", () => {
    expect(referrerHost("", "stampeo.app")).toBeNull();
    expect(referrerHost("not a url", "stampeo.app")).toBeNull();
  });
});

describe("landingFromUrl", () => {
  test("splits a landing URL into what the capture reads", () => {
    expect(
      landingFromUrl("https://stampeo.app/us?fbclid=f1&utm_source=meta", {
        referrer: "https://l.facebook.com/",
        variant: "b",
        landedAt: 1_791_244_800,
      }),
    ).toEqual({
      search: "?fbclid=f1&utm_source=meta",
      path: "/us",
      referrer: "https://l.facebook.com/",
      variant: "b",
      selfHost: "stampeo.app",
      landedAt: 1_791_244_800,
    });
  });
});

describe("captureLandingContext: the landing snapshot", () => {
  /**
   * The snapshot is module state on purpose: it models which page this
   * document lifetime began on. So these tests are a SEQUENCE, the first call
   * deciding what every later one sees, as on a real page load.
   *
   * Capture waits for the tags' cookies, and a navigation mid-wait must not
   * make it read the post-navigation query and path: a `direct` visit with the
   * wrong landing page would block the real one.
   */
  const LANDING: LandingContext = {
    search: "?gclid=abc123&utm_source=google",
    path: "/pricing",
    referrer: "https://www.google.com/",
    variant: "b",
    selfHost: "stampeo.app",
    landedAt: 1_791_244_800,
  };

  test("the first call snapshots what its reader sees", () => {
    expect(captureLandingContext(() => ({ ...LANDING }))).toEqual(LANDING);
  });

  test("a later call returns the snapshot, not the current page", () => {
    let read = 0;
    const later = captureLandingContext(() => {
      read += 1;
      return { ...LANDING, search: "", path: "/blog", referrer: "", variant: null };
    });

    expect(read).toBe(0);
    expect(later).toEqual(LANDING);
  });

  test("the snapshot is identity-stable across calls", () => {
    // Strict mode runs the capture effect twice; both must see the same object.
    expect(captureLandingContext(() => ({ ...LANDING }))).toBe(
      captureLandingContext(() => ({ ...LANDING })),
    );
  });
});

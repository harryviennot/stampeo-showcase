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
  const NONE = { gclid: null, fbclid: null, oppref: null, ttclid: null };

  test("each platform's click id is read from the query", () => {
    expect(readClickIds("?gclid=g1")).toEqual({ ...NONE, gclid: "g1" });
    expect(readClickIds("?fbclid=f1")).toEqual({ ...NONE, fbclid: "f1" });
    expect(readClickIds("?oppref=o1")).toEqual({ ...NONE, oppref: "o1" });
    expect(readClickIds("?ttclid=t1")).toEqual({ ...NONE, ttclid: "t1" });
  });

  test("an empty query yields no click ids", () => {
    expect(readClickIds("")).toEqual(NONE);
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

describe("readClickIds: the ChatGPT click id (oppref)", () => {
  // OpenAI documents no format and asks for "the original string without
  // modification", so the value is returned exactly as one decode left it.
  test.each([
    ["an opaque id", "oppref=aB3dE9fGh1JkLm0pQr"],
    ["the unreserved punctuation - _ . ~", "oppref=ab-cd_ef.gh~ij"],
    ["capitals, which are not folded", "oppref=AbCdEfGh"],
    ["surrounding spaces, which are not trimmed", "oppref=%20ab%20"],
    ["a real-length id", `oppref=op_${"A1b2".repeat(30)}`],
  ])("%s arrives byte for byte", (_case, query) => {
    const expected = new URLSearchParams(query).get("oppref");
    expect(readClickIds(`?${query}&utm_source=chatgpt`).oppref).toBe(expected!);
  });

  test("a percent-encoded value is decoded exactly once", () => {
    expect(readClickIds("?oppref=a%2Fb%3Dc").oppref).toBe("a/b=c");
    // `%25` is a literal percent sign: a second decode would turn this into `a/b`.
    expect(readClickIds("?oppref=a%252Fb").oppref).toBe("a%2Fb");
  });

  test("an empty value is no click", () => {
    expect(readClickIds("?oppref=").oppref).toBeNull();
    expect(readClickIds("?oppref=%20%20").oppref).toBeNull();
  });

  test("an id at the bound is kept whole, and one past it is dropped, never cut short", () => {
    // A truncated id still looks like data and attributes to nothing at OpenAI,
    // so unlike the other click ids it is refused outright.
    expect(readClickIds(`?oppref=${"x".repeat(512)}`).oppref).toBe("x".repeat(512));
    expect(readClickIds(`?oppref=${"x".repeat(513)}`).oppref).toBeNull();
    expect(readClickIds(`?oppref=${"x".repeat(4000)}`).oppref).toBeNull();
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

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
    ["an opaque id", "oppref=aB3dE9fGh1JkLm0pQr", "aB3dE9fGh1JkLm0pQr"],
    ["the unreserved punctuation - _ . ~", "oppref=ab-cd_ef.gh~ij", "ab-cd_ef.gh~ij"],
    ["capitals, which are not folded", "oppref=AbCdEfGh", "AbCdEfGh"],
    ["a raw plus sign, which stays a plus sign", "oppref=ab+cd", "ab+cd"],
    ["%2B, which is a plus sign", "oppref=ab%2Bcd", "ab+cd"],
    ["an equals sign inside the value", "oppref=a=b&utm_source=chatgpt", "a=b"],
    ["a percent-encoded value, decoded once", "oppref=a%2Fb%3Dc", "a/b=c"],
    // `%25` is a literal percent sign: a second decode would turn this into `a/b`.
    ["an encoded percent sign, which a second decode would eat", "oppref=a%252Fb", "a%2Fb"],
    ["a real-length id", `oppref=op_${"A1b2".repeat(30)}`, `op_${"A1b2".repeat(30)}`],
    // A truncated id still looks like data and attributes to nothing at OpenAI,
    // so unlike the other click ids one past the bound is refused outright.
    ["an id at the bound, kept whole", `oppref=${"x".repeat(512)}`, "x".repeat(512)],
    ["an id one past the bound, dropped and never cut short", `oppref=${"x".repeat(513)}`, null],
    ["a hostile id, dropped", `oppref=${"x".repeat(4000)}`, null],
    ["a bound that counts the decoded id, kept", `oppref=${"%2B".repeat(200)}`, "+".repeat(200)],
    ["a bound that counts the decoded id, dropped", `oppref=${"%2B".repeat(513)}`, null],
    ["a malformed escape, which is no click and never throws", "oppref=%E0%A4%A", null],
    ["an empty value", "oppref=", null],
    ["a value of spaces only", "oppref=%20%20", null],
  ])("%s", (_case, query, expected) => {
    expect(readClickIds(`?${query}&utm_source=chatgpt`).oppref).toBe(expected);
  });

  test("a plus sign is a plus sign in oppref alone: the other click ids decode it as a space, which drops them", () => {
    // A form-style decode turns a raw `+` into a space.
    expect(readClickIds("?gclid=a+b&fbclid=c+d&oppref=e+f&ttclid=g+h")).toEqual({
      gclid: null,
      fbclid: null,
      oppref: "e+f",
      ttclid: null,
    });
    expect(readClickIds("?gclid=a%2Bb&fbclid=c%2Bd&ttclid=g%2Bh")).toMatchObject({
      gclid: "a+b",
      fbclid: "c+d",
      ttclid: "g+h",
    });
  });

  test("a malformed oppref loses only itself", () => {
    expect(readClickIds("?oppref=%E0%A4%A&gclid=g1")).toEqual({
      gclid: "g1",
      fbclid: null,
      oppref: null,
      ttclid: null,
    });
  });

  test("an oppref with no value is skipped, not the end of the search: a later one still counts", () => {
    expect(readClickIds("?oppref&oppref=X").oppref).toBe("X");
    expect(readClickIds("?oppref&utm_source=chatgpt").oppref).toBeNull();
  });

  test("with two valued opprefs the first wins, as it does for the other click ids", () => {
    expect(readClickIds("?oppref=A&oppref=B").oppref).toBe("A");
    expect(readClickIds("?gclid=A&gclid=B").gclid).toBe("A");
  });
});

describe("readClickIds: a click id is printable ASCII or no click", () => {
  // The platforms' ids are opaque tokens. One with a control character, a
  // space or a byte outside ASCII is hostile or damaged, so it is dropped and
  // never cleaned into something that only looks like an id.
  describe.each(["gclid", "fbclid", "oppref", "ttclid"] as const)("%s", (name) => {
    test.each([
      ["a NUL", "%00"],
      ["a tab", "%09"],
      ["a space", "%20"],
      ["a DEL", "%7F"],
      ["a letter outside ASCII", "%C3%A9"],
    ])("%s makes the id no click", (_case, escape) => {
      expect(readClickIds(`?${name}=ab${escape}cd`)[name]).toBeNull();
    });

    test("the punctuation + / = . ~ is kept", () => {
      expect(readClickIds(`?${name}=a%2Bb/c=d.e~f`)[name]).toBe("a+b/c=d.e~f");
    });
  });

  test("a bad id costs only its own platform", () => {
    expect(readClickIds("?gclid=g%001&fbclid=f1")).toMatchObject({ gclid: null, fbclid: "f1" });
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

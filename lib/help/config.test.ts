/**
 * The help center is English-only, served at locale-free URLs and held out of
 * search while it is built. These pin the one switch every noindex reads, and
 * what the running config does with it.
 */

import { describe, expect, test } from "bun:test";
import { getRedirectUrl, unstable_getResponseFromNextConfig } from "next/experimental/testing/server";
import nextConfig from "../../next.config";
import { HELP_INDEXABLE, HELP_LOCALES, helpRobots, isHelpPath } from "./config";

const ORIGIN = "https://stampeo.app";

describe("the indexing switch", () => {
  test("holds the help center out of search while it is built", () => {
    expect(HELP_INDEXABLE).toBe(false);
    expect(helpRobots()).toEqual({ index: false, follow: true });
  });

  test("the robots directive is derived from the switch, never written twice", () => {
    expect(helpRobots().index).toBe(HELP_INDEXABLE);
  });

  test("English is the only help language", () => {
    expect([...HELP_LOCALES]).toEqual(["en"]);
  });
});

describe("isHelpPath", () => {
  test.each(["/help", "/help/", "/help/add-a-team-member", "/help/a/b"])("%s is a help URL", (path) => {
    expect(isHelpPath(path)).toBe(true);
  });

  test.each(["/", "/pricing", "/en/help", "/helpful-cafe", "/help-me-coffee", "/helpers/l/centre", "/es/helping-hands"])(
    "%s is not (a shop slug can start with help, and a locale-prefixed copy is not the real URL)",
    (path) => {
      expect(isHelpPath(path)).toBe(false);
    },
  );
});

describe("the X-Robots-Tag header, as next.config serves it", () => {
  /** The response headers Next adds for this URL under the real config. */
  async function headersFor(path: string) {
    const response = await unstable_getResponseFromNextConfig({
      url: `${ORIGIN}${path}`,
      nextConfig: { headers: nextConfig.headers },
    });
    return response.headers;
  }

  test.each(["/help", "/help/", "/help/add-a-team-member", "/help/a/b"])("%s is marked noindex", async (path) => {
    expect((await headersFor(path)).get("x-robots-tag")).toBe("noindex");
  });

  test.each(["/", "/pricing", "/en/pricing", "/blog/carte-fidelite-cafe", "/helpful-cafe", "/us"])(
    "%s is not marked",
    async (path) => {
      expect((await headersFor(path)).get("x-robots-tag")).toBeNull();
    },
  );

  test("a help URL keeps the site-wide discovery Link header", async () => {
    expect((await headersFor("/help")).get("link")).toContain('rel="sitemap"');
  });

  test("the config never redirects a help URL by itself", async () => {
    const response = await unstable_getResponseFromNextConfig({
      url: `${ORIGIN}/help/x`,
      nextConfig: { redirects: nextConfig.redirects },
    });
    expect(getRedirectUrl(response)).toBeNull();
  });
});

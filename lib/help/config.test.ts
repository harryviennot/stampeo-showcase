/**
 * The help center is English-only, served at locale-free URLs and held out of
 * search while it is built. These pin the one switch every noindex reads, and
 * what the running config does with it.
 */

import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { unstable_getResponseFromNextConfig } from "next/experimental/testing/server";
import nextConfig from "../../next.config";
import { HELP_LOOKALIKE_SLUGS, HELP_PATHS } from "./__fixtures__/paths";
import { HELP_INDEXABLE, helpHeaders, helpRobots, isHelpPath } from "./config";

const ORIGIN = "https://stampeo.app";
const NOINDEX_HEADER_RULES = [{ source: "/help/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex" }] }];

describe("the indexing switch", () => {
  test("holds the help center out of search while it is built", () => {
    // The one deliberate pin on the value: the launch change flips it and updates this.
    expect(HELP_INDEXABLE).toBe(false);
  });

  test.each([true, false])("with the switch at %p, the robots directive and the header follow it", (indexable) => {
    expect(helpRobots(indexable)).toEqual({ index: indexable, follow: true });
    expect(helpHeaders(indexable)).toEqual(indexable ? [] : NOINDEX_HEADER_RULES);
  });

  test("with no argument, both read the switch itself", () => {
    expect(helpRobots()).toEqual(helpRobots(HELP_INDEXABLE));
    expect(helpHeaders()).toEqual(helpHeaders(HELP_INDEXABLE));
  });
});

describe("isHelpPath", () => {
  test.each([...HELP_PATHS, "/help/"])("%s is a help URL", (path) => {
    expect(isHelpPath(path)).toBe(true);
  });

  test.each(["/", "/pricing", "/en/help", ...HELP_LOOKALIKE_SLUGS.map((slug) => `/${slug}`)])(
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

  test("the config's help rules are exactly the ones the switch names", async () => {
    const rules = (await nextConfig.headers?.()) ?? [];

    expect(rules.filter((rule) => rule.source.startsWith("/help"))).toEqual(helpHeaders());
    // Called with no argument, so lifting the switch lifts the header with it.
    expect(readFileSync(join(import.meta.dir, "..", "..", "next.config.ts"), "utf-8")).toContain("...helpHeaders()");
  });

  test.each([...HELP_PATHS, "/help/"])("%s is marked noindex while the switch says so", async (path) => {
    expect((await headersFor(path)).get("x-robots-tag")).toBe(HELP_INDEXABLE ? null : "noindex");
  });

  test.each(["/", "/pricing", "/en/pricing", "/blog/carte-fidelite-cafe", "/us", ...HELP_LOOKALIKE_SLUGS.map((slug) => `/${slug}`)])(
    "%s is not marked",
    async (path) => {
      expect((await headersFor(path)).get("x-robots-tag")).toBeNull();
    },
  );

  test("a help URL keeps the site-wide discovery Link header", async () => {
    expect((await headersFor("/help")).get("link")).toContain('rel="sitemap"');
  });
});

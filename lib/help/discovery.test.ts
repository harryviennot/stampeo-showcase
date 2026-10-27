/**
 * While the help center is built in the open (HELP_INDEXABLE is false), nothing
 * that tells crawlers where to look may name it, and nothing may hide it from
 * them either: a robots.txt disallow would stop them reading the noindex.
 */

import { describe, expect, test } from "bun:test";
import { GET as robotsTxt } from "../../app/robots.txt/route";
import { buildLlmsTxt } from "../llms-txt";
import { DISALLOW_PATHS } from "../robots";
import { buildSitemap } from "../seo/sitemap";
import { HELP_PATHS } from "./__fixtures__/paths";

/** `/help`, `/help/x` and the locale-prefixed forms; not `/helpful-cafe`. */
const HELP_URL = /\/help(?![\w-])/;

// IndexNow submits the sitemap's URLs and nothing else, so the sitemap check covers its list too.
describe("pages that tell crawlers where to look", () => {
  const sitemapUrls = buildSitemap().map((entry) => entry.url);

  test("the sitemap lists no help page, and no alternate points at one", () => {
    expect(sitemapUrls.length).toBeGreaterThan(50);
    for (const entry of buildSitemap()) {
      expect(entry.url).not.toMatch(HELP_URL);
      for (const alternate of Object.values(entry.alternates?.languages ?? {})) {
        expect(alternate).not.toMatch(HELP_URL);
      }
    }
  });

  test("llms.txt names no help page", () => {
    expect(buildLlmsTxt()).not.toMatch(HELP_URL);
  });
});

describe("robots.txt", () => {
  /** robots.txt prefix-matches the path and query string; `$` anchors the end. */
  const disallows = (url: string) =>
    DISALLOW_PATHS.some((rule) => (rule.endsWith("$") ? url === rule.slice(0, -1) : url.startsWith(rule)));

  test.each([...HELP_PATHS, "/help/", "/help?utm_source=app"])(
    "does not disallow %s, so a crawler can read its noindex",
    (url) => {
      expect(disallows(url)).toBe(false);
    },
  );

  test("the served file mentions no help path at all", async () => {
    expect(await robotsTxt().text()).not.toMatch(HELP_URL);
  });
});

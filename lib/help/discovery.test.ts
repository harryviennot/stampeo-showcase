/**
 * While the help center is built in the open, nothing that tells crawlers
 * where to look may name it, and nothing may hide it from them either: a
 * robots.txt disallow would stop them reading the noindex.
 */

import { describe, expect, test } from "bun:test";
import { GET as robotsTxt } from "../../app/robots.txt/route";
import { buildIndexNowPayload, extractSitemapUrls } from "../../scripts/indexnow";
import { buildLlmsTxt } from "../llms-txt";
import { DISALLOW_PATHS } from "../robots";
import { buildSitemap } from "../seo/sitemap";

/** `/help`, `/help/x` and the locale-prefixed forms; not `/helpful-cafe`. */
const HELP_URL = /\/help(?![\w-])/;

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

  test("the IndexNow submission, built from the sitemap, names no help page", () => {
    const xml = `<urlset>${sitemapUrls.map((url) => `<loc>${url}</loc>`).join("")}</urlset>`;
    const { urlList } = buildIndexNowPayload(extractSitemapUrls(xml), "a54facc9a2c4dbf7f5170fa9e04b6dbc");

    expect(urlList.length).toBeGreaterThan(50);
    expect(urlList.filter((url) => HELP_URL.test(url))).toEqual([]);
  });
});

describe("robots.txt", () => {
  /** robots.txt prefix-matches the path and query string; `$` anchors the end. */
  const disallows = (url: string) =>
    DISALLOW_PATHS.some((rule) => (rule.endsWith("$") ? url === rule.slice(0, -1) : url.startsWith(rule)));

  test.each(["/help", "/help/", "/help/add-a-team-member", "/help?utm_source=app"])(
    "does not disallow %s, so a crawler can read its noindex",
    (url) => {
      expect(disallows(url)).toBe(false);
    },
  );

  test("the served file mentions no help path at all", async () => {
    expect(await robotsTxt().text()).not.toMatch(HELP_URL);
  });
});

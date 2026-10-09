/**
 * The per-locale RSS feeds, called the way Next calls the route handlers.
 *
 * A locale with no blog serves 404, not an empty feed: an empty channel tells
 * readers and crawlers the blog exists and has nothing in it.
 */

import { describe, expect, test } from "bun:test";
import { routing } from "../../i18n/routing";
import { localePath } from "../hreflang";
import { getAllSlugs } from "./index";
import { hasBlog } from "./locales";

const routeFor = (locale: string) => import(`../../app/feed-${locale}.xml/route`);

describe.each([...routing.locales])("/feed-%s.xml", (locale) => {
  if (hasBlog(locale)) {
    test("serves RSS linking every post at its own URL", async () => {
      const { GET } = await routeFor(locale);
      const response: Response = await GET();
      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Type")).toContain("xml");

      const body = await response.text();
      expect(body).toContain(`<language>${locale}</language>`);
      expect(body).toContain(`https://stampeo.app/feed-${locale}.xml`);
      for (const slug of getAllSlugs(locale)) {
        expect(body).toContain(`<link>https://stampeo.app${localePath(locale, `/blog/${slug}`)}</link>`);
      }
    });
  } else {
    test("is a 404 while the locale has no blog", async () => {
      const { GET } = await routeFor(locale);
      const response: Response = await GET();
      expect(response.status).toBe(404);
    });
  }
});

describe("/feed.xml", () => {
  test("moves permanently to the French feed", async () => {
    const { GET } = await import("../../app/feed.xml/route");
    const response: Response = await GET();
    expect(response.status).toBe(308);
    expect(response.headers.get("Location")).toBe("/feed-fr.xml");
  });
});

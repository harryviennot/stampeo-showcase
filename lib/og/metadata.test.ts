/**
 * The OpenGraph block a page sets for itself.
 *
 * A page-level `openGraph` replaces the layout's entirely, so a page that sets
 * only `{ locale }` shares a link with no title, no description and no image.
 */

import { describe, expect, test } from "bun:test";
import { imageQuery, ogImagePath, pageOpenGraph } from "./metadata";

describe("ogImagePath", () => {
  test.each([
    ["fr", "/opengraph-image"],
    ["en", "/en/opengraph-image"],
    ["es", "/es/opengraph-image"],
    ["pl", "/pl/opengraph-image"],
  ])("%s: %s (French unprefixed, so no redirect)", (locale, path) => {
    expect(ogImagePath(locale)).toBe(path);
  });

  test("keeps the cache-busting hash Next appends", () => {
    expect(ogImagePath("fr", "?1681fcc4bb23df46")).toBe("/opengraph-image?1681fcc4bb23df46");
  });
});

describe("imageQuery", () => {
  test("reads the hash off the image Next attached to the layout", () => {
    const resolved = [{ url: "https://stampeo.app/fr/opengraph-image?1681fcc4bb23df46", width: 1200 }];
    expect(imageQuery(resolved)).toBe("?1681fcc4bb23df46");
  });

  test.each([
    ["no images", undefined],
    ["an empty list", []],
    ["an image without a hash", [{ url: "https://stampeo.app/en/opengraph-image" }]],
    ["some other image", [{ url: "https://stampeo.app/og.png?v=2" }]],
  ])("%s: no query", (_name, images) => {
    expect(imageQuery(images)).toBe("");
  });
});

describe("pageOpenGraph", () => {
  test("a full block: title, description, site, type, locale, url and the image", () => {
    const og = pageOpenGraph(
      { title: "Pricing", description: "Plans", url: "/us/pricing", locale: "en", ogLocale: "en_US" },
      "?abc",
    );
    expect(og).toEqual({
      title: "Pricing",
      description: "Plans",
      siteName: "Stampeo",
      type: "website",
      locale: "en_US",
      url: "/us/pricing",
      images: [
        { url: "/en/opengraph-image?abc", width: 1200, height: 630, alt: "Stampeo", type: "image/png" },
      ],
    });
  });

  test.each([
    ["fr", "fr_FR"],
    ["en", "en_US"],
    ["es", "es_ES"],
    ["pl", "pl_PL"],
  ])("%s pages default to the %s OpenGraph locale", (locale, ogLocale) => {
    const og = pageOpenGraph({ title: "t", description: "d", url: "/", locale });
    expect(og.locale).toBe(ogLocale);
  });
});

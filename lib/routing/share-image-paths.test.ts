/** Share images Next generates under the default locale's prefix, e.g. `/fr/opengraph-image`. */

import { describe, expect, test } from "bun:test";
import { getRedirectUrl } from "next/experimental/testing/server";
import { NextRequest } from "next/server";
import proxy from "../../proxy";
import { isDefaultLocaleShareImage } from "./share-image-paths";

describe("default-locale share image paths", () => {
  test.each([
    ["/fr/opengraph-image", true],
    ["/fr/twitter-image", true],
    ["/fr/blog/carte-fidelite-cafe/opengraph-image", true],
    ["/fr/features/scanner-mobile/opengraph-image/0", true],
    ["/en/opengraph-image", false],
    ["/opengraph-image", false],
    ["/fr/pricing", false],
    ["/fr/blog/opengraph-image-guide", false],
    ["/francais/opengraph-image", false],
  ])("%s → %p", (pathname, expected) => {
    expect(isDefaultLocaleShareImage(pathname, "fr")).toBe(expected);
  });

  // Next writes these URLs into og:image on French pages; a redirect would cost
  // every crawler and link unfurler an extra hop for the image.
  test("the proxy serves a French share image without redirecting it", async () => {
    const request = new NextRequest("https://stampeo.app/fr/opengraph-image?1681fcc4bb23df46", {
      headers: { "accept-language": "en-US,en;q=0.9" },
    });

    expect(getRedirectUrl(await proxy(request))).toBeNull();
  });

  test("a French page under /fr still redirects to its unprefixed URL", async () => {
    const request = new NextRequest("https://stampeo.app/fr/pricing");

    expect(getRedirectUrl(await proxy(request))).toBe("https://stampeo.app/pricing");
  });
});

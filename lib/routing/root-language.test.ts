/**
 * Only `/` follows the visitor's language. Every deeper URL is served in the
 * language its path names, so a French article linked from anywhere opens in
 * French instead of bouncing an English browser to a `/en/...` URL that has
 * no such article.
 */

import { describe, expect, test } from "bun:test";
import {
  getRedirectUrl,
  getRewrittenUrl,
} from "next/experimental/testing/server";
import { NextRequest } from "next/server";
import proxy from "../../proxy";
import { negotiatedResponseHeaders, negotiatesLanguage } from "./root-language";

const ORIGIN = "https://stampeo.app";

function visit(path: string, acceptLanguage: string, cookie?: string) {
  const headers: Record<string, string> = { "accept-language": acceptLanguage };
  if (cookie) headers.cookie = cookie;
  return proxy(new NextRequest(new URL(path, ORIGIN), { headers }));
}

describe("which URLs negotiate a language", () => {
  test.each([
    ["/", true],
    ["/blog/carte-fidelite-wallet", false],
    ["/pricing", false],
    ["/en", false],
    ["/en/pricing", false],
  ])("%s -> %p", (path, expected) => {
    expect(negotiatesLanguage(path)).toBe(expected);
  });

  test("a redirect out of / varies by language signal and is never cached", () => {
    expect(negotiatedResponseHeaders(307)).toEqual({
      Vary: "Accept-Language, Cookie",
      "Cache-Control": "no-store",
    });
  });

  test("the French root page varies by language signal", () => {
    expect(negotiatedResponseHeaders(200)).toEqual({ Vary: "Accept-Language, Cookie" });
  });
});

describe("a French article opened from a foreign browser", () => {
  test.each(["en-US,en;q=0.9", "es-ES,es;q=0.9", "pl-PL,pl;q=0.9"])(
    "is served in French with no redirect and no locale cookie: %s",
    async (acceptLanguage) => {
      const response = await visit("/blog/carte-fidelite-wallet", acceptLanguage);

      expect(getRedirectUrl(response)).toBeNull();
      expect(getRewrittenUrl(response)).toBe(`${ORIGIN}/fr/blog/carte-fidelite-wallet`);
      expect(response.headers.get("set-cookie") ?? "").not.toContain("NEXT_LOCALE");
    }
  );
});

describe("an English page visit", () => {
  test("does not write the locale cookie", async () => {
    const response = await visit("/en/pricing", "fr-FR,fr;q=0.9");

    expect(getRedirectUrl(response)).toBeNull();
    expect(response.headers.get("set-cookie") ?? "").not.toContain("NEXT_LOCALE");
  });
});

describe("the homepage", () => {
  test.each([
    ["en-US,en;q=0.9", `${ORIGIN}/en`],
    ["pl-PL,pl;q=0.9", `${ORIGIN}/pl`],
  ])("sends a %s browser to its language, uncached", async (acceptLanguage, target) => {
    const response = await visit("/", acceptLanguage);

    expect(getRedirectUrl(response)).toBe(target);
    expect(response.headers.get("vary")).toBe("Accept-Language, Cookie");
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  test("serves a French browser in place, varying by language signal", async () => {
    const response = await visit("/", "fr-FR,fr;q=0.9");

    expect(getRedirectUrl(response)).toBeNull();
    expect(getRewrittenUrl(response)).toBe(`${ORIGIN}/fr`);
    expect(response.headers.get("vary")).toBe("Accept-Language, Cookie");
  });

  test("follows the language the visitor picked over the browser's", async () => {
    const response = await visit("/", "en-US,en;q=0.9", "NEXT_LOCALE=es");

    expect(getRedirectUrl(response)).toBe(`${ORIGIN}/es`);
  });
});

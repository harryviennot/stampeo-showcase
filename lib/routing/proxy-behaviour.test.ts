/**
 * What the proxy does with the requests the marketing site and a merchant's
 * printed QR code receive: the host redirect, the country pilots, Markdown for
 * agents, the merchant slug, and a visitor who already chose a language.
 */

import { describe, expect, test } from "bun:test";
import { getRedirectUrl, getRewrittenUrl } from "next/experimental/testing/server";
import { NextRequest } from "next/server";
import proxy from "../../proxy";
import { restoreEnvAfterEach } from "../testing/restore-env";
import { restoreGlobalsAfterEach } from "../testing/restore-globals";

const ORIGIN = "https://stampeo.app";

function visit(path: string, headers: Record<string, string> = {}) {
  return proxy(new NextRequest(new URL(path, ORIGIN), { headers }));
}

describe("the www host", () => {
  test.each(["/", "/pricing", "/blog/carte-fidelite-cafe?utm_source=newsletter"])(
    "%s moves permanently to the same page on the apex domain",
    async (path) => {
      const response = await visit(path, { host: "www.stampeo.app" });

      expect(response.status).toBe(301);
      expect(getRedirectUrl(response)).toBe(`${ORIGIN}${path}`);
    },
  );
});

describe("the country pilots", () => {
  test.each([
    ["/us", "us"],
    ["/us/pricing", "us"],
    ["/uk", "uk"],
  ])("%s keeps its clean URL, serves the English page and remembers the market", async (path, market) => {
    const response = await visit(path, { host: "stampeo.app", "accept-language": "fr-FR,fr;q=0.9" });

    expect(getRedirectUrl(response)).toBeNull();
    expect(getRewrittenUrl(response)).toBe(`${ORIGIN}/en${path}`);
    // Readable by the dashboard on app.stampeo.app, which prefills the country field.
    const cookie = response.headers.get("set-cookie") ?? "";
    expect(cookie).toContain(`stampeo_market=${market}`);
    expect(cookie).toContain("Domain=.stampeo.app");
  });

  test("the international pages set no market cookie", async () => {
    const response = await visit("/en/pricing");

    expect(response.headers.get("set-cookie") ?? "").not.toContain("stampeo_market");
  });
});

describe("Markdown for agents", () => {
  test("a page asked for as text/markdown is served by the Markdown route", async () => {
    const response = await visit("/pricing", { accept: "text/markdown" });

    expect(getRewrittenUrl(response)).toBe(`${ORIGIN}/api/markdown`);
  });

  test.each([
    ["a browser", "/pricing", { accept: "text/html,application/xhtml+xml" }],
    ["the Markdown route's own fetch of the page", "/pricing", { accept: "text/markdown", "x-internal-markdown": "1" }],
    ["a private page", "/login", { accept: "text/markdown" }],
  ])("%s gets the HTML page", async (_who, path, headers) => {
    const response = await visit(path, headers);

    expect(getRewrittenUrl(response)).not.toBe(`${ORIGIN}/api/markdown`);
  });
});

describe("a returning visitor who chose English", () => {
  // Only `/` follows the language cookie; a deep URL is served in the language its path names.
  test.each(["/pricing", "/blog/carte-fidelite-cafe"])("%s opens in French, with no redirect", async (path) => {
    const response = await visit(path, { cookie: "NEXT_LOCALE=en", "accept-language": "en-US,en;q=0.9" });

    expect(getRedirectUrl(response)).toBeNull();
    expect(getRewrittenUrl(response)).toBe(`${ORIGIN}/fr${path}`);
  });
});

describe("a merchant's QR code", () => {
  restoreEnvAfterEach("NEXT_PUBLIC_API_URL");
  restoreGlobalsAfterEach("fetch");

  /** A proxy whose shop lookup talks to a stubbed API, and the requests that lookup made. */
  async function proxyWithShopApi(answer: () => Response) {
    const requests: string[] = [];
    process.env.NEXT_PUBLIC_API_URL = "https://api.stampeo.test";
    globalThis.fetch = (async (input: string | URL | Request) => {
      requests.push(String(input));
      return answer();
    }) as typeof fetch;
    const fresh = (await import(`../../proxy.ts?shop-api=${crypto.randomUUID()}`)) as { default: typeof proxy };
    return { proxy: fresh.default, requests };
  }

  const scan = (headers: Record<string, string>) =>
    new NextRequest(new URL("/golden-hours", ORIGIN), { headers });

  test("opens in English on an English phone, without asking the API", async () => {
    const shop = await proxyWithShopApi(() => new Response("{}", { status: 500 }));

    const response = await shop.proxy(scan({ "accept-language": "en-US,en;q=0.9" }));

    expect(getRewrittenUrl(response)).toBe(`${ORIGIN}/en/golden-hours`);
    expect(shop.requests).toEqual([]);
  });

  test("a language picked earlier beats the phone's", async () => {
    const shop = await proxyWithShopApi(() => new Response("{}", { status: 500 }));

    const response = await shop.proxy(scan({ cookie: "NEXT_LOCALE=pl", "accept-language": "en-US,en;q=0.9" }));

    expect(getRewrittenUrl(response)).toBe(`${ORIGIN}/pl/golden-hours`);
  });

  test("a phone in a language we do not serve gets the shop's own language", async () => {
    const shop = await proxyWithShopApi(() => Response.json({ primary_locale: "pl" }));

    const response = await shop.proxy(scan({ "accept-language": "de-DE,de;q=0.9" }));

    expect(getRewrittenUrl(response)).toBe(`${ORIGIN}/pl/golden-hours`);
    expect(shop.requests).toEqual(["https://api.stampeo.test/businesses/slug/golden-hours"]);
  });

  test("with the API down, that phone gets the site default instead of an error", async () => {
    const shop = await proxyWithShopApi(() => {
      throw new Error("connect ECONNREFUSED");
    });

    const response = await shop.proxy(scan({ "accept-language": "de-DE,de;q=0.9" }));

    expect(getRewrittenUrl(response)).toBe(`${ORIGIN}/fr/golden-hours`);
  });
});

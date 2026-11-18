/**
 * The reset link's token must never reach analytics or error tracking. These
 * tests feed the scrubber the URLs and event shapes PostHog and Sentry really
 * send, and pin that only credential parameters go: the rest of the URL, and
 * the event itself, arrive untouched.
 */

import { describe, expect, test } from "bun:test";
import {
  carriesSessionToken,
  scrubCredentialParams,
  scrubSentryEvent,
} from "./credential-params";

describe("scrubCredentialParams", () => {
  test.each([
    // Query: the reset link as PostHog sees it, absolute and relative.
    [
      "https://stampeo.app/reset-password?token_hash=abc123&type=recovery",
      "https://stampeo.app/reset-password?type=recovery",
    ],
    ["https://stampeo.app/reset-password?token_hash=abc123", "https://stampeo.app/reset-password"],
    ["/en/reset-password?token_hash=abc123&type=recovery", "/en/reset-password?type=recovery"],
    [
      "/en/reset-password?utm_source=newsletter&token_hash=abc123&ref=ig",
      "/en/reset-password?utm_source=newsletter&ref=ig",
    ],
    ["/auth/callback?code=pkce-code&next=%2Fapp", "/auth/callback?next=%2Fapp"],
    ["/x?token=t1&access_token=a1&refresh_token=r1&keep=1", "/x?keep=1"],
    ["/x?code=1&code=2&keep=3", "/x?keep=3"],
    ["/x?token_hash&keep=1", "/x?keep=1"],
    ["/x?Token_Hash=abc&keep=1", "/x?keep=1"],
    ["/x?token%5Fhash=abc&keep=1", "/x?keep=1"],
    // Fragment: the implicit-flow redirect puts the session after the hash.
    [
      "https://stampeo.app/auth/callback#access_token=a&refresh_token=r&type=recovery&expires_in=3600",
      "https://stampeo.app/auth/callback#type=recovery&expires_in=3600",
    ],
    ["https://stampeo.app/auth/callback#access_token=a&refresh_token=r", "https://stampeo.app/auth/callback"],
    ["/cb?code=1&utm_source=x#access_token=a", "/cb?utm_source=x"],
    ["/app#/auth?token=t1&view=reset", "/app#/auth?view=reset"],
    // The sign-in page opened with the email filled in.
    ["/fr/login?email=ines%40example.com&redirect=%2Fapp", "/fr/login?redirect=%2Fapp"],
  ])("removes the credentials from %s", (input, expected) => {
    expect(scrubCredentialParams(input)).toBe(expected);
  });

  test.each([
    "https://stampeo.app",
    "https://stampeo.app/en/pricing",
    "/fr/login?redirect=%2Fapp",
    "/blog/post?utm_source=newsletter&utm_medium=email&ref=ig",
    "/blog/post#section-2",
    "/x?codec=1&tokens=2&barcode=3&my_code=4&access_token_ttl=5",
    "/x?a=1&",
    "/x?",
    // Not URLs at all.
    "",
    "Reset your password",
    "What is a token?",
    "token_hash=abc123",
    "C#",
    "item #3 code=9",
    "Failed to load /en/pricing?ref=ig (status 500)",
  ])("leaves %p exactly as it was", (input) => {
    expect(scrubCredentialParams(input)).toBe(input);
  });

  // Error messages, span descriptions and breadcrumb messages carry URLs inside text.
  test.each([
    [
      "GET https://stampeo.app/reset-password?token_hash=abc123&type=recovery 200",
      "GET https://stampeo.app/reset-password?type=recovery 200",
    ],
    [
      "Navigation to /en/reset-password?token_hash=abc123 failed\n    at page.tsx:93",
      "Navigation to /en/reset-password failed\n    at page.tsx:93",
    ],
    ["from /login  to /x?code=1&keep=2", "from /login  to /x?keep=2"],
  ])("removes the credentials from every URL inside %p", (input, expected) => {
    expect(scrubCredentialParams(input)).toBe(expected);
  });
});

describe("carriesSessionToken", () => {
  test.each([
    ["https://stampeo.app/en/reset-password?token_hash=abc123&type=recovery", true],
    ["https://stampeo.app/auth/callback#access_token=a&refresh_token=r", true],
    ["https://stampeo.app/en/reset-password", false],
    ["https://stampeo.app/en/pricing?utm_source=ig&ref=x", false],
    // A campaign or promo link keeps its analytics.
    ["https://stampeo.app/en/pricing?code=SPRING&token=abc", false],
    ["https://stampeo.app/en/login?email=ines%40example.com", false],
  ])("%s: %p", (url, expected) => {
    expect(carriesSessionToken(url)).toBe(expected);
  });
});

describe("scrubSentryEvent", () => {
  const TOKEN_URL = "https://stampeo.app/en/reset-password?token_hash=secret&type=recovery";
  const CLEAN_URL = "https://stampeo.app/en/reset-password?type=recovery";

  const errorEvent = () => ({
    event_id: "e1",
    message: "Failed to update password",
    level: "error",
    request: {
      url: TOKEN_URL,
      query_string: "token_hash=secret&type=recovery",
      headers: { Referer: "https://stampeo.app/auth/callback?code=pkce", "User-Agent": "Mozilla/5.0 (iPhone)" },
    },
    breadcrumbs: [
      { category: "navigation", data: { from: "/login", to: "/en/reset-password?token_hash=secret&type=recovery" } },
      { category: "fetch", data: { url: "https://x.supabase.co/auth/v1/user?code=pkce", method: "PUT" } },
      { category: "ui.click", message: "button#submit" },
    ],
    tags: { locale: "en" },
  });

  test("removes credentials from the request, the breadcrumbs and the headers", () => {
    const sent = scrubSentryEvent(errorEvent());

    expect(sent.request.url).toBe(CLEAN_URL);
    expect(sent.request.query_string).toBe("type=recovery");
    expect(sent.request.headers.Referer).toBe("https://stampeo.app/auth/callback");
    expect(sent.breadcrumbs[0].data).toEqual({ from: "/login", to: "/en/reset-password?type=recovery" });
    expect(sent.breadcrumbs[1].data).toEqual({ url: "https://x.supabase.co/auth/v1/user", method: "PUT" });
    expect(JSON.stringify(sent)).not.toContain("secret");
    expect(JSON.stringify(sent)).not.toContain("pkce");
  });

  test("keeps everything that is not a credential", () => {
    const sent = scrubSentryEvent(errorEvent());

    expect(sent.event_id).toBe("e1");
    expect(sent.message).toBe("Failed to update password");
    expect(sent.level).toBe("error");
    expect(sent.request.headers["User-Agent"]).toBe("Mozilla/5.0 (iPhone)");
    expect(sent.breadcrumbs[2]).toEqual({ category: "ui.click", message: "button#submit" });
    expect(sent.tags).toEqual({ locale: "en" });
  });

  test.each([
    ["an object", { token_hash: "secret", type: "recovery" }, { type: "recovery" }],
    ["a list of pairs", [["token_hash", "secret"], ["type", "recovery"]], [["type", "recovery"]]],
    ["text with a leading question mark", "?code=pkce&next=%2Fapp", "?next=%2Fapp"],
  ])("removes credentials from a query string given as %s", (_label, query_string, expected) => {
    const sent = scrubSentryEvent({ request: { url: "https://stampeo.app/x", query_string } });
    expect(sent.request.query_string).toEqual(expected);
  });

  test("scrubs a transaction's name and its trace data", () => {
    const transaction = {
      type: "transaction",
      transaction: "/en/reset-password?token_hash=secret",
      contexts: { trace: { op: "pageload", data: { "url.full": TOKEN_URL, "sentry.op": "pageload" } } },
      spans: [{ description: "GET /en/reset-password?code=pkce", data: { "http.url": TOKEN_URL } }],
      start_timestamp: 1,
    };
    const sent = scrubSentryEvent(transaction);

    expect(sent.type).toBe("transaction");
    expect(sent.transaction).toBe("/en/reset-password");
    expect(sent.contexts.trace.data["url.full"]).toBe(CLEAN_URL);
    expect(sent.contexts.trace.data["sentry.op"]).toBe("pageload");
    expect(sent.spans[0].data["http.url"]).toBe(CLEAN_URL);
    expect(sent.spans[0].description).toBe("GET /en/reset-password");
    expect(sent.start_timestamp).toBe(1);
  });

  test("never drops an event: one with nothing to scrub comes back as it was", () => {
    const clean = { event_id: "e2", message: "boom", request: { url: "https://stampeo.app/en/pricing?ref=ig" } };
    expect(scrubSentryEvent(clean)).toEqual(clean);
    expect(scrubSentryEvent({ event_id: "e3" })).toEqual({ event_id: "e3" });
  });
});

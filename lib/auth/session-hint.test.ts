/**
 * Marketing pages decide between "Log in" and "Dashboard" from the Supabase
 * auth cookie alone, without downloading supabase-js. These pin that reading
 * to the cookies supabase-js actually writes.
 */

import { describe, expect, test } from "bun:test";
import { createClient } from "@supabase/supabase-js";
import { hasSupabaseSession, isPkceCallback, supabaseProjectRef } from "./session-hint";

const REF = "ysdpjxzldqwlmhlwzdaq";
const SESSION = "base64-eyJhY2Nlc3NfdG9rZW4iOiJleUoifQ";
const VERIFIER = `sb-${REF}-auth-token-code-verifier=base64-InZlcmlmaWVyIg`;

describe("hasSupabaseSession", () => {
  test.each([
    ["a signed-in visitor", `NEXT_LOCALE=en; sb-${REF}-auth-token=${SESSION}`, true],
    [
      "a session large enough to be split into chunks",
      `sb-${REF}-auth-token.0=${SESSION}; sb-${REF}-auth-token.1=dGFpbA`,
      true,
    ],
    ["an OAuth sign-in that never came back, leaving only the PKCE verifier", VERIFIER, false],
    ["a session for another Supabase project", `sb-otherproject-auth-token=${SESSION}`, false],
    ["a first-time visitor with no cookies", "", false],
    ["the cookie name inside another cookie's value", `next=sb-${REF}-auth-token=${SESSION}`, false],
    ["a cookie cleared to an empty value", `sb-${REF}-auth-token=`, false],
  ])("%s -> %p", (_case, cookies, expected) => {
    expect(hasSupabaseSession(cookies, REF)).toBe(expected);
  });

  test("an unknown project ref never reads as signed in", () => {
    expect(hasSupabaseSession(`sb--auth-token=${SESSION}`, "")).toBe(false);
  });
});

describe("supabaseProjectRef", () => {
  test.each([
    `https://${REF}.supabase.co`,
    "http://127.0.0.1:54321",
  ])("names the same cookie supabase-js stores the session under (%s)", (url) => {
    const client = createClient(url, "anon-key", {
      auth: { persistSession: false, autoRefreshToken: false },
    }) as unknown as { storageKey: string };
    expect(`sb-${supabaseProjectRef(url)}-auth-token`).toBe(client.storageKey);
  });

  test.each([undefined, "", "not a url"])("is null without a usable URL (%p)", (url) => {
    expect(supabaseProjectRef(url)).toBeNull();
  });
});

describe("isPkceCallback", () => {
  test.each([
    ["an OAuth redirect back to this browser", "?code=abc123", VERIFIER, true],
    ["a code but no verifier, so another browser started the flow", "?code=abc123", "", false],
    ["a verifier but no code in the URL", "?utm_source=mail", VERIFIER, false],
    ["an empty code", "?code=", VERIFIER, false],
  ])("%s -> %p", (_case, search, cookies, expected) => {
    expect(isPkceCallback(search, cookies, REF)).toBe(expected);
  });
});

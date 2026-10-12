/**
 * The sign-up step's "Forgot password?" opens the sign-in page with the email
 * already typed, not the reset page: that one needs a token from an email.
 */

import { describe, expect, test } from "bun:test";
import { loginHrefWithEmail } from "./login-link";

describe("loginHrefWithEmail", () => {
  test.each([
    ["ines@example.com", "/login?email=ines%40example.com"],
    ["  ines@example.com ", "/login?email=ines%40example.com"],
    ["ines+shop@example.com", "/login?email=ines%2Bshop%40example.com"],
  ])("%p opens the sign-in page with the email filled", (email, href) => {
    const result = loginHrefWithEmail(email);
    expect(result).toBe(href);
    // What the sign-in page reads back from `?email=`.
    expect(new URL(result, "https://stampeo.app").searchParams.get("email")).toBe(email.trim());
  });

  test("an empty email opens the plain sign-in page", () => {
    expect(loginHrefWithEmail("")).toBe("/login");
    expect(loginHrefWithEmail("   ")).toBe("/login");
  });
});

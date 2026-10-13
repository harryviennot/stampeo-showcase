/**
 * What the reset page shows is decided by whether the link verified, never by
 * the address bar: the page strips the token from the URL as soon as it has
 * read it, so a reload (iOS Safari does this when you switch back from Mail)
 * lands on a URL with no token and must not show a form that can never save.
 */

import { describe, expect, test } from "bun:test";
import {
  addressWithoutRecoveryParams,
  resetPageView,
  type VerifyFailureReason,
  type VerifyState,
} from "./reset-page-state";

const pending: VerifyState = { status: "pending" };
const verified = (email?: string): VerifyState => ({ status: "verified", email });
const failed = (reason: VerifyFailureReason): VerifyState => ({ status: "failed", reason });

describe("resetPageView", () => {
  test.each([pending, verified("ines@example.com")])(
    "a visit with no token has no recovery session, whatever the verify state says (%#)",
    (verify) => {
      expect(resetPageView({ hasToken: false, verify, saved: false })).toEqual({ view: "no-session", reason: "linkExpired" });
    }
  );

  test("a token being checked shows the spinner", () => {
    expect(resetPageView({ hasToken: true, verify: pending, saved: false })).toEqual({ view: "verifying" });
  });

  test("a verified link shows the form with the account's email", () => {
    expect(resetPageView({ hasToken: true, verify: verified("ines@example.com"), saved: false })).toEqual({
      view: "form",
      email: "ines@example.com",
    });
  });

  test("a verified link with no email shows the form with no email, not a placeholder", () => {
    const view = resetPageView({ hasToken: true, verify: verified(undefined), saved: false });
    expect(view.view).toBe("form");
    expect("email" in view).toBe(false);
  });

  test.each<VerifyFailureReason>(["linkExpired", "network", "rateLimited"])(
    "a link that failed with %s shows no form, only the reason",
    (reason) => {
      expect(resetPageView({ hasToken: true, verify: failed(reason), saved: false })).toEqual({ view: "no-session", reason });
    }
  );

  test.each([verified("ines@example.com"), verified(undefined)])(
    "a saved password shows the success state (%#)",
    (verify) => {
      expect(resetPageView({ hasToken: true, verify, saved: true })).toEqual({ view: "success" });
    }
  );
});

describe("addressWithoutRecoveryParams", () => {
  test.each([
    ["https://stampeo.app/reset-password?token_hash=abc123&type=recovery", "/reset-password"],
    ["https://stampeo.app/en/reset-password?token_hash=abc123&type=recovery", "/en/reset-password"],
    ["https://stampeo.app/pl/reset-password?type=recovery&token_hash=abc123&utm_source=mail", "/pl/reset-password?utm_source=mail"],
    ["https://stampeo.app/reset-password?token_hash=abc123&type=recovery#top", "/reset-password#top"],
    ["https://stampeo.app/reset-password", "/reset-password"],
  ])("%s becomes %s", (href, expected) => {
    expect(addressWithoutRecoveryParams(href)).toBe(expected);
  });
});

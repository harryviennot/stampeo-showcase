/**
 * An existing account gets a code instead of an error, and the wizard only
 * remembers the code screen when a code really went out. Which of the two
 * codes was sent decides how it is verified and how a resend is made.
 */

import { describe, expect, test } from "bun:test";
import { resendCode, sendCodeToExistingUser, type CodeSenders } from "./send-code";

const FAILED = { error: new Error("rate limited") };
const SENT = { error: null };

/** Senders that answer as told and record which one was called. */
function senders(answers: { signInWithOtp?: typeof SENT; resendOtp?: typeof SENT }) {
  const calls: string[] = [];
  const auth: CodeSenders = {
    signInWithOtp: async (email) => {
      calls.push(`signInWithOtp:${email}`);
      return answers.signInWithOtp ?? SENT;
    },
    resendOtp: async (email) => {
      calls.push(`resendOtp:${email}`);
      return answers.resendOtp ?? SENT;
    },
  };
  return { auth, calls };
}

describe("a visitor whose email already has an account", () => {
  test("gets a sign-in code", async () => {
    const { auth, calls } = senders({});

    expect(await sendCodeToExistingUser(auth, "ines@example.com")).toBe("signin");
    expect(calls).toEqual(["signInWithOtp:ines@example.com"]);
  });

  test("whose account was never confirmed gets the sign-up confirmation code instead", async () => {
    const { auth, calls } = senders({ signInWithOtp: FAILED });

    expect(await sendCodeToExistingUser(auth, "ines@example.com")).toBe("signup");
    expect(calls).toEqual(["signInWithOtp:ines@example.com", "resendOtp:ines@example.com"]);
  });

  test("hears of no code when neither one could be sent", async () => {
    const { auth } = senders({ signInWithOtp: FAILED, resendOtp: FAILED });

    expect(await sendCodeToExistingUser(auth, "ines@example.com")).toBeNull();
  });
});

describe("resending the code from the code screen", () => {
  test.each([
    ["signin", "signInWithOtp:ines@example.com"],
    ["signup", "resendOtp:ines@example.com"],
  ] as const)("a %s code is resent the way it was first sent", async (mode, expectedCall) => {
    const { auth, calls } = senders({});

    expect(await resendCode(auth, "ines@example.com", mode)).toBe(true);
    expect(calls).toEqual([expectedCall]);
  });

  test("reports a resend that failed", async () => {
    const { auth } = senders({ signInWithOtp: FAILED, resendOtp: FAILED });

    expect(await resendCode(auth, "ines@example.com", "signin")).toBe(false);
    expect(await resendCode(auth, "ines@example.com", "signup")).toBe(false);
  });
});

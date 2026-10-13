/**
 * One password rule for sign-up and for choosing a new password: eight
 * characters, whatever they are. The visible requirement says the same number.
 */

import { describe, expect, test } from "bun:test";
import { catalogLocales, loadCatalog } from "../testing/catalogs";
import { MIN_PASSWORD_LENGTH, isPasswordAcceptable } from "./password-rules";

describe("isPasswordAcceptable", () => {
  test.each([
    ["eight lowercase letters", "abcdefgh"],
    ["eight of the same character", "aaaaaaaa"],
    ["digits only", "12345678"],
    ["a long passphrase with spaces", "correct horse battery staple"],
    ["accented letters", "éééééééé"],
  ])("%s is accepted", (_label, password) => {
    expect(isPasswordAcceptable(password)).toBe(true);
  });

  test.each([
    ["nothing", ""],
    ["seven characters", "abcdefg"],
    ["seven characters of every kind", "Aa1!Aa1"],
  ])("%s is refused", (_label, password) => {
    expect(isPasswordAcceptable(password)).toBe(false);
  });

  test("the minimum is eight", () => {
    expect(MIN_PASSWORD_LENGTH).toBe(8);
  });
});

describe("the visible requirement", () => {
  test.each([
    ["onboarding.json", (c: Record<string, any>) => c.onboarding.createAccount.passwordRequirement],
    ["auth.json", (c: Record<string, any>) => c.auth.resetPassword.passwordRequirement],
  ])("%s states the minimum in every language", (file, pick) => {
    for (const locale of catalogLocales()) {
      const line = pick(loadCatalog(locale, file));
      expect(typeof line).toBe("string");
      expect(line).toContain(String(MIN_PASSWORD_LENGTH));
    }
  });
});

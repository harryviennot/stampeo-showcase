import { describe, expect, test } from "bun:test";
import { shouldReloadThroughStart, startAddress } from "./in-app-entry";

describe("shouldReloadThroughStart", () => {
  test.each([
    ["the landing page, then the sign-up button", "/us", true],
    ["the French home page, then the sign-up button", "/", true],
    ["the pricing page, then the header button", "/en/pricing", true],
  ])("an in-app visitor who loaded %s reloads sign-up through /start", (_label, documentPath, expected) => {
    expect(shouldReloadThroughStart({ inApp: true, documentPath })).toBe(expected);
  });

  test.each([
    ["already came through /start", "/en/start"],
    ["already came through /start (French, unprefixed)", "/start"],
    ["loaded sign-up directly (a reload, a resumed code screen)", "/en/onboarding"],
    ["loaded sign-up directly (French, unprefixed)", "/onboarding"],
  ])("an in-app visitor who %s stays put", (_label, documentPath) => {
    expect(shouldReloadThroughStart({ inApp: true, documentPath })).toBe(false);
  });

  test("a visitor in a real browser never reloads", () => {
    expect(shouldReloadThroughStart({ inApp: false, documentPath: "/us" })).toBe(false);
  });

  test("an unknown page load never reloads", () => {
    expect(shouldReloadThroughStart({ inApp: true, documentPath: null })).toBe(false);
  });
});

describe("startAddress", () => {
  test("the reload goes through the forwarding page with the ad click", () => {
    const params = new URLSearchParams({ utm_source: "ig", fbclid: "QA456test" });
    expect(startAddress("en", params)).toBe("/en/start?utm_source=ig&fbclid=QA456test");
  });

  test("a visitor with no recorded click still goes through the forwarding page", () => {
    expect(startAddress("fr", new URLSearchParams())).toBe("/fr/start");
  });
});

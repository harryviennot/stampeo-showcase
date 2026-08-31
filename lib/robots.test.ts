import { describe, expect, it } from "bun:test";
import { routing } from "@/i18n/routing";
import { DISALLOW_PATHS, PRIVATE_PATHS, rulesFor } from "./robots";

/**
 * robots.txt prefix-matches a rule against the URL's path AND query string,
 * with `$` anchoring the end. This mirrors that so the assertions below talk
 * about real URLs rather than about the strings we happen to emit.
 */
function isDisallowed(url: string): boolean {
  return DISALLOW_PATHS.some((rule) =>
    rule.endsWith("$") ? url === rule.slice(0, -1) : url.startsWith(rule)
  );
}

describe("robots disallow rules", () => {
  it("hides the private funnel under every non-default locale prefix", () => {
    for (const locale of routing.locales) {
      const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
      for (const path of PRIVATE_PATHS) {
        expect(isDisallowed(`${prefix}${path}`)).toBe(true);
        expect(isDisallowed(`${prefix}${path}/`)).toBe(true);
      }
    }
  });

  // The list used to hardcode `/en`, so /es and /pl were left crawlable.
  it("covers es and pl, not just en", () => {
    expect(isDisallowed("/es/onboarding")).toBe(true);
    expect(isDisallowed("/pl/onboarding")).toBe(true);
    expect(isDisallowed("/pl/login")).toBe(true);
  });

  // `Disallow: /login/` matched neither of these.
  it("covers the bare path and the query-string form of /login", () => {
    expect(isDisallowed("/login")).toBe(true);
    expect(isDisallowed("/login?redirect=%2Fdashboard")).toBe(true);
    expect(isDisallowed("/pl/login?redirect=%2Fdashboard")).toBe(true);
  });

  // Business enrollment pages live at `/{slug}`, so a bare `Disallow: /auth`
  // would deindex a merchant whose slug merely starts with those letters.
  it("does not hide public pages that share a prefix with a private one", () => {
    expect(isDisallowed("/authentic-cafe")).toBe(false);
    expect(isDisallowed("/apiary-coffee")).toBe(false);
    expect(isDisallowed("/pl/logins-guide")).toBe(false);
    expect(isDisallowed("/pl/pricing")).toBe(false);
  });

  it("emits the subpath, exact and query rule for each path", () => {
    expect(rulesFor("/login")).toEqual(["/login/", "/login$", "/login?"]);
  });

  it("still blocks opengraph images", () => {
    expect(DISALLOW_PATHS).toContain("/*opengraph-image*");
  });
});

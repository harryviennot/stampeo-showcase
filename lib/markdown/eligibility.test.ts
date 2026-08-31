import { describe, expect, it } from "bun:test";
import { routing } from "@/i18n/routing";
import { isMarkdownEligible } from "./eligibility";

const PRIVATE = ["/api", "/auth", "/onboarding", "/login"];

describe("isMarkdownEligible", () => {
  it("serves markdown for public pages in every locale", () => {
    expect(isMarkdownEligible("/pricing")).toBe(true);
    expect(isMarkdownEligible("/pl/pricing")).toBe(true);
    expect(isMarkdownEligible("/pl/program-lojalnosciowy")).toBe(true);
    expect(isMarkdownEligible("/pl/privacy")).toBe(true);
  });

  // The list used to hardcode the `/en` prefix, so Spanish and Polish visitors
  // could proxy the private funnel as markdown. It is now derived from
  // `routing.locales`, which keeps it correct for any locale we add later.
  it("excludes the private funnel under every non-default locale prefix", () => {
    for (const locale of routing.locales) {
      const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
      for (const path of PRIVATE) {
        expect(isMarkdownEligible(`${prefix}${path}`)).toBe(false);
        expect(isMarkdownEligible(`${prefix}${path}/callback`)).toBe(false);
      }
    }
  });

  it("covers es and pl specifically", () => {
    expect(isMarkdownEligible("/es/onboarding")).toBe(false);
    expect(isMarkdownEligible("/pl/onboarding")).toBe(false);
    expect(isMarkdownEligible("/pl/login")).toBe(false);
  });

  it("does not exclude public paths that merely share a prefix", () => {
    expect(isMarkdownEligible("/pl/logins-guide")).toBe(true);
    expect(isMarkdownEligible("/authentic-cafe")).toBe(true);
  });

  it("rejects traversal, relative paths and file extensions", () => {
    expect(isMarkdownEligible("pricing")).toBe(false);
    expect(isMarkdownEligible("/../secret")).toBe(false);
    expect(isMarkdownEligible("/favicon.ico")).toBe(false);
  });
});

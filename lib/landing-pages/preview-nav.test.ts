import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { routing } from "@/i18n/routing";
import { FEATURE_ITEMS } from "@/lib/features";
import { getLocalizedSlug } from "@/lib/feature-slugs";
import { ALL_LANDING_SLUGS, LANDING_SLUGS, PREVIEW_SLUGS } from "./pages";
import { FEATURE_PREVIEWS, featureLink, featureLinksFor } from "./preview-nav";

const ROOT = join(import.meta.dir, "..", "..");
const source = (path: string) => readFileSync(join(ROOT, path), "utf8");

describe("which feature pages a page's header and footer lead to", () => {
  test.each(["platform", ...PREVIEW_SLUGS] as const)("%s leads to the previews", (slug) => {
    expect(featureLinksFor(slug)).toBe("previews");
  });

  test.each(LANDING_SLUGS.filter((slug) => slug !== "platform"))("%s leads to today's feature pages", (slug) => {
    expect(featureLinksFor(slug)).toBe("live");
  });

  test("every preview has a feature in the menu, and no two features share one", () => {
    expect(Object.values(FEATURE_PREVIEWS).sort()).toEqual([...PREVIEW_SLUGS].sort());
    for (const preview of Object.values(FEATURE_PREVIEWS)) {
      expect(ALL_LANDING_SLUGS).toContain(preview);
    }
  });
});

describe("where each feature link goes", () => {
  test.each(Object.entries(FEATURE_PREVIEWS))("from Platform, %s opens its preview under /us", (feature, preview) => {
    const link = featureLink(feature as (typeof FEATURE_ITEMS)[number]["canonicalSlug"], "en", "previews");

    expect(link).toEqual({ href: `/us/landing-pages/${preview}`, market: "us" });
  });

  test("from Platform, geolocation opens its coming-soon preview too: every feature has one", () => {
    expect(featureLink("geolocalisation", "en", "previews")).toEqual({
      href: "/us/landing-pages/platform/geolocation",
      market: "us",
    });
    expect(FEATURE_ITEMS.map(({ canonicalSlug }) => canonicalSlug).filter((slug) => !FEATURE_PREVIEWS[slug])).toEqual([]);
  });

  test.each(routing.locales)("everywhere else, every feature opens today's page in %s", (locale) => {
    for (const { canonicalSlug } of FEATURE_ITEMS) {
      expect(featureLink(canonicalSlug, locale, "live")).toEqual({
        href: `/features/${getLocalizedSlug(canonicalSlug, locale)}`,
        market: "int",
      });
    }
  });
});

describe("the header and footer use it", () => {
  test("the landing shell hands its page's choice to the header and the footer", () => {
    const shell = source("components/landing-pages/shared/LandingPageShell.tsx");

    expect(shell).toContain("const featureLinks = featureLinksFor(slug);");
    expect(shell).toMatch(/<Header market="us" featureLinks=\{featureLinks\}/);
    expect(shell).toMatch(/<Footer market="us" featureLinks=\{featureLinks\} \/>/);
  });

  // The closed header draws no Product menu, so its default cannot be read from a render.
  test.each(["components/sections/Header.tsx", "components/sections/Footer.tsx"])("%s defaults to today's feature pages", (path) => {
    expect(source(path)).toMatch(/featureLinks = "live"/);
  });

  test("no other page passes mobileMenu: the rest of the site keeps today's phone menu", () => {
    const callers = [
      ...new Bun.Glob("{app,components}/**/*.tsx").scanSync({ cwd: ROOT }),
    ].filter((path) => /<Header\b[^>]*mobileMenu=/.test(source(path)));

    expect(callers).toEqual(["components/landing-pages/shared/LandingPageShell.tsx"]);
  });

  test("no other page passes featureLinks: the rest of the site keeps today's feature pages", () => {
    const callers = [
      ...new Bun.Glob("{app,components}/**/*.tsx").scanSync({ cwd: ROOT }),
    ].filter((path) => /<(Header|Footer)\b[^>]*featureLinks=/.test(source(path)));

    expect(callers).toEqual(["components/landing-pages/shared/LandingPageShell.tsx"]);
  });
});

import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { routing } from "@/i18n/routing";
import { FEATURE_ITEMS } from "@/lib/features";
import { getLocalizedSlug } from "@/lib/feature-slugs";
import { ALL_LANDING_SLUGS, LANDING_SLUGS, PREVIEW_SLUGS } from "./pages";
import { LOYALTY_SLUGS } from "@/lib/loyalty-routes";
import { FEATURE_PREVIEWS, featureLink, featureLinksFor, loyaltyLink } from "./preview-nav";

const ROOT = join(import.meta.dir, "..", "..");
const source = (path: string) => readFileSync(join(ROOT, path), "utf8");

describe("which feature pages a page's header and footer lead to", () => {
  test.each(["platform", ...PREVIEW_SLUGS] as const)("%s leads to the previews", (slug) => {
    expect(featureLinksFor(slug)).toBe("previews");
  });

  test.each(LANDING_SLUGS.filter((slug) => slug !== "platform"))("%s leads to today's feature pages", (slug) => {
    expect(featureLinksFor(slug)).toBe("live");
  });

  test("every preview but loyalty programs has a feature in the menu, and no two features share one", () => {
    const featurePreviews = PREVIEW_SLUGS.filter((slug) => slug !== "platform/loyalty-programs");

    expect(Object.values(FEATURE_PREVIEWS).sort()).toEqual([...featurePreviews].sort());
    for (const preview of Object.values(FEATURE_PREVIEWS)) {
      expect(ALL_LANDING_SLUGS).toContain(preview);
    }
  });
});

describe("where each feature link goes", () => {
  test.each(Object.entries(FEATURE_PREVIEWS))("from Platform, %s opens its preview under /us", (feature, preview) => {
    const link = featureLink(feature as (typeof FEATURE_ITEMS)[number]["canonicalSlug"], "en", "previews", "us");

    expect(link).toEqual({ href: `/us/landing-pages/${preview}`, market: "us" });
  });

  test("from Platform, geolocation opens its coming-soon preview too: every feature has one", () => {
    expect(featureLink("geolocalisation", "en", "previews", "us")).toEqual({
      href: "/us/landing-pages/platform/geolocation",
      market: "us",
    });
    expect(FEATURE_ITEMS.map(({ canonicalSlug }) => canonicalSlug).filter((slug) => !FEATURE_PREVIEWS[slug])).toEqual([]);
  });

  test.each(Object.entries(FEATURE_PREVIEWS))("from the international Platform, %s opens its preview in the visitor's language: the path is left for next-intl to prefix", (feature, preview) => {
    for (const locale of routing.locales) {
      const link = featureLink(feature as (typeof FEATURE_ITEMS)[number]["canonicalSlug"], locale, "previews", "int");

      expect(link).toEqual({ href: `/landing-pages/${preview}`, market: "int" });
    }
  });

  test.each(routing.locales)("everywhere else, every feature opens today's page in %s", (locale) => {
    for (const { canonicalSlug } of FEATURE_ITEMS) {
      expect(featureLink(canonicalSlug, locale, "live", "us")).toEqual({
        href: `/features/${getLocalizedSlug(canonicalSlug, locale)}`,
        market: "int",
      });
    }
  });
});

describe("where the Loyalty link goes", () => {
  test("from Platform and its previews, it opens the loyalty programs preview under /us", () => {
    expect(loyaltyLink("en", "previews", "us")).toEqual({ href: "/us/landing-pages/platform/loyalty-programs", market: "us" });
  });

  test.each(routing.locales)("from the international Platform and its previews, it opens the same preview in %s", (locale) => {
    expect(loyaltyLink(locale, "previews", "int")).toEqual({ href: "/landing-pages/platform/loyalty-programs", market: "int" });
  });

  test.each(routing.locales)("everywhere else, it opens today's loyalty programs page in %s", (locale) => {
    expect(loyaltyLink(locale, "live", "us")).toEqual({
      href: LOYALTY_SLUGS[locale as keyof typeof LOYALTY_SLUGS],
      market: "int",
    });
  });
});

describe("the header and footer use it", () => {
  test("the landing shell hands its page's choice to the header and the footer", () => {
    const shell = source("components/landing-pages/shared/LandingPageShell.tsx");

    expect(shell).toContain("const featureLinks = featureLinksFor(slug);");
    expect(shell).toMatch(/<Header market=\{market\} featureLinks=\{featureLinks\}/);
    expect(shell).toMatch(/<Footer market=\{market\} featureLinks=\{featureLinks\} \/>/);
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

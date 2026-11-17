import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { routing } from "@/i18n/routing";
import { FEATURE_ITEMS } from "@/lib/features";
import { FEATURE_SLUGS, getLocalizedSlug } from "@/lib/feature-slugs";
import { LOYALTY_SLUGS } from "@/lib/loyalty-routes";
import { PREVIEW_SLUGS } from "./pages";
import { FEATURE_PREVIEWS, featureLink, isComingSoon, loyaltyLink, previewLink } from "./preview-nav";

describe("every feature has its page, and the menu lists them all", () => {
  test("the six features and the loyalty programs page are the seven pages of the registry, one each", () => {
    expect(Object.keys(FEATURE_PREVIEWS).sort()).toEqual([...FEATURE_SLUGS].sort());
    expect([...Object.values(FEATURE_PREVIEWS), "platform/loyalty-programs"].sort()).toEqual([...PREVIEW_SLUGS].sort());
    expect(FEATURE_ITEMS.map(({ canonicalSlug }) => canonicalSlug).sort()).toEqual([...FEATURE_SLUGS].sort());
  });

  test("geolocation is the one feature the menus mark as coming soon", () => {
    expect(FEATURE_SLUGS.filter(isComingSoon)).toEqual(["geolocalisation"]);
  });
});

describe("where the links of the header, the footer and the phone menu go", () => {
  test.each(routing.locales)("every feature opens its own page in %s: the localised slug, left for next-intl to prefix", (locale) => {
    for (const slug of FEATURE_SLUGS) {
      expect(featureLink(slug, locale)).toEqual({ href: `/features/${getLocalizedSlug(slug, locale)}`, market: "int" });
    }
  });

  test.each(routing.locales)("the Loyalty link opens the loyalty programs page in %s", (locale) => {
    expect(loyaltyLink(locale)).toEqual({ href: LOYALTY_SLUGS[locale as keyof typeof LOYALTY_SLUGS], market: "int" });
  });

  test("a locale the site does not serve gets the default language's loyalty page", () => {
    expect(loyaltyLink("de")).toEqual({ href: LOYALTY_SLUGS.fr, market: "int" });
  });

  test.each(routing.locales)("a sibling card of a page leads to the same page as the menu does, in %s", (locale) => {
    for (const slug of FEATURE_SLUGS) expect(previewLink(FEATURE_PREVIEWS[slug], locale)).toEqual(featureLink(slug, locale));
    expect(previewLink("platform/loyalty-programs", locale)).toEqual(loyaltyLink(locale));
  });

  test("no link leads to a /landing-pages URL", () => {
    const hrefs = routing.locales.flatMap((locale) => [
      loyaltyLink(locale).href,
      ...FEATURE_SLUGS.map((slug) => featureLink(slug, locale).href),
      ...PREVIEW_SLUGS.map((slug) => previewLink(slug, locale).href),
    ]);

    expect(hrefs.filter((href) => href.includes("landing-pages"))).toEqual([]);
  });
});

describe("the header", () => {
  const ROOT = join(import.meta.dir, "..", "..");
  const source = (path: string) => readFileSync(join(ROOT, path), "utf8");
  const sources = [...new Bun.Glob("{app,components}/**/*.tsx").scanSync({ cwd: ROOT })];

  test("only the Platform-style pages' shell draws the full-screen phone menu: the legacy pages keep the panel menu", () => {
    const callers = sources.filter((path) => /<Header\b[^>]*mobileMenu=/.test(source(path)));

    expect(callers).toEqual(["components/landing-pages/shared/LandingPageShell.tsx"]);
  });

  test("no header or footer is told where its feature links go: they all lead to the live pages", () => {
    expect(sources.filter((path) => /<(Header|Footer)\b[^>]*featureLinks=/.test(source(path)))).toEqual([]);
    expect(source("components/sections/Header.tsx")).not.toContain("featureLinks");
    expect(source("components/sections/Footer.tsx")).not.toContain("featureLinks");
  });
});

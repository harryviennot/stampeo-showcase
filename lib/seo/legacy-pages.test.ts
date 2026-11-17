/**
 * The legacy pages under `/legacy` can be reached by URL and from nowhere else.
 * Not in the sitemap, `llms.txt`, the markdown proxy, any hreflang cluster or any menu; never linked from a live
 * page; noindex; and `legacy` is a site segment, never a business slug.
 */

import { describe, expect, test } from "bun:test";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { routing } from "@/i18n/routing";
import { FEATURE_SLUGS, getLocalizedSlug } from "../feature-slugs";
import { LEGACY_SEGMENT, isLegacyPath, legacyPath } from "./legacy-pages";
import { buildLlmsTxt } from "../llms-txt";
import { acquisitionSlug, isReservedTopSegment } from "../locale-negotiation";
import { LOYALTY_SLUGS } from "../loyalty-routes";
import { isMarkdownEligible } from "../markdown/eligibility";
import { MARKETS, isPilotPath, marketFromPath } from "../markets";
import { productMenuItems, pageMenuItems } from "../nav/menu-items";
import { buildSeoLinks } from "../seo-links";
import { pagesUnder } from "../testing/app-folders";
import { mockEnglishServerTranslations } from "../testing/server-intl";
import { buildSitemap } from "./sitemap";

// The legacy routes ask next-intl for their words and their locale.
await mockEnglishServerTranslations();

const ROOT = join(import.meta.dir, "..", "..");
const APP = join(ROOT, "app", "[locale]");

/** Every legacy URL: the homepage in each locale and pilot, each feature page and each loyalty page. */
const LEGACY_URLS = [
  ...routing.locales.flatMap((locale) => [
    legacyPath(locale),
    ...FEATURE_SLUGS.map((slug) => legacyPath(locale, `/features/${getLocalizedSlug(slug, locale)}`)),
    legacyPath(locale, LOYALTY_SLUGS[locale as keyof typeof LOYALTY_SLUGS]),
  ]),
  "/us/legacy",
  "/uk/legacy",
];

/** The page files that serve them, and no others. */
const LEGACY_PAGES = [
  join(APP, "legacy", "page.tsx"),
  join(APP, "us", "legacy", "page.tsx"),
  join(APP, "uk", "legacy", "page.tsx"),
  join(APP, "legacy", "features", "[slug]", "page.tsx"),
  ...Object.values(LOYALTY_SLUGS).map((slug) => join(APP, "legacy", slug, "page.tsx")),
];

describe("where the legacy pages are", () => {
  test("the homepage is /legacy, /en/legacy, /es/legacy and /pl/legacy, and each pilot's is under its own root", () => {
    expect(routing.locales.map((locale) => legacyPath(locale))).toEqual(["/legacy", "/en/legacy", "/es/legacy", "/pl/legacy"]);
    expect(LEGACY_URLS).toContain("/us/legacy");
    expect(LEGACY_URLS).toContain("/uk/legacy");
  });

  test("a feature page keeps its localised slug and a loyalty page its own", () => {
    expect(legacyPath("fr", "/features/design-de-carte")).toBe("/legacy/features/design-de-carte");
    expect(legacyPath("en", "/features/card-design")).toBe("/en/legacy/features/card-design");
    expect(legacyPath("es", LOYALTY_SLUGS.es)).toBe("/es/legacy/programa-de-fidelizacion");
    expect(legacyPath("pl", LOYALTY_SLUGS.pl)).toBe("/pl/legacy/program-lojalnosciowy");
  });

  test.each(LEGACY_PAGES.map((file) => [file.replace(ROOT, "")] as const))("%s exists", (file) => {
    expect(existsSync(join(ROOT, file))).toBe(true);
  });

  test("no other page lives under a legacy folder", () => {
    const found = [APP, join(APP, "us"), join(APP, "uk")].flatMap((dir) => (existsSync(join(dir, "legacy")) ? pagesUnder(join(dir, "legacy")) : []));

    expect(found.sort()).toEqual([...LEGACY_PAGES].sort());
  });

  test.each(LEGACY_URLS.map((url) => [url] as const))("%s is read as a legacy page", (url) => {
    expect(isLegacyPath(url)).toBe(true);
    expect(isLegacyPath(`${url}/`)).toBe(true);
  });

  test.each(["/", "/en", "/us", "/uk", "/features/card-design", "/en/loyalty-programs", "/legacy-cafe", "/en/legacy-cafe", "/us/legacy-cafe", "/pricing"])(
    "%s is not one",
    (url) => {
      expect(isLegacyPath(url)).toBe(false);
    },
  );
});

describe("legacy is a site segment, not a business slug", () => {
  test("it is reserved, so /legacy never reads as a shop's enrolment page", () => {
    expect(LEGACY_SEGMENT).toBe("legacy");
    expect(isReservedTopSegment("legacy")).toBe(true);
    expect(acquisitionSlug("/legacy")).toBeNull();
  });

  test("a shop whose slug starts with the letters is still a shop", () => {
    expect(acquisitionSlug("/legacy-cafe")).toBe("legacy-cafe");
  });

  test.each(["/us/legacy", "/uk/legacy"])("%s goes through the pilot rewrite, and carries its market", (path) => {
    expect(isPilotPath(path)).toBe(true);
    expect(marketFromPath(path)).toBe(path.startsWith("/us") ? "us" : "uk");
  });

  test.each(Object.keys(MARKETS).filter((market) => market !== "int"))("the %s legacy page is served from the pilot's own folder", (market) => {
    expect(existsSync(join(APP, market, "legacy", "page.tsx"))).toBe(true);
  });
});

describe("a legacy page is noindex", () => {
  test.each(LEGACY_PAGES.map((file) => [file.replace(ROOT, "")] as const))("%s declares robots: NOINDEX", (file) => {
    expect(readFileSync(join(ROOT, file), "utf-8")).toMatch(/robots:\s*NOINDEX\b/);
  });

  test.each([
    ["/legacy", "@/app/[locale]/legacy/page"],
    ["/us/legacy", "@/app/[locale]/us/legacy/page"],
    ["/uk/legacy", "@/app/[locale]/uk/legacy/page"],
  ])("the head of %s: no index, no canonical, no hreflang", async (_url, module) => {
    const { generateMetadata } = await import(module);
    const head = await generateMetadata({ params: Promise.resolve({ locale: "en" }) }, Promise.resolve({}));

    expect(head.robots).toEqual({ index: false, follow: false });
    expect(head.alternates).toBeUndefined();
  });
});

describe("nothing that tells visitors or crawlers where the pages are lists a legacy page", () => {
  test("the sitemap", () => {
    const urls = buildSitemap().flatMap((entry) => [entry.url, ...Object.values(entry.alternates?.languages ?? {})]);

    expect(urls.length).toBeGreaterThan(0);
    expect(urls.filter((url) => /\/legacy(?:\/|$)/.test(url))).toEqual([]);
  });

  test("llms.txt", () => {
    expect(buildLlmsTxt()).not.toMatch(/\/legacy(?:\/|\)|\s|$)/);
  });

  test.each(LEGACY_URLS.map((url) => [url] as const))("the markdown proxy does not serve %s", (url) => {
    expect(isMarkdownEligible(url)).toBe(false);
  });

  test("the live pages of every language still are served as markdown", () => {
    expect(isMarkdownEligible("/en/features/card-design")).toBe(true);
    expect(isMarkdownEligible("/en/legacy-guide")).toBe(true);
  });

  test.each(routing.locales.flatMap((locale) => (Object.keys(MARKETS) as Array<keyof typeof MARKETS>).map((market) => [locale, market] as const)))(
    "the header menus, footer links and sitemap block of %s / %s",
    (locale, market) => {
      const t = (key: string) => key;
      const hrefs = [
        ...productMenuItems(t, locale).map((item) => item.href),
        ...pageMenuItems(t, locale, market).navItems.map((item) => item.href),
        ...pageMenuItems(t, locale, market).resourceItems.map((item) => item.href),
        ...buildSeoLinks(locale, market).map((link) => link.href),
      ];

      expect(hrefs.length).toBeGreaterThan(8);
      expect(hrefs.filter((href) => isLegacyPath(href))).toEqual([]);
    },
  );
});

describe("no live page links to a legacy page", () => {
  /** The source files that may name a legacy URL: the helper, the proxy lists, and the legacy routes themselves. */
  const KNOW_LEGACY = new Set([
    "lib/seo/legacy-pages.ts",
    "lib/markdown/eligibility.ts",
    "lib/locale-negotiation.ts",
    "lib/consent-routes.ts",
  ]);

  const sourceFiles = (dir: string): string[] =>
    readdirSync(join(ROOT, dir), { withFileTypes: true }).flatMap((entry) => {
      const path = `${dir}/${entry.name}`;
      if (entry.isDirectory()) return entry.name === "node_modules" || entry.name === "legacy" ? [] : sourceFiles(path);
      return /\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name) ? [path] : [];
    });

  test("only the helper, the proxy's lists and the legacy routes name a legacy URL", () => {
    const naming = ["app", "components", "lib", "hooks", "i18n"]
      .filter((dir) => existsSync(join(ROOT, dir)))
      .flatMap(sourceFiles)
      .filter((file) => !file.startsWith("lib/testing/") && !KNOW_LEGACY.has(file))
      .filter((file) => /["'`]\/?(?:us\/|uk\/)?legacy[/"'`]|\blegacyPath\b/.test(readFileSync(join(ROOT, file), "utf-8")));

    expect(naming).toEqual([]);
  });
});

/**
 * The legacy pages under `/legacy` can be reached by URL and from nowhere else.
 * Not in the sitemap, `llms.txt`, the markdown proxy, any hreflang cluster or any menu; never linked from a live
 * page; noindex; and `legacy` is a site segment, never a business slug.
 */

import { describe, expect, test } from "bun:test";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { BroadcastsPage } from "@/components/features/broadcasts/BroadcastsPage";
import { AnalyticsPageContent } from "@/components/features/analytics/AnalyticsPageContent";
import { CardDesignPageContent } from "@/components/features/design-de-carte/CardDesignPageContent";
import { GeofencingPage } from "@/components/features/geolocalisation/GeofencingPage";
import { NotificationsPushPage } from "@/components/features/notifications-push/NotificationsPushPage";
import { ScannerMobilePage } from "@/components/features/scanner-mobile/ScannerMobilePage";
import { VariantLanding } from "@/components/landing-variant/VariantLanding";
import { LoyaltyRouteView } from "@/components/loyalty/LoyaltyRouteView";
import { routing } from "@/i18n/routing";
import { FEATURE_SLUGS, getLocalizedSlug, type FeatureSlug } from "../feature-slugs";
import { LEGACY_SEGMENT, isLegacyPath, legacyPath } from "./legacy-pages";
import { buildLlmsTxt } from "../llms-txt";
import { acquisitionSlug, isReservedTopSegment } from "../locale-negotiation";
import { LOYALTY_SLUGS } from "../loyalty-routes";
import { isMarkdownEligible } from "../markdown/eligibility";
import { MARKETS, isPilotPath, marketFromPath } from "../markets";
import { productMenuItems, pageMenuItems } from "../nav/menu-items";
import { buildSeoLinks } from "../seo-links";
import { pagesUnder } from "../testing/app-folders";
import { elementsOf } from "../testing/element-tree";
import { inServerLocale, mockEnglishServerTranslations } from "../testing/server-intl";
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

const NOINDEX = { index: false, follow: false };
const NOT_FOUND = { digest: expect.stringContaining("404") };
const REDIRECT = (to: string) => ({ digest: expect.stringContaining(`;${to};308`) });
const parent = Promise.resolve({}) as never;
const asLocale = (locale: string) => ({ params: Promise.resolve({ locale }) });

describe("the legacy homepage is the page the homepage was", () => {
  test.each(routing.locales)("/%s/legacy mounts the earlier homepage for the international market, noindex", async (locale) => {
    const route = await import("@/app/[locale]/legacy/page");
    const tree = await inServerLocale(locale, async () => route.default(asLocale(locale)));
    const pages = elementsOf(tree, VariantLanding);

    expect(pages).toHaveLength(1);
    expect(pages[0].props).toEqual({ locale });
    expect(await route.generateMetadata()).toEqual({ robots: NOINDEX });
  });

  test.each([
    ["us", "@/app/[locale]/us/legacy/page"],
    ["uk", "@/app/[locale]/uk/legacy/page"],
  ] as const)("/%s/legacy mounts the earlier homepage of that market, in English, noindex", async (market, module) => {
    const route = await import(module);
    const pages = elementsOf(route.default(), VariantLanding);
    const head = await route.generateMetadata({}, parent);

    expect(pages).toHaveLength(1);
    expect(pages[0].props).toEqual({ locale: "en", market });
    expect(head.robots).toEqual(NOINDEX);
    expect(head.alternates).toBeUndefined();
  });
});

describe("the legacy feature pages are the pages the features had", () => {
  const OLD_BODIES = {
    "design-de-carte": CardDesignPageContent,
    "scanner-mobile": ScannerMobilePage,
    "notifications-push": NotificationsPushPage,
    analytiques: AnalyticsPageContent,
    geolocalisation: GeofencingPage,
    "campagnes-promotionnelles": BroadcastsPage,
  } as const satisfies Record<FeatureSlug, unknown>;
  const params = (locale: string, slug: string) => ({ params: Promise.resolve({ locale, slug }) });
  const CASES = routing.locales.flatMap((locale) => FEATURE_SLUGS.map((feature) => [locale, feature, getLocalizedSlug(feature, locale)] as const));

  test.each(CASES)("%s: %s at /legacy/features/%s mounts the earlier page body, noindex, with no canonical or hreflang", async (locale, feature, slug) => {
    const route = await import("@/app/[locale]/legacy/features/[slug]/page");
    const tree = await inServerLocale(locale, async () => route.default(params(locale, slug)));
    const head = await inServerLocale(locale, async () => route.generateMetadata(params(locale, slug)));

    expect(elementsOf(tree, OLD_BODIES[feature])).toHaveLength(1);
    expect(head.robots).toEqual(NOINDEX);
    expect(head.alternates).toBeUndefined();
    expect(head.openGraph).toBeUndefined();
  });

  test("a slug of another language is sent to the page's own slug, still under /legacy; an unknown slug is a 404", async () => {
    const route = await import("@/app/[locale]/legacy/features/[slug]/page");

    await expect(inServerLocale("en", async () => route.default(params("en", "design-de-carte")))).rejects.toMatchObject(REDIRECT("/en/legacy/features/card-design"));
    await expect(inServerLocale("fr", async () => route.default(params("fr", "card-design")))).rejects.toMatchObject(REDIRECT("/legacy/features/design-de-carte"));
    await expect(inServerLocale("en", async () => route.default(params("en", "nothing")))).rejects.toMatchObject(NOT_FOUND);
  });
});

describe("the legacy loyalty pages are the page the loyalty programs had", () => {
  const ROUTES = Object.entries(LOYALTY_SLUGS).map(([locale, slug]) => [locale, slug.slice(1)] as const);

  test.each(ROUTES)("%s: /legacy%s mounts the earlier loyalty page, noindex, with no canonical or hreflang", async (locale, dir) => {
    const route = await import(`@/app/[locale]/legacy/${dir}/page`);
    const tree = await inServerLocale(locale, async () => route.default(asLocale(locale)));
    const head = await inServerLocale(locale, async () => route.generateMetadata(asLocale(locale)));

    expect(elementsOf(tree, LoyaltyRouteView).map((view) => view.props.locale)).toEqual([locale]);
    expect(head.robots).toEqual(NOINDEX);
    expect(head.alternates).toBeUndefined();
  });

  test.each(ROUTES)("a visitor of another language who lands on /legacy/%s is sent to their own legacy page", async (locale, dir) => {
    const other = routing.locales.find((candidate) => candidate !== locale) as string;
    const route = await import(`@/app/[locale]/legacy/${dir}/page`);

    expect(await route.generateMetadata(asLocale(other))).toEqual({});
    await expect(route.default(asLocale(other))).rejects.toMatchObject(REDIRECT(legacyPath(other, LOYALTY_SLUGS[other as keyof typeof LOYALTY_SLUGS])));
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

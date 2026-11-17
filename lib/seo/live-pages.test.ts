/**
 * The Platform pages are the live pages: the homepage in every language and market, the six feature pages and the
 * loyalty programs page at the URLs the old pages had, with the head the old pages carried (canonical, hreflang,
 * Open Graph, structured data), indexable, and in the sitemap at the same URLs.
 *
 * The routes are read the way Next reads them: a page's default export is called and the element it mounts is
 * inspected, its `generateMetadata` is called and the head it returns is compared with the sitemap's own cluster.
 */

import { afterAll, describe, expect, mock, test } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { createTranslator } from "next-intl";
import { JsonLd } from "@/components/JsonLd";
import { PkceCallbackHandler } from "@/components/auth/PkceCallbackHandler";
import { AnalyticsPreviewPage } from "@/components/landing-pages/pages/AnalyticsPreviewPage";
import { CardDesignPreviewPage } from "@/components/landing-pages/pages/CardDesignPreviewPage";
import { GeolocationPreviewPage } from "@/components/landing-pages/pages/GeolocationPreviewPage";
import { HomePage } from "@/components/landing-pages/pages/HomePage";
import { LoyaltyLivePage } from "@/components/landing-pages/pages/LoyaltyLivePage";
import { LoyaltyProgramsPreviewPage } from "@/components/landing-pages/pages/LoyaltyProgramsPreviewPage";
import { MobileScannerPreviewPage } from "@/components/landing-pages/pages/MobileScannerPreviewPage";
import { PlatformPage } from "@/components/landing-pages/pages/PlatformPage";
import { PromotionalCampaignsPreviewPage } from "@/components/landing-pages/pages/PromotionalCampaignsPreviewPage";
import { PushNotificationsPreviewPage } from "@/components/landing-pages/pages/PushNotificationsPreviewPage";
import { LandingPageShell } from "@/components/landing-pages/shared/LandingPageShell";
import { LandingTracker } from "@/components/analytics/LandingTracker";
import { RegionPricingProvider } from "@/components/market/RegionPricingProvider";
import { PricingSection } from "@/components/sections/PricingSection";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { routing } from "@/i18n/routing";
import { FEATURE_SLUGS, generateFeatureStaticParams, getLocalizedSlug, type FeatureSlug } from "../feature-slugs";
import { landingCopy } from "../landing-pages/copy/bundle";
import { ALL_LANDING_SLUGS, LANDING_PAGES, pageWords } from "../landing-pages/pages";
import { FEATURE_PREVIEWS } from "../landing-pages/preview-nav";
import { LOYALTY_LANGUAGES, LOYALTY_SLUGS, loyaltyPath } from "../loyalty-routes";
import { MARKETS, PILOT_HREFLANG, marketRobots, type Market } from "../markets";
import { ogLocaleFor } from "../og/metadata";
import { elementsOf } from "../testing/element-tree";
import { loadCatalog } from "../testing/catalogs";
import { buildSitemap, SITEMAP_BASE_URL } from "./sitemap";

// What a request would supply: the locale being rendered and the English-or-other catalogs, with no Next request.
let current = "en";
const realIntl = await import("next-intl/server");
mock.module("next-intl/server", () => ({
  ...realIntl,
  setRequestLocale: () => {},
  getLocale: async () => current,
  getTranslations: async (arg?: string | { locale?: string; namespace?: string }) => {
    const { locale = current, namespace } = typeof arg === "string" ? { namespace: arg } : (arg ?? {});
    return createTranslator({ locale, messages: loadCatalog(locale), namespace: namespace as never });
  },
}));
afterAll(() => mock.module("next-intl/server", () => realIntl));

const home = await import("@/app/[locale]/page");
const usHome = await import("@/app/[locale]/us/page");
const ukHome = await import("@/app/[locale]/uk/page");
const featureRoute = await import("@/app/[locale]/features/[slug]/page");

const ROOT = join(import.meta.dir, "..", "..");
const APP = join(ROOT, "app", "[locale]");
const REDIRECT = (to: string) => ({ digest: expect.stringContaining(`;${to};308`) });
const NOT_FOUND = { digest: expect.stringContaining("404") };
const parent = Promise.resolve({}) as never;

const pathOf = (url: string) => url.slice(SITEMAP_BASE_URL.length) || "/";
const stripBase = (languages: Record<string, string> | undefined) =>
  Object.fromEntries(Object.entries(languages ?? {}).map(([key, url]) => [key, pathOf(url)]));

const sitemap = buildSitemap();
const entryAt = (path: string) => sitemap.find((entry) => pathOf(entry.url) === path);

/** The homepage URLs: locale, market and what the route is called with. */
const HOMES: ReadonlyArray<readonly [locale: string, market: Market, path: string]> = [
  ["fr", "int", "/"],
  ["en", "int", "/en"],
  ["es", "int", "/es"],
  ["pl", "int", "/pl"],
  ["en", "us", "/us"],
  ["en", "uk", "/uk"],
];

async function homeTree(locale: string, market: Market) {
  current = locale;
  if (market === "us") return usHome.default();
  if (market === "uk") return ukHome.default();
  return home.default({ params: Promise.resolve({ locale }) });
}

async function homeHead(locale: string, market: Market) {
  current = locale;
  if (market === "us") return usHome.generateMetadata(undefined, parent);
  if (market === "uk") return ukHome.generateMetadata(undefined, parent);
  return home.generateMetadata({ params: Promise.resolve({ locale }) });
}

describe("the homepage renders Platform, in the visitor's language and market", () => {
  test.each(HOMES)("%s / %s (%s) mounts the home page for its market", async (locale, market) => {
    const tree = await homeTree(locale, market);
    const pages = elementsOf(tree, HomePage);

    expect(pages).toHaveLength(1);
    expect(pages[0].props.market).toBe(market);
  });

  test("only the root homepage finishes a sign-in that lands there", async () => {
    expect(elementsOf(await homeTree("fr", "int"), PkceCallbackHandler)).toHaveLength(1);
    expect(elementsOf(await homeTree("en", "us"), PkceCallbackHandler)).toHaveLength(0);
  });

  test.each(HOMES)("%s / %s: the page is Platform for that market, down to the pricing block", async (locale, market) => {
    current = locale;
    const page = await HomePage({ market });

    expect(elementsOf(page, PlatformPage)[0].props.market).toBe(market);
    expect(elementsOf(await PlatformPage({ market }), PricingSection)[0].props.market).toBe(market);
  });

  test.each([
    ["us", "usd", 14],
    ["int", "eur", 30],
    ["uk", "eur", 30],
  ] as const)("the %s shell opens on %s and a %s-day trial, with the market's header and footer", async (market, currency, trialDays) => {
    current = "en";
    const shell = await LandingPageShell({ slug: "platform", market, children: null });
    const provider = elementsOf(shell, RegionPricingProvider)[0];

    expect(provider.props.defaultCurrency).toBe(currency);
    expect(provider.props.defaultTrialDays).toBe(trialDays);
    expect(elementsOf(shell, Header)[0].props.market).toBe(market);
    expect(elementsOf(shell, Footer)[0].props.market).toBe(market);
    expect(MARKETS[market].trialDays).toBe(trialDays);
  });

  test("the UK reads the international English, never the US overlay", () => {
    const uk = landingCopy("en", "uk");

    expect(uk).toBe(landingCopy("en", "int"));
    expect(uk.platform.PLATFORM.hero.h1).not.toMatch(/punch/i);
    expect(landingCopy("en", "us").platform.PLATFORM.hero.h1).toMatch(/punch card/i);
  });
});

describe("the homepage head", () => {
  test.each(HOMES)("%s / %s: its title and description are Platform's, in that language and market", async (locale, market) => {
    const head = await homeHead(locale, market);
    const { meta } = landingCopy(locale, market).platform.PLATFORM;

    expect(head.title).toEqual({ absolute: meta.title });
    expect(head.description).toBe(meta.description);
    expect(head.openGraph).toMatchObject({ title: meta.title, description: meta.description, siteName: "Stampeo", type: "website" });
  });

  test.each(HOMES)("%s / %s: canonical is its own URL, and the hreflang cluster is the sitemap's, pilots included", async (locale, market, path) => {
    const head = await homeHead(locale, market);

    expect(head.alternates?.canonical).toBe(path);
    expect(head.alternates?.languages).toEqual(PILOT_HREFLANG);
    expect(head.alternates?.languages).toEqual(stripBase(entryAt(path === "/us" || path === "/uk" ? "/" : path)?.alternates?.languages));
    expect(Object.keys(head.alternates?.languages ?? {})).toContain("en-US");
  });

  test.each(HOMES)("%s / %s: indexable exactly when its market is (the UK is held back, everything else is open)", async (locale, market) => {
    const head = await homeHead(locale, market);

    if (market === "int") expect(head.robots).toBeUndefined();
    else expect(head.robots).toEqual(marketRobots(market));
    expect(marketRobots("us").index).toBe(true);
    expect(marketRobots("uk").index).toBe(false);
  });

  test.each(HOMES)("%s / %s: the Open Graph locale names its language, or its pilot's region", async (locale, market) => {
    const head = await homeHead(locale, market);

    expect(head.openGraph).toMatchObject({ locale: market === "int" ? ogLocaleFor(locale) : MARKETS[market].ogLocale });
  });

  test.each(["us", "uk"] as const)("the %s page repeats its own Open Graph block with the site's share image, which the layout's would otherwise carry", async (market) => {
    const head = await homeHead("en", market);

    expect(head.openGraph).toMatchObject({ url: MARKETS[market].path });
    expect(JSON.stringify(head.openGraph)).toContain("/opengraph-image");
  });

  test("the share image routes still exist, for the homepage, each feature page and each loyalty page", () => {
    expect(existsSync(join(APP, "opengraph-image.tsx"))).toBe(true);
    expect(existsSync(join(APP, "features", "[slug]", "opengraph-image.tsx"))).toBe(true);
    for (const slug of Object.values(LOYALTY_SLUGS)) expect(existsSync(join(APP, slug, "opengraph-image.tsx"))).toBe(true);
  });

  test.each(["int", "us", "uk"] as const)("%s: structured data is the organisation, the site and the software, and no FAQ the page does not show", async (market) => {
    current = "en";
    const types = elementsOf(await HomePage({ market }), JsonLd).map((block) => (block.props.data as { "@type": string })["@type"]);

    expect(types.sort()).toEqual(["Organization", "SoftwareApplication", "WebSite"]);
  });
});

describe("each homepage reports its own landing variant", () => {
  test("Platform reports lp_platform, the old homepage wallet", async () => {
    current = "en";
    const shell = await LandingPageShell({ slug: "platform", market: "int", children: null });
    const { VariantLanding } = await import("@/components/landing-variant/VariantLanding");
    const legacy = await VariantLanding({ locale: "en" });

    expect(LANDING_PAGES.platform.variant).toBe("lp_platform");
    expect(elementsOf(shell, LandingTracker)[0].props.variant).toBe("lp_platform");
    expect(elementsOf(legacy, LandingTracker)[0].props.variant).toBe("wallet");
  });
});

/** The page each feature's route mounts. */
const FEATURE_PAGES = {
  "design-de-carte": CardDesignPreviewPage,
  "scanner-mobile": MobileScannerPreviewPage,
  "notifications-push": PushNotificationsPreviewPage,
  analytiques: AnalyticsPreviewPage,
  geolocalisation: GeolocationPreviewPage,
  "campagnes-promotionnelles": PromotionalCampaignsPreviewPage,
} as const satisfies Record<FeatureSlug, unknown>;

/** Every feature URL the sitemap lists: its locale, its slug, its path. */
const FEATURE_URLS = sitemap
  .map((entry) => pathOf(entry.url))
  .filter((path) => path.includes("/features/"))
  .map((path) => {
    const segments = path.split("/").filter(Boolean);
    const locale = segments.length === 3 ? segments[0] : "fr";

    return [locale, segments.at(-1) as string, path] as const;
  });

const canonicalOf = (slug: string) => FEATURE_SLUGS.find((feature) => [feature, ...routing.locales.map((l) => getLocalizedSlug(feature, l))].includes(slug)) as FeatureSlug;
const featureParams = (locale: string, slug: string) => ({ params: Promise.resolve({ locale, slug }) });

describe("the feature pages", () => {
  test("the sitemap lists each feature in every language: the URLs the old pages had", () => {
    expect(FEATURE_URLS).toHaveLength(FEATURE_SLUGS.length * routing.locales.length);
  });

  test.each(FEATURE_URLS)("%s / %s (%s) renders the feature's Platform page for the international market", async (locale, slug) => {
    current = locale;
    const tree = await featureRoute.default(featureParams(locale, slug));
    const pages = elementsOf(tree, FEATURE_PAGES[canonicalOf(slug)]);

    expect(pages).toHaveLength(1);
    expect(pages[0].props.market).toBe("int");
  });

  test("every URL of the sitemap is one the route builds ahead of time, as before", () => {
    const params = featureRoute.generateStaticParams().map(({ slug }: { slug: string }) => slug);

    expect(params.sort()).toEqual(generateFeatureStaticParams().map(({ slug }) => slug).sort());
    for (const [, slug] of FEATURE_URLS) expect(params).toContain(slug);
  });

  test.each([
    ["en", "design-de-carte", "/en/features/card-design"],
    ["es", "card-design", "/es/features/estilo-de-tarjeta"],
    ["pl", "estilo-de-tarjeta", "/pl/features/wzor-karty"],
    ["fr", "card-design", "/features/design-de-carte"],
  ])("%s / %s sends the visitor to the page's own slug in that language, as before", async (locale, slug, to) => {
    await expect(featureRoute.default(featureParams(locale, slug))).rejects.toMatchObject(REDIRECT(to));
  });

  test("an unknown slug is a 404", async () => {
    await expect(featureRoute.default(featureParams("en", "not-a-feature"))).rejects.toMatchObject(NOT_FOUND);
  });

  test.each(FEATURE_URLS)("%s / %s (%s): indexable, its own canonical, and the sitemap's hreflang cluster and Open Graph URL", async (locale, slug, path) => {
    current = locale;
    const head = await featureRoute.generateMetadata(featureParams(locale, slug));
    const { meta } = pageWords(FEATURE_PREVIEWS[canonicalOf(slug)], locale, "int");

    expect(head.robots).toBeUndefined();
    expect(head.title).toEqual({ absolute: meta.title });
    expect(head.description).toBe(meta.description);
    expect(head.alternates?.canonical).toBe(path);
    expect(head.alternates?.languages).toEqual(stripBase(entryAt(path)?.alternates?.languages));
    expect(head.openGraph).toMatchObject({ url: path, title: meta.title, description: meta.description, type: "website" });
  });

  test.each(FEATURE_URLS)("%s / %s (%s): structured data holds the breadcrumb and, where the page shows a FAQ, the FAQ", async (locale, slug) => {
    current = locale;
    const tree = await featureRoute.default(featureParams(locale, slug));
    const types = elementsOf(tree, JsonLd).map((block) => (block.props.data as { "@type": string })["@type"]);

    expect(types).toContain("BreadcrumbList");
  });
});

describe("a page that shows a FAQ says so in its structured data, with every price and trial length resolved", () => {
  const FAQ_PAGES = [
    ["card design", CardDesignPreviewPage, "cardDesign", "CARD_DESIGN_PREVIEW"],
    ["promotional campaigns", PromotionalCampaignsPreviewPage, "promotionalCampaigns", "PROMOTIONAL_CAMPAIGNS_PREVIEW"],
    ["geolocation", GeolocationPreviewPage, "geolocation", "GEOLOCATION_PREVIEW"],
    ["loyalty programs", LoyaltyProgramsPreviewPage, "loyaltyPrograms", "LOYALTY_PROGRAMS_PREVIEW"],
  ] as const;

  test.each(FAQ_PAGES.flatMap((page) => routing.locales.map((locale) => [locale, ...page] as const)))(
    "%s: the %s page",
    async (locale, _name, Page, group, name) => {
      current = locale;
      const tree = await Page({ market: "int" });
      const faq = elementsOf(tree, JsonLd).map((block) => block.props.data as { "@type": string; mainEntity?: Array<{ name: string; acceptedAnswer: { text: string } }> }).find((data) => data["@type"] === "FAQPage");
      const items = (landingCopy(locale, "int").previews[group] as Record<string, { faq: { items: Array<{ question: string; answer: string }> } }>)[name].faq.items;

      expect(faq?.mainEntity?.map((entry) => entry.name)).toEqual(items.map((item) => item.question));
      expect(JSON.stringify(faq)).not.toMatch(/\{[a-zA-Z]+\}/);
    },
  );

  test("the pages with no FAQ say nothing of one", async () => {
    current = "en";
    for (const Page of [MobileScannerPreviewPage, PushNotificationsPreviewPage, AnalyticsPreviewPage]) {
      const types = elementsOf(await Page({ market: "int" }), JsonLd).map((block) => (block.props.data as { "@type": string })["@type"]);

      expect(types).not.toContain("FAQPage");
    }
  });
});

describe("a live head fits what a search result shows: 60 characters of title and 160 of description", () => {
  const heads = [
    ...routing.locales.flatMap((locale) => ALL_LANDING_SLUGS.map((slug) => [locale, slug, pageWords(slug, locale, "int").meta] as const)),
    ...(["us", "uk"] as const).map((market) => ["en", `platform (${market})`, pageWords("platform", "en", market).meta] as const),
  ];
  const over = heads.flatMap(([locale, slug, { title, description }]) => [
    ...(title.length > 60 ? [`${locale}:${slug}:title`] : []),
    ...(description.length > 160 ? [`${locale}:${slug}:description`] : []),
  ]);

  test("every title and description of every page, language and market is within its limit", () => {
    expect(over).toEqual([]);
  });

  test.each(heads)("%s %s: the title names Stampeo once and uses no em dash", (_locale, _slug, { title, description }) => {
    expect(title.match(/Stampeo/g)).toHaveLength(1);
    expect(`${title}\n${description}`).not.toContain("—");
  });
});

/** Each loyalty route folder and the one language it serves. */
const LOYALTY_ROUTES = Object.entries(LOYALTY_SLUGS).map(([locale, slug]) => [locale, slug.slice(1)] as const);

describe("the loyalty programs page", () => {
  test.each(LOYALTY_ROUTES)("%s: /%s renders the loyalty programs Platform page for that language", async (locale, dir) => {
    current = locale;
    const route = await import(`@/app/[locale]/${dir}/page`);
    const tree = await route.default({ params: Promise.resolve({ locale }) });
    const pages = elementsOf(tree, LoyaltyLivePage);

    expect(pages).toHaveLength(1);
    expect(pages[0].props.locale).toBe(locale);
  });

  test.each(routing.locales)("%s: the page mounts the loyalty preview for the international market, under a breadcrumb", async (locale) => {
    current = locale;
    const tree = await LoyaltyLivePage({ locale });

    expect(elementsOf(tree, LoyaltyProgramsPreviewPage)[0].props.market).toBe("int");
    expect(elementsOf(tree, JsonLd).map((block) => (block.props.data as { "@type": string })["@type"])).toContain("BreadcrumbList");
  });

  test.each(LOYALTY_ROUTES)("%s: /%s is indexable with its own canonical and the sitemap's hreflang cluster", async (locale, dir) => {
    current = locale;
    const route = await import(`@/app/[locale]/${dir}/page`);
    const head = await route.generateMetadata({ params: Promise.resolve({ locale }) });
    const { meta } = pageWords("platform/loyalty-programs", locale, "int");

    expect(head.robots).toBeUndefined();
    expect(head.title).toEqual({ absolute: meta.title });
    expect(head.description).toBe(meta.description);
    expect(head.alternates?.canonical).toBe(loyaltyPath(locale));
    expect(head.alternates?.languages).toEqual(LOYALTY_LANGUAGES);
    expect(head.alternates?.languages).toEqual(stripBase(entryAt(loyaltyPath(locale))?.alternates?.languages));
  });

  test.each(LOYALTY_ROUTES)("a visitor of another language who lands on /%s is sent to their own page; %s has no head there", async (locale, dir) => {
    const other = routing.locales.find((candidate) => candidate !== locale) as string;
    const route = await import(`@/app/[locale]/${dir}/page`);

    expect(await route.generateMetadata({ params: Promise.resolve({ locale: other }) })).toEqual({});
    await expect(route.default({ params: Promise.resolve({ locale: other }) })).rejects.toMatchObject(REDIRECT(loyaltyPath(other)));
  });
});

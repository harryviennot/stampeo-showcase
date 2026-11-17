/**
 * The four US landing pages (`/us/landing-pages/*`) and the six feature previews
 * under `/us/landing-pages/platform/*`: one registry, one shell, one set of shared
 * sections. Which sections a page renders, where its tracking sits, which CTA
 * locations it may use and what its hero says are read from the source (pages
 * are async server components); what a section frame prints is rendered. What is
 * specific to the previews is in `previews/registry.test.ts`.
 */

import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { LpCtaPair } from "@/components/landing-pages/platform/LpCtaPair";
import { LpSection } from "@/components/landing-pages/shared/LpSection";
import { MAX_FIELD } from "../attribution/codec";
import { buildLlmsTxt } from "../llms-txt";
import { NOINDEX } from "../seo/page-robots";
import { buildSitemap } from "../seo/sitemap";
import { ROOT, code, filesWith, findTag, literalAttr, openingTags, read, sourceFiles } from "../testing/jsx-source";
import { NO_CARD_CLAIM, WORDED_TRIAL } from "../testing/copy-claims";
import {
  COMPONENTS_DIR,
  SHARED_DIR,
  PAGE_COMPONENTS,
  localisedRouteFile,
  lpFiles,
  pageComponent,
  pageFile,
  renderedSections,
  routeFile,
  shared,
} from "../testing/landing-pages-source";
import { renderEn } from "../testing/render-en";
import { SHARED } from "./copy/shared";
import { ALL_LANDING_SLUGS, LANDING_PAGES, LANDING_SLUGS, hasDemoSection, landingPageMetadata, pageWords } from "./pages";
import { proofFigures } from "./proof";

/** The three pages that argue one thing, and Platform, which tours the product. */
const ARGUMENT_PAGES = ["how-it-works", "features", "outcomes"] as const;

describe("the registry (AC1, AC2, AC4)", () => {
  test("every page is registered under its slug", () => {
    expect(Object.keys(LANDING_PAGES).sort()).toEqual([...ALL_LANDING_SLUGS].sort());
    for (const slug of ALL_LANDING_SLUGS) expect(LANDING_PAGES[slug].slug).toBe(slug);
  });

  test.each(ALL_LANDING_SLUGS)("%s lists no section twice, and never more than 13", (slug) => {
    const { sections } = LANDING_PAGES[slug];

    expect(new Set(sections).size).toBe(sections.length);
    expect(sections.length).toBeLessThanOrEqual(13);
  });

  test.each(ARGUMENT_PAGES)("%s ends with pricing, faq and final_cta", (slug) => {
    expect(LANDING_PAGES[slug].sections.slice(-3)).toEqual(["pricing", "faq", "final_cta"]);
  });

  test("Platform closes with pricing, the accent band, the sectors and the blog, and has no FAQ", () => {
    expect(LANDING_PAGES.platform.sections.slice(-4)).toEqual(["pricing", "final_cta", "sectors", "blog"]);
    expect(LANDING_PAGES.platform.sections).not.toContain("faq");
  });

  test.each(LANDING_SLUGS)("%s has the sectors and the pricing block", (slug) => {
    expect(LANDING_PAGES[slug].sections).toEqual(expect.arrayContaining(["sectors", "pricing"]));
  });

  test("each page has its own variant, short enough for the attribution field", () => {
    const variants = ALL_LANDING_SLUGS.map((slug) => LANDING_PAGES[slug].variant);

    expect(new Set(variants).size).toBe(ALL_LANDING_SLUGS.length);
    for (const variant of variants) expect(variant.length).toBeLessThanOrEqual(MAX_FIELD);
  });

  test("a page links to its demo from the hero only when its sections include one", () => {
    for (const slug of ALL_LANDING_SLUGS) expect(hasDemoSection(slug)).toBe(LANDING_PAGES[slug].sections.includes("demo"));
    expect(LANDING_SLUGS.filter((slug) => !hasDemoSection(slug))).toEqual(["outcomes"]);
  });
});

describe("the routes (AC1, AC2, AC4)", () => {
  test.each(ALL_LANDING_SLUGS)("%s has its page file", (slug) => {
    expect(existsSync(pageFile(slug))).toBe(true);
  });

  test.each(LANDING_SLUGS)("%s renders every registry section once, in registry order", (slug) => {
    expect(renderedSections(pageFile(slug))).toEqual([...LANDING_PAGES[slug].sections]);
  });

  test.each(LANDING_SLUGS)("%s prints the pricing block of its market: the US one on /us", (slug) => {
    const pricing = findTag(code(pageFile(slug)), "PricingSection");

    if (slug === "platform") {
      expect(pricing?.attrs).toContain("market={market}");
      expect(code(routeFile(slug))).toContain('<PlatformPage market="us" />');
    } else {
      expect(literalAttr(pricing?.attrs ?? "", "market")).toBe("us");
    }
  });

  test.each(Object.keys(PAGE_COMPONENTS) as Array<keyof typeof PAGE_COMPONENTS>)("%s is served in every language by a route that mounts the same page for the international market", (slug) => {
    const route = code(localisedRouteFile(slug));
    const page = PAGE_COMPONENTS[slug];

    expect(route).toContain(`<${page} market="int" />`);
    expect(code(routeFile(slug))).toContain(`<${page} market="us" />`);
    expect(route).toContain("routing.locales.map");
    expect(route).toContain("setRequestLocale(locale)");
    expect(route).toContain(`landingPageMetadata("${slug}", locale, "int")`);
  });

  test.each(ALL_LANDING_SLUGS)("%s mounts the shell with its own slug", (slug) => {
    const shell = findTag(read(pageFile(slug)), "LandingPageShell");

    expect(shell).toBeDefined();
    expect(literalAttr(shell?.attrs ?? "", "slug")).toBe(slug);
  });

  test("a section carries its registry id, and the demo is the anchor the hero links to", () => {
    const html = renderEn(createElement(LpSection, { section: "demo", anchor: true }));
    const demo = findTag(read(shared("LpDemo")), "LpSection");

    expect(html).toContain('data-landing-section="demo"');
    expect(html).toContain('id="demo"');
    expect(literalAttr(demo?.attrs ?? "", "section")).toBe("demo");
    expect(demo?.attrs).toMatch(/\banchor\b/);
  });
});

describe("the shell (AC4)", () => {
  const shell = () => code(join(SHARED_DIR, "LandingPageShell.tsx"));

  test("mounts the tracker with the page's variant, outside the pricing provider", () => {
    const source = shell();
    const tracker = findTag(source, "LandingTracker");

    expect(tracker?.attrs).toContain("variant={page.variant}");
    expect(tracker?.attrs).toContain("locale={locale}");
    expect(source.indexOf("<LandingTracker")).toBeLessThan(source.indexOf("<RegionPricingProvider"));
  });

  test("puts the market's header, the page and the market's footer inside the provider", () => {
    const source = shell();
    const open = source.indexOf("<RegionPricingProvider");
    const close = source.indexOf("</RegionPricingProvider>");
    const order = ["<Header", "<main", "</main>", "<Footer"].map((needle) => source.indexOf(needle));

    expect(order).toEqual([...order].sort((a, b) => a - b));
    for (const at of order) {
      expect(at).toBeGreaterThan(open);
      expect(at).toBeLessThan(close);
    }
    for (const tag of openingTags(source).filter((t) => t.name === "Header" || t.name === "Footer")) {
      expect(tag.attrs).toContain("market={market}");
    }
  });

  test("starts a visitor on the market's currency and trial length, before hydration and with JavaScript off", () => {
    const provider = findTag(shell(), "RegionPricingProvider");

    expect(provider?.attrs).toContain("defaultCurrency={marketCurrency}");
    expect(provider?.attrs).toContain("defaultTrialDays={MARKETS[market].trialDays}");
    expect(code(join(SHARED_DIR, "LandingPageShell.tsx"))).toContain('MARKETS[market].currency.code.toLowerCase() === "usd" ? "usd" : "eur"');
  });
});

describe("what the pages leave out (AC3)", () => {
  test.each(ALL_LANDING_SLUGS)("%s is noindex with an English title and description", (slug) => {
    const metadata = landingPageMetadata(slug, "en", "us");
    const { meta } = pageWords(slug, "en", "us");

    expect(metadata.robots).toEqual(NOINDEX);
    expect(metadata.title).toEqual({ absolute: meta.title });
    expect(metadata.description).toBe(meta.description);
    expect(meta.title.length).toBeGreaterThan(0);
    expect(meta.description.length).toBeGreaterThan(0);
  });

  test.each(ALL_LANDING_SLUGS)("%s declares that metadata", (slug) => {
    expect(code(routeFile(slug))).toContain(`landingPageMetadata("${slug}", "en", "us")`);
  });

  test("the sitemap and llms.txt do not list them", () => {
    expect(JSON.stringify(buildSitemap())).not.toContain("landing-pages");
    expect(buildLlmsTxt()).not.toContain("landing-pages");
  });
});

describe("sign-up and contact links (AC5, AC7)", () => {
  /** `loyalty_picker` is the loyalty quiz's result, the same location as on today's loyalty programs page. */
  const ALLOWED = ["hero", "feature_cta", "final_cta", "faq_contact", "loyalty_picker"];
  /** The one component that takes its location as a prop; its callers write it as a literal. */
  const LOCATION_PROP = pageComponent("platform", "LpCtaPair");

  test("every tracked location is one the pages may use, always written as a literal", () => {
    const used: string[] = [];
    for (const file of lpFiles()) {
      for (const match of code(file).matchAll(/trackAs=(?:"([^"]+)"|\{([^}]*)\})/g)) {
        const forwarded = file === LOCATION_PROP && match[2]?.trim() === "location";
        if (!forwarded) used.push(match[1] ?? `${file}: ${match[0]}`);
      }
    }

    expect(used.length).toBeGreaterThan(0);
    expect(used.filter((location) => !ALLOWED.includes(location))).toEqual([]);
  });

  test("the CTA pair forwards a location of the same list, and its callers pass a literal", () => {
    const calls = lpFiles().flatMap((file) =>
      openingTags(read(file))
        .filter((tag) => tag.name === "LpCtaPair")
        .map((tag) => literalAttr(tag.attrs, "location")),
    );

    expect(code(LOCATION_PROP)).toContain("trackAs={location}");
    expect(calls.length).toBeGreaterThan(0);
    expect(calls.filter((location) => !ALLOWED.includes(location ?? ""))).toEqual([]);
  });

  test.each([
    [shared("LpHero"), "CTAButton", "hero"],
    [shared("LpTrialButton"), "CTAButton", "feature_cta"],
    [shared("LpFinalCta"), "CTAButton", "final_cta"],
    [pageComponent("platform", "LpAccentBand"), "CTAButton", "final_cta"],
    [shared("LpFaq"), "TrackedLink", "faq_contact"],
  ])("%s tracks its %s as %s", (file, tag, location) => {
    const link = findTag(read(file), tag);

    expect(literalAttr(link?.attrs ?? "", "trackAs")).toBe(location);
  });

  test("every page component offers the trial through LpTrialButton, never an outline button of its own", () => {
    const own = lpFiles().filter(
      (file) =>
        file !== shared("LpTrialButton") &&
        openingTags(read(file)).some((tag) => tag.name === "CTAButton" && literalAttr(tag.attrs, "variant") === "outline"),
    );

    expect(own).toEqual([]);
  });

  test("no landing page's CTAButton passes an href: every sign-up button goes to /onboarding", () => {
    const buttons = lpFiles().flatMap((file) =>
      openingTags(code(file))
        .filter((tag) => tag.name === "CTAButton")
        .map((tag) => ({ file: file.replace(ROOT, ""), href: /(?:^|\s)href=/.test(tag.attrs) })),
    );

    expect(buttons.length).toBeGreaterThanOrEqual(5);
    expect(buttons.filter(({ href }) => href)).toEqual([]);
  });

  test("hero_demo is used nowhere: it counts as a contact click in GA4 and Meta", () => {
    expect(filesWith(lpFiles(), /hero_demo/)).toEqual([]);
  });

  test("the hero's demo link is a plain anchor to #demo, at least 44px tall, shown only on a page with a demo", () => {
    const hero = code(shared("LpHero"));
    const link = openingTags(hero).find((tag) => tag.name === "a" && literalAttr(tag.attrs, "href") === "#demo");

    expect(hero.match(/href="#demo"/g)).toHaveLength(1);
    expect(link?.attrs).toMatch(/\b(?:min-)?h-11\b/);
    expect(hero).toContain("hasDemoSection(slug)");
  });

  test("the CTA pair's secondary action is a plain anchor to #demo, as tall as the primary button", () => {
    const html = renderEn(createElement(LpCtaPair, { location: "hero" }));
    const link = html.match(/<a [^>]*href="#demo"[^>]*>/)?.[0];

    expect(link).toBeDefined();
    expect(link).toContain("h-[52px]");
    expect(html).toContain(SHARED.demoLink);
  });
});

describe("the hero proof line (AC6)", () => {
  const CATALOG = (JSON.parse(read(join(ROOT, "messages", "en", "landing.json"))) as {
    variant: { metrics: { items: Array<{ value: string; label: string }> } };
  }).variant.metrics.items;

  test.each(["en", "fr", "es", "pl"])("picks the businesses and the countries figures out of the %s catalog, whatever its words", (locale) => {
    const items = (JSON.parse(read(join(ROOT, "messages", locale, "landing.json"))) as {
      variant: { metrics: { items: Array<{ value: string; label: string }> } };
    }).variant.metrics.items;

    expect(proofFigures(items)).toEqual({ businesses: items[0].value, countries: items[2].value });
    expect(items[0].value).toMatch(/120/);
    expect(items[2].value).toMatch(/25/);
  });

  test("fails loudly when a figure is gone", () => {
    expect(() => proofFigures(CATALOG.slice(0, 2))).toThrow();
  });

  test("the sentence built from the catalog is the approved one, and passes the claim guards", () => {
    const { businesses, countries } = proofFigures(CATALOG);
    const line = SHARED.proof(businesses, countries);

    expect(line).toBe("Used by 120+ businesses in 25+ countries");
    expect(line).not.toMatch(NO_CARD_CLAIM);
    expect(line).not.toMatch(WORDED_TRIAL);
  });

  test("no figure is typed into the components or the registry", () => {
    const files = [...sourceFiles(COMPONENTS_DIR), ...sourceFiles(join(ROOT, "lib", "landing-pages"))];

    expect(filesWith(files, /\b(?:120|25)\+/)).toEqual([]);
  });
});

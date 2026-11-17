/**
 * The Platform homepage and the seven pages in its style (the six features and the loyalty programs page): one
 * registry, one shell, one set of shared sections. Which sections a page renders, where its tracking sits, which CTA
 * locations it may use and what its hero says are read from the source (pages are async server components);
 * what a section frame prints is rendered. What is specific to the seven is in `previews/registry.test.ts`, and
 * where each page is served in `lib/seo/live-pages.test.ts`.
 */

import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { LpCtaPair } from "@/components/landing-pages/platform/LpCtaPair";
import { LpSection } from "@/components/landing-pages/shared/LpSection";
import { MAX_FIELD } from "../attribution/codec";
import { buildLlmsTxt } from "../llms-txt";
import { buildSitemap } from "../seo/sitemap";
import { ROOT, code, filesWith, findTag, literalAttr, openingTags, read, sourceFiles } from "../testing/jsx-source";
import {
  COMPONENTS_DIR,
  SHARED_DIR,
  lpFiles,
  pageComponent,
  pageFile,
  renderedSections,
  shared,
} from "../testing/landing-pages-source";
import { renderEn } from "../testing/render-en";
import { SHARED } from "./copy/shared";
import { ALL_LANDING_SLUGS, LANDING_PAGES, LANDING_SLUGS, landingPageMetadata, pageWords } from "./pages";
import { proofFigures } from "./proof";

describe("the registry", () => {
  test("every page is registered under its slug", () => {
    expect(Object.keys(LANDING_PAGES).sort()).toEqual([...ALL_LANDING_SLUGS].sort());
    for (const slug of ALL_LANDING_SLUGS) expect(LANDING_PAGES[slug].slug).toBe(slug);
  });

  test.each(ALL_LANDING_SLUGS)("%s lists no section twice, and never more than 13", (slug) => {
    const { sections } = LANDING_PAGES[slug];

    expect(new Set(sections).size).toBe(sections.length);
    expect(sections.length).toBeLessThanOrEqual(13);
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

  test("the homepage reports lp_platform, and the registry holds exactly the homepage and the seven pages", () => {
    expect(LANDING_PAGES.platform.variant).toBe("lp_platform");
    expect(Object.keys(LANDING_PAGES).sort()).toEqual([
      "platform",
      "platform/analytics",
      "platform/card-design",
      "platform/geolocation",
      "platform/loyalty-programs",
      "platform/mobile-scanner",
      "platform/promotional-campaigns",
      "platform/push-notifications",
    ]);
  });
});

describe("the pages", () => {
  test.each(ALL_LANDING_SLUGS)("%s has its page file", (slug) => {
    expect(existsSync(pageFile(slug))).toBe(true);
  });

  test.each(LANDING_SLUGS)("%s renders every registry section once, in registry order", (slug) => {
    expect(renderedSections(pageFile(slug))).toEqual([...LANDING_PAGES[slug].sections]);
  });

  test.each(LANDING_SLUGS)("%s prints the pricing block of its market", (slug) => {
    const pricing = findTag(code(pageFile(slug)), "PricingSection");

    expect(pricing?.attrs).toContain("market={market}");
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

describe("the shell", () => {
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

describe("what the pages say in their head", () => {
  test.each(ALL_LANDING_SLUGS)("%s has an English title and description, and no robots directive of its own", (slug) => {
    const metadata = landingPageMetadata(slug, "en", "us");
    const { meta } = pageWords(slug, "en", "us");

    expect(metadata.title).toEqual({ absolute: meta.title });
    expect(metadata.description).toBe(meta.description);
    expect(meta.title.length).toBeGreaterThan(0);
    expect(meta.description.length).toBeGreaterThan(0);
    expect(metadata).not.toHaveProperty("robots");
  });

  test("no page of the site is at a /landing-pages URL: the sitemap and llms.txt do not list one", () => {
    expect(JSON.stringify(buildSitemap())).not.toContain("landing-pages");
    expect(buildLlmsTxt()).not.toContain("landing-pages");
  });
});

describe("sign-up and contact links", () => {
  /** `loyalty_picker` is the loyalty quiz's result, the same location as on today's loyalty programs page. */
  const ALLOWED = ["hero", "feature_cta", "final_cta", "faq_contact", "loyalty_picker", "platform_program_types", "platform_apps"];
  /** The components that take their location as a prop; their callers write it as a literal. */
  const LOCATION_PROPS = [pageComponent("platform", "LpCtaPair"), shared("LpTrialButton")];
  const CALLERS = ["LpCtaPair", "LpTrialCta"];

  test("every tracked location is one the pages may use, always written as a literal", () => {
    const used: string[] = [];
    for (const file of lpFiles()) {
      for (const match of code(file).matchAll(/trackAs=(?:"([^"]+)"|\{([^}]*)\})/g)) {
        const forwarded = LOCATION_PROPS.includes(file) && match[2]?.trim() === "location";
        if (!forwarded) used.push(match[1] ?? `${file}: ${match[0]}`);
      }
    }

    expect(used.length).toBeGreaterThan(0);
    expect(used.filter((location) => !ALLOWED.includes(location))).toEqual([]);
  });

  test("the CTA pair and the trial button forward a location of the same list, and their callers pass a literal", () => {
    const calls = lpFiles().flatMap((file) =>
      openingTags(read(file))
        .filter((tag) => CALLERS.includes(tag.name))
        .map((tag) => literalAttr(tag.attrs, "location")),
    );

    for (const file of LOCATION_PROPS) expect(code(file)).toContain("trackAs={location}");
    expect(calls.length).toBeGreaterThan(0);
    expect(calls.filter((location) => !ALLOWED.includes(location ?? ""))).toEqual([]);
  });

  test.each([
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

    expect(buttons.length).toBeGreaterThanOrEqual(3);
    expect(buttons.filter(({ href }) => href)).toEqual([]);
  });

  test("hero_demo is used nowhere: it counts as a contact click in GA4 and Meta", () => {
    expect(filesWith(lpFiles(), /hero_demo/)).toEqual([]);
  });

  test("the CTA pair's secondary action is a plain anchor to #demo, as tall as the primary button", () => {
    const html = renderEn(createElement(LpCtaPair, { location: "hero" }));
    const link = html.match(/<a [^>]*href="#demo"[^>]*>/)?.[0];

    expect(link).toBeDefined();
    expect(link).toContain("h-[52px]");
    expect(html).toContain(SHARED.demoLink);
  });
});

describe("the figures the pages print from the catalog", () => {
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

  test("no figure is typed into the components or the registry", () => {
    const files = [...sourceFiles(COMPONENTS_DIR), ...sourceFiles(join(ROOT, "lib", "landing-pages"))];

    expect(filesWith(files, /\b(?:120|25)\+/)).toEqual([]);
  });
});

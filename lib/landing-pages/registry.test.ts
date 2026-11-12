/**
 * The three US landing pages (`/us/landing-pages/*`): one registry, one shell,
 * one set of shared sections. There is no component runner, so these read the
 * source: which sections a page renders and in what order, where its tracking
 * sits, which CTA locations it may use, and what its hero says.
 */

import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { MAX_FIELD } from "../attribution/codec";
import { buildLlmsTxt } from "../llms-txt";
import { NOINDEX } from "../seo/page-robots";
import { buildSitemap } from "../seo/sitemap";
import { ROOT, code, filesWith, findTag, importedFiles, literalAttr, openingTags, read, sourceFiles } from "../testing/jsx-source";
import { NO_CARD_CLAIM, WORDED_TRIAL } from "../testing/copy-claims";
import {
  COMPONENTS_DIR,
  SHARED_DIR,
  lpFiles,
  pageFile,
  renderedSections,
  shared,
} from "../testing/landing-pages-source";
import { SHARED } from "./copy/shared";
import { LANDING_PAGES, LANDING_SLUGS, hasDemoSection, landingPageMetadata } from "./pages";
import { PROOF_LABELS, proofFigures } from "./proof";

describe("the registry (AC1, AC2, AC4)", () => {
  test("lists exactly the three pages", () => {
    expect([...LANDING_SLUGS].sort()).toEqual(["features", "how-it-works", "outcomes"]);
    expect(Object.keys(LANDING_PAGES).sort()).toEqual([...LANDING_SLUGS].sort());
  });

  test.each(LANDING_SLUGS)("%s has at most 8 sections, none twice, and ends with pricing, faq and final_cta", (slug) => {
    const { sections } = LANDING_PAGES[slug];

    expect(new Set(sections).size).toBe(sections.length);
    expect(sections.length).toBeLessThanOrEqual(8);
    expect(sections.slice(-3)).toEqual(["pricing", "faq", "final_cta"]);
  });

  test("each page has its own variant, short enough for the attribution field", () => {
    const variants = LANDING_SLUGS.map((slug) => LANDING_PAGES[slug].variant);

    expect(variants.sort()).toEqual(["lp_features", "lp_howto", "lp_outcomes"]);
    expect(new Set(variants).size).toBe(3);
    for (const variant of variants) expect(variant.length).toBeLessThanOrEqual(MAX_FIELD);
  });

  test("Outcomes has no demo to link to; How-to and Features do", () => {
    expect(LANDING_SLUGS.filter(hasDemoSection).sort()).toEqual(["features", "how-it-works"]);
    expect(LANDING_PAGES.outcomes.sections).not.toContain("demo");
  });
});

describe("the routes (AC1, AC2, AC4)", () => {
  test.each(LANDING_SLUGS)("%s has its page file", (slug) => {
    expect(existsSync(pageFile(slug))).toBe(true);
  });

  test.each(LANDING_SLUGS)("%s renders every registry section once, in registry order", (slug) => {
    expect(renderedSections(pageFile(slug))).toEqual([...LANDING_PAGES[slug].sections]);
  });

  test.each(LANDING_SLUGS)("%s renders the shared FAQ and final CTA, and the US pricing block", (slug) => {
    const source = code(pageFile(slug));
    const imports = importedFiles(pageFile(slug), source);

    expect(imports.get("LpFaq")).toBe(shared("LpFaq"));
    expect(imports.get("LpFinalCta")).toBe(shared("LpFinalCta"));
    expect(imports.get("PricingSection")).toBe(join(ROOT, "components", "sections", "PricingSection.tsx"));
    expect(openingTags(source).map((tag) => tag.name)).toEqual(expect.arrayContaining(["LpFaq", "LpFinalCta"]));
    expect(literalAttr(findTag(source, "PricingSection")?.attrs ?? "", "market")).toBe("us");
  });

  test.each(LANDING_SLUGS)("%s mounts the shell with its own slug", (slug) => {
    const shell = findTag(read(pageFile(slug)), "LandingPageShell");

    expect(shell).toBeDefined();
    expect(literalAttr(shell?.attrs ?? "", "slug")).toBe(slug);
  });

  test("a section is a Container tagged with its registry id, and the demo is an anchor", () => {
    const section = code(shared("LpSection"));
    const demo = findTag(read(shared("LpDemo")), "LpSection");

    expect(section).toContain("data-landing-section={section}");
    expect(section).toContain("<Container");
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
    expect(literalAttr(tracker?.attrs ?? "", "locale")).toBe("en");
    expect(source.indexOf("<LandingTracker")).toBeLessThan(source.indexOf("<RegionPricingProvider"));
  });

  test("puts the US header, the page and the US footer inside the provider", () => {
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
      expect(literalAttr(tag.attrs, "market")).toBe("us");
    }
  });

  test("starts a visitor on US dollars and the US trial length, before hydration and with JavaScript off", () => {
    const provider = findTag(shell(), "RegionPricingProvider");

    expect(literalAttr(provider?.attrs ?? "", "defaultCurrency")).toBe("usd");
    expect(provider?.attrs).toContain("defaultTrialDays={MARKETS.us.trialDays}");
  });
});

describe("what the pages leave out (AC3)", () => {
  test.each(LANDING_SLUGS)("%s is noindex with an English title and description", (slug) => {
    const metadata = landingPageMetadata(slug);
    const { meta } = LANDING_PAGES[slug];

    expect(metadata.robots).toEqual(NOINDEX);
    expect(metadata.title).toEqual({ absolute: meta.title });
    expect(metadata.description).toBe(meta.description);
    expect(meta.title.length).toBeGreaterThan(0);
    expect(meta.description.length).toBeGreaterThan(0);
  });

  test.each(LANDING_SLUGS)("%s declares that metadata", (slug) => {
    expect(code(pageFile(slug))).toContain(`landingPageMetadata("${slug}")`);
  });

  test("the sitemap and llms.txt do not list them", () => {
    expect(JSON.stringify(buildSitemap())).not.toContain("landing-pages");
    expect(buildLlmsTxt()).not.toContain("landing-pages");
  });
});

describe("sign-up and contact links (AC5, AC7)", () => {
  const ALLOWED = ["hero", "feature_cta", "final_cta", "faq_contact"];

  test("every tracked location is one the pages may use, always written as a literal", () => {
    const used: string[] = [];
    for (const file of lpFiles()) {
      for (const match of code(file).matchAll(/trackAs=(?:"([^"]+)"|\{[^}]*\})/g)) {
        used.push(match[1] ?? `${file}: ${match[0]}`);
      }
    }

    expect(used.length).toBeGreaterThan(0);
    expect(used.filter((location) => !ALLOWED.includes(location))).toEqual([]);
  });

  test.each([
    ["LpHero", "CTAButton", "hero"],
    ["LpDemo", "CTAButton", "feature_cta"],
    ["LpFinalCta", "CTAButton", "final_cta"],
    ["LpFaq", "TrackedLink", "faq_contact"],
  ])("%s tracks its %s as %s", (component, tag, location) => {
    const link = findTag(read(shared(component)), tag);

    expect(literalAttr(link?.attrs ?? "", "trackAs")).toBe(location);
  });

  test("hero_demo is used nowhere: it counts as a contact click in GA4 and Meta", () => {
    expect(filesWith(lpFiles(), /hero_demo/)).toEqual([]);
  });

  test("the demo section offers the trial in an outline button, whatever the demo shows", () => {
    expect(literalAttr(findTag(read(shared("LpDemo")), "CTAButton")?.attrs ?? "", "variant")).toBe("outline");
  });

  test("the hero's demo link is a plain anchor to #demo, at least 44px tall", () => {
    const link = openingTags(read(shared("LpHero"))).find(
      (tag) => tag.name === "a" && literalAttr(tag.attrs, "href") === "#demo",
    );

    expect(link).toBeDefined();
    expect(link?.attrs).toMatch(/\b(?:min-)?h-11\b/);
  });

  test("the hero shows that link only on a page that has a demo", () => {
    const hero = code(shared("LpHero"));

    expect(hero.match(/href="#demo"/g)).toHaveLength(1);
    expect(hero).toMatch(/hasDemoSection\([^)]*\)\s*&&\s*\(\s*<a\b[^>]*href="#demo"/);
  });
});

describe("the hero proof line (AC6)", () => {
  const CATALOG = (JSON.parse(read(join(ROOT, "messages", "en", "landing.json"))) as {
    variant: { metrics: { items: Array<{ value: string; label: string }> } };
  }).variant.metrics.items;

  test("picks the businesses and the countries figures out of the catalog, by label", () => {
    const businesses = CATALOG.filter((item) => PROOF_LABELS.businesses.test(item.label));
    const countries = CATALOG.filter((item) => PROOF_LABELS.countries.test(item.label));

    expect(businesses).toHaveLength(1);
    expect(countries).toHaveLength(1);
    expect(proofFigures(CATALOG)).toEqual({ businesses: businesses[0].value, countries: countries[0].value });
  });

  test("does not depend on the order of the catalog, and fails loudly when a figure is gone", () => {
    expect(proofFigures([...CATALOG].reverse())).toEqual(proofFigures(CATALOG));
    expect(() => proofFigures(CATALOG.filter((item) => !/countr/i.test(item.label)))).toThrow();
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

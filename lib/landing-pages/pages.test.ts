/**
 * The three US landing pages (`/us/landing-pages/*`): one registry, one shell,
 * shared sections. There is no component runner, so these read the source:
 * which sections a page renders and in what order, where its tracking sits,
 * which CTA locations it may use, and which claims its components must carry.
 */

import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { MAX_FIELD } from "../attribution/codec";
import { buildLlmsTxt } from "../llms-txt";
import { NOINDEX } from "../seo/page-robots";
import { buildSitemap } from "../seo/sitemap";
import {
  ROOT,
  importedFiles,
  literalAttr,
  openingTags,
  read,
  sourceFiles,
  stripComments,
} from "../testing/jsx-source";
import { LANDING_PAGES, LANDING_SLUGS, hasDemoSection, landingPageMetadata, type LandingSlug } from "./pages";
import { PROOF_LABELS, proofFigures } from "./proof";

const PAGES_DIR = join(ROOT, "app", "[locale]", "us", "landing-pages");
const COMPONENTS_DIR = join(ROOT, "components", "landing-pages");
const SHARED_DIR = join(COMPONENTS_DIR, "shared");

const pageFile = (slug: LandingSlug) => join(PAGES_DIR, slug, "page.tsx");
const lpFiles = () => [...sourceFiles(COMPONENTS_DIR), ...LANDING_SLUGS.map(pageFile)];

/** The sections of each page, in the order the plan gives them. */
const PLAN_SECTIONS: Record<LandingSlug, string[]> = {
  "how-it-works": ["hero", "steps", "demo", "pricing", "faq", "final_cta"],
  features: [
    "hero",
    "demo",
    "spotlight_messages",
    "spotlight_design",
    "spotlight_analytics",
    "pricing",
    "faq",
    "final_cta",
  ],
  outcomes: [
    "hero",
    "problem",
    "outcome_return",
    "outcome_slow_days",
    "outcome_regulars",
    "pricing",
    "faq",
    "final_cta",
  ],
};

/** Every file the page renders through `components/landing-pages/`, itself included. */
function landingTree(file: string, seen = new Set<string>()): Set<string> {
  if (seen.has(file)) return seen;
  seen.add(file);
  for (const target of importedFiles(file, read(file)).values()) {
    if (target.startsWith(COMPONENTS_DIR)) landingTree(target, seen);
  }
  return seen;
}

/**
 * The section ids a file renders, in document order. A tag that names its
 * section (`section="x"`) counts as that section; one that does not is a
 * landing-pages component, and the sections inside it count at its position.
 */
function renderedSections(file: string, trail: string[] = []): string[] {
  const source = read(file);
  const components = importedFiles(file, source);
  const ids: string[] = [];
  for (const tag of openingTags(source)) {
    const id = literalAttr(tag.attrs, "section") ?? literalAttr(tag.attrs, "data-landing-section");
    const target = components.get(tag.name);
    if (id) ids.push(id);
    else if (target?.startsWith(COMPONENTS_DIR) && !trail.includes(target)) {
      ids.push(...renderedSections(target, [...trail, file]));
    }
  }
  return ids;
}

describe("the registry (AC1, AC2, AC4)", () => {
  test("lists exactly the three pages", () => {
    expect([...LANDING_SLUGS].sort()).toEqual(["features", "how-it-works", "outcomes"]);
    expect(Object.keys(LANDING_PAGES).sort()).toEqual([...LANDING_SLUGS].sort());
  });

  test.each(LANDING_SLUGS)("%s lists the plan's sections in the plan's order, at most 8, no repeats", (slug) => {
    const { sections } = LANDING_PAGES[slug];

    expect([...sections]).toEqual(PLAN_SECTIONS[slug]);
    expect(new Set(sections).size).toBe(sections.length);
    expect(sections.length).toBeLessThanOrEqual(8);
  });

  test.each(LANDING_SLUGS)("%s ends with pricing, faq and final_cta", (slug) => {
    expect(LANDING_PAGES[slug].sections.slice(-3)).toEqual(["pricing", "faq", "final_cta"]);
  });

  test("each page has its own variant, short enough for the attribution field", () => {
    const variants = LANDING_SLUGS.map((slug) => LANDING_PAGES[slug].variant);

    expect(variants.sort()).toEqual(["lp_features", "lp_howto", "lp_outcomes"]);
    expect(new Set(variants).size).toBe(3);
    for (const variant of variants) expect(variant.length).toBeLessThanOrEqual(MAX_FIELD);
  });
});

describe("the routes (AC1, AC2, AC4)", () => {
  test.each(LANDING_SLUGS)("%s has its page file", (slug) => {
    expect(existsSync(pageFile(slug))).toBe(true);
  });

  test.each(LANDING_SLUGS)("%s renders every registry section once, in registry order", (slug) => {
    expect(renderedSections(pageFile(slug))).toEqual([...LANDING_PAGES[slug].sections]);
  });

  test.each(LANDING_SLUGS)("%s renders the shared FAQ, final CTA and pricing block", (slug) => {
    const source = stripComments(read(pageFile(slug)));
    const imports = importedFiles(pageFile(slug), source);

    expect(imports.get("LpFaq")).toBe(join(SHARED_DIR, "LpFaq.tsx"));
    expect(imports.get("LpFinalCta")).toBe(join(SHARED_DIR, "LpFinalCta.tsx"));
    expect(imports.get("PricingSection")).toBe(join(ROOT, "components", "sections", "PricingSection.tsx"));
    const rendered = openingTags(source).map((tag) => tag.name);
    expect(rendered).toEqual(expect.arrayContaining(["LpFaq", "LpFinalCta", "PricingSection"]));
  });

  test.each(LANDING_SLUGS)("%s mounts the shell with its own slug", (slug) => {
    const shell = openingTags(read(pageFile(slug))).find((tag) => tag.name === "LandingPageShell");

    expect(shell).toBeDefined();
    expect(literalAttr(shell?.attrs ?? "", "slug")).toBe(slug);
  });

  test("a section is a Container inside `py-16 lg:py-24`, tagged with its id, and the demo is an anchor", () => {
    const section = stripComments(read(join(SHARED_DIR, "LpSection.tsx")));

    expect(section).toContain("data-landing-section={section}");
    expect(section).toContain("py-16 lg:py-24");
    expect(section).toContain("scroll-mt-");
    expect(section).toContain("<Container");
    expect(section).toContain("id={anchor ? section : undefined}");

    const demo = openingTags(read(join(SHARED_DIR, "LpDemo.tsx"))).find((tag) => tag.name === "LpSection");
    expect(literalAttr(demo?.attrs ?? "", "section")).toBe("demo");
    expect(demo?.attrs).toMatch(/\banchor\b/);
  });
});

describe("the shell (AC4)", () => {
  const shell = () => stripComments(read(join(SHARED_DIR, "LandingPageShell.tsx")));

  test("mounts the tracker with the page's variant, outside the pricing provider", () => {
    const source = shell();
    const tracker = openingTags(source).find((tag) => tag.name === "LandingTracker");

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
    expect(stripComments(read(pageFile(slug)))).toContain(`landingPageMetadata("${slug}")`);
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
      for (const match of stripComments(read(file)).matchAll(/trackAs=(?:"([^"]+)"|\{[^}]*\})/g)) {
        used.push(match[1] ?? `${file}: ${match[0]}`);
      }
    }

    expect(used.length).toBeGreaterThan(0);
    expect(used.filter((location) => !ALLOWED.includes(location))).toEqual([]);
  });

  test("hero_demo is used nowhere: it counts as a contact click in GA4 and Meta", () => {
    expect(lpFiles().filter((file) => stripComments(read(file)).includes("hero_demo"))).toEqual([]);
  });

  test("the hero's demo link is a plain anchor to #demo, at least 44px tall", () => {
    const link = openingTags(read(join(SHARED_DIR, "LpHero.tsx"))).find(
      (tag) => tag.name === "a" && literalAttr(tag.attrs, "href") === "#demo",
    );

    expect(link).toBeDefined();
    expect(link?.attrs).toMatch(/\b(?:min-)?h-11\b/);
  });

  test("the demo section offers the trial in an outline button, whatever the demo shows", () => {
    const cta = openingTags(read(join(SHARED_DIR, "LpDemo.tsx"))).find((tag) => tag.name === "CTAButton");

    expect(literalAttr(cta?.attrs ?? "", "trackAs")).toBe("feature_cta");
    expect(literalAttr(cta?.attrs ?? "", "variant")).toBe("outline");
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

  test("the hero reads it from variant.metrics", () => {
    const hero = stripComments(read(join(SHARED_DIR, "LpHero.tsx")));

    expect(hero).toContain('getTranslations("variant.metrics")');
    expect(hero).toContain("proofFigures(");
  });

  test("no figure is typed into the components or the registry", () => {
    const files = [...sourceFiles(COMPONENTS_DIR), ...sourceFiles(join(ROOT, "lib", "landing-pages"))];

    expect(files.filter((file) => /\b(?:120|25)\+/.test(read(file)))).toEqual([]);
  });
});

describe("dashboard captures (AC9)", () => {
  /** A file that draws a dashboard capture has to print the sample-data caption with it. */
  const missesCaption = (source: string) =>
    openingTags(source).some((tag) => tag.name === "PhoneScreenshot") && !source.includes("sampleData");

  test("the guard flags a capture without its caption and accepts one with it", () => {
    expect(missesCaption('<PhoneScreenshot src="x" alt="y" />')).toBe(true);
    expect(missesCaption('<PhoneScreenshot src="x" alt="y" />{SHARED.sampleData}')).toBe(false);
    expect(missesCaption("<IPhone />")).toBe(false);
  });

  test("every file that draws a capture prints SHARED.sampleData", () => {
    expect(lpFiles().filter((file) => missesCaption(read(file)))).toEqual([]);
  });

  test("How-to draws none", () => {
    const drawn = [...landingTree(pageFile("how-it-works"))].filter((file) =>
      openingTags(read(file)).some((tag) => tag.name === "PhoneScreenshot"),
    );

    expect(drawn).toEqual([]);
  });
});

describe("the Features page (AC5, AC9, AC10)", () => {
  const features = () => [...landingTree(pageFile("features"))];
  const code = (file: string) => stripComments(read(file));
  const filesWith = (needle: RegExp) => features().filter((file) => needle.test(code(file)));
  const tagIn = (file: string, name: string) => openingTags(read(file)).find((tag) => tag.name === name);

  /** The `<p>…</p>` that holds `needle`: the printed line the words share. */
  const lineWith = (source: string, needle: string) => {
    const at = source.indexOf(needle);
    return source.slice(source.lastIndexOf("<p", at), source.indexOf("</p>", at));
  };

  test("the hero shows the card stack with one banner from the sample café on it", () => {
    const visual = join(COMPONENTS_DIR, "features", "FeaturesHeroVisual.tsx");
    const hero = tagIn(pageFile("features"), "LpHero");

    expect(hero?.attrs).toContain("visual={<FeaturesHeroVisual");
    expect(features()).toContain(visual);
    expect(openingTags(read(visual)).filter((tag) => tag.name === "HeroCardStack")).toHaveLength(1);
    expect(code(visual).match(/<NotificationBanner \{\.\.\.lpBanner\(/g)).toHaveLength(1);
  });

  test("a broadcast is printed on one line with the plans it comes with", () => {
    const files = filesWith(/\bmessages\.broadcast\b/);

    expect(files).toEqual([join(COMPONENTS_DIR, "features", "MessagesSpotlight.tsx")]);
    expect(lineWith(code(files[0]), "messages.broadcast")).toContain("SHARED.broadcastPlans");
  });

  test("the lock screen stacks the copy's banners, still, and is cropped on a phone", () => {
    const files = filesWith(/section="spotlight_messages"/);
    const [file] = files;
    expect(files).toHaveLength(1);
    const phone = tagIn(file, "NotificationPhoneDemo");

    expect(phone?.attrs).toContain("notifications={messages.banners.map(lpBanner)}");
    expect(phone?.attrs).toContain("animate={false}");
    expect(phone?.attrs).toContain("eager={false}");
    expect(tagIn(file, "CroppedPhone")).toBeDefined();
  });

  test("the card gallery speaks with the page's heading and without its own CTA", () => {
    const gallery = filesWith(/<CardStyleGallery\b/).map((file) => tagIn(file, "CardStyleGallery"));

    expect(gallery).toHaveLength(1);
    expect(gallery[0]?.attrs).toContain("showCta={false}");
    expect(gallery[0]?.attrs).toContain("heading={");
  });

  test("the one dashboard capture is the English phone shot, captioned as sample data", () => {
    const captures = features().filter((file) => tagIn(file, "PhoneScreenshot"));

    expect(captures).toHaveLength(1);
    expect(code(captures[0])).toContain('landingShot("en", "phone")');
    expect(code(captures[0])).toContain("SHARED.sampleData");
    expect(tagIn(captures[0], "CroppedPhone")).toBeDefined();
  });
});

describe("the step-2 QR mark (AC14)", () => {
  test("no component of these pages draws a scannable code", () => {
    const offenders = sourceFiles(COMPONENTS_DIR).filter((file) => /qrcode\.react|\bQRCodeSVG\b/.test(read(file)));

    expect(offenders).toEqual([]);
  });

  test("the placard's QR is the still skeleton", () => {
    const qr = openingTags(read(join(COMPONENTS_DIR, "how-it-works", "HowSteps.tsx"))).find(
      (tag) => tag.name === "QRCodeSkeleton",
    );

    expect(qr).toBeDefined();
    expect(qr?.attrs).toContain("animated={false}");
  });
});

describe("How-to's steps (AC8)", () => {
  test("end with the one 'all you need' line, which is not a section of its own", () => {
    expect(stripComments(read(join(COMPONENTS_DIR, "how-it-works", "HowSteps.tsx")))).toContain("allYouNeed");
    expect(LANDING_PAGES["how-it-works"].sections.filter((id) => /need/.test(id))).toEqual([]);
  });
});

describe("components the pages extend keep rendering as before (AC15)", () => {
  const source = (path: string) => stripComments(read(join(ROOT, path)));

  test.each([
    ["components/features/notifications-push/NotificationPhoneDemo.tsx", ["animate = true", "eager = true", "width = 280"]],
    ["components/features/design-de-carte/CardStyleGallery.tsx", ["showCta = true", 'heading?.title ?? t("title")', 'heading?.subtitle ?? t("subtitle")']],
    ["components/ui/QRCodeSkeleton.tsx", ["animated = true"]],
    ["components/features/notifications-push/NotificationBanner.tsx", ["icon ?? (", "{body && ("]],
  ])("%s defaults to today's behaviour", (path, defaults) => {
    for (const fragment of defaults) expect(source(path)).toContain(fragment);
  });

  test.each([
    ["components/features/notifications-push/NotificationsPushPage.tsx", "<NotificationPhoneDemo />"],
    ["components/features/design-de-carte/CardDesignPageContent.tsx", "<CardStyleGallery />"],
    ["components/card/WalletCard.tsx", "<QRCodeSkeleton size={100} />"],
  ])("%s still calls it with no new prop", (path, call) => {
    expect(source(path)).toContain(call);
  });
});

describe("the Outcomes page: results, not how (STA-546 stage C)", () => {
  const OUTCOMES_DIR = join(COMPONENTS_DIR, "outcomes");
  /** A component of the page; empty when it is missing, so the pins fail on what they look for. */
  const component = (name: string) => {
    const file = join(OUTCOMES_DIR, `${name}.tsx`);
    return existsSync(file) ? stripComments(read(file)) : "";
  };
  const ownFiles = () => [pageFile("outcomes"), ...(existsSync(OUTCOMES_DIR) ? sourceFiles(OUTCOMES_DIR) : [])];
  /** The source of the file that renders the section with this id. */
  const sectionSource = (id: string) => {
    const file = [...landingTree(pageFile("outcomes"))].find((candidate) =>
      openingTags(read(candidate)).some((tag) => literalAttr(tag.attrs, "section") === id),
    );
    return file ? stripComments(read(file)) : "";
  };
  const spotlight = (source: string) => openingTags(source).find((tag) => tag.name === "LpSpotlight");
  /** Nothing between the two expressions opens or closes a block: they print on one line. */
  const shareALine = (source: string, first: string, second: string) => {
    const [a, b] = [source.indexOf(first), source.indexOf(second)];
    if (a === -1 || b === -1) return false;
    return !/<\/?(?:p|div|li|ul|ol|section|h[1-6]|br)\b/.test(source.slice(Math.min(a, b), Math.max(a, b)));
  };

  test("the page has the components of its sections", () => {
    for (const name of ["OutcomesHeroVisual", "RegularsFigure", "ReturnSpotlight", "SlowDaysSpotlight", "RegularsSpotlight"]) {
      expect({ name, found: component(name) !== "" }).toEqual({ name, found: true });
    }
  });

  test("the hero is the lock screen with the stamp notification from the first paint, and no demo link", () => {
    const hero = component("OutcomesHeroVisual");
    const phone = openingTags(hero).find((tag) => tag.name === "NotificationPhoneDemo");

    expect(phone?.attrs).toContain("animate={false}");
    expect(phone?.attrs).toMatch(/\beager\b/);
    expect(phone?.attrs).toContain("lpBanner(STAMP_BANNER)");
    expect(hasDemoSection("outcomes")).toBe(false);
    expect([...landingTree(pageFile("outcomes"))].map((file) => file.split("/").pop())).not.toContain("LpDemo.tsx");
  });

  test('the H1 keeps its no-break hyphen, so "first-time" never splits across two lines', () => {
    const { h1 } = LANDING_PAGES.outcomes.hero;

    expect(h1).toContain("first\u2011time");
    expect(h1).not.toContain("first-time");
  });

  test("the problem is one figure in the page's handwriting, with its claim and its source, on the one tinted band", () => {
    const figure = component("RegularsFigure");
    const tags = openingTags(figure);

    expect(tags.some((tag) => /\bink-figure\b/.test(tag.attrs))).toBe(true);
    for (const part of ["OUTCOMES.problem", "figure.value", "figure.text", "figure.source"]) expect(figure).toContain(part);
    expect(tags.find((tag) => tag.name === "LpSection")?.attrs).toMatch(/\btinted\b/);
    const bands = ownFiles().flatMap((file) =>
      openingTags(read(file)).filter((tag) => /\btinted\b(?!=)/.test(tag.attrs)),
    );
    expect(bands).toHaveLength(1);
  });

  // AC12: a figure from someone else is never printed without where it comes from.
  test.each([
    ["RegularsFigure", "figure.source"],
    ["ReturnSpotlight", "headStart.source"],
  ])("%s renders %s", (name, accessor) => {
    expect(component(name)).toContain(accessor);
  });

  test("the return spotlight shows the part-filled Aurevo card under the lead, then the head start", () => {
    const source = sectionSource("outcome_return");
    const card = openingTags(source).find((tag) => tag.name === "AurevoCard");

    expect(source).toContain("OUTCOMES.comeBack");
    expect(card?.attrs).toMatch(/stamps=\{[1-7]\}/);
    expect(source).toContain("headStart.text");
  });

  test("the slow-days spotlight prints the plans a broadcast comes with on the line of its fee note", () => {
    const source = sectionSource("outcome_slow_days");

    expect(source).toContain("slowDays.lead");
    expect(source).toContain("SHARED.broadcastPlans");
    expect(source).toContain("slowDays.noFees");
    expect(shareALine(source, "SHARED.broadcastPlans", "slowDays.noFees")).toBe(true);
  });

  test("the slow-days phone shows its broadcast as the sample café sends it, still", () => {
    const source = sectionSource("outcome_slow_days");
    const phone = openingTags(source).find((tag) => tag.name === "NotificationPhoneDemo");

    expect(phone?.attrs).toMatch(/lpBanner\([\w.]*slowDays\.banner\)/);
    expect(phone?.attrs).toContain("animate={false}");
  });

  test("the regulars spotlight shows the capture with its caption, then the example on one line", () => {
    const source = sectionSource("outcome_regulars");

    expect(source).toContain('landingShot("en", "phone")');
    expect(source).toContain("SHARED.sampleData");
    expect(shareALine(source, "example.label", "example.text")).toBe(true);
  });

  test("the spotlights alternate sides: right, left, right", () => {
    const sides = ["outcome_return", "outcome_slow_days", "outcome_regulars"].map(
      (id) => literalAttr(spotlight(sectionSource(id))?.attrs ?? "", "side") ?? "right",
    );

    expect(sides).toEqual(["right", "left", "right"]);
  });

  // The capture crops inside its own figure, so "Sample data" prints under the cut and stays visible.
  test("tall devices are cropped on a phone", () => {
    for (const id of ["outcome_slow_days", "outcome_regulars"]) {
      expect({ id, cropped: /\bcropOnPhone\b|max-h-\[420px\]/.test(sectionSource(id)) }).toEqual({ id, cropped: true });
    }
  });

  test("every notification on the page is the sample café's, through lpBanner", () => {
    for (const file of ownFiles()) {
      const source = stripComments(read(file));
      if (openingTags(source).some((tag) => tag.name === "NotificationPhoneDemo" || tag.name === "NotificationBanner")) {
        expect({ file, viaLpBanner: source.includes("lpBanner(") }).toEqual({ file, viaLpBanner: true });
      }
    }
  });
});

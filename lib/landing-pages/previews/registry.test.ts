/**
 * The five feature previews under `/us/landing-pages/platform/*`: Platform-style
 * pages Harry compares with today's `/en/features/*`. They are English, noindex
 * and reachable by URL only, each with its own tracking variant and the sections
 * the UX brief gives it, ending on the cream card and the links to its siblings.
 *
 * A page is built in two steps: the foundation gives it its hero, its closing card
 * and a `TODO(STA-552 builder)` where the middle goes, and its builder removes the
 * marker. While the marker is there the section-order test is a `todo` and a lighter
 * one checks what the page renders so far; the moment it goes, the full test is armed.
 */

import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { buildLlmsTxt } from "../../llms-txt";
import { buildSitemap } from "../../seo/sitemap";
import { hidesLanguageSwitcher } from "../../routing/language-switcher";
import { NOINDEX } from "../../seo/page-robots";
import { code, findTag, literalAttr, openingTags, read } from "../../testing/jsx-source";
import { pageFile, renderedSections } from "../../testing/landing-pages-source";
import { LANDING_PAGES, PREVIEW_SLUGS, hasDemoSection, landingPageMetadata, type PreviewSlug } from "../pages";
import { ANALYTICS_PREVIEW } from "../copy/previews/analytics";
import { CARD_DESIGN_PREVIEW } from "../copy/previews/card-design";
import { MOBILE_SCANNER_PREVIEW } from "../copy/previews/mobile-scanner";
import { PROMOTIONAL_CAMPAIGNS_PREVIEW } from "../copy/previews/promotional-campaigns";
import { PUSH_NOTIFICATIONS_PREVIEW } from "../copy/previews/push-notifications";

/** The sections of each preview, in the UX brief's order. */
const SECTIONS: Record<PreviewSlug, string[]> = {
  "platform/card-design": ["hero", "icons", "playground", "anatomy", "numbers", "stamps", "wallets", "faq", "final_cta", "related"],
  "platform/mobile-scanner": ["hero", "how", "counter", "ways", "team", "demo", "final_cta", "related"],
  "platform/push-notifications": ["hero", "how", "moments", "wallets", "wording", "demo", "final_cta", "related"],
  "platform/analytics": ["hero", "glance", "questions", "activity", "numbers", "final_cta", "related"],
  "platform/promotional-campaigns": ["hero", "numbers", "how", "ideas", "delivery", "plans", "faq", "final_cta", "related"],
};

const COPY = {
  "platform/card-design": CARD_DESIGN_PREVIEW,
  "platform/mobile-scanner": MOBILE_SCANNER_PREVIEW,
  "platform/push-notifications": PUSH_NOTIFICATIONS_PREVIEW,
  "platform/analytics": ANALYTICS_PREVIEW,
  "platform/promotional-campaigns": PROMOTIONAL_CAMPAIGNS_PREVIEW,
} as const;

/** What a builder has not written yet: the marker the foundation leaves where a page's middle goes. */
const MARKER = "TODO(STA-552 builder)";
const staged = (slug: PreviewSlug) => read(pageFile(slug)).includes(MARKER);

describe("the registry (AC1)", () => {
  test("lists the five previews", () => {
    expect([...PREVIEW_SLUGS]).toEqual(Object.keys(SECTIONS));
  });

  test.each(PREVIEW_SLUGS)("%s lists the brief's sections, in the brief's order", (slug) => {
    expect([...LANDING_PAGES[slug].sections]).toEqual(SECTIONS[slug]);
  });

  test.each(PREVIEW_SLUGS)("%s is tracked as lp_platform_<feature>, one variant of its own", (slug) => {
    const variant = `lp_${slug.replace("/", "_").replaceAll("-", "_")}`;

    expect(LANDING_PAGES[slug].variant).toBe(variant);
    expect(variant).toMatch(/^lp_platform_[a-z_]+$/);
  });

  test.each(PREVIEW_SLUGS)("%s ends with the cream card, then the links to its siblings", (slug) => {
    expect(LANDING_PAGES[slug].sections.slice(-2)).toEqual(["final_cta", "related"]);
  });

  test("only card design and campaigns have a FAQ, and it comes right before the closing card", () => {
    const withFaq = PREVIEW_SLUGS.filter((slug) => LANDING_PAGES[slug].sections.includes("faq"));

    expect(withFaq).toEqual(["platform/card-design", "platform/promotional-campaigns"]);
    for (const slug of withFaq) expect(LANDING_PAGES[slug].sections.slice(-3)).toEqual(["faq", "final_cta", "related"]);
  });

  test.each(PREVIEW_SLUGS)("%s has no pricing block, sectors, blog or marquee: a feature page exits to the next feature", (slug) => {
    for (const id of ["pricing", "sectors", "blog", "marquee"]) expect(LANDING_PAGES[slug].sections).not.toContain(id);
  });

  test("a live demo is on the scanner and notifications previews only", () => {
    expect(PREVIEW_SLUGS.filter(hasDemoSection)).toEqual(["platform/mobile-scanner", "platform/push-notifications"]);
  });

  test.each(PREVIEW_SLUGS)("%s takes its head, hero and closing card from its copy", (slug) => {
    const page = LANDING_PAGES[slug];

    expect(page.meta).toBe(COPY[slug].meta);
    expect(page.hero).toBe(COPY[slug].hero);
    expect(page.finalCta).toBe(COPY[slug].band);
    expect(page.hero.eyebrow?.length ?? 0).toBeGreaterThan(0);
    expect(page.hero.sub?.length ?? 0).toBeGreaterThan(0);
  });

  test.each(PREVIEW_SLUGS)("%s links to three of its siblings, never to itself and never to a live feature page", (slug) => {
    const { related } = LANDING_PAGES[slug];

    expect(related).toHaveLength(3);
    expect(new Set(related).size).toBe(3);
    for (const sibling of related ?? []) {
      expect(sibling).not.toBe(slug);
      expect(PREVIEW_SLUGS).toContain(sibling);
    }
  });

  test("the four original pages have no sibling links", () => {
    expect(LANDING_PAGES.platform.related).toBeUndefined();
  });
});

describe("the routes (AC1, AC4)", () => {
  test.each(PREVIEW_SLUGS)("%s has its own page next to Platform's, and no layout wraps them", (slug) => {
    expect(existsSync(pageFile(slug))).toBe(true);
    expect(existsSync(pageFile("platform").replace("page.tsx", "layout.tsx"))).toBe(false);
  });

  test.each(PREVIEW_SLUGS)("%s is English only, with its own metadata and the shell for its slug", (slug) => {
    const source = code(pageFile(slug));
    const shell = findTag(source, "LandingPageShell");

    expect(source).toContain(`landingPageMetadata("${slug}")`);
    expect(source).toMatch(/generateStaticParams\(\)\s*\{\s*return \[\{ locale: "en" \}\];/);
    expect(source).toContain('setRequestLocale("en")');
    expect(literalAttr(shell?.attrs ?? "", "slug")).toBe(slug);
  });

  test.each(PREVIEW_SLUGS)("%s is noindex", (slug) => {
    expect(landingPageMetadata(slug).robots).toEqual(NOINDEX);
  });

  test.each(PREVIEW_SLUGS)("%s is not in the sitemap or llms.txt", (slug) => {
    expect(JSON.stringify(buildSitemap())).not.toContain(slug);
    expect(buildLlmsTxt()).not.toContain(slug);
  });

  test.each(PREVIEW_SLUGS)("%s hides the language switcher", (slug) => {
    expect(hidesLanguageSwitcher(`/us/landing-pages/${slug}`)).toBe(true);
  });

  for (const slug of PREVIEW_SLUGS) {
    if (staged(slug)) {
      test.todo(`${slug}: renders every registry section once, in registry order (its builder adds the middle)`);
      test(`${slug}: renders the sections it has so far once each, in registry order, and ends on the cream card and the links`, () => {
        const rendered = renderedSections(pageFile(slug));
        const expected = LANDING_PAGES[slug].sections.filter((id) => rendered.includes(id));

        expect(rendered).toEqual(expected);
        expect(rendered).toEqual(expect.arrayContaining(["hero", "final_cta", "related"]));
        expect(rendered.slice(-2)).toEqual(["final_cta", "related"]);
      });
    } else {
      test(`${slug}: renders every registry section once, in registry order`, () => {
        expect(renderedSections(pageFile(slug))).toEqual([...LANDING_PAGES[slug].sections]);
      });
    }
  }

  test("the marker is the only thing that stages a page: a page that has it still ends with the foundation's two sections", () => {
    for (const slug of PREVIEW_SLUGS.filter(staged)) {
      const tags = openingTags(code(pageFile(slug))).map((tag) => tag.name);

      expect(tags).toContain("LpAccentBand");
      expect(tags).toContain("RelatedPreviews");
    }
  });
});

describe("the hero's second action (AC4)", () => {
  /** A page with no demo cannot send "Try it on your phone" to #demo: it names its own anchor or has none. */
  test.each(PREVIEW_SLUGS.filter((slug) => !hasDemoSection(slug)))("%s does not link to a demo it does not have", (slug) => {
    const source = read(pageFile(slug));

    expect(source).toMatch(/secondary=/);
    expect(code(pageFile(slug))).not.toContain('href: "#demo"');
  });

  test("card design's second button jumps to its designer, and that section is an anchor the page has", () => {
    const source = read(pageFile("platform/card-design"));

    expect(source).toContain('href: "#playground"');
    expect(LANDING_PAGES["platform/card-design"].sections).toContain("playground");
  });

  test("analytics and campaigns have a single trial button: no demo, no second action", () => {
    for (const slug of ["platform/analytics", "platform/promotional-campaigns"] as const) {
      expect(findTag(code(pageFile(slug)), "PreviewHero")?.attrs).toMatch(/\bsecondary=\{null\}/);
    }
  });
});

describe("the heroes the foundation gives each page (AC1)", () => {
  const tag = (slug: PreviewSlug, name: string) => findTag(code(pageFile(slug)), name);

  test("card design deals its own seven cards into Platform's fan and sends its second button to the designer", () => {
    const hero = tag("platform/card-design", "PlatformHero");

    expect(literalAttr(hero?.attrs ?? "", "slug")).toBe("platform/card-design");
    expect(hero?.attrs).toMatch(/\bslots=\{CARD_DESIGN_FAN_SLOTS\}/);
    expect(hero?.attrs).toMatch(/\bsecondary=\{\{ label: CARD_DESIGN_PREVIEW\.designerLink, href: "#playground" \}\}/);
  });

  test("the scanner shows the real Scanner loop, cut on a phone, first paint eager", () => {
    const source = code(pageFile("platform/mobile-scanner"));

    expect(tag("platform/mobile-scanner", "PreviewHero")?.attrs).toContain("visual=");
    expect(findTag(source, "ScannerLoop")?.attrs).toMatch(/\beager\b/);
    expect(findTag(source, "PhoneCrop")?.attrs).toMatch(/height=\{440\}/);
  });

  test("notifications show Aurevo's stamp and reward banners from the first paint, not an animation that starts empty", () => {
    const source = code(pageFile("platform/push-notifications"));
    const phone = findTag(source, "NotificationPhoneDemo");

    expect(phone?.attrs).toMatch(/\banimate=\{false\}/);
    expect(phone?.attrs).toMatch(/\beager\b/);
    expect(phone?.attrs).toContain("lpBanner(STAMP_BANNER)");
    expect(phone?.attrs).toContain("lpBanner(REWARD_BANNER)");
  });

  test("analytics shows the dashboard on a computer and a phone, with no caption, over a single trial button", () => {
    const duo = tag("platform/analytics", "DashboardDuo");

    expect(duo?.attrs).toMatch(/\bcaption=\{false\}/);
    expect(duo?.attrs).toMatch(/\bpriority\b/);
  });

  test("broadcasts show Aurevo's broadcast over the stamp banner, and the plans chip beside the eyebrow", () => {
    const source = code(pageFile("platform/promotional-campaigns"));
    const phone = findTag(source, "NotificationPhoneDemo");

    expect(phone?.attrs).toMatch(/\banimate=\{false\}/);
    expect(phone?.attrs).toContain("lpBanner(");
    expect(tag("platform/promotional-campaigns", "PreviewHero")?.attrs).toContain("eyebrowPlan={PROMOTIONAL_CAMPAIGNS_PREVIEW.plan}");
  });

  test.each(PREVIEW_SLUGS)("%s closes with its own cream card, then the sibling links for its own slug", (slug) => {
    const source = code(pageFile(slug));

    expect(findTag(source, "LpAccentBand")?.attrs).toMatch(/\bcopy=\{[A-Z_]+_PREVIEW\.band\}/);
    expect(literalAttr(findTag(source, "RelatedPreviews")?.attrs ?? "", "slug")).toBe(slug);
    expect(source.indexOf("<LpAccentBand")).toBeLessThan(source.indexOf("<RelatedPreviews"));
  });
});

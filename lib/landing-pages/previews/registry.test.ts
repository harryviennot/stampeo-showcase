/**
 * The five feature previews under `/us/landing-pages/platform/*`: Platform-style
 * pages that sit beside today's `/en/features/*`. They are English, noindex and
 * reachable by URL only, each with its own tracking variant and the sections of
 * its registry entry, ending on the cream card and the links to its siblings.
 * What each page renders is in `pages.test.tsx`.
 */

import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { buildLlmsTxt } from "../../llms-txt";
import { buildSitemap } from "../../seo/sitemap";
import { hidesLanguageSwitcher } from "../../routing/language-switcher";
import { NOINDEX } from "../../seo/page-robots";
import { code, findTag, literalAttr } from "../../testing/jsx-source";
import { pageFile, renderedSections } from "../../testing/landing-pages-source";
import { LANDING_PAGES, LANDING_SLUGS, PREVIEW_SLUGS, hasDemoSection, landingPageMetadata } from "../pages";
import { ANALYTICS_PREVIEW } from "../copy/previews/analytics";
import { CARD_DESIGN_PREVIEW } from "../copy/previews/card-design";
import { MOBILE_SCANNER_PREVIEW } from "../copy/previews/mobile-scanner";
import { PROMOTIONAL_CAMPAIGNS_PREVIEW } from "../copy/previews/promotional-campaigns";
import { PUSH_NOTIFICATIONS_PREVIEW } from "../copy/previews/push-notifications";

const COPY = {
  "platform/card-design": CARD_DESIGN_PREVIEW,
  "platform/mobile-scanner": MOBILE_SCANNER_PREVIEW,
  "platform/push-notifications": PUSH_NOTIFICATIONS_PREVIEW,
  "platform/analytics": ANALYTICS_PREVIEW,
  "platform/promotional-campaigns": PROMOTIONAL_CAMPAIGNS_PREVIEW,
} as const;

describe("the registry (AC1)", () => {
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

  test.each(LANDING_SLUGS)("the earlier page %s has no sibling links", (slug) => {
    expect(LANDING_PAGES[slug].related).toBeUndefined();
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

  test.each(PREVIEW_SLUGS)("%s renders every registry section once, in registry order", (slug) => {
    expect(renderedSections(pageFile(slug))).toEqual([...LANDING_PAGES[slug].sections]);
  });
});

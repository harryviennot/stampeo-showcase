/**
 * The six previews as a visitor receives them: each page's body rendered whole,
 * its async sections resolved. What no section can show on its own is here: the
 * sections in the registry's order, the hairlines around the figures, what a
 * Platform-style page leaves out, the phone-sized tap targets, and the walk from
 * one preview to the next.
 */

import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { openingTags, read, sourceFiles } from "../../testing/jsx-source";
import { PREVIEWS_DIR, pageFile } from "../../testing/landing-pages-source";
import { PREVIEW_COPY as COPY } from "../../testing/landing-copy";
import { renderPreviewPage, sectionsOf, tapTargets } from "../../testing/preview-page";
import { expectInOrder, pictures, textOf } from "../../testing/render-en";
import { scannerLoopFiles } from "@/lib/videos/scanner-loop";
import { CARD_DESIGN_PREVIEW } from "../copy/previews/card-design";
import { GEOLOCATION_PREVIEW } from "../copy/previews/geolocation";
import { MOBILE_SCANNER_PREVIEW } from "../copy/previews/mobile-scanner";
import { PROMOTIONAL_CAMPAIGNS_PREVIEW } from "../copy/previews/promotional-campaigns";
import { REWARD_BANNER, SHARED, STAMP_BANNER } from "../copy/shared";
import { LANDING_PAGES, PREVIEW_SLUGS, hasDemoSection, type PreviewSlug } from "../pages";
import { FEATURE_PREVIEWS } from "../preview-nav";

/** A section id as its copy is keyed: `blind_spots` is `blindSpots`. */
const copyKey = (id: string) => id.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());

/** Each section of a preview whose copy has an eyebrow and a title: its header. */
const HEADERS = PREVIEW_SLUGS.flatMap((slug) =>
  LANDING_PAGES[slug].sections.flatMap((id) => {
    const part = (COPY[slug] as Record<string, { eyebrow?: string; title?: string; lead?: string }>)[copyKey(id)];

    return part?.eyebrow && part.title ? [[slug, id, part.eyebrow, part.title, part.lead ?? ""] as const] : [];
  }),
);

/** The registry sections that are not headed sections: the page's frame, the FAQ and the demo (headed on their own), and the icons strip (a figure with a label). */
const NOT_HEADED = ["hero", "faq", "demo", "icons", "final_cta", "related"];

describe("every section opens on its header", () => {
  test.each(PREVIEW_SLUGS)("%s: every section of the registry but the frame, the FAQ, the demo and the icons strip has a header to check", (slug) => {
    expect(HEADERS.filter(([page]) => page === slug).map(([, id]) => id)).toEqual(LANDING_PAGES[slug].sections.filter((id) => !NOT_HEADED.includes(id)));
  });

  test.each(HEADERS)("%s: %s opens on its eyebrow, its title and its lead, centred", async (slug, id, eyebrow, title, lead) => {
    const section = sectionsOf(await renderPreviewPage(slug)).find((candidate) => candidate.id === id)?.html ?? "";

    expectInOrder(section, [eyebrow, title, ...(lead ? [lead] : [])]);
    expect(section).toContain("text-center");
  });
});

describe("the page as a whole", () => {
  /** A figures row sits between two hairlines, as Platform's does, and a page with none has no hairline. */
  test.each(PREVIEW_SLUGS)("%s: hairlines run above and below its figures, or nowhere", async (slug) => {
    const html = await renderPreviewPage(slug);
    const figures = html.indexOf('data-landing-section="numbers"');
    const rules = [...html.matchAll(/<hr\b/g)].map((rule) => rule.index);

    if (!LANDING_PAGES[slug].sections.includes("numbers")) return expect(rules).toEqual([]);
    expect(rules).toHaveLength(2);
    expect(rules[0]).toBeLessThan(figures);
    expect(rules[1]).toBeGreaterThan(figures);
  });
});

describe("what a Platform-style page leaves out", () => {
  test.each(PREVIEW_SLUGS)("%s: no Every plan chip, no Sample data caption, no em dash, no unfilled token, no city", async (slug) => {
    const text = textOf(await renderPreviewPage(slug));

    expect(text).not.toMatch(/Every plan|Sample data|—|\{trialDays\}|\bParis\b|\bGMT\b/);
  });

  test.each(PREVIEW_SLUGS)("%s: no lock screen or notification shown is sent by Stampeo", async (slug) => {
    const notifications = pictures(await renderPreviewPage(slug)).filter((name) => /lock screen|notification/i.test(name));

    expect(notifications.filter((name) => /stampeo/i.test(name))).toEqual([]);
  });

  /** The Scanner loop's first frame is the video's start: only the scanner hero plays it; elsewhere the Scanner is its finished stamp. */
  test.each(PREVIEW_SLUGS)("%s: the Scanner loop plays in the scanner hero only", async (slug) => {
    const first = scannerLoopFiles("en").first;
    const plays = ((await renderPreviewPage(slug)).match(/<img\b[^>]*\bsrc="[^"]*/g) ?? []).filter((img) => img.includes(first));

    expect(plays).toHaveLength(slug === "platform/mobile-scanner" ? 1 : 0);
  });

  test.each(PREVIEW_SLUGS.filter(hasDemoSection))("%s: the live demo is centred under the copy's own label", async (slug) => {
    const demo = sectionsOf(await renderPreviewPage(slug)).find(({ id }) => id === "demo")?.html ?? "";

    expectInOrder(demo, [(COPY[slug] as { demo: { eyebrow: string } }).demo.eyebrow]);
    expect(demo).toContain("text-center");
  });

  test.each(PREVIEW_SLUGS)("%s: sends a visitor to its demo only when it has one", async (slug) => {
    const html = await renderPreviewPage(slug);

    expect(/href="#demo"/.test(html)).toBe(hasDemoSection(slug) && html.includes('id="demo"'));
  });

  /** A trial button is the kit's tracked one (a pair, a trial button or the cream card), never a bare `CTAButton`. */
  test.each(PREVIEW_SLUGS)("%s: brings no sign-up button of its own", (slug) => {
    const folder = join(PREVIEWS_DIR, slug.replace("platform/", ""));
    const bare = [pageFile(slug), ...sourceFiles(folder)].filter((file) => openingTags(read(file)).some((tag) => tag.name === "CTAButton"));

    expect(bare).toEqual([]);
  });
});

describe("the hero each page opens with (AC1)", () => {
  const hero = async (slug: PreviewSlug) => sectionsOf(await renderPreviewPage(slug)).find(({ id }) => id === "hero")?.html ?? "";
  const links = (html: string) => [...html.matchAll(/<a [^>]*href="([^"]+)"/g)].map((match) => match[1]);

  test("card design opens on one card that takes on the look of six shops, and sends its second button to the designer, which is on the page", async () => {
    const html = await renderPreviewPage("platform/card-design");

    expect(pictures(await hero("platform/card-design"))).toEqual([CARD_DESIGN_PREVIEW.reskin.alt]);
    expect(textOf(await hero("platform/card-design"))).toContain(CARD_DESIGN_PREVIEW.reskin.captions[0]);
    expect(links(await hero("platform/card-design"))).toContain("#playground");
    expect(html).toContain('id="playground"');
  });

  test("the scanner shows the real Scanner loop from the first paint beside the web scanner, the finished stamp being the only other frame the page uses", async () => {
    const html = await hero("platform/mobile-scanner");

    expect(html).toContain(scannerLoopFiles("en").first);
    expect(pictures(html)).toEqual([MOBILE_SCANNER_PREVIEW.hero.alt, expect.stringMatching(/Scanner app adding a stamp/)]);
  });

  test("notifications show Aurevo's stamp banner and reward banner from the first paint", async () => {
    const text = textOf(await hero("platform/push-notifications"));

    expectInOrder(text, ["Aurevo", STAMP_BANNER.body, "Aurevo", REWARD_BANNER.body]);
  });

  test("geolocation says it is coming soon in its headline, over a trial button and the way to its steps, and has no demo", async () => {
    const html = await hero("platform/geolocation");

    expectInOrder(html, [GEOLOCATION_PREVIEW.hero.accent, GEOLOCATION_PREVIEW.hero.sub, SHARED.cta]);
    expect(GEOLOCATION_PREVIEW.hero.h1).toMatch(/coming soon/i);
    expect(links(html)).toEqual(["/en/onboarding", "#how"]);
  });

  test("analytics shows its key-numbers card, over the trial button and a link down to its charts, which are on the page", async () => {
    const html = await hero("platform/analytics");

    expect(pictures(html)).toEqual([COPY["platform/analytics"].hero.alt]);
    expect(html).not.toMatch(/en-desktop|en-phone/);
    expect(textOf(html)).not.toContain(SHARED.sampleData);
    expect(links(html)).toEqual(["/en/onboarding", "#charts"]);
    expect(await renderPreviewPage("platform/analytics")).toContain('id="charts"');
  });

  test("broadcasts show Aurevo's broadcast over the stamp banner", async () => {
    const text = textOf(await hero("platform/promotional-campaigns"));

    expectInOrder(text, [LANDING_PAGES["platform/promotional-campaigns"].hero.accent, PROMOTIONAL_CAMPAIGNS_PREVIEW.heroBanner.body, STAMP_BANNER.body]);
    expect(links(await hero("platform/promotional-campaigns"))).toEqual(["/en/onboarding"]);
  });

  test.each(PREVIEW_SLUGS)("%s closes with its own cream card, then the links to its siblings", async (slug) => {
    const html = await renderPreviewPage(slug);
    const { finalCta } = LANDING_PAGES[slug];
    const closing = sectionsOf(html).filter(({ id }) => id === "final_cta" || id === "related");

    expect(closing.map(({ id }) => id)).toEqual(["final_cta", "related"]);
    expectInOrder(closing[0].html, [finalCta.accent, finalCta.sub ?? "", SHARED.cta]);
    expect(links(closing[1].html)).toEqual((LANDING_PAGES[slug].related ?? []).map((sibling) => `/us/landing-pages/${sibling}`));
  });
});

describe("on a phone (AC5)", () => {
  /** A target is at least 44px when its classes say so, or it is stretched over its whole row or card. */
  const TALL = ["min-h-11", "min-h-14", "h-11", "h-12", "h-[52px]", "py-4"];
  const isTall = (attrs: string) =>
    (/class="([^"]*)"/.exec(attrs)?.[1] ?? "").split(/\s+/).some((token) => TALL.includes(token) || /^after:-?inset-/.test(token));

  test.each(PREVIEW_SLUGS)("%s: every link and button has a name, and every one outside the shared demo is 44px to tap", async (slug) => {
    const html = await renderPreviewPage(slug);
    const mine = sectionsOf(html)
      .filter(({ id }) => id !== "demo")
      .map((section) => section.html)
      .join("\n");

    expect(tapTargets(mine).length).toBeGreaterThan(3);
    expect(tapTargets(html).filter(({ name }) => name === "")).toEqual([]);
    expect(tapTargets(mine).filter(({ attrs }) => !isTall(attrs))).toEqual([]);
  });

  test.each(PREVIEW_SLUGS)("%s: every picture has a name a screen reader can read", async (slug) => {
    const pictures = (await renderPreviewPage(slug)).match(/<[a-z]+\b[^>]*\brole="img"[^>]*>/g) ?? [];

    expect(pictures.length).toBeGreaterThan(0);
    for (const tag of pictures) expect(tag).toMatch(/aria-label="[^"]{12,}"/);
  });

  test.each(PREVIEW_SLUGS.filter((slug) => LANDING_PAGES[slug].sections.includes("faq")))("%s: each question of the FAQ table is a 56px row", async (slug) => {
    const faq = sectionsOf(await renderPreviewPage(slug)).find(({ id }) => id === "faq")?.html ?? "";
    const rows = faq.match(/<summary\b[^>]*>/g) ?? [];

    expect(rows).toHaveLength((COPY[slug] as { faq: { items: unknown[] } }).faq.items.length);
    for (const row of rows) expect(row).toContain("min-h-14");
  });
});

describe("walking the previews", () => {
  /** The previews a page's closing links lead to, as the hrefs say. */
  const linksOf = async (slug: PreviewSlug) => {
    const related = sectionsOf(await renderPreviewPage(slug)).find(({ id }) => id === "related")?.html ?? "";

    return [...related.matchAll(/<a [^>]*href="([^"]+)"/g)].map((match) => match[1]);
  };

  /** Geolocation is reached from the menus of Platform and its previews, not from a sibling's closing links. */
  const FROM_THE_MENU: readonly PreviewSlug[] = ["platform/geolocation"];

  test("every preview is reached from a sibling or from the menu, and every card goes to a preview's own URL", async () => {
    const links = await Promise.all(PREVIEW_SLUGS.map(async (slug) => [slug, await linksOf(slug)] as const));
    const reached = new Set(links.flatMap(([, hrefs]) => hrefs));

    for (const [slug, hrefs] of links) {
      expect(hrefs).toHaveLength(3);
      for (const href of hrefs) expect(PREVIEW_SLUGS.map((sibling) => `/us/landing-pages/${sibling}`)).toContain(href);
      expect(hrefs).not.toContain(`/us/landing-pages/${slug}`);
    }
    for (const slug of PREVIEW_SLUGS.filter((candidate) => !FROM_THE_MENU.includes(candidate))) {
      expect(reached).toContain(`/us/landing-pages/${slug}`);
    }
    for (const slug of FROM_THE_MENU) {
      expect(reached).not.toContain(`/us/landing-pages/${slug}`);
      expect(Object.values(FEATURE_PREVIEWS)).toContain(slug);
    }
  });

  test("starting from any preview, a visitor can reach every other one by following the links, the menu-only ones aside", async () => {
    const graph = new Map(await Promise.all(PREVIEW_SLUGS.map(async (slug) => [`/us/landing-pages/${slug}`, await linksOf(slug)] as const)));
    const menuOnly = FROM_THE_MENU.map((slug) => `/us/landing-pages/${slug}`);

    for (const start of graph.keys()) {
      const seen = new Set([start]);
      for (const page of seen) for (const href of graph.get(page) ?? []) seen.add(href);

      expect([...seen].sort()).toEqual([...graph.keys()].filter((page) => page === start || !menuOnly.includes(page)).sort());
    }
  });
});

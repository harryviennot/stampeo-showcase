/**
 * The Platform page (`/us/landing-pages/platform`, after passentry.com's
 * homepage): what each of its sections promises a visitor. The server
 * components that only compose (hero, deliver, numbers, how) are read as
 * source, since there is no component runner; the ones that carry behaviour
 * of their own (program rows, the platform toggle, the share tree and the
 * blog block) are rendered on the server, which is what a visitor gets first
 * and what a phone or a reader who asks for less motion keeps.
 */

import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { LpBlogPosts } from "@/components/landing-pages/platform/LpBlogPosts";
import { BUSINESS_TYPE_ICONS } from "@/components/landing-pages/platform/TypeMarquee";
import { PlatformToggleCard } from "@/components/landing-pages/platform/PlatformToggleCard";
import { ProgramTypeRows } from "@/components/landing-pages/platform/ProgramTypeRows";
import { SHARE_ICONS, ShareTree } from "@/components/landing-pages/platform/ShareTree";
import { getAllPosts } from "../blog";
import { code, findTag, literalAttr, openingTags, read, sourceFiles } from "../testing/jsx-source";
import { COMPONENTS_DIR, pageFile } from "../testing/landing-pages-source";
import { renderEn, textOf } from "../testing/render-en";
import { PLATFORM } from "./copy/platform";
import { PROGRAM_TYPES } from "./copy/program-types";
import { SHARED } from "./copy/shared";

const PLATFORM_DIR = join(COMPONENTS_DIR, "platform");
const platformFile = (name: string) => join(PLATFORM_DIR, `${name}.tsx`);
const PLATFORM_FILES = () => [pageFile("platform"), ...sourceFiles(PLATFORM_DIR)];

describe("every section header is an eyebrow, a centred title and a lead", () => {
  /** Where each header's small label comes from; the blog block is the one left-aligned header. */
  const EYEBROWS: Record<string, string> = {
    deliver: "PLATFORM.deliver.eyebrow",
    numbers: "PLATFORM.numbers.eyebrow",
    how: "PLATFORM.how.eyebrow",
    demo: "PLATFORM.demo.eyebrow",
    program_types: "PLATFORM.programTypes.eyebrow",
    platform: "PLATFORM.platform.eyebrow",
    share: "PLATFORM.share.eyebrow",
    blog: "PLATFORM.blog.eyebrow",
  };

  /**
   * The header-bearing tags of the page and its components, in source order: a section frame, the demo or a bare
   * heading, with an eyebrow. A heading belongs to the section frame above it in its file.
   */
  const headers = () =>
    PLATFORM_FILES().flatMap((file) => {
      let frame = "?";
      return openingTags(read(file)).flatMap((tag) => {
        if (tag.name === "LpSection" && literalAttr(tag.attrs, "section")) frame = literalAttr(tag.attrs, "section") ?? "?";
        if (!["LpSection", "LpDemo", "LpHeading"].includes(tag.name) || !/(?:^|\s)eyebrow=/.test(tag.attrs)) return [];
        return [
          {
            section: tag.name === "LpDemo" ? "demo" : frame,
            eyebrow: /eyebrow=\{([^}]*)\}/.exec(tag.attrs)?.[1].trim(),
            align: literalAttr(tag.attrs, "align"),
          },
        ];
      });
    });

  test("each section's label is its own line of the copy, and the sectors carry theirs", () => {
    const found = Object.fromEntries(headers().map(({ section, eyebrow }) => [section, eyebrow]));

    expect(found).toEqual(EYEBROWS);
    expect(code(pageFile("platform"))).toContain("<LpSectors eyebrow={SHARED.sectorsEyebrow}");
    expect(SHARED.sectorsEyebrow.length).toBeGreaterThan(0);
  });

  test("they are centred over their pictures, except the blog's", () => {
    for (const { section, align } of headers()) expect({ section, align }).toEqual({ section, align: section === "blog" ? null : "center" });
  });

  test("no section writes a heading of its own: every title goes through the shared header", () => {
    const own = PLATFORM_FILES().filter((file) => openingTags(read(file)).some((tag) => tag.name === "h2"));

    expect(own).toEqual([]);
  });
});

describe("the hero: the headline, the card fan, then the pair of actions (AC17)", () => {
  const hero = () => code(platformFile("PlatformHero"));

  test("puts the headline first, then the shared fan, then the CTA pair and its reassurance", () => {
    const source = hero();
    const order = ["<h1", "<FanParallax", "<HeroCardFan", "<LpCtaPair", "SHARED.reassurance"].map((needle) => source.indexOf(needle));

    expect(order.every((at) => at > -1)).toBe(true);
    expect(order).toEqual([...order].sort((a, b) => a - b));
    expect(source).toContain("@/components/landing-variant/HeroCardFan");
    expect(source).toContain("@/components/landing-variant/FanParallax");
    expect(literalAttr(findTag(source, "LpCtaPair")?.attrs ?? "", "location")).toBe("hero");
    expect(source).toContain("<RegionText raw={SHARED.reassurance}");
  });

  test("has no sub and no proof line: the numbers come lower down", () => {
    expect(hero()).not.toMatch(/\.sub\b|SHARED\.proof|proofFigures/);
  });
});

describe("the strip of business types", () => {
  test("runs a type per line of the copy, each with its icon, and stands still for readers who ask for less motion", () => {
    const source = code(platformFile("TypeMarquee"));

    expect(BUSINESS_TYPE_ICONS).toHaveLength(PLATFORM.marquee.types.length);
    expect(source).toContain("PLATFORM.marquee");
    expect(source).toContain("marquee-scroll");
    expect(source).toContain("motion-reduce:");
    expect(source).toMatch(/aria-hidden/);
  });
});

describe("what's delivered: two phones, three glass cards and the wallet badges", () => {
  const deliver = () => code(platformFile("DeliverComposition"));

  test("the three cards are labelled from the copy, and the one with a dashboard capture says it is sample data", () => {
    const source = deliver();
    const titles = openingTags(source).filter((tag) => tag.name === "GlassCard").map((tag) => /title=\{([^}]*)\}/.exec(tag.attrs)?.[1].trim());

    expect(titles.sort()).toEqual(
      ["PLATFORM.deliver.analyticsLabel", "PLATFORM.deliver.notificationsLabel", "PLATFORM.deliver.updatesLabel"].sort(),
    );
    expect(source).toContain("SHARED.sampleData");
    expect(source).toContain("PLATFORM.deliver.updatesFrom");
    expect(source).toContain("PLATFORM.deliver.updatesTo");
  });

  test("the official badges close the composition as images, not links", () => {
    const source = deliver();

    expect(source).toContain('walletBadges("en")');
    expect(source).toContain("badges.apple");
    expect(source).toContain("badges.google");
    expect(openingTags(source).filter((tag) => tag.name === "a" || tag.name === "Link")).toEqual([]);
  });
});

describe("by the numbers", () => {
  test("the three figures are the site's own metrics, never typed here, and the pair of actions follows", () => {
    const source = code(platformFile("NumbersBlock"));

    expect(source).toContain('getTranslations("variant.metrics")');
    expect(source).toContain(".raw(\"items\")");
    expect(literalAttr(findTag(source, "LpCtaPair")?.attrs ?? "", "location")).toBe("feature_cta");
  });
});

describe("how it works: Create, Share, Stamp", () => {
  const how = () => code(platformFile("HowTable"));

  test("the table is the copy's three cells, and its link scrolls to the demo below instead of leaving", () => {
    const source = how();
    const link = openingTags(source).find((tag) => tag.name === "a");

    expect(source).toContain("PLATFORM.how.cells");
    expect(link && literalAttr(link.attrs, "href")).toBe("#demo");
    expect(source).toContain("PLATFORM.how.link");
    expect(PLATFORM.how.cells.map((cell) => cell.title)).toEqual(["Create", "Share", "Stamp"]);
  });
});

describe("program types: one row each, all open until the scroll opens one (AC21)", () => {
  const VISUALS = { stamps: <i>stamps card</i>, points: <i>points card</i>, levels: <i>levels cards</i> };

  test("every row is open in the server markup, with its label, title, text and card", () => {
    const html = renderEn(<ProgramTypeRows visuals={VISUALS} />);
    const text = textOf(html);

    expect(html.match(/data-open="(?:true|false)"/g)).toEqual(['data-open="true"', 'data-open="true"', 'data-open="true"']);
    for (const type of PROGRAM_TYPES) {
      for (const line of [type.eyebrow, type.title, type.body, type.plan]) expect(text).toContain(line);
    }
    for (const card of ["stamps card", "points card", "levels cards"]) expect(text).toContain(card);
  });

  test("the rows follow the scroll only on a wide screen that allows motion, the one nearest the middle opening, and a tap opens one", () => {
    const source = code(platformFile("ProgramTypeRows"));

    expect(source).toContain('matchMedia("(prefers-reduced-motion: reduce)")');
    expect(source).toContain('matchMedia("(min-width: 1024px)")');
    expect(source).toContain('"-45% 0px -45% 0px"');
    expect(source).toContain("rootMargin");
    expect(source).toMatch(/onClick=\{/);
  });

  test("the list closes on a full-width link to the choosing guide, from the copy", () => {
    const html = renderEn(<ProgramTypeRows visuals={VISUALS} />);

    expect(html).toMatch(/<a [^>]*href="[^"]*\/loyalty-programs"/);
    expect(textOf(html)).toContain(PLATFORM.programTypes.closer);
  });
});

describe("the platform: a dashboard for you, a free scanner for your team", () => {
  const html = () => renderEn(<PlatformToggleCard dashboard={<i>dashboard pictures</i>} scanner={<i>scanner phone</i>} />);

  test("the tabs are the copy's, the dashboard shown first, and both panes stay in the page so switching never moves it", () => {
    const text = textOf(html());

    expect(html()).toMatch(/role="tab"[^>]*aria-selected="true"[^>]*>[^<]*Dashboard/);
    for (const label of Object.values(PLATFORM.platform.tabs)) expect(text).toContain(label);
    for (const pane of [PLATFORM.platform.dashboard, PLATFORM.platform.scanner]) {
      expect(text).toContain(pane.title);
      for (const fact of pane.facts) expect(text).toContain(fact.text);
    }
    expect(text).toContain("dashboard pictures");
    expect(text).toContain("scanner phone");
  });

  test("everything that is a Growth and Pro thing carries its chip, and the links go to the feature pages", () => {
    const planned = [...PLATFORM.platform.dashboard.facts, ...PLATFORM.platform.scanner.facts].filter((fact) => fact.plan);

    expect(planned.length).toBeGreaterThan(0);
    expect(textOf(html()).match(/Growth and Pro/g)).toHaveLength(planned.length);
    expect(html()).toMatch(/href="[^"]*\/features\/analytics"/);
    expect(html()).toMatch(/href="[^"]*\/features\/mobile-scanner"/);
  });

  test("the tabs are 44px tall to tap", () => {
    expect(literalAttr(findTag(code(platformFile("PlatformToggleCard")), "Segmented")?.attrs ?? "", "size")).toBe("lg");
  });
});

describe("sharing: a tree of places, from the copy (AC22)", () => {
  test("shows each channel of the copy, in order, with its line, and says nothing about integrations", () => {
    const text = textOf(renderEn(<ShareTree />));
    const at = PLATFORM.share.channels.map((channel) => text.indexOf(channel.title));

    expect(at.every((index) => index > -1)).toBe(true);
    expect(at).toEqual([...at].sort((a, b) => a - b));
    for (const channel of PLATFORM.share.channels) expect(text).toContain(channel.body);
    expect(text).not.toMatch(/integrat|\bPOS\b|\bsync/i);
  });

  test("reads the channels from the copy and draws an icon for each, in ink, with the lines drawing in once", () => {
    const source = code(platformFile("ShareTree"));

    expect(source).toContain("PLATFORM.share.channels");
    expect(SHARE_ICONS).toHaveLength(PLATFORM.share.channels.length);
    for (const channel of PLATFORM.share.channels) expect(source).not.toContain(`"${channel.title}"`);
    expect(source).toContain("ink-draw");
  });
});

describe("the blog block (AC23)", () => {
  const latest = () => getAllPosts("en").slice(0, 3);

  test("shows the three latest English posts, newest first, each as a rich card linking to its post", () => {
    const html = renderEn(<LpBlogPosts />);
    const linked = [...html.matchAll(/href="[^"]*\/blog\/([^"/]+)"/g)].map((match) => match[1]);

    expect(latest()).toHaveLength(3);
    expect(linked).toEqual(latest().map((post) => post.slug));
    for (const post of latest()) {
      expect(textOf(html)).toContain(post.title);
      expect(textOf(html)).toContain(`${post.readingMinutes} min read`);
    }
  });

  test("reads them from the English posts and has a link to all of them", () => {
    const source = code(platformFile("LpBlogPosts"));
    const html = renderEn(<LpBlogPosts />);

    expect(source).toContain('getAllPosts("en").slice(0, 3)');
    expect(literalAttr(findTag(source, "BlogCard")?.attrs ?? "", "detail")).toBe("rich");
    expect(html).toMatch(/<a [^>]*href="[^"]*\/blog"[^>]*>[^<]*View all/);
  });
});

describe("the closing band (AC2v2)", () => {
  test("is the page's one last ask: the inverse button tracked as the final CTA, in the band's own words", () => {
    const band = code(join(COMPONENTS_DIR, "shared", "LpAccentBand.tsx"));
    const button = findTag(band, "CTAButton");
    const finals = PLATFORM_FILES().flatMap((file) =>
      openingTags(read(file)).filter((tag) => literalAttr(tag.attrs, "trackAs") === "final_cta"),
    );

    expect(literalAttr(button?.attrs ?? "", "variant")).toBe("inverse");
    expect(literalAttr(button?.attrs ?? "", "trackAs")).toBe("final_cta");
    expect(band).toContain("PLATFORM.band.title");
    expect(finals).toEqual([]);
    expect(code(pageFile("platform"))).toContain("<LpAccentBand");
  });
});

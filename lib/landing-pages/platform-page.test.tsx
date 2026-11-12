/**
 * The Platform page (`/us/landing-pages/platform`): what each of its sections
 * promises a visitor. The server components that only compose (hero, deliver,
 * numbers, how) are read as source; the ones that carry behaviour of their own
 * (program rows, the platform toggle, the share tree, the closing band and the
 * blog block) are rendered on the server, which is what a visitor gets first
 * and what a phone or a reader who asks for less motion keeps.
 */

import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { createElement } from "react";
import { BlogPostsSection } from "@/components/landing-pages/platform/BlogPostsSection";
import { GlassCard } from "@/components/landing-pages/platform/GlassCard";
import { LpAccentBand } from "@/components/landing-pages/platform/LpAccentBand";
import { PlatformToggleCard } from "@/components/landing-pages/platform/PlatformToggleCard";
import { ProgramTypeRows } from "@/components/landing-pages/platform/ProgramTypeRows";
import { SHARE_ICONS, ShareTree } from "@/components/landing-pages/platform/ShareTree";
import { BUSINESS_TYPE_ICONS } from "@/components/landing-pages/platform/TypeMarquee";
import { getAllPosts } from "../blog";
import { ROOT, code, findTag, literalAttr, openingTags, read, sourceFiles } from "../testing/jsx-source";
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

  test("no section writes a heading of its own: every title goes through the shared header (the closing band is a headline, not a section)", () => {
    const own = PLATFORM_FILES().filter(
      (file) => file !== platformFile("LpAccentBand") && openingTags(read(file)).some((tag) => tag.name === "h2"),
    );

    expect(own).toEqual([]);
  });
});

describe("the hero: the headline, the card fan, then the pair of actions (AC17)", () => {
  const hero = () => code(platformFile("PlatformHero"));

  test("puts the headline first, then the shared fan, then the CTA pair and its reassurance", () => {
    const order = ["<h1", "<FanParallax", "<HeroCardFan", "<LpCtaPair", "SHARED.reassurance"].map((needle) => hero().indexOf(needle));

    expect(order.every((at) => at > -1)).toBe(true);
    expect(order).toEqual([...order].sort((a, b) => a - b));
    expect(literalAttr(findTag(hero(), "LpCtaPair")?.attrs ?? "", "location")).toBe("hero");
  });

  test("has no sub and no proof line: the numbers come lower down", () => {
    expect(hero()).not.toMatch(/\.sub\b|SHARED\.proof|proofFigures/);
  });
});

describe("the strip of business types", () => {
  test("runs a type per line of the copy, each with its icon, and stands still for readers who ask for less motion", () => {
    const source = code(platformFile("TypeMarquee"));

    expect(BUSINESS_TYPE_ICONS).toHaveLength(PLATFORM.marquee.types.length);
    expect(source).toContain("motion-reduce:");
    expect(source).toMatch(/aria-hidden/);
  });
});

describe("what's delivered: two phones, three glass cards and the wallet badges", () => {
  test("the three cards are labelled from the copy, and none carries a sample-data caption (Harry, 13 Nov)", () => {
    const source = code(platformFile("DeliverComposition"));
    const titles = openingTags(source).filter((tag) => tag.name === "GlassCard").map((tag) => /title=\{([^}]*)\}/.exec(tag.attrs)?.[1].trim());

    expect(titles.sort()).toEqual(
      ["PLATFORM.deliver.analyticsLabel", "PLATFORM.deliver.notificationsLabel", "PLATFORM.deliver.updatesLabel"].sort(),
    );
    expect(source).not.toContain("SHARED.sampleData");
  });

  test("a glass card can float, and the float stops for readers who ask for less motion", () => {
    const html = renderEn(createElement(GlassCard, { title: "Card", float: true }));

    expect(html).toContain("lp-float");
    expect(read(join(ROOT, "app", "globals.css"))).toMatch(
      /@media \(prefers-reduced-motion: reduce\)\s*\{[^}]*\.lp-float\s*\{\s*animation:\s*none/,
    );
  });
});

describe("by the numbers", () => {
  test("the pair of actions follows the figures", () => {
    const source = code(platformFile("NumbersBlock"));

    expect(literalAttr(findTag(source, "LpCtaPair")?.attrs ?? "", "location")).toBe("feature_cta");
  });
});

describe("how it works: Create, Share, Stamp", () => {
  test("the link under the table scrolls to the demo below instead of leaving", () => {
    const link = openingTags(code(platformFile("HowTable"))).find((tag) => tag.name === "a");

    expect(link && literalAttr(link.attrs, "href")).toBe("#demo");
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
    expect(html()).toContain("h-11");
  });
});

describe("sharing: a tree of places, from the copy (AC22)", () => {
  test("shows each channel of the copy, in order, with its line and an icon, and says nothing about integrations", () => {
    const text = textOf(renderEn(<ShareTree />));
    const at = PLATFORM.share.channels.map((channel) => text.indexOf(channel.title));

    expect(at.every((index) => index > -1)).toBe(true);
    expect(at).toEqual([...at].sort((a, b) => a - b));
    for (const channel of PLATFORM.share.channels) expect(text).toContain(channel.body);
    expect(text).not.toMatch(/integrat|\bPOS\b|\bsync/i);
    expect(SHARE_ICONS).toHaveLength(PLATFORM.share.channels.length);
  });
});

describe("the blog block (AC23)", () => {
  const latest = () => getAllPosts("en").slice(0, 3);

  test("shows the three latest English posts, newest first, each as a rich card linking to its post, and a link to all of them", () => {
    const html = renderEn(<BlogPostsSection />);
    const linked = [...html.matchAll(/href="[^"]*\/blog\/([^"/]+)"/g)].map((match) => match[1]);

    expect(latest()).toHaveLength(3);
    expect(linked).toEqual(latest().map((post) => post.slug));
    for (const post of latest()) {
      expect(textOf(html)).toContain(post.title);
      expect(textOf(html)).toContain(`${post.readingMinutes} min read`);
    }
    expect(html).toMatch(/<a [^>]*href="[^"]*\/blog"[^>]*>[^<]*View all/);
  });
});

describe("the closing band (AC2)", () => {
  test("is the page's one last ask, in the band's own words, with the trial and its reassurance", () => {
    const text = textOf(renderEn(<LpAccentBand />, { us: true }));

    expect(text).toContain(PLATFORM.band.title);
    expect(text).toContain(PLATFORM.band.sub);
    expect(text).toContain(SHARED.cta);
    expect(text).toContain("14 days free");
  });

  test("is the only final-CTA button on the page", () => {
    const finals = PLATFORM_FILES().flatMap((file) =>
      openingTags(read(file)).filter((tag) => literalAttr(tag.attrs, "trackAs") === "final_cta"),
    );

    expect(finals).toHaveLength(1);
  });
});

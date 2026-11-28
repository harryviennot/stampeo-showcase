/**
 * The Platform page (the homepage): what each of its sections
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
import { HOVER_INTENT_MS, allRowsOpen, hoverIntent } from "@/components/landing-pages/platform/HoverRows";
import { ProgramTypeRows } from "@/components/landing-pages/platform/ProgramTypeRows";
import { SHARE_ICONS, ShareTree } from "@/components/landing-pages/platform/ShareTree";
import { BUSINESS_TYPE_ICONS, TypeMarquee } from "@/components/landing-pages/platform/TypeMarquee";
import { getAllPosts } from "../blog";
import { ROOT, code, findTag, literalAttr, openingTags, read, sourceFiles } from "../testing/jsx-source";
import { COMPONENTS_DIR, pageFile } from "../testing/landing-pages-source";
import { NO_CARD_CLAIM } from "../testing/copy-claims";
import { trackedBy } from "../testing/cta-recorder";
import { expectInOrder, renderEn, renderEnAsync, renderIn, textOf } from "../testing/render-en";
import { mockEnglishServerTranslations } from "../testing/server-intl";
import { landingCopy } from "./copy/bundle";
import { PLATFORM } from "./copy/platform";
import { PROGRAM_TYPES } from "./copy/program-types";
import { SHARED } from "./copy/shared";
import { loyaltyLink } from "./preview-nav";

// The hero's wallet cards ask next-intl for their words.
await mockEnglishServerTranslations();
const { PlatformHero } = await import("@/components/landing-pages/platform/hero/PlatformHero");
const { NumbersBlock } = await import("@/components/landing-pages/platform/NumbersBlock");

const PLATFORM_DIR = join(COMPONENTS_DIR, "platform");
const platformFile = (name: string) => join(PLATFORM_DIR, `${name}.tsx`);
const PLATFORM_FILES = () => [pageFile("platform"), ...sourceFiles(PLATFORM_DIR)];

describe("every section header is an eyebrow, a centred title and a lead", () => {
  /** Where each header's small label comes from; the blog block is the one left-aligned header. */
  const EYEBROWS: Record<string, string> = {
    deliver: "PLATFORM.deliver.eyebrow",
    numbers: "PLATFORM.numbers.eyebrow",
    how: "PLATFORM.how.eyebrow",
    demo: "platform.PLATFORM.demo.eyebrow",
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
    expect(code(pageFile("platform"))).toContain("<LpSectors eyebrow={shared.SHARED.sectorsEyebrow}");
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

describe("the hero: the headline, the cards, then the pair of actions", () => {
  const hero = () => code(platformFile("hero/PlatformHero"));

  test("puts the headline first, then the cards, then the CTA pair and its reassurance", async () => {
    const html = await renderEnAsync(<PlatformHero market="us" />);
    const order = ["<h1", 'role="img"', 'href="/en/onboarding"', "14 days free"].map((needle) => html.indexOf(needle));

    expect(order.every((at) => at > -1)).toBe(true);
    expect(order).toEqual([...order].sort((a, b) => a - b));
    expect(literalAttr(findTag(hero(), "LpCtaPair")?.attrs ?? "", "location")).toBe("hero");
  });

  test("the page mounts the hero with its market and the closing card with no props, so Platform's own words and cards are what they show", () => {
    const page = code(pageFile("platform"));

    expect(findTag(page, "PlatformHero")?.attrs).toMatch(/^\s*market=\{market\}\s*\/?\s*$/);
    expect(findTag(page, "LpAccentBand")?.attrs).toMatch(/^\s*\/?\s*$/);
  });

  test("is a headline alone: no label above it, and no sub or proof line between it and the cards", async () => {
    const html = await renderEnAsync(<PlatformHero market="us" />);
    const title = html.indexOf("<h1");

    expect(html.slice(0, title)).not.toContain("<p");
    expect(html.slice(html.indexOf("</h1>"), html.indexOf('role="img"'))).not.toContain("<p");
  });
});

describe("the strip of business types", () => {
  const html = () => renderEn(<TypeMarquee />);
  const has = (classes: string, name: string) => classes.split(/\s+/).includes(name);
  /** Each drifting row: the classes of its frame and of its list, the types a reader hears (not the loop's hidden copy), its icons. */
  const rows = () =>
    [...html().matchAll(/<div class="([^"]*)"><ul class="([^"]*)">([\s\S]*?)<\/ul><\/div>/g)].map(([, frame, list, items]) => ({
      frame,
      list,
      heard: [...items.matchAll(/<li class="[^"]*">([\s\S]*?)<\/li>/g)].map(([, item]) => textOf(item).replaceAll("|", "")),
      copies: [...items.matchAll(/<li aria-hidden="true" class="([^"]*)"/g)].map(([, classes]) => classes),
      icons: items.match(/<svg/g)?.length ?? 0,
      items: items.match(/<li/g)?.length ?? 0,
    }));
  /** The frame around the phone's two rows. */
  const phone = () => /<div class="([^"]*)"><div class="[^"]*"><ul/.exec(html())?.[1] ?? "";
  const drifts = (list: string) => /\banimate-\[marquee-scroll_/.test(list);

  test("runs a type per line of the copy, each with its icon", () => {
    expect(BUSINESS_TYPE_ICONS).toHaveLength(PLATFORM.marquee.types.length);
    for (const row of rows()) expect(row.icons).toBe(row.items);
  });

  test("on a phone it is two rows, half the types each, drifting in opposite directions; from sm, one row", () => {
    const [left, right, single] = rows();
    const { types } = PLATFORM.marquee;

    expect(rows()).toHaveLength(3);
    expect([...left.heard, ...right.heard]).toEqual([...types]);
    expect(Math.abs(left.heard.length - right.heard.length)).toBeLessThanOrEqual(1);
    expect([drifts(left.list), has(left.list, "[animation-direction:reverse]")]).toEqual([true, false]);
    expect([drifts(right.list), has(right.list, "[animation-direction:reverse]")]).toEqual([true, true]);
    expect(has(phone(), "sm:hidden")).toBe(true);
    expect(single.heard).toEqual([...types]);
    expect(drifts(single.list)).toBe(true);
    expect([has(single.frame, "hidden"), has(single.frame, "sm:block")]).toEqual([true, true]);
  });

  test("stands still for readers who ask for less motion: the one row, wrapped, each type once", () => {
    const single = rows()[2];

    expect(has(phone(), "motion-reduce:hidden")).toBe(true);
    expect(has(single.frame, "motion-reduce:block")).toBe(true);
    for (const rule of ["motion-reduce:animate-none", "motion-reduce:flex-wrap"]) expect(has(single.list, rule)).toBe(true);
    expect(single.copies).toHaveLength(PLATFORM.marquee.types.length);
    for (const copy of single.copies) expect(has(copy, "motion-reduce:hidden")).toBe(true);
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
  const CATALOG = (JSON.parse(read(join(ROOT, "messages", "en", "landing.json"))) as {
    variant: { metrics: { items: Array<{ value: string; label: string }> } };
  }).variant.metrics.items;
  const [measured] = PLATFORM.numbers.figures;
  const businesses = CATALOG.find((item) => /business/i.test(item.label)) as (typeof CATALOG)[number];
  const countries = CATALOG.find((item) => /countr/i.test(item.label)) as (typeof CATALOG)[number];
  const block = () => renderEnAsync(<NumbersBlock />);
  const figuresOf = (html: string) =>
    [...html.matchAll(/<[^>]*class="[^"]*\bink-figure\b[^"]*"[^>]*>([^<]*)</g)].map((match) => match[1]);

  test("the pair of actions follows the figures", () => {
    const source = code(platformFile("NumbersBlock"));

    expect(literalAttr(findTag(source, "LpCtaPair")?.attrs ?? "", "location")).toBe("feature_cta");
  });

  test("shows three figures in the homepage's hand over their labels: the businesses and the countries from the site's counts, then the measured card retention rate", async () => {
    const html = await block();

    expect(figuresOf(html)).toEqual([businesses.value, countries.value, measured.value]);
    expectInOrder(html, [businesses.value, businesses.label, countries.value, countries.label, measured.value, measured.text]);
  });

  test("leaves the stamps issued count to the homepage: the page does not print it", async () => {
    const stamps = CATALOG.find((item) => /stamps/i.test(item.label));
    const text = textOf(await block());

    expect(stamps).toBeDefined();
    expect(text).not.toContain(stamps?.value ?? "");
    expect(text).not.toMatch(/stamps issued/i);
  });

  test("keeps the measured figure's study in the copy as its record, and prints no study line under the figures", async () => {
    const text = textOf(await block());

    expect(measured.source).toMatch(/^Stampeo data: .*\d/);
    expect(text).not.toContain(measured.source);
    expect(text).not.toMatch(/Stampeo data/);
  });

  test("every figure is in the server markup, each in its own reveal that waits a little longer than the one before", async () => {
    const html = await block();
    const reveals = [...html.matchAll(/<div data-sr="true" class="scroll-reveal-rise[^"]*"[^>]*>([\s\S]*?)<\/li>/g)];
    const delays = reveals.map((match) => Number(/transition-delay:(\d+)ms/.exec(match[0])?.[1] ?? 0));

    expect(reveals).toHaveLength(3);
    expect(reveals.map((match) => figuresOf(match[1])).flat()).toEqual([businesses.value, countries.value, measured.value]);
    expect(delays).toEqual([0, 250, 500]);
  });
});

describe("how it works: Create, Share, Stamp", () => {
  test("the link under the table scrolls to the demo below instead of leaving", () => {
    const link = openingTags(code(platformFile("HowTable"))).find((tag) => tag.name === "a");

    expect(link && literalAttr(link.attrs, "href")).toBe("#demo");
  });
});

describe("program types: one row each, all open until a visitor points at one (AC21)", () => {
  const VISUALS = { stamps: <i>stamps card</i>, points: <i>points card</i>, levels: <i>levels cards</i> };
  const ROWS = PROGRAM_TYPES.map(({ key, eyebrow, title, body }) => ({ key, eyebrow, title, body }));
  const GUIDE = { label: PLATFORM.programTypes.closer, ...loyaltyLink("en") };
  const rows = () => renderEn(<ProgramTypeRows rows={ROWS} guide={GUIDE} visuals={VISUALS} />);

  test("every row is open in the server markup, with its label, title, text and card", () => {
    const html = rows();
    const text = textOf(html);

    expect(html.match(/data-open="(?:true|false)"/g)).toEqual(['data-open="true"', 'data-open="true"', 'data-open="true"']);
    for (const type of PROGRAM_TYPES) {
      for (const line of [type.eyebrow, type.title, type.body]) expect(text).toContain(line);
    }
    for (const card of ["stamps card", "points card", "levels cards"]) expect(text).toContain(card);
  });

  test.each([
    ["every row stays open on a phone", { wide: false, calm: false }, true],
    ["every row stays open on a phone, for a reader who asks for less motion", { wide: false, calm: true }, true],
    ["every row stays open on a computer, for a reader who asks for less motion", { wide: true, calm: true }, true],
    ["the rows open one at a time on a computer", { wide: true, calm: false }, false],
  ])("%s", (_case, reader, open) => {
    expect(allRowsOpen(reader)).toBe(open);
  });

  test("a mouse that rests on a row opens it; one that only crosses rows on its way elsewhere opens none", async () => {
    const opened: string[] = [];
    const hover = hoverIntent((key: string) => opened.push(key));

    hover.enter("stamps");
    hover.leave();
    hover.enter("points");
    hover.leave();
    await Bun.sleep(HOVER_INTENT_MS + 40);
    expect(opened).toEqual([]);

    hover.enter("points");
    hover.leave();
    hover.enter("levels");
    await Bun.sleep(HOVER_INTENT_MS + 40);
    expect(opened).toEqual(["levels"]);
  });

  test("a row also opens for keyboard focus and for a click or tap, and nothing follows the scroll any more", () => {
    const source = code(platformFile("HoverRows"));
    const handlers = openingTags(source).flatMap((tag) => [...tag.attrs.matchAll(/\b(on[A-Z]\w+)=\{[^}]*item\.key/g)].map((match) => match[1]));

    expect(handlers.sort()).toEqual(["onClick", "onFocus", "onPointerEnter"]);
    expect(source).not.toContain("IntersectionObserver");
  });

  test("the rows show Aurevo's stamp card, the Vanity salon's points card and the level cards", () => {
    const section = code(platformFile("ProgramTypeRowsSection"));

    for (const card of ["<AurevoCard", "VANITY.design", "<LevelCards"]) expect(section).toContain(card);
    expect(section).not.toContain("Marginalia");
  });

  test("the list closes on a full-width link to the choosing guide, from the copy", () => {
    const html = rows();

    expect(html).toMatch(/<a [^>]*href="\/en\/loyalty-programs"/);
    expect(textOf(html)).toContain(PLATFORM.programTypes.closer);
  });
});

describe("the platform: a dashboard for you, a free scanner for your team", () => {
  const PAGES = { dashboard: "/features/analytics", scanner: "/features/mobile-scanner" };
  const toggle = (initial?: "dashboard" | "scanner") => (
    <PlatformToggleCard
      words={PLATFORM.platform}
      pages={PAGES}
      dashboard={<i>dashboard pictures</i>}
      scanner={<i>scanner phone</i>}
      initial={initial}
    />
  );
  const html = () => renderEn(toggle());

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

  test.each([
    ["dashboard", "scanner"],
    ["scanner", "dashboard"],
  ] as const)("opened on %s, its pane is in view and the %s pane is inert", (open, other) => {
    const opened = renderEn(toggle(open));
    /** Each pane: its tab label, the attributes of its frame, and its markup up to the next pane. */
    const panes = [...opened.matchAll(/<div role="tabpanel" aria-label="([^"]+)"([^>]*)>/g)].map((match, index, all) => ({
      label: match[1],
      attrs: match[2],
      inert: /\binert\b/.test(match[2]),
      html: opened.slice(match.index, all[index + 1]?.index),
    }));
    const pane = (key: "dashboard" | "scanner") => panes.find((candidate) => candidate.label === PLATFORM.platform.tabs[key]);

    expect(panes).toHaveLength(2);
    expect(opened.match(/aria-selected="true"[^>]*>([^<]*)</)?.[1]).toBe(PLATFORM.platform.tabs[open]);
    expect(pane(open)?.inert).toBe(false);
    expect(pane(other)?.inert).toBe(true);
    expect(pane(open)?.html).toContain(open === "dashboard" ? "dashboard pictures" : "scanner phone");
    expect(textOf(pane(open)?.html ?? "")).toContain(PLATFORM.platform[open].title);
    expect(pane(open)?.attrs).toContain("opacity-100");
    expect(pane(other)?.attrs).toContain("opacity-0");
  });

  test("the links go to the feature pages", () => {
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
    // Newest first: the dates never rise down the page, and none of the other posts is newer than the last shown.
    const dates = linked.map((slug) => getAllPosts("en").find((post) => post.slug === slug)?.publishedAt ?? "");
    const rest = getAllPosts("en").filter((post) => !linked.includes(post.slug));

    expect(dates.every((date) => /^\d{4}-\d{2}-\d{2}/.test(date))).toBe(true);
    expect(dates).toEqual([...dates].sort((a, b) => b.localeCompare(a)));
    expect(rest.filter((post) => post.publishedAt > dates[dates.length - 1])).toEqual([]);
    for (const post of latest()) {
      expect(textOf(html)).toContain(post.title);
      expect(textOf(html)).toContain(`${post.readingMinutes} min read`);
    }
    expect(html).toMatch(/<a [^>]*href="[^"]*\/blog"[^>]*>[^<]*View all/);
  });
});

describe("the closing band (AC2)", () => {
  test("is the page's one last ask, in the band's own words, with the trial and its reassurance", () => {
    const html = renderEn(<LpAccentBand />, { us: true });
    const text = textOf(html);

    expect(textOf(/<h2[\s\S]*?<\/h2>/.exec(html)?.[0] ?? "").replaceAll("|", "")).toBe(PLATFORM.band.title);
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

describe("the trial offered again after the two middle sections (AC7)", () => {
  /** The section each button follows, and the CTA location its click is reported under. */
  const TRIAL_BUTTONS = [
    { after: "program_types", location: "platform_program_types" },
    { after: "platform", location: "platform_apps" },
  ] as const;

  test("the page places a centred trial button right after each of the two sections, each with its own location", () => {
    const tags = openingTags(code(pageFile("platform")));
    const names = tags.map((tag) => tag.name);

    for (const { after, location } of TRIAL_BUTTONS) {
      const section = after === "program_types" ? "ProgramTypeRowsSection" : "PlatformSection";
      const button = tags[names.indexOf(section) + 1];

      expect(button?.name).toBe("LpTrialCta");
      expect(literalAttr(button.attrs, "location")).toBe(location);
    }
  });

  test("the two locations are the page's alone, and no other button reports under them", () => {
    const used = PLATFORM_FILES().flatMap((file) =>
      openingTags(read(file))
        .filter((tag) => tag.name === "LpTrialCta")
        .map((tag) => literalAttr(tag.attrs, "location")),
    );

    expect(used.sort()).toEqual(TRIAL_BUTTONS.map(({ location }) => location).sort());
    expect(new Set(used).size).toBe(2);
  });

  test.each(TRIAL_BUTTONS.map(({ location }) => location))("the %s button is reported under that location, and leads to the sign-up", async (location) => {
    const { LpTrialCta } = await import("@/components/landing-pages/shared/LpTrialCta");

    expect(trackedBy(() => renderEn(<LpTrialCta location={location} />, { market: "int" }))).toEqual([{ trackAs: location, href: "/onboarding" }]);
  });

  test.each(["en", "fr", "es", "pl"])("%s: the button and the reassurance under it say the language's own words, with the international trial", async (locale) => {
    const { LpTrialCta } = await import("@/components/landing-pages/shared/LpTrialCta");
    const { cta, reassurance } = landingCopy(locale).shared.SHARED;
    const text = textOf(renderIn(locale, <LpTrialCta location="platform_apps" />, { market: "int" }));

    expect(text).toContain(cta);
    expect(reassurance).toMatch(NO_CARD_CLAIM);
    expect(text.indexOf(cta)).toBeLessThan(text.indexOf(reassurance.replace("{trialDays}", "14")));
  });
});

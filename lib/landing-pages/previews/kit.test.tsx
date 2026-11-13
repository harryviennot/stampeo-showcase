/**
 * The kit the five previews are built from: the three pieces Platform's sections
 * were generalised into (a steps table, hover rows, a toggle card), the hero
 * Platform's fan shares, and the two preview-only blocks (the hero and the
 * sibling links). What Platform's own pieces render by default is pinned by
 * snapshots in `../default-renders.test.tsx`, and what a page can ask of the
 * site components they borrow is in `../extended-components.test.tsx`.
 */

import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { PreviewHero } from "@/components/landing-pages/feature-previews/PreviewHero";
import { RelatedPreviews } from "@/components/landing-pages/feature-previews/RelatedPreviews";
import { StampStyleRows } from "@/components/landing-pages/feature-previews/card-design/StampStyleRows";
import { HoverRows } from "@/components/landing-pages/platform/HoverRows";
import { ProgramTypeRows } from "@/components/landing-pages/platform/ProgramTypeRows";
import { StepsTable } from "@/components/landing-pages/platform/StepsTable";
import { ToggleCard } from "@/components/landing-pages/platform/ToggleCard";
import { CARD_DESIGN_FAN_SLOTS } from "@/lib/hero-fan";
import { code, findTag, openingTags } from "../../testing/jsx-source";
import { COMPONENTS_DIR } from "../../testing/landing-pages-source";
import { expectInOrder, renderEn, renderEnAsync, textOf } from "../../testing/render-en";
import { mockEnglishServerTranslations } from "../../testing/server-intl";
import { stackZooms } from "../../testing/stacked-rows";
import { PREVIEW_SHARED } from "../copy/previews/shared";
import { SHARED } from "../copy/shared";
import { LANDING_PAGES, PREVIEW_SLUGS } from "../pages";

// The fan hero holds async server components that ask next-intl for their words.
await mockEnglishServerTranslations();
const { PlatformHero } = await import("@/components/landing-pages/platform/PlatformHero");

const PLATFORM_DIR = join(COMPONENTS_DIR, "platform");

describe("StepsTable: a bordered table of steps, with phones sinking behind it when it has a visual", () => {
  const CELLS = [
    { title: "Write", body: "A short message." },
    { title: "Pick who", body: "Everyone, or by when they joined.", plan: "Pro" as const },
    { title: "Send", body: "Right away." },
  ];

  test("prints each cell's title and text in order, and a plan chip only on the cell that has one", () => {
    const html = renderEn(<StepsTable cells={CELLS} />);
    const text = textOf(html);
    const at = CELLS.flatMap((cell) => [text.indexOf(cell.title), text.indexOf(cell.body)]);

    expect(at.every((index) => index > -1)).toBe(true);
    expect(at).toEqual([...at].sort((a, b) => a - b));
    expect(text.match(/Pro/g)).toHaveLength(1);
    expect(html.match(/<li\b/g)).toHaveLength(3);
  });

  test("three cells are three columns from lg, two cells are two", () => {
    expect(renderEn(<StepsTable cells={CELLS} />)).toContain("lg:grid-cols-3");
    expect(renderEn(<StepsTable cells={CELLS.slice(0, 2)} />)).toContain("lg:grid-cols-2");
    expect(renderEn(<StepsTable cells={CELLS.slice(0, 2)} />)).not.toContain("lg:grid-cols-3");
  });

  test("with a visual, the table overlaps the bottom of the phones; with none, it is a plain table", () => {
    const withVisual = renderEn(<StepsTable cells={CELLS} visual={<i>two phones</i>} />);
    const without = renderEn(<StepsTable cells={CELLS} />);

    expect(withVisual).toContain("two phones");
    expect(withVisual).toContain("relative -mt-10 grid");
    expect(without).not.toMatch(/-mt-10|-mt-24/);
    expect(without).not.toContain("overflow-hidden pt-6");
  });

  test("a cell can carry an icon above its title, and the table a link under it", () => {
    const html = renderEn(
      <StepsTable
        cells={[{ title: "Scanner app", body: "On the App Store.", icon: <b>store icon</b> }, CELLS[2]]}
        link={<a href="#demo">Try it</a>}
      />,
    );

    expect(html.indexOf("store icon")).toBeLessThan(html.indexOf("Scanner app"));
    expect(html).toContain('<a href="#demo">Try it</a>');
  });

  test("a table with no cells draws no list", () => {
    expect(renderEn(<StepsTable cells={[]} />)).not.toContain("<ol");
  });
});

describe("HoverRows: rows that open on hover, focus or tap, all open on the server", () => {
  const ITEMS = [
    { key: "stamps", eyebrow: "Several at once", title: "Stamps", body: "Add one, or several." },
    { key: "levels", eyebrow: "Perks", title: "Levels", body: "Their level shows.", plan: "Growth and Pro" as const },
  ];
  const VISUALS = { stamps: <i>stamps mini</i>, levels: <i>levels mini</i> };

  test("every row is open in the server markup with its label, title, text and visual; only a planned row has a chip", () => {
    const html = renderEn(<HoverRows items={ITEMS} visuals={VISUALS} />);
    const text = textOf(html);

    expect(html.match(/data-open="(?:true|false)"/g)).toEqual(['data-open="true"', 'data-open="true"']);
    for (const line of ["Several at once", "Stamps", "Add one, or several.", "Perks", "Levels", "stamps mini", "levels mini"]) {
      expect(text).toContain(line);
    }
    expect(text.match(/Growth and Pro/g)).toHaveLength(1);
    expect(text.indexOf("Growth and Pro")).toBeGreaterThan(text.indexOf("Their level shows."));
  });

  test("a closer goes under the list, and there is none unless asked for", () => {
    expect(renderEn(<HoverRows items={ITEMS} visuals={VISUALS} />)).not.toContain("closing line");

    const html = renderEn(<HoverRows items={ITEMS} visuals={VISUALS} closer={<p>closing line</p>} />);

    expect(html.indexOf("closing line")).toBeGreaterThan(html.indexOf("levels mini"));
  });

  test("a row's picture sits in a 128px column beside its words on a phone, unless the rows are asked to stack", () => {
    const plain = renderEn(<HoverRows items={ITEMS} visuals={VISUALS} />);

    expect(plain).toContain("grid-cols-[128px_1fr]");
    expect(plain).not.toMatch(/--stack-zoom|grid-cols-1\b/);
  });

  test("stacked, each picture goes under its row's words, centred and zoomed up to the width asked for; from lg the row is as before", () => {
    const html = renderEn(<HoverRows items={ITEMS} visuals={VISUALS} stackOnPhone={288} />);
    const picture = html.match(/<div class="([^"]*)" style="--stack-zoom:2\.25"><i>stamps mini<\/i>/);

    expect(stackZooms(html)).toEqual([2.25, 2.25]);
    expect(html).not.toContain("grid-cols-[128px_1fr]");
    expect(html).toMatch(/class="grid grid-cols-1 [^"]*lg:grid-cols-\[1fr_240px\] lg:gap-12 lg:py-10 lg:pr-24 lg:pl-12"/);
    expect(picture?.[1]).toBe("order-2 flex justify-center max-lg:[zoom:var(--stack-zoom)]");
    expect(textOf(html).indexOf("stamps mini")).toBeLessThan(textOf(html).indexOf("Add one, or several."));
    expect(html.match(/data-open="true"/g)).toHaveLength(2);
  });
});

describe("HoverRows: the rows of wallet cards keep their thumbnail column; only dense pictures stack", () => {
  test("the card design stamp rows and Platform's program rows draw no stacked picture", async () => {
    expect(stackZooms(renderEn(<StampStyleRows />))).toEqual([]);
    expect(
      stackZooms(renderEn(<ProgramTypeRows visuals={{ stamps: <i>stamps card</i>, points: <i>points card</i>, levels: <i>levels cards</i> }} />)),
    ).toEqual([]);
  });
});

describe("ToggleCard: one white card, one surface per tab", () => {
  const TABS = [
    { key: "staff", label: "Staff", title: "A code, then the scanner", facts: [{ text: "A 6-character code" }], visual: <i>join screen</i> },
    {
      key: "owners",
      label: "Owners",
      title: "Scan, and step in",
      facts: [{ text: "Unlimited team members", plan: "Growth and Pro" as const }],
      link: { label: "See the app", href: "/features/mobile-scanner" },
      visual: <i>limit screen</i>,
    },
  ];

  test("two tabs: a tab per label, the first open and the second inert, each pane with its title, facts and chip", () => {
    const html = renderEn(<ToggleCard tabs={TABS} ariaLabel="Your team" />);
    const panes = [...html.matchAll(/<div role="tabpanel" aria-label="([^"]+)"([^>]*)>/g)];

    expect(html).toMatch(/role="tablist"[^>]*aria-label="Your team"/);
    expect(html.match(/role="tab"/g)).toHaveLength(2);
    expect(html).toMatch(/role="tab"[^>]*aria-selected="true"[^>]*>Staff</);
    expect(panes.map((pane) => pane[1])).toEqual(["Staff", "Owners"]);
    expect([/\binert\b/.test(panes[0][2]), /\binert\b/.test(panes[1][2])]).toEqual([false, true]);
    for (const line of ["A code, then the scanner", "A 6-character code", "join screen", "Scan, and step in", "Unlimited team members", "limit screen"]) {
      expect(textOf(html)).toContain(line);
    }
    expect(textOf(html).match(/Growth and Pro/g)).toHaveLength(1);
  });

  test("it opens on the tab it is told to", () => {
    const html = renderEn(<ToggleCard tabs={TABS} ariaLabel="Your team" initial="owners" />);

    expect(html).toMatch(/role="tab"[^>]*aria-selected="true"[^>]*>Owners</);
  });

  test("a pane's link goes where it says, and a pane with none has none", () => {
    const html = renderEn(<ToggleCard tabs={TABS} ariaLabel="Your team" />);

    expect(html.match(/href="[^"]*\/features\/mobile-scanner"/g)).toHaveLength(1);
    expect(textOf(html)).toContain("See the app");
  });

  test("one tab is a bare white surface: no tab list, no panel role, nothing inert", () => {
    const html = renderEn(<ToggleCard tabs={[TABS[0]]} ariaLabel="At a glance" />);

    expect(html).not.toContain('role="tablist"');
    expect(html).not.toContain('role="tabpanel"');
    expect(html).not.toMatch(/\binert\b/);
    expect(html).toContain("join screen");
    expect(textOf(html)).toContain("A code, then the scanner");
  });
});

describe("PlatformHero: the fan hero a preview can reuse", () => {
  test("takes the page's slug, its own cards and its second action: the preview's label, headline and sub, then the trial and its own button", async () => {
    const { hero } = LANDING_PAGES["platform/card-design"];
    const html = await renderEnAsync(
      <PlatformHero slug="platform/card-design" slots={CARD_DESIGN_FAN_SLOTS} secondary={{ label: "Try the designer", href: "#playground" }} />,
    );

    expectInOrder(html, [hero.eyebrow ?? "", hero.accent, hero.sub ?? "", SHARED.cta, "Try the designer"]);
    expect(html).toMatch(/<a [^>]*href="#playground"/);
    expect(html).not.toContain(SHARED.demoLink);
  });

  test("with its own cards, the fan shows those and not Platform's", async () => {
    expect(await renderEnAsync(<PlatformHero slots={CARD_DESIGN_FAN_SLOTS} />)).not.toBe(await renderEnAsync(<PlatformHero />));
  });
});

describe("PreviewHero: eyebrow, headline, sub, the actions, then the visual", () => {
  const html = (props: Partial<Parameters<typeof PreviewHero>[0]> = {}) =>
    renderEn(<PreviewHero slug="platform/mobile-scanner" visual={<i>scanner phone</i>} {...props} />, { us: true });

  test("prints the page's own words in that order, with its headline's accent in orange", () => {
    const { hero } = LANDING_PAGES["platform/mobile-scanner"];

    expectInOrder(html(), [hero.eyebrow ?? "", hero.accent, hero.sub ?? "", SHARED.cta, "14 days free", "scanner phone"]);
    expect(html()).toMatch(new RegExp(`<span class="text-\\[var\\(--accent\\)\\]">${hero.accent.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}</span>`));
    expect(html().match(/<h1/g)).toHaveLength(1);
  });

  test("the second action is Try it on your phone to #demo unless the page says otherwise, or says none", () => {
    expect(html()).toMatch(/<a [^>]*href="#demo"/);
    expect(html({ secondary: { label: "Try the designer", href: "#playground" } })).toMatch(/<a [^>]*href="#playground"/);
    expect(html({ secondary: null })).not.toContain('href="#');
  });

  test("a plan chip can sit beside the eyebrow", () => {
    expect(textOf(html({ eyebrowPlan: "Growth and Pro" }))).toContain("Growth and Pro");
    expect(textOf(html())).not.toContain("Growth and Pro");
  });

  test("it is the page's hero section, with a trial button tracked as the hero's", () => {
    const source = code(join(COMPONENTS_DIR, "feature-previews", "PreviewHero.tsx"));

    expect(html()).toContain('data-landing-section="hero"');
    expect(findTag(source, "LpCtaPair")?.attrs).toContain('location="hero"');
  });
});

describe("RelatedPreviews: three links to the page's siblings", () => {
  test.each(PREVIEW_SLUGS)("%s links to its three siblings, each a tall tap target to the sibling's own URL", (slug) => {
    const html = renderEn(<RelatedPreviews slug={slug} />);
    const hrefs = [...html.matchAll(/<a [^>]*href="([^"]+)"/g)].map((match) => match[1]);

    expect(hrefs).toEqual((LANDING_PAGES[slug].related ?? []).map((sibling) => `/us/landing-pages/${sibling}`));
    expect(html).toContain('data-landing-section="related"');
    expect(html.match(/min-h-14/g)).toHaveLength(3);
  });

  test("each card says what the sibling is, in the shared copy, and no card points at a live feature page", () => {
    const html = renderEn(<RelatedPreviews slug="platform/card-design" />);
    const text = textOf(html);

    expect(text).toContain(PREVIEW_SHARED.related.title);
    for (const card of [PREVIEW_SHARED.related.cards.mobileScanner, PREVIEW_SHARED.related.cards.pushNotifications, PREVIEW_SHARED.related.cards.analytics]) {
      expect(text).toContain(card.title);
      expect(text).toContain(card.line);
    }
    expect(html).not.toMatch(/href="[^"]*\/features\//);
    expect(html).not.toContain("—");
  });
});

describe("Platform's sections are made of the generalised pieces", () => {
  test.each([
    ["HowTable", "StepsTable"],
    ["PlatformToggleCard", "ToggleCard"],
    ["ProgramTypeRows", "HoverRows"],
  ])("%s is a thin wrapper that draws %s with Platform's words", (wrapper, generic) => {
    const source = code(join(PLATFORM_DIR, `${wrapper}.tsx`));

    expect(openingTags(source).some((tag) => tag.name === generic)).toBe(true);
  });
});

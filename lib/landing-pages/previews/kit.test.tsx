/**
 * The kit the five previews are built from: the three pieces Platform's sections
 * were generalised into (a steps table, hover rows, a toggle card), the optional
 * props the Platform pieces gained, and the two preview-only blocks (the hero
 * and the sibling links). What Platform's own pieces render by default is pinned
 * by snapshots in `../default-renders.test.tsx`; this file is what the previews
 * can do that Platform does not.
 */

import { describe, expect, test } from "bun:test";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { AnnotatedWalletCard } from "@/components/features/design-de-carte/AnnotatedWalletCard";
import { IconMarquee } from "@/components/features/design-de-carte/IconLibrarySection";
import { PreviewHero } from "@/components/landing-pages/feature-previews/PreviewHero";
import { RelatedPreviews } from "@/components/landing-pages/feature-previews/RelatedPreviews";
import { HoverRows, HOVER_INTENT_MS, allRowsOpen, hoverIntent } from "@/components/landing-pages/platform/HoverRows";
import { DeliverAnalytics, Kpi, VisitsOverTime } from "@/components/landing-pages/platform/DeliverAnalytics";
import { LpAccentBand } from "@/components/landing-pages/platform/LpAccentBand";
import { LpCtaPair } from "@/components/landing-pages/platform/LpCtaPair";
import { NumberFigures } from "@/components/landing-pages/platform/NumbersBlock";
import * as ProgramTypeRowsModule from "@/components/landing-pages/platform/ProgramTypeRows";
import { StepsTable } from "@/components/landing-pages/platform/StepsTable";
import { ToggleCard } from "@/components/landing-pages/platform/ToggleCard";
import { LpFaq } from "@/components/landing-pages/shared/LpFaq";
import { ScannerLoop } from "@/components/ui/ScannerLoop";
import { stampIcons } from "@/components/onboarding/StampIconPicker";
import { scannerLoopFiles } from "@/lib/videos/scanner-loop";
import { ROOT, code, findTag, openingTags } from "../../testing/jsx-source";
import { stackZooms } from "../../testing/stacked-rows";
import { COMPONENTS_DIR } from "../../testing/landing-pages-source";
import { renderEn, textOf } from "../../testing/render-en";
import { PREVIEW_SHARED } from "../copy/previews/shared";
import { SHARED } from "../copy/shared";
import { LANDING_PAGES, PREVIEW_SLUGS } from "../pages";

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

  test("a row's title is the button that opens it, and a click, a focus or a hover is all it takes", () => {
    const source = code(join(PLATFORM_DIR, "HoverRows.tsx"));
    const handlers = openingTags(source).flatMap((tag) => [...tag.attrs.matchAll(/\b(on[A-Z]\w+)=\{[^}]*item\.key/g)].map((match) => match[1]));

    expect(handlers.sort()).toEqual(["onClick", "onFocus", "onPointerEnter"]);
    expect(source).not.toContain("IntersectionObserver");
  });

  test("a row's picture sits in a 128px column beside its words on a phone, as it did, unless the rows are asked to stack", () => {
    const plain = renderEn(<HoverRows items={ITEMS} visuals={VISUALS} />);

    expect(renderEn(<HoverRows items={ITEMS} visuals={VISUALS} stackOnPhone={undefined} />)).toBe(plain);
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

  test("Platform's program rows are these rows: its tests keep the helpers they import from there", () => {
    expect(ProgramTypeRowsModule.allRowsOpen).toBe(allRowsOpen);
    expect(ProgramTypeRowsModule.hoverIntent).toBe(hoverIntent);
    expect(ProgramTypeRowsModule.HOVER_INTENT_MS).toBe(HOVER_INTENT_MS);
    expect(allRowsOpen({ wide: false, calm: false })).toBe(true);
    expect(allRowsOpen({ wide: true, calm: false })).toBe(false);
  });
});

describe("HoverRows stackOnPhone: only the rows of dense pictures ask for it", () => {
  const PREVIEWS = join(COMPONENTS_DIR, "feature-previews");

  test.each([
    ["the analytics questions", true, join(PREVIEWS, "analytics", "QuestionsSection.tsx")],
    ["the scanner counter", true, join(PREVIEWS, "mobile-scanner", "CounterSection.tsx")],
    ["the campaign ideas", true, join(PREVIEWS, "promotional-campaigns", "IdeasSection.tsx")],
    ["the card design stamp rows", false, join(PREVIEWS, "card-design", "StampStyleRows.tsx")],
    ["Platform's program rows", false, join(PLATFORM_DIR, "ProgramTypeRows.tsx")],
  ])("%s: stacks on a phone is %p", (_rows, stacks, file) => {
    const attrs = findTag(code(file), "HoverRows")?.attrs ?? "";

    expect(/(?:^|\s)stackOnPhone(?![\w-])/.test(attrs)).toBe(stacks);
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

describe("what the Platform pieces take for the previews", () => {
  test("LpCtaPair: a second action of the page's own, or none", () => {
    const own = renderEn(<LpCtaPair location="hero" secondary={{ label: "Try the designer", href: "#playground" }} />, { us: true });
    const none = renderEn(<LpCtaPair location="hero" secondary={null} />, { us: true });

    expect(own).toMatch(/<a [^>]*href="#playground"[^>]*>/);
    expect(own).toContain("h-[52px]");
    expect(textOf(own)).toContain("Try the designer");
    expect(textOf(own)).not.toContain(SHARED.demoLink);
    expect(none).not.toContain('href="#');
    expect(textOf(none)).toContain(SHARED.cta);
  });

  test("LpAccentBand: the page's own headline, accent word and line", () => {
    const html = renderEn(
      <LpAccentBand copy={{ title: "Fill your next slow day.", accent: "slow day.", sub: "Start your free trial." }} />,
      { us: true },
    );

    expect(html).toMatch(/<h2[^>]*>[^<]*<span class="text-\[var\(--accent\)\]">slow day\.<\/span><\/h2>/);
    expect(textOf(html)).toContain("Start your free trial.");
    expect(textOf(html)).not.toContain("Launch your loyalty card");
  });

  test("NumberFigures: a source line under the row when it is given, and none when it is not", () => {
    const items = [{ value: "88%", label: "join" }, { value: "95%", label: "stay" }];
    const sourced = renderEn(<NumberFigures items={items} source="Stampeo data, 86 businesses, February to October 2026" />);

    expect(textOf(sourced)).toContain("Stampeo data, 86 businesses, February to October 2026");
    expect(sourced.indexOf("Stampeo data")).toBeGreaterThan(sourced.lastIndexOf("</ul>") - 1);
    expect(renderEn(<NumberFigures items={items} />)).not.toContain("Stampeo data");
  });

  test("LpFaq: a page's own questions under its own title, still ending on the contact line", () => {
    const html = renderEn(<LpFaq faq={{ title: "Card styles, answered", items: [{ question: "Can I change it?", answer: "Anytime." }] }} />, { us: true });
    const text = textOf(html);

    expect(text).toContain("Card styles, answered");
    expect(text).toContain("Can I change it?");
    expect(text).toContain("Anytime.");
    expect(text).not.toContain(SHARED.faq.items[0].question);
    expect(text).toContain(SHARED.faq.contact.link);
  });

  test("LpFaq: an eyebrow gives the FAQ Platform's centred header, with the questions and the contact line below it in the same narrow column", () => {
    const items = [{ question: "Can I change it?", answer: "Anytime." }];
    const withEyebrow = renderEn(<LpFaq faq={{ eyebrow: "FAQ", title: "Card styles, answered", items }} />, { us: true });
    const text = textOf(withEyebrow);

    expect(text.indexOf("FAQ")).toBeGreaterThan(-1);
    expect(text.indexOf("FAQ")).toBeLessThan(text.indexOf("Card styles, answered"));
    expect(text.indexOf("Card styles, answered")).toBeLessThan(text.indexOf("Can I change it?"));
    expect(text.indexOf("Can I change it?")).toBeLessThan(text.indexOf(SHARED.faq.contact.link));
    expect(withEyebrow).toContain("mx-auto text-center");
    expect(withEyebrow).toMatch(/<section[^>]*data-landing-section="faq"/);
    expect(withEyebrow).toContain("max-w-[840px]");
  });

  test("LpFaq: without an eyebrow the title stays left-aligned with no label above it", () => {
    const html = renderEn(<LpFaq faq={{ title: "Card styles, answered", items: [{ question: "Can I change it?", answer: "Anytime." }] }} />, { us: true });

    expect(html).not.toContain("text-center");
    expect(html).not.toContain("tracking-[0.2em]");
  });

  test("ScannerLoop: `still` shows the finished stamp as a picture from the first paint", () => {
    const files = scannerLoopFiles("en");
    const frame = (html: string) => html.match(/<img\b[^>]*\bsrc="\/videos\/scanner-loop\/[^"]*"[^>]*>/)?.[0] ?? "";

    expect(frame(renderEn(<ScannerLoop still />))).toContain(encodeURIComponent(files.still).replaceAll("%2F", "/"));
    expect(frame(renderEn(<ScannerLoop />))).toContain(files.first);
    expect(renderEn(<ScannerLoop still />)).not.toContain("<video");
  });

  test("AnnotatedWalletCard: a page can bring its own heading and section band", () => {
    const html = renderEn(<AnnotatedWalletCard heading={<h2>Every part of the card is yours.</h2>} sectionClassName="py-10 bg-white" />);

    expect(html).toContain("Every part of the card is yours.");
    expect(html).toContain('class="py-10 bg-white"');
    expect(html).not.toContain("py-16 sm:py-24 bg-[var(--blog-bg)]");
  });

  test("IconMarquee: a row of icon tiles that drifts, from the ids it is given", () => {
    const icons = stampIcons.slice(0, 4).map((icon) => icon.id);
    const html = renderEn(<IconMarquee icons={icons} colorOffset={0} duration={70} />);

    expect(html.match(/<svg/g)).toHaveLength(icons.length * 2);
    expect(html).toContain("marquee-scroll 70s linear infinite");
  });

  test("DeliverAnalytics: its tiles and chart can be drawn on their own", () => {
    const kpi = renderEn(<Kpi label="Return rate" value="61%" trend="▲2 pts" />);

    expect(textOf(kpi)).toContain("Return rate|61%|▲2 pts");
    expect(textOf(renderEn(<VisitsOverTime />))).toContain("Visits over time");
    expect(renderEn(<VisitsOverTime />).match(/data-week=/g)).toHaveLength(13);
    expect(renderEn(<DeliverAnalytics />)).toContain(renderEn(<VisitsOverTime />));
  });
});

describe("PlatformHero: the fan hero a preview can reuse", () => {
  const source = () => code(join(PLATFORM_DIR, "PlatformHero.tsx"));

  test("takes the page's slug, its own cards and its second action, and Platform's are the defaults", () => {
    expect(source()).toMatch(/slug\s*=\s*"platform"/);
    expect(source()).toMatch(/slots\s*=\s*PLATFORM_FAN_SLOTS/);
    expect(findTag(source(), "LpCtaPair")?.attrs).toMatch(/\bsecondary=\{secondary\}/);
  });

  test("prints an eyebrow above the headline and a sub under it only when the page's registry entry has them", () => {
    const hero = source();

    expect(hero).toMatch(/\{eyebrow &&/);
    expect(hero).toMatch(/\{sub &&/);
    expect(hero.indexOf("{eyebrow")).toBeLessThan(hero.indexOf("<h1"));
    expect(hero.indexOf("{sub")).toBeGreaterThan(hero.indexOf("</h1>"));
    expect(LANDING_PAGES.platform.hero).not.toHaveProperty("eyebrow");
    expect(LANDING_PAGES.platform.hero).not.toHaveProperty("sub");
  });
});

describe("PreviewHero: eyebrow, headline, sub, the actions, then the visual", () => {
  const html = (props: Partial<Parameters<typeof PreviewHero>[0]> = {}) =>
    renderEn(<PreviewHero slug="platform/mobile-scanner" visual={<i>scanner phone</i>} {...props} />, { us: true });

  test("prints the page's own words in that order, with its headline's accent in orange", () => {
    const { hero } = LANDING_PAGES["platform/mobile-scanner"];
    const text = textOf(html());
    const at = [hero.eyebrow ?? "", hero.accent, hero.sub ?? "", SHARED.cta, "14 days free", "scanner phone"].map((line) => text.indexOf(line));

    expect(at.every((index) => index > -1)).toBe(true);
    expect(at).toEqual([...at].sort((a, b) => a - b));
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

  test("the preview-only code has a folder of its own, and the shared folders stay under 30 files", () => {
    expect(readdirSync(join(ROOT, "components", "landing-pages", "feature-previews")).length).toBeGreaterThan(0);
    for (const dir of ["shared", "platform", "feature-previews"]) {
      expect(readdirSync(join(ROOT, "components", "landing-pages", dir)).length).toBeLessThanOrEqual(30);
    }
  });
});

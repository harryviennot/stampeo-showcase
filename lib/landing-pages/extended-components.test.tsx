/**
 * The site components the landing pages extend with an optional prop: what the
 * prop does when a page passes it. That a component renders as before when it
 * is left out is the call-site table in `shared-sections.test.ts`.
 */

import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { BlogCard } from "@/components/blog/BlogCard";
import { WalletCard } from "@/components/card/WalletCard";
import { LiveActivityFeed } from "@/components/features/analytics/LiveActivityFeed";
import { AnnotatedWalletCard } from "@/components/features/design-de-carte/AnnotatedWalletCard";
import { IconLibrarySection, IconMarquee } from "@/components/features/design-de-carte/IconLibrarySection";
import { CardDesignPlayground } from "@/components/features/design-de-carte/CardDesignPlayground";
import { CompactPlayground } from "@/components/features/design-de-carte/CompactPlayground";
import { NotificationSequenceDemo } from "@/components/features/notifications-push/NotificationSequenceDemo";
import { DeliverAnalytics, Kpi, VisitsOverTime } from "@/components/landing-pages/platform/DeliverAnalytics";
import { LpAccentBand } from "@/components/landing-pages/platform/LpAccentBand";
import { LpCtaPair } from "@/components/landing-pages/platform/LpCtaPair";
import { NumberFigures } from "@/components/landing-pages/platform/NumberFigures";
import { LpFaq } from "@/components/landing-pages/shared/LpFaq";
import { stampIcons } from "@/components/onboarding/StampIconPicker";
import { CTAButton } from "@/components/ui/CTAButton";
import { FAQList } from "@/components/ui/FAQList";
import { ScannerLoop } from "@/components/ui/ScannerLoop";
import { Segmented } from "@/components/ui/Segmented";
import { isStill } from "@/hooks/usePrefersReducedMotion";
import { scannerLoopFiles } from "@/lib/videos/scanner-loop";
import type { BlogPostMeta } from "../blog/types";
import { loadCatalog } from "../testing/catalogs";
import { ROOT, code, findTag } from "../testing/jsx-source";
import { expectInOrder, renderEn as render, textOf } from "../testing/render-en";
import { renderAs } from "../testing/visitor-seams";
import { SHARED } from "./copy/shared";

const MESSAGES = loadCatalog("en");

describe("Segmented size", () => {
  const options = [
    { value: "a", label: "Dashboard" },
    { value: "b", label: "Scanner app" },
  ];
  const tabs = (size?: "md" | "lg") =>
    render(<Segmented options={options} value="a" onChange={() => {}} size={size} />);

  test("the large tabs are 44px tall, to tap on a phone", () => {
    expect(tabs("lg")).toContain("h-11");
  });

  test("the default tabs stay the compact ones", () => {
    expect(tabs()).not.toContain("h-11");
    expect(tabs("md")).toBe(tabs());
  });
});

describe("WalletCard headerLabel", () => {
  const design = { total_stamps: 6, background_color: "#FFFFFF", logo_url: "/themes/barber/logo.avif" };

  test("a level card shows its level name over the count, where the program's name was", () => {
    const html = textOf(render(<WalletCard design={design} stamps={4} headerLabel="Silver" />));

    expect(html).toContain("Silver");
    expect(html).toContain("4 / 6");
    expect(html).not.toContain("Stamps");
  });

  test("without it the card says what it always did", () => {
    expect(textOf(render(<WalletCard design={design} stamps={4} />))).toContain("Stamps");
  });
});

const MOMENTS = [
  {
    key: "stamp",
    title: "Stamp collected",
    description: "Sent on every scan.",
    planLabel: "Every plan",
    stamps: 5,
    banner: { appName: "Aurevo", title: "Stamp collected! You have 5 of 8 stamps." },
  },
  {
    key: "broadcast",
    title: "Broadcast",
    description: "Your own message.",
    planLabel: "Growth and Pro",
    stamps: 5,
    banner: { appName: "Aurevo", title: "Fresh rolls are out." },
  },
];

describe("NotificationSequenceDemo moments and design", () => {
  test("without moments it is the feature page's demo, sent by Stampeo", () => {
    const html = textOf(render(<NotificationSequenceDemo />));

    expect(html).toContain("Stampeo");
    expect(html).toContain("Mon Café");
  });

  test("with moments it lists them with their plans, and the phone shows the first banner from its sender", () => {
    const html = textOf(render(<NotificationSequenceDemo moments={MOMENTS} design={{ organization_name: "Aurevo" }} />));

    expect(html).toContain("Stamp collected");
    expect(html).toContain("Growth and Pro");
    expect(html).toContain("Every plan");
    expect(html).toContain("Aurevo");
    expect(html).toContain("Stamp collected! You have 5 of 8 stamps.");
    expect(html).not.toContain("Stampeo");
    expect(html).not.toContain("Mon Café");
  });
});

describe("NotificationSequenceDemo stillWhenReduced", () => {
  /** The thin countdown bar under the active moment: what shows the demo is about to move on. */
  const countdowns = (html: string) => html.match(/h-\[2px\] rounded-full bg-gray-100/g)?.length ?? 0;

  test.each([
    ["a demo asked to stand still, for a reader who asks for less motion", true, true, 0],
    ["a demo asked to stand still, for a reader who allows motion", true, false, 1],
    ["a demo not asked, for a reader who asks for less motion", false, true, 1],
  ])("%s", (_who, stillWhenReduced, reducedMotion, bars) => {
    const html = renderAs({ reducedMotion }, () => render(<NotificationSequenceDemo moments={MOMENTS} stillWhenReduced={stillWhenReduced} />));

    expect(countdowns(html)).toBe(bars);
    expect(html.match(/<button\b/g)).toHaveLength(MOMENTS.length);
  });
});

describe("the card playground: full and compact", () => {
  const catalog = MESSAGES.features["design-de-carte"].custom.playground as Record<string, string>;
  const EXTRAS = ["nameToggle", "rewardsToggle", "shuffle", "modeCustom"];

  test("the full playground is a section of its own, with every control", () => {
    const html = render(<CardDesignPlayground />);

    expect(html).toContain('id="playground"');
    for (const key of ["sectionTitle", ...EXTRAS]) expect(textOf(html)).toContain(catalog[key]);
  });

  test("the compact one keeps the program, theme, icon and stamp count, and drops the rest, with no section or heading of its own", () => {
    const html = render(<CompactPlayground />);

    for (const key of ["programLabel", "themeLabel", "iconLabel"]) expect(textOf(html)).toContain(catalog[key]);
    for (const key of EXTRAS) expect(textOf(html)).not.toContain(catalog[key]);
    expect(html).not.toContain('id="playground"');
    expect(html).not.toContain("<h2");
  });
});

describe("CompactPlayground touchTargets", () => {
  /** The first segmented control of the panel: the Program toggle, or the strip toggle on its own. */
  const firstTabs = (html: string) => html.match(/<button class="flex-1 rounded-lg[^"]*"/)?.[0] ?? "";
  const slider = (html: string) => html.match(/<input[^>]*type="range"[^>]*>/)?.[0] ?? "";

  test("the program toggle and the stamps slider are 44px tall to tap on a phone", () => {
    const html = render(<CompactPlayground touchTargets />);

    expect(firstTabs(html)).toContain("h-11");
    expect(slider(html)).toContain("h-11");
  });

  test("left out, the toggle and the slider are the compact ones", () => {
    const html = render(<CompactPlayground />);

    expect(firstTabs(html)).toContain("px-3 py-1.5 text-sm");
    expect(firstTabs(html)).not.toContain("h-11");
    expect(slider(html)).not.toContain("h-11");
  });

  test("a visitor who switches to points keeps the 44px controls: the strip toggle's tabs and the balance slider", () => {
    const points = renderAs({ program: "points" }, () => render(<CompactPlayground touchTargets />));
    const tabs = points.match(/<button class="flex-1 rounded-lg[^"]*"/g) ?? [];

    expect(tabs.length).toBeGreaterThan(2);
    expect(tabs.filter((tab) => !tab.includes("h-11"))).toEqual([]);
    expect(slider(points)).toContain("h-11");
  });

  test("and left out, points mode has the compact toggle and slider too", () => {
    const points = renderAs({ program: "points" }, () => render(<CompactPlayground />));

    expect(points).not.toMatch(/<button class="flex-1 rounded-lg[^"]*h-11/);
    expect(slider(points)).not.toContain("h-11");
  });

  test("the how-it-works step, which has always shown the compact one, does not ask", () => {
    const step = findTag(code(join(ROOT, "components/landing-pages/how-it-works/CreateStep.tsx")), "CompactPlayground");

    expect(step).toBeDefined();
    expect(step?.attrs).not.toMatch(/\w/);
  });
});

describe("AnnotatedWalletCard", () => {
  test("toggleSize makes the stamps and points switch 44px tall when asked, and the compact one when not", () => {
    expect(render(<AnnotatedWalletCard toggleSize="lg" />)).toContain("flex-1 rounded-lg h-11 px-4 text-[15px]");
    expect(render(<AnnotatedWalletCard />)).toContain("flex-1 rounded-lg px-3 py-1.5 text-sm");
    expect(render(<AnnotatedWalletCard />)).not.toContain("h-11");
  });

  test("a page can bring its own heading and section band", () => {
    const html = render(<AnnotatedWalletCard heading={<h2>Every part of the card is yours.</h2>} sectionClassName="py-10 bg-white" />);

    expect(html).toContain("Every part of the card is yours.");
    expect(html).toContain('class="py-10 bg-white"');
    expect(html).not.toContain("py-16 sm:py-24 bg-[var(--blog-bg)]");
  });
});

describe("IconMarquee", () => {
  const icons = stampIcons.slice(0, 4).map((icon) => icon.id);
  /** The classes of the element that carries the drifting animation. */
  const track = (html: string) => html.match(/<div class="([^"]*)" style="animation:marquee-scroll[^"]*"/)?.[1] ?? "";

  test("a row of icon tiles drifts, from the ids it is given", () => {
    const html = render(<IconMarquee icons={icons} colorOffset={0} duration={70} />);

    expect(html.match(/<svg/g)).toHaveLength(icons.length * 2);
    expect(html).toContain("marquee-scroll 70s linear infinite");
  });

  test("stillWhenReduced: the track that drifts stops for a reader who asks for less motion when the row is asked to", () => {
    expect(track(render(<IconMarquee icons={icons} colorOffset={0} duration={70} stillWhenReduced />))).toContain("motion-reduce:animate-none!");
  });

  test("left out, the row drifts for every reader, and the live icon library's rows do", () => {
    expect(track(render(<IconMarquee icons={icons} colorOffset={0} duration={70} />))).not.toContain("animate-none");
    expect(render(<IconLibrarySection />)).not.toContain("animate-none");
  });
});

describe("what a page can ask of Platform's pieces", () => {
  test("LpCtaPair: a second action of the page's own, or none", () => {
    const own = render(<LpCtaPair location="hero" secondary={{ label: "Try the designer", href: "#playground" }} />, { us: true });
    const none = render(<LpCtaPair location="hero" secondary={null} />, { us: true });

    expect(own).toMatch(/<a [^>]*href="#playground"[^>]*>/);
    expect(own).toContain("h-[52px]");
    expect(textOf(own)).toContain("Try the designer");
    expect(textOf(own)).not.toContain(SHARED.demoLink);
    expect(none).not.toContain('href="#');
    expect(textOf(none)).toContain(SHARED.cta);
  });

  test("LpAccentBand: the page's own headline, accent word and line", () => {
    const html = render(
      <LpAccentBand copy={{ title: "Fill your next slow day.", accent: "slow day.", sub: "Start your free trial." }} />,
      { us: true },
    );

    expect(html).toMatch(/<h2[^>]*>[^<]*<span class="text-\[var\(--accent\)\]">slow day\.<\/span><\/h2>/);
    expect(textOf(html)).toContain("Start your free trial.");
    expect(textOf(html)).not.toContain("Launch your loyalty card");
  });

  test("NumberFigures: a source line under the row when it is given, and none when it is not", () => {
    const items = [{ value: "88%", label: "join" }, { value: "95%", label: "stay" }];
    const sourced = render(<NumberFigures items={items} source="Stampeo data, 86 businesses, February to October 2026" />);

    expect(textOf(sourced)).toContain("Stampeo data, 86 businesses, February to October 2026");
    expect(sourced.indexOf("Stampeo data")).toBeGreaterThan(sourced.lastIndexOf("</ul>") - 1);
    expect(render(<NumberFigures items={items} />)).not.toContain("Stampeo data");
  });

  describe("LpFaq", () => {
    const items = [{ question: "Can I change it?", answer: "Anytime." }];
    const faq = () => render(<LpFaq faq={{ title: "Card styles, answered", items }} />, { us: true });

    test("a page's own questions under its own title, still ending on the contact line", () => {
      const text = textOf(faq());

      expect(text).toContain("Card styles, answered");
      expect(text).toContain("Can I change it?");
      expect(text).toContain("Anytime.");
      expect(text).not.toContain(SHARED.faq.items[0].question);
      expect(text).toContain(SHARED.faq.contact.link);
    });

    test("a page's own questions get Platform's centred header, then the table of questions and the contact line in the same narrow column", () => {
      const html = faq();

      expectInOrder(html, ["Card styles, answered", "Can I change it?", SHARED.faq.contact.link]);
      expect(html).toContain("mx-auto text-center");
      expect(html).toMatch(/<section[^>]*data-landing-section="faq"/);
      expect(html).toContain("max-w-[840px]");
      expect(html).toContain("min-h-14");
    });

    test("the table opens as many questions as it is told to, and the rest stay closed", () => {
      const html = render(<FAQList table items={[...items, { question: "Second?", answer: "Yes." }]} defaultOpenCount={1} />);

      expect(html.match(/<details\b[^>]*\bopen\b/g)).toHaveLength(1);
      expect(html.match(/<details\b/g)).toHaveLength(2);
    });

  });

  test("ScannerLoop: `still` shows the finished stamp as a picture from the first paint", () => {
    const files = scannerLoopFiles("en");
    const frame = (html: string) => html.match(/<img\b[^>]*\bsrc="\/videos\/scanner-loop\/[^"]*"[^>]*>/)?.[0] ?? "";

    expect(frame(render(<ScannerLoop still />))).toContain(encodeURIComponent(files.still).replaceAll("%2F", "/"));
    expect(frame(render(<ScannerLoop />))).toContain(files.first);
    expect(render(<ScannerLoop still />)).not.toContain("<video");
  });

  test("DeliverAnalytics: its tiles and chart can be drawn on their own", () => {
    const kpi = render(<Kpi label="Return rate" value="61%" trend="▲2 pts" />);

    expect(textOf(kpi)).toContain("Return rate|61%|▲2 pts");
    expect(textOf(render(<VisitsOverTime />))).toContain("Visits over time");
    expect(render(<VisitsOverTime />).match(/data-week=/g)).toHaveLength(13);
    expect(render(<DeliverAnalytics />)).toContain(render(<VisitsOverTime />));
  });
});

describe("LiveActivityFeed cardOnly", () => {
  const feed = MESSAGES.features.analytiques.custom.activityFeed;

  test("draws the feed card alone: no section, no heading of its own", () => {
    const html = render(<LiveActivityFeed cardOnly />);

    expect(html).not.toContain("<section");
    expect(html).not.toContain("<h2");
    expect(textOf(html)).toContain(feed.title);
    expect(textOf(html)).toContain(feed.live);
  });

  test("without it the feed is the section it always was, with its heading", () => {
    const html = render(<LiveActivityFeed />);

    expect(html).toContain("<section");
    expect(textOf(html)).toContain(feed.sectionTitle);
  });

  test("softFrame swaps the inked 3D border for a light ring, and changes nothing else", () => {
    const soft = render(<LiveActivityFeed cardOnly softFrame />);
    const plain = render(<LiveActivityFeed cardOnly />);

    expect(soft).toContain("ring-1 ring-black/[0.05]");
    expect(soft).not.toContain("blog-card-3d");
    expect(plain).toContain("blog-card-3d");
    expect(soft.replace("rounded-2xl bg-white overflow-hidden ring-1 ring-black/[0.05]", "blog-card-3d rounded-2xl bg-white overflow-hidden")).toBe(plain);
  });

  test("roomBelow leaves the fifth row its bottom padding: the body is five 48px rows and both paddings tall, where the default is 16px shorter", () => {
    const body = (node: Parameters<typeof render>[0]) => Number(render(node).match(/class="p-4 overflow-hidden" style="height:(\d+)px/)?.[1]);

    expect(body(<LiveActivityFeed cardOnly roomBelow />)).toBe(5 * 48 + 32);
    expect(body(<LiveActivityFeed cardOnly />)).toBe(5 * 48 + 16);
    expect(body(<LiveActivityFeed />)).toBe(5 * 48 + 16);
  });
});

describe("BlogCard detail", () => {
  const post: BlogPostMeta = {
    title: "How points beat stamps",
    description: "A longer description that a card shows over two lines when the detail is rich.",
    publishedAt: "2026-09-24",
    author: "Stampeo",
    tags: ["points"],
    category: "Loyalty",
    slug: "how-points-beat-stamps",
    locale: "en",
    readingMinutes: 6,
  };

  test("the rich card adds the reading time and the excerpt", () => {
    const html = textOf(render(<BlogCard post={post} detail="rich" />));

    expect(html).toContain("6 min read");
    expect(html).toContain(post.description);
  });

  test("the default card is a category, a title and a date", () => {
    const html = textOf(render(<BlogCard post={post} />));

    expect(html).not.toContain("min read");
    expect(html).not.toContain(post.description);
    expect(html).toContain(post.title);
  });
});

describe("CTAButton variant", () => {
  test("the inverse button is a white pill with near-black text, for the accent band", () => {
    const html = render(<CTAButton label="Start my free trial" trackAs="final_cta" variant="inverse" />);

    expect(html).toContain("bg-white");
    expect(html).toContain("var(--near-black)");
    expect(html).not.toContain("bg-[var(--accent)]");
  });
});

// The reader's setting is read in the browser only, so what a component does with it is this one selector.
describe("stillWhenReduced", () => {
  test.each([
    [false, false, false],
    [false, true, false],
    [true, false, false],
    [true, true, true],
  ])("a component asked %p that meets a reader who asks for less motion: %p, so still is %p", (asked, reduced, still) => {
    expect(isStill(asked, reduced)).toBe(still);
  });

  test("LiveActivityFeed rests when the selector says so, and no other way", () => {
    const source = code(join(ROOT, "components/features/analytics/LiveActivityFeed.tsx"));

    expect(source).toMatch(/const still = isStill\(stillWhenReduced, reduced\)/);
    expect(source).not.toMatch(/stillWhenReduced\s*&&\s*reduced/);
  });
});

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
import { CardDesignPlayground } from "@/components/features/design-de-carte/CardDesignPlayground";
import { CompactPlayground } from "@/components/features/design-de-carte/CompactPlayground";
import { PointsControl } from "@/components/features/design-de-carte/playground/controls";
import { STRIP_STYLES, type Playground } from "@/components/features/design-de-carte/playground/usePlayground";
import { NotificationSequenceDemo } from "@/components/features/notifications-push/NotificationSequenceDemo";
import { CTAButton } from "@/components/ui/CTAButton";
import { Segmented } from "@/components/ui/Segmented";
import { isStill } from "@/hooks/usePrefersReducedMotion";
import type { BlogPostMeta } from "../blog/types";
import { loadCatalog } from "../testing/catalogs";
import { ROOT, code, findTag } from "../testing/jsx-source";
import { renderEn as render, textOf } from "../testing/render-en";

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

describe("NotificationSequenceDemo moments and design", () => {
  const moments = [
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

  test("without moments it is the feature page's demo, sent by Stampeo", () => {
    const html = textOf(render(<NotificationSequenceDemo />));

    expect(html).toContain("Stampeo");
    expect(html).toContain("Mon Café");
  });

  test("with moments it lists them with their plans, and the phone shows the first banner from its sender", () => {
    const html = textOf(render(<NotificationSequenceDemo moments={moments} design={{ organization_name: "Aurevo" }} />));

    expect(html).toContain("Stamp collected");
    expect(html).toContain("Growth and Pro");
    expect(html).toContain("Every plan");
    expect(html).toContain("Aurevo");
    expect(html).toContain("Stamp collected! You have 5 of 8 stamps.");
    expect(html).not.toContain("Stampeo");
    expect(html).not.toContain("Mon Café");
  });
});

// The reader's setting is read in the browser only, so the demo's rest is the same selector as the feed's.
describe("NotificationSequenceDemo stillWhenReduced", () => {
  const source = () => code(join(ROOT, "components/features/notifications-push/NotificationSequenceDemo.tsx"));

  test("rests when the selector says so, and no other way", () => {
    expect(source()).toMatch(/const still = isStill\(stillWhenReduced, reduced\)/);
    expect(source()).not.toMatch(/stillWhenReduced\s*&&\s*reduced/);
  });

  test("a demo that rests never starts the timer that moves to the next moment, and shows no countdown for it", () => {
    expect(source()).toMatch(/if \(isPaused \|\| still\) return;[\s\S]*setInterval/);
    expect(source()).toMatch(/isActive && !isPaused && !still &&/);
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

  test("the points card's strip toggle and balance slider are 44px as well, since the same panel shows them once a visitor switches to points", () => {
    // Points mode is state of the page; the control is rendered on its own with the playground's values.
    const p = {
      t: (key: string) => key,
      stripStyleLabels: {},
      stripStyle: STRIP_STYLES[0],
      setStripStyle: () => {},
      balance: 40,
      setBalance: () => {},
    } as unknown as Playground;

    expect(firstTabs(render(<PointsControl p={p} touch />))).toContain("h-11");
    expect(slider(render(<PointsControl p={p} touch />))).toContain("h-11");
    expect(firstTabs(render(<PointsControl p={p} />))).not.toContain("h-11");
    expect(slider(render(<PointsControl p={p} />))).not.toContain("h-11");
  });

  test("the how-it-works step, which has always shown the compact one, does not ask", () => {
    const step = findTag(code(join(ROOT, "components/landing-pages/how-it-works/CreateStep.tsx")), "CompactPlayground");

    expect(step).toBeDefined();
    expect(step?.attrs).not.toMatch(/\w/);
  });
});

describe("AnnotatedWalletCard toggleSize", () => {
  test("the stamps and points switch is 44px tall when asked, and the compact one when not", () => {
    expect(render(<AnnotatedWalletCard toggleSize="lg" />)).toContain("flex-1 rounded-lg h-11 px-4 text-[15px]");
    expect(render(<AnnotatedWalletCard />)).not.toContain("h-11");
    expect(render(<AnnotatedWalletCard toggleSize="md" />)).toBe(render(<AnnotatedWalletCard />));
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

// The fan is an async server component that asks next-intl for a translator, which only a Next request
// provides, so it is read as source.
describe("HeroCardFan slots", () => {
  const fan = () => code(join(ROOT, "components/landing-variant/HeroCardFan.tsx"));

  test("deals the cards it is given, and the homepage's year-round arch when it is given none", () => {
    expect(fan()).toMatch(/export async function HeroCardFan\(\{\s*slots\s*=\s*FAN_SLOTS\s*\}/);
    expect(fan()).toContain("{slots.map((slot) =>");
    expect(fan().match(/\bFAN_SLOTS\b/g)).toHaveLength(2);
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

/**
 * The site components the v2 landing pages extend with an optional prop: what
 * the prop does when a page passes it. (That a component renders as before
 * when it is left out is `shared-sections.test.ts`, on the call sites.)
 */

import { describe, expect, test } from "bun:test";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { WalletCard } from "@/components/card/WalletCard";
import { BlogCard } from "@/components/blog/BlogCard";
import { CardDesignPlayground } from "@/components/features/design-de-carte/CardDesignPlayground";
import { NotificationSequenceDemo } from "@/components/features/notifications-push/NotificationSequenceDemo";
import { ScanDemo } from "@/components/features/scanner-mobile/ScanDemo";
import { CTAButton } from "@/components/ui/CTAButton";
import { Segmented } from "@/components/ui/Segmented";
import type { BlogPostMeta } from "../blog/types";
import { loadCatalog } from "../testing/catalogs";

const MESSAGES = loadCatalog("en");

/** Server-renders `node` under the English catalogs, as a page does; a missing message throws. */
function render(node: ReactNode): string {
  return renderToStaticMarkup(
    <NextIntlClientProvider
      locale="en"
      timeZone="UTC"
      messages={MESSAGES}
      onError={(error) => {
        throw error;
      }}
    >
      {node}
    </NextIntlClientProvider>,
  );
}

const textOf = (html: string) => html.replace(/<[^>]*>/g, "|").replace(/\|+/g, "|");

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

describe("ScanDemo chrome", () => {
  test("the full demo draws its recording dot", () => {
    expect(render(<ScanDemo />)).toContain("REC");
  });

  test("the minimal demo draws neither the recording dot nor the timing", () => {
    const html = render(<ScanDemo chrome="minimal" />);

    expect(html).not.toContain("REC");
    expect(html).not.toMatch(/\d\.\d+s/);
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

describe("CardDesignPlayground compact", () => {
  const catalog = MESSAGES.features["design-de-carte"].custom.playground as Record<string, string>;

  test("the full playground keeps every control", () => {
    const html = textOf(render(<CardDesignPlayground />));

    for (const key of ["nameToggle", "rewardsToggle", "shuffle", "modeCustom"]) expect(html).toContain(catalog[key]);
  });

  test("the compact one keeps the program, theme, icon and stamp count, and drops the rest", () => {
    const html = textOf(render(<CardDesignPlayground compact />));

    for (const key of ["programLabel", "themeLabel", "iconLabel"]) expect(html).toContain(catalog[key]);
    for (const key of ["nameToggle", "rewardsToggle", "shuffle", "modeCustom"]) expect(html).not.toContain(catalog[key]);
  });

  test("the compact one is a body for a page's own section: no section of its own, and no heading", () => {
    const html = render(<CardDesignPlayground compact />);

    expect(html).not.toContain('id="playground"');
    expect(html).not.toContain("<h2");
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

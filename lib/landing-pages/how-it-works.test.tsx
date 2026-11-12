/**
 * The How-to page (`/us/landing-pages/how-it-works`): the sequence an owner
 * follows, with its own interactions. The steps map jumps to the step
 * sections, the designer is the compact one, the stamp step shows the
 * scanner and the customer's lock screen without claims the product cannot
 * back, and the first-day timeline prints the trial length through
 * `RegionText`. Server components that need no data are rendered; the rest are
 * read from source, like the other landing-page tests.
 */

import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { FirstDayTimeline } from "@/components/landing-pages/how-it-works/FirstDayTimeline";
import { StampStepVisual } from "@/components/landing-pages/how-it-works/StampStepVisual";
import { StepsOverview } from "@/components/landing-pages/how-it-works/StepsOverview";
import { LiveActivityFeed } from "@/components/features/analytics/LiveActivityFeed";
import { RegionPricingProvider } from "@/components/market/RegionPricingProvider";
import { MARKETS } from "../markets";
import { FALLBACK_PRICING } from "../pricing";
import { loadCatalog } from "../testing/catalogs";
import { ROOT, code, findTag, literalAttr, openingTags, read } from "../testing/jsx-source";
import { COMPONENTS_DIR, landingTree, otherCallers, pageComponent, pageFile, renderedSections } from "../testing/landing-pages-source";
import { HOW_IT_WORKS } from "./copy/how-it-works";
import { STAMP_BANNER } from "./copy/shared";
import { LANDING_PAGES } from "./pages";

const MESSAGES = loadCatalog("en");
const SLUG = "how-it-works";
const STEP_IDS = ["step_create", "step_share", "step_stamp"];
const OWN_DIR = join(COMPONENTS_DIR, SLUG);

/** Server-renders `node` as a page does: the English catalogs and the US terms. */
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
      <RegionPricingProvider
        ladders={{ eur: FALLBACK_PRICING.eur, usd: FALLBACK_PRICING.usd }}
        defaultCurrency="usd"
        defaultTrialDays={MARKETS.us.trialDays}
      >
        {node}
      </RegionPricingProvider>
    </NextIntlClientProvider>,
  );
}

const textOf = (html: string) =>
  html
    .replace(/<[^>]*>/g, "|")
    .replace(/\|+/g, "|")
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&");

/** The tag that opens the section `id`, wherever on the page it is drawn. */
function sectionTag(id: string) {
  for (const file of landingTree(pageFile(SLUG))) {
    const tag = openingTags(read(file)).find((candidate) => literalAttr(candidate.attrs, "section") === id);
    if (tag) return { file, tag };
  }
  return undefined;
}

describe("the sectors sit under the live feed, before the first day (AC19)", () => {
  test("in the order the page renders them", () => {
    const rendered = renderedSections(pageFile(SLUG));

    expect(rendered.slice(rendered.indexOf("see_it_work"), rendered.indexOf("first_day") + 1)).toEqual([
      "see_it_work",
      "sectors",
      "first_day",
    ]);
  });
});

describe("the steps map jumps to the step sections", () => {
  const html = () => render(<StepsOverview />);
  const links = () => [...html().matchAll(/<a\b[^>]*\bhref="#([\w-]+)"[^>]*>([\s\S]*?)<\/a>/g)];

  test("is one link per step, in order, each to the step's section", () => {
    expect(links().map((link) => link[1])).toEqual(STEP_IDS);
  });

  test("each link carries its number, the step's title and its line", () => {
    const steps = HOW_IT_WORKS.steps.items;

    links().forEach((link, index) => {
      expect(link[2]).toContain(`>${index + 1}</text>`);
      expect(textOf(link[2])).toContain(steps[index].title);
      expect(textOf(link[2])).toContain(steps[index].body);
    });
  });

  test("each link is a tap target of at least 44px", () => {
    const anchors = [...html().matchAll(/<a\b([^>]*\bhref="#[\w-]+"[^>]*)>/g)].map((match) => match[1]);

    expect(anchors).toHaveLength(STEP_IDS.length);
    for (const attrs of anchors) expect(attrs).toMatch(/\bmin-h-(?:11|\[(?:4[4-9]|[5-9]\d|\d{3})px\])/);
  });

  test("says what the steps are in the page's own words", () => {
    expect(textOf(html())).toContain(HOW_IT_WORKS.steps.title);
    expect(textOf(html())).toContain(HOW_IT_WORKS.steps.lead);
    expect(html()).toContain('data-landing-section="steps"');
  });

  test.each(STEP_IDS)("%s is a section of the page, and an anchor the map can land on", (id) => {
    const found = sectionTag(id);

    expect(LANDING_PAGES[SLUG].sections).toContain(id);
    expect(found?.tag.name).toBe("LpSection");
    expect(found?.tag.attrs).toMatch(/\banchor\b/);
  });
});

describe("step 1: the live card designer", () => {
  const source = () => code(pageComponent(SLUG, "CreateStep"));

  test("is the compact playground, so the card stays in view on a phone", () => {
    expect(findTag(source(), "CardDesignPlayground")?.attrs).toMatch(/\bcompact\b/);
  });

  test("says the first card can be made for you, on every plan, and offers the trial after the designer", () => {
    const cta = findTag(source(), "CTAButton");

    expect(source()).toContain("designHelp");
    expect(source()).toContain("ctaLead");
    expect(literalAttr(cta?.attrs ?? "", "variant")).toBe("outline");
    expect(literalAttr(cta?.attrs ?? "", "trackAs")).toBe("feature_cta");
    expect(source().indexOf("<CTAButton")).toBeGreaterThan(source().indexOf("<CardDesignPlayground"));
  });
});

describe("step 2: they scan, and it's in their wallet", () => {
  const source = () => code(pageComponent(SLUG, "ShareStep"));

  test("the flyer overlaps the Apple Wallet phone, and the three channels come from the copy", () => {
    const visual = code(pageComponent(SLUG, "ShareStepVisual"));

    expect(visual).toContain("<PlacardVisual");
    expect(visual).toContain("<WalletPhone");
    expect(source()).toContain("HOW_IT_WORKS.share");
    expect(source()).toMatch(/channels\.map\(/);
  });
});

describe("step 3: scan their card, that's the stamp (AC24)", () => {
  const html = () => render(<StampStepVisual />);

  test("the scanner is the minimal one: no recording dot, no timing", () => {
    expect(html()).not.toContain("REC");
    expect(code(pageComponent(SLUG, "StampStepVisual"))).toContain('chrome="minimal"');
  });

  test("the customer sees Aurevo's default stamp notification, sent by the café", () => {
    expect(textOf(html())).toContain("Aurevo");
    expect(textOf(html())).toContain(STAMP_BANNER.body);
    expect(code(pageComponent(SLUG, "StampStepVisual"))).toContain("lpBanner(STAMP_BANNER)");
  });

  test("says who does what under each device", () => {
    expect(textOf(html())).toContain(HOW_IT_WORKS.stamp.youCaption);
    expect(textOf(html())).toContain(HOW_IT_WORKS.stamp.theyCaption);
  });
});

describe("the live feed shows the owner's side", () => {
  test("is the feed card alone on this page: its own section and heading are left out", () => {
    const cardOnly = render(<LiveActivityFeed cardOnly />);
    const own = render(<LiveActivityFeed />);

    expect(cardOnly).not.toContain("<section");
    expect(cardOnly).not.toContain("<h2");
    expect(own).toContain("<section");
    expect(own).toContain("<h2");
  });

  test("the feature page's feed keeps its section: its other callers pass no `cardOnly`", () => {
    const callers = otherCallers("LiveActivityFeed", join(ROOT, "components/features/analytics/LiveActivityFeed.tsx"));

    expect(callers.length).toBeGreaterThan(0);
    expect(callers.filter(({ attrs }) => /(?:^|\s)cardOnly(?![\w-])/.test(attrs))).toEqual([]);
  });

  test("sits under the page's own words", () => {
    const found = sectionTag("see_it_work");
    const source = code(found?.file ?? "");

    expect(found).toBeDefined();
    expect(source).toContain("seeItWork");
    expect(findTag(source, "LiveActivityFeed")?.attrs).toMatch(/\bcardOnly\b/);
  });
});

describe("the first-day timeline (AC13)", () => {
  const html = () => render(<FirstDayTimeline />);
  const { items, closing, title, lead } = HOW_IT_WORKS.firstDay;

  test("walks the five moments in order, with the trial length for the visitor's region", () => {
    const steps = [...html().matchAll(/<li\b[\s\S]*?<\/li>/g)].map((match) => textOf(match[0]));

    expect(steps).toHaveLength(items.length);
    expect(steps[0]).toContain(items[0]);
    expect(steps[3]).toContain("Choose a plan, and your 14\u2011day free trial starts");
    expect(steps[4]).toContain(items[4]);
  });

  test("never prints the raw token", () => {
    expect(html()).not.toContain("{trialDays}");
    expect(html()).not.toContain("trialDays");
  });

  test("opens with its title and lead, and ends on the closing line", () => {
    expect(textOf(html())).toContain(title);
    expect(textOf(html())).toContain(lead);
    expect(html().lastIndexOf(closing)).toBeGreaterThan(html().lastIndexOf("</li>"));
  });

  test("marks its moments with icons, not the step numbers the map uses", () => {
    expect(html()).not.toMatch(/<text\b/);
  });
});

describe("the tinted bands (rhythm)", () => {
  test("the page has two, the steps map and the first day, and they are never next to each other", () => {
    const tinted = [...landingTree(pageFile(SLUG))]
      .filter((file) => file.startsWith(COMPONENTS_DIR))
      .flatMap((file) =>
        openingTags(read(file))
          .filter((tag) => tag.name === "LpSection" && /\btinted\b/.test(tag.attrs))
          .map((tag) => literalAttr(tag.attrs, "section")),
      );
    const order = LANDING_PAGES[SLUG].sections;
    const at = tinted.map((id) => order.indexOf(id as (typeof order)[number])).sort((a, b) => a - b);

    expect(tinted.sort()).toEqual(["first_day", "steps"]);
    expect(at[1] - at[0]).toBeGreaterThan(1);
  });

  test("the page carries no sentence of its own: every line is the copy's", () => {
    const files = [...landingTree(pageFile(SLUG))].filter((file) => file.startsWith(OWN_DIR));
    const sentences = files.flatMap((file) =>
      [...code(file).matchAll(/>\s*([A-Z][^<>{}]{12,})\s*</g)].map((match) => `${file.replace(ROOT, "")}: ${match[1]}`),
    );

    expect(sentences).toEqual([]);
  });
});

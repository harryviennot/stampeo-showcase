/**
 * The Features page's own behaviour (`/us/landing-pages/features`): the tabs
 * that switch between stamps, points and levels, the notification moments on
 * Aurevo's card, the scanner without its recording chrome, the tiles with their
 * plans, and the feed laid over the Analytics capture. Components that need a
 * browser or the server's translations are read from source; the rest are
 * rendered under the English catalogs, as a page does.
 */

import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { LiveActivityFeed } from "@/components/features/analytics/LiveActivityFeed";
import { NotificationSequenceDemo } from "@/components/features/notifications-push/NotificationSequenceDemo";
import { messageMoments } from "../../components/landing-pages/features/MessagesSpotlight";
import { MoreFeaturesGrid } from "../../components/landing-pages/features/MoreFeaturesGrid";
import { ProgramTypeTabs } from "../../components/landing-pages/features/ProgramTypeTabs";
import { AUREVO } from "../../components/landing-pages/shared/samples";
import { loadCatalog } from "../testing/catalogs";
import { ROOT, code, findTag, literalAttr, openingTags, read } from "../testing/jsx-source";
import { landingTree, otherCallers, pageFile, planLineWith, sectionSource } from "../testing/landing-pages-source";
import { FEATURES } from "./copy/features";
import { PROGRAM_TYPES } from "./copy/program-types";
import { SAMPLE_BUSINESS, SHARED, STAMP_BANNER } from "./copy/shared";

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

/** Every opening tag of that name in the files the Features page renders. */
const featuresTags = (name: string) =>
  [...landingTree(pageFile("features"))].flatMap((file) =>
    openingTags(read(file))
      .filter((tag) => tag.name === name)
      .map((tag) => ({ file, attrs: tag.attrs })),
  );

describe("the Stamps, Points and Levels tabs (AC20)", () => {
  const visuals = {
    stamps: <i data-visual="stamps" />,
    points: <i data-visual="points" />,
    levels: <i data-visual="levels" />,
  };
  const html = () => render(<ProgramTypeTabs heading={<h2>Stamps, points or levels.</h2>} visuals={visuals} />);

  test("one large tab per program type, in the copy's order", () => {
    const labels = [...html().matchAll(/role="tab"[^>]*>([^<]*)</g)].map((match) => match[1]);

    expect(PROGRAM_TYPES.map((type) => type.key)).toEqual(["stamps", "points", "levels"]);
    expect(labels).toEqual(PROGRAM_TYPES.map((type) => type.label));
    expect(html()).toContain("h-11");
  });

  test.each(PROGRAM_TYPES.map((type) => [type.key, type] as const))(
    "%s has its card, its title, its words, its facts and its plan on the page",
    (key, type) => {
      const text = textOf(html());

      expect(html()).toContain(`data-visual="${key}"`);
      expect(text).toContain(type.title);
      expect(text).toContain(type.body);
      for (const fact of type.facts) expect(text).toContain(fact.text);
      expect(text).toContain(type.plan);
    },
  );

  test("a fact that belongs to some plans carries them right after it", () => {
    const gated = PROGRAM_TYPES.flatMap((type) => type.facts).filter((fact) => fact.plan && fact.plan !== "Every plan");

    expect(gated.length).toBeGreaterThan(0);
    for (const fact of gated) expect(textOf(html())).toContain(`${fact.text}|${fact.plan}|`);
  });

  test("the first tab is open, and the other two are in the markup but invisible", () => {
    const panels = [...html().matchAll(/<div[^>]*data-panel="(\w+)"[^>]*>/g)].map((match) => ({
      key: match[1],
      hidden: /\binvisible\b/.test(match[0]),
    }));
    const keys = [...new Set(panels.map((panel) => panel.key))];

    expect(keys).toEqual(["stamps", "points", "levels"]);
    expect(panels.filter((panel) => !panel.hidden).map((panel) => panel.key)).toEqual(["stamps", "stamps"]);
  });

  test("says that stamps and points can be switched later, and offers the trial in an outline button", () => {
    const tabs = code(join(ROOT, "components/landing-pages/features/ProgramTypeTabs.tsx"));
    const cta = findTag(tabs, "CTAButton");

    expect(textOf(html())).toContain(SHARED.cta);
    expect(tabs).toContain("PROGRAM_SWITCH_LINE");
    expect(literalAttr(cta?.attrs ?? "", "variant")).toBe("outline");
    expect(literalAttr(cta?.attrs ?? "", "trackAs")).toBe("feature_cta");
  });

  test("the section gives the tabs a card for every program type: Aurevo's stamps, a points card, the level cards", () => {
    const section = sectionSource("features", "program_types");

    expect(section).toContain("<AurevoCard");
    expect(section).toContain("<LevelCards");
    expect(section).toMatch(/POINTS_SAMPLES|MARGINALIA/);
  });
});

describe("the notification moments (AC24)", () => {
  const moments = messageMoments();

  test("are the copy's three moments, sent by the sample business with its own icon, in the default wording", () => {
    expect(moments.map((moment) => moment.title)).toEqual(FEATURES.messages.moments.map((moment) => moment.title));
    expect(moments.map((moment) => moment.description)).toEqual(
      FEATURES.messages.moments.map((moment) => moment.description),
    );
    moments.forEach((moment, index) => {
      expect(moment.banner.appName).toBe(SAMPLE_BUSINESS);
      expect(moment.banner.appName).not.toMatch(/stampeo/i);
      expect(moment.banner.title).toBe(FEATURES.messages.moments[index].banner.body);
      expect(moment.banner.icon).toBeDefined();
    });
  });

  test("the broadcast carries its Growth and Pro chip; the stamp and the reward say every plan", () => {
    expect(moments.map((moment) => [moment.title, moment.planLabel])).toEqual([
      ["Stamp collected", "Every plan"],
      ["Reward unlocked", "Every plan"],
      ["Broadcast", SHARED.broadcastPlans],
    ]);
  });

  test("the card beside each banner has the stamps that banner counts", () => {
    const [, stamp] = STAMP_BANNER.body.match(/(\d+) of \d+ stamps/) ?? [];

    expect(moments[0].stamps).toBe(Number(stamp));
    expect(moments[1].stamps).toBe(AUREVO.design.total_stamps ?? 0);
    expect(moments.map((moment) => moment.key)).toEqual([...new Set(moments.map((moment) => moment.key))]);
  });

  test("on Aurevo's lock screen nothing is Stampeo's or the demo's default", () => {
    const text = textOf(render(<NotificationSequenceDemo moments={moments} design={AUREVO.design} />));

    for (const moment of FEATURES.messages.moments) expect(text).toContain(moment.title);
    expect(text).toContain(STAMP_BANNER.body);
    expect(text).not.toContain("Stampeo");
    expect(text).not.toContain("Mon Café");
  });

  test("the section crops the phone on a phone and prints the broadcast line with its plans", () => {
    const section = sectionSource("features", "spotlight_messages");
    const demo = findTag(section, "NotificationSequenceDemo");

    expect(demo?.attrs).toContain("messageMoments()");
    expect(demo?.attrs).toMatch(/phoneClassName=\{phoneCropClass\((?:520|560)\)\}/);
    expect(planLineWith(section, "FEATURES.messages.broadcast")).toContain("<PlanLine");
  });
});

describe("the scanner spotlight (AC24)", () => {
  test("shows the scan demo without its recording dot or its timer, and the three facts", () => {
    const demos = featuresTags("ScanDemo");

    expect(demos.length).toBeGreaterThan(0);
    expect(demos.map(({ attrs }) => literalAttr(attrs, "chrome"))).toEqual(demos.map(() => "minimal"));
    expect(sectionSource("features", "spotlight_scanner")).toContain("FEATURES.scanner.facts");
  });
});

describe("the tiles under everything else (AC20)", () => {
  const html = () => render(<MoreFeaturesGrid />);
  const rows = () => html().split("<li").slice(1);

  test("one tile for each of the six features, each printing its title, its line and its plan chip", () => {
    expect(rows()).toHaveLength(FEATURES.more.tiles.length);
    FEATURES.more.tiles.forEach((tile, index) => {
      const text = textOf(rows()[index]);

      expect(text).toContain(tile.title);
      expect(text).toContain(tile.body);
      expect(text).toContain(tile.plan ?? "never");
    });
  });

  test("every tile has a plan, and the plans are the three the pages may print", () => {
    expect(FEATURES.more.tiles.every((tile) => ["Every plan", "Growth and Pro", "Pro"].includes(tile.plan ?? ""))).toBe(true);
  });

  test("closes the tour with the trial in an outline button", () => {
    const cta = findTag(code(join(ROOT, "components/landing-pages/features/MoreFeaturesGrid.tsx")), "CTAButton");

    expect(textOf(html())).toContain(SHARED.cta);
    expect(literalAttr(cta?.attrs ?? "", "variant")).toBe("outline");
    expect(literalAttr(cta?.attrs ?? "", "trackAs")).toBe("feature_cta");
  });
});

describe("the live feed over the Analytics capture (AC9)", () => {
  test("cardOnly draws the feed card alone: no section, no heading of its own", () => {
    const html = render(<LiveActivityFeed cardOnly />);

    expect(html).not.toContain("<section");
    expect(html).not.toContain("<h2");
    expect(textOf(html)).toContain(MESSAGES.features.analytiques.custom.activityFeed.title);
    expect(textOf(html)).toContain(MESSAGES.features.analytiques.custom.activityFeed.live);
  });

  test("without it the feed is still the section it was, with its heading", () => {
    const html = render(<LiveActivityFeed />);

    expect(html).toContain("<section");
    expect(textOf(html)).toContain(MESSAGES.features.analytiques.custom.activityFeed.sectionTitle);
  });

  test("its other callers ask for none of it", () => {
    const callers = otherCallers("LiveActivityFeed", join(ROOT, "components/features/analytics/LiveActivityFeed.tsx"));

    expect(callers.length).toBeGreaterThan(0);
    expect(callers.filter(({ attrs }) => /(?:^|\s)cardOnly(?![\w-])/.test(attrs))).toEqual([]);
  });

  test("the spotlight lays the feed over the 'how often they come' capture and prints Sample data and its plan line", () => {
    const section = sectionSource("features", "spotlight_analytics");

    expect(findTag(section, "LiveActivityFeed")?.attrs).toMatch(/(?:^|\s)cardOnly(?![\w-])/);
    expect(section).toContain('landingShot("en", "phone-habits")');
    expect(section).toContain("SHARED.sampleData");
    expect(section).toContain("FEATURES.analytics.planLine");
  });
});

describe("the style gallery (AC24)", () => {
  test("speaks the page's words, with its own CTA hidden, over three facts", () => {
    const section = sectionSource("features", "spotlight_design");
    const gallery = findTag(section, "CardStyleGallery");

    expect(gallery?.attrs).toContain("showCta={false}");
    expect(gallery?.attrs).toContain("FEATURES.design.title");
    expect(gallery?.attrs).toContain("FEATURES.design.lead");
    expect(section).toContain("FEATURES.design.facts");
    expect(FEATURES.design.facts).toHaveLength(3);
  });
});

/**
 * The Features page's own behaviour (`/us/landing-pages/features`): the tabs
 * that switch between stamps, points and levels, the notification moments on
 * Aurevo's card, the scanner, the tiles, and the feed laid
 * over the Analytics capture. Async server components are read from source; the
 * rest are rendered under the English catalogs, as a page does.
 */

import { describe, expect, test } from "bun:test";
import { NotificationSequenceDemo } from "@/components/features/notifications-push/NotificationSequenceDemo";
import { messageMoments } from "../../components/landing-pages/features/MessagesSpotlight";
import { MoreFeaturesGrid } from "../../components/landing-pages/features/MoreFeaturesGrid";
import { ProgramTypeTabs } from "../../components/landing-pages/features/ProgramTypeTabs";
import { AUREVO } from "../../components/landing-pages/shared/samples";
import { findTag } from "../testing/jsx-source";
import { sectionSource } from "../testing/landing-pages-source";
import { renderEn as render, textOf } from "../testing/render-en";
import { mockEnglishServerTranslations } from "../testing/server-intl";
import { FEATURES } from "./copy/features";
import { PROGRAM_SWITCH_LINE, PROGRAM_TYPES } from "./copy/program-types";
import { LEVEL_UP_BANNER, SAMPLE_BUSINESS, SHARED, STAMP_BANNER } from "./copy/shared";

// The level cards are an async server component that asks next-intl for their words.
await mockEnglishServerTranslations();
const { LevelCards } = await import("@/components/landing-pages/shared/LevelCards");

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
    "%s has its card, its title, its words and its facts on the page",
    (key, type) => {
      const text = textOf(html());

      expect(html()).toContain(`data-visual="${key}"`);
      expect(text).toContain(type.title);
      expect(text).toContain(type.body);
      for (const fact of type.facts) expect(text).toContain(fact.text);
    },
  );

  test("the first tab is open, and the other two are in the markup but invisible", () => {
    const panels = [...html().matchAll(/<div[^>]*data-panel="(\w+)"[^>]*>/g)].map((match) => ({
      key: match[1],
      hidden: /\binvisible\b/.test(match[0]),
    }));
    const keys = [...new Set(panels.map((panel) => panel.key))];

    expect(keys).toEqual(["stamps", "points", "levels"]);
    expect(panels.filter((panel) => !panel.hidden).map((panel) => panel.key)).toEqual(["stamps", "stamps"]);
  });

  describe.each(PROGRAM_TYPES.map((type) => [type.key, type] as const))("opened on %s", (key, type) => {
    const others = PROGRAM_TYPES.filter((other) => other.key !== key);
    /** The real level cards under the level-up banner, as the section gives them; the other two types are stand-ins. */
    const open = async () =>
      render(
        <ProgramTypeTabs
          heading={<h2>Stamps, points or levels.</h2>}
          visuals={{ ...visuals, levels: await LevelCards({ banner: true }) }}
          initial={key}
        />,
      );
    /** Each panel of the markup: its type, whether it is invisible, and the markup up to the next panel. */
    const panels = (html: string) =>
      [...html.matchAll(/<div[^>]*data-panel="(\w+)"[^>]*>/g)].map((match, index, all) => ({
        key: match[1],
        hidden: /\binvisible\b/.test(match[0]),
        html: html.slice(match.index, all[index + 1]?.index),
      }));

    test("its tab is the chosen one, and its card and words are the only panels in view", async () => {
      const found = panels(await open());

      expect((await open()).match(/aria-selected="true"[^>]*>([^<]*)</)?.[1]).toBe(type.label);
      expect(found.filter((panel) => !panel.hidden).map((panel) => panel.key)).toEqual([key, key]);
      for (const other of others) expect(found.filter((panel) => panel.key === other.key).every((panel) => panel.hidden)).toBe(true);
    });

    test("the words in view are its own, and its card is the one drawn for it", async () => {
      const shown = panels(await open()).filter((panel) => !panel.hidden);
      const text = textOf(shown.map((panel) => panel.html).join(""));

      expect(text).toContain(type.title);
      expect(text).toContain(type.body);
      for (const other of others) expect(text).not.toContain(other.body);
      if (key === "levels") {
        expect(shown.map((panel) => panel.html).join("").replaceAll("&#x27;", "'")).toContain(
          `aria-label="${SHARED.levelCardsAlt}"`,
        );
        expect(text).toContain(LEVEL_UP_BANNER.body);
      } else {
        expect(shown.map((panel) => panel.html).join("")).toContain(`data-visual="${key}"`);
      }
    });
  });

  test("says that stamps and points can be switched later, and offers the trial", () => {
    const text = textOf(html());

    expect(text).toContain(PROGRAM_SWITCH_LINE);
    expect(text).toContain(SHARED.cta);
  });

  test("the section gives the tabs a card for every program type: Aurevo's stamps, a points card, the level cards", () => {
    const section = sectionSource("features", "program_types");

    for (const card of ["<AurevoCard", "<MarginaliaCard", "<LevelCards"]) expect(section).toContain(card);
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

  test("the moments are told as they are: the stamp, the reward and the broadcast", () => {
    expect(moments.map((moment) => moment.title)).toEqual(["Stamp collected", "Reward unlocked", "Broadcast"]);
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

  test("the section prints the broadcast line beside the page's own moments", () => {
    const section = sectionSource("features", "spotlight_messages");

    expect(findTag(section, "NotificationSequenceDemo")?.attrs).toContain("messageMoments()");
    expect(section).toContain("{FEATURES.messages.broadcast}");
  });
});

describe("the scanner spotlight (AC24)", () => {
  test("shows the copy's three facts", () => {
    expect(sectionSource("features", "spotlight_scanner")).toContain("FEATURES.scanner.facts");
  });
});

describe("the tiles under everything else (AC20)", () => {
  const html = () => render(<MoreFeaturesGrid />);
  const rows = () => html().split("<li").slice(1);

  test("one tile for each of the four features, each printing its title and its line", () => {
    expect(rows()).toHaveLength(FEATURES.more.tiles.length);
    expect(FEATURES.more.tiles).toHaveLength(4);
    FEATURES.more.tiles.forEach((tile, index) => {
      const text = textOf(rows()[index]);

      expect(text).toContain(tile.title);
      expect(text).toContain(tile.body);
    });
  });

  test("closes the tour with the trial", () => {
    expect(textOf(html())).toContain(SHARED.cta);
  });
});

describe("the live feed over the Analytics capture (AC9)", () => {
  test("the spotlight lays the feed over the top of Analytics, and prints Sample data", () => {
    const section = sectionSource("features", "spotlight_analytics");

    expect(findTag(section, "LiveActivityFeed")?.attrs).toMatch(/(?:^|\s)cardOnly(?![\w-])/);
    expect(section).toContain('landingShot("en", "phone")');
    expect(section).toContain("SHARED.sampleData");
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

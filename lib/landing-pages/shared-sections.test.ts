/**
 * What Platform and its previews share and what they borrow: the dashboard
 * capture, the sectors, the fact lists, the sender on a banner, the
 * tokens that must go through `RegionText`, and the site
 * components the pages extend, whose other callers must not notice. Async
 * server components are read from the source; the rest are rendered.
 */

import { describe, expect, test } from "bun:test";
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { createElement, type ReactElement } from "react";
import { FactList } from "@/components/landing-pages/shared/FactList";
import { LpHeading } from "@/components/landing-pages/shared/LpSection";
import { WalletBadges } from "@/components/landing-pages/shared/WalletBadges";
import { SCANNER_LOOP } from "@/lib/videos/scanner-loop";
import { WRENFOLD } from "@/components/landing-pages/shared/samples";
import { StampIconSvg, stampIcons } from "@/components/onboarding/StampIconPicker";
import { lpBanner } from "../../components/landing-pages/shared/banner";
import { SHOT_SIZES, landingShot, type ShotView } from "../landing/dashboard-shots";
import { STAMP_SAMPLES } from "../loyalty-samples";
import { ROOT, code, filesWith, findTag, literalAttr, openingTags, read, sourceFiles } from "../testing/jsx-source";
import { ALL } from "../testing/landing-copy";
import {
  COMPONENTS_DIR,
  isPlatformStyleFile,
  lpFiles,
  otherCallers,
  shared,
  shotViews,
} from "../testing/landing-pages-source";
import { renderEn, textOf } from "../testing/render-en";
import { mockEnglishServerTranslations } from "../testing/server-intl";
import { LEVELS_BUSINESS, LEVEL_UP_BANNER, REWARD_BANNER, SAMPLE_BUSINESS, SHARED, STAMP_BANNER } from "./copy/shared";
import { pageWords } from "./pages";

// The dashboard duo is an async server component that asks next-intl for its alt texts.
await mockEnglishServerTranslations();
const { DashboardDuo } = await import("@/components/landing-pages/shared/DashboardDuo");

describe("dashboard captures (AC9)", () => {
  /**
   * Platform shows its captures with no "Sample data" (Harry, 13 Nov: a landing page doesn't need the
   * detail), and so do the six previews in its style; the other pages keep the caption.
   */
  const onPlatform = isPlatformStyleFile;

  /** What draws a capture: the phone screenshot, and the simulated feed standing in for the live dashboard. */
  const CAPTURE_TAGS = ["PhoneScreenshot", "LiveActivityFeed"];

  /**
   * The captures a source draws that no figure captions: each one has to sit in
   * a `<figure>` that prints the sample-data caption, so two figures need two captions.
   * A figure's own picture and feed share its caption (the layered capture).
   */
  function uncaptioned(source: string): string[] {
    const figures = [...source.matchAll(/<figure\b[\s\S]*?<\/figure>/g)].map((match) => ({
      from: match.index,
      to: match.index + match[0].length,
      captioned: match[0].includes("sampleData"),
    }));
    const draws = openingTags(source)
      .filter((tag) => CAPTURE_TAGS.includes(tag.name))
      .filter((tag) => !figures.some((figure) => figure.captioned && tag.end > figure.from && tag.end < figure.to))
      .map((tag) => tag.name);
    const bare = /\blandingShot\(/.test(source) && !figures.some((figure) => figure.captioned);

    return bare && draws.length === 0 ? ["landingShot"] : draws;
  }

  test.each([
    ["a screenshot with no figure", '<PhoneScreenshot src="x" alt="y" />', ["PhoneScreenshot"]],
    ["the simulated feed with no figure", "<LiveActivityFeed cardOnly />", ["LiveActivityFeed"]],
    ["a capture helper with no caption", 'const shot = landingShot("en", "desktop");', ["landingShot"]],
    ["a figure that has no caption", '<figure><PhoneScreenshot src="x" alt="y" /></figure>', ["PhoneScreenshot"]],
    [
      "two figures and one caption",
      '<figure><PhoneScreenshot src="a" alt="a" /></figure><figure><PhoneScreenshot src="b" alt="b" /><figcaption>{SHARED.sampleData}</figcaption></figure>',
      ["PhoneScreenshot"],
    ],
  ])("the guard flags %s", (_what, source, flagged) => {
    expect(uncaptioned(source)).toEqual(flagged);
  });

  test.each([
    ["a screenshot in a captioned figure", '<figure><PhoneScreenshot src="x" alt="y" /><figcaption>{SHARED.sampleData}</figcaption></figure>'],
    ["the feed in a captioned figure", "<figure><LiveActivityFeed cardOnly /><figcaption>{SHARED.sampleData}</figcaption></figure>"],
    [
      "a screenshot and the feed sharing one caption",
      "<figure><PhoneScreenshot src=\"x\" alt=\"y\" /><LiveActivityFeed cardOnly /><figcaption>{SHARED.sampleData}</figcaption></figure>",
    ],
    ["a phone that draws no capture", "<IPhone />"],
  ])("the guard accepts %s", (_what, source) => {
    expect(uncaptioned(source)).toEqual([]);
  });

  test("every capture on a page sits in a figure that prints SHARED.sampleData, Platform's apart", () => {
    const loose = lpFiles()
      .filter((file) => !onPlatform(file))
      .flatMap((file) => uncaptioned(code(file)).map((name) => `${file.replace(ROOT, "")}: ${name}`));

    expect(loose).toEqual([]);
  });

  test("the dashboard duo shows no caption on Platform and its previews, and can print one", () => {
    const duos = lpFiles().flatMap((file) =>
      openingTags(read(file))
        .filter((tag) => tag.name === "DashboardDuo")
        .map((tag) => ({ file, captioned: !/(?:^|\s)caption=\{false\}/.test(tag.attrs) })),
    );

    expect(duos.map(({ file }) => file.replace(ROOT, "")).sort()).toEqual([
      "/components/landing-pages/pages/AnalyticsPreviewPage.tsx",
      "/components/landing-pages/platform/PlatformSection.tsx",
    ]);
    expect(duos.filter(({ file, captioned }) => captioned === onPlatform(file))).toEqual([]);
    expect(code(shared("DashboardDuo")).includes("figcaption")).toBe(true);
    expect(code(shared("DashboardDuo"))).toMatch(/caption\s*&&\s*\(\s*<figcaption/);
  });

  test.each(["phone", "phone-habits", "phone-busiest"] as const)("the %s capture exists in every language", (view) => {
    for (const locale of ["fr", "en", "es", "pl"] as const) {
      expect(existsSync(join(ROOT, "public", landingShot(locale, view).src))).toBe(true);
    }
  });
});

describe("which views of the dashboard the pages draw", () => {
  /**
   * What each capture of the Analytics page shows: `phone` is the top of the page, the visits, new customers,
   * return rate and visits over time; `phone-habits` and `phone-busiest` are scrolled to a chart; `desktop` is the
   * whole page in a browser frame.
   */
  const VIEWS: readonly ShotView[] = ["phone", "phone-habits", "phone-busiest", "desktop"];

  test("the list names every view there is", () => {
    expect([...VIEWS].sort()).toEqual(Object.keys(SHOT_SIZES).sort());
  });

  const usages = () =>
    lpFiles().flatMap((file) => shotViews(code(file)).map((view) => ({ file, view: view as ShotView })));

  test("every view a page draws is one the list knows, and the pages draw the two they use today", () => {
    const used = [...new Set(usages().map(({ view }) => view))];

    expect(used.filter((view) => !VIEWS.includes(view))).toEqual([]);
    expect(used.sort()).toEqual(["desktop", "phone"]);
  });

  test("the desktop capture is drawn only by the dashboard duo", () => {
    const drawers = usages().filter(({ view }) => view === "desktop").map(({ file }) => file);

    expect(drawers).toEqual([shared("DashboardDuo")]);
  });
});

describe("the wallet badges and the dashboard duo", () => {
  const duo = () => code(shared("DashboardDuo"));

  test("the official wallet badges are images and not links", () => {
    const html = renderEn(createElement(WalletBadges));

    expect(html.match(/<img /g)).toHaveLength(2);
    expect(html).toContain('alt="Apple Wallet"');
    expect(html).toContain('alt="Google Wallet"');
    expect(html).not.toMatch(/<a\b/);
  });

  /** A `hidden` class, plain or behind a breakpoint (`md:hidden`): what would take the capture off a phone. */
  const hides = (attrs: string) => /(?<![\w-])(?:[\w-]+:)?hidden(?![\w-])/.test(attrs);

  test("the guard sees a hidden class, however it is written", () => {
    for (const attrs of ['className="hidden"', 'className="mt-8 md:hidden"', 'className="lg:hidden hidden"']) {
      expect({ attrs, hides: hides(attrs) }).toEqual({ attrs, hides: true });
    }
    for (const attrs of ['className="mt-8 lg:mt-10"', 'className="overflow-hidden"', 'className="no-hidden-x"']) {
      expect({ attrs, hides: hides(attrs) }).toEqual({ attrs, hides: false });
    }
  });

  test("the dashboard duo shows the computer and the phone capture, and never hides the computer below any breakpoint", () => {
    expect(duo()).toContain('landingShot(locale as Locale, "desktop")');
    expect(duo()).toContain('landingShot(locale as Locale, "phone")');
    expect(openingTags(duo()).filter((tag) => hides(tag.attrs)).map((tag) => tag.name)).toEqual([]);
  });

  test("the duo's caption says it is sample data and nothing else, unless a page leaves it off", async () => {
    const caption = (html: string) => html.match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/)?.[1];

    expect(caption(renderEn(await DashboardDuo({})))).toBe(SHARED.sampleData);
    expect(caption(renderEn(await DashboardDuo({ caption: false })))).toBeUndefined();
  });

  test("the duo frames the capture in a browser bar with the dashboard's address, and captions it as sample data", () => {
    expect(duo()).toContain("SHARED.dashboardUrl");
    expect(duo()).toContain("SHARED.sampleData");
    expect(duo().indexOf("<figcaption")).toBeGreaterThan(duo().indexOf("<PhoneScreenshot"));
  });

  test("Platform's hero is a headline alone: its numbers come lower down", () => {
    expect(pageWords("platform", "en", "us").hero.sub).toBeUndefined();
  });
});

describe("the sectors every page ends on (AC19)", () => {
  const sectors = () => code(shared("LpSectors"));

  test("reads the catalog's own heading and prices in the money of the page's market", () => {
    expect(sectors()).toContain("landing.sectorCards");
    expect(sectors()).toContain("MARKETS[market]");
  });

  test("the heading reads \"Stampeo adapts to your business\": the catalog's title with its line-break tags stripped", () => {
    const { title } = JSON.parse(read(join(ROOT, "messages", "en", "landing.json"))).landing.sectorCards as { title: string };

    expect(title.replace(/<[^>]*>/g, "")).toBe("Stampeo adapts to your business");
    expect(findTag(sectors(), "LpHeading")?.attrs).toContain('t.rich("title"');
  });

  test("nothing near the sectors calls them testimonials, stories or customers", () => {
    const heading = JSON.parse(read(join(ROOT, "messages", "en", "landing.json"))).landing.sectorCards as {
      title: string;
      subtitle: string;
    };
    const near = [sectors(), SHARED.sectorsEyebrow, heading.title, heading.subtitle].join("\n");

    expect(near).not.toMatch(/testimonial|\bstor(?:y|ies)\b|\bcustomers?\b/i);
    expect(filesWith(lpFiles(), /testimonial/i)).toEqual([]);
  });
});

describe("the pieces the sections share", () => {
  test("a fact list draws a check and the words of each fact, and nothing else", () => {
    const html = renderEn(createElement(FactList, { facts: [{ text: "Points never expire" }, { text: "A welcome gift" }] }));

    expect(html.match(/<li\b/g)).toHaveLength(2);
    expect(html.match(/<svg\b/g)).toHaveLength(2);
    expect(textOf(html)).toBe("|Points never expire|A welcome gift|");
  });

  test("a heading takes a small label above its title and an alignment", () => {
    const html = renderEn(createElement(LpHeading, { title: "A title", eyebrow: "A label", align: "center" }));

    expect(html.indexOf("A label")).toBeLessThan(html.indexOf("<h2"));
    expect(html).toContain("text-center");
  });
});

describe("the level cards (AC20)", () => {
  test("draw Bronze, Silver and Gold, and the default level-up notification over them when asked", () => {
    const cards = code(shared("LevelCards"));

    for (const level of ["bronze", "silver", "gold"]) expect(cards).toContain(`name: "${level}"`);
    expect(cards).toContain("SHARED.levelNames[level.name]");
    expect(cards).toContain("LEVEL_UP_BANNER");
  });

  test("are a made-up dry cleaner's: preset stamps, so each level's look changes, and a logo of its own", () => {
    const { design } = WRENFOLD;
    const logo = join(ROOT, "public", design.logo_url ?? "-");

    expect(stampIcons.map((icon) => icon.id)).toContain(design.stamp_icon ?? "-");
    expect(design.stamp_icon_mode).toBeUndefined();
    expect(design.background_color).toBe("#FFFFFF");
    expect(existsSync(logo)).toBe(true);
    expect(statSync(logo).size).toBeLessThanOrEqual(60_000);
    expect(code(shared("LevelCards"))).toContain("WRENFOLD.design");
  });
});

describe("a notification is the sample business's, never Stampeo's (AC10, AC24)", () => {
  const BANNERS = [STAMP_BANNER, REWARD_BANNER];

  test.each(BANNERS.map((banner) => [banner.body, banner] as const))("%s", (_body, banner) => {
    const props = lpBanner(banner);

    expect(props.appName).toBe(SAMPLE_BUSINESS);
    expect(props.appName).not.toMatch(/stampeo/i);
    expect(props.title).toBe(banner.body);
  });

  test("the level-up notification is the levels shop's, wearing the stamp icon of its cards, not the café's cup", () => {
    const props = lpBanner(LEVEL_UP_BANNER);
    const stampPath = /<path d="([^"]+)"/.exec(renderEn(createElement(StampIconSvg, { icon: WRENFOLD.design.stamp_icon ?? "-" })))?.[1];

    expect(LEVEL_UP_BANNER.sender).toBe(LEVELS_BUSINESS);
    expect(props.appName).toBe(LEVELS_BUSINESS);
    expect((props.icon as ReactElement).type).not.toBe((lpBanner(STAMP_BANNER).icon as ReactElement).type);
    expect(stampPath).toBeDefined();
    expect(renderEn(props.icon)).toContain(`d="${stampPath}"`);
  });

  const NOTIFICATIONS = ["NotificationPhoneDemo", "NotificationBanner", "NotificationSequenceDemo"];
  const callsOf = (file: string) =>
    openingTags(read(file)).filter((tag) => NOTIFICATIONS.includes(tag.name)).map((tag) => ({ file, tag }));

  test("every lock screen, banner and moment list on a page is fed by lpBanner (or shopBanner, its larger icon tile)", () => {
    const unfed = lpFiles()
      .flatMap(callsOf)
      .filter(({ file }) => !/\b(?:lpBanner|shopBanner)\b/.test(code(file)))
      .map(({ file }) => file);

    expect(unfed).toEqual([]);
  });

  test("a phone or a sequence is always given its own banners, never the default sender", () => {
    const calls = lpFiles().flatMap(callsOf);
    const given = (name: string, prop: string) =>
      calls.filter(({ tag }) => tag.name === name).filter(({ tag }) => !new RegExp(`(?:^|\\s)${prop}=`).test(tag.attrs));

    expect(given("NotificationPhoneDemo", "notifications")).toEqual([]);
    expect(given("NotificationSequenceDemo", "moments")).toEqual([]);
  });

  describe("the stamp notification, the Scanner loop and the Aurevo card beside them count the same stamps", () => {
    const [, stamp, total] = STAMP_BANNER.body.match(/(\d+) of (\d+) stamps/) ?? [];
    const CARDS = ["AurevoCard", "WalletPhone", "GoogleWalletPhone"];

    /** The count a card tag is given: a literal, or the Scanner loop's own. */
    const stampsOf = (attrs: string): number | string => {
      const given = attrs.match(/\bstamps=\{([^}]*)\}/)?.[1].trim() ?? "none";
      return given === "SCANNER_LOOP.stamps" ? SCANNER_LOOP.stamps : /^\d+$/.test(given) ? Number(given) : given;
    };

    /** Each card of a file that also shows the stamp banner or the loop, with the count it is given. */
    const besideBanner = (file: string) => {
      const source = code(file);
      if (!/\bSTAMP_BANNER\b|<ScannerLoop\b/.test(source)) return [];
      return openingTags(source)
        .filter((tag) => CARDS.includes(tag.name))
        .map((tag) => ({ file: file.replace(ROOT, ""), card: tag.name, stamps: stampsOf(tag.attrs) }));
    };

    test("the stamp banner is the sample café's 5 of 8, as its card is", () => {
      const aurevo = STAMP_SAMPLES.find((sample) => sample.id === "aurevo");

      expect([Number(stamp), Number(total)]).toEqual([5, 8]);
      expect([aurevo?.stamps, aurevo?.design.total_stamps]).toEqual([Number(stamp), Number(total)]);
    });

    test("the guard reads a literal count and the loop's, and returns what it cannot read", () => {
      expect([stampsOf("width={280} stamps={5}"), stampsOf("stamps={SCANNER_LOOP.stamps}"), stampsOf("width={1}")]).toEqual([
        5,
        5,
        "none",
      ]);
      expect(stampsOf("stamps={count}")).toBe("count");
    });

    test("every Aurevo card beside the banner or the video is at 5 of 8", () => {
      const cards = lpFiles().flatMap(besideBanner);

      expect(cards.length).toBeGreaterThanOrEqual(4);
      expect(cards.filter((card) => card.stamps !== Number(stamp))).toEqual([]);
    });
  });
});

describe("prices and the trial length are printed through RegionText (AC13)", () => {
  /** The strings that carry a token only RegionText fills in. */
  const tokenPaths = ALL.filter((line) => line.value.includes("{trialDays}")).map((line) => line.path);

  // A new token string fails here until its print is added below.
  test("the only copy string with the {trialDays} token is the reassurance", () => {
    expect(tokenPaths.sort()).toEqual(["SHARED.reassurance"]);
  });

  test.each([
    ["the reassurance line", /SHARED\.reassurance/g],
    ["a FAQ answer", /\b\w+\.answer\b/g],
  ])("every print of %s sits inside <RegionText raw={…}>", (_what, use) => {
    const prints = lpFiles().flatMap((file) => {
      const source = code(file);
      return [...source.matchAll(use)].map((match) => ({
        file,
        bare: !source.slice(0, match.index).endsWith("<RegionText raw={"),
      }));
    });

    expect(prints.length).toBeGreaterThan(0);
    expect(prints.filter((print) => print.bare)).toEqual([]);
  });

});

describe("no scannable code (AC14)", () => {
  test("no component of these pages draws a scannable code", () => {
    expect(filesWith(sourceFiles(COMPONENTS_DIR), /qrcode\.react|\bQRCodeSVG\b/)).toEqual([]);
  });
});

describe("components the pages extend: their other callers pass none of the new props (AC15)", () => {
  const component = (name: string, dir: string) => [name, join(ROOT, "components", dir, `${name}.tsx`)] as const;

  /** Each component with the optional props the pages added to it. */
  const EXTENDED: Array<readonly [name: string, file: string, props: string[]]> = [
    [...component("NotificationPhoneDemo", "features/notifications-push"), ["notifications", "animate", "eager", "width"]],
    [...component("NotificationSequenceDemo", "features/notifications-push"), ["moments", "design", "phoneClassName", "fullCard", "stillWhenReduced"]],
    [...component("NotificationBanner", "features/notifications-push"), ["icon"]],
    [...component("CardStyleGallery", "features/design-de-carte"), ["showCta", "heading", "sectionClassName"]],
    [...component("LiveActivityFeed", "features/analytics"), ["cardOnly", "stillWhenReduced"]],
    [...component("BlindSpotCards", "features/analytics"), ["questions", "noAnswer", "bare"]],
    [...component("HeroCardFan", "landing-variant"), ["slots"]],
    [...component("QRCodeSkeleton", "ui"), ["animated"]],
    [...component("Segmented", "ui"), ["size"]],
    [...component("WalletCard", "card"), ["headerLabel"]],
    [...component("BlogCard", "blog"), ["detail"]],
    [...component("ScannerLoop", "ui"), ["still"]],
    [...component("AnnotatedWalletCard", "features/design-de-carte"), ["heading", "sectionClassName", "toggleSize"]],
    [...component("FAQList", "ui"), ["table"]],
    [...component("CTAButton", "ui"), ["keycap"]],
  ];

  /**
   * The one site component that hands its own optional prop on to an extended one: `toggleSize` becomes
   * Segmented's `size`. Its default render is a snapshot in `default-renders.test.tsx`, and what the prop does is
   * in `extended-components.test.tsx`.
   */
  const ANNOTATED = join(ROOT, "components", "features", "design-de-carte", "AnnotatedWalletCard.tsx");

  test.each(EXTENDED)("%s", (name, file, props) => {
    const callers = otherCallers(name, file).filter(({ file: caller }) => !(name === "Segmented" && caller === ANNOTATED));

    expect(callers.length).toBeGreaterThan(0);
    for (const { file: caller, attrs } of callers) {
      for (const prop of props) {
        expect({ caller, prop, passed: new RegExp(`(?:^|\\s)${prop}(?![\\w-])`).test(attrs) }).toEqual({
          caller,
          prop,
          passed: false,
        });
      }
    }
  });

  test("CTAButton's other callers never ask for the inverse variant", () => {
    const callers = otherCallers("CTAButton", join(ROOT, "components", "ui", "CTAButton.tsx"));

    expect(callers.length).toBeGreaterThan(0);
    expect(callers.filter(({ attrs }) => literalAttr(attrs, "variant") === "inverse")).toEqual([]);
  });
});

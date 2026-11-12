/**
 * What the four landing pages share and what they borrow: the hero and its
 * dashboard capture, the sectors, the plan chips, the sender on a banner, the
 * tokens that must go through `RegionText`, the placard's QR, and the site
 * components the pages extend, whose other callers must not notice. Async
 * server components are read from the source; the rest are rendered.
 */

import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { createElement, type ReactElement } from "react";
import { FactList } from "@/components/landing-pages/shared/FactList";
import { LpHeading } from "@/components/landing-pages/shared/LpSection";
import { PlanLine } from "@/components/landing-pages/shared/PlanLine";
import { SampleCapture } from "@/components/landing-pages/shared/SampleCapture";
import { WalletBadges } from "@/components/landing-pages/shared/WalletBadges";
import { lpBanner } from "../../components/landing-pages/shared/banner";
import { landingShot } from "../landing/dashboard-shots";
import { STAMP_SAMPLES } from "../loyalty-samples";
import { ROOT, code, filesWith, findTag, literalAttr, openingTags, read, sourceFiles } from "../testing/jsx-source";
import { ALL, PAGES, lines } from "../testing/landing-copy";
import { COMPONENTS_DIR, lpFiles, otherCallers, pageComponent, shared } from "../testing/landing-pages-source";
import { renderEn, textOf } from "../testing/render-en";
import { FEATURES } from "./copy/features";
import { OUTCOMES } from "./copy/outcomes";
import { LEVELS_BUSINESS, LEVEL_UP_BANNER, REWARD_BANNER, SAMPLE_BUSINESS, SHARED, STAMP_BANNER } from "./copy/shared";
import { LANDING_PAGES, type LandingSlug } from "./pages";

describe("dashboard captures (AC9)", () => {
  /** A file that draws a dashboard capture has to print the sample-data caption with it. */
  const missesCaption = (source: string) =>
    (openingTags(source).some((tag) => tag.name === "PhoneScreenshot") || /\blandingShot\(/.test(source)) &&
    !source.includes("sampleData");

  test("the guard flags a capture without its caption and accepts one with it", () => {
    expect(missesCaption('<PhoneScreenshot src="x" alt="y" />')).toBe(true);
    expect(missesCaption('const shot = landingShot("en", "desktop");')).toBe(true);
    expect(missesCaption('<PhoneScreenshot src="x" alt="y" />{SHARED.sampleData}')).toBe(false);
    expect(missesCaption("<IPhone />")).toBe(false);
  });

  test("every file that draws a capture prints SHARED.sampleData", () => {
    expect(lpFiles().filter((file) => missesCaption(read(file)))).toEqual([]);
  });

  test.each(["phone", "phone-habits", "phone-busiest"] as const)(
    "the %s capture exists, and the sample capture shows it with its caption under it",
    (view) => {
      const html = renderEn(createElement(SampleCapture, { alt: "A capture", view }));

      expect(existsSync(join(ROOT, "public", landingShot("en", view).src))).toBe(true);
      expect(html).toContain(encodeURIComponent(landingShot("en", view).src));
      expect(html.indexOf("<figcaption")).toBeGreaterThan(html.indexOf("<img"));
      expect(textOf(html)).toContain(SHARED.sampleData);
    },
  );
});

describe("the hero the three argument pages share (AC18)", () => {
  const hero = () => code(shared("LpHero"));
  const duo = () => code(shared("DashboardDuo"));

  test("shows the official wallet badges, as images and not links, then the dashboard duo", () => {
    const html = renderEn(createElement(WalletBadges));

    expect(html.match(/<img /g)).toHaveLength(2);
    expect(html).toContain('alt="Apple Wallet"');
    expect(html).toContain('alt="Google Wallet"');
    expect(html).not.toMatch(/<a\b/);
    expect(hero().indexOf("<WalletBadges")).toBeGreaterThan(-1);
    expect(hero().indexOf("<DashboardDuo")).toBeGreaterThan(hero().indexOf("<WalletBadges"));
    expect(findTag(hero(), "DashboardDuo")?.attrs).toMatch(/\bpriority\b/);
    expect(hero()).toContain("SHARED.proof(");
  });

  test("the dashboard duo shows the computer and the phone capture, and never hides the computer below any breakpoint", () => {
    const hidden = /(?<![\w-])(?:[\w-]+:)?hidden(?![\w-])/;

    expect(duo()).toContain('landingShot("en", "desktop")');
    expect(duo()).toContain('landingShot("en", "phone")');
    expect(openingTags(duo()).filter((tag) => hidden.test(tag.attrs)).map((tag) => tag.name)).toEqual([]);
  });

  test("the duo frames the capture in a browser bar with the dashboard's address, and captions it as sample data", () => {
    expect(duo()).toContain("SHARED.dashboardUrl");
    expect(duo()).toContain("SHARED.sampleData");
    expect(duo().indexOf("<figcaption")).toBeGreaterThan(duo().indexOf("<PhoneScreenshot"));
  });

  test("the Outcomes headline keeps its no-break hyphen, so \"first-time\" never splits across two lines", () => {
    const { h1 } = LANDING_PAGES.outcomes.hero;

    expect(h1).toContain("first‑time");
    expect(h1).not.toContain("first-time");
  });

  test.each(["how-it-works", "features", "outcomes"] as LandingSlug[])("%s has a sub under its headline", (slug) => {
    expect(LANDING_PAGES[slug].hero.sub?.length ?? 0).toBeGreaterThan(0);
  });

  test("Platform's hero is a headline alone: its numbers come lower down", () => {
    expect(LANDING_PAGES.platform.hero.sub).toBeUndefined();
  });
});

describe("the sectors every page ends on (AC19)", () => {
  const sectors = () => code(shared("LpSectors"));

  test("reads the catalog's own heading and prices in dollars", () => {
    expect(sectors()).toContain("landing.sectorCards");
    expect(sectors()).toContain("MARKETS.us");
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
  test("a broadcast line carries its plans in the paragraph it qualifies", () => {
    const html = renderEn(createElement(PlanLine, null, "Broadcasts to every card."));
    const paragraph = html.match(/<p[^>]*>[\s\S]*<\/p>/)?.[0] ?? "";

    expect(textOf(paragraph)).toContain(SHARED.broadcastPlans);
    expect(textOf(paragraph)).toContain("Broadcasts to every card.");
  });

  test("a fact list draws a plan chip right after each fact that has one", () => {
    const text = textOf(
      renderEn(
        createElement(FactList, {
          facts: [{ text: "Bonus points on bigger baskets", plan: "Growth and Pro" }, { text: "Points never expire" }],
        }),
      ),
    );

    expect(text).toContain("Bonus points on bigger baskets|Growth and Pro|");
    expect(text).toContain("Points never expire|");
    expect(text.match(/Growth and Pro/g)).toHaveLength(1);
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

    for (const name of ["Bronze", "Silver", "Gold"]) expect(cards).toContain(name);
    expect(cards).toContain("LEVEL_UP_BANNER");
  });
});

describe("a notification is the sample business's, never Stampeo's (AC10, AC24)", () => {
  const BANNERS = [STAMP_BANNER, REWARD_BANNER, OUTCOMES.slowDays.banner, ...FEATURES.messages.moments.map((m) => m.banner)];

  test.each(BANNERS.map((banner) => [banner.body, banner] as const))("%s", (_body, banner) => {
    const props = lpBanner(banner);

    expect(props.appName).toBe(SAMPLE_BUSINESS);
    expect(props.appName).not.toMatch(/stampeo/i);
    expect(props.title).toBe(banner.body);
  });

  test("the level-up notification is the barbershop's, with its own icon, not the café's", () => {
    const props = lpBanner(LEVEL_UP_BANNER);

    expect(LEVEL_UP_BANNER.sender).toBe(LEVELS_BUSINESS);
    expect(props.appName).toBe(LEVELS_BUSINESS);
    expect((props.icon as ReactElement).type).not.toBe((lpBanner(STAMP_BANNER).icon as ReactElement).type);
  });

  const NOTIFICATIONS = ["NotificationPhoneDemo", "NotificationBanner", "NotificationSequenceDemo"];
  const callsOf = (file: string) =>
    openingTags(read(file)).filter((tag) => NOTIFICATIONS.includes(tag.name)).map((tag) => ({ file, tag }));

  test("every lock screen, banner and moment list on a page is fed by lpBanner", () => {
    const unfed = lpFiles()
      .flatMap(callsOf)
      .filter(({ file }) => !/\blpBanner\b/.test(code(file)))
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

  test("the scanner demo on a page never shows its recording dot or its timer", () => {
    const demos = lpFiles().flatMap((file) =>
      openingTags(read(file))
        .filter((tag) => tag.name === "ScanDemo")
        .map((tag) => ({ file, chrome: literalAttr(tag.attrs, "chrome") })),
    );

    expect(demos.length).toBeGreaterThan(0);
    expect(demos.filter(({ chrome }) => chrome !== "minimal")).toEqual([]);
  });

  test("the stamp notification and the Aurevo card beside it count the same stamps", () => {
    const [, stamp, total] = STAMP_BANNER.body.match(/(\d+) of (\d+) stamps/) ?? [];
    const aurevo = STAMP_SAMPLES.find((sample) => sample.id === "aurevo");

    expect([Number(stamp), Number(total)]).toEqual([aurevo?.stamps, aurevo?.design.total_stamps]);
  });
});

describe("prices and the trial length are printed through RegionText (AC13)", () => {
  /** The strings that carry a token only RegionText fills in. */
  const tokenPaths = ALL.filter((line) => line.value.includes("{trialDays}")).map((line) => line.path);

  // A new token string fails here until its print is added below.
  test("the copy strings with the {trialDays} token are the reassurance, one FAQ answer and a first-day step", () => {
    expect(tokenPaths.sort()).toEqual([
      "HOW_IT_WORKS.firstDay.items[3]",
      "SHARED.faq.items[3].answer",
      "SHARED.reassurance",
    ]);
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

  test("a component that reads the first-day steps prints each one through RegionText", () => {
    const bare = lpFiles()
      .filter((file) => /\bfirstDay\b/.test(code(file)))
      .flatMap((file) => {
        const source = code(file);
        return [...source.matchAll(/\bitems\.map\(\s*\(?\s*(\w+)/g)]
          .map((match) => match[1])
          .filter((param) => {
            const throughRegionText = source.includes(`<RegionText raw={${param}}`);
            const printedBare = source.replaceAll(`raw={${param}}`, "").includes(`{${param}}`);
            return !throughRegionText || printedBare;
          })
          .map((param) => `${file}: ${param}`);
      });

    expect(bare).toEqual([]);
  });
});

describe("the placard's QR mark (AC14)", () => {
  test("no component of these pages draws a scannable code", () => {
    expect(filesWith(sourceFiles(COMPONENTS_DIR), /qrcode\.react|\bQRCodeSVG\b/)).toEqual([]);
  });

  test("the placard's QR is the still skeleton", () => {
    const qr = findTag(read(pageComponent("how-it-works", "PlacardVisual")), "QRCodeSkeleton");

    expect(qr?.attrs).toContain("animated={false}");
  });
});

describe("the Platform share tree names places, never integrations (AC22)", () => {
  test("its copy never says integration, POS or sync", () => {
    const words = /integrat|\bPOS\b|\bsync/i;

    expect(lines(PAGES.PLATFORM.share, "PLATFORM.share").filter((line) => words.test(line.value))).toEqual([]);
  });
});

describe("components the pages extend: their other callers pass none of the new props (AC15)", () => {
  const component = (name: string, dir: string) => [name, join(ROOT, "components", dir, `${name}.tsx`)] as const;

  /** Each component with the optional props the pages added to it. */
  const EXTENDED: Array<readonly [name: string, file: string, props: string[]]> = [
    [...component("NotificationPhoneDemo", "features/notifications-push"), ["notifications", "animate", "eager", "width"]],
    [...component("NotificationSequenceDemo", "features/notifications-push"), ["moments", "design", "phoneClassName", "fullCard"]],
    [...component("NotificationBanner", "features/notifications-push"), ["icon"]],
    [...component("CardStyleGallery", "features/design-de-carte"), ["showCta", "heading", "sectionClassName"]],
    [...component("ScanDemo", "features/scanner-mobile"), ["chrome", "stillWhenReduced"]],
    [...component("LiveActivityFeed", "features/analytics"), ["cardOnly", "stillWhenReduced"]],
    [...component("QRCodeSkeleton", "ui"), ["animated"]],
    [...component("Segmented", "ui"), ["size"]],
    [...component("WalletCard", "card"), ["headerLabel"]],
    [...component("BlogCard", "blog"), ["detail"]],
  ];

  test.each(EXTENDED)("%s", (name, file, props) => {
    const callers = otherCallers(name, file);

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

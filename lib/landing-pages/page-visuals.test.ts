/**
 * What the landing pages show beside their words: the hero the three argument
 * pages share (badges, then the dashboard on a computer and a phone), the
 * sectors every page ends on, the notifications and demos the pages borrow,
 * and the share tree's words. Read from the source, since there is no
 * component runner.
 */

import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { STAMP_SAMPLES } from "../loyalty-samples";
import { ROOT, code, filesWith, findTag, literalAttr, openingTags, read } from "../testing/jsx-source";
import { PAGES, lines } from "../testing/landing-copy";
import { lpFiles, pageComponent, pageFile, shared } from "../testing/landing-pages-source";
import { SHARED, STAMP_BANNER } from "./copy/shared";
import { LANDING_PAGES, type LandingSlug } from "./pages";

describe("the hero the three argument pages share (AC18)", () => {
  const hero = () => code(shared("LpHero"));

  test("centres its text at every width, and has no page-specific visual beside it", () => {
    expect(hero()).toMatch(/\btext-center\b/);
    expect(hero()).toMatch(/\bmax-w-3xl\b/);
    expect(hero()).not.toMatch(/\bvisual\b/);
    expect(hero()).not.toMatch(/lg:col-span/);
  });

  test("then the official wallet badges, as images and not links, then the dashboard duo", () => {
    const source = hero();
    const badges = source.indexOf('walletBadges("en")');
    const duo = source.indexOf("<DashboardDuo");

    expect(badges).toBeGreaterThan(-1);
    expect(duo).toBeGreaterThan(badges);
    expect(source).toContain("badges.apple");
    expect(source).toContain("badges.google");
    const between = source.slice(source.indexOf("src={badges.apple}"), duo);
    expect(between).not.toMatch(/<a\b|<Link\b|<TrackedLink\b/);
    expect(findTag(source, "DashboardDuo")?.attrs).toMatch(/\bpriority\b/);
  });

  test("says its reassurance through RegionText and prints the proof line", () => {
    expect(hero()).toContain("<RegionText raw={SHARED.reassurance}");
    expect(hero()).toContain("SHARED.proof(");
  });

  test("the pages have no hero visual of their own any more", () => {
    for (const slug of ["how-it-works", "features", "outcomes"] as const) {
      const lpHero = findTag(read(pageFile(slug)), "LpHero");

      expect(lpHero).toBeDefined();
      expect(lpHero?.attrs).not.toMatch(/\bvisual=/);
    }
  });
});

describe("the dashboard duo: the computer and the phone, at every width (AC18)", () => {
  const duo = () => code(shared("DashboardDuo"));

  test("shows the desktop capture and the phone capture of the sample dashboard", () => {
    expect(duo()).toContain('landingShot("en", "desktop")');
    expect(duo()).toContain('landingShot("en", "phone")');
    expect(findTag(duo(), "PhoneScreenshot")).toBeDefined();
    expect(findTag(duo(), "Image")?.attrs).toMatch(/\bsizes=/);
  });

  test("never hides the desktop capture below any breakpoint", () => {
    const hidden = /(?<![\w-])(?:[\w-]+:)?hidden(?![\w-])/;

    expect(openingTags(duo()).filter((tag) => hidden.test(tag.attrs)).map((tag) => tag.name)).toEqual([]);
  });

  test("frames the capture in a browser bar with the dashboard's address, and captions it as sample data", () => {
    expect(duo()).toContain("SHARED.dashboardUrl");
    expect(duo()).toContain("SHARED.sampleData");
    expect(duo().indexOf("<figcaption")).toBeGreaterThan(duo().indexOf("<PhoneScreenshot"));
    expect(SHARED.dashboardUrl).toBe("app.stampeo.app");
    expect(SHARED.sampleData).toBe("Sample data");
  });

  test("preloads the capture only when the hero asks for it", () => {
    expect(duo()).toMatch(/priority\s*=\s*false/);
    expect(duo()).toMatch(/priority\s*\?\s*\{[^}]*fetchPriority:\s*"high"/);
    expect(findTag(duo(), "PhoneScreenshot")?.attrs).toContain("eager={priority}");
  });
});

describe("the sectors every page ends on (AC19)", () => {
  const sectors = () => code(shared("LpSectors"));

  test("composes the /us carousel and its helpers under the catalog's own heading, in dollars", () => {
    const source = sectors();

    for (const part of ["SectorCarousel", "SECTOR_THEMES", "orderSectorSlides", "fillSectorMoney", "landing.sectorCards"]) {
      expect(source).toContain(part);
    }
    expect(source).toContain("MARKETS.us");
    expect(source).toMatch(/\.rich\(\s*"title"/);
    expect(source).toMatch(/\.rich\(\s*"subtitle"/);
    expect(source).toContain("mbr");
    expect(source).not.toContain("VariantSectorCards");
  });

  test("takes an optional eyebrow for the heading, and tags the section", () => {
    const source = sectors();

    expect(source).toMatch(/eyebrow\??:\s*string/);
    expect(literalAttr(findTag(source, "LpSection")?.attrs ?? "", "section")).toBe("sectors");
    expect(literalAttr(findTag(source, "LpHeading")?.attrs ?? "", "align")).toBe("center");
  });

  test("Platform gives it the small label; its heading is still the catalog's", () => {
    const tag = findTag(code(pageFile("platform")), "LpSectors");

    expect(tag?.attrs).toContain("eyebrow={SHARED.sectorsEyebrow}");
  });

  test.todo("How-to renders the sectors under its demo (stage G1)");
  test.todo("Features renders the sectors before its pricing (stage G2)");
  test.todo("Outcomes renders the sectors before its pricing (stage G3)");

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

describe("a notification or a demo on a page is the sample business's (AC24)", () => {
  const NOTIFICATIONS = ["NotificationPhoneDemo", "NotificationBanner", "NotificationSequenceDemo"];
  const callsOf = (file: string) =>
    openingTags(read(file)).filter((tag) => NOTIFICATIONS.includes(tag.name)).map((tag) => ({ file, tag }));

  test("every lock screen, banner and moment list is fed by lpBanner", () => {
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

  test("the scanner demo never shows its recording dot or its timer", () => {
    const demos = lpFiles().flatMap((file) =>
      openingTags(read(file))
        .filter((tag) => tag.name === "ScanDemo")
        .map((tag) => ({ file, chrome: literalAttr(tag.attrs, "chrome") })),
    );

    expect(demos.filter(({ chrome }) => chrome !== "minimal")).toEqual([]);
  });
});

describe("the stamp notification and the card beside it count the same stamps", () => {
  const [, stamp, total] = STAMP_BANNER.body.match(/(\d+) of (\d+) stamps/) ?? [];
  const aurevo = STAMP_SAMPLES.find((sample) => sample.id === "aurevo");

  // The hero fan draws that sample as it is, through HeroCardFan.
  test("the banner's count is the Aurevo sample's stamps and total", () => {
    expect([Number(stamp), Number(total)]).toEqual([aurevo?.stamps, aurevo?.design.total_stamps]);
  });
});

describe("the Platform share tree names places, never integrations (AC22)", () => {
  const tree = code(pageComponent("platform", "ShareTree"));
  const words = /integrat|\bPOS\b|\bsync/i;

  test("its copy never says integration, POS or sync", () => {
    expect(lines(PAGES.PLATFORM.share, "PLATFORM.share").filter((line) => words.test(line.value))).toEqual([]);
  });

  // The tree arrives with the Platform stage; from then on this holds for it.
  test("its source never says it either", () => {
    expect(tree).not.toMatch(words);
  });

  test("it names the six channels", () => {
    expect(PAGES.PLATFORM.share.channels.map((channel) => channel.title)).toEqual([
      "Counter flyer",
      "Scanner app",
      "Instagram",
      "Facebook",
      "Your website",
      "Google Business Profile",
    ]);
  });
});

describe("the argument pages' H1s", () => {
  test('the Outcomes headline keeps its no-break hyphen, so "first-time" never splits across two lines', () => {
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

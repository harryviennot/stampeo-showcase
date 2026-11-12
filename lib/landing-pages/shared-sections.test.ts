/**
 * What the four landing pages share and what they borrow: the dashboard
 * capture, the plan chips, the sender on a banner, the tokens that must go
 * through `RegionText`, the placard's QR, the shared v2 blocks, and the site
 * components the pages extend, whose other callers must not notice.
 */

import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";
import type { ReactElement } from "react";
import { lpBanner } from "../../components/landing-pages/shared/banner";
import { landingShot } from "../landing/dashboard-shots";
import { ROOT, code, filesWith, findTag, literalAttr, openingTags, read, sourceFiles } from "../testing/jsx-source";
import { ALL } from "../testing/landing-copy";
import {
  COMPONENTS_DIR,
  lpFiles,
  otherCallers,
  pageComponent,
  shared,
} from "../testing/landing-pages-source";
import { LEVELS_BUSINESS, LEVEL_UP_BANNER, REWARD_BANNER, SAMPLE_BUSINESS, STAMP_BANNER } from "./copy/shared";
import { FEATURES } from "./copy/features";
import { OUTCOMES } from "./copy/outcomes";

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

  test("the sample capture is one figure: the shot in the crop, its caption under it, in the view asked for", () => {
    const capture = code(shared("SampleCapture"));
    const [open, phone, close, caption] = ["<PhoneCrop", "<PhoneScreenshot", "</PhoneCrop>", "<figcaption"].map((needle) =>
      capture.indexOf(needle),
    );

    expect(capture).toContain('landingShot("en", view)');
    expect(capture).toContain("SHARED.sampleData");
    expect(open).toBeGreaterThan(-1);
    expect([open, phone, close, caption]).toEqual([open, phone, close, caption].sort((a, b) => a - b));
  });

  test.each(["phone", "phone-habits", "phone-busiest"] as const)("the %s capture exists, and the sample capture can show it", (view) => {
    expect(existsSync(join(ROOT, "public", landingShot("en", view).src))).toBe(true);
    expect(code(shared("SampleCapture"))).toMatch(/view\s*=\s*"phone"/);
    expect(code(shared("SampleCapture"))).toContain("ShotView");
  });
});

describe("the pieces the sections share (one solution each)", () => {
  test("a spotlight crops a tall device through PhoneCrop when asked to", () => {
    expect(findTag(code(shared("LpSpotlight")), "PhoneCrop")).toBeDefined();
  });

  test("the plans a broadcast comes with print in the paragraph of the line they qualify", () => {
    const line = code(shared("PlanLine"));
    const paragraph = line.slice(line.indexOf("<p"), line.indexOf("</p>"));

    expect(filesWith(lpFiles(), /SHARED\.broadcastPlans/)).toEqual([shared("PlanLine")]);
    expect(paragraph).toContain("SHARED.broadcastPlans");
    expect(paragraph).toContain("{children}");
  });

  test("one chip draws every plan label, and a fact list draws each fact's chip through it", () => {
    const chip = code(shared("PlanChip"));
    const list = code(shared("FactList"));

    expect(chip).toContain("rounded-full");
    expect(chip).toContain("--background-subtle");
    expect(chip).toMatch(/plan:\s*PlanChip/);
    expect(findTag(list, "PlanChip")).toBeDefined();
    expect(list).toMatch(/Fact\[\]/);
  });

  test("a heading takes an eyebrow in the accent's darker shade and an alignment; the demo section takes both", () => {
    const heading = code(shared("LpSection"));
    const eyebrow = openingTags(heading).find((tag) => /tracking-\[0\.2em\]/.test(tag.attrs));

    expect(eyebrow?.attrs).toMatch(/\buppercase\b/);
    expect(eyebrow?.attrs).toMatch(/\bfont-semibold\b/);
    expect(eyebrow?.attrs).toContain("var(--accent-hover)");
    expect(heading).toMatch(/align\s*=\s*"left"/);
    expect(heading).toContain('"center"');
    const demo = read(shared("LpDemo"));
    expect(demo).toMatch(/eyebrow/);
    expect(demo).toMatch(/align/);
  });

  test("the glass card is a translucent, blurred, ringed card, and can float", () => {
    const card = code(shared("GlassCard"));

    expect(card).toContain("bg-white/70");
    expect(card).toContain("backdrop-blur");
    expect(card).toContain("ring-black/5");
    expect(card).toContain("rounded-2xl");
    expect(card).toContain("lp-float");
    expect(read(join(ROOT, "app", "globals.css"))).toMatch(
      /@media \(prefers-reduced-motion: reduce\)\s*\{[^}]*\.lp-float\s*\{\s*animation:\s*none/,
    );
  });

  test("the accent band is an inset rounded band on the accent, in the ink colour, tagged as the final CTA", () => {
    const band = code(shared("LpAccentBand"));
    const section = openingTags(band).find((tag) => tag.name === "LpSection");

    expect(literalAttr(section?.attrs ?? "", "section")).toBe("final_cta");
    expect(band).toContain("rounded-[28px]");
    expect(band).toContain("bg-[var(--accent)]");
    expect(band).toContain("var(--near-black)");
  });
});

describe("the level cards (AC20)", () => {
  const cards = () => code(shared("LevelCards"));

  test("draw the barbershop sample as Bronze, Silver and Gold, each with its level name in the header", () => {
    expect(cards()).toMatch(/id\s*===\s*"barber"/);
    for (const name of ["Bronze", "Silver", "Gold"]) expect(cards()).toContain(name);
    expect(cards()).toContain("headerLabel");
    expect(cards()).toMatch(/SILVER_LOOK|SILVER/);
    expect(cards()).toMatch(/GOLD_LOOK|GOLD/);
    expect(cards()).toContain("showQR={false}");
  });

  test("draw the default level-up notification over the cards when asked, from the copy", () => {
    expect(cards()).toContain("LEVEL_UP_BANNER");
    expect(cards()).toMatch(/banner\??:\s*boolean/);
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

  // The timeline arrives with the How-to stage; from then on this holds for it.
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

    expect(qr).toBeDefined();
    expect(qr?.attrs).toContain("animated={false}");
  });
});

describe("the pieces the pages move to the shared folder", () => {
  test("the wallet phone is shared, with the placard beside the how-to steps", () => {
    expect(existsSync(shared("WalletPhone"))).toBe(true);
    expect(code(shared("WalletPhone"))).toMatch(/export function WalletPhone\b/);
    expect(existsSync(pageComponent("how-it-works", "PlacardVisual"))).toBe(true);
    expect(code(pageComponent("how-it-works", "PlacardVisual"))).toMatch(/export function PlacardVisual\b/);
  });
});

describe("components the pages extend: their other callers pass none of the new props (AC15, AC15v2)", () => {
  const NOTIFICATION_DEMOS = ["components/features/notifications-push/NotificationsPushPage.tsx"];
  const CARD_DESIGN_PAGE = "components/features/design-de-carte/CardDesignPageContent.tsx";

  test.each([
    ["NotificationPhoneDemo", ["notifications", "animate", "eager", "width"], NOTIFICATION_DEMOS],
    ["CardStyleGallery", ["showCta", "heading", "sectionClassName"], [CARD_DESIGN_PAGE]],
    ["QRCodeSkeleton", ["animated"], ["components/card/WalletCard.tsx"]],
    [
      "NotificationBanner",
      ["icon"],
      [
        "components/features/geolocalisation/GeofencingPage.tsx",
        "components/features/geolocalisation/GeofencingHeroAnimation.tsx",
        "components/features/notifications-push/NotificationSequenceDemo.tsx",
      ],
    ],
    ["HeroCardStack", ["peekFrom"], [CARD_DESIGN_PAGE, "components/compare/ComparisonPage.tsx"]],
  ])("%s", (component, newProps, callers) => {
    for (const caller of callers) {
      const calls = openingTags(read(join(ROOT, caller))).filter((tag) => tag.name === component);

      expect({ caller, calls: calls.length > 0 }).toEqual({ caller, calls: true });
      for (const call of calls) {
        for (const prop of newProps) {
          expect({ caller, prop, passed: new RegExp(`(?:^|\\s)${prop}(?![\\w-])`).test(call.attrs) }).toEqual({
            caller,
            prop,
            passed: false,
          });
        }
      }
    }
  });

  /** The site's own call sites of a component the v2 pages extend: all of them, wherever they are. */
  test.each([
    ["WalletCard", "components/card/WalletCard.tsx", ["headerLabel"]],
    ["Segmented", "components/ui/Segmented.tsx", ["size"]],
    ["NotificationSequenceDemo", "components/features/notifications-push/NotificationSequenceDemo.tsx", ["moments", "design"]],
    ["ScanDemo", "components/features/scanner-mobile/ScanDemo.tsx", ["chrome"]],
    ["CardDesignPlayground", "components/features/design-de-carte/CardDesignPlayground.tsx", ["compact"]],
    ["BlogCard", "components/blog/BlogCard.tsx", ["detail"]],
  ])("%s", (component, file, newProps) => {
    const callers = otherCallers(component, join(ROOT, file));

    expect(callers.length).toBeGreaterThan(0);
    for (const { file: caller, attrs } of callers) {
      for (const prop of newProps) {
        expect({ caller, prop, passed: new RegExp(`(?:^|\\s)${prop}(?![\\w-])`).test(attrs) }).toEqual({
          caller,
          prop,
          passed: false,
        });
      }
    }
  });

  test("CTAButton's other callers never ask for the inverse variant", () => {
    const callers = otherCallers("CTAButton", join(ROOT, "components/ui/CTAButton.tsx"));

    expect(callers.length).toBeGreaterThan(0);
    expect(callers.filter(({ attrs }) => /inverse/.test(attrs))).toEqual([]);
    expect(callers.filter(({ attrs }) => literalAttr(attrs, "variant") === "inverse")).toEqual([]);
  });
});

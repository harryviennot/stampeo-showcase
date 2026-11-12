/**
 * What the three landing pages share and what they borrow: the dashboard
 * capture, the plan line, the sender on a banner, the tokens that must go
 * through `RegionText`, the placard's QR, How-to's closing line, and the
 * components the pages extend, whose other callers must not notice.
 */

import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { lpBanner } from "../../components/landing-pages/shared/banner";
import { ROOT, code, filesWith, findTag, openingTags, read, sourceFiles } from "../testing/jsx-source";
import { COMPONENTS_DIR, landingTree, lpFiles, pageFile, shared } from "../testing/landing-pages-source";
import { REWARD_BANNER, SAMPLE_BUSINESS, STAMP_BANNER } from "./copy/shared";
import { FEATURES } from "./copy/features";
import { OUTCOMES } from "./copy/outcomes";
import { LANDING_PAGES } from "./pages";

describe("dashboard captures (AC9)", () => {
  /** A file that draws a dashboard capture has to print the sample-data caption with it. */
  const missesCaption = (source: string) =>
    openingTags(source).some((tag) => tag.name === "PhoneScreenshot") && !source.includes("sampleData");

  test("the guard flags a capture without its caption and accepts one with it", () => {
    expect(missesCaption('<PhoneScreenshot src="x" alt="y" />')).toBe(true);
    expect(missesCaption('<PhoneScreenshot src="x" alt="y" />{SHARED.sampleData}')).toBe(false);
    expect(missesCaption("<IPhone />")).toBe(false);
  });

  test("every file that draws a capture prints SHARED.sampleData", () => {
    expect(lpFiles().filter((file) => missesCaption(read(file)))).toEqual([]);
  });

  test("How-to draws none", () => {
    expect(filesWith([...landingTree(pageFile("how-it-works"))], /<PhoneScreenshot\b/)).toEqual([]);
  });
});

describe("the pieces the spotlights share (one solution each)", () => {
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

  test("the dashboard capture is one figure: the phone shot in the crop, its sample-data caption under it", () => {
    const capture = code(shared("SampleCapture"));
    const [open, phone, close, caption] = ["<PhoneCrop", "<PhoneScreenshot", "</PhoneCrop>", "<figcaption"].map((needle) =>
      capture.indexOf(needle),
    );

    expect(filesWith(lpFiles(), /\blandingShot\(/)).toEqual([shared("SampleCapture")]);
    expect(filesWith(lpFiles(), /<PhoneScreenshot\b/)).toEqual([shared("SampleCapture")]);
    expect(capture).toContain('landingShot("en", "phone")');
    expect(capture).toContain("SHARED.sampleData");
    expect(open).toBeGreaterThan(-1);
    expect([open, phone, close, caption]).toEqual([open, phone, close, caption].sort((a, b) => a - b));
  });
});

describe("a notification is the sample café's, never Stampeo's (AC10)", () => {
  const BANNERS = [STAMP_BANNER, REWARD_BANNER, OUTCOMES.slowDays.banner, ...FEATURES.messages.banners];

  test.each(BANNERS.map((banner) => [banner.body, banner] as const))("%s", (_body, banner) => {
    const props = lpBanner(banner);

    expect(props.appName).toBe(SAMPLE_BUSINESS);
    expect(props.appName).not.toMatch(/stampeo/i);
    expect(props.title).toBe(banner.body);
  });
});

describe("prices and the trial length are printed through RegionText (AC13)", () => {
  // The reassurance and the FAQ answers carry a `{trialDays}` token that only RegionText fills in.
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

describe("the step-2 QR mark (AC14)", () => {
  test("no component of these pages draws a scannable code", () => {
    expect(filesWith(sourceFiles(COMPONENTS_DIR), /qrcode\.react|\bQRCodeSVG\b/)).toEqual([]);
  });

  test("the placard's QR is the still skeleton", () => {
    const qr = findTag(read(join(COMPONENTS_DIR, "how-it-works", "HowSteps.tsx")), "QRCodeSkeleton");

    expect(qr).toBeDefined();
    expect(qr?.attrs).toContain("animated={false}");
  });
});

describe("How-to's steps (AC8)", () => {
  test("end with the one 'all you need' line, printed after the list and not a section of its own", () => {
    const steps = code(join(COMPONENTS_DIR, "how-it-works", "HowSteps.tsx"));

    expect(steps.indexOf("</ol>")).toBeGreaterThan(-1);
    expect(steps.indexOf("{allYouNeed}")).toBeGreaterThan(steps.indexOf("</ol>"));
    expect(LANDING_PAGES["how-it-works"].sections.filter((id) => /need/.test(id))).toEqual([]);
  });
});

describe("components the pages extend: their other callers pass none of the new props (AC15)", () => {
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
});

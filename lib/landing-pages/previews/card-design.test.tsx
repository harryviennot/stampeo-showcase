/**
 * The card design preview (`/us/landing-pages/platform/card-design`): what a
 * visitor sees in each section, from the hero's fan to the cream card. Every
 * section is rendered under the English catalogs; the hero, the headers, the
 * order and the tap targets of all five previews are in `pages.test.tsx`.
 */

import { describe, expect, test } from "bun:test";
import { AnatomySection } from "@/components/landing-pages/feature-previews/card-design/AnatomySection";
import { DesignerSection } from "@/components/landing-pages/feature-previews/card-design/DesignerSection";
import { DesignFigures } from "@/components/landing-pages/feature-previews/card-design/DesignFigures";
import { iconRows } from "@/components/landing-pages/feature-previews/card-design/IconRows";
import { IconsStrip } from "@/components/landing-pages/feature-previews/card-design/IconsStrip";
import { StampStyleRows } from "@/components/landing-pages/feature-previews/card-design/StampStyleRows";
import { LpFaq } from "@/components/landing-pages/shared/LpFaq";
import { STEPS_PHONE } from "@/components/landing-pages/platform/StepsTable";
import { stampIcons } from "@/components/onboarding/StampIconPicker";
import { previewSource } from "../../testing/landing-pages-source";
import { expectInOrder, pictures, renderEn, renderEnAsync, textOf } from "../../testing/render-en";
import { renderPreviewPage } from "../../testing/preview-page";
import { mockEnglishServerTranslations } from "../../testing/server-intl";
import { CARD_DESIGN_PREVIEW as COPY } from "../copy/previews/card-design";
import { SHARED } from "../copy/shared";

// The wallets table holds two async phone components that ask next-intl for their words.
await mockEnglishServerTranslations();
const { WalletsSection } = await import("@/components/landing-pages/feature-previews/card-design/WalletsSection");

describe("the page", () => {
  test("asks the five questions of its own FAQ, and says nothing about plans: every part of it is on every plan", async () => {
    const page = await renderPreviewPage("platform/card-design");

    expectInOrder(page, [COPY.faq.title, ...COPY.faq.items.map((item) => item.question)]);
    expect(textOf(page)).not.toMatch(/Every plan|Growth and Pro/);
  });
});

describe("an icon for every trade", () => {
  const html = () => renderEn(<IconsStrip />);

  test("says what the rows are and is one picture to a screen reader, not a hundred tiles", () => {
    expect(textOf(html())).toContain(COPY.icons.label);
    expect(pictures(html())).toEqual([COPY.icons.alt]);
  });

  test("two rows share the whole library between them, and no icon is in both", () => {
    const [a, b] = iconRows();

    expect(a.length + b.length).toBe(stampIcons.length);
    expect(new Set([...a, ...b]).size).toBe(stampIcons.length);
    expect(Math.abs(a.length - b.length)).toBeLessThanOrEqual(1);
  });

  test("the rows drift in opposite directions, and each track stops for a reader who asks for less motion", () => {
    const rows = html().match(/animation:marquee-scroll \d+s linear infinite( reverse)?/g) ?? [];
    const stops = html().match(/class="[^"]*motion-reduce:animate-none![^"]*" style="animation:marquee-scroll/g) ?? [];

    expect(rows).toHaveLength(2);
    expect(rows.filter((row) => row.endsWith("reverse"))).toHaveLength(1);
    expect(stops).toHaveLength(2);
  });

  test("the rows fade out at both edges and run from edge to edge of the screen, outside the page's column", () => {
    expect(html()).toContain("[mask-image:linear-gradient(to_right,transparent");
    expect(html()).toMatch(/<\/p><\/div><div role="img"/);
  });
});

describe("try the designer", () => {
  const html = () => renderEn(<DesignerSection />, { us: true });

  test("is the jump target of the hero's second button and of the one under the figures", () => {
    expect(html()).toContain('id="playground"');
  });

  test("opens on the live card and its controls, then offers the trial again right under them", () => {
    expectInOrder(html(), ["Stamps", "Points", SHARED.cta]);
  });

  test("its stamps slider is 44px, to tap on a phone (its toggle is held to that with every other button, in pages.test.tsx)", () => {
    expect(html()).toMatch(/<input[^>]*type="range"[^>]*\bh-11\b/);
  });
});

describe("every part of the card is yours", () => {
  const html = () => renderEn(<AnatomySection />);

  test("labels the six parts of the card, and lets a visitor see the points card too", () => {
    const text = textOf(html());

    for (const part of ["Logo", "Name", "Stamps", "Fields", "Reward", "QR code"]) expect(text).toContain(part);
    expect(html()).toMatch(/role="tablist"/);
    expect(text).toContain("Points");
  });
});

describe("what's in the designer", () => {
  const html = () => renderEn(<DesignFigures />, { us: true });

  test("is three handwritten figures and then the two buttons", () => {
    expectInOrder(html(), [...COPY.numbers.figures.flatMap((figure) => [figure.value, figure.label]), SHARED.cta, COPY.designerLink]);
    expect(html().match(/class="ink-figure/g)).toHaveLength(3);
  });

  test("98 is the library's icon count, so the claim stays true when an icon is added", () => {
    expect(COPY.numbers.figures[0].value).toBe(String(stampIcons.length));
  });

  test("its second button jumps to the designer, and its trial button is tracked as the feature CTA", () => {
    expect(html()).toMatch(/<a [^>]*href="#playground"/);
    expect(previewSource("platform/card-design", "DesignFigures")).toMatch(/<LpCtaPair\s+location="feature_cta"/);
  });
});

describe("stamps that look like what you sell", () => {
  const html = () => renderEn(<StampStyleRows />);

  test("shows the three ways a stamp can look, each open with its words and its card", () => {
    expectInOrder(html(), COPY.stamps.rows.flatMap((row) => [row.eyebrow, row.title, row.body]));
    expect(html().match(/data-open="true"/g)).toHaveLength(COPY.stamps.rows.length);
    expect(html()).not.toContain('data-open="false"');
  });

  test("each row's card is named for a screen reader", () => {
    expect(pictures(html())).toEqual(expect.arrayContaining(Object.values(COPY.stamps.cardAlts)));
  });

  test("the three cards are three different looks: a preset icon, the shop's own icon, and a layout that piles them up", () => {
    expect(html().match(/<img\b[^>]*src="\/themes\/(?:oba|gelo)\//g)?.length).toBeGreaterThanOrEqual(2);
  });
});

describe("one card, ready for every phone", () => {
  test("shows the card in Apple Wallet and in Google Wallet, side by side, each named for a screen reader, sinking behind the table", async () => {
    const html = await renderEnAsync(<WalletsSection />);

    expect(pictures(html)).toEqual([COPY.wallets.phoneAlts.apple, COPY.wallets.phoneAlts.google]);
    expect(html.match(new RegExp(`--narrow-w:${STEPS_PHONE.narrow}px`, "g"))).toHaveLength(2);
    expectInOrder(html, COPY.wallets.cells.flatMap((cell) => [cell.title, cell.body]));
  });

  test("the alt texts say which wallet each phone is", () => {
    expect(COPY.wallets.phoneAlts.apple).toContain("Apple Wallet");
    expect(COPY.wallets.phoneAlts.google).toContain("Google Wallet");
  });
});

describe("card styles, answered", () => {
  const html = () => renderEn(<LpFaq faq={COPY.faq} />, { us: true });

  test("asks the five questions a shop owner has, collapsed, then points to the contact page", () => {
    expect(COPY.faq.items).toHaveLength(5);
    expectInOrder(html(), [COPY.faq.title, ...COPY.faq.items.map((item) => item.question), SHARED.faq.contact.link]);
    expect(html()).not.toMatch(/<details[^>]*\bopen\b/);
  });

  test("answers 98 with the library's real count", () => {
    expect(COPY.faq.items.map((item) => item.answer).join(" ")).toContain(`${stampIcons.length} ready-made icons`);
  });
});

/**
 * The card design preview (`/us/landing-pages/platform/card-design`): what a
 * visitor sees in each section, from the hero's fan to the cream card. The
 * sections that are plain server components are rendered under the English
 * catalogs, as a page does; the wallets table holds two async phone components,
 * so it is read as source.
 */

import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { AnatomySection } from "@/components/landing-pages/feature-previews/card-design/AnatomySection";
import { DesignerSection } from "@/components/landing-pages/feature-previews/card-design/DesignerSection";
import { DesignFigures } from "@/components/landing-pages/feature-previews/card-design/DesignFigures";
import { iconRows } from "@/components/landing-pages/feature-previews/card-design/IconRows";
import { IconsStrip } from "@/components/landing-pages/feature-previews/card-design/IconsStrip";
import { StampStyleRows } from "@/components/landing-pages/feature-previews/card-design/StampStyleRows";
import { LpFaq } from "@/components/landing-pages/shared/LpFaq";
import { stampIcons } from "@/components/onboarding/StampIconPicker";
import { COMPONENTS_DIR, pageFile } from "../../testing/landing-pages-source";
import { code, findTag, literalAttr, openingTags, read, sourceFiles } from "../../testing/jsx-source";
import { renderEn, textOf } from "../../testing/render-en";
import { CARD_DESIGN_PREVIEW as COPY } from "../copy/previews/card-design";
import { SHARED } from "../copy/shared";

const FOLDER = join(COMPONENTS_DIR, "feature-previews", "card-design");
const section = (name: string) => code(join(FOLDER, `${name}.tsx`));
const page = () => code(pageFile("platform/card-design"));
/** The page's own and its section components' source: where a negative must hold. */
const OWN_FILES = () => [pageFile("platform/card-design"), ...sourceFiles(FOLDER)];
/** The section header every Platform-style section opens with, in the order a visitor reads it. */
const header = (copy: { eyebrow: string; title: string; lead?: string }) => [copy.eyebrow, copy.title, ...(copy.lead ? [copy.lead] : [])];

/** Markup with its entities read back, so a class like `[&>div]` or a name with an apostrophe can be matched as written. */
const decoded = (html: string) => html.replace(/&(?:amp|#x27|quot|lt|gt);/g, (entity) => ({ "&amp;": "&", "&#x27;": "'", "&quot;": '"', "&lt;": "<", "&gt;": ">" })[entity] ?? entity);

/** The lines appear in the text in this order: a header is an eyebrow, then the title, then the lead. */
function expectInOrder(html: string, lines: string[]) {
  const text = textOf(html);
  const at = lines.map((line) => text.indexOf(line));

  expect(at.every((index) => index > -1)).toBe(true);
  expect(at).toEqual([...at].sort((a, b) => a - b));
}

describe("the page", () => {
  test("a visitor reads the brief's ten sections top to bottom, with the numbers between two hairlines like Platform's", () => {
    const names = openingTags(page())
      .map((tag) => tag.name)
      .filter((name) => /^(PlatformHero|IconsStrip|DesignerSection|AnatomySection|Hairline|DesignFigures|StampStyleRows|WalletsSection|LpFaq|LpAccentBand|RelatedPreviews)$/.test(name));

    expect(names).toEqual([
      "PlatformHero",
      "IconsStrip",
      "DesignerSection",
      "AnatomySection",
      "Hairline",
      "DesignFigures",
      "Hairline",
      "StampStyleRows",
      "WalletsSection",
      "LpFaq",
      "LpAccentBand",
      "RelatedPreviews",
    ]);
  });

  test("the FAQ is the page's own five questions", () => {
    expect(findTag(page(), "LpFaq")?.attrs).toMatch(/\bfaq=\{CARD_DESIGN_PREVIEW\.faq\}/);
  });

  test.each(["Sample data", "Every plan", "sampleData", "SampleCapture", "PlanChip", "{trialDays}"])("says nothing about %s", (needle) => {
    for (const file of OWN_FILES()) expect(code(file)).not.toContain(needle);
  });
});

describe("an icon for every trade", () => {
  const html = () => renderEn(<IconsStrip />);

  test("says what the rows are and is one picture to a screen reader, not a hundred tiles", () => {
    expect(textOf(html())).toContain(COPY.icons.label);
    expect(decoded(html())).toContain(`role="img" aria-label="${COPY.icons.alt}"`);
  });

  test("two rows share the whole library between them, and no icon is in both", () => {
    const [a, b] = iconRows();

    expect(a.length + b.length).toBe(stampIcons.length);
    expect(new Set([...a, ...b]).size).toBe(stampIcons.length);
    expect(Math.abs(a.length - b.length)).toBeLessThanOrEqual(1);
  });

  test("the rows drift in opposite directions, and one that asks for less motion stands still", () => {
    const rows = html().match(/animation:marquee-scroll \d+s linear infinite( reverse)?/g) ?? [];

    expect(rows).toHaveLength(2);
    expect(rows.filter((row) => row.endsWith("reverse"))).toHaveLength(1);
    expect(decoded(html()).match(/motion-reduce:\[&>div>div\]:animate-none!/g)).toHaveLength(2);
  });

  test("the rows fade out at both edges and run from edge to edge of the screen, outside the page's column", () => {
    const source = section("IconsStrip");

    expect(html()).toContain("[mask-image:linear-gradient(to_right,transparent");
    expect(source.indexOf("</Container>")).toBeGreaterThan(-1);
    expect(source.indexOf("</Container>")).toBeLessThan(source.indexOf("<IconRows"));
  });
});

describe("try the designer", () => {
  const html = () => renderEn(<DesignerSection />, { us: true });

  test("is the jump target of the hero's second button and of the one under the figures", () => {
    expect(html()).toContain('id="playground"');
    expect(findTag(section("DesignerSection"), "LpSection")?.attrs).toMatch(/\banchor\b/);
  });

  test("opens on its eyebrow, title and lead, then the live card and its controls", () => {
    expectInOrder(html(), [...header(COPY.playground), "Stamps", "Points"]);
  });

  test("offers the trial again right under the designer, as the outline button of the page's kit", () => {
    const source = section("DesignerSection");

    expect(textOf(html())).toContain(SHARED.cta);
    expect(source.indexOf("<CompactPlayground")).toBeLessThan(source.indexOf("<LpTrialButton"));
    expect(openingTags(source).some((tag) => tag.name === "CTAButton")).toBe(false);
  });
});

describe("every part of the card is yours", () => {
  const html = () => renderEn(<AnatomySection />);

  test("opens on its eyebrow, title and lead, centred, over the card", () => {
    expectInOrder(html(), header(COPY.anatomy));
    expect(html()).toContain("text-center");
  });

  test("labels the six parts of the card, and lets a visitor see the points card too", () => {
    const text = textOf(html());

    for (const part of ["Logo", "Name", "Stamps", "Fields", "Reward", "QR code"]) expect(text).toContain(part);
    expect(html()).toMatch(/role="tablist"/);
    expect(text).toContain("Points");
  });
});

describe("what's in the designer", () => {
  const html = () => renderEn(<DesignFigures />, { us: true });

  test("is a header, three handwritten figures and then the two buttons", () => {
    expectInOrder(html(), [COPY.numbers.eyebrow, COPY.numbers.title, ...COPY.numbers.figures.flatMap((figure) => [figure.value, figure.label]), SHARED.cta, COPY.designerLink]);
    expect(html().match(/class="ink-figure/g)).toHaveLength(3);
  });

  test("98 is the library's icon count, so the claim stays true when an icon is added", () => {
    expect(COPY.numbers.figures[0].value).toBe(String(stampIcons.length));
  });

  test("its second button jumps to the designer and its trial button is the feature CTA", () => {
    const pair = findTag(section("DesignFigures"), "LpCtaPair");

    expect(literalAttr(pair?.attrs ?? "", "location")).toBe("feature_cta");
    expect(pair?.attrs).toMatch(/secondary=\{\{ label: CARD_DESIGN_PREVIEW\.designerLink, href: "#playground" \}\}/);
    expect(html()).toMatch(/<a [^>]*href="#playground"/);
  });

  test("the figures come from the copy through the page kit's NumberFigures", () => {
    expect(findTag(section("DesignFigures"), "NumberFigures")?.attrs).toMatch(/\bitems=\{/);
  });
});

describe("stamps that look like what you sell", () => {
  const html = () => renderEn(<StampStyleRows />);

  test("opens on its header, then the three ways a stamp can look, each open with its words and its card", () => {
    expectInOrder(html(), [
      ...header(COPY.stamps),
      ...COPY.stamps.rows.flatMap((row) => [row.eyebrow, row.title, row.body]),
    ]);
    expect(html().match(/data-open="true"/g)).toHaveLength(COPY.stamps.rows.length);
    expect(html()).not.toContain('data-open="false"');
  });

  test.each(Object.entries(COPY.stamps.cardAlts))("the %s row's card is named for a screen reader: %s", (_key, alt) => {
    expect(decoded(html())).toContain(`role="img" aria-label="${alt}"`);
  });

  test("the three cards are three different looks: a preset icon, the shop's own icon, and a layout that piles them up", () => {
    const source = section("StampStyleRows");

    for (const id of ["patoune", "oba", "gelo"]) expect(source).toContain(`"${id}"`);
    expect(html().match(/<img\b[^>]*src="\/themes\/(?:oba|gelo)\//g)?.length).toBeGreaterThanOrEqual(2);
  });
});

describe("one card, ready for every phone", () => {
  const source = () => section("WalletsSection");

  test("shows the card in Apple Wallet and in Google Wallet, side by side, sinking behind the table", () => {
    for (const phone of ["WalletPhone", "GoogleWalletPhone"]) {
      expect(findTag(source(), phone)?.attrs).toMatch(/\bwidth=\{PHONE\.full\}\s+narrowWidth=\{PHONE\.narrow\}/);
    }
    expect(source()).toMatch(/PHONE = \{ full: 280, narrow: 160 \}/);
    expect(source().indexOf("<WalletPhone")).toBeLessThan(source().indexOf("<GoogleWalletPhone"));
    expect(findTag(source(), "StepsTable")?.attrs).toMatch(/\bvisual=\{/);
  });

  test("each phone is named for a screen reader from the copy", () => {
    const labels = openingTags(source())
      .filter((tag) => tag.name === "div" && literalAttr(tag.attrs, "role") === "img")
      .map((tag) => /aria-label=\{([^}]*)\}/.exec(tag.attrs)?.[1]);

    expect(labels).toEqual(["phoneAlts.apple", "phoneAlts.google"]);
    expect(COPY.wallets.phoneAlts.apple).toContain("Apple Wallet");
    expect(COPY.wallets.phoneAlts.google).toContain("Google Wallet");
  });

  test("opens on its eyebrow, title and lead, centred, over the copy's three cells", () => {
    const frame = findTag(source(), "LpSection");

    expect(literalAttr(frame?.attrs ?? "", "section")).toBe("wallets");
    expect(literalAttr(frame?.attrs ?? "", "align")).toBe("center");
    for (const part of ["eyebrow", "title", "lead"]) expect(frame?.attrs).toMatch(new RegExp(`\\b${part}=\\{${part}\\}`));
    expect(source()).toContain("= CARD_DESIGN_PREVIEW.wallets");
    expect(findTag(source(), "StepsTable")?.attrs).toMatch(/\bcells=\{cells\}/);
    expect(COPY.wallets.cells).toHaveLength(3);
  });
});

describe("card styles, answered", () => {
  const html = () => renderEn(<LpFaq faq={COPY.faq} />, { us: true });

  test("asks the five questions a shop owner has, collapsed, then points to the contact page", () => {
    const text = textOf(html());

    expect(COPY.faq.items).toHaveLength(5);
    expect(text).toContain(COPY.faq.title);
    for (const { question } of COPY.faq.items) expect(text).toContain(question);
    expect(text).toContain(SHARED.faq.contact.link);
    expect(html()).not.toMatch(/<details[^>]*\bopen\b/);
  });

  test("answers 98 with the library's real count", () => {
    const answer = COPY.faq.items.map((item) => item.answer).join(" ");

    expect(answer).toContain(`${stampIcons.length} ready-made icons`);
  });
});

describe("the buttons that start a trial", () => {
  test("every trial button on the page is one the kit tracks: the hero's pair, the figures' pair, the designer's, the cream card", () => {
    const trackedBy = (name: string) => OWN_FILES().filter((file) => openingTags(read(file)).some((tag) => tag.name === name));

    expect(trackedBy("LpCtaPair")).toEqual([join(FOLDER, "DesignFigures.tsx")]);
    expect(trackedBy("LpTrialButton")).toEqual([join(FOLDER, "DesignerSection.tsx")]);
    expect(trackedBy("CTAButton")).toEqual([]);
    expect(trackedBy("PlatformHero")).toEqual([pageFile("platform/card-design")]);
    expect(trackedBy("LpAccentBand")).toEqual([pageFile("platform/card-design")]);
  });
});

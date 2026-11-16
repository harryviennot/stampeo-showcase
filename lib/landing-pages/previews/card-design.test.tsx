/**
 * The card design preview (`/us/landing-pages/platform/card-design`): what a
 * visitor sees in each section, from the hero's re-skinning card to the cream
 * card. Every section is rendered under the English catalogs; the headers, the
 * order and the tap targets of all six previews are in `pages.test.tsx`.
 */

import { describe, expect, test } from "bun:test";
import { AnatomySection } from "@/components/landing-pages/feature-previews/card-design/AnatomySection";
import { DesignerSection } from "@/components/landing-pages/feature-previews/card-design/DesignerSection";
import { iconRows } from "@/components/landing-pages/feature-previews/card-design/IconRows";
import { PalettesSection } from "@/components/landing-pages/feature-previews/card-design/PalettesSection";
import { ReskinHero } from "@/components/landing-pages/feature-previews/card-design/ReskinHero";
import { IconsStrip } from "@/components/landing-pages/feature-previews/card-design/IconsStrip";
import { StampStyleRows } from "@/components/landing-pages/feature-previews/card-design/StampStyleRows";
import { LpFaq } from "@/components/landing-pages/shared/LpFaq";
import { STEPS_PHONE } from "@/components/landing-pages/platform/StepsTable";
import { stampIcons } from "@/components/onboarding/StampIconPicker";
import { ROOT, openingTags, read } from "../../testing/jsx-source";
import { otherCallers, previewSource } from "../../testing/landing-pages-source";
import { expectInOrder, pictures, renderEn, renderEnAsync, textOf } from "../../testing/render-en";
import { renderPreviewPage } from "../../testing/preview-page";
import { mockEnglishServerTranslations } from "../../testing/server-intl";
import { CARD_DESIGN_PREVIEW as COPY } from "../copy/previews/card-design";
import { SHARED } from "../copy/shared";
import { ANATOMY_DESIGNS, WALLET_SAMPLE } from "../card-design-samples";
import { PULP_PALETTES } from "../pulp-palettes";
import { RESKIN_SHOPS, reskinCard } from "../reskin";
import { join } from "node:path";

// The wallets table holds two async phone components that ask next-intl for their words.
await mockEnglishServerTranslations();
const { WalletsSection } = await import("@/components/landing-pages/feature-previews/card-design/WalletsSection");

/** The shops' logos in a render, one for each card or logo tile. */
const logos = (html: string) => [...html.matchAll(/<img[^>]*\bsrc="(\/themes\/[a-z-]+\/logo\.[a-z]+)"/g)].map((match) => match[1]);

/** The page's `data-landing-section` ids in document order, and the markup of each section up to the next. */
function sectionsOf(html: string): Array<{ id: string; html: string }> {
  const marks = [...html.matchAll(/data-landing-section="([a-z_]+)"/g)];

  return marks.map((mark, index) => ({ id: mark[1], html: html.slice(mark.index, marks[index + 1]?.index ?? html.length) }));
}

describe("the page", () => {
  test("asks the five questions of its own FAQ, and says nothing about plans: every part of it is on every plan", async () => {
    const page = await renderPreviewPage("platform/card-design");

    expectInOrder(page, [COPY.faq.title, ...COPY.faq.items.map((item) => item.question)]);
    expect(textOf(page)).not.toMatch(/Every plan|Growth and Pro/);
  });

  test("shows a different shop in each section: no shop's logo is in two of them, and the bubble tea shop and the barbershop are in none", async () => {
    const page = await renderPreviewPage("platform/card-design");
    const bySection = sectionsOf(page).map(({ id, html }) => [id, new Set(logos(html))] as const);
    const seen = new Map<string, string>();

    for (const [id, set] of bySection) {
      for (const logo of set) {
        expect({ logo, also: seen.get(logo) }).toEqual({ logo, also: undefined });
        seen.set(logo, id);
      }
    }
    expect([...seen.keys()].join(" ")).not.toMatch(/\/themes\/(oba|barber)\//);
    expect(textOf(page)).not.toMatch(/Parisian|\bOBA\b/i);
    // The points card the anatomy section switches to is not on the page until a visitor asks for it.
    expect(seen.has(ANATOMY_DESIGNS.points.design.logo_url ?? "")).toBe(false);
  });

  test("has no figures band and so no hairlines: the 98 is on the icons", async () => {
    expect(await renderPreviewPage("platform/card-design")).not.toContain("<hr");
  });
});

describe("one card, many shops", () => {
  const html = () => renderEn(<ReskinHero />, { us: true });

  test("opens on the label, the headline and the sub, then the card, its caption and the two buttons", () => {
    expectInOrder(html(), [COPY.hero.eyebrow, COPY.hero.accent, COPY.hero.sub, COPY.reskin.captions[0], SHARED.cta, COPY.designerLink, "14 days free"]);
  });

  test("draws the card of each of the six shops, as one picture named for what it does, and names the first shop in a caption", () => {
    expect(logos(html())).toEqual(expect.arrayContaining(RESKIN_SHOPS.map((id) => reskinCard(id).design.logo_url ?? "")));
    expect(new Set(logos(html())).size).toBe(6);
    expect(pictures(html())).toEqual([COPY.reskin.alt]);
    expect(textOf(html())).toContain("Car wash");
  });

  test("sends the second button to the designer, and tracks the trial as the hero's", () => {
    expect(html()).toMatch(/<a [^>]*href="#playground"/);
    expect(html()).toMatch(/<a [^>]*href="\/en\/onboarding"/);
    expect(previewSource("platform/card-design", "ReskinHero")).toMatch(/<LpCtaPair\s+location="hero"/);
    expect(html()).toContain('data-landing-section="hero"');
  });
});

describe("an icon for every trade", () => {
  const html = () => renderEn(<IconsStrip />);

  test("says what the rows are in a handwritten figure and its label, and is one picture to a screen reader, not a hundred tiles", () => {
    expectInOrder(html(), [COPY.icons.figure.value, COPY.icons.figure.label]);
    expect(html().match(/class="ink-figure/g)).toHaveLength(1);
    expect(pictures(html())).toEqual([COPY.icons.alt]);
  });

  test("98 is the library's icon count, so the claim stays true when an icon is added", () => {
    expect(COPY.icons.figure.value).toBe(String(stampIcons.length));
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

  test("opens on the live card and its controls, then offers the trial again right under them as a keycap", () => {
    expectInOrder(html(), ["Stamps", "Points", SHARED.cta]);
    expect(html()).toMatch(/<a [^>]*class="[^"]*\bkeycap\b[^"]*"[^>]*href="\/en\/onboarding"|<a [^>]*href="\/en\/onboarding"[^>]*class="[^"]*\bkeycap\b/);
  });

  test("the designer sits on one stamped stage", () => {
    expect(html()).toContain("card-stamp");
  });

  test("its stamps slider is 44px, to tap on a phone (its toggle is held to that with every other button, in pages.test.tsx)", () => {
    expect(html()).toMatch(/<input[^>]*type="range"[^>]*\bh-11\b/);
  });
});

describe("every part of the card is yours", () => {
  const html = () => renderEn(<AnatomySection />);

  test("labels a spa's card, not the generic café the live page uses, and its points card is the boutique's", () => {
    expect(logos(html())).toEqual(["/themes/saltmoss/logo.png"]);
    expect(textOf(html())).not.toContain("Parisian");
    expect(ANATOMY_DESIGNS.points.design.logo_url).toBe("/themes/ode/logo.svg");
  });

  test("labels the six parts of the card, and lets a visitor see the points card too", () => {
    const text = textOf(html());

    for (const part of ["Logo", "Name", "Stamps", "Fields", "Reward", "QR code"]) expect(text).toContain(part);
    expect(html()).toMatch(/role="tablist"/);
    expect(text).toContain("Points");
  });
});

describe("colors from your logo", () => {
  const html = () => renderEn(<PalettesSection />);

  test("shows the logo with its label, the card it dresses, and five palettes to pick from, the first one chosen", () => {
    const text = textOf(html());

    expect(text).toContain(COPY.palettes.logoLabel);
    expect(logos(html())).toEqual(["/themes/pulp/logo.svg", "/themes/pulp/logo.svg"]);
    expect(pictures(html())).toEqual(expect.arrayContaining([COPY.palettes.logoAlt, COPY.palettes.cardAlt]));
    expect(html().match(/aria-pressed="true"/g)).toHaveLength(1);
    expect(html().match(/aria-pressed="false"/g)).toHaveLength(4);
  });

  test("each palette is a 44px button named for a screen reader, split between the card's colour and its stamp colour", () => {
    const buttons = [...html().matchAll(/<button\b([^>]*)>/g)].map((match) => match[1]);

    expect(buttons).toHaveLength(PULP_PALETTES.length);
    COPY.palettes.swatches.forEach((name, index) => {
      expect(buttons[index]).toContain(`aria-label="${name}"`);
      expect(buttons[index]).toMatch(/\bh-11\b/);
      expect(buttons[index]).toMatch(/\bw-11\b/);
    });
    expect(html()).toContain(PULP_PALETTES[0].background);
    expect(html()).toContain(PULP_PALETTES[0].stampFilled);
  });

  test("opens on the first palette: the card is dressed in it", () => {
    expect(html()).toContain(`background-color:${PULP_PALETTES[0].background}`);
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

  test("the three cards are three different shops: the groomer's paw, the burger bar's own burger, and the gelato shop's piled cones", () => {
    expect(logos(html())).toEqual(["/themes/patoune/logo.svg", "/themes/smash-club/logo.png", "/themes/gelo/logo.svg"]);
  });
});

describe("one card, ready for every phone", () => {
  test("shows the card in Apple Wallet and in Google Wallet, side by side, each named for a screen reader, sinking behind the table", async () => {
    const html = await renderEnAsync(<WalletsSection />);

    expect(pictures(html)).toEqual([COPY.wallets.phoneAlts.apple, COPY.wallets.phoneAlts.google]);
    expect(html.match(new RegExp(`--narrow-w:${STEPS_PHONE.narrow}px`, "g"))).toHaveLength(2);
    expectInOrder(html, COPY.wallets.cells.flatMap((cell) => [cell.title, cell.body]));
  });

  test("both phones show the grocer's card on points, not the café the other pages use, with other passes peeking that are not on the page elsewhere", async () => {
    const html = await renderEnAsync(<WalletsSection />);

    expect(html).toContain("/themes/harvest-row/logo.png");
    expect(textOf(html)).toContain(WALLET_SAMPLE.name);
    expect(html).not.toContain("/themes/cafe/");
    expect(logos(html)).toEqual(expect.arrayContaining(WALLET_SAMPLE.others?.map((pass) => pass.design.logo_url ?? "") ?? []));
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

describe("what the site's own components do when this page asks them for more", () => {
  const callers = (name: string, folder: string, file = name) => otherCallers(name, join(ROOT, "components", folder, `${file}.tsx`));

  test("the live feature page's anatomy card is not given the spa's and the boutique's cards", () => {
    const live = callers("AnnotatedWalletCard", "features/design-de-carte");

    expect(live.length).toBeGreaterThan(0);
    for (const { attrs } of live) expect(attrs).not.toMatch(/(?:^|\s)designs(?![\w-])/);
  });

  test("the wallet phones take a sample only from this page's wallets section", () => {
    const source = read(join(ROOT, "components", "landing-pages", "feature-previews", "card-design", "WalletsSection.tsx"));
    const phones = openingTags(source).filter((tag) => tag.name === "WalletPhone" || tag.name === "GoogleWalletPhone");

    expect(phones).toHaveLength(2);
    for (const phone of phones) expect(phone.attrs).toMatch(/\bsample=/);
  });
});

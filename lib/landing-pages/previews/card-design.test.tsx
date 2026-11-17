/**
 * The card design preview (`/us/landing-pages/platform/card-design`): what a
 * visitor sees in each section, from the hero's re-skinning card to the cream
 * card. Every section is rendered under the English catalogs; the headers, the
 * order and the tap targets of all six previews are in `pages.test.tsx`.
 */

import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { AnatomySection } from "@/components/landing-pages/feature-previews/card-design/AnatomySection";
import { IconsSection } from "@/components/landing-pages/feature-previews/card-design/IconsSection";
import { ReskinHero } from "@/components/landing-pages/feature-previews/card-design/ReskinHero";
import { LpFaq } from "@/components/landing-pages/shared/LpFaq";
import { STEPS_PHONE } from "@/components/landing-pages/platform/StepsTable";
import { stampIcons } from "@/components/onboarding/StampIconPicker";
import { availability } from "@/lib/plans/plan-facts";
import { ROOT, openingTags, read } from "../../testing/jsx-source";
import { trackedBy } from "../../testing/cta-recorder";
import { otherCallers } from "../../testing/landing-pages-source";
import { expectInOrder, logos, pictures, renderEn, renderEnAsync, textOf } from "../../testing/render-en";
import { renderPreviewPage, sectionsOf } from "../../testing/preview-page";
import { mockEnglishServerTranslations } from "../../testing/server-intl";
import { landingCopy } from "../copy/bundle";
import { CARD_DESIGN_PREVIEW as COPY } from "../copy/previews/card-design";
import { SHARED } from "../copy/shared";
import { anatomyDesigns, walletSample } from "./card-design-samples";
import { RESKIN_SHOPS, reskinCard } from "./reskin";

// The types section holds the level cards and the wallets section two phones, all async and asking next-intl for their words.
await mockEnglishServerTranslations();
const { WalletsSection } = await import("@/components/landing-pages/feature-previews/card-design/WalletsSection");
const { TypesSection } = await import("@/components/landing-pages/feature-previews/card-design/TypesSection");

/** What /us asks: the international questions with the US ones laid over them. */
const US_FAQ = landingCopy("en", "us").previews.cardDesign.CARD_DESIGN_PREVIEW.faq;
const ANATOMY_DESIGNS = anatomyDesigns(COPY.cardFields);
const WALLET_SAMPLE = walletSample(COPY.cardFields);

const DESIGN_DIR = join(ROOT, "components", "landing-pages", "feature-previews", "card-design");

describe("the page", () => {
  test("asks the six questions of its own FAQ", async () => {
    const page = await renderPreviewPage("platform/card-design");

    expect(US_FAQ.items).toHaveLength(6);
    expectInOrder(page, [US_FAQ.title, ...US_FAQ.items.map((item) => item.question)]);
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
    expect(textOf(page)).not.toMatch(/Parisian|\bOBA\b|Barbiers/i);
    // The points card the anatomy section switches to is not on the page until a visitor asks for it.
    expect(seen.has(ANATOMY_DESIGNS.points.design.logo_url ?? "")).toBe(false);
  });
});

describe("one card, many shops", () => {
  const html = () => renderEn(<ReskinHero />, { us: true });
  const buttons = () => [...html().matchAll(/<button\b([^>]*)>/g)].map((match) => match[1]);

  test("opens on the headline, the sub and the two buttons, then the card, its caption and its controls", () => {
    expectInOrder(html(), [COPY.hero.accent, COPY.hero.sub, SHARED.cta, COPY.hero.secondary, "14 days free", COPY.reskin.captions[0]]);
  });

  test("draws the card of each of the six shops, as one picture named for what it does, and names the first shop in a caption", () => {
    expect(logos(html())).toEqual(expect.arrayContaining(RESKIN_SHOPS.map((id) => reskinCard(id, COPY.cardFields).design.logo_url ?? "")));
    expect(new Set(logos(html())).size).toBe(6);
    expect(pictures(html())).toEqual([COPY.reskin.alt]);
    expect(textOf(html())).toContain("Car wash");
  });

  test("sends the second button to the anatomy of the card, and the trial is the keycap, tracked as the hero's", () => {
    expect(html()).toMatch(/<a [^>]*href="#anatomy"/);
    expect(html()).toMatch(/<a [^>]*class="[^"]*\bkeycap\b[^"]*"[^>]*href="\/en\/onboarding"/);
    expect(trackedBy(html)).toContainEqual({ trackAs: "hero", href: "/onboarding" });
    expect(html()).toContain('data-landing-section="hero"');
  });

  test("has a previous and a next button, each named and 44px to tap", () => {
    const named = buttons().filter((attrs) => attrs.includes(`aria-label="${COPY.reskin.previous}"`) || attrs.includes(`aria-label="${COPY.reskin.next}"`));

    expect(named).toHaveLength(2);
    for (const attrs of named) expect(attrs).toMatch(/\bh-11\b/);
  });

  test("has a dot for each shop, named for the shop and 44px to tap, the first one marked as the card in front", () => {
    const dots = buttons().filter((attrs) => attrs.includes('aria-label="Show the '));

    expect(dots).toHaveLength(6);
    COPY.reskin.captions.forEach((caption, index) => {
      expect(dots[index]).toContain(`aria-label="${COPY.reskin.dot.replace("{shop}", caption)}"`);
      expect(dots[index]).toMatch(/\bh-11\b/);
    });
    expect(dots.filter((attrs) => attrs.includes('aria-current="true"'))).toHaveLength(1);
    expect(dots[0]).toContain('aria-current="true"');
  });

  test("tells a screen reader nothing while the card moves by itself: the caption is a live region that stays off until a visitor chooses", () => {
    const region = /<div aria-live="([a-z]+)"[^>]*>([\s\S]*?)<\/div>/.exec(html());

    expect(region?.[1]).toBe("off");
    expect(textOf(region?.[2] ?? "")).toContain(COPY.reskin.captions[0]);
  });

  test("lets a finger scroll the page up and down over the card while a sideways swipe turns it", () => {
    expect(html()).toMatch(/touch-pan-y|touch-action:\s*pan-y/);
  });
});

describe("every part of the card is yours", () => {
  const html = () => renderEn(<AnatomySection />);

  test("labels a spa's card, not the generic café the live page uses, and its points card is the boutique's", () => {
    expect(logos(html())).toEqual(["/themes/saltmoss/logo.png"]);
    expect(textOf(html())).not.toContain("Parisian");
    expect(ANATOMY_DESIGNS.points.design.logo_url).toBe("/themes/ode/logo.svg");
  });

  test("is the jump target of the hero's second button, and lets a visitor see the points card too", () => {
    expect(html()).toContain('id="anatomy"');
    expect(html()).toMatch(/role="tablist"/);
    expect(textOf(html())).toContain("Points");
  });

  test("names the six parts on a phone with the page's own words: the top right is the count, not the business name", () => {
    const text = textOf(html());

    expectInOrder(html(), COPY.anatomy.mobileLabels);
    expect(COPY.anatomy.mobileLabels[1]).toBe("Count");
    expect(text).not.toMatch(/Business name|Custom fields|Customer QR code/);
  });

  test.each([
    ["stamps", COPY.anatomy.labels, COPY.anatomy.mobileLabels, /count/i],
    ["points", COPY.anatomy.pointsLabels, COPY.anatomy.pointsMobileLabels, /balance/i],
  ])("the %s card has six labels on a laptop and on a phone, and the second is what the top right shows", (_program, desktop, phone, topRight) => {
    expect(desktop).toHaveLength(6);
    expect(phone).toHaveLength(6);
    expect(desktop[1]).toMatch(topRight);
    expect(phone[1]).toMatch(topRight);
    expect(desktop[3]).toBe("Customer's name");
  });
});

describe("stamps, points or levels", () => {
  const html = () => renderEnAsync(<TypesSection />);

  test("opens on the header, then a stamp card, a points card and the levels, each with its title and its line", async () => {
    expectInOrder(await html(), [
      COPY.programs.eyebrow,
      COPY.programs.title,
      COPY.programs.lead,
      ...COPY.programs.cards.flatMap((card) => [card.title, card.line]),
    ]);
  });

  test("shows real cards of three shops that no other section shows: a burger bar's stamps, a gym's points and a dry cleaner's levels", async () => {
    const markup = await html();

    expect(logos(markup)).toEqual(
      expect.arrayContaining(["/themes/smash-club/logo.png", "/themes/forme/logo.svg", "/themes/wrenfold/logo.png"]),
    );
    expect(markup).not.toMatch(/\/themes\/(barber|oba)\//);
    expect(pictures(markup)).toEqual(expect.arrayContaining([...COPY.programs.alts]));
  });

  test("shows the levels card at Bronze, Silver and Gold", async () => {
    expectInOrder(await html(), ["Bronze", "Silver", "Gold"]);
  });

  test("says up to five levels, which every plan has", () => {
    const levels = COPY.programs.cards[2].line;

    expect(levels).toMatch(/^Up to five levels\./);
    expect(availability((facts) => facts.levels === 5)).toBe("every plan");
  });

  test("is the section the registry calls types", async () => {
    expect(await html()).toContain('data-landing-section="types"');
  });
});

describe("use our stamp icons, or upload your own", () => {
  const html = () => renderEn(<IconsSection />);

  test("opens on the header, then three cards each named for what it shows, then the five facts", () => {
    expectInOrder(html(), [COPY.icons.eyebrow, COPY.icons.title, COPY.icons.lead, ...COPY.icons.cards, ...COPY.icons.facts]);
  });

  test("the three cards are three shops: Pulp's own citrus icons, Gelo's own cones and a pet groomer's paws from the library", () => {
    expect(logos(html())).toEqual(["/themes/pulp/logo.svg", "/themes/gelo/logo.svg", "/themes/patoune/logo.svg"]);
    expect(pictures(html())).toEqual(expect.arrayContaining([...COPY.icons.cards]));
  });

  test("says 98 wherever it says how many icons there are, and 98 is the library's own count", () => {
    expect(COPY.icons.lead).toContain(`${stampIcons.length} ready-made icons`);
    expect(COPY.icons.facts[0]).toContain(`${stampIcons.length} ready-made stamp icons`);
    expect(COPY.faq.items.map((item) => item.answer).join(" ")).toContain(`${stampIcons.length} ready-made stamp icons`);
  });
});

describe("iPhone and Android", () => {
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

describe("questions about your card", () => {
  const html = () => renderEn(<LpFaq faq={COPY.faq} />, { us: true });

  test("asks the six questions a shop owner has, collapsed, then points to the contact page", () => {
    expectInOrder(html(), [COPY.faq.title, ...COPY.faq.items.map((item) => item.question), SHARED.faq.contact.link]);
    expect(html()).not.toMatch(/<details[^>]*\bopen\b/);
  });

  test.each([
    ["on the international site", COPY.faq, /stamp card or a points card/, /paper loyalty card/],
    ["on /us", US_FAQ, /punch card or a points card/, /paper punch card/],
  ])("a visitor who asks about a stamp card or a points card %s gets both kinds of card and levels", (_where, faq, question, paper) => {
    const answer = faq.items.find((item) => question.test(item.question))?.answer ?? "";

    expect(answer).toMatch(paper);
    expect(answer).toMatch(/stamp card/);
    expect(answer).toMatch(/points card/);
    expect(answer).toMatch(/levels/);
  });
});

describe("what the site's own components do when this page asks them for more", () => {
  const callers = (name: string, folder: string, file = name) => otherCallers(name, join(ROOT, "components", folder, `${file}.tsx`));

  test("the live feature page's anatomy card is given neither the spa's and the boutique's cards nor this page's labels", () => {
    const live = callers("AnnotatedWalletCard", "features/design-de-carte");

    expect(live.length).toBeGreaterThan(0);
    for (const { attrs } of live) expect(attrs).not.toMatch(/(?:^|\s)(?:designs|labels)(?![\w-])/);
  });

  test("the wallet phones take a sample only from this page's wallets section", () => {
    const source = read(join(DESIGN_DIR, "WalletsSection.tsx"));
    const phones = openingTags(source).filter((tag) => tag.name === "WalletPhone" || tag.name === "GoogleWalletPhone");

    expect(phones).toHaveLength(2);
    for (const phone of phones) expect(phone.attrs).toMatch(/\bsample=/);
  });
});

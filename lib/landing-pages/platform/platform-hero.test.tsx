/**
 * Platform's hero as a visitor meets it: the headline, then the picture of real wallet cards, then the trial.
 * From a laptop the picture is the homepage's fan of seven cards; on a phone it is a Wallet stack with the
 * front card shown whole, which starts still and cycles through its deck once the page is live. Both are in the
 * markup and CSS shows one: there is no script that picks.
 */

import { describe, expect, test } from "bun:test";
import { PlatformHero } from "@/components/landing-pages/platform/hero/PlatformHero";
import { HERO_FAN_SEASON, PLATFORM_FAN_SLOTS, platformFanSlots, resolveFanCard, type FanSeason } from "@/lib/hero-fan";
import { expectInOrder, logos, pictures, renderEnAsync, textOf } from "../../testing/render-en";
import { mockEnglishServerTranslations } from "../../testing/server-intl";
import { renderAsAsync } from "../../testing/visitor-seams";
import { PLATFORM } from "../copy/platform";
import { SHARED } from "../copy/shared";
import { FIRST_PAINT, PHONE_DECK, drawn, phoneDeck, placement } from "./phone-stack";

// The cards ask next-intl for their words.
await mockEnglishServerTranslations();

const hero = () => renderEnAsync(<PlatformHero />);
/** The hero as a season deals it, whichever season the page is set to. */
const heroIn = (season: FanSeason) =>
  renderEnAsync(<PlatformHero slots={platformFanSlots(season)} deck={phoneDeck(season)} />);
const fanLogosIn = (season: FanSeason) =>
  platformFanSlots(season).map((slot) => resolveFanCard(slot.cardId).sample.design.logo_url ?? "");
/** The logos of the cards the stack draws on first paint: the four in view, the front card first. */
const stackLogosIn = (season: FanSeason) => {
  const deck = phoneDeck(season);

  return deck
    .map((card, index) => ({ card, place: placement(index, FIRST_PAINT, deck.length) }))
    .filter(({ place }) => drawn(place, false))
    .sort((a, b) => a.place.slot - b.place.slot)
    .map(({ card }) => card.design.logo_url ?? "");
};

/** The markup of the box whose opening tag carries `marker`, up to the next sibling at the same level. */
function boxWith(html: string, marker: string): string {
  const start = html.lastIndexOf("<div", html.indexOf(marker));
  let depth = 0;

  for (const tag of html.slice(start).matchAll(/<(\/?)div\b[^>]*>/g)) {
    depth += tag[1] ? -1 : 1;
    if (depth === 0) return html.slice(start, start + tag.index + tag[0].length);
  }
  return html.slice(start);
}

describe("the hero reads in order: the headline, the cards, then the trial and the reassurance", () => {
  test("puts the headline first, then the picture, then the trial, the demo link and the reassurance", async () => {
    const html = await hero();

    expect(textOf(html)).toContain(PLATFORM.hero.accent);
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expectInOrder(html, [PLATFORM.hero.accent, SHARED.cta, SHARED.demoLink, "14 days free"]);
    expect(html.indexOf("<h1")).toBeLessThan(html.indexOf("fan-slot"));
    expect(html.indexOf("<h1")).toBeLessThan(html.indexOf('role="img"'));
    expect(html.lastIndexOf("fan-slot")).toBeLessThan(html.indexOf('href="/en/onboarding"'));
    expect(html.indexOf('role="img"')).toBeLessThan(html.indexOf('href="/en/onboarding"'));
  });

  test("is a headline alone over the cards: no label above it and no sub line", async () => {
    const html = await hero();

    expect(html.slice(0, html.indexOf("<h1"))).not.toContain("<p");
    expect(html.slice(html.indexOf("</h1>"), html.indexOf('role="img"'))).not.toContain("<p");
  });

  test("has one trial button as the hero's keycap and one second button to the page's demo, whatever the width", async () => {
    const html = await hero();

    expect(html.match(/href="\/en\/onboarding"/g)).toHaveLength(1);
    expect(html).toMatch(/<a [^>]*class="[^"]*\bkeycap\b[^"]*"[^>]*href="\/en\/onboarding"/);
    expect(html.match(/<a [^>]*href="#demo"/g)).toHaveLength(1);
    expect(html.match(/data-landing-section="hero"/g)).toHaveLength(1);
  });
});

describe("from a laptop: the homepage's fan of seven shops", () => {
  test("in the default season deals Platform's seven cards, Aurevo at the apex", async () => {
    const html = await heroIn("default");
    const fan = fanLogosIn("default");

    expect(html.match(/class="fan-slot\b/g)).toHaveLength(7);
    expect(logos(boxWith(html, 'data-sr="true"')).filter((logo) => fan.includes(logo))).toHaveLength(7);
    expect(new Set(fan).size).toBe(7);
    expect(platformFanSlots("default").find((slot) => slot.index === 0)?.cardId).toBe("aurevo");
  });

  test("at Christmas deals the Christmas cards, Little Santas at the apex", async () => {
    const html = await heroIn("christmas");
    const fan = fanLogosIn("christmas");

    expect(html.match(/class="fan-slot\b/g)).toHaveLength(7);
    expect(logos(boxWith(html, 'data-sr="true"')).filter((logo) => fan.includes(logo))).toHaveLength(7);
    expect(new Set(fan).size).toBe(7);
    expect(platformFanSlots("christmas").find((slot) => slot.index === 0)?.cardId).toBe("christmas-little-santas");
  });

  test("the page deals the season it is set to", async () => {
    const html = await hero();

    expect(PLATFORM_FAN_SLOTS).toEqual(platformFanSlots(HERO_FAN_SEASON));
    expect(logos(boxWith(html, 'data-sr="true"'))).toHaveLength(7);
    expect(logos(boxWith(html, 'data-sr="true"')).filter((logo) => fanLogosIn(HERO_FAN_SEASON).includes(logo))).toHaveLength(7);
  });
});

describe("on a phone: a Wallet stack that starts with the front card whole", () => {
  const stack = async (season: FanSeason = "default") => boxWith(await heroIn(season), 'role="img"');

  test("is one picture to a screen reader, named for what it shows, and is hidden from lg", async () => {
    const html = await hero();

    expect(pictures(html).filter((name) => name === PLATFORM.heroCards.stackAlt)).toHaveLength(1);
    expect(PLATFORM.heroCards.stackAlt.length).toBeGreaterThan(30);
    expect(html).toMatch(/<div class="[^"]*\blg:hidden\b[^"]*"><div role="img"/);
  });

  test("first paint in the default season: Aurevo's card in front with its QR code, and the tops of a points card, a level card and a stamp card behind it", async () => {
    const html = await stack();
    const text = textOf(html);

    expect([...logos(html)].sort()).toEqual([...stackLogosIn("default")].sort());
    expect(stackLogosIn("default")[0]).toMatch(/\/themes\/cafe\//);
    expect(html).toContain("<svg");
    expect(text).toContain("5 / 8");
    expect(text).toContain("Points");
    expect(text).toContain("Silver");
    expect(text).toContain("Stamps");
  });

  test("first paint at Christmas: Little Santas' card in front with its QR code, and the tops of Christmas points and stamp cards behind it", async () => {
    const html = await stack("christmas");
    const text = textOf(html);

    expect([...logos(html)].sort()).toEqual([...stackLogosIn("christmas")].sort());
    expect(stackLogosIn("christmas")[0]).toMatch(/\/themes\/smash-club\//);
    expect(html).toContain("<svg");
    expect(text).toContain("7 / 10");
    expect(text).toContain("Points");
    expect(text).toContain("Stamps");
    expect(text).not.toContain("Silver");
    expect(html).toContain("/themes/christmas/little-santas.webp");
  });

  test("the page runs the deck of the season it is set to", async () => {
    const html = boxWith(await hero(), 'role="img"');

    expect([...logos(html)].sort()).toEqual([...stackLogosIn(HERO_FAN_SEASON)].sort());
    expect(phoneDeck(HERO_FAN_SEASON)).toBe(PHONE_DECK);
  });

  test("nothing has played yet and nothing is added for it: no keyframes, no script, no moment on the front card", async () => {
    const html = await stack();

    expect(html).not.toMatch(/<style|@keyframes|<script/);
    expect(html).not.toMatch(/wst-/);
    expect(textOf(html)).not.toContain("6 / 8");
  });

  test("looks the same to a reader who asks for less motion", async () => {
    expect(await renderAsAsync({ reducedMotion: true }, hero)).toBe(await hero());
  });
});

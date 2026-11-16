/**
 * Platform's hero as a visitor meets it: the headline, then the picture of real wallet cards, then the trial.
 * From a laptop the picture is the homepage's fan of seven cards; on a phone it is a still Wallet stack with the
 * front card shown whole. Both are in the markup and CSS shows one: there is no script that picks.
 */

import { describe, expect, test } from "bun:test";
import { PlatformHero } from "@/components/landing-pages/platform/hero/PlatformHero";
import { PLATFORM_FAN_SLOTS, resolveFanCard } from "@/lib/hero-fan";
import { expectInOrder, logos, pictures, renderEnAsync, textOf } from "../../testing/render-en";
import { mockEnglishServerTranslations } from "../../testing/server-intl";
import { renderAsAsync } from "../../testing/visitor-seams";
import { PLATFORM } from "../copy/platform";
import { SHARED } from "../copy/shared";
import { PHONE_STACK } from "./phone-stack";

// The cards ask next-intl for their words.
await mockEnglishServerTranslations();

const hero = () => renderEnAsync(<PlatformHero />);
const fanLogos = PLATFORM_FAN_SLOTS.map((slot) => resolveFanCard(slot.cardId).sample.design.logo_url ?? "");
/** The stack's logos as the markup holds them: the farthest card first, the front card last. */
const stackLogos = [...[...PHONE_STACK.behind].reverse(), PHONE_STACK.front].map((card) => card.design.logo_url ?? "");

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
  test("deals Platform's seven cards, Aurevo at the apex", async () => {
    const html = await hero();

    expect(html.match(/class="fan-slot\b/g)).toHaveLength(7);
    expect(logos(boxWith(html, 'data-sr="true"')).filter((logo) => fanLogos.includes(logo))).toHaveLength(7);
    expect(new Set(fanLogos).size).toBe(7);
    expect(PLATFORM_FAN_SLOTS.find((slot) => slot.index === 0)?.cardId).toBe("aurevo");
  });
});

describe("on a phone: a still Wallet stack with the front card whole", () => {
  const stack = async () => boxWith(await hero(), 'role="img"');

  test("is one picture to a screen reader, named for what it shows, and is hidden from lg", async () => {
    const html = await hero();

    expect(pictures(html).filter((name) => name === PLATFORM.heroCards.stackAlt)).toHaveLength(1);
    expect(PLATFORM.heroCards.stackAlt.length).toBeGreaterThan(30);
    expect(html).toMatch(/<div class="[^"]*\blg:hidden\b[^"]*"><div role="img"/);
  });

  test("shows Aurevo's card in front with its QR code, and the tops of a points card, a level card and a stamp card behind it", async () => {
    const html = await stack();
    const text = textOf(html);

    expect(logos(html)).toEqual(stackLogos);
    expect(logos(html).at(-1)).toMatch(/\/themes\/cafe\//);
    expect(html).toContain("<svg");
    expect(text).toContain("5 / 8");
    expect(text).toContain("Points");
    expect(text).toContain("Silver");
    expect(text).toContain("Stamps");
  });

  test("the cards draw once: seven in the fan and four in the stack, eleven in all", async () => {
    expect(logos(await hero())).toHaveLength(7 + 4);
  });

  test("never moves: no keyframes and no script in the stack", async () => {
    expect(await stack()).not.toMatch(/<style|@keyframes|<script/);
  });

  test("looks the same to a reader who asks for less motion", async () => {
    expect(await renderAsAsync({ reducedMotion: true }, hero)).toBe(await hero());
  });
});

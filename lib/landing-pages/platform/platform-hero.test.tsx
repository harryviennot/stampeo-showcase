/**
 * Platform's hero as a visitor meets it: the headline, a stack of real wallet cards (stamps, points and
 * levels) like a phone's Wallet, then the trial. `?hero=shelf` swaps the stack for a straight row of nine,
 * for comparing the two. What the cards do over time is in `wallet-stack.test.ts`.
 */

import { describe, expect, test } from "bun:test";
import { WalletShelfHero } from "@/components/landing-pages/platform/hero/WalletShelfHero";
import { WalletStackHero } from "@/components/landing-pages/platform/hero/WalletStackHero";
import { HeroVariantSwitch, heroFromSearch } from "@/components/landing-pages/platform/hero/HeroVariantSwitch";
import { PLATFORM } from "../copy/platform";
import { SHARED } from "../copy/shared";
import { PROGRAM_TYPES } from "../copy/program-types";
import { code, findTag, openingTags, read } from "../../testing/jsx-source";
import { COMPONENTS_DIR } from "../../testing/landing-pages-source";
import { expectInOrder, pictures, renderEn, textOf } from "../../testing/render-en";
import { join } from "node:path";
import { SHELF_CARDS } from "./wallet-shelf";
import { STACK_CARDS } from "./wallet-stack";

const HERO_DIR = join(COMPONENTS_DIR, "platform", "hero");
const stack = () => renderEn(<WalletStackHero />, { us: true });
const shelf = () => renderEn(<WalletShelfHero />, { us: true });
/** The shops' logos in a render, one per card. */
const logos = (html: string) => [...html.matchAll(/<img[^>]*\bsrc="(\/themes\/[a-z-]+\/logo\.[a-z]+)"/g)].map((match) => match[1]);

describe("the stack hero", () => {
  test("puts the headline first, then the cards, then the trial and the reassurance", () => {
    const html = stack();
    const order = ["<h1", 'role="img"', 'href="/en/onboarding"', "14 days free"].map((needle) => html.indexOf(needle));

    expect(order.every((at) => at > -1)).toBe(true);
    expect(order).toEqual([...order].sort((a, b) => a - b));
    expect(textOf(html)).toContain(PLATFORM.hero.accent);
  });

  test("is a headline alone over the cards: no label above it and no sub line", () => {
    const html = stack();

    expect(html.slice(0, html.indexOf("<h1"))).not.toContain("<p");
    expect(html.slice(html.indexOf("</h1>"), html.indexOf('role="img"'))).not.toContain("<p");
  });

  test("is one picture to a screen reader, named for what it shows, not nine loose cards", () => {
    expect(pictures(stack()).filter((name) => /wallet/i.test(name))).toHaveLength(1);
    expect(pictures(stack())[0].length).toBeGreaterThan(30);
  });

  test("draws nine cards from nine different shops, the bubble tea shop and the barbershop not among them", () => {
    const html = stack();

    expect(logos(html)).toHaveLength(9);
    expect(new Set(logos(html)).size).toBe(9);
    expect(logos(html).join(" ")).not.toMatch(/\/themes\/(oba|barber)\//);
  });

  test("shows stamps, points and a level in the first screen: the count of stamps, a points balance and a level's name", () => {
    const text = textOf(stack());

    expect(text).toContain("5 / 8");
    expect(text).toContain("Points");
    expect(text).toContain("Silver");
  });

  test("keeps the trial as the hero's tracked keycap and the second button on the page's demo", () => {
    const html = stack();

    expect(html).toMatch(/<a [^>]*href="\/en\/onboarding"/);
    expect(html).toMatch(/<a [^>]*href="#demo"/);
    expectInOrder(html, [SHARED.cta, SHARED.demoLink]);
    expect(findTag(code(join(HERO_DIR, "WalletStackHero.tsx")), "LpCtaPair")?.attrs).toContain('location="hero"');
  });
});

describe("the shelf hero", () => {
  test("puts the headline first, then nine cards in a row, then the trial and the reassurance", () => {
    const html = shelf();
    const order = ["<h1", 'role="img"', 'href="/en/onboarding"', "14 days free"].map((needle) => html.indexOf(needle));

    expect(order.every((at) => at > -1)).toBe(true);
    expect(order).toEqual([...order].sort((a, b) => a - b));
    expect(logos(html)).toHaveLength(9);
  });

  test("names its three groups under the row: stamps, points and levels, the words the program types use", () => {
    const text = textOf(shelf());
    const [stamps, points, levels] = PROGRAM_TYPES.map((type) => type.label);

    expectInOrder(shelf(), [stamps, points, levels]);
    expect(text).toContain("Bronze");
    expect(text).toContain("Silver");
    expect(text).toContain("Gold");
  });

  test("keeps five cards on a phone and hides the other four, in the order stamps, points, Silver, stamps, Gold", () => {
    const html = shelf();
    const hidden = html.match(/max-lg:hidden/g) ?? [];

    expect(hidden.length).toBeGreaterThanOrEqual(4);
    expect(html.match(/max-lg:order-\d/g)).toHaveLength(5);
  });
});

describe("?hero= picks one of them", () => {
  test("the stack is the default, and so is anything that is not the shelf", () => {
    expect(heroFromSearch("")).toBe("stack");
    expect(heroFromSearch("?hero=confetti")).toBe("stack");
    expect(heroFromSearch("?menu=drill")).toBe("stack");
  });

  test("?hero=shelf asks for the shelf, in any case", () => {
    expect(heroFromSearch("?hero=shelf")).toBe("shelf");
    expect(heroFromSearch("?utm_source=ads&hero=SHELF")).toBe("shelf");
  });

  test("a page the server renders has the stack in it, so the first paint never waits for the query string", () => {
    const html = renderEn(<HeroVariantSwitch stack={<i>the stack</i>} shelf={<i>the shelf</i>} />);

    expect(html).toContain("the stack");
    expect(html).not.toContain("the shelf");
  });

  test("Platform's hero is the switch, and the page mounts it with no props", () => {
    const hero = code(join(HERO_DIR, "PlatformHero.tsx"));

    expect(openingTags(hero).map((tag) => tag.name)).toEqual(expect.arrayContaining(["HeroVariantSwitch", "WalletStackHero", "WalletShelfHero"]));
    expect(read(join(HERO_DIR, "HeroVariantSwitch.tsx"))).toMatch(/useSyncExternalStore/);
  });
});

describe("the two heroes use the same cards the page's data names", () => {
  test("the stack's nine are STACK_CARDS and the shelf's nine are SHELF_CARDS", () => {
    expect(logos(stack())).toEqual(expect.arrayContaining(STACK_CARDS.map((card) => card.design.logo_url ?? "")));
    expect(logos(shelf())).toEqual(expect.arrayContaining(SHELF_CARDS.map((card) => card.design.logo_url ?? "")));
  });
});

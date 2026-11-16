/**
 * Platform's hero as a visitor meets it: the headline, a stack of real wallet cards (stamps, points and
 * levels) like a phone's Wallet, then the trial. What the cards do over time is in `wallet-stack.test.ts`.
 */

import { describe, expect, test } from "bun:test";
import { WalletStackHero } from "@/components/landing-pages/platform/hero/WalletStackHero";
import { PlatformHero } from "@/components/landing-pages/platform/hero/PlatformHero";
import { PLATFORM } from "../copy/platform";
import { SHARED } from "../copy/shared";
import { expectInOrder, logos, pictures, renderEn, textOf } from "../../testing/render-en";
import { renderAs } from "../../testing/visitor-seams";
import { STACK_CARDS } from "./wallet-stack";

const stack = () => renderEn(<WalletStackHero />, { us: true });

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

  test("shows stamps, points and a level in the first screen: the five cards a phone shows, not the four it hides", () => {
    const shown = stack().split('class="wst-land"').slice(1, 6);
    const text = textOf(shown.join(""));

    expect(shown).toHaveLength(5);
    expect(text).toContain("5 / 8");
    expect(text).toContain("Points");
    expect(text).toContain("Silver");
  });

  test("keeps the trial as the hero's keycap and the second button on the page's demo", () => {
    const html = stack();

    expect(html).toMatch(/<a [^>]*class="[^"]*\bkeycap\b[^"]*"[^>]*href="\/en\/onboarding"/);
    expect(html).toMatch(/<a [^>]*href="#demo"/);
    expectInOrder(html, [SHARED.cta, SHARED.demoLink]);
  });
});

describe("a reader who asks for less motion (AC11)", () => {
  const still = () => renderAs({ reducedMotion: true }, stack);
  const KEYFRAMES_OFF = /@media \(prefers-reduced-motion: reduce\)\s*\{[^}]*animation: none/;

  test("the stack is drawn still and complete: nine cards, Aurevo in front at its sixth stamp, none pressing or leaving", () => {
    const html = still();

    expect(logos(html)).toHaveLength(9);
    expect(textOf(html)).toContain("6 / 8");
    expect(textOf(html)).not.toContain("5 / 8");
    expect(html).not.toContain('class="wst-press"');
    expect(html).not.toMatch(/duration-300 opacity-0/);
  });

  test("the stack's own keyframes switch every animation off under prefers-reduced-motion, so nothing plays whatever the setting reads", () => {
    expect(stack()).toMatch(KEYFRAMES_OFF);
  });
});

describe("Platform's hero section", () => {
  test("is one section that holds the stack", () => {
    const html = renderEn(<PlatformHero />, { us: true });

    expect(html.match(/data-landing-section="hero"/g)).toHaveLength(1);
    expect(html).toContain('data-href="wallet-stack"');
  });

  test("shows the cards the page's data names: the stack's nine are STACK_CARDS", () => {
    expect(logos(stack())).toEqual(expect.arrayContaining(STACK_CARDS.map((card) => card.design.logo_url ?? "")));
  });
});

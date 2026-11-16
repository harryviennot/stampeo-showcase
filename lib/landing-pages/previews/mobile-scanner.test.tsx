/**
 * The scanner preview (`/us/landing-pages/platform/mobile-scanner`): what a
 * visitor sees in each section below the hero. Every section is rendered under
 * the English catalogs, async pieces included; the hero, the headers, the order
 * and the tap targets of all six previews are in `pages.test.tsx`, and the
 * counter's and the team code's own logic is in `scanner-interactions.test.ts`.
 */

import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { CounterSection } from "@/components/landing-pages/feature-previews/mobile-scanner/CounterSection";
import { TeamStrip } from "@/components/landing-pages/feature-previews/mobile-scanner/TeamStrip";
import { WaysSection } from "@/components/landing-pages/feature-previews/mobile-scanner/WaysSection";
import { COMPONENTS_DIR } from "../../testing/landing-pages-source";
import { expectInOrder, pictures, renderEnAsync as render, textOf } from "../../testing/render-en";
import { mockEnglishServerTranslations } from "../../testing/server-intl";
import { smallestLabelPx } from "../../testing/stacked-rows";
import { renderAsAsync } from "../../testing/visitor-seams";
import { MOBILE_SCANNER_PREVIEW as COPY } from "../copy/previews/mobile-scanner";
import { SHARED } from "../copy/shared";
import { COUNTER_KEYS } from "./scanner-counter";
import { TEAM_CODE } from "./team-code";

// The sections hold async server components (the wallet cards) that ask next-intl for their labels.
await mockEnglishServerTranslations();

const FOLDER = join(COMPONENTS_DIR, "feature-previews", "mobile-scanner");

/** The attributes of the tags that carry `marker`, in document order. */
const tagsWith = (html: string, marker: RegExp) => [...html.matchAll(/<[a-z]+\b[^>]*>/g)].map(([tag]) => tag).filter((tag) => marker.test(tag));

describe("counter: one phone and one wallet card that follow four buttons", () => {
  const buttons = (html: string) => tagsWith(html, /role="tab"/);

  test("the four buttons are tabs in the copy's order: Stamps, Points, Reward, Level, each with its line, Stamps selected first", async () => {
    const html = await render(<CounterSection />);

    expect(html).toMatch(/role="tablist"[^>]*aria-label="[^"]+"/);
    expect(buttons(html).map((tag) => /aria-selected="(true|false)"/.exec(tag)?.[1])).toEqual(["true", "false", "false", "false"]);
    expectInOrder(html, COPY.counter.options.flatMap((option) => [option.title, option.line]));
    expect(COUNTER_KEYS).toHaveLength(COPY.counter.options.length);
  });

  test("each button is a 56px tile to tap, reachable by Tab as one stop and by the arrow keys from there", async () => {
    const tabs = buttons(await render(<CounterSection />));

    for (const tag of tabs) expect(tag).toContain("min-h-14");
    expect(tabs.map((tag) => /tabindex="(-?\d)"/.exec(tag)?.[1])).toEqual(["0", "-1", "-1", "-1"]);
  });

  test("the phone and the card show the selected button's screen only; the others are in the page but out of reach", async () => {
    const html = await render(<CounterSection />);
    const exposed = (attribute: string) => tagsWith(html, new RegExp(`${attribute}="[a-z]+"`)).map((tag) => !/\binert\b/.test(tag));

    expect(exposed("data-screen")).toEqual([true, false, false, false]);
    expect(exposed("data-card")).toEqual([true, false, false, false]);
  });

  test("the phone is the Scanner app's own screens, one per button, in the app's English", async () => {
    const text = textOf(await render(<CounterSection />));

    expectInOrder(text, ["+3 stamps", "This completes the card", "Add 3 stamps"]);
    expectInOrder(text, ["12.50", "≈ +12 pts", "Add Points"]);
    expectInOrder(text, ["Rewards to redeem", "Free coffee", "Redeem", "Free pastry", "Gift", "Redeem"]);
    expectInOrder(text, ["Silver perks:", "Apply them at the till before charging."]);
    expect(text.match(/Redeem\|/g)).toHaveLength(3);
  });

  test("beside the phone is Sophie's wallet card with what the scan did: stamps 5 to 8, points 240 to 252, the reward claimed, the level", async () => {
    const html = await render(<CounterSection />);
    const text = textOf(html);

    expectInOrder(text, ["5 → 8 stamps", "240 → 252 pts", "Free coffee redeemed", "Level: Silver"]);
    expect(pictures(html).filter((name) => /wallet/.test(name))).toEqual([
      expect.stringMatching(/Aurevo.*full at 8 of 8 stamps/),
      expect.stringMatching(/Marginalia.*252 points/),
      expect.stringMatching(/Aurevo.*2 of 8 stamps/),
      expect.stringMatching(/Wrenfold.*Silver/),
    ]);
  });

  test("it ends on the one line the old How section said: tap once and the card updates", async () => {
    const text = textOf(await render(<CounterSection />));

    expect(text).toContain(COPY.counter.fact);
    expect(text.split(COPY.counter.fact)).toHaveLength(2);
  });

  test("nothing is framed in ink but the buttons: no stamped frame around the phone or a card, and no plan chip", async () => {
    const html = await render(<CounterSection />);
    const framed = [...tagsWith(html, /data-screen=/), ...tagsWith(html, /data-card=/)].filter((tag) => /card-stamp/.test(tag));

    expect(framed).toEqual([]);
    expect(textOf(html)).not.toMatch(/Every plan|Growth and Pro/);
  });

  test("every screen and card has a name a screen reader can read", async () => {
    const html = await render(<CounterSection />);
    const named = [...tagsWith(html, /data-screen=/), ...tagsWith(html, /data-card=/)];

    expect(named).toHaveLength(COUNTER_KEYS.length * 2);
    for (const tag of named) expect(tag).toMatch(/role="img"[^>]*aria-label="[^"]{12,}"|aria-label="[^"]{12,}"[^>]*role="img"/);
  });

  test("for a reader who asks for less motion every pane is still there and none fades: a calm, complete picture", async () => {
    const calm = await renderAsAsync({ reducedMotion: true }, () => render(<CounterSection />));
    const moving = await render(<CounterSection />);

    expect(moving).toMatch(/duration-\[250ms\]/);
    expect(calm).not.toMatch(/duration-\[250ms\]/);
    expect(calm.match(/data-screen=/g)).toHaveLength(COUNTER_KEYS.length);
  });

  test("the smallest label the app screens print is 11px", () => {
    expect(smallestLabelPx(join(FOLDER, "CounterScreens.tsx"))).toBeGreaterThanOrEqual(11);
  });
});

describe("ways: an app or a browser, two cells and the same two actions as the hero", () => {
  test("it is Platform's table with no phones: two cells, each led by an icon in the site's orange tile", async () => {
    const html = await render(<WaysSection />);

    expectInOrder(html, COPY.ways.cells.flatMap((cell) => [cell.title, cell.body]));
    expect(html.match(/<li\b/g)).toHaveLength(2);
    expect(html.match(/<li\b[\s\S]*?<\/li>/g)?.every((cell) => cell.includes("<svg") && cell.includes("bg-[var(--accent)]/10"))).toBe(true);
    expect(html).toContain("lg:grid-cols-2");
    expect(textOf(html)).toContain("scan.stampeo.app");
  });

  test("the store badges are not here: the stores are named in words, because a business cannot be created in the app", async () => {
    const html = await render(<WaysSection />);

    expect(html).not.toMatch(/Add to (?:Apple|Google) Wallet|app-store|google-play|<img/i);
    expect(textOf(html)).toContain("App Store and Google Play");
  });

  test("the trial button and the way to the demo follow", async () => {
    const html = await render(<WaysSection />);

    expect(textOf(html)).toContain(SHARED.cta);
    expect(html).toMatch(/<a [^>]*href="#demo"/);
    expect(textOf(html)).toContain(SHARED.demoLink);
  });
});

describe("team: from a code to the counter, three frames on a rail", () => {
  const frames = (html: string) => html.match(/<li\b[^>]*data-frame="\d"[\s\S]*?<\/li>/g) ?? [];

  test("the three frames come in order, each under its caption, joined by a dashed rail: across from lg, and a stretch between each two down the side of a phone", async () => {
    const html = await render(<TeamStrip />);

    expect(frames(html)).toHaveLength(3);
    expectInOrder(html, COPY.team.frames);
    expect(html.match(/border-dashed/g)).toHaveLength(1 + (frames(html).length - 1));
    expect(html).toMatch(/<ol\b/);
  });

  test("the owner's Team page gives out the code, in groups of three as the dashboard prints it, with a copy button", async () => {
    const [owner] = frames(await render(<TeamStrip />));
    const grouped = `${TEAM_CODE.slice(0, 3)}-${TEAM_CODE.slice(3)}`;

    expect(textOf(owner)).toContain("Give this code to");
    expect(textOf(owner)).toContain(grouped);
    expect(pictures(owner).join(" ")).toMatch(/Team page.*Copy button/i);
    expect(owner).not.toMatch(/<button\b/);
  });

  test("the staff phone asks for the team code and has it entered, six characters, with Find my shop under it", async () => {
    const [, staff] = frames(await render(<TeamStrip />));
    const text = textOf(staff);

    expect(text).toContain("Enter your team code");
    expect(text).toContain([...TEAM_CODE].map((char) => `|${char}`).join("").slice(1));
    expect(text).toContain("Find my shop");
    expect(pictures(staff).join(" ")).toMatch(/team code/i);
  });

  test("then the scanner is ready: the camera, pointed at a card, as the app says it", async () => {
    const [, , ready] = frames(await render(<TeamStrip />));

    expect(textOf(ready)).toContain("Point camera at the customer loyalty card QR code");
    expect(pictures(ready).join(" ")).toMatch(/Scanner.*ready/i);
  });

  test("below are three facts; the two that need Growth or Pro say so, the one every plan has does not", async () => {
    const html = await render(<TeamStrip />);

    expectInOrder(html, COPY.team.facts.map((fact) => fact.text));
    expect(textOf(html).match(/Growth and Pro/g)).toHaveLength(2);
  });

  test("the staff-data guardrails hold: nothing here ranks, times or tracks a team member", async () => {
    expect(textOf(await render(<TeamStrip />))).not.toMatch(/\b(?:ranking|rankings|leaderboard|top scanner|idle|pace|speed|GPS|biometric|per hour)\b/i);
  });
});

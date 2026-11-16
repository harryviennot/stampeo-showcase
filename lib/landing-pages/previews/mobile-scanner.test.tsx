/**
 * The scanner preview (`/us/landing-pages/platform/mobile-scanner`): what a visitor sees in the hero and in
 * each section. Every section is rendered under the English catalogs, async pieces included; the headers, the
 * order and the tap targets of all six previews are in `pages.test.tsx`, and the counter's own logic is in
 * `scanner-interactions.test.ts`.
 */

import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { CounterSection } from "@/components/landing-pages/feature-previews/mobile-scanner/CounterSection";
import { WaysSection } from "@/components/landing-pages/feature-previews/mobile-scanner/WaysSection";
import { scannerLoopFiles } from "@/lib/videos/scanner-loop";
import { COMPONENTS_DIR } from "../../testing/landing-pages-source";
import { tapTargets, renderPreviewPage, sectionOf } from "../../testing/preview-page";
import { expectInOrder, pictures, renderEnAsync as render, textOf } from "../../testing/render-en";
import { mockEnglishServerTranslations } from "../../testing/server-intl";
import { smallestLabelPx } from "../../testing/stacked-rows";
import { renderAsAsync } from "../../testing/visitor-seams";
import { MOBILE_SCANNER_PREVIEW as COPY } from "../copy/previews/mobile-scanner";
import { SHARED } from "../copy/shared";
import { COUNTER_KEYS } from "./scanner-counter";

// The sections hold async server components (the wallet cards) that ask next-intl for their labels.
await mockEnglishServerTranslations();

const FOLDER = join(COMPONENTS_DIR, "feature-previews", "mobile-scanner");

/** The attributes of the tags that carry `marker`, in document order. */
const tagsWith = (html: string, marker: RegExp) => [...html.matchAll(/<[a-z]+\b[^>]*>/g)].map(([tag]) => tag).filter((tag) => marker.test(tag));

describe("hero: the words say the choice, the picture shows both ways at once", () => {
  const hero = () => sectionOf("platform/mobile-scanner", "hero");

  test("the headline says what it is in the page's search words, then the sub, the trial and the way to the counter", async () => {
    const html = await hero();

    expect(COPY.hero.h1).toMatch(/loyalty card scanner app/i);
    expectInOrder(html, [COPY.hero.accent, COPY.hero.sub, SHARED.cta, COPY.hero.secondary]);
    expect([...html.matchAll(/<a [^>]*href="([^"]+)"/g)].map((link) => link[1])).toEqual(["/en/onboarding", "#counter"]);
  });

  test("one picture, named for a screen reader, holds the Scanner app on a phone and the web scanner in a browser", async () => {
    const html = await hero();

    expect(pictures(html)).toContain(COPY.hero.alt);
    expect(textOf(html)).toContain("scan.stampeo.app");
  });

  test("the phone plays the real Scanner loop from the first paint", async () => {
    expect(await hero()).toContain(scannerLoopFiles("en").first);
  });

  test("the way to the counter lands on a section that is on the page", async () => {
    const html = await renderPreviewPage("platform/mobile-scanner");

    expect(html).toContain('id="counter"');
  });
});

describe("counter: one phone and one wallet card that follow four buttons", () => {
  const buttons = (html: string) => tagsWith(html, /role="tab"/);

  test("the four buttons are tabs in the copy's order: Stamps, Points, Rewards, Levels, each with its line, Stamps selected first", async () => {
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

  test("it ends on the one line that says what the customer gets: a notification right after", async () => {
    const text = textOf(await render(<CounterSection />));

    expect(text).toContain(COPY.counter.fact);
    expect(text.split(COPY.counter.fact)).toHaveLength(2);
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

describe("ways: the app or a browser, side by side, with the stores where the app is", () => {
  const cell = (html: string, index: number) => html.match(/<li\b[\s\S]*?<\/li>/g)?.[index] ?? "";

  test("two cells in the copy's order: each its title, what it is and the devices it runs on, then the line that says both do the same job", async () => {
    const html = await render(<WaysSection />);

    expect(html.match(/<li\b/g)).toHaveLength(2);
    expectInOrder(html, [
      ...COPY.ways.cells.flatMap((cell) => [cell.title, cell.body, ...cell.devices]),
      COPY.ways.fact,
    ]);
    expect(textOf(html)).toContain("scan.stampeo.app");
  });

  test("the App Store and Google Play badges are links to the app's listings, in the app's cell only", async () => {
    const html = await render(<WaysSection />);
    const stores = tapTargets(html).filter(({ attrs }) => /apps\.apple\.com|play\.google\.com/.test(attrs));

    expect(stores.map(({ attrs }) => /href="([^"]+)"/.exec(attrs)?.[1])).toEqual([
      expect.stringContaining("apps.apple.com"),
      expect.stringContaining("play.google.com"),
    ]);
    expect(stores.map(({ name }) => name)).toEqual([expect.stringMatching(/App Store/), expect.stringMatching(/Google Play/)]);
    expect(cell(html, 0)).toContain("apps.apple.com");
    expect(cell(html, 1)).not.toMatch(/apps\.apple\.com|play\.google\.com|<img/);
  });

  test("each badge is 44px or more to tap and opens the listing in a new tab", async () => {
    const stores = tapTargets(await render(<WaysSection />)).filter(({ attrs }) => /apps\.apple\.com|play\.google\.com/.test(attrs));

    for (const { attrs } of stores) {
      expect(attrs).toMatch(/\bh-1[1-9]\b|min-h-1[1-9]/);
      expect(attrs).toContain('target="_blank"');
      expect(attrs).toContain("noopener");
    }
  });
});

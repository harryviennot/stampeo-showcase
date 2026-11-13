/**
 * The scanner preview (`/us/landing-pages/platform/mobile-scanner`): what a
 * visitor sees in each section below the hero. Every section is rendered under
 * the English catalogs, async pieces included; the hero, the headers, the order
 * and the tap targets of all five previews are in `pages.test.tsx`.
 */

import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { MINI } from "@/components/landing-pages/feature-previews/MiniFrame";
import { PointsMini, RewardsMini, StampsMini } from "@/components/landing-pages/feature-previews/mobile-scanner/CounterMinis";
import { CounterSection } from "@/components/landing-pages/feature-previews/mobile-scanner/CounterSection";
import { HowSection } from "@/components/landing-pages/feature-previews/mobile-scanner/HowSection";
import { JoinCodeMini, LimitMini } from "@/components/landing-pages/feature-previews/mobile-scanner/TeamMinis";
import { TeamSection } from "@/components/landing-pages/feature-previews/mobile-scanner/TeamSection";
import { WaysSection } from "@/components/landing-pages/feature-previews/mobile-scanner/WaysSection";
import { SCANNER_LOOP, scannerLoopFiles } from "@/lib/videos/scanner-loop";
import { COMPONENTS_DIR } from "../../testing/landing-pages-source";
import { expectInOrder, pictures, renderEnAsync as render, textOf } from "../../testing/render-en";
import { mockEnglishServerTranslations } from "../../testing/server-intl";
import { smallestLabelPx, stackZooms } from "../../testing/stacked-rows";
import { MOBILE_SCANNER_PREVIEW as COPY } from "../copy/previews/mobile-scanner";
import { SHARED } from "../copy/shared";

// The sections hold async server components (the level cards, the wallet card) that ask next-intl for their labels.
await mockEnglishServerTranslations();

/** The characters a team code can hold: the Scanner app's `JOIN_CODE_ALPHABET`, with no 0, O, 1, I, L or U to misread. */
const TEAM_CODE_ALPHABET = "ABCDEFGHJKMNPQRSTVWXYZ23456789";

const FOLDER = join(COMPONENTS_DIR, "feature-previews", "mobile-scanner");

describe("how: the customer's card beside the Scanner's finished stamp, then Scan, Check, Confirm", () => {
  test("a visitor reads the three steps in order", async () => {
    expectInOrder(await render(<HowSection />), COPY.how.cells.flatMap((cell) => [cell.title, cell.body]));
  });

  test("the two phones are Sophie's Aurevo card at the stamps the video ends on, and that video's finished frame (no second video)", async () => {
    const html = await render(<HowSection />);

    expect(textOf(html)).toContain("Sophie");
    expect(textOf(html)).toContain(`${SCANNER_LOOP.stamps} / 8`);
    expect(SCANNER_LOOP.stamps).toBe(5);
    expect(html).toContain(encodeURIComponent(scannerLoopFiles("en").still).replaceAll("%2F", "/"));
    expect(html).not.toContain("<video");
    expect(pictures(html).length).toBeGreaterThanOrEqual(1);
  });

  test("the link under the table scrolls to the demo, 44px tall to tap", async () => {
    const html = await render(<HowSection />);
    const link = html.match(/<a [^>]*href="#demo"[^>]*>/)?.[0] ?? "";

    expect(link).toContain("min-h-11");
    expect(textOf(html)).toContain(COPY.how.link);
  });
});

describe("counter: Stamps, Points, Rewards, Levels, each with the app's own screen", () => {
  test("the four rows are the copy's, in order", async () => {
    expectInOrder(await render(<CounterSection />), COPY.counter.rows.flatMap((row) => [row.eyebrow, row.title, row.body]));
  });

  test("every row is open on the server, none carries a plan chip, and each has a picture of its own", async () => {
    const html = await render(<CounterSection />);
    const rows = html.match(/<li\b[^>]*data-key="[a-z]+"[\s\S]*?<\/li>/g) ?? [];

    expect(html.match(/data-open="true"/g)).toHaveLength(4);
    expect(html).not.toContain('data-open="false"');
    expect(textOf(html)).not.toMatch(/Growth and Pro/);
    expect(rows).toHaveLength(COPY.counter.rows.length);
    for (const row of rows) expect(row).toMatch(/role="img"|<img/);
  });

  // The three drawn screens are held to 11px. The levels row is the level cards, wallet passes drawn at the size
  // Platform's program rows give them: their small captions are pass artwork, which no visitor has to read.
  test("on a phone every screen goes under its words, printed large enough that its smallest label is 11px", async () => {
    const zooms = stackZooms(await render(<CounterSection />));
    const smallest = smallestLabelPx(join(FOLDER, "CounterMinis.tsx"));

    expect(zooms).toHaveLength(COPY.counter.rows.length);
    for (const zoom of zooms) expect(smallest * zoom * (MINI.narrowTo / MINI.width)).toBeGreaterThanOrEqual(11);
  });

  test("the levels row shows the three level cards the other pages show", async () => {
    expect(pictures(await render(<CounterSection />))).toContain(SHARED.levelCardsAlt);
  });

  test("the stamps screen: a stepper set to 3 and the Add 3 stamps button, for Sophie", async () => {
    const html = await render(<StampsMini />);

    expect(pictures(html)).toEqual([expect.stringMatching(/three stamps/i)]);
    expectInOrder(html, ["Sophie", "|3|", "+3 stamps", "Add 3 stamps"]);
  });

  test("the points screen: what they spent and the points it earns before the manager confirms", async () => {
    const html = await render(<PointsMini />);
    const text = textOf(html);

    expect(pictures(html)).toEqual([expect.stringMatching(/spend amount/i)]);
    expect(text).toContain("12.50");
    expect(text).toContain("≈ +12 pts");
    for (const key of "0123456789") expect(text).toContain(`|${key}|`);
  });

  test("the rewards screen: the list is headed Rewards to redeem and each of its three rewards has a Redeem button, one of them a gift", async () => {
    const html = await render(<RewardsMini />);
    const text = textOf(html);

    expect(pictures(html)).toEqual([expect.stringMatching(/rewards to redeem/i)]);
    expect(text).toContain("Rewards to redeem");
    expect(text.match(/Redeem/g)).toHaveLength(3);
    expect(text).toContain("Gift");
    expect(text).toMatch(/Expires (?:today|in \d+ days)/);
  });
});

describe("ways: an app or a browser, two cells and the same two actions as the hero", () => {
  test("it is Platform's table with no phones: two cells, each led by an icon", async () => {
    const html = await render(<WaysSection />);

    expectInOrder(html, COPY.ways.cells.flatMap((cell) => [cell.title, cell.body]));
    expect(html.match(/<li\b/g)).toHaveLength(2);
    expect(html.match(/<li\b[\s\S]*?<\/li>/g)?.every((cell) => cell.includes("<svg"))).toBe(true);
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

describe("team: free for the whole team, staff on one tab and owners on the other", () => {
  test("a toggle with the two tabs, Staff open first", async () => {
    const html = await render(<TeamSection />);
    const panes = [...html.matchAll(/<div role="tabpanel" aria-label="([^"]+)"([^>]*)>/g)];

    expect(html).toMatch(/role="tablist"[^>]*aria-label="[^"]+"/);
    expect(html).toMatch(/role="tab"[^>]*aria-selected="true"[^>]*>Staff</);
    expect(panes.map((pane) => pane[1])).toEqual([COPY.team.tabs.staff.label, COPY.team.tabs.owners.label]);
    expect([/\binert\b/.test(panes[0][2]), /\binert\b/.test(panes[1][2])]).toEqual([false, true]);
  });

  test("each pane has its title and facts, and the two Growth and Pro facts carry their chip", async () => {
    const html = await render(<TeamSection />);

    for (const tab of Object.values(COPY.team.tabs)) expectInOrder(html, [tab.title, ...tab.facts.map((fact) => fact.text)]);
    expect(textOf(html).match(/Growth and Pro/g)).toHaveLength(2);
  });

  test("staff see the team code screen, as the app draws it: six characters, then Find my shop", async () => {
    const html = await render(<JoinCodeMini />);
    const text = textOf(html);
    const chars = (/\|([A-Z2-9])\|([A-Z2-9])\|([A-Z2-9])\|([A-Z2-9])\|([A-Z2-9])\|([A-Z2-9])\|/.exec(text) ?? []).slice(1);

    expect(pictures(html).join(" ")).toMatch(/team code/i);
    expect(text).toContain("Enter your team code");
    expect(text).toContain("Find my shop");
    expect(chars).toHaveLength(6);
    for (const char of chars) expect(TEAM_CODE_ALPHABET).toContain(char);
  });

  test("an owner sees a daily limit reached, with Add anyway to let the scan through and the way out", async () => {
    const html = await render(<LimitMini />);
    const text = textOf(html);

    expect(pictures(html).join(" ")).toMatch(/daily limit/i);
    for (const label of ["Daily limit reached", "Add anyway", "Scan next customer", "You can let this one through."]) {
      expect(text).toContain(label);
    }
  });

  test("the staff-data guardrails hold: nothing here ranks, times or tracks a team member", async () => {
    expect(textOf(await render(<TeamSection />))).not.toMatch(/\b(?:ranking|rankings|leaderboard|top scanner|idle|pace|speed|GPS|biometric|per hour)\b/i);
  });
});

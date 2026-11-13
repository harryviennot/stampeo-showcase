/**
 * The scanner preview (`/us/landing-pages/platform/mobile-scanner`): what a
 * visitor sees in each section below the hero (the hero and the sibling links
 * are pinned in `kit.test.tsx` and `registry.test.ts`). Sections are rendered
 * under the English catalogs, async pieces included, and read as source only
 * for what a render cannot show: which component a tag is, and the literals
 * the registry guards need.
 */

import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { renderToReadableStream } from "react-dom/server";
import { CounterSection } from "@/components/landing-pages/feature-previews/mobile-scanner/CounterSection";
import { MINI } from "@/components/landing-pages/feature-previews/mobile-scanner/AppScreen";
import { PointsMini, RewardsMini, StampsMini } from "@/components/landing-pages/feature-previews/mobile-scanner/CounterMinis";
import { HowSection } from "@/components/landing-pages/feature-previews/mobile-scanner/HowSection";
import { JoinCodeMini, LimitMini } from "@/components/landing-pages/feature-previews/mobile-scanner/TeamMinis";
import { TeamSection } from "@/components/landing-pages/feature-previews/mobile-scanner/TeamSection";
import { WaysSection } from "@/components/landing-pages/feature-previews/mobile-scanner/WaysSection";
import { RegionPricingProvider } from "@/components/market/RegionPricingProvider";
import { MARKETS } from "@/lib/markets";
import { FALLBACK_PRICING } from "@/lib/pricing";
import { SCANNER_LOOP, scannerLoopFiles } from "@/lib/videos/scanner-loop";
import { loadCatalog } from "../../testing/catalogs";
import { code, findTag, literalAttr, openingTags, read } from "../../testing/jsx-source";
import { COMPONENTS_DIR, pageFile } from "../../testing/landing-pages-source";
import { textOf } from "../../testing/render-en";
import { smallestLabelPx, stackZooms } from "../../testing/stacked-rows";
import { mockEnglishServerTranslations } from "../../testing/server-intl";
import { MOBILE_SCANNER_PREVIEW as COPY } from "../copy/previews/mobile-scanner";
import { SHARED } from "../copy/shared";

// The sections hold async server components (the level cards, the wallet card) that ask next-intl for their labels.
await mockEnglishServerTranslations();

/** The page's markup, as a visitor's browser receives it: async pieces resolved, the US dollars and trial in place. */
async function render(node: ReactNode): Promise<string> {
  const stream = await renderToReadableStream(
    <NextIntlClientProvider
      locale="en"
      timeZone="UTC"
      messages={loadCatalog("en")}
      onError={(error) => {
        throw error;
      }}
    >
      <RegionPricingProvider
        ladders={{ eur: FALLBACK_PRICING.eur, usd: FALLBACK_PRICING.usd }}
        defaultCurrency="usd"
        defaultTrialDays={MARKETS.us.trialDays}
      >
        {node}
      </RegionPricingProvider>
    </NextIntlClientProvider>,
  );
  await stream.allReady;
  return (await new Response(stream).text()).replace(/<!--[\s\S]*?-->/g, "");
}

/** The characters a team code can hold: the Scanner app's `JOIN_CODE_ALPHABET`, with no 0, O, 1, I, L or U to misread. */
const TEAM_CODE_ALPHABET = "ABCDEFGHJKMNPQRSTVWXYZ23456789";

const FOLDER = join(COMPONENTS_DIR, "feature-previews", "mobile-scanner");
const section = (name: string) => code(join(FOLDER, `${name}.tsx`));
const PAGE = () => code(pageFile("platform/mobile-scanner"));

/** True when every line is in `text`, each one after the line before it (read from where the last ended). */
function inOrder(text: string, lines: readonly string[]): boolean {
  let from = 0;

  for (const line of lines) {
    const at = text.indexOf(line, from);
    if (at === -1) return false;
    from = at + line.length;
  }
  return true;
}

/** HTML entities read back as the characters a visitor sees. */
const decode = (html: string) => html.replaceAll("&#x27;", "'").replaceAll("&quot;", '"').replaceAll("&amp;", "&");

/** The accessible names of the pictures in a render (`role="img"`, a `<video>` or an `<img>`). */
const pictures = (html: string) =>
  [...html.matchAll(/<(?:div|video|img|svg)\b[^>]*\b(?:aria-label|alt)="([^"]+)"/g)].map((match) => decode(match[1]));

const SECTIONS = {
  how: () => render(<HowSection />),
  counter: () => render(<CounterSection />),
  ways: () => render(<WaysSection />),
  team: () => render(<TeamSection />),
};

describe("the page: the hero's video plays once and the rest of the page is built from the copy", () => {
  test("the builder's marker is gone, so the section-order guard is armed", () => {
    expect(read(pageFile("platform/mobile-scanner"))).not.toContain("TODO(STA-552 builder)");
  });

  test("below the hero the page runs how, counter, ways and team, then the live demo, the cream card and the sibling links", () => {
    const tags = openingTags(PAGE()).map((tag) => tag.name);
    const at = ["PreviewHero", "HowSection", "CounterSection", "WaysSection", "TeamSection", "LpDemo", "LpAccentBand", "RelatedPreviews"].map((name) =>
      tags.indexOf(name),
    );

    expect(at.every((index) => index > -1)).toBe(true);
    expect(at).toEqual([...at].sort((a, b) => a - b));
  });

  test("the demo is centred under the copy's own label, like Platform's", () => {
    const demo = findTag(PAGE(), "LpDemo");

    expect(demo?.attrs).toContain("eyebrow={MOBILE_SCANNER_PREVIEW.demo.eyebrow}");
    expect(literalAttr(demo?.attrs ?? "", "align")).toBe("center");
  });

  test("only the hero plays the Scanner video: everywhere else the Scanner is the finished-stamp picture", () => {
    const loops = [PAGE(), ...["HowSection", "CounterSection", "WaysSection", "TeamSection"].map(section)].flatMap((source) =>
      openingTags(source).filter((tag) => tag.name === "ScannerLoop"),
    );
    const playing = loops.filter((tag) => !/(?:^|\s)still(?:[\s=}]|$)/.test(tag.attrs));

    expect(loops.length).toBeGreaterThanOrEqual(2);
    expect(playing).toHaveLength(1);
    expect(playing[0].attrs).toMatch(/\beager\b/);
  });
});

describe("how: the customer's card beside the Scanner's finished stamp, then Scan, Check, Confirm", () => {
  test("it is the how section, centred", () => {
    const frame = findTag(section("HowSection"), "LpSection");

    expect(literalAttr(frame?.attrs ?? "", "section")).toBe("how");
    expect(literalAttr(frame?.attrs ?? "", "align")).toBe("center");
  });

  test("a visitor reads the three steps in order, under the title and lead", async () => {
    const text = textOf(await SECTIONS.how());

    expect(
      inOrder(text, [COPY.how.eyebrow, COPY.how.title, COPY.how.lead, ...COPY.how.cells.flatMap((cell) => [cell.title, cell.body])]),
    ).toBe(true);
  });

  test("the two phones are Sophie's Aurevo card at the stamps the video ends on, and that video's finished frame (no second video)", async () => {
    const html = await SECTIONS.how();
    const files = scannerLoopFiles("en");
    const wallet = findTag(section("HowSection"), "WalletPhone");

    expect(wallet?.attrs).toMatch(/\bstamps=\{SCANNER_LOOP\.stamps\}/);
    expect(SCANNER_LOOP.stamps).toBe(5);
    expect(textOf(html)).toContain("Sophie");
    expect(html).toContain(encodeURIComponent(files.still).replaceAll("%2F", "/"));
    expect(html).not.toContain("<video");
    expect(pictures(html).length).toBeGreaterThanOrEqual(1);
  });

  test("the link under the table scrolls to the demo, 44px tall to tap", async () => {
    const html = await SECTIONS.how();
    const link = html.match(/<a [^>]*href="#demo"[^>]*>/)?.[0] ?? "";

    expect(link).toContain("min-h-11");
    expect(textOf(html)).toContain(COPY.how.link);
  });
});

describe("counter: Stamps, Points, Rewards, Levels, each with the app's own screen", () => {
  test("its header is the copy's, centred, and the rows are the copy's four in order", async () => {
    const frame = findTag(section("CounterSection"), "LpSection");
    const text = textOf(await SECTIONS.counter());

    expect(literalAttr(frame?.attrs ?? "", "section")).toBe("counter");
    expect(literalAttr(frame?.attrs ?? "", "align")).toBe("center");
    expect(
      inOrder(text, [COPY.counter.eyebrow, COPY.counter.title, COPY.counter.lead, ...COPY.counter.rows.flatMap((row) => [row.eyebrow, row.title, row.body])]),
    ).toBe(true);
  });

  test("every row is open on the server, none carries a plan chip, and each has a picture of its own", async () => {
    const html = await SECTIONS.counter();

    expect(html.match(/data-open="true"/g)).toHaveLength(4);
    expect(html).not.toContain('data-open="false"');
    expect(textOf(html)).not.toMatch(/Every plan|Growth and Pro/);
    const rows = html.match(/<li\b[^>]*data-key="[a-z]+"[\s\S]*?<\/li>/g) ?? [];

    expect(rows).toHaveLength(COPY.counter.rows.length);
    for (const row of rows) expect(row).toMatch(/role="img"|<img/);
  });

  test("on a phone every screen goes under its words, printed large enough that its smallest label is 11px", async () => {
    const zooms = stackZooms(await SECTIONS.counter());
    const smallest = smallestLabelPx(join(FOLDER, "CounterMinis.tsx"));

    expect(zooms).toHaveLength(COPY.counter.rows.length);
    for (const zoom of zooms) expect(smallest * zoom * (MINI.narrowTo / MINI.width)).toBeGreaterThanOrEqual(11);
  });

  test("the levels row shows the three level cards the other pages show", async () => {
    expect(pictures(await SECTIONS.counter())).toContain(SHARED.levelCardsAlt);
  });

  test("the stamps screen: a stepper set to 3 and the Add 3 stamps button, for Sophie", async () => {
    const html = await render(<StampsMini />);
    const text = textOf(html);

    expect(pictures(html)).toEqual([expect.stringMatching(/three stamps/i)]);
    for (const label of ["Add 3 stamps", "+3 stamps", "Sophie"]) expect(text).toContain(label);
    expect(inOrder(text, ["Sophie", "|3|", "+3 stamps", "Add 3 stamps"])).toBe(true);
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
  test("it is Platform's table with no phones: header, then two cells, each led by an icon", async () => {
    const html = await SECTIONS.ways();
    const text = textOf(html);

    expect(
      inOrder(text, [COPY.ways.eyebrow, COPY.ways.title, COPY.ways.lead, ...COPY.ways.cells.flatMap((cell) => [cell.title, cell.body])]),
    ).toBe(true);
    expect(html.match(/<li\b/g)).toHaveLength(2);
    expect(html.match(/<li\b[\s\S]*?<\/li>/g)?.every((cell) => cell.includes("<svg"))).toBe(true);
    expect(html).toContain("lg:grid-cols-2");
    expect(text).toContain("scan.stampeo.app");
  });

  test("the store badges are not here: the stores are named in words, because a business cannot be created in the app", async () => {
    const html = await SECTIONS.ways();

    expect(html).not.toMatch(/Add to (?:Apple|Google) Wallet|app-store|google-play|<img/i);
    expect(textOf(html)).toContain("App Store and Google Play");
  });

  test("the trial button and the way to the demo follow, tracked as a feature CTA", async () => {
    const source = section("WaysSection");
    const html = await SECTIONS.ways();
    const pair = findTag(source, "LpCtaPair");

    expect(literalAttr(pair?.attrs ?? "", "location")).toBe("feature_cta");
    expect(textOf(html)).toContain(SHARED.cta);
    expect(html).toMatch(/<a [^>]*href="#demo"/);
    expect(textOf(html)).toContain(SHARED.demoLink);
  });
});

describe("team: free for the whole team, staff on one tab and owners on the other", () => {
  test("a toggle under the copy's header with the two tabs, Staff open first", async () => {
    const html = await SECTIONS.team();
    const text = textOf(html);
    const panes = [...html.matchAll(/<div role="tabpanel" aria-label="([^"]+)"([^>]*)>/g)];

    expect(inOrder(text, [COPY.team.eyebrow, COPY.team.title, COPY.team.lead])).toBe(true);
    expect(html).toMatch(/role="tablist"[^>]*aria-label="[^"]+"/);
    expect(html).toMatch(/role="tab"[^>]*aria-selected="true"[^>]*>Staff</);
    expect(panes.map((pane) => pane[1])).toEqual([COPY.team.tabs.staff.label, COPY.team.tabs.owners.label]);
    expect([/\binert\b/.test(panes[0][2]), /\binert\b/.test(panes[1][2])]).toEqual([false, true]);
  });

  test("each pane has its title and facts, and the two Growth and Pro facts carry their chip", async () => {
    const text = textOf(await SECTIONS.team());

    for (const tab of Object.values(COPY.team.tabs)) {
      expect(inOrder(text, [tab.title, ...tab.facts.map((fact) => fact.text)])).toBe(true);
    }
    expect(text.match(/Growth and Pro/g)).toHaveLength(2);
    expect(text).not.toContain("Every plan");
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
    const text = textOf(await SECTIONS.team());

    expect(text).not.toMatch(/\b(?:ranking|rankings|leaderboard|top scanner|idle|pace|speed|GPS|biometric|per hour)\b/i);
  });
});

describe("the whole page (AC3, AC5)", () => {
  test("no section prints a sample-data caption, an Every plan chip or a store badge", async () => {
    const text = (await Promise.all(Object.values(SECTIONS).map((build) => build()))).join("\n");

    expect(textOf(text)).not.toMatch(/Sample data|Every plan/);
    expect(text).not.toMatch(/Add to (?:Apple|Google) Wallet/);
  });

  test("no unfilled token and no city is printed: the trial length goes through RegionText", async () => {
    const text = (await Promise.all(Object.values(SECTIONS).map((build) => build()))).join("\n");

    expect(text).not.toContain("{trialDays}");
    expect(text).not.toMatch(/Paris|GMT/);
  });

  test("every picture a section draws has an accessible name, and every phone-sized thing that taps is 44px tall", async () => {
    for (const build of Object.values(SECTIONS)) {
      const html = await build();

      for (const tag of html.match(/<[a-z]+\b[^>]*\brole="img"[^>]*>/g) ?? []) expect(tag).toMatch(/aria-label="[^"]{12,}"/);
      for (const link of html.match(/<a\b[^>]*>/g) ?? []) expect(link).toMatch(/(?:min-h-11|h-\[52px\]|h-11)/);
    }
  });
});

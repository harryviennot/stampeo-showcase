/**
 * The analytics preview (`/us/landing-pages/platform/analytics`): what a
 * visitor sees in each section below the hero (the hero and the sibling links
 * are pinned in `kit.test.tsx` and `registry.test.ts`). Sections are rendered
 * under the English catalogs, and read as source only for the literals the
 * registry guards need.
 */

import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { renderToReadableStream } from "react-dom/server";
import { ActivitySection } from "@/components/landing-pages/feature-previews/analytics/ActivitySection";
import { CustomersMini } from "@/components/landing-pages/feature-previews/analytics/CustomersMini";
import { GlanceSection } from "@/components/landing-pages/feature-previews/analytics/GlanceSection";
import { HistorySection } from "@/components/landing-pages/feature-previews/analytics/HistorySection";
import {
  BusiestMini,
  HabitsMini,
  RewardProgressMini,
  ReturnRateMini,
} from "@/components/landing-pages/feature-previews/analytics/QuestionMinis";
import { QuestionsSection } from "@/components/landing-pages/feature-previews/analytics/QuestionsSection";
import { RegionPricingProvider } from "@/components/market/RegionPricingProvider";
import { PLAN_FACTS } from "@/lib/plans/plan-facts";
import { MARKETS } from "@/lib/markets";
import { FALLBACK_PRICING } from "@/lib/pricing";
import { loadCatalog } from "../../testing/catalogs";
import { code, findTag, literalAttr, openingTags, read } from "../../testing/jsx-source";
import { COMPONENTS_DIR, pageFile } from "../../testing/landing-pages-source";
import { textOf } from "../../testing/render-en";
import { ANALYTICS_PREVIEW as COPY } from "../copy/previews/analytics";
import { OUTCOMES } from "../copy/outcomes";
import { SHARED } from "../copy/shared";

/** The page's markup as a visitor's browser receives it: async pieces resolved, the US dollars and trial in place. */
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

const FOLDER = join(COMPONENTS_DIR, "feature-previews", "analytics");
const section = (name: string) => code(join(FOLDER, `${name}.tsx`));
const PAGE = () => code(pageFile("platform/analytics"));

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

/** The accessible names of the pictures in a render. */
const pictures = (html: string) =>
  [...html.matchAll(/<[a-z]+\b[^>]*\brole="img"[^>]*\baria-label="([^"]+)"/g)].map((match) => decode(match[1]));

const SECTIONS = {
  glance: () => render(<GlanceSection />),
  questions: () => render(<QuestionsSection />),
  activity: () => render(<ActivitySection />),
  numbers: () => render(<HistorySection />),
};

describe("the page: the dashboard hero, then four sections, the cream card and the sibling links", () => {
  test("the builder's marker is gone, so the section-order guard is armed", () => {
    expect(read(pageFile("platform/analytics"))).not.toContain("TODO(STA-552 builder)");
  });

  test("the page runs glance, questions, activity, then the history figures between two hairlines", () => {
    const tags = openingTags(PAGE()).map((tag) => tag.name);
    const names = ["PreviewHero", "GlanceSection", "QuestionsSection", "ActivitySection", "Hairline", "HistorySection", "Hairline", "LpAccentBand", "RelatedPreviews"];
    let from = 0;
    const at = names.map((name) => {
      from = tags.indexOf(name, from);
      return from;
    });

    expect(at.every((index) => index > -1)).toBe(true);
    expect(at).toEqual([...at].sort((a, b) => a - b));
  });

  test("there is no demo, so no section sends a visitor to one", async () => {
    const html = (await Promise.all(Object.values(SECTIONS).map((build) => build()))).join("\n");

    expect(html).not.toContain('href="#demo"');
    expect(textOf(html)).not.toContain(SHARED.demoLink);
  });
});

describe("glance: the every-plan numbers, drawn as the dashboard draws them", () => {
  test("a white surface under the copy's header, with no tabs: one thing to read", async () => {
    const html = await SECTIONS.glance();
    const frame = findTag(section("GlanceSection"), "LpSection");

    expect(literalAttr(frame?.attrs ?? "", "section")).toBe("glance");
    expect(literalAttr(frame?.attrs ?? "", "align")).toBe("center");
    expect(inOrder(textOf(html), [COPY.glance.eyebrow, COPY.glance.title, COPY.glance.lead])).toBe(true);
    expect(html).not.toContain('role="tablist"');
    expect(html).not.toMatch(/\binert\b/);
  });

  test("the tiles are Visits, New customers and the 30-day return rate with their trends, then Visits over time week by week", async () => {
    const html = await SECTIONS.glance();
    const text = textOf(html);

    expect(inOrder(text, ["Visits|2,770|▲17%", "New customers|460|▲11%", "30-day return rate|61%|▲2 pts", "Visits over time"])).toBe(true);
    expect(html.match(/data-week=/g)).toHaveLength(13);
    expect(pictures(html)).toEqual([expect.stringMatching(/2,770 visits.*460 new customers.*61%.*week by week/)]);
  });

  test("the facts follow the tiles, and every one is on every plan: no chip", async () => {
    const text = textOf(await SECTIONS.glance());

    expect(inOrder(text, [COPY.glance.tab.title, ...COPY.glance.tab.facts.map((fact) => fact.text)])).toBe(true);
    expect(text).not.toMatch(/Every plan|Growth and Pro/);
  });
});

describe("questions: four questions an owner asks, each answered by a chart", () => {
  test("the copy's header, then the four rows in order, all open on the server", async () => {
    const html = await SECTIONS.questions();
    const frame = findTag(section("QuestionsSection"), "LpSection");

    expect(literalAttr(frame?.attrs ?? "", "section")).toBe("questions");
    expect(literalAttr(frame?.attrs ?? "", "align")).toBe("center");
    expect(
      inOrder(textOf(html), [COPY.questions.eyebrow, COPY.questions.title, COPY.questions.lead, ...COPY.questions.rows.flatMap((row) => [row.eyebrow, row.title, row.body])]),
    ).toBe(true);
    expect(html.match(/data-open="true"/g)).toHaveLength(4);
    expect(html).not.toContain('data-open="false"');
  });

  test("the three charts that come with Growth and Pro say so in their own row, and the return rate says nothing", async () => {
    const rows = (await SECTIONS.questions()).match(/<li\b[^>]*data-key="[a-z]+"[\s\S]*?<\/li>/g) ?? [];
    const chips = rows.map((row) => textOf(row).includes("Growth and Pro"));

    expect(rows).toHaveLength(4);
    expect(chips).toEqual([false, true, true, true]);
    expect(rows.every((row) => /role="img"/.test(row))).toBe(true);
  });

  test("under the rows, one line says what Starter gets instead of the charts", async () => {
    const text = textOf(await SECTIONS.questions());

    expect(text.indexOf(COPY.questions.closer)).toBeGreaterThan(text.lastIndexOf(COPY.questions.rows[3].body));
    expect(COPY.questions.closer).toBe("Starter shows these in a sentence; Growth and Pro chart them.");
  });

  test("return rate: 61% of first-time customers came back, up 2 points", async () => {
    const html = await render(<ReturnRateMini />);
    const text = textOf(html);

    expect(pictures(html)).toEqual([expect.stringMatching(/61%.*up 2 points/)]);
    expect(inOrder(text, ["30-day return rate", "61%", "▲2 pts", "of first-time customers came back"])).toBe(true);
  });

  test("visit habits: the dashboard's five groups, from every week to came once, each with its count", async () => {
    const html = await render(<HabitsMini />);
    const text = textOf(html);

    expect(pictures(html)).toEqual([expect.stringMatching(/how often they come/i)]);
    expect(inOrder(text, ["About every week", "Every 2 weeks", "About once a month", "Less often", "Came once"])).toBe(true);
    for (const count of ["191", "125", "106", "33", "205"]) expect(text).toContain(count);
  });

  test("busiest times: a week by day and hour, with the busiest slot named and no city", async () => {
    const html = await render(<BusiestMini />);
    const text = textOf(html);

    expect(pictures(html)).toEqual([expect.stringMatching(/busiest times.*Thursday.*8 to 9 AM/i)]);
    expect(inOrder(text, ["Busiest times", "Mon", "Thu", "Fewer visits", "More visits"])).toBe(true);
    expect(text).toMatch(/8 AM/);
    expect(text).not.toMatch(/Paris|GMT/);
  });

  test("reward progress: customers by stamps on their card, with the ones holding a reward ready marked", async () => {
    const html = await render(<RewardProgressMini />);
    const text = textOf(html);

    expect(pictures(html)).toEqual([expect.stringMatching(/reward progress.*22 rewards ready/i)]);
    expect(inOrder(text, ["Reward progress", "Reward ready"])).toBe(true);
  });
});

describe("activity: live visits on one tab, the customer groups on the other", () => {
  test("a toggle under the copy's header: Live activity open first, Your customers behind it", async () => {
    const html = await SECTIONS.activity();
    const panes = [...html.matchAll(/<div role="tabpanel" aria-label="([^"]+)"([^>]*)>/g)];

    expect(inOrder(textOf(html), [COPY.activity.eyebrow, COPY.activity.title, COPY.activity.lead])).toBe(true);
    expect(html).toMatch(/role="tab"[^>]*aria-selected="true"[^>]*>Live activity</);
    expect(panes.map((pane) => pane[1])).toEqual([COPY.activity.tabs.live.label, COPY.activity.tabs.customers.label]);
    expect([/\binert\b/.test(panes[0][2]), /\binert\b/.test(panes[1][2])]).toEqual([false, true]);
  });

  test("each pane has its title and facts, and nothing in it is plan-gated", async () => {
    const text = textOf(await SECTIONS.activity());

    for (const tab of Object.values(COPY.activity.tabs)) {
      expect(inOrder(text, [tab.title, ...tab.facts.map((fact) => fact.text)])).toBe(true);
    }
    expect(text).not.toMatch(/Every plan|Growth and Pro/);
  });

  test("the live feed stands still for a reader who asks for less motion", () => {
    const feed = findTag(section("ActivitySection"), "LiveActivityFeed");

    expect(feed?.attrs).toMatch(/\bcardOnly\b/);
    expect(feed?.attrs).toMatch(/\bstillWhenReduced\b/);
  });

  test("the customers pane: the five groups the dashboard sorts everyone into, then three customers with their stamps and group", async () => {
    const html = await render(<CustomersMini />);
    const text = textOf(html);

    expect(pictures(html)).toEqual([expect.stringMatching(/New, Regular, VIP, At risk and Ghost/)]);
    expect(inOrder(text, [...OUTCOMES.regulars.segments])).toBe(true);
    expect(html.match(/<li\b/g)).toHaveLength(3);
    expect(text).toMatch(/\d of 8 stamps/);
    expect(text).not.toMatch(/Every plan/);
  });
});

describe("numbers: how far back each plan looks", () => {
  test("the three figures are the plans' own history, written large, then a single trial button", async () => {
    const html = await SECTIONS.numbers();
    const text = textOf(html);
    const frame = findTag(section("HistorySection"), "LpSection");

    expect(literalAttr(frame?.attrs ?? "", "section")).toBe("numbers");
    expect(literalAttr(frame?.attrs ?? "", "align")).toBe("center");
    expect(inOrder(text, [COPY.numbers.eyebrow, COPY.numbers.title, ...COPY.numbers.figures.flatMap((figure) => [figure.value, figure.label])])).toBe(true);
    expect(COPY.numbers.figures.map((figure) => Number(figure.value))).toEqual([
      PLAN_FACTS.starter.analyticsHistoryDays,
      PLAN_FACTS.growth.analyticsHistoryDays,
      PLAN_FACTS.pro.analyticsHistoryDays,
    ]);
    expect(html.match(/class="[^"]*\bink-figure\b/g)).toHaveLength(3);
  });

  test("the trial button is tracked as a feature CTA, and there is no second action because there is no demo", async () => {
    const html = await SECTIONS.numbers();
    const pair = findTag(section("HistorySection"), "LpCtaPair");

    expect(literalAttr(pair?.attrs ?? "", "location")).toBe("feature_cta");
    expect(pair?.attrs).toMatch(/\bsecondary=\{null\}/);
    expect(textOf(html)).toContain(SHARED.cta);
    expect(html).not.toContain('href="#');
  });

  test("none of these figures is a measurement of Stampeo's, so none is a percentage that needs a source", async () => {
    expect(textOf(await SECTIONS.numbers())).not.toMatch(/%/);
  });
});

describe("the whole page (AC3, AC5)", () => {
  test("no section prints a sample-data caption, an Every plan chip or a city", async () => {
    const html = (await Promise.all(Object.values(SECTIONS).map((build) => build()))).join("\n");

    expect(textOf(html)).not.toMatch(/Sample data|Every plan|Paris|GMT/);
    expect(html).not.toContain("{trialDays}");
  });

  test("every picture has an accessible name, and every link a phone user taps is 44px tall", async () => {
    for (const build of Object.values(SECTIONS)) {
      const html = await build();

      for (const tag of html.match(/<[a-z]+\b[^>]*\brole="img"[^>]*>/g) ?? []) expect(tag).toMatch(/aria-label="[^"]{12,}"/);
      for (const link of html.match(/<a\b[^>]*>/g) ?? []) expect(link).toMatch(/(?:min-h-11|h-\[52px\]|h-11)/);
    }
  });
});

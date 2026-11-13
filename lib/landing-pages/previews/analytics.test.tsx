/**
 * The analytics preview (`/us/landing-pages/platform/analytics`): what a
 * visitor sees in each section below the hero. Every section is rendered under
 * the English catalogs; the hero, the headers, the order and the tap targets of
 * all five previews are in `pages.test.tsx`.
 */

import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { ActivitySection } from "@/components/landing-pages/feature-previews/analytics/ActivitySection";
import { CustomersMini } from "@/components/landing-pages/feature-previews/analytics/CustomersMini";
import { GlanceSection } from "@/components/landing-pages/feature-previews/analytics/GlanceSection";
import { GlanceTiles } from "@/components/landing-pages/feature-previews/analytics/GlanceTiles";
import { HistorySection } from "@/components/landing-pages/feature-previews/analytics/HistorySection";
import {
  BusiestMini,
  HabitsMini,
  RewardProgressMini,
  ReturnRateMini,
} from "@/components/landing-pages/feature-previews/analytics/QuestionMinis";
import { QuestionsSection } from "@/components/landing-pages/feature-previews/analytics/QuestionsSection";
import { MINI } from "@/components/landing-pages/feature-previews/MiniFrame";
import { DeliverAnalytics } from "@/components/landing-pages/platform/DeliverAnalytics";
import { PLAN_FACTS } from "@/lib/plans/plan-facts";
import { COMPONENTS_DIR, previewSource } from "../../testing/landing-pages-source";
import { expectInOrder, pictures, renderEnAsync as render, textOf } from "../../testing/render-en";
import { smallestLabelPx, stackZooms } from "../../testing/stacked-rows";
import { ANALYTICS_PREVIEW as COPY } from "../copy/previews/analytics";
import { OUTCOMES } from "../copy/outcomes";
import { SHARED } from "../copy/shared";

const FOLDER = join(COMPONENTS_DIR, "feature-previews", "analytics");

describe("glance: the every-plan numbers, drawn as the dashboard draws them", () => {
  test("a white surface with no tabs: one thing to read", async () => {
    const html = await render(<GlanceSection />);

    expect(html).not.toContain('role="tablist"');
    expect(html).not.toMatch(/\binert\b/);
  });

  test("the tiles are Visits, New customers and the 30-day return rate with their trends, then Visits over time week by week", async () => {
    const html = await render(<GlanceSection />);

    expectInOrder(html, ["Visits|2,770|▲17%", "New customers|460|▲11%", "30-day return rate|61%|▲2 pts", "Visits over time"]);
    expect(html.match(/data-week=/g)).toHaveLength(13);
    expect(pictures(html)).toEqual([expect.stringMatching(/2,770 visits.*460 new customers.*61%.*week by week/)]);
  });

  test("the sample café is Platform's: the same visits, return rate and trends as its dashboard tiles", async () => {
    const figures = (text: string) => ({
      visits: /Visits\|([\d,]+)\|(▲\d+%)/.exec(text)?.slice(1),
      returnRate: /30-day return rate\|(\d+%)\|(▲\d+ pts)/.exec(text)?.slice(1),
    });
    const preview = figures(textOf(await render(<GlanceTiles />)));

    expect(preview.visits).toBeDefined();
    expect(preview.returnRate).toBeDefined();
    expect(preview).toEqual(figures(textOf(await render(<DeliverAnalytics />))));
  });

  test("the facts follow the tiles; the lead says they are on every plan, and no fact carries a chip of its own", async () => {
    const html = await render(<GlanceSection />);

    expectInOrder(html, [COPY.glance.tab.title, ...COPY.glance.tab.facts.map((fact) => fact.text)]);
    expect(COPY.glance.tab.facts.filter((fact) => "plan" in fact)).toEqual([]);
  });
});

describe("questions: four questions an owner asks, each answered by a chart", () => {
  test("the four rows are in order, all open on the server", async () => {
    const html = await render(<QuestionsSection />);

    expectInOrder(html, COPY.questions.rows.flatMap((row) => [row.eyebrow, row.title, row.body]));
    expect(html.match(/data-open="true"/g)).toHaveLength(4);
    expect(html).not.toContain('data-open="false"');
  });

  test("the three charts that come with Growth and Pro say so in their own row, and the return rate says nothing", async () => {
    const rows = (await render(<QuestionsSection />)).match(/<li\b[^>]*data-key="[a-z]+"[\s\S]*?<\/li>/g) ?? [];
    const chips = rows.map((row) => textOf(row).includes("Growth and Pro"));

    expect(rows).toHaveLength(4);
    expect(chips).toEqual([false, true, true, true]);
    expect(rows.every((row) => /role="img"/.test(row))).toBe(true);
  });

  test("on a phone every chart goes under its words, printed large enough that its smallest label is 11px", async () => {
    const zooms = stackZooms(await render(<QuestionsSection />));
    const smallest = smallestLabelPx(join(FOLDER, "QuestionMinis.tsx"));

    expect(zooms).toHaveLength(COPY.questions.rows.length);
    for (const zoom of zooms) expect(smallest * zoom * (MINI.narrowTo / MINI.width)).toBeGreaterThanOrEqual(11);
  });

  test("under the rows, one line says what Starter gets instead of the charts", async () => {
    const text = textOf(await render(<QuestionsSection />));

    expect(text.indexOf(COPY.questions.closer)).toBeGreaterThan(text.lastIndexOf(COPY.questions.rows[3].body));
  });

  test("return rate: Platform's 61% of first-time customers came back, up 2 points", async () => {
    const html = await render(<ReturnRateMini />);

    expect(pictures(html)).toEqual([expect.stringMatching(/61%.*up 2 points/)]);
    expectInOrder(html, ["30-day return rate", "61%", "▲2 pts", "of first-time customers came back"]);
    expect(textOf(await render(<DeliverAnalytics />))).toContain("30-day return rate|61%|▲2 pts");
  });

  test("visit habits: the dashboard's five groups, from every week to came once, each with its count", async () => {
    const html = await render(<HabitsMini />);

    expect(pictures(html)).toEqual([expect.stringMatching(/how often they come/i)]);
    expectInOrder(html, ["About every week", "Every 2 weeks", "About once a month", "Less often", "Came once"]);
    for (const count of ["191", "125", "106", "33", "205"]) expect(textOf(html)).toContain(count);
  });

  test("busiest times: a week by day and hour, with the busiest slot named and no city", async () => {
    const html = await render(<BusiestMini />);

    expect(pictures(html)).toEqual([expect.stringMatching(/busiest times.*Thursday.*8 to 9 AM/i)]);
    expectInOrder(html, ["Busiest times", "Mon", "Thu", "Fewer visits", "More visits"]);
    expect(textOf(html)).toMatch(/8 AM/);
    expect(textOf(html)).not.toMatch(/Paris|GMT/);
  });

  test("reward progress: customers by stamps on their card, with the ones holding a reward ready marked", async () => {
    const html = await render(<RewardProgressMini />);

    expect(pictures(html)).toEqual([expect.stringMatching(/reward progress.*22 rewards ready/i)]);
    expectInOrder(html, ["Reward progress", "Reward ready"]);
  });
});

describe("activity: live visits on one tab, the customer groups on the other", () => {
  test("a toggle with Live activity open first, Your customers behind it", async () => {
    const html = await render(<ActivitySection />);
    const panes = [...html.matchAll(/<div role="tabpanel" aria-label="([^"]+)"([^>]*)>/g)];

    expect(html).toMatch(/role="tab"[^>]*aria-selected="true"[^>]*>Live activity</);
    expect(panes.map((pane) => pane[1])).toEqual([COPY.activity.tabs.live.label, COPY.activity.tabs.customers.label]);
    expect([/\binert\b/.test(panes[0][2]), /\binert\b/.test(panes[1][2])]).toEqual([false, true]);
  });

  test("each pane has its title and facts, and nothing in it is plan-gated", async () => {
    const html = await render(<ActivitySection />);

    for (const tab of Object.values(COPY.activity.tabs)) expectInOrder(html, [tab.title, ...tab.facts.map((fact) => fact.text)]);
    expect(textOf(html)).not.toContain("Growth and Pro");
  });

  test("the live feed is the preview's own: a light ring, room under its fifth row, and a pulse that stops for a reader who asks for less motion", async () => {
    const html = await render(<ActivitySection />);

    expect(html).toContain("ring-1 ring-black/[0.05]");
    expect(html).not.toContain("blog-card-3d");
    expect(html).toContain(`height:${5 * 48 + 32}px`);
    expect(html).toContain("pulse-dot motion-reduce:animate-none!");
  });

  test("the customers pane: the five groups the dashboard sorts everyone into, then three customers with their stamps and group", async () => {
    const html = await render(<CustomersMini />);

    expect(pictures(html)).toEqual([expect.stringMatching(/New, Regular, VIP, At risk and Ghost/)]);
    expectInOrder(html, [...OUTCOMES.regulars.segments]);
    expect(html.match(/<li\b/g)).toHaveLength(3);
    expect(textOf(html)).toMatch(/\d of 8 stamps/);
  });
});

describe("numbers: how far back each plan looks", () => {
  test("the three figures are the plans' own history, written large, then a single trial button", async () => {
    const html = await render(<HistorySection />);

    expectInOrder(html, COPY.numbers.figures.flatMap((figure) => [figure.value, figure.label]));
    expect(COPY.numbers.figures.map((figure) => Number(figure.value))).toEqual([
      PLAN_FACTS.starter.analyticsHistoryDays,
      PLAN_FACTS.growth.analyticsHistoryDays,
      PLAN_FACTS.pro.analyticsHistoryDays,
    ]);
    expect(html.match(/class="[^"]*\bink-figure\b/g)).toHaveLength(3);
  });

  test("the trial button is tracked as a feature CTA, and there is no second action because there is no demo", async () => {
    const html = await render(<HistorySection />);
    const source = previewSource("platform/analytics", "HistorySection");

    expect(source).toMatch(/<LpCtaPair\s+location="feature_cta"/);
    expect(textOf(html)).toContain(SHARED.cta);
    expect(html).not.toContain('href="#');
  });

  test("none of these figures is a measurement of Stampeo's, so none is a percentage that needs a source", async () => {
    expect(textOf(await render(<HistorySection />))).not.toMatch(/%/);
  });
});

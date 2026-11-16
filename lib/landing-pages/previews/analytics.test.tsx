/**
 * The analytics preview (`/us/landing-pages/platform/analytics`): what a
 * visitor sees in each section below the hero. Every section is rendered under
 * the English catalogs; the hero, the headers, the order and the tap targets of
 * all six previews are in `pages.test.tsx`. How the cards flip and which plan shows
 * what are the pure rules in `analytics-interactions.test.ts`.
 */

import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { ActivitySection } from "@/components/landing-pages/feature-previews/analytics/ActivitySection";
import { CustomersMini } from "@/components/landing-pages/feature-previews/analytics/CustomersMini";
import { GlanceSection } from "@/components/landing-pages/feature-previews/analytics/GlanceSection";
import { GlanceTiles } from "@/components/landing-pages/feature-previews/analytics/GlanceTiles";
import { BlindSpotsSection } from "@/components/landing-pages/feature-previews/analytics/BlindSpotsSection";
import { CohortsMini, LocationMini } from "@/components/landing-pages/feature-previews/analytics/CohortsMini";
import { LadderSection } from "@/components/landing-pages/feature-previews/analytics/LadderSection";
import {
  BusiestMini,
  HABITS,
  HabitsMini,
  READY,
  RewardProgressMini,
} from "@/components/landing-pages/feature-previews/analytics/QuestionMinis";
import { RecapSection } from "@/components/landing-pages/feature-previews/analytics/RecapSection";
import { MINI } from "@/components/landing-pages/feature-previews/MiniFrame";
import { ANALYTICS, DeliverAnalytics } from "@/components/landing-pages/platform/DeliverAnalytics";
import { PLAN_FACTS, TIERS } from "../../plans/plan-facts";
import { COMPONENTS_DIR } from "../../testing/landing-pages-source";
import { expectInOrder, pictures, renderEnAsync as render, textOf } from "../../testing/render-en";
import { smallestLabelPx, stackZooms } from "../../testing/stacked-rows";
import { ANALYTICS_PREVIEW as COPY } from "../copy/previews/analytics";
import { ladderView } from "./analytics-ladder-view";
import { OUTCOMES } from "../copy/outcomes";

const FOLDER = join(COMPONENTS_DIR, "feature-previews", "analytics");

describe("blind spots: six questions a paper card cannot answer, and what Stampeo answers", () => {
  const cardOf = (html: string, key: string) => html.match(new RegExp(`<li\\b[^>]*data-card="${key}"[\\s\\S]*?</li>`))?.[0] ?? "";
  const faceTag = (card: string, face: "paper" | "stampeo") => card.match(new RegExp(`<[a-z]+\\b[^>]*data-face="${face}"[^>]*>`))?.[0] ?? "";
  const returning = Math.round((100 * (HABITS[0].count + HABITS[1].count)) / HABITS.reduce((sum, habit) => sum + habit.count, 0));

  /** What each card answers, from the sample café's own figures: the dashboard's numbers and its Starter sentences. */
  const ANSWERS = {
    working: [ANALYTICS.visits.total.toLocaleString("en-US"), `▲${ANALYTICS.visits.change}%`],
    return: [`${ANALYTICS.returnRate.percent}%`],
    regulars: [`${returning}%`],
    busiest: ["Thursday"],
    rewards: [String(READY)],
    new: [String(ANALYTICS.newCustomers.total), `▲${ANALYTICS.newCustomers.change}%`],
  } as const;

  test("a two-way control sits over six cards: With a paper card is chosen, With Stampeo is one tap away", async () => {
    const html = await render(<BlindSpotsSection />);
    const { toggle } = COPY.blindSpots;

    expect(html).toContain(`role="tablist" aria-label="${toggle.label}"`);
    expect(html).toMatch(new RegExp(`role="tab"[^>]*aria-selected="true"[^>]*>${toggle.paper}<`));
    expect(html).toMatch(new RegExp(`role="tab"[^>]*aria-selected="false"[^>]*>${toggle.stampeo}<`));
    expect(html.match(/<li\b[^>]*data-card=/g)).toHaveLength(6);
  });

  test("each card is a button that opens on its question and a handwritten ???, with the answer behind it", async () => {
    const html = await render(<BlindSpotsSection />);

    expect(html.match(/<button\b[^>]*aria-pressed="false"/g)).toHaveLength(6);
    for (const { key, question, line } of COPY.blindSpots.cards) {
      const card = cardOf(html, key);

      expectInOrder(card, [question, COPY.blindSpots.unknown, ...ANSWERS[key], line]);
      expect(card).toMatch(/class="[^"]*\bink-figure\b[^"]*"[^>]*>\?\?\?</);
    }
  });

  test("the cards are in the order of the brief: the program, the return, the regulars, the busiest time, the rewards, the new customers", async () => {
    const html = await render(<BlindSpotsSection />);
    const text = textOf(html);
    const at = COPY.blindSpots.cards.map(({ question }) => text.indexOf(question));

    expect(COPY.blindSpots.cards.map(({ key }) => key)).toEqual(["working", "return", "regulars", "busiest", "rewards", "new"]);
    expect(at.every((index) => index > -1)).toBe(true);
    expect([...at].sort((a, b) => a - b)).toEqual(at);
  });

  test("the answers are the sample café's own: Platform's visits, return rate and new customers, the regulars of its habits chart, the rewards ready of its progress chart", async () => {
    const text = textOf(await render(<BlindSpotsSection />));

    expect(returning).toBe(48);
    expect(READY).toBe(22);
    for (const figure of Object.values(ANSWERS).flat()) expect(text).toContain(figure);
    expect(textOf(await render(<DeliverAnalytics />))).toContain(`${ANALYTICS.returnRate.percent}%`);
  });

  test("every answer is one Starter's own dashboard gives: a key number of basic analytics, or the sentence its ladder row prints", async () => {
    const answers = textOf(await render(<BlindSpotsSection />));
    const starter = textOf(await render(<LadderSection />));
    const busiest = COPY.blindSpots.cards.find((card) => card.key === "busiest");

    expect(PLAN_FACTS.starter.analytics).toBe("basic");
    expect(ladderView("starter").layer).toBe("sentence");
    expect(starter).toContain(`${busiest?.figure}, ${busiest?.line}`);
    expect(starter).toContain(`${ANSWERS.regulars[0]}| of the customers you saw come at least every 2 weeks`);
    expect(starter).toContain(`${ANSWERS.rewards[0]} customers| have a reward waiting`);
    for (const key of ["working", "return", "new"] as const) expect(answers).toContain(ANSWERS[key][0]);
    expect(answers).not.toMatch(/\b(?:Starter|Growth|Pro|Every plan)\b|cohort|chart/i);
  });

  test("a screen reader reads the face that is showing: the question and ??? first, the answer hidden until its card is turned", async () => {
    const html = await render(<BlindSpotsSection />);

    for (const { key } of COPY.blindSpots.cards) {
      const card = cardOf(html, key);

      expect(faceTag(card, "paper")).toContain('aria-hidden="false"');
      expect(faceTag(card, "stampeo")).toContain('aria-hidden="true"');
    }
  });

  test("the cards are the house's stamped ones, 168px tall at least on a phone, and turn in half a second unless the reader asks for less motion", async () => {
    const html = await render(<BlindSpotsSection />);

    for (const { key } of COPY.blindSpots.cards) {
      const card = cardOf(html, key);

      expect(card).toContain("card-stamp");
      expect(card).toContain("min-h-[168px]");
      expect(card).toContain("500ms");
      expect(card).toContain("motion-reduce:transition-none");
    }
  });

  test("two columns on a phone and three from md, as production's own cards lay out", async () => {
    const html = await render(<BlindSpotsSection />);

    expect(html).toMatch(/<ul\b[^>]*class="[^"]*\bgrid-cols-2\b[^"]*\bmd:grid-cols-3\b/);
  });
});

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

describe("ladder: the same three questions, and what each plan sees of them", () => {
  const rowsOf = (html: string) => html.match(/<li\b[^>]*data-row="[a-z]+"[\s\S]*?<\/li>/g) ?? [];
  const layer = (row: string, kind: "sentence" | "chart") => row.match(new RegExp(`<div\\b[^>]*data-layer="${kind}"[^>]*>`))?.[0] ?? "";

  test("it opens on Starter: its tab is chosen and its history is 30 days, written by hand", async () => {
    const html = await render(<LadderSection />);
    const { plans, toggleLabel, historyLabel } = COPY.ladder;

    expect(html).toContain(`role="tablist" aria-label="${toggleLabel}"`);
    expect(html).toMatch(/role="tab"[^>]*aria-selected="true"[^>]*>Starter</);
    expect(html).toMatch(/role="tab"[^>]*aria-selected="false"[^>]*>Growth</);
    expect(html).toMatch(/role="tab"[^>]*aria-selected="false"[^>]*>Pro</);
    expectInOrder(html, [...plans.map((plan) => plan.label), plans[0].history.value, plans[0].history.unit, historyLabel]);
    expect(html).toMatch(/class="[^"]*\bink-figure\b[^"]*"[^>]*>30</);
  });

  test("the three questions are Busiest times, How often they come and Reward progress, in that order", async () => {
    const html = await render(<LadderSection />);

    expect(rowsOf(html)).toHaveLength(COPY.ladder.rows.length);
    expectInOrder(html, COPY.ladder.rows.map((row) => row.title));
  });

  test("Starter answers each question in the dashboard's own sentence, then says the chart is on Growth and Pro", async () => {
    const rows = rowsOf(await render(<LadderSection />));
    const SENTENCES = [
      ["Your busiest time:", "Thursday, 8 to 9 AM"],
      [`${Math.round((100 * (HABITS[0].count + HABITS[1].count)) / HABITS.reduce((sum, habit) => sum + habit.count, 0))}%`, "of the customers you saw come at least every 2 weeks"],
      [`${READY} customers`, "have a reward waiting"],
    ];

    rows.forEach((row, index) => {
      expect(layer(row, "sentence")).toContain('data-active="true"');
      expectInOrder(row, [COPY.ladder.rows[index].title, ...SENTENCES[index], COPY.ladder.locked]);
    });
  });

  test("the charts of Growth and Pro are already on the page but out of reach, so the next tap shows them at once", async () => {
    const rows = rowsOf(await render(<LadderSection />));

    expect(rows).toHaveLength(3);
    for (const row of rows) {
      const chart = layer(row, "chart");

      expect(chart).toContain('data-active="false"');
      expect(chart).toContain("inert");
      expect(chart).toContain('aria-hidden="true"');
      expect(pictures(row).length).toBeGreaterThan(0);
    }
  });

  test("Pro's two extras, Monthly cohorts and Filter by location, wait out of reach until Pro is chosen", async () => {
    const html = await render(<LadderSection />);
    const extras = html.match(/<div\b[^>]*data-extras[^>]*>[\s\S]*$/)?.[0] ?? "";

    expect(extras).toMatch(/^<div\b[^>]*data-active="false"[^>]*inert/);
    expectInOrder(extras, COPY.ladder.proRows.map((row) => row.title));
    expect(pictures(extras)).toEqual([expect.stringMatching(/Monthly cohorts/), expect.stringMatching(/Filter by location/)]);
  });

  test("on a phone every chart goes under its title, printed large enough that its smallest label is 11px", async () => {
    const zooms = stackZooms(await render(<LadderSection />));
    const smallest = Math.min(smallestLabelPx(join(FOLDER, "QuestionMinis.tsx")), smallestLabelPx(join(FOLDER, "CohortsMini.tsx")));

    expect(zooms).toHaveLength(COPY.ladder.rows.length + COPY.ladder.proRows.length);
    for (const zoom of zooms) expect(smallest * zoom * (MINI.narrowTo / MINI.width)).toBeGreaterThanOrEqual(11);
  });

  test("no plan chip and no sample caption: the plans are the control, and the title is the only place that says All plans", async () => {
    const text = textOf(await render(<LadderSection />));

    expect(text).not.toMatch(/Sample data|Every plan/);
    expect(text.match(/All plans/g)).toHaveLength(1);
    expect(text.indexOf("All plans")).toBe(text.indexOf(COPY.ladder.title));
  });
});

describe("the charts Growth and Pro add, drawn as the dashboard draws them", () => {
  test("visit habits: the dashboard's five groups, from every week to came once, each with its count", async () => {
    const html = await render(<HabitsMini />);

    expect(pictures(html)).toEqual([expect.stringMatching(/how often they come/i)]);
    expectInOrder(html, ["About every week", "Every 2 weeks", "About once a month", "Less often", "Came once"]);
    for (const { count } of HABITS) expect(textOf(html)).toContain(String(count));
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

    expect(pictures(html)).toEqual([expect.stringMatching(new RegExp(`reward progress.*${READY} rewards ready`, "i"))]);
    expectInOrder(html, ["Reward progress", "Reward ready"]);
  });

  test("monthly cohorts (Pro): the dashboard's grid of first-visit months against 30, 60, 90 and 180 days, a dash where a window has not passed", async () => {
    const html = await render(<CohortsMini />);

    expect(pictures(html)).toEqual([expect.stringMatching(/Monthly cohorts.*first-time customers.*30, 60, 90 and 180 days/)]);
    expectInOrder(html, ["Monthly cohorts", "30 d", "60 d", "90 d", "180 d"]);
    expect(html.match(/data-cohort="[a-z]+"/g)).toHaveLength(6);
    expect(textOf(html)).toContain("–");
    expect(textOf(html)).not.toMatch(/%|Paris|GMT/);
  });

  test("filter by location (Pro): a location picker over one location at a time, with no city", async () => {
    const html = await render(<LocationMini />);

    expect(pictures(html)).toEqual([expect.stringMatching(/Filter by location.*one location at a time/i)]);
    expectInOrder(html, ["Filter by location", "All locations"]);
    expect(textOf(html)).not.toMatch(/Paris|GMT/);
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

describe("recap: the owner's week, in their inbox", () => {
  test("the email is from Stampeo, titled Your week at Aurevo, with four figures and the nudge in the order of the brief", async () => {
    const html = await render(<RecapSection />);
    const { email } = COPY.recap;

    expectInOrder(html, [email.from, email.subject, ...email.figures.flatMap((figure) => [figure.label, figure.value]), email.nudge]);
    expect(pictures(html)).toEqual([expect.stringContaining(email.subject)]);
    expect(email.figures.map((figure) => figure.label)).toEqual(["Stamps given", "New customers", "Returning", "Rewards redeemed"]);
  });

  test("only the stamps carry a trend, and it is the sample café's own visits trend", async () => {
    const html = await render(<RecapSection />);
    const trend = `▲${ANALYTICS.visits.change}%`;

    expect(html.match(/▲/g)).toHaveLength(1);
    expectInOrder(html, ["Stamps given", COPY.recap.email.figures[0].value, trend, "New customers"]);
  });

  test("the two facts sit beside it with no plan: the performance email has no plan gate in PLAN_FACTS to name", async () => {
    const html = await render(<RecapSection />);

    expectInOrder(html, [COPY.recap.email.nudge, ...COPY.recap.facts.map((fact) => fact.text)]);
    expect(COPY.recap.facts.filter((fact) => "plan" in fact)).toEqual([]);
    expect(textOf(html)).not.toMatch(/Growth|Pro\b|Every plan/);
    expect(TIERS.flatMap((tier) => Object.keys(PLAN_FACTS[tier])).filter((key) => /digest|recap|email/i.test(key))).toEqual([]);
  });

  test("the email is stamped in the house ink", async () => {
    expect(await render(<RecapSection />)).toContain("card-stamp");
  });
});


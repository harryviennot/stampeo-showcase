/**
 * The analytics preview (`/us/landing-pages/platform/analytics`): what a visitor sees in each section. The hero's
 * frame, the headers, the order and the tap targets of all six previews are in `pages.test.tsx`; production's blind-spot
 * cards, which this page borrows, are in `blind-spot-cards.test.tsx`.
 */

import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { BlindSpotsSection } from "@/components/landing-pages/feature-previews/analytics/BlindSpotsSection";
import { ChartsSection } from "@/components/landing-pages/feature-previews/analytics/ChartsSection";
import { CustomersSection } from "@/components/landing-pages/feature-previews/analytics/CustomersSection";
import { KeyNumbersCard } from "@/components/landing-pages/feature-previews/analytics/KeyNumbersCard";
import { DeliverAnalytics } from "@/components/landing-pages/platform/DeliverAnalytics";
import { ROOT } from "../../testing/jsx-source";
import { renderPreviewPage, sectionsOf } from "../../testing/preview-page";
import { expectInOrder, pictures, renderEnAsync as render, textOf } from "../../testing/render-en";
import { smallestLabelPx } from "../../testing/stacked-rows";
import { ANALYTICS_PREVIEW as COPY } from "../copy/previews/analytics";
import { ANALYTICS } from "../platform/analytics-figures";
import { CUSTOMER_LIST } from "./analytics-customers";
import {
  BUSIEST,
  COHORTS,
  COHORT_DAYS,
  CUSTOMERS_SEEN,
  HABITS,
  LEVELS,
  LOCATIONS,
  READY,
  SPEND,
  busiestSlots,
  cohortPercent,
  dollars,
} from "./analytics-sample";

const FOLDER = join(ROOT, "components", "landing-pages", "feature-previews", "analytics");

describe("the key-numbers card beside the hero: a month at a glance", () => {
  test("reads, top to bottom: visits, the return rate, new customers, then the visits over time", async () => {
    const html = await render(<KeyNumbersCard />);
    const { numbers } = COPY;

    expectInOrder(html, [
      numbers.title,
      numbers.visits.label,
      numbers.visits.line.replace("{customers}", String(CUSTOMERS_SEEN)),
      ANALYTICS.visits.total.toLocaleString("en-US"),
      `▲${ANALYTICS.visits.change}%`,
      numbers.returnRate.label,
      numbers.returnRate.line,
      `${ANALYTICS.returnRate.percent}%`,
      `▲${ANALYTICS.returnRate.change} pts`,
      numbers.newCustomers.label,
      numbers.newCustomers.line,
      String(ANALYTICS.newCustomers.total),
      `▲${ANALYTICS.newCustomers.change}%`,
      numbers.chart.label,
      ...numbers.chart.legend,
    ]);
  });

  test("draws the thirteen weeks of visits as stacked bars, and is one picture named in the copy", async () => {
    const html = await render(<KeyNumbersCard />);

    expect(html.match(/data-week=/g)).toHaveLength(ANALYTICS.weeks.length);
    expect(pictures(html)).toEqual([COPY.hero.alt]);
  });

  test("its figures are the sample café's own: the same visits and return rate as Platform's dashboard card", async () => {
    const figures = (text: string) => ({
      visits: /Visits\|(?:[^|]*\|)?([\d,]+)\|(▲\d+%)/.exec(text)?.slice(1),
      returnRate: /(?:30-day return rate|Return rate)\|(?:[^|]*\|)?(\d+%)\|(▲\d+ pts)/.exec(text)?.slice(1),
    });
    const card = figures(textOf(await render(<KeyNumbersCard />)));

    expect(card.visits).toBeDefined();
    expect(card.returnRate).toBeDefined();
    expect(card).toEqual(figures(textOf(await render(<DeliverAnalytics />))));
  });
});

describe("blind spots: production's cards, with the preview's own questions", () => {
  test("six questions in the copy's order, each over a ???, under a centred header, in production's tinted band", async () => {
    const html = await render(<BlindSpotsSection />);
    const { eyebrow, title, lead, questions, noAnswer } = COPY.blindSpots;

    expectInOrder(html, [eyebrow, title, lead, ...questions]);
    expect(questions).toHaveLength(6);
    expect(html.match(new RegExp(`>${noAnswer.replaceAll("?", "\\?")}<`, "g"))).toHaveLength(questions.length);
    expect(html).toContain("text-center");
    expect(html).toContain("bg-[var(--blog-bg)]");
  });

  test("they are production's cards: the same inked faces, two columns on a phone and three from md", async () => {
    const html = await render(<BlindSpotsSection />);

    expect(html.match(/blog-card-3d/g)).toHaveLength(12);
    expect(html).toContain("grid-cols-2 md:grid-cols-3");
  });
});

describe("every chart, as a card with its question under its title", () => {
  /** A card's markup: from its own tag up to the next card's (the cards hold lists of their own). */
  const cardOf = (html: string, key: string) => {
    const start = html.search(new RegExp(`<li\\b[^>]*data-chart="${key}"`));
    const next = html.indexOf("<li data-chart=", start + 1);

    return start === -1 ? "" : html.slice(start, next === -1 ? undefined : next);
  };

  test("ten cards in the copy's order, each with its title and its one line, under the page's header", async () => {
    const html = await render(<ChartsSection />);
    const { eyebrow, title, lead, rows } = COPY.charts;

    expect(rows).toHaveLength(10);
    expect(html.match(/<li\b[^>]*data-chart=/g)).toHaveLength(10);
    expectInOrder(html, [eyebrow, title, lead, ...rows.flatMap((row) => [row.title, row.line])]);
    expect(html).toContain('id="charts"');
    expect(html).toContain("text-center");
  });

  test("each card shows one picture of the chart, with a name that says what it shows", async () => {
    const html = await render(<ChartsSection />);

    for (const { key, title } of COPY.charts.rows) {
      const names = pictures(cardOf(html, key));

      expect({ key, pictures: names.length }).toEqual({ key, pictures: 1 });
      expect(names[0].length).toBeGreaterThan(20);
      expect(names[0].startsWith(title)).toBe(true);
    }
  });

  test("every chart is in one colour family: the dashboard's blues, with no orange and no plan", async () => {
    const section = await render(<ChartsSection />);
    const html = section.slice(section.indexOf("<ul"));
    const colours = [...html.matchAll(/#[0-9a-fA-F]{6}\b/g)].map((match) => match[0].toLowerCase());
    const BLUES = ["#0f172a", "#adbbdc", "#eceff7", "#c9d3ea", "#8fa3d1", "#4a63a8", "#1a1a1a", "#8a8a8a"];

    expect(colours.length).toBeGreaterThan(10);
    expect(colours.filter((colour) => !BLUES.includes(colour))).toEqual([]);
    expect(html).not.toContain("var(--accent");
    expect(textOf(html)).not.toMatch(/\b(?:Starter|Growth|Pro)\b|plan/);
  });

  test("a phone reads every label: nothing a chart draws is smaller than 11px", () => {
    for (const file of ["VisitsChart", "NumberCharts", "HabitCharts", "GroupCharts", "ChartsSection"]) {
      expect({ file, px: smallestLabelPx(join(FOLDER, `${file}.tsx`)) >= 11 }).toEqual({ file, px: true });
    }
  });

  test("visits over time: the thirteen weeks on the dashboard's axis, with the dates under them", async () => {
    const card = cardOf(await render(<ChartsSection />), "visits");

    expect(card.match(/data-week=/g)).toHaveLength(ANALYTICS.weeks.length);
    expectInOrder(card, [...COPY.numbers.chart.legend, "260", "195", "130", "65", "Jul 28", "Oct 19"]);
  });

  test("return rate and new customers: the sample's figures", async () => {
    const html = await render(<ChartsSection />);

    expectInOrder(cardOf(html, "returnRate"), [`${ANALYTICS.returnRate.percent}%`]);
    expectInOrder(cardOf(html, "newCustomers"), [String(ANALYTICS.newCustomers.total), COPY.numbers.newCustomers.line]);
  });

  test("busiest times: a week by day and hour, naming the busiest slot and the quietest open hour", async () => {
    const card = cardOf(await render(<ChartsSection />), "busiest");
    const { busiest, quietest } = busiestSlots();

    expect(busiest).toBe("Thursday, 8 AM to 9 AM");
    expect(quietest).toBe("Saturday, 7 AM to 8 AM");
    expectInOrder(card, ["Busiest", busiest, "Quietest open hour", quietest, ...BUSIEST.days, ...BUSIEST.hours, "Fewer visits", "More visits"]);
  });

  test("how often they come: the five groups, from every week to came once, each with its customers", async () => {
    const card = cardOf(await render(<ChartsSection />), "habits");

    expectInOrder(card, HABITS.flatMap((habit) => [habit.label, String(habit.count)]));
  });

  test("reward progress: customers by stamps on their card, the fifth bar the ones with a reward ready, and what the axis counts", async () => {
    const card = cardOf(await render(<ChartsSection />), "rewards");

    expectInOrder(card, ["0-1", "2-3", "4-5", "6-7", "Ready", "Stamps on an 8-stamp card", "Reward ready", String(READY)]);
  });

  test("monthly cohorts: six first-visit months against 30, 60, 90 and 180 days, a dash where a window has not passed", async () => {
    const card = cardOf(await render(<ChartsSection />), "cohorts");
    const text = textOf(card);

    expectInOrder(card, [...COHORT_DAYS.map((days) => `${days} d`), ...COHORTS.map((cohort) => cohort.month)]);
    expect(card.match(/data-cohort="[A-Za-z]+"/g)).toHaveLength(COHORTS.length);
    expect(text).toContain("–");
    expect(text).toContain(`${cohortPercent(COHORTS[5].size, COHORTS[5].back[0])}%`);
  });

  test("levels: the customers on each level, and the moves up month by month", async () => {
    const card = cardOf(await render(<ChartsSection />), "levels");

    expectInOrder(card, LEVELS.flatMap((level) => [level.name, String(level.customers)]));
    expect(textOf(card)).toMatch(/Moves up/);
  });

  test("tracked spend: the total and the average ticket", async () => {
    const card = cardOf(await render(<ChartsSection />), "spend");

    expectInOrder(card, [dollars(SPEND.total), `average ticket ${dollars(SPEND.ticket, true)}`]);
  });

  test("by location: the picker over the locations, each with its visits", async () => {
    const card = cardOf(await render(<ChartsSection />), "locations");

    expectInOrder(card, ["All locations", ...LOCATIONS.flatMap((location) => [location.name, location.visits.toLocaleString("en-US")])]);
    expect(textOf(card)).not.toMatch(/Paris|GMT/);
  });
});

describe("the sample is one café: its charts add up", () => {
  test("the cohorts only grow as their windows lengthen, and never pass the month's new customers", () => {
    for (const { size, back } of COHORTS) {
      expect([...back].sort((a, b) => a - b)).toEqual([...back]);
      expect(Math.max(...back)).toBeLessThanOrEqual(size);
    }
  });

  test("the thirty-day cohorts sit around the return rate of the key numbers", () => {
    const shares = COHORTS.map(({ size, back }) => cohortPercent(size, back[0]));

    expect(Math.min(...shares)).toBeGreaterThanOrEqual(ANALYTICS.returnRate.percent - 5);
    expect(Math.max(...shares)).toBeLessThanOrEqual(ANALYTICS.returnRate.percent + 5);
  });

  test("the levels hold every customer, the locations every visit, and the spend every visit's ticket", () => {
    expect(LEVELS.reduce((sum, level) => sum + level.customers, 0)).toBe(CUSTOMERS_SEEN);
    expect(LOCATIONS.reduce((sum, location) => sum + location.visits, 0)).toBe(ANALYTICS.visits.total);
    expect(SPEND.total).toBe(ANALYTICS.visits.total * SPEND.ticket);
  });
});

describe("your customers: a list like the dashboard's own, and what its groups mean", () => {
  test("the list has the dashboard's columns, in the copy's order, and a row for each customer", async () => {
    const html = await render(<CustomersSection />);
    const heads = [...html.matchAll(/<th\b[^>]*>([\s\S]*?)<\/th>/g)].map((head) => textOf(head[1]).replaceAll("|", "").trim());

    expect(heads).toEqual([...COPY.customers.columns]);
    expect(html.match(/<tr\b[^>]*data-customer=/g)).toHaveLength(CUSTOMER_LIST.length);
  });

  test("each row reads: the customer, their stamps on an 8-stamp card, their segment and when they last came", async () => {
    const html = await render(<CustomersSection />);

    for (const { name, stamps, segment, lastVisit } of CUSTOMER_LIST) {
      const row = html.match(new RegExp(`<tr\\b[^>]*data-customer="${segment}"[\\s\\S]*?</tr>`))?.[0] ?? "";
      const label = COPY.customers.segments.find((candidate) => candidate.key === segment)?.label ?? "";

      expectInOrder(row, [name, `${stamps}/8`, label, lastVisit]);
    }
  });

  test("every segment of the copy is on the list once, in the dashboard's order, each with its meaning beside it", async () => {
    const html = await render(<CustomersSection />);

    expect(CUSTOMER_LIST.map((customer) => customer.segment)).toEqual(COPY.customers.segments.map((segment) => segment.key));
    expectInOrder(html, [COPY.customers.eyebrow, COPY.customers.title, COPY.customers.lead]);
    for (const { label, definition } of COPY.customers.segments) {
      expect(textOf(html)).toContain(`${label}|${definition}`);
    }
    expect(textOf(html)).toContain(COPY.customers.fact);
  });

  test("shows no email, no address and no real name: a sample list", async () => {
    expect(textOf(await render(<CustomersSection />))).not.toMatch(/@|\.com/);
  });
});

describe("the page", () => {
  test("opens on its hero, then the blind spots, the charts, the customers and the dashboard, and closes on its cream card", async () => {
    const html = await renderPreviewPage("platform/analytics");

    expect(sectionsOf(html).map(({ id }) => id)).toEqual(["hero", "blind_spots", "charts", "customers", "dashboard", "final_cta", "related"]);
  });

  test("the hero is the key-numbers card, with the trial and a way down to the charts", async () => {
    const hero = sectionsOf(await renderPreviewPage("platform/analytics")).find(({ id }) => id === "hero")?.html ?? "";

    expect(pictures(hero)).toEqual([COPY.hero.alt]);
    expectInOrder(hero, [COPY.hero.accent, COPY.hero.sub, "Start my free trial", COPY.hero.secondary]);
    expect(hero).toContain('href="#charts"');
    expect(hero).not.toMatch(/en-desktop|en-phone|Sample data/);
  });

  test("the dashboard on a laptop and a phone comes below the charts and the customers, with no caption", async () => {
    const dashboard = sectionsOf(await renderPreviewPage("platform/analytics")).find(({ id }) => id === "dashboard")?.html ?? "";

    expectInOrder(dashboard, [COPY.dashboard.eyebrow, COPY.dashboard.title, COPY.dashboard.lead]);
    expect(dashboard).toMatch(/en-desktop/);
    expect(dashboard).toMatch(/en-phone/);
    expect(textOf(dashboard)).not.toContain("Sample data");
  });

  test("the activity feed, the recap email and the at-a-glance tiles are gone", async () => {
    const text = textOf(await renderPreviewPage("platform/analytics"));

    expect(text).not.toMatch(/Your week at Aurevo|Live activity|At a glance|In your inbox|Every visit, as it happens/);
  });
});

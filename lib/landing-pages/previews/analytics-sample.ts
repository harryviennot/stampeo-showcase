import { fill } from "../format";
import { ANALYTICS } from "../platform/analytics-figures";

/**
 * The numbers behind the analytics preview's charts: the sample café's, read from Platform's `ANALYTICS` (visits,
 * new customers, return rate, the weekly chart) and from its dashboard captures (the habits, the busiest hour).
 * Every total that another chart repeats is derived, so the charts never disagree.
 */

/** The weekly chart's axis top and ticks. */
export const AXIS = { max: 260, ticks: [0, 65, 130, 195, 260] } as const;

/** How often customers come: the dashboard's five groups, from every week to came once, with each one's customers (the page words each group). */
export const HABITS = [
  { key: "weekly", count: 191 },
  { key: "biweekly", count: 125 },
  { key: "monthly", count: 106 },
  { key: "rare", count: 33 },
  { key: "once", count: 205 },
] as const;

/** The customers behind "Visits": everyone who came in the period. */
export const CUSTOMERS_SEEN = HABITS.reduce((customers, habit) => customers + habit.count, 0);

/** Visits by day and hour in a typical week: one step of the ramp per cell, 0 the fewest visits and 4 the most. */
export const BUSIEST = {
  /** `steps[hour][day]`, hours 7 to 12 and days Monday to Sunday. */
  steps: [
    [1, 1, 1, 2, 1, 0, 1],
    [3, 3, 3, 4, 3, 2, 1],
    [3, 2, 3, 3, 3, 2, 1],
    [2, 2, 2, 3, 2, 3, 2],
    [2, 1, 2, 2, 2, 3, 2],
    [2, 2, 2, 2, 3, 3, 3],
  ],
} as const;

/** The words of a slot of the week: the full day names, the hours, the hour that ends the last row, and the template "{day}, {from} to {to}". */
export interface SlotWords {
  fullDays: readonly string[];
  hours: readonly string[];
  lastHourEnd: string;
  slot: string;
}

/** The slot with the most visits and the one with the fewest, each as the dashboard words it: "Thursday, 8 AM to 9 AM". */
export function busiestSlots(words: SlotWords) {
  const cells = BUSIEST.steps.flatMap((row, hour) => row.map((step, day) => ({ step, hour, day })));
  const word = ({ hour, day }: { hour: number; day: number }) =>
    fill(words.slot, { day: words.fullDays[day], from: words.hours[hour], to: words.hours[hour + 1] ?? words.lastHourEnd });
  const busiest = cells.reduce((best, cell) => (cell.step > best.step ? cell : best));
  const quietest = cells.reduce((least, cell) => (cell.step < least.step ? cell : least));

  return { busiest: word(busiest), quietest: word(quietest) };
}

/** Customers by stamps on their 8-stamp card: still coming, and not back for 30 days or more. */
export const PROGRESS = [
  { label: "0-1", still: 250, gone: 60 },
  { label: "2-3", still: 210, gone: 30 },
  { label: "4-5", still: 165, gone: 15 },
  { label: "6-7", still: 120, gone: 5 },
] as const;

/** The customers with a reward ready to claim. */
export const READY = 22;

/**
 * Each first-visit month's new customers (newest month first, the page words the months) and how many of them came back
 * within 30, 60, 90 and 180 days; a window that has not passed yet is left out. A month's count only grows as its windows lengthen.
 */
export const COHORT_DAYS = [30, 60, 90, 180] as const;
export const COHORTS = [
  { size: 148, back: [88] },
  { size: 160, back: [97, 108] },
  { size: 152, back: [92, 105, 112] },
  { size: 143, back: [88, 99, 106] },
  { size: 128, back: [79, 88, 95, 99] },
  { size: 121, back: [73, 83, 90, 95] },
] as const;

/** A window's share of its month's new customers, as a whole percent. */
export const cohortPercent = (size: number, back: number) => Math.round((100 * back) / size);

/** Customers on each level today (Bronze, Silver, Gold: the page words them), and how many moved up a level in each of the last six months (oldest first). */
export const LEVELS = [{ customers: 412 }, { customers: 168 }, { customers: 80 }] as const;
export const LEVEL_MOVES = [{ count: 9 }, { count: 14 }, { count: 11 }, { count: 17 }, { count: 15 }, { count: 19 }] as const;

/** The average ticket the team enters at the counter; the tracked spend is every visit's. */
export const TICKET = 14;
export const SPEND = { total: ANALYTICS.visits.total * TICKET, ticket: TICKET } as const;

/** The visits at each of the two locations (the page names them): they add up to the page's visits. */
export const LOCATIONS = [{ visits: 1610 }, { visits: ANALYTICS.visits.total - 1610 }] as const;

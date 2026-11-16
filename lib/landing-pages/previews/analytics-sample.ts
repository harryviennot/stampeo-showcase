import { ANALYTICS } from "../platform/analytics-figures";

/**
 * The numbers behind the analytics preview's charts: the sample café's, read from Platform's `ANALYTICS` (visits,
 * new customers, return rate, the weekly chart) and from its dashboard captures (the habits, the busiest hour).
 * Every total that another chart repeats is derived, so the charts never disagree.
 */

/** The weekly chart's axis top and the dates the dashboard prints under every second bar. */
export const AXIS = { max: 260, ticks: [0, 65, 130, 195, 260] } as const;
export const WEEK_LABELS = ["Jul 28", "Aug 10", "Aug 24", "Sep 7", "Sep 21", "Oct 5", "Oct 19"] as const;

/** How often customers come: the dashboard's five groups, from every week to came once, with each one's customers. */
export const HABITS = [
  { key: "weekly", label: "About every week", count: 191 },
  { key: "biweekly", label: "Every 2 weeks", count: 125 },
  { key: "monthly", label: "About once a month", count: 106 },
  { key: "rare", label: "Less often", count: 33 },
  { key: "once", label: "Came once", count: 205 },
] as const;

/** The customers behind "Visits": everyone who came in the period. */
export const CUSTOMERS_SEEN = HABITS.reduce((customers, habit) => customers + habit.count, 0);

/** Visits by day and hour in a typical week: one step of the ramp per cell, 0 the fewest visits and 4 the most. */
export const BUSIEST = {
  days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  fullDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  hours: ["7 AM", "8 AM", "9 AM", "10 AM", "11 AM", "12 PM"],
  /** `steps[hour][day]`. */
  steps: [
    [1, 1, 1, 2, 1, 0, 1],
    [3, 3, 3, 4, 3, 2, 1],
    [3, 2, 3, 3, 3, 2, 1],
    [2, 2, 2, 3, 2, 3, 2],
    [2, 1, 2, 2, 2, 3, 2],
    [2, 2, 2, 2, 3, 3, 3],
  ],
} as const;

/** The slot with the most visits and the one with the fewest, each as the dashboard words it: "Thursday, 8 AM to 9 AM". */
export function busiestSlots() {
  const cells = BUSIEST.steps.flatMap((row, hour) => row.map((step, day) => ({ step, hour, day })));
  const word = ({ hour, day }: { hour: number; day: number }) => {
    const next = BUSIEST.hours[hour + 1] ?? "1 PM";

    return `${BUSIEST.fullDays[day]}, ${BUSIEST.hours[hour]} to ${next}`;
  };
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
 * Each first-visit month's new customers and how many of them came back within 30, 60, 90 and 180 days; a window
 * that has not passed yet is left out. A month's count only grows as its windows lengthen.
 */
export const COHORT_DAYS = [30, 60, 90, 180] as const;
export const COHORTS = [
  { month: "Sep", size: 148, back: [88] },
  { month: "Aug", size: 160, back: [97, 108] },
  { month: "Jul", size: 152, back: [92, 105, 112] },
  { month: "Jun", size: 143, back: [88, 99, 106] },
  { month: "May", size: 128, back: [79, 88, 95, 99] },
  { month: "Apr", size: 121, back: [73, 83, 90, 95] },
] as const;

/** A window's share of its month's new customers, as a whole percent. */
export const cohortPercent = (size: number, back: number) => Math.round((100 * back) / size);

/** Customers on each level today, and how many moved up a level in each of the last six months. */
export const LEVELS = [
  { name: "Bronze", customers: 412 },
  { name: "Silver", customers: 168 },
  { name: "Gold", customers: 80 },
] as const;
export const LEVEL_MOVES = [
  { month: "May", count: 9 },
  { month: "Jun", count: 14 },
  { month: "Jul", count: 11 },
  { month: "Aug", count: 17 },
  { month: "Sep", count: 15 },
  { month: "Oct", count: 19 },
] as const;

/** The average ticket the team enters at the counter; the tracked spend is every visit's. */
export const TICKET = 14;
export const SPEND = { total: ANALYTICS.visits.total * TICKET, ticket: TICKET } as const;

/** Two locations and the visits at each: they add up to the page's visits. */
export const LOCATIONS = [
  { name: "Main Street", visits: 1610 },
  { name: "Harbor Road", visits: ANALYTICS.visits.total - 1610 },
] as const;

/** A US dollar amount as the dashboard prints it. */
export const dollars = (amount: number, cents = false) =>
  amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: cents ? 2 : 0,
  });

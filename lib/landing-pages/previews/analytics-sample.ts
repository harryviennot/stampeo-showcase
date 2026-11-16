import { ANALYTICS_PREVIEW } from "@/lib/landing-pages/copy/previews/analytics";
import { ANALYTICS } from "@/components/landing-pages/platform/DeliverAnalytics";
import { HABITS, READY } from "@/components/landing-pages/feature-previews/analytics/QuestionMinis";

/**
 * The sample café's answers, read from the numbers its dashboard draws: Platform's `ANALYTICS` for visits, new
 * customers and the return rate, the habits chart for the regulars and the progress chart for the rewards.
 */

type BlindSpotKey = (typeof ANALYTICS_PREVIEW.blindSpots.cards)[number]["key"];

/** The share of the customers seen who come at least every two weeks: the first two groups of the habits chart. */
const REGULARS_PERCENT = Math.round(
  (100 * (HABITS[0].count + HABITS[1].count)) / HABITS.reduce((customers, habit) => customers + habit.count, 0),
);

const trend = (change: number) => `▲${change}%`;

/** What each card answers: its figure (a card whose figure is a word has it in the copy) and, where the dashboard shows one, its trend. */
export const ANSWERS: Record<BlindSpotKey, { figure?: string; trend?: string }> = {
  working: { figure: ANALYTICS.visits.total.toLocaleString("en-US"), trend: trend(ANALYTICS.visits.change) },
  return: { figure: `${ANALYTICS.returnRate.percent}%` },
  regulars: { figure: `${REGULARS_PERCENT}%` },
  busiest: {},
  rewards: { figure: String(READY) },
  new: { figure: String(ANALYTICS.newCustomers.total), trend: trend(ANALYTICS.newCustomers.change) },
};

/** The week-on-week trend the performance email prints under its stamps: the sample café's own visits trend. */
export const EMAIL_TREND = trend(ANALYTICS.visits.change);

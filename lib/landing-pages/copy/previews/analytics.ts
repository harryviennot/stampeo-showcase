import type { BandCopy, EyebrowSection, HeroCopy, PageMeta } from "../types";

/** One chart of the dashboard: its name and the one line that says what it answers. */
interface ChartCopy {
  key:
    | "visits"
    | "returnRate"
    | "newCustomers"
    | "busiest"
    | "habits"
    | "rewards"
    | "cohorts"
    | "levels"
    | "spend"
    | "locations";
  title: string;
  line: string;
}

/** The analytics preview: a loyalty program's numbers, filled in by every scan. */
export const ANALYTICS_PREVIEW = {
  meta: {
    title: "Loyalty program analytics: visits and return rate | Stampeo",
    description:
      "Loyalty program analytics for small businesses: visits, return rate, new customers and your busiest hours, filled in by every scan. Free trial.",
  } satisfies PageMeta,
  hero: {
    h1: "Loyalty program analytics for your shop.",
    accent: "analytics",
    sub: "See visits, return rate, new customers and your busiest hours. Every scan fills it in.",
    secondary: "See every chart",
    alt: "A key-numbers card from the Stampeo dashboard: visits, return rate, new customers and a chart of visits over time.",
  } satisfies HeroCopy & { secondary: string; alt: string },
  /** The key-numbers card beside the hero's words; `{customers}` is filled with the sample's customer count. */
  numbers: {
    title: "Last three months",
    visits: { label: "Visits", line: "from {customers} customers" },
    returnRate: { label: "Return rate", line: "of first-time customers came back within a month" },
    newCustomers: { label: "New customers", line: "signed up" },
    chart: { label: "Visits over time", legend: ["Returning", "First visit"] },
  },
  blindSpots: {
    eyebrow: "With paper cards",
    title: "What you don't know today.",
    lead: "With paper cards, you run loyalty blind: no data, and no way to improve it.",
    questions: [
      "How many regular customers?",
      "How often do they come back?",
      "How many stopped coming?",
      "Which day is quietest?",
      "How many rewards this month?",
      "Is your program working?",
    ],
    noAnswer: "???",
  },
  charts: {
    eyebrow: "Every chart",
    title: "Loyalty program analytics, chart by chart.",
    lead: "Each chart answers one question about your customers. Every scan fills it in.",
    rows: [
      { key: "visits", title: "Visits over time", line: "Every visit, week by week, split into first visits and returning customers." },
      { key: "returnRate", title: "Return rate", line: "How many first-time customers came back within a month." },
      { key: "newCustomers", title: "New customers", line: "How many people joined your card." },
      { key: "busiest", title: "Busiest times", line: "Your visits by day and hour, with your busiest slot and quietest open hour." },
      { key: "habits", title: "How often they come", line: "Who comes every week, every two weeks, about once a month, or came once." },
      { key: "rewards", title: "Reward progress", line: "How close each customer is to a reward, and who has one ready." },
      { key: "cohorts", title: "Monthly cohorts", line: "Of each month's new customers, how many came back, and how soon." },
      { key: "levels", title: "Levels", line: "How many customers are on each level, and how many move up each month." },
      { key: "spend", title: "Tracked spend", line: "On a points card: what your team enters at the counter, and your average ticket." },
      { key: "locations", title: "By location", line: "Every chart for one shop at a time, when you have more than one." },
    ] satisfies ChartCopy[],
  } satisfies EyebrowSection & { eyebrow: string; rows: ChartCopy[] },
  customers: {
    eyebrow: "Your customers",
    title: "Your customer list, sorted into groups.",
    lead: "See who's new, who's a regular, and who hasn't been back in a while.",
    columns: ["Name", "Stamps", "Segment", "Last visit"],
    segments: [
      { key: "new", label: "New", definition: "joined in the last two weeks" },
      { key: "regular", label: "Regular", definition: "keeps coming back" },
      { key: "vip", label: "VIP", definition: "has redeemed three rewards or more" },
      { key: "rewardReady", label: "Reward ready", definition: "has a reward to claim now" },
      { key: "closeToReward", label: "Close to reward", definition: "two stamps or fewer from it" },
      { key: "atRisk", label: "At risk", definition: "hasn't been back in over a month" },
      { key: "ghost", label: "Ghost", definition: "got the card, never came back" },
    ],
    fact: "Download your customer list anytime, as a CSV file.",
  },
  dashboard: {
    eyebrow: "Laptop and phone",
    title: "Your numbers on your laptop or your phone.",
    lead: "The same dashboard on both. Check your numbers from anywhere.",
  } satisfies EyebrowSection & { eyebrow: string },
  band: {
    title: "Stop guessing. Start knowing.",
    accent: "Start knowing.",
    sub: "Your analytics fill in from the first card you scan.",
  } satisfies BandCopy,
} as const;

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
    /** The seven customers of the list, in the order of `segments` (each one is in its segment): their name and when they last came. */
    people: [
      { name: "Maya Chen", lastVisit: "Today" },
      { name: "Daniel Brooks", lastVisit: "Yesterday" },
      { name: "Priya Nair", lastVisit: "2d ago" },
      { name: "Tom Alvarez", lastVisit: "3d ago" },
      { name: "Hannah Cole", lastVisit: "1w ago" },
      { name: "Marcus Reed", lastVisit: "7w ago" },
      { name: "Ellie Park", lastVisit: "3mo ago" },
    ],
  },
  /** The sample café's chart data, in words: the dates, days and hours the dashboard prints, and the groups it counts. */
  sample: {
    /** The dates under every second bar of the weekly chart (seven, oldest first). */
    weekLabels: ["Jul 28", "Aug 10", "Aug 24", "Sep 7", "Sep 21", "Oct 5", "Oct 19"],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    fullDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    /** The hours of the busiest-times chart, 7 to 12, and the hour that ends the last row. */
    hours: ["7 AM", "8 AM", "9 AM", "10 AM", "11 AM", "12 PM"],
    lastHourEnd: "1 PM",
    /** How often they come, from every week to came once. */
    habits: ["About every week", "Every 2 weeks", "About once a month", "Less often", "Came once"],
    /** The months of the monthly cohorts, newest first. */
    cohortMonths: ["Sep", "Aug", "Jul", "Jun", "May", "Apr"],
    /** The months of the level moves, oldest first. */
    moveMonths: ["May", "Jun", "Jul", "Aug", "Sep", "Oct"],
    /** The two locations of the "By location" chart. */
    locations: ["Main Street", "Harbor Road"],
    /** The word that joins the last two of a list read out for a screen reader. */
    and: "and",
  },
  /**
   * The words printed on and read out for each chart. The `alt` lines fill the tokens each one names; `{count}` and
   * `{amount}` are numbers and money written as the page's language writes them.
   */
  chartWords: {
    visits: { alt: "{label}: {total} visits over {weeks} weeks, {share}% from returning customers." },
    returnRate: { alt: "Return rate: {percent}% of first-time customers came back within a month." },
    newCustomers: { alt: "New customers: {total} signed up." },
    busiest: {
      busiest: "Busiest",
      quietest: "Quietest open hour",
      fewer: "Fewer visits",
      more: "More visits",
      /** A slot of the week: `{day}`, `{from}` and `{to}` the hours. */
      slot: "{day}, {from} to {to}",
      alt: "Busiest times: visits by day and hour in a typical week, busiest {busiest}, quietest open hour {quietest}.",
    },
    habits: {
      alt: "How often they come: {list}.",
      note: "Each customer counts once, by their own usual gap between visits.",
    },
    rewards: {
      alt: "Reward progress: customers by stamps on their card, with {ready} rewards ready.",
      ready: "Ready",
      stamps: "Stamps on an {count}-stamp card",
      stillComing: "Still coming",
      notBack: "Not back for 30+ days",
      rewardReady: "Reward ready",
    },
    cohorts: {
      alt: "Monthly cohorts: of each month's first-time customers, the share who came back within {days} days.",
      /** A window's heading: `{days}` is 30, 60, 90 or 180. */
      window: "{days} d",
      note: "A dash means that window has not passed yet.",
    },
    levels: {
      alt: "Levels: {levels}, and the customers who moved up each month.",
      /** One level's count in `alt`. */
      on: "{customers} customers on {level}",
      moves: "Moves up per month",
    },
    spend: {
      alt: "Tracked spend: {total}, {ticket}.",
      ticket: "average ticket {amount}",
    },
    locations: {
      all: "All locations",
      alt: "By location: a picker over {locations}.",
      /** One location in `alt`. */
      item: "{name}, {visits} visits",
    },
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

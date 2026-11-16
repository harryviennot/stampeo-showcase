import { PLAN_FACTS, analyticsHistoryLabel } from "../../../plans/plan-facts";
import type { BandCopy, Fact, PageMeta, PreviewHeroCopy, RowCopy, SectionCopy, TabCopy } from "../types";

/** A plan's history as the pair the ladder prints in handwriting: "30" over "days", "1" over "year". */
function history(days: number | "unlimited"): { value: string; unit: string } {
  const [value, unit = ""] = analyticsHistoryLabel(days).split(" ");

  return { value, unit };
}

/** The analytics preview: will I see whether the card works, with nothing to type. */
export const ANALYTICS_PREVIEW = {
  meta: {
    title: "Loyalty analytics: visits, return rate and busy hours | Stampeo",
    description:
      "See how often your customers come back: visits, return rate and your busiest hours, filled in by every scan. Free trial, cancel anytime.",
  } satisfies PageMeta,
  hero: {
    eyebrow: "Analytics",
    h1: "See how often your customers come back.",
    accent: "come back.",
    sub: "Visits, return rate and your busiest hours. Every scan fills it in.",
  } satisfies PreviewHeroCopy,
  /**
   * The six questions a paper card cannot answer, and what the dashboard answers. A card's number is the page's
   * sample (Platform's `ANALYTICS` and the dashboard's own sentences), so only its words are here: `line` is the
   * grey line under the figure, and `figure` is set when the answer is a word rather than a number.
   */
  blindSpots: {
    eyebrow: "What you know today",
    title: "What a paper card can't tell you.",
    lead: "Six questions every owner asks. Flip to see the answers.",
    toggle: { label: "How you keep track", paper: "With a paper card", stampeo: "With Stampeo" },
    /** What every card says with a paper card. */
    unknown: "???",
    cards: [
      { key: "working", question: "Is my program working?", line: "visits in the last three months" },
      { key: "return", question: "Do they come back?", line: "came back within a month" },
      { key: "regulars", question: "How many are regulars?", line: "come at least every two weeks" },
      { key: "busiest", question: "When is it busiest?", figure: "Thursday", line: "8 to 9 AM" },
      { key: "rewards", question: "Who has a reward waiting?", line: "customers have a reward waiting" },
      { key: "new", question: "Who's new?", line: "new customers" },
    ] satisfies Array<{
      key: "working" | "return" | "regulars" | "busiest" | "rewards" | "new";
      question: string;
      figure?: string;
      line: string;
    }>,
  },
  glance: {
    eyebrow: "At a glance",
    title: "Your numbers, updated with every scan.",
    lead: "Visits, new customers and your return rate, on every plan.",
    tab: {
      title: "What you see from day one",
      facts: [
        { text: "Visits and new customers, with the trend" },
        { text: "Your return rate for the past month" },
        { text: "Visits over time, week by week" },
        { text: "A recap in your inbox, weekly or monthly" },
      ] satisfies Fact[],
    },
  } satisfies SectionCopy & { eyebrow: string; tab: { title: string; facts: Fact[] } },
  questions: {
    eyebrow: "Answers",
    title: "What a paper card can't tell you.",
    lead: "Each question has its own chart, filled in by every scan.",
    rows: [
      {
        key: "return",
        eyebrow: "Are they coming back?",
        title: "Return rate",
        body: "The share of customers who came back within a month, and its trend.",
      },
      {
        key: "habits",
        eyebrow: "How often do they come?",
        title: "Visit habits",
        body: "Every week, every two weeks, once a month: see how your customers split.",
        plan: "Growth and Pro",
      },
      {
        key: "busiest",
        eyebrow: "When is it quiet?",
        title: "Busiest times",
        body: "Visits by day and hour, with your busiest slot and quietest open hour.",
        plan: "Growth and Pro",
      },
      {
        key: "rewards",
        eyebrow: "Who's close to a reward?",
        title: "Reward progress",
        body: "Where customers are on their card, and how many rewards are waiting.",
        plan: "Growth and Pro",
      },
    ] satisfies RowCopy<"return" | "habits" | "busiest" | "rewards">[],
    /** Under the rows: what Starter shows in place of the charts. */
    closer: "Starter shows these in a sentence; Growth and Pro chart them.",
  },
  activity: {
    eyebrow: "Your customers",
    title: "Know who's in, and who's slipping away.",
    lead: "Watch visits as they happen, and see which customers to win back.",
    tabs: {
      live: {
        label: "Live activity",
        title: "Every visit, as it happens",
        facts: [{ text: "Stamps, rewards and new cards, with no refresh" }, { text: "On your phone or your computer" }] satisfies Fact[],
      },
      customers: {
        label: "Your customers",
        title: "Regulars, VIPs and who's slipping",
        facts: [
          { text: "New, Regular, VIP, At risk and Ghost, sorted for you" },
          { text: "Who has a reward ready or is close to one" },
          { text: "Download your customer list anytime" },
        ] satisfies Fact[],
      },
    } satisfies Record<"live" | "customers", TabCopy>,
  },
  /** What each plan shows, from Starter's one-line answers to Pro's cohorts, cheapest plan first; the history is `PLAN_FACTS`'. */
  ladder: {
    eyebrow: "By plan",
    title: "Every plan answers. Growth and Pro chart it.",
    lead: "Starter answers in a sentence. Growth and Pro chart it and look further back.",
    toggleLabel: "Plan",
    plans: [
      { label: "Starter", history: history(PLAN_FACTS.starter.analyticsHistoryDays) },
      { label: "Growth", history: history(PLAN_FACTS.growth.analyticsHistoryDays) },
      { label: "Pro", history: history(PLAN_FACTS.pro.analyticsHistoryDays) },
    ],
    /** The three questions every plan answers; Starter answers each in a sentence. */
    rows: [
      { key: "busiest", title: "Busiest times" },
      { key: "habits", title: "How often they come" },
      { key: "rewards", title: "Reward progress" },
    ],
    /** What Pro adds under them. */
    proRows: [
      { key: "cohorts", title: "Monthly cohorts" },
      { key: "location", title: "Filter by location" },
    ],
    /** Printed with a lock on Starter's rows. */
    locked: "The chart is on Growth and Pro",
  },
  /** The owner's performance email: its figures are the page's sample, like the dashboard's. */
  recap: {
    eyebrow: "In your inbox",
    title: "Your numbers come to you.",
    lead: "A weekly digest when you're busy, a monthly recap otherwise.",
    email: {
      from: "Stampeo",
      subject: "Your week at Aurevo",
      figures: [
        { label: "Stamps given", value: "642" },
        { label: "New customers", value: "38" },
        { label: "Returning", value: "211" },
        { label: "Rewards redeemed", value: "19" },
      ],
      nudge: "12 customers are close to a reward",
    },
    facts: [{ text: "Weekly when you're busy, monthly otherwise" }, { text: "Unsubscribe anytime" }] satisfies Fact[],
  },
  numbers: {
    eyebrow: "History",
    title: "Look back as far as your plan goes.",
    /** Each plan's own history (`PLAN_FACTS`), 365 days with monthly cohorts on Pro. */
    figures: [
      { value: String(PLAN_FACTS.starter.analyticsHistoryDays), label: "days of history on Starter" },
      { value: String(PLAN_FACTS.growth.analyticsHistoryDays), label: "days on Growth" },
      { value: String(PLAN_FACTS.pro.analyticsHistoryDays), label: "days on Pro, with monthly cohorts" },
    ],
  },
  band: {
    title: "Stop guessing. Start knowing.",
    accent: "Start knowing.",
    sub: "Your numbers start with your first stamp, on every plan.",
  } satisfies BandCopy,
} as const;

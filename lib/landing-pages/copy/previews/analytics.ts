import { PLAN_FACTS } from "../../../plans/plan-facts";
import type { BandCopy, Fact, PageMeta, PreviewHeroCopy, RowCopy, SectionCopy, TabCopy } from "../types";

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

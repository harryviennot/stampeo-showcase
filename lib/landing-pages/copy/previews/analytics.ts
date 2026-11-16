import type { BandCopy, Fact, HeroCopy, PageMeta, SectionCopy, TabCopy } from "../types";

/** The analytics preview: will I see whether the card works, with nothing to type. */
export const ANALYTICS_PREVIEW = {
  meta: {
    title: "Loyalty analytics: visits, return rate and busy hours | Stampeo",
    description:
      "See how often your customers come back: visits, return rate and your busiest hours, filled in by every scan. Free trial, cancel anytime.",
  } satisfies PageMeta,
  hero: {
    h1: "See how often your customers come back.",
    accent: "come back.",
    sub: "Visits, return rate and your busiest hours. Every scan fills it in.",
  } satisfies HeroCopy,
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
    lead: "Visits, new customers and your return rate.",
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
  /** The owner's performance email: its figures are the page's sample, like the dashboard's. */
  recap: {
    eyebrow: "In your inbox",
    title: "Your numbers come to you.",
    lead: "A weekly digest when you're busy, a monthly recap otherwise.",
    email: {
      from: "Stampeo",
      subject: "Your week at Aurevo",
      figures: [
        { label: "Stamps given", value: "256" },
        { label: "New customers", value: "38" },
        { label: "Returning", value: "211" },
        { label: "Rewards redeemed", value: "19" },
      ],
      nudge: "12 customers are close to a reward",
    },
    facts: [{ text: "Weekly when you're busy, monthly otherwise" }, { text: "Unsubscribe anytime" }] satisfies Fact[],
  },
  band: {
    title: "Stop guessing. Start knowing.",
    accent: "Start knowing.",
    sub: "Your numbers start with your first stamp.",
  } satisfies BandCopy,
} as const;

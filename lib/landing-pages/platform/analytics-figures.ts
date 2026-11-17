/**
 * Aurevo's analytics, drawn: the figures are illustrative and match the
 * dashboard captures (90 days: 2,770 visits up 17%, 460 new customers up 11%,
 * 83% of the visits from returning customers, a 61% 30-day return rate up 2
 * points). The feature previews' drawn dashboards read these same numbers.
 */
export const ANALYTICS = {
  visits: { total: 2770, change: 17 },
  newCustomers: { total: 460, change: 11 },
  returnRate: { percent: 61, change: 2 },
  /** The 13 weeks of the "visits over time" chart, oldest first. */
  weeks: [
    { returning: 137, first: 25 },
    { returning: 164, first: 27 },
    { returning: 134, first: 22 },
    { returning: 143, first: 23 },
    { returning: 172, first: 30 },
    { returning: 170, first: 43 },
    { returning: 192, first: 46 },
    { returning: 181, first: 46 },
    { returning: 189, first: 48 },
    { returning: 207, first: 40 },
    { returning: 200, first: 35 },
    { returning: 210, first: 37 },
    { returning: 213, first: 36 },
  ],
} as const;

/** The dashboard's chart and trend colours, as its captures show them. */
export const INK = { navy: "#0f172a", periwinkle: "#adbbdc", up: "#2e9e5b", figure: "#1a1a1a", label: "#8a8a8a" } as const;

/**
 * Stampeo production figures that the site may quote.
 *
 * Read-only queries on production, all markets combined, pulled 2026-10-09
 * (SQL and cohort rules: docs/audits/2026-10-09-seo-geo/evidence/barometer-data.md
 * in the workspace). Values are rounded down. Anything quoted from here carries
 * `sourceLine(locale)`. Not publishable from this data: broadcast uplift,
 * France-only or US-only figures, and stamps-vs-points comparisons.
 */

export interface BenchmarkFigure {
  value: number;
  unit: "%" | "days" | "stamps";
  /** What the value measures, in English. */
  measures: string;
  /** The sample behind this value. */
  n: string;
}

export const BENCHMARK = {
  walletAddRate: {
    value: 88,
    unit: "%",
    measures: "customers who join and add the card to their phone wallet",
    n: "6,816 customers since 1 Jul 2026, 79 businesses",
  },
  appleShare: {
    value: 82,
    unit: "%",
    measures: "detected wallet adds that are Apple Wallet (the rest are Google Wallet)",
    n: "6,020 adds",
  },
  installedDay30: {
    value: 98,
    unit: "%",
    measures: "cards still in the wallet 30 days after being added",
    n: "4,406 installs",
  },
  installedDay90: {
    value: 95,
    unit: "%",
    measures: "cards still in the wallet 90 days after being added",
    n: "856 installs",
  },
  return30: {
    value: 32,
    unit: "%",
    measures: "customers who come back within 30 days of their first visit (about 1 in 3)",
    n: "3,213 customers, 86 businesses",
  },
  medianDaysToSecondVisit: {
    value: 11,
    unit: "days",
    measures: "median days between a returning customer's first and second visit",
    n: "1,693 returning customers",
  },
  redeemedShare: {
    value: 92,
    unit: "%",
    measures: "full cards whose reward is redeemed",
    n: "223 cards, 40 businesses",
  },
  medianStampsPerCard: {
    value: 9,
    unit: "stamps",
    measures: "median stamps needed for a reward (10 is the product default)",
    n: "stamp programs among the 86 qualifying businesses",
  },
} as const satisfies Record<string, BenchmarkFigure>;

export const BENCHMARK_SAMPLE = {
  businesses: 86,
  period: "Feb–Oct 2026",
  pulledOn: "2026-10-09",
  method:
    "A business qualifies with at least 10 real customers and at least 10 scanner scans. " +
    "Founder-owned and test businesses and staff cards are excluded. All markets combined. " +
    "A visit is a distinct customer and local date.",
} as const;

const POLISH_FIRM: Partial<Record<Intl.LDMLPluralRule, string>> = {
  one: "firma",
  few: "firmy",
  many: "firm",
};

/** How each locale names the sample. Polish agrees its noun with the count. */
const SOURCE_LINES: Record<string, (businesses: number) => string> = {
  en: (n) => `Stampeo data, ${n} ${n === 1 ? "business" : "businesses"}, Feb–Oct 2026`,
  fr: (n) => `Données Stampeo, ${n} ${n === 1 ? "commerce" : "commerces"}, févr.–oct. 2026`,
  es: (n) => `Datos de Stampeo, ${n} ${n === 1 ? "comercio" : "comercios"}, feb.–oct. 2026`,
  pl: (n) => `Dane Stampeo, ${n} ${POLISH_FIRM[new Intl.PluralRules("pl").select(n)] ?? "firm"}, luty–październik 2026`,
};

/** "Stampeo data, 86 businesses, Feb–Oct 2026", in the reader's language. */
export function sourceLine(locale: string, businesses: number = BENCHMARK_SAMPLE.businesses): string {
  return (SOURCE_LINES[locale] ?? SOURCE_LINES.en)(businesses);
}

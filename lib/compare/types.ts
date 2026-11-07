/**
 * Shapes shared by the comparison pages ("Stampeo vs X").
 *
 * A page belongs to one market: `us` (English, /us/vs/<slug>) or `fr` (French,
 * /comparatif/<slug>). These are not the site-wide markets of `lib/markets.ts`.
 */

export type Market = "us" | "fr";

/** The most characters a fact's `short` value may have. */
export const SHORT_MAX_LENGTH = 40;

/** One thing we say about a competitor, with the proof. */
export interface SourcedFact {
  /** A standard row id (`price.entry`) or a competitor-specific id (`support.hours`). */
  id: string;
  /** What the table and prose show, written in the market's language. */
  value: string;
  /** The table's at-a-glance version of `value`: same facts and qualifiers, one line of at most `SHORT_MAX_LENGTH` characters. */
  short?: string;
  /** An https page the fact was read from. */
  sourceUrl: string;
  sourceTitle: string;
  /** The words on that page the fact rests on. */
  quote: string;
  /** `YYYY-MM-DD`, the day the source was read. */
  checkedAt: string;
}

export interface CompetitorMarketFacts {
  /** The competitor's pricing page; validated, not rendered. */
  pricingUrl: string;
  facts: SourcedFact[];
}

export interface CompetitorFacts {
  /** The slug-like id a page names in its frontmatter (`competitor:`). */
  id: string;
  name: string;
  website: string;
  markets: Partial<Record<Market, CompetitorMarketFacts>>;
}

/** The table rows every comparison uses, in display order. */
export const STANDARD_FACT_IDS = [
  "card.where",
  "customer.app_required",
  "program.types",
  "push.automatic",
  "push.broadcasts",
  "staff.scanning",
  "pos.integration",
  "locations.multiple",
  "languages",
  "price.entry",
  "trial",
  "commitment",
  "export",
  "designer",
] as const;

export type StandardFactId = (typeof STANDARD_FACT_IDS)[number];

/** The four themes the table rows are grouped into, in display order. */
export const ROW_GROUP_IDS = ["customer", "program", "counter", "price"] as const;

export type RowGroupId = (typeof ROW_GROUP_IDS)[number];

export interface ComparisonFaq {
  question: string;
  answer: string;
}

/** A comparison page as loaded from `content/compare/<locale>/<slug>.mdx`. */
export interface ComparisonPage {
  market: Market;
  /** The content folder the file sits in: `en` for `us`, `fr` for `fr`. */
  locale: "en" | "fr";
  slug: string;
  /** The id of the competitor in the facts registry. */
  competitor: string;
  title: string;
  description: string;
  faqs: ComparisonFaq[];
  /** A draft is noindex and absent from the sitemap, llms.txt and the other-comparisons list. */
  draft: boolean;
  /** The MDX body, frontmatter removed. */
  content: string;
}

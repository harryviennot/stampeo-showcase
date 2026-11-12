/**
 * The shapes of the copy on the /us/landing-pages/* pages. These pages are
 * written in US English only, so their words live in TypeScript next to the
 * code rather than in the catalogs that every locale shares.
 *
 * Prices and the trial length are never written out: `{trialDays}` and the
 * price tokens are filled in by `RegionText`.
 */

export interface PageMeta {
  title: string;
  description: string;
}

export interface HeroCopy {
  h1: string;
  /** The words of the H1 drawn in the accent colour; a substring of `h1`. */
  accent: string;
  sub: string;
}

export interface SectionCopy {
  title: string;
  lead: string;
}

/** A third-party figure, printed with its source under it. */
export interface SourcedFigure {
  /** The large mark drawn above the claim, e.g. "6×". */
  value?: string;
  text: string;
  source: string;
}

/** A lock-screen notification as a customer receives it from a business. */
export interface Banner {
  /** The business the card belongs to, never "Stampeo": the card carries no Stampeo mark. */
  sender: string;
  body: string;
}

export interface Step {
  title: string;
  body: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FinalCtaCopy {
  title: string;
  accent: string;
}

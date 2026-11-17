/**
 * The shapes of the copy of Platform and its seven pages. Their words live in
 * TypeScript next to the code, in every language, rather than in the catalogs
 * that every locale shares.
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

/** The closing card of a Platform-style page: the headline, its accent words and one line under it. */
export interface BandCopy extends FinalCtaCopy {
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

/** A section header with a small label above the h2 (the Platform page's pattern). */
export interface EyebrowSection extends SectionCopy {
  eyebrow: string;
}

export interface Fact {
  text: string;
}

/** A titled tile in a grid or list. */
export interface Tile {
  title: string;
  body: string;
}

/** One of the three program types: stamps, points or levels. */
export interface ProgramType {
  key: "stamps" | "points" | "levels";
  /** The tab label. */
  label: string;
  /** The small label above the title on the Platform rows. */
  eyebrow: string;
  title: string;
  body: string;
  facts: Fact[];
}

/** One moment of the notification sequence: what happened, and the banner it sends. */
export interface Moment {
  title: string;
  description: string;
  banner: Banner;
}

/** One row of the hover rows: a label, a title and its text. */
export interface RowCopy<Key extends string = string> {
  key: Key;
  eyebrow: string;
  title: string;
  body: string;
}

/** One tab of a toggle card: its label, the title of its pane and the facts under it. */
export interface TabCopy {
  label: string;
  title: string;
  facts: readonly Fact[];
}

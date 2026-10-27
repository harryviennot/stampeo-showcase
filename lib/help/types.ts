/** What a help page declares in its frontmatter, and what the loader hands back. */

export const HELP_PAGE_TYPES = ["how-to", "concept", "troubleshooting", "reference", "share", "guide"] as const;
export const HELP_AUDIENCES = ["owner", "admin", "scanner", "customer"] as const;
export const HELP_PLANS = ["starter", "growth", "pro"] as const;

export type HelpPageType = (typeof HELP_PAGE_TYPES)[number];
export type HelpAudience = (typeof HELP_AUDIENCES)[number];
export type HelpPlan = (typeof HELP_PLANS)[number];

export interface HelpPage {
  /** The file name without `.mdx`; the page lives at `/help/<slug>`. */
  slug: string;
  /** The folder the file sits in. */
  category: string;
  /** The reader's words for the task, 65 characters at most. */
  title: string;
  /** Also the search snippet, 155 characters at most. */
  description: string;
  type: HelpPageType;
  /** Who can do it (how-to) or who reads it (share). */
  audience: HelpAudience[];
  /** Set only when the whole page is gated to some plans. */
  plans?: HelpPlan[];
  /** Synonyms readers type that the page never says. */
  keywords: string[];
  /** Dashboard routes or scanner screens the page documents. */
  screens: string[];
  /** Code paths whose change makes the page stale. */
  sources: string[];
  /** Up to five slugs, shown as Related. */
  related: string[];
  /** `YYYY-MM-DD`, the last real content change. */
  updated: string;
  /** A draft is hidden everywhere in production. */
  draft: boolean;
  /** The MDX body, without frontmatter. */
  content: string;
  readingMinutes: number;
  /** Absolute path of the source file, for error messages. */
  filePath: string;
}

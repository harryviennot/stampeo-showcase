/** What the help search knows about one page. Plain data, so it travels as JSON. */
export interface SearchEntry {
  slug: string;
  title: string;
  description: string;
  /** The category's display name. */
  category: string;
  /** The reader's words that the page never writes. */
  keywords: string[];
  /** The page's `##` section titles and troubleshooting entries. */
  headings: string[];
}

/** The file the browser fetches once: every published page, and the popular slugs in order. */
export interface SearchIndex {
  entries: SearchEntry[];
  popular: string[];
}

/** The line shown under a result's title. */
export interface SearchSnippet {
  text: string;
  source: "description" | "heading";
}

export interface SearchHit {
  entry: SearchEntry;
  score: number;
  snippet: SearchSnippet;
}

/** A stretch of text, marked when it is what the reader typed. */
export interface TextPart {
  text: string;
  match: boolean;
}

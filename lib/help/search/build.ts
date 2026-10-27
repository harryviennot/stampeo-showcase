/**
 * Builds the search index from the loaded pages: the one file the browser
 * downloads to search. Runs at build time on the server (it reads the loader's
 * pages, which come from disk); the scorer itself ships to the browser.
 */

import { getHelpCategory } from "../categories";
import { popularSlugs } from "../home/popular";
import { stripCodeFences } from "../mdx-source";
import type { HelpPage } from "../types";
import type { SearchEntry, SearchIndex } from "./types";

const SECTION_HEADING = /^##\s+(.+?)\s*#*\s*$/;
const SYMPTOM_TITLE = /<Symptom\b[^>]*?\btitle=(?:"([^"]+)"|'([^']+)')/;

/** Markdown inline syntax removed from a heading: emphasis, code ticks, link targets. */
function plain(markdown: string): string {
  return markdown
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_`]+/g, "")
    .trim();
}

/** The `##` section titles and the troubleshooting entries of an MDX body, as plain text. */
export function extractHeadings(source: string): string[] {
  const headings: string[] = [];
  for (const line of stripCodeFences(source).split("\n")) {
    const section = SECTION_HEADING.exec(line);
    if (section) {
      headings.push(plain(section[1]));
      continue;
    }
    const symptom = SYMPTOM_TITLE.exec(line);
    if (symptom) headings.push(plain(symptom[1] ?? symptom[2]));
  }
  return headings;
}

function entryFor(page: HelpPage): SearchEntry {
  return {
    slug: page.slug,
    title: page.title,
    description: page.description,
    category: getHelpCategory(page.category)?.name ?? page.category,
    keywords: page.keywords,
    headings: extractHeadings(page.content),
  };
}

/** `pages` should already hold what this environment shows: drafts are the loader's to hide. */
export function buildSearchIndex(pages: readonly HelpPage[]): SearchIndex {
  return {
    entries: pages.map(entryFor),
    popular: popularSlugs(pages.map((page) => page.slug)),
  };
}

/**
 * How the pages are grouped for the help home and the topic pages: one topic
 * per category that has a page, the topics the home lists, and the three
 * doors. Pure, so the same rules run over a fixture and over the real content.
 */

import { HELP_CATEGORIES, type HelpCategory } from "../categories";
import { POPULAR_SLUGS } from "./popular";
import type { HelpPage } from "../types";

/** The home lists a topic only once it has this many pages; thinner ones are reached from search and links. */
export const HOME_TOPIC_MIN_PAGES = 3;

/** How many page links a topic card on the desktop home shows. */
export const HOME_TOPIC_LINKS = 4;

export interface Topic {
  category: HelpCategory;
  /** Popular pages first, then the rest in the loader's order. */
  pages: HelpPage[];
}

function popularFirst(pages: readonly HelpPage[]): HelpPage[] {
  const rank = (page: HelpPage) => {
    const at = POPULAR_SLUGS.indexOf(page.slug);
    return at === -1 ? POPULAR_SLUGS.length : at;
  };
  // Array.prototype.sort is stable: pages of equal rank keep the loader's order.
  return [...pages].sort((a, b) => rank(a) - rank(b));
}

/** A topic for every category that has at least one page, in the category table's order. */
export function groupTopics(pages: readonly HelpPage[]): Topic[] {
  return HELP_CATEGORIES.flatMap((category) => {
    const inCategory = pages.filter((page) => page.category === category.slug);
    return inCategory.length > 0 ? [{ category, pages: popularFirst(inCategory) }] : [];
  });
}

export function topicFor(topics: readonly Topic[], categorySlug: string): Topic | undefined {
  return topics.find((topic) => topic.category.slug === categorySlug);
}

/** The topics the help home lists. */
export function homeTopics(topics: readonly Topic[]): Topic[] {
  return topics.filter((topic) => topic.pages.length >= HOME_TOPIC_MIN_PAGES);
}

/** Every topic but the current one: the category navigation of a topic page. */
export function otherTopics(topics: readonly Topic[], currentSlug: string): Topic[] {
  return topics.filter((topic) => topic.category.slug !== currentSlug);
}

export type DoorKey = "setup" | "counter" | "customers";

export interface Door {
  key: DoorKey;
  /** The category whose topic page the door opens. */
  category: string;
}

const DOORS: readonly Door[] = [
  { key: "setup", category: "get-started" },
  { key: "counter", category: "at-the-counter" },
  { key: "customers", category: "for-your-customers" },
];

/** The doors whose topic has pages: a door never opens a 404. */
export function visibleDoors(topics: readonly Topic[]): Door[] {
  return DOORS.filter((door) => topicFor(topics, door.category) !== undefined);
}

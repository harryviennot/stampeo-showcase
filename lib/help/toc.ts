import { stripCodeFences } from "./mdx-source";
import type { HelpPageType } from "./types";

/** An article lists its sections ("On this page") from this many `##` headings up. */
export const HELP_TOC_MIN_SECTIONS = 3;

/** The `##` headings in an MDX body: sub-headings and Symptom titles are not sections. */
function countSections(source: string): number {
  return stripCodeFences(source)
    .split("\n")
    .filter((line) => /^##\s+\S/.test(line)).length;
}

export function showsToc(source: string): boolean {
  return countSections(source) >= HELP_TOC_MIN_SECTIONS;
}

/** Long pages that are read, not followed: they get the folded list on a phone too. */
const PHONE_TOC_TYPES: readonly HelpPageType[] = ["concept", "reference", "guide"];

export interface TocPlacement {
  /** The right rail on a desktop. */
  desktop: boolean;
  /** The folded list above the body on a phone. */
  phone: boolean;
}

export function tocPlacement(source: string, type: HelpPageType): TocPlacement {
  const desktop = showsToc(source);
  return { desktop, phone: desktop && PHONE_TOC_TYPES.includes(type) };
}

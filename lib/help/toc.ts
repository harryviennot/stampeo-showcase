import { stripCodeFences } from "./mdx-source";

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

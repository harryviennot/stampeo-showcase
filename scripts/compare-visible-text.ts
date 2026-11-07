/**
 * Checks that restructuring a comparison's MDX changed none of its words.
 *
 *   bun scripts/compare-visible-text.ts <git ref>
 *
 * Reads every `content/compare/<locale>/*.mdx` at the ref and in the working
 * tree and compares what a reader sees: the text in order, markdown marks and
 * tags dropped, a `<Fact>` kept as its id, and the `title` / `shop` a tag carries
 * kept where the tag sits. The frontmatter must be identical. Exits 1 on any difference.
 */

import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const FRONTMATTER = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/;
const TAG = /<\/?([A-Za-z][\w.]*)((?:"[^"]*"|'[^']*'|\{(?:[^{}]|\{[^{}]*\})*\}|[^>"'{}])*?)\/?>/g;
const TEXT_ATTRIBUTE = /\b(?:title|shop)=(?:"([^"]*)"|'([^']*)'|\{("(?:[^"\\]|\\.)*")\})/g;

const decode = (text: string) => text.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");

/** The words a tag carries in its attributes, in the order written. */
function attributeWords(attributes: string): string {
  return [...attributes.matchAll(TEXT_ATTRIBUTE)]
    .map(([, double, single, expression]) => (expression ? (JSON.parse(expression) as string) : (double ?? single)))
    .map(decode)
    .join(" ");
}

/** What a reader of the page reads in an MDX file, as one line of text. */
export function visibleText(source: string): string {
  return decode(
    source
      .replace(FRONTMATTER, "")
      .replace(TAG, (_tag, name: string, attributes: string) =>
        name === "Fact" ? `{${/\bid=["']([^"']+)["']/.exec(attributes)?.[1] ?? "?"}}` : `\n${attributeWords(attributes)}\n`,
      )
      .replace(/^#{1,6}[ \t]+/gm, "")
      .replace(/^[ \t]*(?:[-*+]|\d+[.)])[ \t]+/gm, "")
      .replace(/^[ \t]*>[ \t]?/gm, "")
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/\*+/g, ""),
  )
    .replace(/[  ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Null when both texts read the same; otherwise the first place they differ, for a person to look at. */
export function wordsChanged(before: string, after: string): string | null {
  const [a, b] = [visibleText(before), visibleText(after)];
  if (a === b) return null;

  let at = 0;
  while (at < a.length && a[at] === b[at]) at++;
  const around = (text: string) => text.slice(Math.max(0, at - 40), at + 60);
  return `first difference at character ${at}\n  before: …${around(a)}…\n  after:  …${around(b)}…`;
}

const frontmatterOf = (source: string) => FRONTMATTER.exec(source)?.[0] ?? "";

function main(ref: string | undefined): number {
  if (!ref) {
    console.error("usage: bun scripts/compare-visible-text.ts <git ref>");
    return 2;
  }

  const root = join(import.meta.dir, "..");
  let failures = 0;

  for (const locale of ["en", "fr"]) {
    const directory = join("content", "compare", locale);
    for (const name of readdirSync(join(root, directory)).filter((file) => file.endsWith(".mdx")).sort()) {
      const path = join(directory, name);
      const before = execFileSync("git", ["show", `${ref}:${path}`], { cwd: root, encoding: "utf8" });
      const after = readFileSync(join(root, path), "utf8");
      const words = visibleText(after).split(" ").length;

      const problems = [
        frontmatterOf(before) === frontmatterOf(after) ? null : "frontmatter differs",
        wordsChanged(before, after),
      ].filter(Boolean);
      if (problems.length > 0) failures++;
      console.log(`${problems.length > 0 ? "DIFF" : "same"}  ${path}  (${words} words)${problems.map((problem) => `\n  ${problem}`).join("")}`);
    }
  }
  return failures > 0 ? 1 : 0;
}

if (import.meta.main) process.exit(main(process.argv[2]));

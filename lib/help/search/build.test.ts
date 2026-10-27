/**
 * The index the browser searches: what it holds for each page, what it leaves
 * out, and that the real content can be found by the words in its keywords.
 */

import { afterEach, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { getAllHelpPages } from "../index";
import { buildSearchIndex, extractHeadings } from "./build";
import { searchHelp } from "./score";

const page = (title: string, body: string, extra: Record<string, unknown> = {}) =>
  `---\n${JSON.stringify({
    title,
    description: `About ${title.toLowerCase()}.`,
    type: "how-to",
    audience: ["owner"],
    keywords: ["staff"],
    screens: [],
    sources: [],
    updated: "2026-10-28",
    ...extra,
  })}\n---\n\n${body}`;

const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

function pagesFrom(files: Record<string, string>, includeDrafts: boolean) {
  const root = mkdtempSync(join(tmpdir(), "help-search-"));
  roots.push(root);
  for (const [relative, body] of Object.entries(files)) {
    mkdirSync(dirname(join(root, relative)), { recursive: true });
    writeFileSync(join(root, relative), body);
  }
  return getAllHelpPages({ root, includeDrafts });
}

describe("the section titles of a page", () => {
  test("are its ## headings and its troubleshooting entries, as plain text", () => {
    const body = [
      "Intro.",
      "## Add a **scanner**",
      "### A sub-step",
      "## Use the [join code](/help/roles) with `Team`",
      '<Symptom title="The code does not work">',
      "Check it.",
      "</Symptom>",
      "```md",
      "## Not a heading",
      "```",
    ].join("\n");

    expect(extractHeadings(body)).toEqual([
      "Add a scanner",
      "Use the join code with Team",
      "The code does not work",
    ]);
  });

  test("are none for a page without sections", () => {
    expect(extractHeadings("Just a paragraph.\n")).toEqual([]);
  });
});

describe("the index", () => {
  const files = {
    "team/add-a-scanner.mdx": page("Add a scanner", "## Share the code\n\nText.\n", { keywords: ["employee"] }),
    "get-started/how-stampeo-works.mdx": page("How Stampeo works", "Text.\n", { type: "concept" }),
    "locations/set-up-your-locations.mdx": page("Set up your locations", "Text.\n", { draft: true }),
  };

  test("holds, per page, what a reader can search by", () => {
    const { entries } = buildSearchIndex(pagesFrom(files, false));

    expect(entries.find((entry) => entry.slug === "add-a-scanner")).toEqual({
      slug: "add-a-scanner",
      title: "Add a scanner",
      description: "About add a scanner.",
      category: "Your team",
      keywords: ["employee"],
      headings: ["Share the code"],
    });
  });

  test("leaves drafts out of a production build, and keeps them in development", () => {
    const published = buildSearchIndex(pagesFrom(files, false)).entries.map((entry) => entry.slug);
    const everything = buildSearchIndex(pagesFrom(files, true)).entries.map((entry) => entry.slug);

    expect(published).not.toContain("set-up-your-locations");
    expect(everything).toContain("set-up-your-locations");
  });

  test("names the popular pages that exist, in order, and skips the ones that do not", () => {
    const { popular } = buildSearchIndex(pagesFrom(files, false));

    expect(popular).toEqual(["how-stampeo-works"]);
  });
});

describe("the real help pages", () => {
  const index = buildSearchIndex(getAllHelpPages());

  test("are all in the index", () => {
    expect(index.entries.map((entry) => entry.slug).sort()).toEqual(
      getAllHelpPages().map((p) => p.slug).sort(),
    );
  });

  test("are found by a word only their keywords hold", () => {
    const slugs = searchHelp(index.entries, "employee").map((hit) => hit.entry.slug);

    expect(slugs).toContain("add-a-team-member");
  });

  test("are found by the words of the home's suggestion", () => {
    expect(searchHelp(index.entries, "stamps").length).toBeGreaterThan(0);
    expect(searchHelp(index.entries, "team").length).toBeGreaterThan(0);
  });

  test("offer enough popular pages to fill the empty search", () => {
    expect(index.popular.length).toBeGreaterThanOrEqual(6);
  });
});

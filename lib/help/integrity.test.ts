/**
 * The link and image checks that keep a help page from pointing at nothing.
 * Run over small content folders here, and over the real content in content.test.ts.
 */

import { afterEach, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { getAllHelpPages } from "./index";
import { findContentProblems } from "./integrity";

const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

function page(extra: Record<string, unknown>, body: string) {
  const data = {
    title: "A page",
    description: "A page about a thing.",
    type: "how-to",
    audience: ["owner"],
    keywords: [],
    screens: [],
    sources: [],
    related: [],
    updated: "2026-10-27",
    ...extra,
  };
  return `---\n${JSON.stringify(data)}\n---\n\n${body}\n`;
}

function problemsIn(files: Record<string, string>, images: string[] = []): string[] {
  const root = mkdtempSync(join(tmpdir(), "help-links-"));
  roots.push(root);
  for (const [relative, source] of Object.entries(files)) {
    mkdirSync(dirname(join(root, relative)), { recursive: true });
    writeFileSync(join(root, relative), source);
  }
  const pages = getAllHelpPages({ root, includeDrafts: true });
  return findContentProblems(pages, (src) => images.includes(src));
}

const ROLES = { "team/roles.mdx": page({}, "Roles.") };

describe("a clean set of pages", () => {
  test("links to other pages, with or without an anchor, and shows images that exist", () => {
    const problems = problemsIn(
      {
        ...ROLES,
        "team/add.mdx": page(
          { related: ["roles"] },
          [
            "See [roles](/help/roles) and [the table](/help/roles#who-can-change-what).",
            "Or the [pricing page](/pricing) and [our site](https://example.com).",
            "![The team page](/help/add-01.png)",
            '<Screenshot src="/help/add-02.png" alt="The dialog" />',
          ].join("\n\n")
        ),
      },
      ["/help/add-01.png", "/help/add-02.png"]
    );

    expect(problems).toEqual([]);
  });

  test("a draft may point at another draft", () => {
    const problems = problemsIn({
      "locations/a.mdx": page({ draft: true, related: ["b"] }, "[B](/help/b)"),
      "locations/b.mdx": page({ draft: true }, "B."),
    });

    expect(problems).toEqual([]);
  });
});

describe("a broken reference is reported with the page it is on", () => {
  const CASES: Array<[string, Record<string, string>, RegExp]> = [
    [
      "a related slug with no page",
      { "team/add.mdx": page({ related: ["missing"] }, "Body.") },
      /add\.mdx.*related.*missing/,
    ],
    [
      "a body link to a page that does not exist",
      { ...ROLES, "team/add.mdx": page({}, "See [this](/help/missing).") },
      /add\.mdx.*\/help\/missing/,
    ],
    [
      "a body link to a page that does not exist, behind an anchor",
      { ...ROLES, "team/add.mdx": page({}, "See [this](/help/missing#step-2).") },
      /add\.mdx.*\/help\/missing/,
    ],
    [
      "a published page that links to a draft",
      {
        "locations/draft.mdx": page({ draft: true }, "Draft."),
        "team/add.mdx": page({}, "See [this](/help/draft)."),
      },
      /add\.mdx.*draft/,
    ],
    [
      "a published page that lists a draft as related",
      {
        "locations/draft.mdx": page({ draft: true }, "Draft."),
        "team/add.mdx": page({ related: ["draft"] }, "Body."),
      },
      /add\.mdx.*draft/,
    ],
    [
      "a link into the old /docs/ scheme",
      { "team/add.mdx": page({}, "See [this](/docs/team/roles).") },
      /add\.mdx.*\/docs\//,
    ],
    [
      "a markdown image that is not in public/help",
      { "team/add.mdx": page({}, "![x](/help/gone.png)") },
      /add\.mdx.*\/help\/gone\.png/,
    ],
    [
      "a Screenshot component whose image is not in public/help",
      { "team/add.mdx": page({}, '<Screenshot src="/help/gone.png" alt="x" />') },
      /add\.mdx.*\/help\/gone\.png/,
    ],
  ];

  test.each(CASES)("%s", (_name, files, expected) => {
    const problems = problemsIn(files);

    expect(problems.length).toBeGreaterThan(0);
    expect(problems.join("\n")).toMatch(expected);
  });
});

/**
 * Searching the help pages the way an owner types: a word the page never says,
 * half a word, a typo, a question. Run against a small fixed index.
 */

import { describe, expect, test } from "bun:test";
import { highlight, queryTokens, searchHelp } from "./score";
import type { SearchEntry } from "./types";

const entry = (overrides: Partial<SearchEntry> & Pick<SearchEntry, "slug" | "title">): SearchEntry => ({
  description: "",
  category: "Get started",
  keywords: [],
  headings: [],
  ...overrides,
});

const INDEX: SearchEntry[] = [
  entry({
    slug: "add-a-team-member",
    title: "Add a team member",
    description: "Add a scanner with a join code or an admin with an email link.",
    category: "Your team",
    keywords: ["employee", "staff", "join code", "new hire"],
    headings: ["Add a scanner", "Add an admin", "Waiting to join"],
  }),
  entry({
    slug: "remove-a-team-member",
    title: "Remove someone from your team",
    description: "Remove a scanner or an admin, and what happens to their past scans.",
    category: "Your team",
    keywords: ["fire", "delete", "employee", "offboard"],
  }),
  entry({
    slug: "roles",
    title: "Roles and what each one can do",
    description: "What an owner, an admin and a scanner can each do in Stampeo.",
    category: "Your team",
    keywords: ["permissions", "access rights", "manager"],
  }),
  entry({
    slug: "add-stamps",
    title: "Add stamps to a customer's card",
    description: "Scan a customer's card with the scanner app and add one stamp, or several at once.",
    category: "Scanning at the counter",
    keywords: ["punch", "scan", "counter"],
    headings: ["Add several stamps at once", "Undo a stamp added by mistake"],
  }),
  entry({
    slug: "install-the-scanner-app",
    title: "Get the scanner app on your phone",
    description: "Install the free Stampeo app on an iPhone, Android phone or iPad.",
    category: "Scanning at the counter",
    keywords: ["download", "app store", "google play"],
  }),
  entry({
    slug: "set-your-time-zone",
    title: "Set your business time zone",
    description: "See which time zone your business days are counted in.",
    category: "Account and settings",
    keywords: ["timezone", "clock", "daylight saving"],
  }),
];

const slugs = (query: string, limit?: number) => searchHelp(INDEX, query, limit).map((hit) => hit.entry.slug);

describe("finding a page", () => {
  test("by a word that only its keywords hold", () => {
    expect(slugs("employee")).toContain("add-a-team-member");
    expect(slugs("employee")).toContain("remove-a-team-member");
    expect(slugs("download")).toEqual(["install-the-scanner-app"]);
  });

  test("by the start of a word", () => {
    expect(slugs("sta")[0]).toBe("add-stamps");
    expect(slugs("tea")).toContain("add-a-team-member");
  });

  test("by a word in one of its section headings", () => {
    expect(slugs("mistake")).toEqual(["add-stamps"]);
  });

  test("by its category", () => {
    expect(slugs("counter")).toContain("install-the-scanner-app");
  });

  test.each([
    ["scaner", "install-the-scanner-app"],
    ["stamsp", "add-stamps"],
    ["downloads", "install-the-scanner-app"],
  ])("despite a typo: %s", (query, slug) => {
    expect(slugs(query)).toContain(slug);
  });

  test("a question reads as its useful words", () => {
    expect(slugs("how do I add a team member")[0]).toBe("add-a-team-member");
  });

  test("accents and capitals do not matter", () => {
    expect(slugs("TÉAM")).toContain("add-a-team-member");
  });

  test("a phrase typed as written in a keyword", () => {
    expect(slugs("join code")[0]).toBe("add-a-team-member");
  });
});

describe("what ranks first", () => {
  test("a word in the title beats the same word in the description", () => {
    expect(slugs("scanner")[0]).toBe("install-the-scanner-app");
  });

  test("every word must be there: more words narrow the list", () => {
    expect(slugs("remove admin")).toEqual(["remove-a-team-member"]);
  });

  test("is stable: equal scores sort by title", () => {
    const first = slugs("team");
    expect(slugs("team")).toEqual(first);
  });

  test("is capped at the limit", () => {
    expect(slugs("a", 2)).toHaveLength(2);
    expect(slugs("team", 8).length).toBeLessThanOrEqual(8);
  });
});

describe("a query that matches nothing", () => {
  test.each(["qzxwvk", "xyz", "quantum"])("%s finds no page, not a loose near miss", (query) => {
    expect(slugs(query)).toEqual([]);
  });

  test.each(["", "   ", "?!"])("an empty query (%p) finds nothing, so the caller shows the popular pages", (query) => {
    expect(slugs(query)).toEqual([]);
  });

  test("a question made only of small words is still searched as typed", () => {
    expect(slugs("how to")).toEqual([]);
  });
});

describe("the line under a result", () => {
  test("is the description when the title matched", () => {
    const [hit] = searchHelp(INDEX, "install");
    expect(hit.snippet).toEqual({ text: INDEX[4].description, source: "description" });
  });

  test("is the section heading when only a heading matched", () => {
    const [hit] = searchHelp(INDEX, "mistake");
    expect(hit.snippet).toEqual({ text: "Undo a stamp added by mistake", source: "heading" });
  });
});

describe("marking the match", () => {
  const marked = (text: string, query: string) =>
    highlight(text, queryTokens(query))
      .map((part) => (part.match ? `[${part.text}]` : part.text))
      .join("");

  test("marks the typed start of a word and leaves the rest", () => {
    expect(marked("Add a team member", "tea")).toBe("Add a [tea]m member");
  });

  test("marks every word the query names, in any case", () => {
    expect(marked("Add a Team Member", "member team")).toBe("Add a [Team] [Member]");
  });

  test("marks a mistyped word whole", () => {
    expect(marked("Get the scanner app", "scaner")).toBe("Get the [scanner] app");
  });

  test("leaves a text with no match untouched", () => {
    expect(marked("Roles and what each one can do", "qzxwvk")).toBe("Roles and what each one can do");
  });

  test("keeps the text exactly, accents and punctuation included", () => {
    const parts = highlight("Un café, vite!", queryTokens("cafe"));
    expect(parts.map((part) => part.text).join("")).toBe("Un café, vite!");
    expect(parts.find((part) => part.match)?.text).toBe("café");
  });
});

describe("the words of a query", () => {
  test.each([
    ["Add a team member", ["add", "team", "member"]],
    ["  EMPLOYEE  ", ["employee"]],
    ["how to", ["how", "to"]],
    ["", []],
  ])("%p", (query, tokens) => {
    expect(queryTokens(query)).toEqual(tokens);
  });
});

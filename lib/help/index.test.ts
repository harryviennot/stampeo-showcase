/**
 * The help content loader, run against throwaway content folders: what a
 * writer's page looks like on disk, and what the loader does with a mistake.
 */

import { afterEach, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { restoreEnvAfterEach } from "@/lib/testing/restore-env";
import { getAllHelpPages, getHelpCategories, getHelpPage, getPagesInCategory } from "./index";

const VALID = {
  title: "Add a scanner to your team",
  description: "Create a join code so an employee can scan cards from their phone.",
  type: "how-to",
  audience: ["owner", "admin"],
  keywords: ["employee", "staff"],
  screens: ["/team"],
  sources: ["web/src/app/(dashboard)/team"],
  related: [],
  updated: "2026-10-27",
};

/** A page file. JSON is valid YAML, so overrides keep their types; `undefined` drops a key. */
function page(overrides: Record<string, unknown> = {}, body = "Give them a code.\n") {
  const data: Record<string, unknown> = { ...VALID, ...overrides };
  for (const key of Object.keys(data)) if (data[key] === undefined) delete data[key];
  return `---\n${JSON.stringify(data)}\n---\n\n${body}`;
}

const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

function contentRoot(files: Record<string, string>): string {
  const root = mkdtempSync(join(tmpdir(), "help-content-"));
  roots.push(root);
  for (const [relative, body] of Object.entries(files)) {
    mkdirSync(dirname(join(root, relative)), { recursive: true });
    writeFileSync(join(root, relative), body);
  }
  return root;
}

function loadError(root: string): string {
  try {
    getAllHelpPages({ root });
  } catch (error) {
    return (error as Error).message;
  }
  throw new Error("expected the load to fail");
}

describe("loading pages", () => {
  const root = () =>
    contentRoot({
      "team/add-a-scanner.mdx": page(),
      "team/roles.mdx": page({ title: "Roles", type: "concept" }),
      "get-started/how-stampeo-works.mdx": page({ title: "How Stampeo works", type: "concept" }),
      "team/roles.screenshots.md": "# shot specs, never rendered\n",
      "team/notes.txt": "not a page",
    });

  test("the slug is the file name and the category is the folder", () => {
    const pages = getAllHelpPages({ root: root() });

    expect(pages.map((p) => [p.category, p.slug])).toEqual([
      ["get-started", "how-stampeo-works"],
      ["team", "add-a-scanner"],
      ["team", "roles"],
    ]);
    expect(pages[1]).toMatchObject({
      title: "Add a scanner to your team",
      type: "how-to",
      audience: ["owner", "admin"],
      keywords: ["employee", "staff"],
      screens: ["/team"],
      related: [],
      updated: "2026-10-27",
      draft: false,
    });
    expect(pages[1].plans).toBeUndefined();
    expect(pages[1].content).toContain("Give them a code.");
    expect(pages[1].readingMinutes).toBe(1);
  });

  test("a YAML date and a quoted date both load as the same day", () => {
    const dated = `---\ntitle: T\ndescription: D\ntype: concept\naudience: [owner]\nkeywords: []\nscreens: []\nsources: []\nupdated: 2026-10-26\n---\nBody\n`;
    const [loaded] = getAllHelpPages({ root: contentRoot({ "team/roles.mdx": dated }) });

    expect(loaded.updated).toBe("2026-10-26");
  });

  test("getHelpPage finds a page by slug and answers null for an unknown one", () => {
    const dir = root();

    expect(getHelpPage("roles", { root: dir })?.category).toBe("team");
    expect(getHelpPage("nope", { root: dir })).toBeNull();
  });

  test("only categories that have pages are listed, in the category table's order", () => {
    const dir = root();

    expect(getHelpCategories({ root: dir }).map((c) => c.slug)).toEqual(["get-started", "team"]);
    expect(getPagesInCategory("team", { root: dir }).map((p) => p.slug)).toEqual(["add-a-scanner", "roles"]);
    expect(getPagesInCategory("guides", { root: dir })).toEqual([]);
  });
});

describe("a content mistake fails the load, naming the file", () => {
  const INVALID: Array<[string, Record<string, unknown>, RegExp]> = [
    ["a title over 65 characters", { title: "x".repeat(66) }, /"title"/],
    ["a description over 155 characters", { description: "x".repeat(156) }, /"description"/],
    ["an unknown type", { type: "tutorial" }, /"type"/],
    ["an empty audience", { audience: [] }, /"audience"/],
    ["an unknown audience", { audience: ["boss"] }, /"audience"/],
    ["an unknown plan", { plans: ["enterprise"] }, /"plans"/],
    ["Growth without Pro, which would read as Growth alone", { plans: ["growth"] }, /"plans"/],
    ["more than five related pages", { related: ["a", "b", "c", "d", "e", "f"] }, /"related"/],
    ["a related entry that is not a slug", { related: ["Not A Slug"] }, /"related"/],
    ["keywords that are not a list", { keywords: "staff" }, /"keywords"/],
    ["no screens list", { screens: undefined }, /"screens"/],
    ["no sources list", { sources: undefined }, /"sources"/],
    ["no updated date", { updated: undefined }, /"updated"/],
    ["an updated value that is not a date", { updated: "last week" }, /"updated"/],
    ["a draft flag that is not a boolean", { draft: "yes" }, /"draft"/],
    ["a key the schema does not have", { plan: ["pro"] }, /"plan"/],
  ];

  test.each(INVALID)("%s", (_name, overrides, field) => {
    const message = loadError(contentRoot({ "team/roles.mdx": page(overrides) }));

    expect(message).toContain(join("team", "roles.mdx"));
    expect(message).toMatch(field);
  });

  test("frontmatter that is not YAML at all", () => {
    const message = loadError(contentRoot({ "team/roles.mdx": "---\ntitle: [unclosed\n---\nBody\n" }));

    expect(message).toContain(join("team", "roles.mdx"));
  });

  test("a folder that is not a category", () => {
    const message = loadError(contentRoot({ "teamwork/roles.mdx": page() }));

    expect(message).toContain("teamwork");
  });

  test("a page outside any category folder", () => {
    const message = loadError(contentRoot({ "roles.mdx": page() }));

    expect(message).toContain("roles.mdx");
  });

  test("a file name that cannot be a URL slug", () => {
    const message = loadError(contentRoot({ "team/Roles And Rights.mdx": page() }));

    expect(message).toContain("Roles And Rights.mdx");
  });

  test.each(["topics", "search-index"])("a page named %s, which is a route of the help center itself", (slug) => {
    const message = loadError(contentRoot({ [`team/${slug}.mdx`]: page() }));

    expect(message).toContain(`${slug}.mdx`);
    expect(message).toContain("reserved");
  });

  test("the same slug in two categories names both files", () => {
    const message = loadError(
      contentRoot({ "team/roles.mdx": page(), "account-and-settings/roles.mdx": page() })
    );

    expect(message).toContain(join("team", "roles.mdx"));
    expect(message).toContain(join("account-and-settings", "roles.mdx"));
  });
});

describe("drafts", () => {
  const files = {
    "team/roles.mdx": page({ title: "Roles", type: "concept" }),
    "locations/set-up-your-locations.mdx": page({ title: "Set up your locations", draft: true }),
  };
  restoreEnvAfterEach("NODE_ENV");

  test("are in a development load and out of a production one", () => {
    const root = contentRoot(files);

    expect(getAllHelpPages({ root, includeDrafts: true }).map((p) => p.slug)).toEqual([
      "roles",
      "set-up-your-locations",
    ]);
    expect(getAllHelpPages({ root, includeDrafts: false }).map((p) => p.slug)).toEqual(["roles"]);
    expect(getHelpPage("set-up-your-locations", { root, includeDrafts: false })).toBeNull();
    expect(getHelpCategories({ root, includeDrafts: false }).map((c) => c.slug)).toEqual(["team"]);
  });

  test("follow NODE_ENV when nothing is said", () => {
    const root = contentRoot(files);

    process.env.NODE_ENV = "development";
    expect(getAllHelpPages({ root })).toHaveLength(2);

    process.env.NODE_ENV = "production";
    expect(getAllHelpPages({ root }).map((p) => p.slug)).toEqual(["roles"]);
  });
});

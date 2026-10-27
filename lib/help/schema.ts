/**
 * The rules a help page's frontmatter must meet. No `fs`: the loader reads the
 * file and hands the parsed YAML here. Every failure names the file.
 */

import {
  HELP_AUDIENCES,
  HELP_PAGE_TYPES,
  HELP_PLANS,
  type HelpAudience,
  type HelpPage,
  type HelpPageType,
  type HelpPlan,
} from "./types";

export class HelpContentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HelpContentError";
  }
}

export type HelpFrontmatter = Pick<
  HelpPage,
  | "title"
  | "description"
  | "type"
  | "audience"
  | "plans"
  | "keywords"
  | "screens"
  | "sources"
  | "related"
  | "updated"
  | "draft"
>;

export const TITLE_MAX = 65;
export const DESCRIPTION_MAX = 155;
export const RELATED_MAX = 5;

/** A page's file name, and so its URL: lower case words joined by single dashes. */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const KNOWN_KEYS: ReadonlySet<string> = new Set([
  "title",
  "description",
  "type",
  "audience",
  "plans",
  "keywords",
  "screens",
  "sources",
  "related",
  "updated",
  "draft",
]);

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function parseHelpFrontmatter(data: Record<string, unknown>, filePath: string): HelpFrontmatter {
  const fail = (field: string, problem: string): never => {
    throw new HelpContentError(`${filePath}: "${field}" ${problem}`);
  };

  const text = (field: string, max: number): string => {
    const value = data[field];
    if (typeof value !== "string" || value.trim() === "") return fail(field, "is required and must be text");
    if (value.length > max) return fail(field, `must be at most ${max} characters (it is ${value.length})`);
    return value;
  };

  const oneOf = <T extends string>(field: string, value: unknown, allowed: readonly T[]): T => {
    if (typeof value === "string" && (allowed as readonly string[]).includes(value)) return value as T;
    return fail(field, `must be one of ${allowed.join(", ")} (it is ${JSON.stringify(value)})`);
  };

  const list = (field: string, required: boolean): unknown[] => {
    const value = data[field];
    if (value === undefined && !required) return [];
    if (!Array.isArray(value)) return fail(field, "must be a list");
    return value;
  };

  const strings = (field: string, required: boolean): string[] =>
    list(field, required).map((item) => {
      if (typeof item !== "string" || item.trim() === "") return fail(field, "must only hold non-empty text");
      return item;
    });

  for (const key of Object.keys(data)) {
    if (!KNOWN_KEYS.has(key)) fail(key, `is not a frontmatter field (known: ${[...KNOWN_KEYS].join(", ")})`);
  }

  const title = text("title", TITLE_MAX);
  const description = text("description", DESCRIPTION_MAX);
  const type: HelpPageType = oneOf("type", data.type, HELP_PAGE_TYPES);

  const audience: HelpAudience[] = list("audience", true).map((item) => oneOf("audience", item, HELP_AUDIENCES));
  if (audience.length === 0) fail("audience", "must name at least one of owner, admin, scanner, customer");

  let plans: HelpPlan[] | undefined;
  if (data.plans !== undefined) {
    plans = list("plans", true).map((item) => oneOf("plans", item, HELP_PLANS));
    if (plans.length === 0) fail("plans", "is left out when the page is on every plan");
    // A gate on Growth is a gate on Growth and Pro, so the badge never says "Growth" alone.
    if (plans.includes("starter") && !(plans.includes("growth") && plans.includes("pro"))) {
      fail("plans", 'lists "starter" without "growth" and "pro"');
    }
    if (plans.includes("growth") && !plans.includes("pro")) {
      fail("plans", 'lists "growth" without "pro": a Growth page is a Growth and Pro page');
    }
  }

  const keywords = strings("keywords", true);
  const screens = strings("screens", true);
  const sources = strings("sources", true);

  const related = strings("related", false);
  if (related.length > RELATED_MAX) fail("related", `holds ${related.length} slugs, at most ${RELATED_MAX} are allowed`);
  for (const slug of related) {
    if (!SLUG_PATTERN.test(slug)) fail("related", `holds "${slug}", which is not a page slug`);
  }

  const draft = data.draft;
  if (draft !== undefined && typeof draft !== "boolean") fail("draft", "must be true or false");

  return {
    title,
    description,
    type,
    audience,
    plans,
    keywords,
    screens,
    sources,
    related,
    updated: parseUpdated(data.updated, fail),
    draft: draft === true,
  };
}

/** A YAML date (`updated: 2026-10-27`) or its quoted form, as `YYYY-MM-DD`. */
function parseUpdated(value: unknown, fail: (field: string, problem: string) => never): string {
  const problem = "must be a date like 2026-10-27";
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString().slice(0, 10);
  if (typeof value === "string" && DATE_PATTERN.test(value) && !Number.isNaN(Date.parse(value))) return value;
  return fail("updated", problem);
}

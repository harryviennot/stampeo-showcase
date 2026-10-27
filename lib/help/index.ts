/**
 * The help content loader: walks content/help/en/<category>/<slug>.mdx, checks
 * every page's frontmatter, and hands back the pages in category order.
 *
 * Only `.mdx` files are pages, so a `<slug>.screenshots.md` sidecar is skipped.
 * Any mistake throws with the file's path, so a bad page fails the build rather
 * than reaching a reader.
 */

import fs from "node:fs";
import path from "node:path";
import { parseFrontmatter, readingMinutes } from "@/lib/content/frontmatter";
import { HELP_CATEGORIES, getHelpCategory, type HelpCategory } from "./categories";
import { HelpContentError, RESERVED_SLUGS, SLUG_PATTERN, parseHelpFrontmatter } from "./schema";
import type { HelpPage } from "./types";

export { HelpContentError } from "./schema";

export const HELP_CONTENT_ROOT = path.join(process.cwd(), "content/help/en");

export interface HelpLoadOptions {
  /** The content folder; tests point it at a fixture. */
  root?: string;
  /** Drafts are shown in development and hidden in production unless this says otherwise. */
  includeDrafts?: boolean;
}

const MDX_EXTENSION = ".mdx";

function categoryOrder(slug: string): number {
  return HELP_CATEGORIES.findIndex((category) => category.slug === slug);
}

function readPage(file: string, category: string): HelpPage {
  const slug = path.basename(file, MDX_EXTENSION);
  if (!SLUG_PATTERN.test(slug)) {
    throw new HelpContentError(`${file}: the file name must be lower case words joined by dashes, as it is the page's URL`);
  }

  if (RESERVED_SLUGS.includes(slug)) {
    throw new HelpContentError(`${file}: "${slug}" is reserved for a route of the help center (reserved: ${RESERVED_SLUGS.join(", ")})`);
  }

  let parsed: ReturnType<typeof parseFrontmatter>;
  try {
    parsed = parseFrontmatter(fs.readFileSync(file, "utf-8"));
  } catch (error) {
    throw new HelpContentError(`${file}: the frontmatter is not valid YAML (${(error as Error).message})`);
  }

  return {
    ...parseHelpFrontmatter(parsed.data, file),
    slug,
    category,
    content: parsed.content,
    readingMinutes: readingMinutes(parsed.content),
    filePath: file,
  };
}

/** Every page under the root, drafts included, validated and checked for duplicate slugs. */
function readAllPages(root: string): HelpPage[] {
  if (!fs.existsSync(root)) return [];

  const pages: HelpPage[] = [];
  const bySlug = new Map<string, string>();

  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const entryPath = path.join(root, entry.name);

    if (!entry.isDirectory()) {
      if (entry.name.endsWith(MDX_EXTENSION)) {
        throw new HelpContentError(`${entryPath}: a page must sit in a category folder, not at the top of ${root}`);
      }
      continue;
    }

    if (!getHelpCategory(entry.name)) {
      const known = HELP_CATEGORIES.map((category) => category.slug).join(", ");
      throw new HelpContentError(`${entryPath}: "${entry.name}" is not a help category (known: ${known})`);
    }

    for (const file of fs.readdirSync(entryPath, { withFileTypes: true })) {
      const filePath = path.join(entryPath, file.name);
      if (file.isDirectory()) throw new HelpContentError(`${filePath}: category folders hold pages only, no sub-folders`);
      if (!file.name.endsWith(MDX_EXTENSION)) continue;

      const page = readPage(filePath, entry.name);
      const existing = bySlug.get(page.slug);
      if (existing) {
        throw new HelpContentError(`${filePath}: the slug "${page.slug}" is already used by ${existing}`);
      }
      bySlug.set(page.slug, filePath);
      pages.push(page);
    }
  }

  return pages.sort(
    (a, b) => categoryOrder(a.category) - categoryOrder(b.category) || a.slug.localeCompare(b.slug)
  );
}

function draftsShown(options: HelpLoadOptions): boolean {
  return options.includeDrafts ?? process.env.NODE_ENV !== "production";
}

/** Every page that is shown in this environment, in category order. */
export function getAllHelpPages(options: HelpLoadOptions = {}): HelpPage[] {
  const pages = readAllPages(options.root ?? HELP_CONTENT_ROOT);
  return draftsShown(options) ? pages : pages.filter((page) => !page.draft);
}

export function getHelpPage(slug: string, options: HelpLoadOptions = {}): HelpPage | null {
  return getAllHelpPages(options).find((page) => page.slug === slug) ?? null;
}

/** The categories that have at least one page, in the category table's order. */
export function getHelpCategories(options: HelpLoadOptions = {}): HelpCategory[] {
  const used = new Set(getAllHelpPages(options).map((page) => page.category));
  return HELP_CATEGORIES.filter((category) => used.has(category.slug));
}

export function getPagesInCategory(category: string, options: HelpLoadOptions = {}): HelpPage[] {
  return getAllHelpPages(options).filter((page) => page.category === category);
}

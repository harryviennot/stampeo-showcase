import fs from "fs";
import path from "path";
import matter from "gray-matter";
import yaml from "js-yaml";
import { marketPath } from "../markets";
import { factIdsIn, findCurrencyAmounts, findMarkdownTables, hasChooseIf, hasComparisonTable } from "./body-checks";
import { COMPETITOR_FACTS, findCompetitor, marketFacts } from "./facts";
import { isStampeoFactId } from "./stampeo";
import type { CompetitorFacts, ComparisonFaq, ComparisonPage, Market } from "./types";

/**
 * Loads `content/compare/<locale>/<slug>.mdx`: `en` files are the US pages
 * (/us/vs/<slug>), `fr` files the French ones (/comparatif/<slug>). A file
 * that breaks a rule fails the load with every problem, each naming the file
 * and the line.
 */

export interface LoaderOptions {
  /** The content root holding `en/` and `fr/`. */
  root?: string;
  /** The competitor facts the pages are checked against. */
  facts?: readonly CompetitorFacts[];
}

const DEFAULT_ROOT = path.join(process.cwd(), "content/compare");

const LOCALES = ["en", "fr"] as const;
type Locale = (typeof LOCALES)[number];
const MARKET_OF: Record<Locale, Market> = { en: "us", fr: "fr" };

const FRONTMATTER_KEYS = ["competitor", "title", "description", "faqs", "draft"];
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// gray-matter ships a js-yaml 3 engine that calls the removed `yaml.safeLoad`.
const matterOptions = {
  engines: {
    yaml: {
      parse: (input: string) => yaml.load(input) as object,
      stringify: () => {
        throw new Error("YAML stringify is not supported for comparison frontmatter");
      },
    },
  },
};

const isText = (value: unknown): value is string => typeof value === "string" && value.trim() !== "";

function faqsOf(value: unknown): ComparisonFaq[] | null {
  if (!Array.isArray(value) || value.length === 0) return null;
  const faqs = value.map((item) =>
    item && isText(item.question) && isText(item.answer) ? { question: item.question, answer: item.answer } : null,
  );
  return faqs.every((faq) => faq !== null) ? (faqs as ComparisonFaq[]) : null;
}

/** A page from one file, or the problems that stop it being one. */
function readPage(
  file: string,
  locale: Locale,
  facts: readonly CompetitorFacts[],
): { page?: ComparisonPage; problems: string[] } {
  const relative = path.relative(process.cwd(), file);
  const where = relative.startsWith("..") ? file : relative;
  const problems: string[] = [];
  const slug = path.basename(file, ".mdx");
  const market = MARKET_OF[locale];

  if (!SLUG.test(slug)) {
    problems.push(`${where}: "${slug}" is not a slug (lowercase letters, digits and single hyphens)`);
  }

  const source = fs.readFileSync(/*turbopackIgnore: true*/ file, "utf-8");
  let parsed: matter.GrayMatterFile<string>;
  try {
    parsed = matter(source, matterOptions);
  } catch (error) {
    return { problems: [...problems, `${where}: frontmatter is not valid YAML (${(error as Error).message})`] };
  }
  const { data, content } = parsed;

  for (const key of Object.keys(data)) {
    if (!FRONTMATTER_KEYS.includes(key)) {
      problems.push(`${where}: unknown frontmatter key "${key}" (allowed: ${FRONTMATTER_KEYS.join(", ")})`);
    }
  }
  if (!isText(data.title)) problems.push(`${where}: frontmatter "title" must be a non-empty string`);
  if (!isText(data.description)) problems.push(`${where}: frontmatter "description" must be a non-empty string`);
  if (typeof data.draft !== "boolean") problems.push(`${where}: frontmatter "draft" must be true or false`);
  const faqs = faqsOf(data.faqs);
  if (!faqs) problems.push(`${where}: frontmatter "faqs" must list at least one { question, answer }`);

  // A competitor with no facts in this market leaves nothing for <Fact> to resolve against.
  const competitor = isText(data.competitor) ? findCompetitor(data.competitor, facts) : undefined;
  if (!isText(data.competitor)) {
    problems.push(`${where}: frontmatter "competitor" must name a competitor`);
  } else if (!competitor) {
    problems.push(`${where}: competitor "${data.competitor}" is not in the facts registry (lib/compare/facts)`);
  } else if (marketFacts(competitor, market).length === 0) {
    problems.push(`${where}: competitor "${data.competitor}" has no facts for the ${market} market`);
  }

  // Body lines are counted from the file's first line, frontmatter included.
  const bodyStart = source.endsWith(content) ? source.slice(0, source.length - content.length).split("\n").length - 1 : 0;

  for (const hit of findCurrencyAmounts(source)) {
    problems.push(`${where}:${hit.line}: typed currency amount "${hit.match}" (prices come from <Fact> ids and the plan catalog)`);
  }
  for (const hit of findMarkdownTables(content)) {
    problems.push(`${where}:${bodyStart + hit.line}: markdown table (tables come from <ComparisonTable />)`);
  }
  for (const use of factIdsIn(content)) {
    const line = `${where}:${bodyStart + use.line}`;
    if (use.id === null) problems.push(`${line}: <Fact> needs an id written as a plain string, id="price.entry"`);
    else if (use.id.startsWith("stampeo.")) {
      if (!isStampeoFactId(use.id)) problems.push(`${line}: unknown Stampeo fact "${use.id}"`);
    } else if (competitor && !marketFacts(competitor, market).some((fact) => fact.id === use.id)) {
      problems.push(`${line}: "${use.id}" is not a ${competitor.id} fact for the ${market} market`);
    }
  }
  // The checked date and the sources count every standard row, so the page must show them.
  if (!hasComparisonTable(content)) problems.push(`${where}: needs a <ComparisonTable /> (it shows the standard rows the sources list cites)`);
  for (const side of ["competitor", "stampeo"] as const) {
    if (!hasChooseIf(content, side)) problems.push(`${where}: needs a <ChooseIf side="${side}"> section`);
  }

  if (problems.length > 0) return { problems };
  return {
    problems,
    page: {
      market,
      locale,
      slug,
      competitor: data.competitor,
      title: data.title,
      description: data.description,
      faqs: faqs!,
      draft: data.draft,
      content,
    },
  };
}

/**
 * The `.mdx` files of one locale folder, sorted. The default folder is read
 * with a path the build can see, so `content/compare` is traced into the
 * server output; a folder passed in (tests) is read outside the build's view.
 */
function mdxFiles(root: string | undefined, locale: Locale): string[] {
  const isMdx = (name: string) => name.endsWith(".mdx");

  if (root === undefined) {
    const dir = path.join(DEFAULT_ROOT, locale);
    return fs.existsSync(dir) ? fs.readdirSync(dir).filter(isMdx).sort().map((name) => path.join(dir, name)) : [];
  }
  const dir = path.join(root, locale);
  return fs.existsSync(/*turbopackIgnore: true*/ dir)
    ? fs.readdirSync(/*turbopackIgnore: true*/ dir).filter(isMdx).sort().map((name) => path.join(dir, name))
    : [];
}

/** Every page, drafts included, English files first. Throws with all problems found. */
export function allComparisonPages({ root, facts = COMPETITOR_FACTS }: LoaderOptions = {}): ComparisonPage[] {
  const pages: ComparisonPage[] = [];
  const problems: string[] = [];

  for (const locale of LOCALES) {
    for (const file of mdxFiles(root, locale)) {
      const result = readPage(file, locale, facts);
      problems.push(...result.problems);
      if (result.page) pages.push(result.page);
    }
  }

  if (problems.length > 0) throw new Error(`Invalid comparison content:\n${problems.join("\n")}`);
  return pages;
}

/** The published pages: what the sitemap, llms.txt and the other-comparisons list may show. */
export function comparisonPages(options: LoaderOptions = {}): ComparisonPage[] {
  return allComparisonPages(options).filter((page) => !page.draft);
}

/** `/us/vs/<slug>` for a US page, `/comparatif/<slug>` for a French one. */
export function comparisonPath({ market, slug }: Pick<ComparisonPage, "market" | "slug">): string {
  return market === "us" ? marketPath("us", `/vs/${slug}`) : `/comparatif/${slug}`;
}

/** The other published pages of a market, for the "other comparisons" list. */
export function comparisonsForMarket(
  market: Market,
  { excludeSlug, ...options }: LoaderOptions & { excludeSlug?: string } = {},
): ComparisonPage[] {
  return comparisonPages(options).filter((page) => page.market === market && page.slug !== excludeSlug);
}

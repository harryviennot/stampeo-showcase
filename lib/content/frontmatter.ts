import matter from "gray-matter";
import yaml from "js-yaml";
import readingTime from "reading-time";

// gray-matter ships a js-yaml 3 engine that calls the removed `yaml.safeLoad`.
// This js-yaml 4 engine keeps frontmatter parsing working on the patched version.
export const matterOptions = {
  engines: {
    yaml: {
      parse: (input: string) => yaml.load(input) as object,
      stringify: () => {
        throw new Error("YAML stringify is not supported for content frontmatter");
      },
    },
  },
};

/** Splits a Markdown or MDX file into its YAML frontmatter and its body. */
export function parseFrontmatter(source: string): { data: Record<string, unknown>; content: string } {
  const { data, content } = matter(source, matterOptions);
  return { data, content };
}

/** Whole minutes to read, rounded up the way reading-time's own label does. */
export function readingMinutes(content: string): number {
  return Math.ceil(Number(readingTime(content).minutes.toFixed(2)));
}

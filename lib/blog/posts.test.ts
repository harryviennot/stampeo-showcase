import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getAllPosts } from "./index";
import { BLOG_LOCALES } from "./locales";

const BLOG = join(import.meta.dir, "..", "..", "content", "blog");

describe.each(BLOG_LOCALES)("%s posts", (locale) => {
  it("are all bylined Harry Viennot", () => {
    const bylines = getAllPosts(locale)
      .filter((post) => post.author !== "Harry Viennot")
      .map((post) => `${post.slug}: ${post.author}`);

    expect(bylines).toEqual([]);
  });
});

/** The source of a post with link targets, URLs and paths removed, so only the words a reader sees remain. */
function readableText(source: string): string {
  return source
    .replace(/\]\([^)]*\)/g, "]")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/(?<![\w])\/[\w\-/#?=&.]+/g, "");
}

describe("English posts", () => {
  it("spell the word as the American 'program', never 'programme'", () => {
    const offenders = getAllPosts("en").flatMap((post) => {
      const source = readFileSync(join(BLOG, "en", `${post.slug}.mdx`), "utf8");
      return readableText(source)
        .split("\n")
        .filter((line) => /\bprogrammes?\b/i.test(line))
        .map((line) => `${post.slug}: ${line.trim().slice(0, 80)}`);
    });

    expect(offenders).toEqual([]);
  });

  it("the check ignores a slug in a link, a bare path and a URL", () => {
    const links = "See [the guide](/blog/programme-fidelite), /programme-fidelite or https://example.org/programme.";

    expect(/\bprogrammes?\b/i.test(readableText(links))).toBe(false);
    expect(/\bprogrammes?\b/i.test(readableText("Our loyalty programme is simple."))).toBe(true);
  });
});

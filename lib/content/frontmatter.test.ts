import { describe, expect, test } from "bun:test";
import { parseFrontmatter, readingMinutes } from "./frontmatter";

describe("parseFrontmatter", () => {
  test("splits YAML frontmatter from the body, lists and dates included", () => {
    const { data, content } = parseFrontmatter(
      "---\ntitle: Hello\nupdated: 2026-10-27\ntags: [a, b]\n---\nBody text\n"
    );

    expect(data.title).toBe("Hello");
    expect(data.tags).toEqual(["a", "b"]);
    expect(data.updated).toBeInstanceOf(Date);
    expect(content.trim()).toBe("Body text");
  });

  test("a file without frontmatter is all body", () => {
    const { data, content } = parseFrontmatter("Just text.\n");

    expect(data).toEqual({});
    expect(content.trim()).toBe("Just text.");
  });
});

describe("readingMinutes", () => {
  const words = (n: number) => "word ".repeat(n);

  test.each([
    [1, 1],
    [200, 1],
    [250, 2],
    [450, 3],
  ])("%i words take %i minute(s), rounded up", (count, minutes) => {
    expect(readingMinutes(words(count))).toBe(minutes);
  });
});

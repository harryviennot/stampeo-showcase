import { describe, expect, it } from "bun:test";
import matter from "gray-matter";
import { matterOptions } from "./frontmatter";

describe("the frontmatter options", () => {
  it("parse a file's YAML header and leave the body", () => {
    const { data, content } = matter("---\ntitle: A title\ndraft: true\ntags:\n  - one\n---\n\nBody.\n", matterOptions);

    expect(data).toEqual({ title: "A title", draft: true, tags: ["one"] });
    expect(content.trim()).toBe("Body.");
  });

  it("reject YAML that is not valid", () => {
    expect(() => matter("---\ntitle: [unclosed\n---\n", matterOptions)).toThrow();
  });
});

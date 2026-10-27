import { describe, expect, test } from "bun:test";
import { showsToc } from "./toc";

const sections = (n: number) => Array.from({ length: n }, (_, i) => `## Section ${i + 1}\n\nText.\n`).join("\n");

describe("the On this page list", () => {
  test.each([
    [0, false],
    [2, false],
    [3, true],
    [7, true],
  ])("a page with %i sections: %p", (count, expected) => {
    expect(showsToc(sections(count))).toBe(expected);
  });

  test("counts section headings, not sub-headings, and not Symptom titles", () => {
    const source = [
      "## One",
      "### Sub one",
      "### Sub two",
      "## Two",
      '<Symptom title="It broke">',
      "Fix it.",
      "</Symptom>",
      '<Symptom title="It broke again">',
      "Fix it.",
      "</Symptom>",
    ].join("\n");

    expect(showsToc(source)).toBe(false);
  });

  test("ignores a ## line inside a code fence", () => {
    const source = ["## One", "## Two", "```md", "## Not a heading", "```"].join("\n");

    expect(showsToc(source)).toBe(false);
  });
});

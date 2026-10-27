import { describe, expect, test } from "bun:test";
import { showsToc, tocPlacement } from "./toc";
import { HELP_PAGE_TYPES, type HelpPageType } from "./types";

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

describe("where the On this page list shows", () => {
  const long = sections(4);
  const short = sections(2);

  test.each(["concept", "reference", "guide"] as const)(
    "a long %s page lists its sections on desktop and folded on a phone",
    (type) => {
      expect(tocPlacement(long, type)).toEqual({ desktop: true, phone: true });
    }
  );

  test.each(["how-to", "troubleshooting", "share"] as const)(
    "a long %s page lists them on desktop only: scrolling a short procedure is faster",
    (type) => {
      expect(tocPlacement(long, type)).toEqual({ desktop: true, phone: false });
    }
  );

  test.each(HELP_PAGE_TYPES)("a %s page with fewer than three sections lists nothing", (type: HelpPageType) => {
    expect(tocPlacement(short, type)).toEqual({ desktop: false, phone: false });
  });
});

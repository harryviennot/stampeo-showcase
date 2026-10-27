import { describe, expect, test } from "bun:test";
import { layoutFor } from "./layout-for";
import { HELP_PAGE_TYPES } from "../types";

describe("which layout a page gets", () => {
  test("a share page gets the light layout without the site header", () => {
    expect(layoutFor("share")).toBe("share");
  });

  test.each(HELP_PAGE_TYPES.filter((type) => type !== "share"))("a %s page gets the article layout", (type) => {
    expect(layoutFor(type)).toBe("article");
  });
});

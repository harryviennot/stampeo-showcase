/**
 * Pages that exist in one language only have nothing to switch to: a blog
 * post has a different slug per language, and the help center is English.
 */

import { describe, expect, test } from "bun:test";
import { HELP_LOOKALIKE_SLUGS, HELP_PATHS } from "../help/__fixtures__/paths";
import { hidesLanguageSwitcher } from "./language-switcher";

describe("hidesLanguageSwitcher", () => {
  test.each(["/blog/carte-fidelite-cafe", ...HELP_PATHS])("%s has no switcher", (path) => {
    expect(hidesLanguageSwitcher(path)).toBe(true);
  });

  test.each(["/", "/pricing", "/blog", "/features/card-design", "/us", ...HELP_LOOKALIKE_SLUGS.map((slug) => `/${slug}`)])("%s keeps it", (path) => {
    expect(hidesLanguageSwitcher(path)).toBe(false);
  });
});

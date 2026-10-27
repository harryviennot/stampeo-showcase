/**
 * Pages that exist in one language only have nothing to switch to: a blog
 * post has a different slug per language, and the help center is English.
 */

import { describe, expect, test } from "bun:test";
import { hidesLanguageSwitcher } from "./language-switcher";

describe("hidesLanguageSwitcher", () => {
  test.each(["/blog/carte-fidelite-cafe", "/help", "/help/add-a-team-member"])("%s has no switcher", (path) => {
    expect(hidesLanguageSwitcher(path)).toBe(true);
  });

  test.each(["/", "/pricing", "/blog", "/features/card-design", "/us", "/helpful-cafe"])("%s keeps it", (path) => {
    expect(hidesLanguageSwitcher(path)).toBe(false);
  });
});

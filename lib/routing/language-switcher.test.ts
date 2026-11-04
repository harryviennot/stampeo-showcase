import { describe, expect, test } from "bun:test";
import { hidesLanguageSwitcher } from "./language-switcher";

describe("hidesLanguageSwitcher: pages that exist in one language only", () => {
  test.each([
    "/blog/carte-fidelite-cafe",
    "/comparatif/fidelatoo",
    "/us/vs/loopy-loyalty",
  ])("hides it on %s, where switching language would land on a 404", (pathname) => {
    expect(hidesLanguageSwitcher(pathname)).toBe(true);
  });

  test.each(["/", "/pricing", "/us", "/us/pricing", "/blog", "/features/card-design", "/some-cafe"])(
    "keeps it on %s",
    (pathname) => {
      expect(hidesLanguageSwitcher(pathname)).toBe(false);
    },
  );
});

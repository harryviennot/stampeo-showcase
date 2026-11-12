import { describe, expect, test } from "bun:test";
import { hidesLanguageSwitcher } from "./language-switcher";

describe("hidesLanguageSwitcher: pages a language switch would 404 on", () => {
  test.each([
    "/blog/carte-fidelite-cafe",
    "/comparatif/fidelatoo",
    "/us/vs/loopy-loyalty",
    "/us/landing-pages/how-it-works",
    "/us/landing-pages/features",
    "/us/landing-pages/outcomes",
    "/us/landing-pages/platform",
    "/us/landing-pages/platform/card-design",
    "/us/landing-pages/platform/mobile-scanner",
    "/us/landing-pages/platform/push-notifications",
    "/us/landing-pages/platform/analytics",
    "/us/landing-pages/platform/promotional-campaigns",
  ])("hides it on %s: its slug differs per language, or it exists in one language only", (pathname) => {
    expect(hidesLanguageSwitcher(pathname)).toBe(true);
  });

  test.each(["/", "/pricing", "/us", "/us/pricing", "/blog", "/features/card-design", "/some-cafe"])(
    "keeps it on %s",
    (pathname) => {
      expect(hidesLanguageSwitcher(pathname)).toBe(false);
    },
  );
});

import { describe, expect, test } from "bun:test";
import { LanguageRow } from "@/components/ui/LanguageSwitcher";
import { routing } from "@/i18n/routing";
import { hidesLanguageSwitcher, switchLanguage } from "./language-switcher";

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

describe("picking a language", () => {
  test("opens the same page in that language, in place of this one in the history", () => {
    const calls: Array<[string, { locale: string }]> = [];
    const pick = switchLanguage({ replace: (pathname, options) => void calls.push([pathname, options]) }, "/features/card-design");

    pick("fr");
    expect(calls).toEqual([["/features/card-design", { locale: "fr" }]]);
  });

  test("a tap on a pill of the phone menu's row hands its language over, and only that one", () => {
    const picked: string[] = [];
    const row = LanguageRow({ locale: "en", locales: routing.locales, onPick: (locale) => void picked.push(locale) });
    const pills = (row.props as { children: Array<{ key: string; props: { onClick: () => void } }> }).children;

    pills.find((pill) => pill.key === "es")?.props.onClick();
    expect(picked).toEqual(["es"]);
  });
});

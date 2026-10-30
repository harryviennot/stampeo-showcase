import { describe, expect, test } from "bun:test";
import { NextIntlClientProvider } from "next-intl";
import { renderToStaticMarkup } from "react-dom/server";
import { LevelStrip } from "@/components/acquisition/LevelStrip";
import type { PublicLevel } from "./levels";
import { loadCatalog } from "../testing/catalogs";

const STAMPS: PublicLevel[] = [
  {
    rank: 1,
    name: "Bronze",
    translations: {},
    total_stamps: 10,
    reward_name: "Free coffee",
    advance: { fills: 2 },
    perks: [],
  },
  {
    rank: 2,
    name: "Silver",
    translations: { fr: { name: "Argent" } },
    total_stamps: 8,
    reward_name: "Coffee and croissant",
    advance: { fills: 3 },
    perks: ["10% off pastries"],
  },
  {
    rank: 3,
    name: "Gold",
    translations: {},
    total_stamps: 6,
    reward_name: "Coffee and pastry",
    advance: null,
    perks: [],
  },
];

function render(
  locale: string,
  levels: PublicLevel[] | null | undefined,
  programType: "stamps" | "points" = "stamps",
  accent?: string | null,
) {
  return renderToStaticMarkup(
    <NextIntlClientProvider
      locale={locale}
      timeZone="UTC"
      messages={loadCatalog(locale)}
      onError={(error) => {
        throw error;
      }}
    >
      <LevelStrip levels={levels} programType={programType} accent={accent} />
    </NextIntlClientProvider>,
  );
}

const textOf = (html: string) => html.replace(/<[^>]*>/g, "|").replace(/\|+/g, "|");
const items = (html: string) =>
  [...html.matchAll(/<li[^>]*>(.*?)<\/li>/g)].map((m) => m[1].replace(/<[^>]*>/g, "").trim());

describe("the sign-up page level strip", () => {
  test.each([
    ["levels are off", null],
    ["an older backend omits them", undefined],
    ["only one level is left", [STAMPS[0]]],
  ])("renders nothing when %s, so the page is unchanged", (_, levels) => {
    expect(render("en", levels)).toBe("");
  });

  test("shows the ladder as chips, the rule, and a way to read the full ladder", () => {
    const html = render("en", STAMPS);
    const strip = html.slice(0, html.indexOf("<dialog"));

    expect(textOf(strip)).toContain("Your card levels up");
    expect(textOf(strip)).toContain("Fill 2 cards to reach Silver: your reward comes faster.");
    expect(items(strip)).toEqual(["Bronze", "Silver", "Gold"]);
    expect(strip).toMatch(/<button[^>]*>[^<]*How it works/);
  });

  test("the sheet lists every level with its card, rule and perks, and keeps the top level for good", () => {
    const html = render("en", STAMPS);
    const sheet = html.slice(html.indexOf("<dialog"));
    const rows = items(sheet);

    expect(sheet).toContain('aria-labelledby="');
    expect(textOf(sheet)).toContain("How the levels work");
    expect(rows).toHaveLength(3);
    expect(rows[0]).toContain("10 stamps for Free coffee");
    expect(rows[0]).toContain("Fill 2 cards to reach Silver");
    expect(rows[1]).toContain("10% off pastries");
    expect(rows[2]).toContain("Top level: you keep it for good");
  });

  test("a points program has no card line, only the points to earn", () => {
    const points = STAMPS.map((l) => ({
      ...l,
      total_stamps: null,
      reward_name: null,
      advance: l.advance && { points: 500 },
    }));
    const text = textOf(render("en", points, "points"));
    expect(text).toContain("Earn 500 points to reach Silver.");
    expect(text).not.toContain("stamps for");
  });

  test.each([
    ["a cream accent the strip cannot show", "#FFF7ED", "var(--primary)"],
    ["no accent at all", null, "var(--primary)"],
    ["an accent that reads on the strip", "#1d4ed8", "#1d4ed8"],
  ])("draws the top level's star in a colour that shows on the strip: %s", (_, accent, expected) => {
    const html = render("en", STAMPS, "stamps", accent);
    // One star in the strip, one in the sheet; the arrows carry no inline colour.
    const starColors = [...html.matchAll(/<svg[^>]*style="color:([^";]+)/g)].map((m) => m[1]);

    expect(starColors).toEqual([expected, expected]);
    if (accent === "#FFF7ED") expect(html.toLowerCase()).not.toContain("fff7ed");
  });

  test("reads in the visitor's language, level names included", () => {
    const fr = textOf(render("fr", STAMPS));
    expect(fr).toContain("Votre carte monte de niveau");
    expect(fr).toContain("Comment ça marche");
    expect(items(render("fr", STAMPS).slice(0, render("fr", STAMPS).indexOf("<dialog")))).toEqual([
      "Bronze",
      "Argent",
      "Gold",
    ]);

    expect(textOf(render("pl", STAMPS))).toContain("Jak to działa");
  });
});

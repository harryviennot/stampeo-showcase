import { describe, expect, test } from "bun:test";
import { catalogLocales, loadCatalog, strictTranslator } from "./testing/catalogs";
import {
  ladderRows,
  levelName,
  stripLine,
  usableLevels,
  type LevelCopy,
  type PublicLevel,
} from "./levels";

/**
 * The level strip on the sign-up page reads the ladder the backend publishes
 * with the active design. These tests render the real catalogs, so a wrong key,
 * a missing argument or a Polish plural arm that is not there fails here.
 */

const copy = (locale = "en") =>
  strictTranslator(locale, loadCatalog(locale), "acquisition.levels") as unknown as LevelCopy;

function level(rank: number, name: string, over: Partial<PublicLevel> = {}): PublicLevel {
  return {
    rank,
    name,
    translations: {},
    total_stamps: 10,
    reward_name: "Free coffee",
    advance: { fills: 2 },
    perks: [],
    ...over,
  };
}

/** Bronze 10x2, Silver 8x3, Gold 6: each card smaller than the one before. */
const STAMPS: PublicLevel[] = [
  level(1, "Bronze"),
  level(2, "Silver", {
    translations: { fr: { name: "Argent" } },
    total_stamps: 8,
    reward_name: "Coffee and croissant",
    advance: { fills: 3 },
    perks: ["10% off pastries"],
  }),
  level(3, "Gold", { total_stamps: 6, reward_name: "Coffee and pastry", advance: null }),
];

const POINTS: PublicLevel[] = [
  level(1, "Bronze", { total_stamps: null, reward_name: null, advance: { points: 500 } }),
  level(2, "Silver", {
    translations: { fr: "Argent" },
    total_stamps: null,
    reward_name: null,
    advance: { points: 1000 },
    perks: ["Free birthday drink"],
  }),
  level(3, "Gold", { total_stamps: null, reward_name: null, advance: null }),
];

/** Stamp ladder where Silver keeps Bronze's card size, so "faster" would be a lie. */
const withSilver = (over: Partial<PublicLevel>): PublicLevel[] => [
  STAMPS[0],
  { ...STAMPS[1], ...over },
  STAMPS[2],
];

describe("levelName", () => {
  test.each([
    ["an { name } object", { fr: { name: "Argent" } }],
    ["a plain string", { fr: "Argent" }],
  ])("shows the visitor's translation, given as %s", (_, translations) => {
    expect(levelName(level(2, "Silver", { translations }), "fr")).toBe("Argent");
  });

  test("a region-tagged locale falls back to its language", () => {
    expect(levelName(STAMPS[1], "fr-CA")).toBe("Argent");
  });

  test.each([
    ["no translation for this language", STAMPS[1], "pl"],
    ["a blank translation", level(2, "Silver", { translations: { pl: { name: "  " } } }), "pl"],
    ["translations absent", level(2, "Silver", { translations: null }), "fr"],
  ])("keeps the business's own name with %s", (_, silver, locale) => {
    expect(levelName(silver, locale)).toBe("Silver");
  });
});

describe("usableLevels", () => {
  test.each([
    ["absent", undefined],
    ["null (levels are off)", null],
    ["empty", []],
    ["a single level", [level(1, "Bronze")]],
    ["not a list", { rank: 1 }],
  ])("is null when levels are %s", (_, levels) => {
    expect(usableLevels(levels as never)).toBeNull();
  });

  test("orders by rank, whatever order the backend sends", () => {
    const names = usableLevels([STAMPS[2], STAMPS[0], STAMPS[1]])?.map((l) => l.name);
    expect(names).toEqual(["Bronze", "Silver", "Gold"]);
  });

  test("drops a level with no name rather than showing an empty chip", () => {
    const kept = usableLevels([STAMPS[0], level(2, "  "), STAMPS[2]]);
    expect(kept?.map((l) => l.name)).toEqual(["Bronze", "Gold"]);
  });
});

describe("stripLine", () => {
  test("a smaller next card promises the reward sooner", () => {
    expect(stripLine(STAMPS, "stamps", "en", copy())).toBe(
      "Fill 2 cards to reach Silver: your reward comes faster.",
    );
  });

  test.each([
    ["a card of the same size", { total_stamps: 10 }],
    ["a bigger card", { total_stamps: 12 }],
  ])("%s with another reward names that reward instead", (_, over) => {
    expect(stripLine(withSilver(over), "stamps", "en", copy())).toBe(
      "Fill 2 cards to reach Silver and unlock Coffee and croissant.",
    );
  });

  test.each([
    ["the same reward", { total_stamps: 10, reward_name: "Free coffee" }],
    ["the same reward in other letters", { total_stamps: 10, reward_name: " free COFFEE " }],
    ["no reward named", { total_stamps: 10, reward_name: null }],
  ])("a same-size card with %s promises nothing more", (_, over) => {
    expect(stripLine(withSilver(over), "stamps", "en", copy())).toBe("Fill 2 cards to reach Silver.");
  });

  test("one card is singular", () => {
    const one = [{ ...STAMPS[0], advance: { fills: 1 } }, STAMPS[1]];
    expect(stripLine(one, "stamps", "en", copy())).toBe(
      "Fill 1 card to reach Silver: your reward comes faster.",
    );
  });

  test.each([
    [500, "Earn 500 points to reach Silver."],
    [1, "Earn 1 point to reach Silver."],
    [1500, "Earn 1,500 points to reach Silver."],
  ])("a points program says the points: %p", (points, line) => {
    const ladder = [{ ...POINTS[0], advance: { points } }, POINTS[1]];
    expect(stripLine(ladder, "points", "en", copy())).toBe(line);
  });

  test("always describes the first step, whether the ladder has 2 or 5 levels", () => {
    const two = STAMPS.slice(0, 2);
    const five = [...STAMPS, level(4, "Platinum"), level(5, "Diamond")];
    expect(stripLine(two, "stamps", "en", copy())).toBe(stripLine(five, "stamps", "en", copy()));
  });

  test("starts from the lowest rank when the list arrives shuffled", () => {
    expect(stripLine([STAMPS[2], STAMPS[1], STAMPS[0]], "stamps", "en", copy())).toBe(
      "Fill 2 cards to reach Silver: your reward comes faster.",
    );
  });

  test("names the next level in the visitor's language", () => {
    expect(stripLine(STAMPS, "stamps", "fr", copy("fr"))).toBe(
      "Remplissez 2 cartes pour atteindre le niveau Argent : votre récompense arrive plus vite.",
    );
  });

  test.each([
    ["a stamp ladder whose first level has no rule", STAMPS.map((l, i) => (i === 0 ? { ...l, advance: null } : l)), "stamps"],
    ["a points ladder given a stamp rule", STAMPS, "points"],
    ["a stamp ladder given a points rule", POINTS, "stamps"],
    ["a zero rule", [{ ...STAMPS[0], advance: { fills: 0 } }, STAMPS[1]], "stamps"],
  ] as const)("says nothing for %s", (_, ladder, type) => {
    expect(stripLine([...ladder], type, "en", copy())).toBeNull();
  });
});

describe("ladderRows", () => {
  test("a 3-level stamp ladder reads card, move-up rule and perks per level", () => {
    expect(ladderRows(STAMPS, "stamps", "en", copy())).toEqual([
      {
        rank: 1,
        name: "Bronze",
        isTop: false,
        card: "10 stamps for Free coffee",
        moveUp: "Fill 2 cards to reach Silver",
        perks: [],
      },
      {
        rank: 2,
        name: "Silver",
        isTop: false,
        card: "8 stamps for Coffee and croissant",
        moveUp: "Fill 3 cards to reach Gold",
        perks: ["10% off pastries"],
      },
      {
        rank: 3,
        name: "Gold",
        isTop: true,
        card: "6 stamps for Coffee and pastry",
        moveUp: "Top level: you keep it for good",
        perks: [],
      },
    ]);
  });

  test("a points ladder has no card line, only the points to move up", () => {
    const rows = ladderRows(POINTS, "points", "en", copy());
    expect(rows.map((r) => r.card)).toEqual([null, null, null]);
    expect(rows.map((r) => r.moveUp)).toEqual([
      "Earn 500 points to reach Silver",
      "Earn 1,000 points to reach Gold",
      "Top level: you keep it for good",
    ]);
    expect(rows[1].perks).toEqual(["Free birthday drink"]);
  });

  test("a card with no reward named still says its size", () => {
    const [bronze] = ladderRows([{ ...STAMPS[0], reward_name: null }, STAMPS[1]], "stamps", "en", copy());
    expect(bronze.card).toBe("10 stamps per card");
  });

  test("a level with no rule to move up is shown without one", () => {
    const rows = ladderRows([{ ...STAMPS[0], advance: null }, STAMPS[1]], "stamps", "en", copy());
    expect(rows[0].moveUp).toBeNull();
  });

  test.each([2, 5])("a %p-level ladder marks only the last level as the top", (count) => {
    const ladder = Array.from({ length: count }, (_, i) =>
      level(i + 1, `L${i + 1}`, { advance: i === count - 1 ? null : { fills: 2 } }),
    );
    const rows = ladderRows(ladder, "stamps", "en", copy());
    expect(rows).toHaveLength(count);
    expect(rows.map((r) => r.isTop)).toEqual(ladder.map((_, i) => i === count - 1));
    expect(rows[count - 2].moveUp).toBe(`Fill 2 cards to reach L${count}`);
  });

  test("level names, including the one a rule points at, follow the visitor's language", () => {
    const rows = ladderRows(STAMPS, "stamps", "fr", copy("fr"));
    expect(rows.map((r) => r.name)).toEqual(["Bronze", "Argent", "Gold"]);
    expect(rows[0].moveUp).toBe("Remplissez 2 cartes pour atteindre le niveau Argent");
    expect(rows[2].moveUp).toBe("Niveau maximal : vous le gardez pour toujours");
  });

  test("perks are trimmed and blank ones dropped", () => {
    const [bronze] = ladderRows(
      [{ ...STAMPS[0], perks: [" Free refill ", "  ", "Priority line"] }, STAMPS[1]],
      "stamps",
      "en",
      copy(),
    );
    expect(bronze.perks).toEqual(["Free refill", "Priority line"]);
  });
});

describe("every language", () => {
  const locales = catalogLocales();

  test.each(locales)("%s renders every line of both program types", (locale) => {
    const t = copy(locale);
    const variants = [
      STAMPS,
      withSilver({ total_stamps: 10 }),
      withSilver({ total_stamps: 10, reward_name: "Free coffee" }),
    ];
    for (const ladder of variants) {
      expect(stripLine(ladder, "stamps", locale, t)).toBeTruthy();
      expect(ladderRows(ladder, "stamps", locale, t).every((r) => r.card && r.moveUp)).toBe(true);
    }
    expect(stripLine(POINTS, "points", locale, t)).toBeTruthy();
    expect(ladderRows(POINTS, "points", locale, t).every((r) => r.moveUp)).toBe(true);
  });

  // Polish has one / few / many forms; every count that picks a different one.
  test.each([
    [1, "1 kartę", "1 punkt"],
    [2, "2 karty", "2 punkty"],
    [5, "5 kart", "5 punktów"],
    [22, "22 karty", "22 punkty"],
    [25, "25 kart", "25 punktów"],
  ])("Polish agrees cards and points with %p", (n, cards, points) => {
    const t = copy("pl");
    const stamps = [{ ...STAMPS[0], advance: { fills: n } }, STAMPS[1]];
    const pts = [{ ...POINTS[0], advance: { points: n } }, POINTS[1]];
    expect(stripLine(stamps, "stamps", "pl", t)).toContain(`Wypełnij ${cards}, aby osiągnąć poziom Silver`);
    expect(stripLine(pts, "points", "pl", t)).toContain(`Zdobądź ${points}, aby osiągnąć poziom Silver`);
  });

  test.each([
    [1, "Karta na 1 pieczątkę"],
    [3, "Karta na 3 pieczątki"],
    [10, "Karta na 10 pieczątek"],
  ])("Polish agrees the card size with %p stamps", (n, line) => {
    const [bronze] = ladderRows([{ ...STAMPS[0], total_stamps: n, reward_name: null }, STAMPS[1]], "stamps", "pl", copy("pl"));
    expect(bronze.card).toBe(line);
  });

  test("Spanish and French read natively, not as English", () => {
    expect(stripLine(STAMPS, "stamps", "es", copy("es"))).toBe(
      "Completa 2 tarjetas para llegar al nivel Silver: tu recompensa llega antes.",
    );
    expect(stripLine(POINTS, "points", "fr", copy("fr"))).toBe(
      "Gagnez 500 points pour atteindre le niveau Argent.",
    );
  });
});

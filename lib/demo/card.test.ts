import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { stampIcons } from "@/components/onboarding/StampIconPicker";
import { catalogLocales, loadCatalog } from "../testing/catalogs";
import {
  DEMO_POINTS_DESIGN,
  DEMO_POINTS_REWARD_ICONS,
  DEMO_STAMP_CONFIG,
  DEMO_STAMP_DESIGN,
  DEMO_STICKER_SLOTS,
} from "./card";

const PUBLIC = join(import.meta.dir, "..", "..", "public");

// What the demo card must never say: a free month, a discount or a trial length. They are not real rewards.
const L = String.raw`\p{L}`;
const word = (alternatives: string) => new RegExp(String.raw`(?<!${L})(?:${alternatives})(?!${L})`, "iu");
const NOT_A_REWARD: Record<string, RegExp> = {
  month: word("months?|mois|mes(?:es)?|miesi\\p{L}*"),
  percent: /%/,
  days: word("days?|jours?|d[ií]as?|dni|dzie[nń]"),
  free: word("free|gratuit\\p{L}*|gratis|darmo"),
  trial: word("trials?|essais?|prueba|pr[oó]bn\\p{L}*"),
  tokenForATrialLength: /\{\s*trialDays/,
};

/** The reward and completion strings on the demo card and in the panel under it. */
const CARD_WORDS = [
  "common.rewardText",
  "common.rewarded",
  "landing.hero.points.rewardMid",
  "landing.hero.points.rewardTop",
  "landing.hero.points.rewardAllUnlocked",
  "landing.hero.stamp.complete",
  "landing.hero.points.complete",
];

const at = (tree: unknown, path: string): unknown =>
  path.split(".").reduce<unknown>((node, key) => (node as Record<string, unknown> | undefined)?.[key], tree);

describe("the demo card's words", () => {
  const locales = catalogLocales();

  test("every locale is checked", () => {
    expect(locales.sort()).toEqual(["en", "es", "fr", "pl"]);
  });

  test.each(locales.flatMap((locale) => CARD_WORDS.map((key) => [locale, key] as const)))(
    "%s %s names no free month, discount or trial length",
    (locale, key) => {
      const text = at(loadCatalog(locale), key);
      expect(typeof text).toBe("string");
      const hits = Object.entries(NOT_A_REWARD)
        .filter(([, pattern]) => pattern.test(text as string))
        .map(([name]) => name);
      expect(hits).toEqual([]);
    },
  );

  test("the guard catches free months, discounts and trial lengths", () => {
    for (const text of [
      "30 days free with 8 stamps!",
      "-50% off your 1st month",
      "{trialDays} jours gratuits",
      "Vous avez droit à {trialDays} jours gratuits !",
      "-50 % en tu 1er mes",
      "¡Tienes {trialDays} días gratis!",
      "Masz {trialDays, plural, one {# dzień} other {# dni}} za darmo!",
      "-50% na pierwszy miesiąc",
      "Free trial",
      "Essai gratuit",
      "Prueba gratis",
      "Okres próbny",
    ]) {
      expect(Object.values(NOT_A_REWARD).some((pattern) => pattern.test(text))).toBe(true);
    }
  });
});

describe("the demo card's stickers", () => {
  test("slots run café, bakery, pizzeria, bubble tea, gelato, groomer, florist, then the Stampeo seal", () => {
    expect([...DEMO_STICKER_SLOTS]).toEqual(["cup", "croissant", "pizza", "boba", "gelato", "paw", "tulip", "seal"]);
    expect(DEMO_STAMP_DESIGN.total_stamps).toBe(8);
    expect(DEMO_STAMP_DESIGN.stamp_icon_mode).toBe("custom");
    expect(DEMO_STAMP_CONFIG.icons.map((icon) => icon.processed_url)).toEqual(
      DEMO_STICKER_SLOTS.map((slot) => `/demo/stickers/${slot}.png`),
    );
  });

  test("every slot has its own grey twin for the empty state", () => {
    expect(DEMO_STAMP_CONFIG.empty_mode).toBe("greyscale");
    expect(DEMO_STAMP_CONFIG.icons.map((icon) => icon.greyscale_url)).toEqual(
      DEMO_STICKER_SLOTS.map((slot) => `/demo/stickers/${slot}-grey.png`),
    );
  });

  test("every sticker, grey twin and the wallpaper the card points at exists in public/", () => {
    const urls = [
      ...DEMO_STAMP_CONFIG.icons.flatMap((icon) => [icon.processed_url, icon.greyscale_url]),
      DEMO_POINTS_DESIGN.strip_background_url as string,
    ];
    expect(urls).toHaveLength(DEMO_STICKER_SLOTS.length * 2 + 1);
    expect(urls.filter((url) => !existsSync(join(PUBLIC, url)))).toEqual([]);
  });
});

describe("the demo card's points markers", () => {
  test("a waving hand at 60 and a heart at 120, the same presets the Wallet pass uses", () => {
    expect(DEMO_POINTS_REWARD_ICONS).toEqual({
      r_mid: { type: "preset", ref: "hand-waving" },
      r_top: { type: "preset", ref: "heart" },
    });
    expect(DEMO_POINTS_DESIGN.points_reward_icons).toBe(DEMO_POINTS_REWARD_ICONS);
  });

  test("both presets are glyphs the card can draw", () => {
    const known = new Set(stampIcons.map((icon) => icon.id));
    for (const { ref } of Object.values(DEMO_POINTS_REWARD_ICONS)) expect(known.has(ref)).toBe(true);
  });
});

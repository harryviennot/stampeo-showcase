/**
 * The level ladder as the public sign-up page shows it: one rung per level,
 * read from `GET /designs/{business}/active`. Pure helpers, no React, so the
 * wording rules are tested without a browser (`levels.test.ts`).
 *
 * A new customer always starts on the first level, so the strip's one-liner
 * describes the first step. The sheet lists the whole ladder.
 */

export type LevelProgramType = "stamps" | "points";

/** One level, exactly as the backend publishes it (no ids, no customer data). */
export interface PublicLevel {
  rank: number;
  name: string;
  /** Locale to the level's name there: a plain string or `{ name }`. */
  translations?: Record<string, string | { name?: string | null } | null> | null;
  /** Stamp programs: the card size. Points programs: null. */
  total_stamps: number | null;
  /** Stamp programs: what a full card gives. Points programs: null. */
  reward_name: string | null;
  /** How to leave this level: cards to fill (stamps) or points to earn. Null on the top level. */
  advance: { fills?: number | null; points?: number | null } | null;
  /** Primary-language lines; the backend does not publish perk translations. */
  perks: string[];
}

/** The `acquisition.levels` keys these helpers read. */
export type LevelCopyKey =
  | "lineStampsFaster"
  | "lineStampsUnlock"
  | "lineStamps"
  | "linePoints"
  | "cardStamps"
  | "cardStampsNoReward"
  | "moveUpStamps"
  | "moveUpPoints"
  | "keepForGood";

/** A next-intl translator namespaced at `acquisition.levels`. */
export type LevelCopy = (key: LevelCopyKey, values?: Record<string, string | number>) => string;

export interface LadderRow {
  rank: number;
  name: string;
  isTop: boolean;
  /** "10 stamps for Free coffee"; null on a points ladder. */
  card: string | null;
  /** How to reach the next level, or that the top level is kept for good. Null when unknown. */
  moveUp: string | null;
  perks: string[];
}

/**
 * The ladder in rank order, or null when it is not worth showing: levels off
 * (null), an older backend (absent), or fewer than two named levels.
 */
export function usableLevels(levels: PublicLevel[] | null | undefined): PublicLevel[] | null {
  if (!Array.isArray(levels)) return null;
  const named = levels.filter((l) => l && typeof l.name === "string" && l.name.trim() !== "");
  if (named.length < 2) return null;
  return [...named].sort((a, b) => a.rank - b.rank);
}

/** The level's name for the visitor: their language's translation, else the business's own. */
export function levelName(level: PublicLevel, locale: string): string {
  const translations = level.translations;
  if (translations && typeof translations === "object") {
    for (const key of new Set([locale, locale.split("-")[0].toLowerCase()])) {
      const entry = translations[key];
      const text = typeof entry === "string" ? entry : entry?.name;
      if (typeof text === "string" && text.trim()) return text.trim();
    }
  }
  return level.name.trim();
}

/** A whole number of at least 1, else null. */
function whole(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) && value > 0 ? value : null;
}

const sameText = (a: string, b: string) => a.trim().toLocaleLowerCase() === b.trim().toLocaleLowerCase();

/** What it takes to leave `level`, in the unit of the program, or null when it has no valid rule. */
function moveUpAmount(level: PublicLevel, programType: LevelProgramType): number | null {
  return whole(programType === "points" ? level.advance?.points : level.advance?.fills);
}

/**
 * The one line under the chips: what it takes to leave the first level.
 *
 * Stamps: a smaller next card promises the reward sooner. A next card that is
 * not smaller promises its reward when that differs, and nothing more when it
 * does not. Null when the first level has no usable rule.
 */
export function stripLine(
  levels: PublicLevel[],
  programType: LevelProgramType,
  locale: string,
  t: LevelCopy,
): string | null {
  const ladder = usableLevels(levels);
  if (!ladder) return null;
  const [first, next] = ladder;
  const count = moveUpAmount(first, programType);
  if (!count) return null;
  const level = levelName(next, locale);

  if (programType === "points") return t("linePoints", { count, level });

  const smaller =
    typeof first.total_stamps === "number" &&
    typeof next.total_stamps === "number" &&
    next.total_stamps < first.total_stamps;
  if (smaller) return t("lineStampsFaster", { count, level });

  const reward = next.reward_name?.trim();
  if (reward && !sameText(reward, first.reward_name ?? "")) {
    return t("lineStampsUnlock", { count, level, reward });
  }
  return t("lineStamps", { count, level });
}

/** One row per level for the sheet: card summary, move-up rule and perks. */
export function ladderRows(
  levels: PublicLevel[],
  programType: LevelProgramType,
  locale: string,
  t: LevelCopy,
): LadderRow[] {
  const ladder = usableLevels(levels) ?? [];
  return ladder.map((level, index) => {
    const upcoming = ladder[index + 1];
    const isTop = !upcoming;
    const amount = moveUpAmount(level, programType);

    let moveUp: string | null = null;
    if (isTop) moveUp = t("keepForGood");
    else if (amount) {
      const values = { count: amount, level: levelName(upcoming, locale) };
      moveUp = t(programType === "points" ? "moveUpPoints" : "moveUpStamps", values);
    }

    let card: string | null = null;
    const size = whole(level.total_stamps);
    if (programType === "stamps" && size) {
      const reward = level.reward_name?.trim();
      card = reward ? t("cardStamps", { count: size, reward }) : t("cardStampsNoReward", { count: size });
    }

    return {
      rank: level.rank,
      name: levelName(level, locale),
      isTop,
      card,
      moveUp,
      perks: (level.perks ?? []).map((perk) => perk.trim()).filter(Boolean),
    };
  });
}

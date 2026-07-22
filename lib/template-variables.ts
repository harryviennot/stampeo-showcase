/**
 * Pass-field template rendering for the public enrollment card preview.
 *
 * Card designs may carry `{{variable}}` placeholders in field labels and
 * values (canonical keys, mirroring web/src/lib/template-variables.ts and
 * the backend renderer). The enrollment page substitutes them with the
 * real program data it already has (stamp goal, reward name, head-start
 * stamps) plus a sample cardholder, so visitors see a realistic card
 * instead of raw placeholder syntax.
 */

const VARIABLE_PATTERN = /\{\{(\w+)\}\}/g;

export interface PassFieldLike {
  key: string;
  label: string;
  value: string;
}

export interface PreviewContext {
  stampCount: number;
  totalStamps: number;
  rewardName?: string | null;
  businessName?: string | null;
  /** Sample cardholder first name shown on the preview. */
  sampleFirstName?: string;
  /** Points-program preview values (only set for points cards). */
  pointsBalance?: number;
  pointsToNext?: number;
  nextRewardName?: string | null;
  /** Absolute point value of the next reward milestone (real program data). */
  nextRewardPoints?: number;
  /** Name of the most recently earned reward (multi-reward ladders). */
  lastRewardName?: string | null;
  /** Sample store location for the (Pro-only) {{store_location}} placeholder. */
  storeLocation?: string;
}

/**
 * Sample values for every canonical {{variable}}. Real program data (stamp
 * goal, reward name, point thresholds) comes straight from the design; the
 * customer-specific placeholders — which have no real value before signup —
 * fall back to believable samples so the preview never shows raw syntax.
 * Keys mirror web/src/lib/template-variables.ts VARIABLE_KEYS.
 */
function buildValues(ctx: PreviewContext): Record<string, string> {
  const rewardName = ctx.rewardName ?? "";
  return {
    stamp_count: String(ctx.stampCount),
    total_stamps: String(ctx.totalStamps),
    stamps_left: String(Math.max(0, ctx.totalStamps - ctx.stampCount)),
    rewards_count: "0",
    reward_name: rewardName,
    business_name: ctx.businessName ?? "",
    customer_first_name: ctx.sampleFirstName ?? "Sarah",
    store_location: ctx.storeLocation ?? ctx.businessName ?? "",
    points_balance: String(ctx.pointsBalance ?? 0),
    points_to_next: String(ctx.pointsToNext ?? 0),
    next_reward_points: String(ctx.nextRewardPoints ?? 0),
    next_reward_name: ctx.nextRewardName ?? rewardName,
    last_reward_name: ctx.lastRewardName ?? ctx.nextRewardName ?? rewardName,
  };
}

/**
 * Locale-appropriate sample first names for the preview cardholder. A visitor
 * hasn't signed up yet, so there's no real name — we show a believable one and
 * vary it per business (seeded, so it stays stable across renders and never
 * causes an SSR/client hydration mismatch).
 */
const SAMPLE_FIRST_NAMES: Record<string, string[]> = {
  en: ["Sarah", "James", "Emma", "Liam", "Olivia", "Noah", "Ava", "Ethan"],
  fr: ["Jeanne", "Louis", "Emma", "Hugo", "Camille", "Léa", "Nathan", "Chloé"],
  es: ["Lucía", "Mateo", "Sofía", "Diego", "Valentina", "Hugo", "Martina", "Pablo"],
};

/** Deterministic FNV-style hash so a given seed always maps to the same name. */
function hashSeed(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(h, 31) + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/** Pick a stable sample cardholder name for `locale`, varied by `seed`. */
export function pickSampleName(locale: string, seed: string): string {
  const pool = SAMPLE_FIRST_NAMES[locale] ?? SAMPLE_FIRST_NAMES.en;
  return pool[hashSeed(seed) % pool.length];
}

function renderText(text: string, values: Record<string, string>): string {
  return text.replace(VARIABLE_PATTERN, (match, key: string) => values[key] ?? match);
}

/**
 * Render a design field array for the preview. Mirrors the backend: a field
 * whose rendered VALUE is empty is dropped entirely (label included).
 */
export function renderPreviewFields(
  fields: PassFieldLike[] | undefined,
  ctx: PreviewContext
): PassFieldLike[] {
  if (!fields?.length) return [];
  const values = buildValues(ctx);
  const rendered: PassFieldLike[] = [];
  for (const f of fields) {
    const value = renderText(f.value ?? "", values).trim();
    if (!value) continue;
    rendered.push({
      key: f.key,
      label: renderText(f.label ?? "", values).trim(),
      value,
    });
  }
  return rendered;
}

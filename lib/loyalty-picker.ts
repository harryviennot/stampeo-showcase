/**
 * Pure logic for the "Stamps or Points?" picker on the loyalty-programs page.
 * No React, no i18n — the UI supplies the localized text and maps each chosen
 * option to an `Answer`; this file only scores answers into a recommendation.
 * Kept pure so it is unit-testable (see loyalty-picker.test.ts).
 */

export type Engine = "stamps" | "points" | "either";
export type Answer = "stamps" | "points" | "neutral";

export interface PickerOption {
  /** Stable id — the UI reads its label from i18n by index. */
  id: string;
  answer: Answer;
}

export interface PickerQuestion {
  /** Stable id — the UI reads the question text from i18n by index. */
  id: string;
  options: PickerOption[];
}

/**
 * Three questions. Order + option order MUST match
 * loyalty.picker.questions[] in every messages/{locale}/loyalty.json.
 */
export const PICKER_QUESTIONS: PickerQuestion[] = [
  {
    // "Do your prices change much from one purchase to the next?"
    id: "price",
    options: [
      { id: "similar", answer: "stamps" },
      { id: "varies", answer: "points" },
    ],
  },
  {
    // "How do customers come, and what's the basket like?"
    id: "frequency",
    options: [
      { id: "frequent_small", answer: "stamps" },
      { id: "occasional_large", answer: "points" },
    ],
  },
  {
    // "Which reward feels right for your customers?"
    id: "reward",
    options: [
      { id: "free_item", answer: "stamps" },
      { id: "choice", answer: "points" },
      { id: "unsure", answer: "neutral" },
    ],
  },
];

/**
 * Per-question weight. Price variability is the strongest signal for stamps vs
 * points, so it counts double; the other two are tie-breakers.
 */
export const QUESTION_WEIGHTS = [2, 1, 1];

export interface Recommendation {
  engine: Engine;
  stampScore: number;
  pointsScore: number;
}

/**
 * Score one answer per question into a recommendation. Equal scores (including
 * all-neutral) return "either" — we present both and nudge toward stamps as the
 * simpler default in the UI copy.
 */
export function recommendEngine(answers: Answer[]): Recommendation {
  let stampScore = 0;
  let pointsScore = 0;

  answers.forEach((answer, index) => {
    const weight = QUESTION_WEIGHTS[index] ?? 1;
    if (answer === "stamps") stampScore += weight;
    else if (answer === "points") pointsScore += weight;
    // "neutral" contributes nothing.
  });

  let engine: Engine;
  if (stampScore === pointsScore) engine = "either";
  else engine = stampScore > pointsScore ? "stamps" : "points";

  return { engine, stampScore, pointsScore };
}

/**
 * Business type → recommended engine. Labels + rationale come from i18n
 * (loyalty.businessMap.items keyed by `key`).
 */
export const BUSINESS_ENGINE_MAP: { key: string; engine: "stamps" | "points" }[] = [
  { key: "cafe", engine: "stamps" },
  { key: "bakery", engine: "stamps" },
  { key: "salon", engine: "stamps" },
  { key: "carwash", engine: "stamps" },
  { key: "restaurant", engine: "points" },
  { key: "retail", engine: "points" },
  { key: "grocery", engine: "points" },
  { key: "wine", engine: "points" },
];

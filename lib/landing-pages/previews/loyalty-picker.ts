import { PICKER_QUESTIONS, recommendEngine, type Engine } from "@/lib/loyalty-picker";

/** The picker's last question (regulars) decides on levels; its first option is "Yes, quite a few". */
export const REGULARS_YES = 0;

/** How many questions the picker asks: the three that score stamps against points, then the regulars one. */
export const PICKER_TOTAL = PICKER_QUESTIONS.length + 1;

/** What the picker suggests: a program, and whether to add levels on top. */
export interface PickerSuggestion {
  program: Engine;
  levels: boolean;
}

/**
 * The suggestion for the options a visitor chose, one index per question in order. The first three are
 * scored by `recommendEngine`; an index that is not an option counts as no answer.
 */
export function suggestProgram(choices: readonly number[]): PickerSuggestion {
  const answers = PICKER_QUESTIONS.map((question, index) => question.options[choices[index]]?.answer ?? "neutral");

  return {
    program: recommendEngine(answers).engine,
    levels: choices[PICKER_QUESTIONS.length] === REGULARS_YES,
  };
}

/** What a pick tells PostHog: the question and the option as ids that read the same in every language, and the program the quiz settles on when this was its last question. */
export interface QuizPick {
  question: string;
  answer: string;
  result: Engine | null;
}

/** The pick of `option` as the question after `choices`; the regulars question is the one after the scored three. */
export function quizPick(choices: readonly number[], option: number): QuizPick {
  const asked = PICKER_QUESTIONS[choices.length];

  if (asked) return { question: asked.id, answer: asked.options[option]?.id ?? "none", result: null };
  return {
    question: "regulars",
    answer: option === REGULARS_YES ? "yes" : "no",
    result: suggestProgram([...choices, option]).program,
  };
}

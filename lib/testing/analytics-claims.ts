/**
 * What copy beside a screenshot of the Analytics page may not say. Analytics
 * shows totals: no per-customer prediction or profile, no money for a stamp
 * card, nothing Pro-only on a Growth capture, no export, and it refreshes
 * every ten minutes, so it is not "live". Used by the landing and Analytics
 * feature-page copy tests.
 */
import { PLAN_NAMES, TIERS } from "../plans/plan-facts";
import type { TierId } from "../pricing";
import { catalogStrings } from "./catalogs";

const END = "(?![\\p{L}\\p{N}])";

export const OFF_PICTURE: Record<string, RegExp> = {
  prediction: new RegExp(
    `\\bwill (?:come back|return)\\b|\\bcoming back (?:tomorrow|next)|\\brevien(?:dra|dront|t demain)${END}|\\bvolver(?:á|án)${END}|\\bvuelve mañana|\\bwróc(?:i|ą)${END}|\\bwraca jutro`,
    "iu",
  ),
  customerName: /\p{Lu}\p{Ll}+ \p{Lu}\./u,
  money: /[€$£]|\bspen[dt]|\bdépens|\bgast(?:o|an|ado)|\bwyda(?:ją|tki|tek)/i,
  proOnly: new RegExp(
    `cohort|kohort|per[- ]location|par établissement|por local|każdego lokalu|\\b1[- ]year|\\bun an\\b|\\b12 mois|\\bun año|\\b12 meses|\\b1 rok${END}|\\b12 miesięcy`,
    "iu",
  ),
  export: /export|eksport/i,
};

/** Calls Analytics live or real-time (the Activity page is live; Analytics is not). */
export const REAL_TIME = /real[- ]time|\blive\b|en direct|temps réel|tiempo real|en directo|na żywo|czasie rzeczywistym/i;

/** Frames Analytics around individual customers rather than totals. */
export const PER_CUSTOMER = new RegExp(
  `\\bwho (?:comes back|drifts|stopped)|top customers|know your regulars|\\bqui (?:revient|décroche|a arrêté)|connaissez vos habitués|quién (?:vuelve|se aleja|dejó|ha dejado)|conoce a tus habituales|\\bkto (?:wraca|nie|przestał)|poznaj swoich stałych`,
  "iu",
);

/** Every string of a catalog subtree that breaks one of `rules`, as "rule at path: text". */
export function claimOffenders(tree: unknown, root: string, rules: Record<string, RegExp>): string[] {
  return catalogStrings(tree, root).flatMap(({ where, text }) =>
    Object.entries(rules)
      .filter(([, pattern]) => pattern.test(text))
      .map(([rule]) => `${rule} at ${where}: ${text}`),
  );
}

/** The plans a line names, in the order it names them. */
export function plansNamed(line: string): TierId[] {
  const at = (tier: TierId) => line.search(new RegExp(`\\b${PLAN_NAMES[tier]}\\b`));
  return TIERS.filter((tier) => at(tier) >= 0).sort((a, b) => at(a) - at(b));
}

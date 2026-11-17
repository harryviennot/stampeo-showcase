import { PROOF_ITEMS } from "../proof";

/** One figure of the row: its value over its label, and the study it comes from when it is a measurement. */
export interface NumberFigure {
  value: string;
  label: string;
  source?: string;
}

/**
 * The row of "By the numbers": the businesses and countries counts of the site's `variant.metrics` catalog (found
 * by their position, the same in every language, so a longer catalog changes nothing), then the page's own measured
 * figures, without the study line they come from (it stays in the copy as the record). It throws when the catalog
 * has lost one of the counts: a page without its figure must fail, not print a hole.
 */
export function numbersRow(
  catalog: ReadonlyArray<{ value: string; label: string }>,
  measured: ReadonlyArray<{ value: string; text: string }>,
): NumberFigure[] {
  const count = (figure: keyof typeof PROOF_ITEMS) => {
    const item = catalog[PROOF_ITEMS[figure]];
    if (!item) throw new Error(`variant.metrics.items has no ${figure} item`);
    return { value: item.value, label: item.label };
  };

  return [
    count("businesses"),
    count("countries"),
    ...measured.map(({ value, text }) => ({ value, label: text })),
  ];
}

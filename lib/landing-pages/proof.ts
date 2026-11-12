/** The labels of the two `variant.metrics` figures the hero proof line quotes. */
export const PROOF_LABELS = {
  businesses: /business/i,
  countries: /countr/i,
} as const;

/**
 * The businesses and countries figures out of the `variant.metrics.items`
 * catalog entries, found by label so a reordered catalog cannot swap them. It
 * throws when one is gone: a page without its figure must fail, not print
 * "undefined".
 */
export function proofFigures(items: ReadonlyArray<{ value: string; label: string }>) {
  const valueOf = (label: RegExp) => {
    const item = items.find((candidate) => label.test(candidate.label));
    if (!item) throw new Error(`variant.metrics.items has no item labelled ${label}`);
    return item.value;
  };

  return {
    businesses: valueOf(PROOF_LABELS.businesses),
    countries: valueOf(PROOF_LABELS.countries),
  };
}

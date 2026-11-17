/**
 * Where, in the `variant.metrics.items` catalog, the businesses and the countries figures sit: the catalog lists
 * businesses, stamps, countries in that order in every language, so the position names the figure whatever the
 * words of its label are.
 */
export const PROOF_ITEMS = {
  businesses: 0,
  countries: 2,
} as const;

/**
 * The businesses and countries figures out of the `variant.metrics.items`
 * catalog entries. It throws when one is gone: a page without its figure must
 * fail, not print "undefined".
 */
export function proofFigures(items: ReadonlyArray<{ value: string; label: string }>) {
  const valueOf = (figure: keyof typeof PROOF_ITEMS) => {
    const item = items[PROOF_ITEMS[figure]];
    if (!item) throw new Error(`variant.metrics.items has no ${figure} item`);
    return item.value;
  };

  return {
    businesses: valueOf("businesses"),
    countries: valueOf("countries"),
  };
}

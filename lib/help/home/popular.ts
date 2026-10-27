/**
 * The pages offered before a reader has typed anything: the first rows of the
 * help home and the empty search. Curated, in this order; a slug with no
 * published page is skipped, so the list can name pages before they exist.
 */
export const POPULAR_SLUGS: readonly string[] = [
  "how-stampeo-works",
  "create-your-account",
  "install-the-scanner-app",
  "add-stamps",
  "add-a-team-member",
  "stamps-or-points",
  "plans-and-limits",
  "roles",
];

/** The popular slugs among `available`, in the curated order. */
export function popularSlugs(available: Iterable<string>, limit = POPULAR_SLUGS.length): string[] {
  const have = new Set(available);
  return POPULAR_SLUGS.filter((slug) => have.has(slug)).slice(0, limit);
}

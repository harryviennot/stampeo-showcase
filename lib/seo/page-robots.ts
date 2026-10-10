/**
 * `robots` values for pages that must stay out of search results.
 *
 * Every route listed in `PRIVATE_SEGMENTS` / `PRIVATE_SUBPATHS`
 * (`lib/consent-routes.ts`) declares NOINDEX in its page or layout;
 * `page-robots.test.ts` enforces it.
 */

/** Private routes: nothing to index and nothing worth following. */
export const NOINDEX = { index: false, follow: false } as const;

/** Merchant enrolment pages: kept out of the index, their links still followed. */
export const NOINDEX_FOLLOW = { index: false, follow: true } as const;

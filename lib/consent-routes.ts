import { routing } from "@/i18n/routing";

/**
 * Where a tracker may fire, and therefore where the consent banner appears.
 *
 * An ALLOWLIST, deliberately. `app/[locale]/[slug]` is the catch-all
 * acquisition route: any segment under a locale that is not named here is a
 * business's own enrollment page, reached by scanning a QR code on their
 * counter. Those visitors are our customers' customers. Missing a conversion
 * on `/pricing` because someone forgot to add a segment is a gap in a
 * dashboard; sending a café's customers to Meta because someone forgot to
 * exclude one is not something that can be taken back.
 *
 * `lib/robots.ts` documents the same collision from the other side: a bare
 * prefix rule for `/auth` also matches the business slugged `authentic-cafe`.
 * So matching here is on the whole first segment, never on a prefix.
 *
 * Both tables are pinned to the real route folders by `consent-routes.test.ts`,
 * in both directions — a new page under `app/[locale]/` fails the suite until
 * someone decides which side it belongs on.
 */

/** Segments that are ours, public, and may carry a tracker. */
export const MARKETING_SEGMENTS: ReadonlySet<string> = new Set([
  "about",
  "blog",
  "changelog",
  "contact",
  "demo",
  "features",
  "founding-partner",
  // The loyalty-program page is four sibling folders, one per locale, rather
  // than one route with a translated slug. All four have to be listed.
  "loyalty-programs",
  "program-lojalnosciowy",
  "programa-de-fidelizacion",
  "programme-fidelite",
  "programme-fondateur",
  "pricing",
  "privacy",
  "terms",
  // Country pilots. Served at locale-free URLs by a middleware rewrite, so
  // they arrive here as a first segment, not as a locale.
  "uk",
  "us",
]);

/**
 * Segments that are ours but private: no tag fires, so there is nothing to
 * consent to and the banner would only interrupt someone mid-signup or
 * unsubscribing from an email.
 */
export const PRIVATE_SEGMENTS: ReadonlySet<string> = new Set([
  "email-preferences",
  "login",
  "onboarding",
  "reset-password",
]);

const LOCALES: ReadonlySet<string> = new Set(routing.locales);

/**
 * May a tracker fire on this path, and should the banner be offered here?
 *
 * One predicate for both questions, because they are the same question: the
 * banner exists to gate the tags, so it belongs exactly where a tag could run.
 *
 * Takes the BROWSER path (`usePathname()` from `next/navigation`), not the
 * rewritten one. `/us/pricing` is rewritten to `/en/us/pricing` on the server
 * but the URL bar — and therefore the client — still says `/us/pricing`.
 */
export function isTrackablePath(pathname: string): boolean {
  if (!pathname.startsWith("/")) return false;
  if (pathname.includes("..")) return false;
  if (pathname.includes("//")) return false;

  const path = pathname.split(/[?#]/)[0].replace(/\/+$/, "");
  if (path === "") return true; // the home page

  const segments = path.slice(1).split("/");
  // Strip a leading locale. French is unprefixed today (`as-needed`), but all
  // four are stripped so a routing change cannot silently reclassify a page.
  if (LOCALES.has(segments[0])) segments.shift();
  if (segments.length === 0) return true; // a locale home page

  // Private segments are rejected BEFORE the allowlist rather than by falling
  // through it. Falling through would give the same answer today and make the
  // table decorative: emptying PRIVATE_SEGMENTS would change nothing, and the
  // test asserting `/onboarding` is untracked would pass for the wrong reason.
  if (PRIVATE_SEGMENTS.has(segments[0])) return false;

  return MARKETING_SEGMENTS.has(segments[0]);
}

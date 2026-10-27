import { routing } from "@/i18n/routing";

/**
 * Where a tracker may fire, and therefore where the consent banner appears.
 *
 * Two kinds of tracker, asked about separately: ANALYTICS (GA4) measures our
 * own pages; ADVERTISING (the Meta pixel, Meta and Google Ads events, the paid
 * click) hands a visitor to an ad platform. A path belongs to one of three
 * classes: marketing (both), analytics-only (analytics, never advertising), or
 * neither.
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
 * All three tables are pinned to the real route folders by
 * `consent-routes.test.ts`, in both directions — a new page under
 * `app/[locale]/` fails the suite until someone decides which class it belongs
 * to.
 */

/** Segments that are ours, public, and may carry any tracker. */
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
  // The forwarding page the in-app browser escape lands on: it records the
  // ad click like a landing page, then moves on to the (private) sign-up.
  "start",
  "terms",
  // Country pilots. Served at locale-free URLs by a proxy rewrite, so
  // they arrive here as a first segment, not as a locale.
  "uk",
  "us",
]);

/**
 * Segments that are ours and public, where analytics may run and advertising
 * may NOT. The help center: some of its pages are read by a shop's own
 * customers, who must never reach an ad platform because of it.
 */
export const ANALYTICS_ONLY_SEGMENTS: ReadonlySet<string> = new Set(["help"]);

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

/**
 * Private routes below a marketing segment, as `[segment, child]`: the demo
 * wallet page carries a session token in its path, and a tag would send that
 * path to an ad platform.
 */
export const PRIVATE_SUBPATHS: ReadonlyArray<readonly [segment: string, child: string]> = [
  ["demo", "wallet-select"],
];

const LOCALES: ReadonlySet<string> = new Set(routing.locales);

type RouteClass = "marketing" | "analytics-only" | "none";

/**
 * Which class this path is in.
 *
 * Takes the BROWSER path (`usePathname()` from `next/navigation`), not the
 * rewritten one. `/us/pricing` is rewritten to `/en/us/pricing` on the server
 * but the URL bar — and therefore the client — still says `/us/pricing`.
 */
function routeClass(pathname: string): RouteClass {
  if (!pathname.startsWith("/")) return "none";
  if (pathname.includes("..")) return "none";
  if (pathname.includes("//")) return "none";

  const path = pathname.split(/[?#]/)[0].replace(/\/+$/, "");
  if (path === "") return "marketing"; // the home page

  const segments = path.slice(1).split("/");
  // Strip a leading locale. French is unprefixed today (`as-needed`), but all
  // four are stripped so a routing change cannot silently reclassify a page.
  if (LOCALES.has(segments[0])) segments.shift();
  if (segments.length === 0) return "marketing"; // a locale home page

  // Private segments are rejected BEFORE the allowlist rather than by falling
  // through it. Falling through would give the same answer today and make the
  // table decorative: emptying PRIVATE_SEGMENTS would change nothing, and the
  // test asserting `/onboarding` is untracked would pass for the wrong reason.
  if (PRIVATE_SEGMENTS.has(segments[0])) return "none";
  if (PRIVATE_SUBPATHS.some(([segment, child]) => segments[0] === segment && segments[1] === child)) {
    return "none";
  }

  if (MARKETING_SEGMENTS.has(segments[0])) return "marketing";
  if (ANALYTICS_ONLY_SEGMENTS.has(segments[0])) return "analytics-only";
  return "none";
}

/** May an analytics tag (GA4) run on this path? */
export function mayRunAnalytics(pathname: string): boolean {
  return routeClass(pathname) !== "none";
}

/**
 * May an advertising tag run on this path: the Meta pixel, a Meta or Google
 * Ads event, the paid-click carrier?
 */
export function mayRunAdvertising(pathname: string): boolean {
  return routeClass(pathname) === "marketing";
}

/**
 * May ANY tag run on this path? The consent banner is offered exactly there,
 * because it exists to gate the tags: asking where nothing can run would only
 * interrupt the visitor.
 */
export function mayRunAnyTag(pathname: string): boolean {
  return routeClass(pathname) !== "none";
}

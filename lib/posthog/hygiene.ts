import { acquisitionSlug, isSupportedLocale } from "../locale-negotiation";
import { carriesSessionToken, scrubPostHogEvent } from "../privacy/credential-params";

/**
 * Which pages PostHog stays off, and what it sends from the rest. A business's
 * enrollment page (`/{slug}` and `/{slug}/l/{store}`, with or without a
 * language prefix) is a customer of that business joining its loyalty card, so
 * nothing from it is captured; a page opened with a sign-in token in its
 * address gets no analytics either.
 */

/** Whether `pathname` is a business's enrollment page: a shop slug alone or with `/l/{store}`, in a language the visitor picked or none. */
export function isEnrollmentPath(pathname: string): boolean {
  const segments = pathname.split("/").filter(Boolean);
  const shop = segments.length > 0 && isSupportedLocale(segments[0]) ? segments.slice(1) : segments;

  return acquisitionSlug(`/${shop.join("/")}`) !== null;
}

/** The path of an absolute or relative URL, or null when it is not one. */
function pathOf(url: string): string | null {
  try {
    return new URL(url, "https://stampeo.app").pathname;
  } catch {
    return null;
  }
}

/** Whether the event happened on an enrollment page, by the address or the path it carries. */
function isFromEnrollmentPage(properties: unknown): boolean {
  if (typeof properties !== "object" || properties === null) return false;
  const { $current_url: url, $pathname: pathname } = properties as Record<string, unknown>;
  const paths = [typeof pathname === "string" ? pathname : null, typeof url === "string" ? pathOf(url) : null];

  return paths.some((path) => path !== null && isEnrollmentPath(path));
}

/** PostHog's `before_send`: nothing from an enrollment page; every other event scrubbed. */
export function posthogBeforeSend<T extends { properties?: unknown } | null>(event: T): T | null {
  if (event === null || isFromEnrollmentPage(event.properties)) return null;
  return scrubPostHogEvent(event);
}

/** Whether PostHog starts on the page opened at `href`. */
export function posthogEnabledFor(href: string): boolean {
  const path = pathOf(href);

  return !carriesSessionToken(href) && !(path !== null && isEnrollmentPath(path));
}

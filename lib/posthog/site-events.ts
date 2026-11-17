import posthog from "posthog-js";
import { isSupportedLocale } from "../locale-negotiation";
import { quizPick } from "../landing-pages/previews/loyalty-picker";
import type { BillingInterval } from "../pricing";

/**
 * The events the site sends to PostHog about what visitors do on a page: a feature page opened from the header
 * menu, the pricing interval switched, an FAQ answer opened, the language switched, the loyalty quiz answered and
 * finished. Every event carries the page's `locale` and its `path` without the locale. Scroll depth is PostHog's own
 * `$prev_pageview_max_scroll_percentage`, so it has no event here.
 *
 * The builders are pure and make one event each; the `track…` functions read the page at the moment of the tap, build
 * the event and send it, and a failure to send never costs the visitor their tap.
 */

/** The page a visitor is on: its language and its path without the language prefix. */
export interface SiteEventPage {
  locale: string;
  path: string;
}

export interface SiteEvent {
  event: string;
  props: Record<string, string | number>;
}

export type NavMenu = "desktop" | "mobile";

export type Capture = (event: string, props: Record<string, unknown>) => void;

export const navPreviewOpened = (page: SiteEventPage, preview: string, menu: NavMenu): SiteEvent => ({
  event: "nav_preview_opened",
  props: { ...page, preview, menu },
});

export const pricingIntervalToggled = (page: SiteEventPage, interval: BillingInterval): SiteEvent => ({
  event: "pricing_interval_toggled",
  props: { ...page, interval },
});

export const faqAnswerOpened = (page: SiteEventPage, faq: string, position: number): SiteEvent => ({
  event: "faq_answer_opened",
  props: { ...page, faq, position },
});

/** The switch from the page's language to `to`; none when `to` is the language the page is in. */
export const languageSwitched = (page: SiteEventPage, to: string): SiteEvent | null =>
  to === page.locale ? null : { event: "language_switched", props: { ...page, from: page.locale, to } };

export const loyaltyQuizAnswered = (page: SiteEventPage, question: string, answer: string): SiteEvent => ({
  event: "loyalty_quiz_answered",
  props: { ...page, question, answer },
});

export const loyaltyQuizCompleted = (page: SiteEventPage, result: string): SiteEvent => ({
  event: "loyalty_quiz_completed",
  props: { ...page, result },
});

/** PostHog's capture, looked up on each send. */
const posthogCapture: Capture = (event, props) => posthog.capture(event, props);

export function sendSiteEvent(event: SiteEvent | null, capture: Capture = posthogCapture): void {
  if (event) capture(event.event, event.props);
}

/** The page the browser is on: `<html lang>` is the page's language, and the path loses a language prefix. */
export function pageContext(): SiteEventPage {
  const [, first, ...rest] = window.location.pathname.split("/");
  const path = isSupportedLocale(first) ? `/${rest.join("/")}` : window.location.pathname;

  return { locale: document.documentElement.lang, path };
}

/** Builds the events for the page the visitor is on and sends them; in a server render, or on a failure, nothing happens. */
function report(build: (page: SiteEventPage) => Array<SiteEvent | null>): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  try {
    for (const event of build(pageContext())) sendSiteEvent(event);
  } catch {
    // Losing the measurement is the acceptable failure; losing the tap is not.
  }
}

export const trackNavPreviewOpened = (preview: string, menu: NavMenu) => report((page) => [navPreviewOpened(page, preview, menu)]);

export const trackPricingIntervalToggled = (interval: BillingInterval) => report((page) => [pricingIntervalToggled(page, interval)]);

export const trackFaqAnswerOpened = (faq: string, position: number) => report((page) => [faqAnswerOpened(page, faq, position)]);

export const trackLanguageSwitched = (to: string) => report((page) => [languageSwitched(page, to)]);

/** The quiz answer at `choices.length`; the last answer also finishes the quiz. */
export function trackLoyaltyQuizPick(choices: readonly number[], option: number): void {
  const { question, answer, result } = quizPick(choices, option);

  report((page) => [loyaltyQuizAnswered(page, question, answer), result ? loyaltyQuizCompleted(page, result) : null]);
}

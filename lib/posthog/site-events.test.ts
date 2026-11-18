/**
 * The six events the site sends to PostHog about what visitors do on a page. Each builder makes one event from the
 * page the visitor is on (its locale and its path without the locale) and what they did; a switch to the language
 * they are already reading is no event. `sendSiteEvent` hands the event to a capture function.
 */

import { describe, expect, mock, test } from "bun:test";
import { restoreGlobalsAfterEach } from "../testing/restore-globals";
import {
  faqAnswerOpened,
  languageSwitched,
  loyaltyQuizAnswered,
  loyaltyQuizCompleted,
  navPreviewOpened,
  pageContext,
  pricingIntervalToggled,
  sendSiteEvent,
  type Capture,
} from "./site-events";

const PAGE = { locale: "fr", path: "/pricing" };

describe("what each event carries", () => {
  test.each([
    ["a feature page opened from the desktop menu", navPreviewOpened(PAGE, "platform/card-design", "desktop"), "nav_preview_opened", { preview: "platform/card-design", menu: "desktop" }],
    ["a feature page opened from the phone menu", navPreviewOpened(PAGE, "platform/analytics", "mobile"), "nav_preview_opened", { preview: "platform/analytics", menu: "mobile" }],
    ["the yearly switch", pricingIntervalToggled(PAGE, "year"), "pricing_interval_toggled", { interval: "year" }],
    ["the monthly switch", pricingIntervalToggled(PAGE, "month"), "pricing_interval_toggled", { interval: "month" }],
    ["a question opened", faqAnswerOpened(PAGE, "Is there a free trial?", 2), "faq_answer_opened", { faq: "Is there a free trial?", position: 2 }],
    ["a language picked", languageSwitched(PAGE, "es"), "language_switched", { from: "fr", to: "es" }],
    ["a quiz question answered", loyaltyQuizAnswered(PAGE, "price", "varies"), "loyalty_quiz_answered", { question: "price", answer: "varies" }],
    ["the quiz finished", loyaltyQuizCompleted(PAGE, "points"), "loyalty_quiz_completed", { result: "points" }],
  ])("%s", (_case, sent, event, what) => {
    expect(sent).toEqual({ event, props: { locale: "fr", path: "/pricing", ...what } });
  });

  test("picking the language the page is in sends nothing", () => {
    expect(languageSwitched(PAGE, "fr")).toBeNull();
  });
});

describe("sending", () => {
  test("an event goes to capture under its name, with its properties", () => {
    const capture = mock<Capture>();

    sendSiteEvent(pricingIntervalToggled(PAGE, "year"), capture);

    expect(capture.mock.calls).toEqual([["pricing_interval_toggled", { locale: "fr", path: "/pricing", interval: "year" }]]);
  });

  test("no event, nothing sent", () => {
    const capture = mock<Capture>();

    sendSiteEvent(null, capture);

    expect(capture).not.toHaveBeenCalled();
  });
});

describe("the page an event reports", () => {
  restoreGlobalsAfterEach("window", "document");

  const at = (lang: string, pathname: string) => {
    Object.assign(globalThis, { window: { location: { pathname } }, document: { documentElement: { lang } } });
    return pageContext();
  };

  test.each([
    ["French, which has no prefix", "fr", "/pricing", "/pricing"],
    ["another language, without its prefix", "en", "/en/features/card-design", "/features/card-design"],
    ["a language's home page", "pl", "/pl", "/"],
    ["the US pages, which keep their own prefix", "en", "/us/pricing", "/us/pricing"],
  ])("%s", (_case, locale, pathname, path) => {
    expect(at(locale, pathname)).toEqual({ locale, path });
  });
});

/**
 * Where each site event is sent from: the handler a visitor's tap runs, taken from the component's own tree and
 * called once. PostHog's `capture` is watched; a test reads what it received.
 */

import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test";
import type { ReactElement } from "react";
import { createTranslator } from "next-intl";
import posthog from "posthog-js";
import { MarketLink } from "@/components/market/MarketLink";
import { FeatureTile } from "@/components/sections/MobileMenu";
import { AccordionFeatureRows } from "@/components/sections/MobileMenuAccordion";
import { useFeatureEntries } from "@/components/sections/MobileMenuParts";
import { NavDropdownPanel } from "@/components/sections/NavDropdown";
import { BillingIntervalToggle } from "@/components/pricing/BillingIntervalToggle";
import { PickerCard } from "@/components/landing-pages/feature-previews/loyalty-programs/PickerCard";
import { PickerQuestion } from "@/components/landing-pages/feature-previews/loyalty-programs/PickerQuestion";
import { FAQList } from "@/components/ui/FAQList";
import { landingCopy } from "@/lib/landing-pages/copy/bundle";
import { switchLanguage } from "@/lib/routing/language-switcher";
import { pageMenuItems, productMenuItems } from "../nav/menu-items";
import { elementsOf } from "../testing/element-tree";
import { inRender } from "../testing/in-render";
import { loadCatalog } from "../testing/catalogs";
import { restoreGlobalsAfterEach } from "../testing/restore-globals";
import { trackLoyaltyQuizPick } from "./site-events";

const t = createTranslator({ locale: "en", messages: loadCatalog("en") }) as (key: string) => string;

/** What PostHog was asked to capture, in order. */
let captured: Array<[event: string, props: Record<string, unknown>]>;
let capture: ReturnType<typeof spyOn>;

beforeEach(() => {
  captured = [];
  capture = spyOn(posthog, "capture").mockImplementation(((event: string, props: Record<string, unknown>) => {
    captured.push([event, props]);
  }) as never);
});
afterEach(() => capture.mockRestore());
restoreGlobalsAfterEach("window", "document");

/** Runs `tap` as a visitor reading `path` in `lang`; the page offers what a send reads and a timer that never fires. */
function onPage(lang: string, path: string, tap: () => void) {
  Object.assign(globalThis, {
    window: { location: { pathname: path }, setTimeout: () => 0, clearTimeout: () => {} },
    document: { documentElement: { lang } },
  });
  tap();
}

/** The handler of the `onClick` prop of an element, called with the click it would get. */
const click = (element: ReactElement<Record<string, unknown>>, event: unknown = {}) => (element.props.onClick as (event: unknown) => void)(event);

describe("nav_preview_opened", () => {
  const PREVIEWS = [
    "platform/push-notifications",
    "platform/promotional-campaigns",
    "platform/geolocation",
    "platform/mobile-scanner",
    "platform/analytics",
    "platform/card-design",
  ];

  test("the desktop menu: each feature link reports the page it opens, once, and closes the menu", () => {
    const onNavigate = mock(() => {});
    const links = elementsOf(NavDropdownPanel({ items: productMenuItems(t, "en"), onNavigate }), MarketLink);

    expect(links).toHaveLength(PREVIEWS.length);
    links.forEach((link) => onPage("en", "/features/design-de-carte", () => click(link)));

    expect(captured.map(([event, props]) => [event, props.preview, props.menu])).toEqual(PREVIEWS.map((preview) => ["nav_preview_opened", preview, "desktop"]));
    expect(captured[0][1]).toMatchObject({ locale: "en", path: "/features/design-de-carte" });
    expect(onNavigate).toHaveBeenCalledTimes(PREVIEWS.length);
  });

  test("the Resources menu opens no preview, so it reports nothing", () => {
    const onNavigate = mock(() => {});
    const links = elementsOf(NavDropdownPanel({ items: pageMenuItems(t, "en", "int").resourceItems, onNavigate }), MarketLink);

    expect(links.length).toBeGreaterThan(0);
    links.forEach((link) => onPage("en", "/", () => click(link)));

    expect(captured).toEqual([]);
    expect(onNavigate).toHaveBeenCalledTimes(links.length);
  });

  test("the phone menu's list: each feature row reports the page it opens, once, and closes the menu", () => {
    const onNavigate = mock(() => {});
    const links = elementsOf(
      inRender("en", () => AccordionFeatureRows({ onNavigate })),
      MarketLink,
    );

    links.forEach((link) => onPage("en", "/", () => click(link)));

    expect(captured.map(([event, props]) => [event, props.preview, props.menu])).toEqual(PREVIEWS.map((preview) => ["nav_preview_opened", preview, "mobile"]));
    expect(onNavigate).toHaveBeenCalledTimes(PREVIEWS.length);
  });

  test("the phone menu's sheet: a feature tile reports its page, once, and closes the menu", () => {
    const onClose = mock(() => {});
    const entries = inRender("en", () => useFeatureEntries("/"));
    const tiles = entries.map((entry) => FeatureTile({ entry, first: false, onClose }));

    tiles.forEach((tile) => onPage("es", "/es/features/analiticas", () => click(tile)));

    expect(captured.map(([event, props]) => [event, props.preview, props.menu])).toEqual(PREVIEWS.map((preview) => ["nav_preview_opened", preview, "mobile"]));
    expect(captured[0][1]).toMatchObject({ locale: "es", path: "/features/analiticas" });
    expect(onClose).toHaveBeenCalledTimes(PREVIEWS.length);
  });
});

describe("pricing_interval_toggled", () => {
  const buttons = (value: "month" | "year", onChange: (value: "month" | "year") => void) =>
    elementsOf(inRender("en", () => BillingIntervalToggle({ value, onChange })), "button");

  test("switching to the other interval reports it once, and still changes it", () => {
    const onChange = mock<(value: "month" | "year") => void>();
    const [month] = buttons("year", onChange);

    onPage("en", "/us/pricing", () => click(month));

    expect(captured).toEqual([["pricing_interval_toggled", { locale: "en", path: "/us/pricing", interval: "month" }]]);
    expect(onChange).toHaveBeenCalledWith("month");
  });

  test("tapping the interval already chosen reports nothing", () => {
    const onChange = mock<(value: "month" | "year") => void>();
    const [, year] = buttons("year", onChange);

    onPage("en", "/us/pricing", () => click(year));

    expect(captured).toEqual([]);
  });
});

describe("faq_answer_opened", () => {
  const ITEMS = [
    { question: "Is there a free trial?", answer: "Yes." },
    { question: "Can I cancel?", answer: "Anytime." },
  ];
  /** The question rows of both layouts: the cards, and the table the landing pages use. */
  const LAYOUTS = [
    ["cards", () => FAQList({ items: ITEMS })],
    ["table", () => {
      const table = FAQList({ items: ITEMS, table: true }) as ReactElement<Record<string, unknown>>;

      return (table.type as (props: unknown) => ReactElement)(table.props);
    }],
  ] as const;

  /** A tap on a row's question, as the browser reports it: the `<details>` is still in the state it is leaving. */
  const tap = (summary: ReactElement<Record<string, unknown>>, open: boolean) => click(summary, { currentTarget: { parentElement: { open } } });

  test.each(LAYOUTS)("%s: opening a closed answer reports the question and its place, once", (_layout, render) => {
    const summaries = elementsOf(render(), "summary");

    onPage("fr", "/tarifs", () => tap(summaries[1], false));

    expect(captured).toEqual([["faq_answer_opened", { locale: "fr", path: "/tarifs", faq: "Can I cancel?", position: 2 }]]);
  });

  test.each(LAYOUTS)("%s: closing an open answer reports nothing", (_layout, render) => {
    const summaries = elementsOf(render(), "summary");

    onPage("fr", "/tarifs", () => tap(summaries[0], true));

    expect(captured).toEqual([]);
  });
});

describe("language_switched", () => {
  const router = () => {
    const replaced: Array<[string, { locale: string }]> = [];

    return { replaced, replace: (pathname: string, options: { locale: string }) => void replaced.push([pathname, options]) };
  };

  test("picking another language reports the switch from the page's language, once, and changes the page", () => {
    const place = router();

    onPage("en", "/en/pricing", () => switchLanguage(place, "/pricing")("es"));

    expect(captured).toEqual([["language_switched", { locale: "en", path: "/pricing", from: "en", to: "es" }]]);
    expect(place.replaced).toEqual([["/pricing", { locale: "es" }]]);
  });

  test("picking the language the page is in reports nothing", () => {
    const place = router();

    onPage("en", "/en/pricing", () => switchLanguage(place, "/pricing")("en"));

    expect(captured).toEqual([]);
  });
});

describe("the loyalty programs page's quiz", () => {
  const { picker } = landingCopy("en").previews.loyaltyPrograms.LOYALTY_PROGRAMS_PREVIEW;

  test("an answer reports the question and the option as ids, once", () => {
    const questions = elementsOf(
      inRender("en", () => PickerCard({ copy: picker, cards: { stamps: null, points: null }, cta: "Start" })),
      PickerQuestion,
    );

    onPage("en", "/en/loyalty-programs", () => (questions[0].props.onChoose as (option: number) => void)(1));

    expect(captured).toEqual([["loyalty_quiz_answered", { locale: "en", path: "/loyalty-programs", question: "price", answer: "varies" }]]);
  });

  test.each([
    ["steady visits and a free item", [0, 0, 0], 0, "stamps", "yes"],
    ["varied baskets and a choice of rewards", [1, 1, 1], 1, "points", "no"],
    ["an even split", [0, 1, 1], 0, "either", "yes"],
  ])("the last answer reports the regulars question and then the result, once each: %s", (_case, before, option, result, regulars) => {
    onPage("en", "/en/loyalty-programs", () => trackLoyaltyQuizPick(before, option));

    expect(captured).toEqual([
      ["loyalty_quiz_answered", { locale: "en", path: "/loyalty-programs", question: "regulars", answer: regulars }],
      ["loyalty_quiz_completed", { locale: "en", path: "/loyalty-programs", result }],
    ]);
  });
});

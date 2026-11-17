/**
 * Where each site event is sent from: the handler a visitor's tap runs, taken from the component's own tree and
 * called once. PostHog's `capture` is watched; a test reads what it received. A send that throws (posthog-js
 * rethrows an error of `before_send`) never stops what the tap does.
 */

import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test";
import type { ReactElement } from "react";
import { createTranslator } from "next-intl";
import posthog from "posthog-js";
import { MarketLink } from "@/components/market/MarketLink";
import { PickerCard } from "@/components/landing-pages/feature-previews/loyalty-programs/PickerCard";
import { PickerQuestion } from "@/components/landing-pages/feature-previews/loyalty-programs/PickerQuestion";
import { BillingIntervalToggle } from "@/components/pricing/BillingIntervalToggle";
import { PricingFAQ } from "@/components/pricing/PricingPageContent";
import { Header } from "@/components/sections/Header";
import { BigRow, FeatureTile } from "@/components/sections/MobileMenu";
import { AccordionFeatureRows, AccordionPanel } from "@/components/sections/MobileMenuAccordion";
import { useFeatureEntries } from "@/components/sections/MobileMenuParts";
import { NavDropdownPanel } from "@/components/sections/NavDropdown";
import { FAQList } from "@/components/ui/FAQList";
import { landingCopy } from "@/lib/landing-pages/copy/bundle";
import { switchLanguage } from "@/lib/routing/language-switcher";
import { pageMenuItems, productMenuItems } from "../nav/menu-items";
import { elementsOf } from "../testing/element-tree";
import { inRender } from "../testing/in-render";
import { loadCatalog } from "../testing/catalogs";
import { renderAtPath } from "../testing/pathname-seam";
import { phoneMenuProps } from "../testing/phone-menu-props";
import { restoreGlobalsAfterEach } from "../testing/restore-globals";
import { trackLoyaltyQuizPick } from "./site-events";

const t = createTranslator({ locale: "en", messages: loadCatalog("en") }) as (key: string) => string;

/** What PostHog was asked to capture, in order. */
let captured: Array<[event: string, props: Record<string, unknown>]>;
let capture: ReturnType<typeof spyOn>;
/** The timers a tap started on the page. */
let timers: unknown[];

beforeEach(() => {
  captured = [];
  timers = [];
  capture = spyOn(posthog, "capture").mockImplementation(((event: string, props: Record<string, unknown>) => {
    captured.push([event, props]);
  }) as never);
});
afterEach(() => capture.mockRestore());
restoreGlobalsAfterEach("window", "document");

/** Runs `tap` as a visitor reading the page at `path` (as the browser has it) in `lang`. */
function onPage(lang: string, path: string, tap: () => void) {
  Object.assign(globalThis, {
    window: { location: { pathname: path }, setTimeout: (...args: unknown[]) => timers.push(args), clearTimeout: () => {} },
    document: { documentElement: { lang } },
  });
  tap();
}

/** The handler of the `onClick` prop of an element, called with the click it would get. */
const click = (element: ReactElement<Record<string, unknown>>, event: unknown = {}) => (element.props.onClick as (event: unknown) => void)(event);

/** What a list of captures says about the page opened and the menu it was opened from. */
const opened = () => captured.map(([event, props]) => [event, props.preview, props.menu]);

const FEATURE_PREVIEWS = [
  "platform/push-notifications",
  "platform/promotional-campaigns",
  "platform/geolocation",
  "platform/mobile-scanner",
  "platform/analytics",
  "platform/card-design",
];

/** The feature links of each menu, built with the handler of the menu that closes it. */
const FEATURE_MENUS: Array<[name: string, menu: "desktop" | "mobile", links: (done: () => void) => Array<ReactElement<Record<string, unknown>>>]> = [
  ["the desktop Product dropdown", "desktop", (done) => elementsOf(NavDropdownPanel({ items: productMenuItems(t, "en"), onNavigate: done }), MarketLink)],
  ["the phone menu's list", "mobile", (done) => elementsOf(inRender("en", () => AccordionFeatureRows({ onNavigate: done })), MarketLink)],
  [
    "the phone menu's sheet",
    "mobile",
    (done) => inRender("en", () => useFeatureEntries("/")).map((entry) => FeatureTile({ entry, first: false, onClose: done })),
  ],
];

/** The top-level Loyalty and Pricing links of each menu. */
const PAGE_MENUS: Array<[name: string, menu: "desktop" | "mobile", links: (done: () => void) => Array<ReactElement<Record<string, unknown>>>]> = [
  [
    "the header",
    "desktop",
    () => elementsOf(renderAtPath("/", () => inRender("en", () => Header({}))), MarketLink),
  ],
  [
    "the phone menu's list",
    "mobile",
    (done) => elementsOf(inRender("en", () => AccordionPanel({ ...phoneMenuProps("int", "/"), onClose: done })), MarketLink),
  ],
  [
    "the phone menu's sheet",
    "mobile",
    (done) => pageMenuItems(t, "en", "int").navItems.map((item) => BigRow({ ...item, onClose: done, active: false })),
  ],
];

describe("nav_preview_opened", () => {
  test.each(FEATURE_MENUS)("%s: each feature link reports the page it opens, once, and still closes the menu", (_name, menu, links) => {
    const done = mock(() => {});
    const entries = links(done);

    expect(entries).toHaveLength(FEATURE_PREVIEWS.length);
    entries.forEach((link) => onPage("en", "/en/features/card-design", () => click(link)));

    expect(opened()).toEqual(FEATURE_PREVIEWS.map((preview) => ["nav_preview_opened", preview, menu]));
    expect(captured[0][1]).toMatchObject({ locale: "en", path: "/features/card-design" });
    expect(done).toHaveBeenCalledTimes(FEATURE_PREVIEWS.length);
  });

  test.each(PAGE_MENUS)("%s: the Loyalty link reports the loyalty programs page and the Pricing link reports nothing", (_name, menu, links) => {
    const done = mock(() => {});
    const entries = links(done);
    const [loyalty] = entries.filter((link) => link.props.href === "/loyalty-programs");
    const [pricing] = entries.filter((link) => link.props.href === "/pricing");

    onPage("en", "/en", () => click(pricing));
    expect(captured).toEqual([]);

    onPage("en", "/en", () => click(loyalty));
    expect(opened()).toEqual([["nav_preview_opened", "platform/loyalty-programs", menu]]);
  });

  test("the Resources menu opens no preview, so it reports nothing, and still closes the menu", () => {
    const onNavigate = mock(() => {});
    const links = elementsOf(NavDropdownPanel({ items: pageMenuItems(t, "en", "int").resourceItems, onNavigate }), MarketLink);

    expect(links.length).toBeGreaterThan(0);
    links.forEach((link) => onPage("en", "/en", () => click(link)));

    expect(captured).toEqual([]);
    expect(onNavigate).toHaveBeenCalledTimes(links.length);
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
  const PRICING_FAQ = loadCatalog("en").pricingPage.faq.items as Array<{ question: string }>;

  /** Each FAQ of the site with the page it is on: the cards and the table of FAQList, and the pricing page's own. */
  const FAQS: Array<[name: string, lang: string, path: string, shown: string, rows: () => Array<ReactElement<Record<string, unknown>>>, second: string]> = [
    ["the cards of FAQList", "en", "/en/loyalty-programs", "/loyalty-programs", () => elementsOf(FAQList({ items: ITEMS }), "summary"), ITEMS[1].question],
    [
      "the table of FAQList",
      "en",
      "/en/loyalty-programs",
      "/loyalty-programs",
      () => {
        const table = FAQList({ items: ITEMS, table: true }) as ReactElement<Record<string, unknown>>;

        return elementsOf((table.type as (props: unknown) => ReactElement)(table.props), "summary");
      },
      ITEMS[1].question,
    ],
    ["the pricing page's FAQ", "fr", "/pricing", "/pricing", () => elementsOf(inRender("en", () => PricingFAQ()), "summary"), PRICING_FAQ[1].question],
    ["the pricing page's FAQ in English", "en", "/en/pricing", "/pricing", () => elementsOf(inRender("en", () => PricingFAQ()), "summary"), PRICING_FAQ[1].question],
    ["the US pricing page's FAQ", "en", "/us/pricing", "/us/pricing", () => elementsOf(inRender("en", () => PricingFAQ()), "summary"), PRICING_FAQ[1].question],
    ["the UK pricing page's FAQ", "en", "/uk/pricing", "/uk/pricing", () => elementsOf(inRender("en", () => PricingFAQ()), "summary"), PRICING_FAQ[1].question],
  ];

  /** A tap on a row's question, as the browser reports it: the `<details>` is still in the state it is leaving. */
  const tap = (summary: ReactElement<Record<string, unknown>>, open: boolean) => click(summary, { currentTarget: { parentElement: { open } } });

  test.each(FAQS)("%s: opening a closed answer reports the question and its place, once", (_name, lang, path, shown, rows, second) => {
    const summaries = rows();

    onPage(lang, path, () => tap(summaries[1], false));

    expect(captured).toEqual([["faq_answer_opened", { locale: lang, path: shown, faq: second, position: 2 }]]);
  });

  test.each(FAQS)("%s: closing an open answer reports nothing", (_name, lang, path, _shown, rows) => {
    const summaries = rows();

    onPage(lang, path, () => tap(summaries[0], true));

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
  const questions = () =>
    elementsOf(
      inRender("en", () => PickerCard({ copy: picker, cards: { stamps: null, points: null }, cta: "Start" })),
      PickerQuestion,
    );
  const choose = (option: number) => (questions()[0].props.onChoose as (option: number) => void)(option);

  test("an answer reports the question and the option as ids, once", () => {
    onPage("en", "/en/loyalty-programs", () => choose(1));

    expect(captured).toEqual([["loyalty_quiz_answered", { locale: "en", path: "/loyalty-programs", question: "price", answer: "varies" }]]);
  });

  test("a second tap while the chosen option still flashes reports nothing more", () => {
    const [first] = questions();
    const onChoose = first.props.onChoose as (option: number) => void;

    onPage("en", "/en/loyalty-programs", () => {
      onChoose(0);
      onChoose(1);
    });

    expect(captured.map(([event, props]) => [event, props.answer])).toEqual([["loyalty_quiz_answered", "similar"]]);
    expect(timers).toHaveLength(1);
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

describe("a send that fails", () => {
  /** Each tap with what it does besides reporting, and whether it did it. */
  const TAPS: Array<[name: string, set: () => { tap: () => void; didIt: () => boolean }]> = [
    [
      "a feature link of the desktop menu",
      () => {
        const done = mock(() => {});
        const [link] = elementsOf(NavDropdownPanel({ items: productMenuItems(t, "en"), onNavigate: done }), MarketLink);

        return { tap: () => click(link), didIt: () => done.mock.calls.length === 1 };
      },
    ],
    [
      "a feature link of the phone menu",
      () => {
        const done = mock(() => {});
        const [link] = elementsOf(inRender("en", () => AccordionFeatureRows({ onNavigate: done })), MarketLink);

        return { tap: () => click(link), didIt: () => done.mock.calls.length === 1 };
      },
    ],
    [
      "a feature tile of the phone menu's sheet",
      () => {
        const done = mock(() => {});
        const [entry] = inRender("en", () => useFeatureEntries("/"));

        return { tap: () => click(FeatureTile({ entry, first: false, onClose: done })), didIt: () => done.mock.calls.length === 1 };
      },
    ],
    [
      "the pricing switch",
      () => {
        const onChange = mock<(value: "month" | "year") => void>();
        const [month] = elementsOf(inRender("en", () => BillingIntervalToggle({ value: "year", onChange })), "button");

        return { tap: () => click(month), didIt: () => onChange.mock.calls.length === 1 };
      },
    ],
    [
      "a language pick",
      () => {
        const replace = mock<(pathname: string, options: { locale: string }) => void>();

        return { tap: () => switchLanguage({ replace }, "/pricing")("es"), didIt: () => replace.mock.calls.length === 1 };
      },
    ],
    [
      "a quiz answer",
      () => {
        const { picker } = landingCopy("en").previews.loyaltyPrograms.LOYALTY_PROGRAMS_PREVIEW;
        const [question] = elementsOf(
          inRender("en", () => PickerCard({ copy: picker, cards: { stamps: null, points: null }, cta: "Start" })),
          PickerQuestion,
        );

        // The pick is accepted when its highlight timer starts.
        return { tap: () => (question.props.onChoose as (option: number) => void)(0), didIt: () => timers.length === 1 };
      },
    ],
    [
      "opening an FAQ answer",
      () => {
        const [summary] = elementsOf(FAQList({ items: [{ question: "Is there a free trial?", answer: "Yes." }] }), "summary");

        return { tap: () => click(summary, { currentTarget: { parentElement: { open: false } } }), didIt: () => true };
      },
    ],
  ];

  test.each(TAPS)("%s still does what it does when PostHog throws", (_name, set) => {
    const { tap, didIt } = set();

    capture.mockImplementation((() => {
      throw new Error("before_send failed");
    }) as never);

    expect(() => onPage("en", "/en/pricing", tap)).not.toThrow();
    expect(didIt()).toBe(true);
    expect(capture).toHaveBeenCalledTimes(1);
  });
});

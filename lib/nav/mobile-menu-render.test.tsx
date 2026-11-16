/**
 * The phone menu of the US landing pages as a visitor meets it, both directions: the index sheet (the default)
 * and the drill-down (`?menu=drill`). Each is rendered open, under the English catalogs, the way the header hands
 * it its links. The header's own wiring (when the menu is the new one, and that every other page keeps today's) is
 * in `lib/landing-pages/preview-nav.test.ts`.
 */

import { describe, expect, test } from "bun:test";
import type { ComponentProps } from "react";
import { MenuBurger } from "@/components/sections/MenuBurger";
import { MobileMenu, currentMenu } from "@/components/sections/MobileMenu";
import { LanguageRow } from "@/components/ui/LanguageSwitcher";
import { routing } from "@/i18n/routing";
import { FEATURE_ITEMS } from "@/lib/features";
import { getLocalizedSlug } from "@/lib/feature-slugs";
import { MENU_VARIANTS } from "@/lib/landing-pages/platform/variants";
import { decodeEntities, expectInOrder, renderEn, textOf } from "../testing/render-en";
import { trackedBy } from "../testing/cta-recorder";
import { restoreGlobalsAfterEach } from "../testing/restore-globals";
import { renderAs } from "../testing/visitor-seams";

const PREVIEW = (feature: string) => `/us/landing-pages/platform/${feature}`;

const LABELS = ["Push Notifications", "Promotional Campaigns", "Geolocation", "Mobile Scanner", "Analytics", "Card Design"];
const DESCRIPTIONS = [
  "A message on every stamp",
  "One message to every card",
  "Your card when they're nearby",
  "Stamp from any phone",
  "See who comes back",
  "Your logo, colors and stamps",
];

const PROPS: ComponentProps<typeof MobileMenu> = {
  variant: "sheet",
  open: true,
  onClose: () => {},
  burgerRef: { current: null },
  featureLinks: "previews",
  pathname: "/us/landing-pages/platform",
  navItems: [
    { label: "Loyalty", href: "/loyalty-programs", market: "int" },
    { label: "Pricing", href: "/us/pricing", market: "us" },
  ],
  resourceItems: [
    { label: "Blog", href: "/blog" },
    { label: "What's new", href: "/changelog" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  signedIn: false,
  appUrl: "https://app.stampeo.app",
  onSignOut: () => {},
};

const render = (overrides: Partial<ComponentProps<typeof MobileMenu>> = {}) => renderEn(<MobileMenu {...PROPS} {...overrides} />, { us: true });

/** Every link and button of a render, with its classes and the name a screen reader gives it. */
function targets(html: string) {
  return [...html.matchAll(/<(a|button)\b([^>]*)>([\s\S]*?)<\/\1>/g)].map(([, tag, attrs, inner]) => ({
    tag,
    attrs,
    href: /\bhref="([^"]*)"/.exec(attrs)?.[1],
    name: decodeEntities(inner.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()),
  }));
}

/** A target is 44px to tap when its classes say so: the menu's tile, row and button heights. */
const TALL = /(?<![\w-])(?:min-h-(?:11|12|14|\[88px\])|h-(?:11|12))(?![\w-])/;

describe("the index sheet", () => {
  test("it is a dialog named Menu, and a closed menu draws nothing", () => {
    const html = render();

    expect(html).toMatch(/role="dialog"/);
    expect(html).toMatch(/aria-modal="true"/);
    expect(textOf(html)).toContain("Menu");
    expect(render({ open: false })).toBe("");
  });

  test("every Product item is on screen at once, as a tile with its one line, in the header's order: nothing to open first", () => {
    const html = render();

    expectInOrder(html, ["Product", ...LABELS.flatMap((label, index) => [label, DESCRIPTIONS[index]])]);
    expect(html).not.toMatch(/aria-expanded/);
    expect(FEATURE_ITEMS).toHaveLength(LABELS.length);
  });

  test("the tiles lead to the previews from a Platform page, and to today's pages from anywhere else", () => {
    const hrefs = (html: string) => targets(html).flatMap(({ href, name }) => (LABELS.some((label) => name.startsWith(label)) ? [href] : []));

    expect(hrefs(render())).toEqual(
      ["push-notifications", "promotional-campaigns", "geolocation", "mobile-scanner", "analytics", "card-design"].map(PREVIEW),
    );
    expect(hrefs(render({ featureLinks: "live" }))).toEqual(
      FEATURE_ITEMS.map(({ canonicalSlug }) => `/en/features/${getLocalizedSlug(canonicalSlug, "en")}`),
    );
  });

  test("Geolocation says Soon on its tile and no other tile does", () => {
    const tiles = targets(render()).filter(({ name }) => LABELS.some((label) => name.startsWith(label)));

    expect(tiles.filter(({ name }) => name.includes("Soon")).map(({ name }) => name.split(" ")[0])).toEqual(["Geolocation"]);
  });

  test("the tile of the page you are on is marked as current", () => {
    const html = render({ pathname: PREVIEW("mobile-scanner") });
    const current = targets(html).filter(({ attrs }) => /aria-current="page"/.test(attrs));

    expect(current.map(({ name }) => name.split(" ")[0] + " " + name.split(" ")[1])).toEqual(["Mobile Scanner"]);
  });

  test("Loyalty and Pricing are rows, then Resources: Blog, What's new, About and Contact", () => {
    expectInOrder(render(), [...LABELS.slice(-1), "Loyalty", "Pricing", "Resources", "Blog", "What's new", "About", "Contact"]);
  });

  test("signed out the bar at the bottom is Log in and Get started, which opens the trial's sign-up", () => {
    const bar = targets(render()).slice(-2);

    expect(bar.map(({ name }) => name)).toEqual(["Log in", "Get started →"]);
    expect(bar[0].href).toBe("/en/login");
    expect(bar[1].href).toBe("/en/onboarding");
  });

  test.each(MENU_VARIANTS)("signed out, the %s menu's Get started reports its click as the phone header's, to the sign-up", (variant) => {
    expect(trackedBy(() => render({ variant }))).toEqual([{ trackAs: "header_mobile", href: "/onboarding" }]);
  });

  test("signed in it is Sign out and Dashboard", () => {
    const bar = targets(render({ signedIn: true })).slice(-2);

    expect(bar.map(({ name }) => name)).toEqual(["Sign out", "Dashboard"]);
    expect(bar[1].href).toBe("https://app.stampeo.app");
  });

  test("the sheet scrolls by itself, so a short phone never loses the bar", () => {
    const html = render();

    expect(html).toMatch(/overflow-y-auto/);
    expect(html).toMatch(/overscroll-contain/);
    expect(html).toMatch(/sticky/);
  });

  test("where a page has several languages, the header's language row sits above the bar; with none there is no gap for it", () => {
    const row = <LanguageRow locale="en" locales={routing.locales} onPick={() => {}} />;

    expect(textOf(render({ language: row }))).toContain("|EN|");
    expect(textOf(render())).not.toContain("|EN|");
    expect(textOf(render({ variant: "drill", language: row }))).toContain("|EN|");
  });

  test("it rises 6px as it appears, and for a reader who asks for less motion it only fades", () => {
    expect(render()).toMatch(/translateY\(-6px\)/);
    expect(renderAs({ reducedMotion: true }, () => render())).not.toMatch(/translateY\(/);
  });
});

describe("the drill-down", () => {
  const drill = (overrides: Partial<ComponentProps<typeof MobileMenu>> = {}) => render({ variant: "drill", ...overrides });

  test("the first screen is Product, Loyalty, Pricing and Resources, the two that hold more with an arrow", () => {
    const first = targets(drill()).filter(({ attrs }) => /data-drill-root/.test(attrs));

    expect(first.map(({ name }) => name)).toEqual(["Product", "Loyalty", "Pricing", "Resources"]);
    expect(first.filter(({ tag }) => tag === "button").map(({ name }) => name)).toEqual(["Product", "Resources"]);
  });

  test("Product's own screen has a way back, a feature tile that leads on, and the six features with their lines", () => {
    const html = drill();
    const screen = html.slice(html.indexOf("data-drill-screen=\"product\""));

    expectInOrder(screen, ["Menu", "See every feature", ...LABELS.flatMap((label, index) => [label, DESCRIPTIONS[index]])]);
    expect(targets(screen).some(({ href }) => href === "/us/landing-pages/features")).toBe(true);
  });

  test("the screens that are not shown are inert, so Tab and a screen reader stay on the one that is", () => {
    const html = drill();

    expect(html).toMatch(/data-drill-screen="product"[^>]*\binert\b/);
    expect(html).toMatch(/data-drill-screen="resources"[^>]*\binert\b/);
    expect(html).not.toMatch(/data-drill-screen="root"[^>]*\binert\b/);
  });

  test("Log in and Get started stay at the bottom, once, whichever screen is open", () => {
    const html = drill();

    expect(targets(html).filter(({ name }) => name === "Get started →")).toHaveLength(1);
    expect(targets(html).filter(({ name }) => name === "Log in")).toHaveLength(1);
  });

  test("Log in and Get started are pinned to the foot of the menu, not left to scroll with a screen", () => {
    const html = drill();
    const bar = html.slice(html.lastIndexOf('<div class="border-t'));

    expect(bar).toMatch(/^<div class="border-t [^"]*\babsolute inset-x-0 bottom-0\b/);
    expect(targets(bar).map(({ name }) => name)).toEqual(["Log in", "Get started →"]);
  });

  test("the focus rules find what they look for: each opening row and each screen's way back are marked", () => {
    const html = drill();

    for (const screen of ["product", "resources"]) {
      expect(html).toContain(`data-drill-opens="${screen}"`);
      expect(html.slice(html.indexOf(`data-drill-screen="${screen}"`))).toMatch(/^[^]*?data-drill-first/);
    }
    expect(html.match(/data-menu-first/g)).toHaveLength(1);
  });
});

describe.each(MENU_VARIANTS)("the %s menu", (variant) => {
  test("every link and button is 44px or taller to tap", () => {
    expect(targets(render({ variant })).filter(({ attrs }) => !TALL.test(attrs)).map(({ name }) => name)).toEqual([]);
  });
});

describe("which menu a visitor gets", () => {
  restoreGlobalsAfterEach("window");
  const at = (search: string) => {
    Object.assign(globalThis, { window: { location: { search } } });
    return currentMenu();
  };

  test("the sheet unless the address says ?menu=drill, in the browser as on the server", () => {
    expect(render()).toMatch(/grid-cols-2/);
    expect(at("")).toBe("sheet");
    expect(at("?menu=tabs")).toBe("sheet");
    expect(at("?utm_source=ads&menu=drill")).toBe("drill");
  });
});

describe("the language row", () => {
  test("one pill per language, each 44px tall, in the language's own tag, with the current one pressed", () => {
    const html = renderEn(<LanguageRow locale="fr" locales={routing.locales} onPick={() => {}} />);
    const pills = targets(html);

    expect(pills.map(({ name }) => name)).toEqual(routing.locales.map((locale) => locale.toUpperCase()));
    expect(pills.every(({ attrs }) => TALL.test(attrs))).toBe(true);
    expect(pills.map(({ attrs }) => /aria-pressed="true"/.test(attrs))).toEqual(routing.locales.map((locale) => locale === "fr"));
    expect(pills.map(({ attrs }) => /lang="([a-z]+)"/.exec(attrs)?.[1])).toEqual([...routing.locales]);
  });
});

describe("the button that opens it", () => {
  const burger = (open: boolean) => renderEn(<MenuBurger open={open} onToggle={() => {}} buttonRef={{ current: null }} />);

  test("it is 44px to tap, says what it will do, and names the menu it controls", () => {
    expect(burger(false)).toMatch(/aria-label="Open menu"/);
    expect(burger(true)).toMatch(/aria-label="Close menu"/);
    expect(burger(false)).toMatch(/aria-expanded="false"/);
    expect(burger(true)).toMatch(/aria-expanded="true"/);
    expect(burger(false)).toMatch(/aria-controls="mobile-menu"/);
    expect(burger(false)).toMatch(/\bh-11 w-11\b/);
    expect(renderEn(<MobileMenu {...PROPS} />)).toMatch(/id="mobile-menu"/);
  });

  test("the burger and the X are both drawn and one fades into the other, in 150ms, with no fade for a reader who asks for less motion", () => {
    const html = burger(false);

    expect(html.match(/<svg\b/g)).toHaveLength(2);
    expect(html).toMatch(/duration-150/);
    expect(html).toMatch(/motion-reduce:transition-none/);
  });

  test("it is a phone control: gone from lg, where the header has the full menu", () => {
    expect(burger(false)).toMatch(/\blg:hidden\b/);
  });
});

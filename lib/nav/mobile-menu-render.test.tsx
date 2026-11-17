/**
 * The phone menu of the Platform-style pages as a visitor meets it: the index sheet, rendered open under the
 * English catalogs, the way the header hands it its links. The header's own wiring (which pages draw the sheet, and
 * that every other page keeps the panel) is in `lib/landing-pages/preview-nav.test.ts`.
 */

import { describe, expect, test } from "bun:test";
import type { ComponentProps } from "react";
import { MenuBurger } from "@/components/sections/MenuBurger";
import { MobileMenu } from "@/components/sections/MobileMenu";
import { LanguageRow } from "@/components/ui/LanguageSwitcher";
import { routing } from "@/i18n/routing";
import { FEATURE_ITEMS } from "@/lib/features";
import { getLocalizedSlug } from "@/lib/feature-slugs";
import { decodeEntities, expectInOrder, renderEn, textOf } from "../testing/render-en";
import { trackedBy } from "../testing/cta-recorder";
import { renderAs } from "../testing/visitor-seams";

const FEATURE = (feature: string) => `/en/features/${feature}`;

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
  open: true,
  onClose: () => {},
  burgerRef: { current: null },
  pathname: "/us",
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

/** The height a target's classes give it to tap, in px: `min-h-14`, `min-h-[72px]` or `h-12`; null when they say none. */
function tapHeight(attrs: string): number | null {
  const own = /(?<![\w-])(?:min-)?h-(?:\[(\d+(?:\.\d+)?)px\]|(\d+(?:\.\d+)?))(?![\w-])/.exec(attrs);

  return own ? (own[1] ? Number(own[1]) : Number(own[2]) * 4) : null;
}

/** A target is 44px to tap when its classes say so. */
const isTall = (attrs: string) => (tapHeight(attrs) ?? 0) >= 44;

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

  test("the tiles lead to the feature pages, from a page of any market", () => {
    const hrefs = (html: string) => targets(html).flatMap(({ href, name }) => (LABELS.some((label) => name.startsWith(label)) ? [href] : []));

    expect(hrefs(render())).toEqual(
      ["push-notifications", "promotional-campaigns", "geolocation", "mobile-scanner", "analytics", "card-design"].map(FEATURE),
    );
    expect(hrefs(render({ pathname: "/" }))).toEqual(
      FEATURE_ITEMS.map(({ canonicalSlug }) => `/en/features/${getLocalizedSlug(canonicalSlug, "en")}`),
    );
  });

  test("Geolocation says Soon on its tile and no other tile does", () => {
    const tiles = targets(render()).filter(({ name }) => LABELS.some((label) => name.startsWith(label)));

    expect(tiles.filter(({ name }) => name.includes("Soon")).map(({ name }) => name.split(" ")[0])).toEqual(["Geolocation"]);
  });

  test("the tile of the page you are on is marked as current", () => {
    const html = render({ pathname: "/features/mobile-scanner" });
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

  test("signed out, Get started reports its click as the phone header's, to the sign-up", () => {
    expect(trackedBy(() => render())).toEqual([{ trackAs: "header_mobile", href: "/onboarding" }]);
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
  });

  test("it rises 6px as it appears, and for a reader who asks for less motion it only fades", () => {
    expect(render()).toMatch(/translateY\(-6px\)/);
    expect(renderAs({ reducedMotion: true }, () => render())).not.toMatch(/translateY\(/);
  });
});

describe("the Product tiles on the narrowest phones", () => {
  const html = render();
  const tiles = [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)]
    .filter(([, attrs]) => /rounded-2xl/.test(attrs))
    .map(([, attrs, inner]) => ({ attrs, inner }));

  test("there is one tile for each feature", () => {
    expect(tiles).toHaveLength(LABELS.length);
  });

  test("a tile is 44px or taller to tap", () => {
    for (const { attrs } of tiles) expect(isTall(attrs)).toBe(true);
  });
});

describe("every link and button of the sheet", () => {
  test("is 44px or taller to tap", () => {
    expect(targets(render()).filter(({ attrs }) => !isTall(attrs)).map(({ name }) => name)).toEqual([]);
  });
});

describe("the language row", () => {
  test("one pill per language, each 44px tall, in the language's own tag, with the current one pressed", () => {
    const html = renderEn(<LanguageRow locale="fr" locales={routing.locales} onPick={() => {}} />);
    const pills = targets(html);

    expect(pills.map(({ name }) => name)).toEqual(routing.locales.map((locale) => locale.toUpperCase()));
    expect(pills.every(({ attrs }) => isTall(attrs))).toBe(true);
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

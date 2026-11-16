import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { routing } from "@/i18n/routing";
import { FEATURE_ITEMS } from "@/lib/features";
import { DESKTOP_QUERY, closeWhenDesktop, drillFocusSelector, holdPageWhileOpen, isCurrentPath, menuMotion, type DesktopQuery } from "./mobile-menu";
import { ROOT as SOURCE_ROOT, code } from "../testing/jsx-source";

const ROOT = join(import.meta.dir, "..", "..");
const catalog = (locale: string) => JSON.parse(readFileSync(join(ROOT, "messages", locale, "common.json"), "utf8")).common;

describe("how the phone menu moves", () => {
  test("it fades in over 180ms with a 6px rise, group by group 25ms apart, and fades out faster", () => {
    expect(menuMotion(false)).toEqual({ rise: 6, enter: 0.18, exit: 0.12, stagger: 0.025 });
  });

  test("for a reader who wants less motion it is a plain fade: no rise, no stagger, still a complete menu", () => {
    const calm = menuMotion(true);

    expect(calm.rise).toBe(0);
    expect(calm.stagger).toBe(0);
    expect(calm.enter).toBeGreaterThan(0);
    expect(calm.exit).toBeGreaterThan(0);
  });
});

describe("which menu entry is the page you are on", () => {
  test("the entry whose address is the page, or a page inside it, is current", () => {
    expect(isCurrentPath("/us/landing-pages/platform/analytics", "/us/landing-pages/platform/analytics")).toBe(true);
    expect(isCurrentPath("/features/analytiques/detail", "/features/analytiques")).toBe(true);
  });

  test("a sibling that only shares a prefix is not", () => {
    expect(isCurrentPath("/us/landing-pages/platform/analytics-2", "/us/landing-pages/platform/analytics")).toBe(false);
    expect(isCurrentPath("/pricing", "/features/analytiques")).toBe(false);
  });

  test("an anchor is never current", () => {
    expect(isCurrentPath("/", "#demo")).toBe(false);
  });
});

/** A media query that a test moves between matching and not, as a window being resized does. */
function fakeQuery(matches: boolean): DesktopQuery & { set(next: boolean): void; listeners: number } {
  const listeners = new Set<() => void>();

  return {
    matches,
    addEventListener: (_type, listener) => void listeners.add(listener),
    removeEventListener: (_type, listener) => void listeners.delete(listener),
    set(next) {
      this.matches = next;
      for (const listener of listeners) listener();
    },
    get listeners() {
      return listeners.size;
    },
  };
}

describe("an open phone menu when the window grows to the desktop layout", () => {
  test("it closes at the width where the desktop header takes over, so the page scroll and the inert page are given back", () => {
    const query = fakeQuery(false);
    let closed = 0;

    closeWhenDesktop(query, () => closed++);
    expect(closed).toBe(0);
    query.set(true);
    expect(closed).toBe(1);
  });

  test("a menu opened while the window is already that wide closes at once", () => {
    let closed = 0;

    closeWhenDesktop(fakeQuery(true), () => closed++);
    expect(closed).toBe(1);
  });

  test("shrinking back to a phone's width leaves it as it is, and a closed menu stops listening", () => {
    const query = fakeQuery(true);
    let closed = 0;
    const stop = closeWhenDesktop(query, () => closed++);

    query.set(false);
    expect(closed).toBe(1);
    expect(query.listeners).toBe(1);
    stop();
    expect(query.listeners).toBe(0);
    query.set(true);
    expect(closed).toBe(1);
  });

  test("the width is Tailwind's lg, which hides the burger and the menu", () => {
    const theme = readFileSync(join(SOURCE_ROOT, "node_modules", "tailwindcss", "theme.css"), "utf8");
    const globals = readFileSync(join(SOURCE_ROOT, "app", "globals.css"), "utf8");

    expect(theme).toContain("--breakpoint-lg: 64rem");
    expect(globals).not.toContain("--breakpoint-lg");
    expect(DESKTOP_QUERY).toBe("(min-width: 64rem)");
  });

  test("the sheet menu watches it while it is open, and only the sheet: today's accordion is left as it was", () => {
    expect(code(join(SOURCE_ROOT, "components", "sections", "SheetMenu.tsx"))).toContain("open ? closeWhenDesktop(window.matchMedia(DESKTOP_QUERY), onClose) : undefined");
    expect(code(join(SOURCE_ROOT, "components", "sections", "MobileMenuAccordion.tsx"))).not.toContain("closeWhenDesktop");
  });
});

describe("the page while a phone menu is open", () => {
  const setup = () => {
    const target = new EventTarget();
    const state = { locked: 0, released: 0, closed: 0 };
    const stop = holdPageWhileOpen({
      lock: () => {
        state.locked++;
        return () => void state.released++;
      },
      target,
      onClose: () => void state.closed++,
    });
    const press = (key: string) => target.dispatchEvent(Object.assign(new Event("keydown"), { key }));

    return { state, stop, press };
  };

  test("the page behind does not scroll: the lock is taken once, and given back when the menu closes", () => {
    const { state, stop } = setup();

    expect(state).toEqual({ locked: 1, released: 0, closed: 0 });
    stop();
    expect(state.released).toBe(1);
  });

  test("Escape closes the menu, and no other key does", () => {
    const { state, press } = setup();

    press("Enter");
    press("Tab");
    expect(state.closed).toBe(0);
    press("Escape");
    expect(state.closed).toBe(1);
  });

  test("once the menu is closed Escape is the page's again", () => {
    const { state, stop, press } = setup();

    stop();
    press("Escape");
    expect(state.closed).toBe(0);
  });
});

describe("where the focus goes in the drill-down", () => {
  test("opening Product or Resources takes it to that screen's way back, whichever row opened it", () => {
    expect(drillFocusSelector("product", "product")).toBe('[data-drill-screen="product"] [data-drill-first]');
    expect(drillFocusSelector("resources", "resources")).toBe('[data-drill-screen="resources"] [data-drill-first]');
  });

  test("going back takes it to the row that opened the screen just left, not to the top of the menu", () => {
    expect(drillFocusSelector("root", "resources")).toBe('[data-drill-opens="resources"]');
    expect(drillFocusSelector("root", "product")).toBe('[data-drill-opens="product"]');
  });
});

describe("the six one-line descriptions under each feature in the phone menu", () => {
  test.each(routing.locales)("%s: every feature has one, short enough for two lines in a half-width tile", (locale) => {
    const items = catalog(locale).nav.featuresItems as Record<string, { label: string; description: string }>;

    for (const { key } of FEATURE_ITEMS) {
      expect(typeof items[key]?.description).toBe("string");
      expect(items[key].description.length).toBeGreaterThan(8);
      expect(items[key].description.length).toBeLessThanOrEqual(42);
    }
  });

  test.each(routing.locales)("%s: house style, no em dash, no minute count, no reminder, no ellipsis", (locale) => {
    const items = Object.values(catalog(locale).nav.featuresItems as Record<string, { description: string }>);

    for (const { description } of items) expect(description).not.toMatch(/—|\bminut|remind|rappel|recuerd|przypom|…/i);
  });

  test.each(routing.locales)("%s: the Soon label the Geolocation tile wears exists", (locale) => {
    expect(catalog(locale).wallet.soon.length).toBeGreaterThan(2);
  });

  test("the English lines say what each feature does for the shop, in the locked words (card, stamps, message)", () => {
    const items = catalog("en").nav.featuresItems as Record<string, { description: string }>;

    expect(Object.fromEntries(Object.entries(items).map(([key, value]) => [key, value.description]))).toEqual({
      designDeCarte: "Your logo, colors and stamps",
      scannerMobile: "Stamp from any phone",
      notificationsPush: "A message on every stamp",
      campagnesPromotionnelles: "One message to every card",
      analytiques: "See who comes back",
      geolocalisation: "Your card when they're nearby",
    });
  });
});

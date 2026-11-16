import { describe, expect, test } from "bun:test";
import { handleMenuKey, inertWhileOpen, menuStops, trapStop, type FocusStop } from "./modal";

describe("Tab inside an open menu stays in the menu", () => {
  // The stops are the burger (now an X) first, then everything tappable in the sheet.
  const LAST = 5;

  test("Tab from the last stop wraps to the X, and Shift+Tab from the X wraps to the last stop", () => {
    expect(trapStop(LAST + 1, LAST, false)).toBe(0);
    expect(trapStop(LAST + 1, 0, true)).toBe(LAST);
  });

  test("anywhere in the middle the browser's own Tab order is left alone", () => {
    expect(trapStop(LAST + 1, 2, false)).toBeNull();
    expect(trapStop(LAST + 1, 2, true)).toBeNull();
    expect(trapStop(LAST + 1, 0, false)).toBeNull();
    expect(trapStop(LAST + 1, LAST, true)).toBeNull();
  });

  test("focus that is outside the menu (the logo, the page) comes back in: first stop on Tab, last on Shift+Tab", () => {
    expect(trapStop(LAST + 1, -1, false)).toBe(0);
    expect(trapStop(LAST + 1, -1, true)).toBe(LAST);
  });

  test("with one stop, Tab and Shift+Tab both stay on it", () => {
    expect(trapStop(1, 0, false)).toBe(0);
    expect(trapStop(1, 0, true)).toBe(0);
  });

  test("with no stops there is nothing to trap", () => {
    expect(trapStop(0, -1, false)).toBeNull();
  });
});

describe("the page behind an open menu cannot be reached", () => {
  const element = (inert = false) => ({ inert });

  test("the page and the footer are inert while the menu is open, and as they were after", () => {
    const main = element();
    const footer = element();
    const release = inertWhileOpen([main, footer]);

    expect([main.inert, footer.inert]).toEqual([true, true]);
    release();
    expect([main.inert, footer.inert]).toEqual([false, false]);
  });

  test("a part of the page that was already inert stays inert when the menu closes", () => {
    const main = element(true);
    const release = inertWhileOpen([main]);

    release();
    expect(main.inert).toBe(true);
  });

  test("a page with no footer is fine, and releasing twice changes nothing", () => {
    const main = element();
    const release = inertWhileOpen([main, null]);

    release();
    main.inert = true;
    release();
    expect(main.inert).toBe(true);
  });
});

/** A tab stop with a name and, if it sits in an inert screen, that flag: it records which stop took the focus. */
function fakeMenu(names: string[], inert: string[] = []) {
  const state: { focused: string | null; prevented: number } = { focused: null, prevented: 0 };
  const stop = (name: string): FocusStop & { name: string } => ({
    name,
    focus: () => void (state.focused = name),
    closest: (selector) => (selector === "[inert]" && inert.includes(name) ? {} : null),
  });
  const burger = stop("burger");
  const stops = names.map(stop);
  const menu = { querySelectorAll: () => stops };
  const press = (key: string, active: FocusStop | null, shiftKey = false) =>
    handleMenuKey({ key, shiftKey, preventDefault: () => void state.prevented++ }, burger, menu, active);

  return { state, burger, stops, menu, press };
}

describe("an open menu's keyboard: Escape and Tab", () => {
  test("Escape hands the focus to the burger, so the reader is where they opened the menu from", () => {
    const { state, stops, press } = fakeMenu(["a", "b"]);

    press("Escape", stops[1]);
    expect(state.focused).toBe("burger");
  });

  test("Tab from the last tile wraps to the X, and Shift+Tab from the X to the last tile, each with the browser's own move prevented", () => {
    const { state, burger, stops, press } = fakeMenu(["a", "b", "c"]);

    press("Tab", stops[2]);
    expect(state).toEqual({ focused: "burger", prevented: 1 });
    press("Tab", burger, true);
    expect(state).toEqual({ focused: "c", prevented: 2 });
  });

  test("in the middle Tab is left to the browser: nothing is focused or prevented", () => {
    const { state, stops, press } = fakeMenu(["a", "b", "c"]);

    press("Tab", stops[0]);
    press("Tab", stops[1], true);
    expect(state).toEqual({ focused: null, prevented: 0 });
  });

  test("the links of a screen that is not shown are not stops: Tab from the last shown one goes round to the X", () => {
    const { state, stops, press } = fakeMenu(["root-a", "root-b", "product-a", "product-b"], ["product-a", "product-b"]);

    press("Tab", stops[1]);
    expect(state.focused).toBe("burger");
  });

  test("the stops are the burger then the shown links and buttons, in the menu's order", () => {
    const { burger, menu } = fakeMenu(["a", "b", "hidden"], ["hidden"]);

    expect((menuStops(burger, menu) as Array<FocusStop & { name: string }>).map((stop) => stop.name)).toEqual(["burger", "a", "b"]);
  });

  test("a focus that is on the page behind the menu comes back into it, and any other key does nothing", () => {
    const { state, press } = fakeMenu(["a", "b"]);

    press("Tab", null);
    expect(state.focused).toBe("burger");
    state.focused = null;
    press("Enter", null);
    press("ArrowDown", null);
    expect(state.focused).toBeNull();
  });
});

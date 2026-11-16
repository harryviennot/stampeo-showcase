import { describe, expect, test } from "bun:test";
import { inertWhileOpen, trapStop } from "./modal";

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

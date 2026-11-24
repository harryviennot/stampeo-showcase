/**
 * The card design hero: one wallet card that takes on the look of six different shops, one caption naming each.
 * A visitor can go to the next or the previous shop, jump to one from the dots or swipe the card. All pure: which
 * shop each caption is, where each card sits in the row, what a click, a swipe and the clock do, and what a
 * reader who asks for less motion gets.
 */

import { describe, expect, test } from "bun:test";
import { CARD_DESIGN_PREVIEW } from "../copy/previews/card-design";
import {
  RESKIN_SHOPS,
  RESKIN_STEP_MS,
  SWIPE_PX,
  reskinCard,
  reskinPlacement,
  reskinStep,
  reskinView,
  swipeDirection,
  type ReskinState,
} from "./reskin";

const CAPTIONS = CARD_DESIGN_PREVIEW.reskin.captions;
const WORDS = CARD_DESIGN_PREVIEW.cardFields;
const count = RESKIN_SHOPS.length;
const START: ReskinState = { active: 0, touched: false };
const step = (state: ReskinState, type: "tick" | "previous" | "next") => reskinStep(state, { type }, count);

describe("the six shops", () => {
  test("are the six the captions name, in the captions' order, the car wash first", () => {
    expect(RESKIN_SHOPS).toEqual(["lustre", "fournee", "ravin", "lashwell", "marginalia", "rolling-slice"]);
    expect(CAPTIONS).toEqual(["Car wash", "Bakery", "Wine bar", "Lash studio", "Bookstore", "Pizza truck"]);
    expect(CAPTIONS).toHaveLength(count);
  });

  test("each is a real card from the brand banks with its own logo, and none is a shop another section of the page shows", () => {
    const logos = RESKIN_SHOPS.map((id) => reskinCard(id, WORDS).design.logo_url);

    expect(new Set(logos).size).toBe(count);
    for (const logo of logos) expect(logo).toMatch(/^\/themes\/[a-z-]+\/logo\./);
    for (const logo of logos) expect(logo).not.toMatch(/\/themes\/(oba|pulp|gelo|patoune|saltmoss|ode|smash-club|forme|wrenfold|harvest-row|salon|pace)\//);
  });

  test("run on stamps and on points, so the card's strip changes with the shop and its layout does not", () => {
    const programs = new Set(RESKIN_SHOPS.map((id) => reskinCard(id, WORDS).program));

    expect(programs).toEqual(new Set(["stamps", "points"]));
  });
});

describe("the row", () => {
  test("the shop in front is live, the one either side is a neighbour, the rest wait out of sight", () => {
    const roles = RESKIN_SHOPS.map((_, index) => reskinPlacement(index, 0, count).role);

    expect(roles).toEqual(["live", "side", "hidden", "hidden", "hidden", "side"]);
  });

  test("a neighbour sits one place either side, and the row wraps: the last shop is the first one's left neighbour", () => {
    expect(reskinPlacement(1, 0, count).offset).toBe(1);
    expect(reskinPlacement(count - 1, 0, count).offset).toBe(-1);
    expect(reskinPlacement(0, count - 1, count).offset).toBe(1);
  });

  test("every offset is a whole place in the row's range, one card each", () => {
    const offsets = RESKIN_SHOPS.map((_, index) => reskinPlacement(index, 2, count).offset).sort((a, b) => a - b);

    expect(offsets).toEqual([-3, -2, -1, 0, 1, 2]);
  });
});

describe("a visitor clicks", () => {
  test("next shows the following shop, and the last shop's next is the first", () => {
    expect(step(START, "next").active).toBe(1);
    expect(step({ active: count - 1, touched: false }, "next").active).toBe(0);
  });

  test("previous shows the shop before, and the first shop's previous is the last", () => {
    expect(step({ active: 3, touched: false }, "previous").active).toBe(2);
    expect(step(START, "previous").active).toBe(count - 1);
  });

  test("a dot shows its own shop, whatever shop was in front", () => {
    for (const index of [0, 2, count - 1]) expect(reskinStep({ active: 4, touched: false }, { type: "show", index }, count).active).toBe(index);
  });

  test("a dot that does not exist leaves the card where it is", () => {
    expect(reskinStep({ active: 2, touched: false }, { type: "show", index: count }, count).active).toBe(2);
    expect(reskinStep({ active: 2, touched: false }, { type: "show", index: -1 }, count).active).toBe(2);
  });
});

describe("the clock", () => {
  test("moves on to the next shop, round to the first, until the visitor takes over", () => {
    expect(step(START, "tick")).toEqual({ active: 1, touched: false });
    expect(step({ active: count - 1, touched: false }, "tick").active).toBe(0);
  });

  test("holds each shop for at least four seconds, slow enough to look at the card", () => {
    expect(RESKIN_STEP_MS).toBeGreaterThanOrEqual(4000);
  });

  test("stops for good once the visitor has clicked, so the shop they chose stays", () => {
    const chosen = step(START, "next");

    expect(chosen.touched).toBe(true);
    expect(step(chosen, "tick")).toEqual(chosen);
    expect(step(step(chosen, "tick"), "tick").active).toBe(1);
  });
});

describe("a swipe", () => {
  test("to the left shows the next shop and to the right the previous one", () => {
    expect(swipeDirection(-SWIPE_PX, 0)).toBe("next");
    expect(swipeDirection(SWIPE_PX, 0)).toBe("previous");
  });

  test("a tap or a short drag does nothing", () => {
    expect(swipeDirection(0, 0)).toBeNull();
    expect(swipeDirection(SWIPE_PX - 1, 0)).toBeNull();
    expect(swipeDirection(-(SWIPE_PX - 1), 0)).toBeNull();
  });

  test("a drag that is mostly downward is the page scrolling, not a swipe", () => {
    expect(swipeDirection(-SWIPE_PX, 3 * SWIPE_PX)).toBeNull();
    expect(swipeDirection(SWIPE_PX, -3 * SWIPE_PX)).toBeNull();
  });
});

describe("for a reader who asks for less motion", () => {
  test("the card never changes on its own, but the buttons, the dots and a swipe still work", () => {
    expect(reskinView(START, true)).toMatchObject({ active: 0, autoplay: false });
    expect(reskinView(step(START, "next"), true)).toMatchObject({ active: 1, autoplay: false });
  });

  test("otherwise the clock runs until the visitor has clicked", () => {
    expect(reskinView({ active: 4, touched: false }, false)).toMatchObject({ active: 4, autoplay: true });
    expect(reskinView({ active: 4, touched: true }, false)).toMatchObject({ active: 4, autoplay: false });
  });
});

describe("what a screen reader is told", () => {
  test("nothing while the card moves on by itself: autoplay never interrupts someone reading the hero", () => {
    expect(reskinView(START, false).announce).toBe(false);
    expect(reskinView(step(START, "tick"), false).announce).toBe(false);
    expect(reskinView(START, true).announce).toBe(false);
  });

  test.each([
    ["a button", (state: ReskinState) => step(state, "next")],
    ["the other button", (state: ReskinState) => step(state, "previous")],
    ["a dot", (state: ReskinState) => reskinStep(state, { type: "show", index: 3 }, count)],
  ])("the shop is announced once the visitor has chosen it with %s", (_input, choose) => {
    const chosen = choose(START);

    for (const reduced of [false, true]) expect(reskinView(chosen, reduced).announce).toBe(true);
  });
});

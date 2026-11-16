/**
 * The card design hero: one wallet card that takes on the look of six different shops, one caption
 * naming each. All pure: which shop each caption is, where each card sits in the row, what the clock
 * does, and the still state for a reader who asks for less motion.
 */

import { describe, expect, test } from "bun:test";
import { CARD_DESIGN_PREVIEW } from "../copy/previews/card-design";
import { RESKIN_SHOPS, nextShop, reskinCard, reskinPlacement, reskinView } from "./reskin";

const CAPTIONS = CARD_DESIGN_PREVIEW.reskin.captions;
const count = RESKIN_SHOPS.length;

describe("the six shops", () => {
  test("are the six the captions name, in the captions' order, the car wash first", () => {
    expect(RESKIN_SHOPS).toEqual(["lustre", "fournee", "ravin", "lashwell", "marginalia", "rolling-slice"]);
    expect(CAPTIONS).toEqual(["Car wash", "Bakery", "Wine bar", "Lash studio", "Bookstore", "Pizza truck"]);
    expect(CAPTIONS).toHaveLength(count);
  });

  test("each is a real card from the brand banks with its own logo, and none is the bubble tea shop, the barbershop or the juice bar the colour section uses", () => {
    const logos = RESKIN_SHOPS.map((id) => reskinCard(id).design.logo_url);

    expect(new Set(logos).size).toBe(count);
    for (const logo of logos) expect(logo).toMatch(/^\/themes\/[a-z-]+\/logo\./);
    for (const logo of logos) expect(logo).not.toMatch(/\/themes\/(oba|barber|pulp)\//);
  });

  test("run on stamps and on points, so the card's strip changes with the shop and its layout does not", () => {
    const programs = new Set(RESKIN_SHOPS.map((id) => reskinCard(id).program));

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

describe("the clock", () => {
  test("the next shop follows the last one round to the first", () => {
    expect(nextShop(0, count)).toBe(1);
    expect(nextShop(count - 1, count)).toBe(0);
  });

});

describe("for a reader who asks for less motion", () => {
  test("the car wash's card stands still with its caption, whatever shop the clock was on", () => {
    expect(reskinView(4, true)).toEqual({ active: 0, animated: false });
    expect(CAPTIONS[reskinView(4, true).active]).toBe("Car wash");
  });

  test("otherwise the view is the clock's", () => {
    expect(reskinView(4, false)).toEqual({ active: 4, animated: true });
  });
});

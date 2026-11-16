/**
 * The Platform hero's cards and what they do over time: the stack of nine wallet
 * cards (stamps, points and levels, with three that change in front of the visitor)
 * and the straight shelf of nine behind `?hero=shelf`. All pure: which card sits
 * where, what the front card shows before and after its moment, the clock that
 * moves the stack along, and the calm still state for a reader who wants less motion.
 */

import { describe, expect, test } from "bun:test";
import { LEVEL_LOOKS } from "@/lib/levels/looks";
import {
  SHELF_CARDS,
  SHELF_ON_PHONE,
  STACK_CARDS,
  STACK_STRIPS,
  placement,
  showing,
  stackView,
  stepAfter,
  type StackCard,
  type StackState,
} from "./wallet-stack";

const START: StackState = { front: 0, phase: "rest" };
const isLevel = (card: StackCard) => card.headerLabel !== undefined;
const brandOf = (card: StackCard) => card.design.logo_url ?? "";
/** What a visitor takes a card for: its level's name, else its program. */
const kindOf = (card: StackCard) => card.headerLabel ?? card.program;

describe("the nine cards of the stack", () => {
  test("are nine different shops, none of them a real one and none of them the bubble tea shop", () => {
    const logos = STACK_CARDS.map(brandOf);

    expect(STACK_CARDS).toHaveLength(9);
    expect(new Set(STACK_CARDS.map((card) => card.id)).size).toBe(9);
    expect(new Set(logos).size).toBe(9);
    for (const logo of logos) expect(logo).not.toMatch(/\/themes\/(oba|barber)\//);
  });

  test("run stamps, points and levels: at least three stamp cards, three points cards and two level cards", () => {
    expect(STACK_CARDS.filter((card) => card.program === "stamps").length).toBeGreaterThanOrEqual(3);
    expect(STACK_CARDS.filter((card) => card.program === "points").length).toBeGreaterThanOrEqual(3);
    expect(STACK_CARDS.filter(isLevel).length).toBeGreaterThanOrEqual(2);
  });

  test("a level card prints its level over the count, in a look from the catalog, on icons the look can recolour", () => {
    const levels = STACK_CARDS.filter(isLevel);
    const catalog = Object.values(LEVEL_LOOKS).map((look) => look.background_color);

    expect(levels.map((card) => card.headerLabel)).toEqual(expect.arrayContaining(["Silver", "Noir"]));
    for (const card of levels) {
      expect(catalog).toContain(card.design.background_color);
      expect(card.design.stamp_icon_mode ?? "preset").not.toBe("custom");
      expect(card.design.points_strip_style).not.toBe("image_only");
    }
  });
});

describe("the first screen of the stack on a phone", () => {
  const first = stackView(START, false);
  const upTo = (strips: number) => STACK_CARDS.filter((_, index) => placement(index, first, STACK_CARDS.length).slot <= strips);

  test("shows four strips above the front card, and a visitor sees stamps, points and a level among them", () => {
    const cards = upTo(STACK_STRIPS.phone);

    expect(cards).toHaveLength(STACK_STRIPS.phone + 1);
    expect(cards.some((card) => card.program === "points")).toBe(true);
    expect(cards.some((card) => card.program === "stamps" && !isLevel(card))).toBe(true);
    expect(cards.some(isLevel)).toBe(true);
  });

  test("puts Aurevo, the café the pages follow, in front, at five stamps of eight", () => {
    const front = STACK_CARDS[first.front];

    expect(front.id).toBe("aurevo");
    expect(showing(front, first.after).stamps).toBe(5);
    expect(front.design.total_stamps).toBe(8);
  });

  test("shows more of the stack from a laptop: six strips, each a different card", () => {
    const cards = upTo(STACK_STRIPS.desktop);

    expect(STACK_STRIPS.desktop).toBeGreaterThan(STACK_STRIPS.phone);
    expect(new Set(cards.map((card) => card.id)).size).toBe(STACK_STRIPS.desktop + 1);
  });
});

describe("the moments: what the front card shows after it", () => {
  const card = (id: string) => STACK_CARDS.find((candidate) => candidate.id === id) as StackCard;

  test("Aurevo gets its sixth stamp, Marginalia twelve more points, and the dry cleaner's card moves up from Silver to Gold", () => {
    expect(showing(card("aurevo"), false).stamps).toBe(5);
    expect(showing(card("aurevo"), true).stamps).toBe(6);
    expect(showing(card("marginalia"), false).pointsBalance).toBe(240);
    expect(showing(card("marginalia"), true).pointsBalance).toBe(252);

    const [before, after] = [showing(card("wrenfold"), false), showing(card("wrenfold"), true)];
    expect([before.headerLabel, after.headerLabel]).toEqual(["Silver", "Gold"]);
    expect(before.design.background_color).toBe(LEVEL_LOOKS.silver.background_color);
    expect(after.design.background_color).toBe(LEVEL_LOOKS.gold.background_color);
    expect(after.design.logo_url).toBe(before.design.logo_url);
    expect(after.stamps).toBe(before.stamps);
  });

  test("the other cards have none: before and after are the same card", () => {
    for (const other of STACK_CARDS.filter((candidate) => !candidate.moment)) {
      expect(showing(other, true)).toEqual(showing(other, false));
    }
    expect(STACK_CARDS.filter((candidate) => candidate.moment).map((candidate) => candidate.id).sort()).toEqual(["aurevo", "marginalia", "wrenfold"]);
  });
});

describe("where each card sits", () => {
  const count = STACK_CARDS.length;

  test("the front card is at slot 0 and the others count up behind it, one slot for each card", () => {
    const slots = STACK_CARDS.map((_, index) => placement(index, START, count).slot);

    // The last two wait in the same place, one above the top strip.
    expect(slots).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 7]);
  });

  test("after a step the card that was just above takes the front, and the old front goes to the back, out of sight", () => {
    const next: StackState = { front: 1, phase: "rest" };

    expect(placement(1, next, count).slot).toBe(0);
    expect(placement(2, next, count).slot).toBe(1);
    expect(placement(0, next, count).hidden).toBe(true);
  });

  test("a card past the visible strips is hidden and waits one slot above the top strip, so it fades in from there", () => {
    const { slot, hidden } = placement(STACK_STRIPS.desktop + 2, START, count);

    expect(hidden).toBe(true);
    expect(slot).toBe(STACK_STRIPS.desktop + 1);
    expect(placement(STACK_STRIPS.desktop, START, count).hidden).toBe(false);
  });

  test("while the front card leaves, it is the only one marked as leaving", () => {
    const leaving: StackState = { front: 3, phase: "leaving" };

    expect(STACK_CARDS.filter((_, index) => placement(index, leaving, count).leaving)).toHaveLength(1);
    expect(placement(3, leaving, count).leaving).toBe(true);
    expect(placement(3, START, count).leaving).toBe(false);
  });
});

describe("the clock", () => {
  test("a card with a moment rests, plays it, leaves, and the next card takes the front", () => {
    const rest = stepAfter({ front: 0, phase: "rest" }, true);
    const moment = stepAfter(rest.state, true);
    const leaving = stepAfter(moment.state, true);

    expect([rest.state.phase, moment.state.phase, leaving.state]).toEqual(["moment", "leaving", { front: 1, phase: "rest" }]);
  });

  test("a card with none goes from rest straight to leaving", () => {
    expect(stepAfter({ front: 1, phase: "rest" }, false).state.phase).toBe("leaving");
  });

  test.each([true, false])("every card holds the front for 3.2 seconds, whether or not it has a moment (%s)", (hasMoment) => {
    let state: StackState = { front: 2, phase: "rest" };
    let time = 0;

    do {
      const step = stepAfter(state, hasMoment);
      time += step.after;
      state = step.state;
    } while (state.front === 2);

    expect(time).toBe(3200);
  });

  test("nine cards later the stack is back at Aurevo", () => {
    let state: StackState = START;

    for (let cards = 0; cards < STACK_CARDS.length; cards += 1) {
      do {
        state = stepAfter(state, Boolean(STACK_CARDS[state.front].moment)).state;
      } while (state.phase !== "rest");
    }

    expect(state).toEqual(START);
  });
});

describe("for a reader who asks for less motion", () => {
  test("the stack stands still with Aurevo in front at its sixth stamp, whatever the clock said", () => {
    const view = stackView({ front: 4, phase: "leaving" }, true);

    expect(view).toEqual({ front: 0, phase: "rest", after: true, animated: false });
    expect(STACK_CARDS[view.front].id).toBe("aurevo");
  });

  test("otherwise the view follows the clock: the moment shows its after state only while the front plays it or leaves", () => {
    expect(stackView({ front: 0, phase: "rest" }, false).after).toBe(false);
    expect(stackView({ front: 0, phase: "moment" }, false).after).toBe(true);
    expect(stackView({ front: 0, phase: "leaving" }, false).after).toBe(true);
    expect(stackView({ front: 0, phase: "moment" }, false).animated).toBe(true);
  });
});

describe("the shelf", () => {
  test("is nine cards: three stamp cards, three points cards, then one shop's card at Bronze, Silver and Gold", () => {
    const [stamps, points, levels] = [SHELF_CARDS.slice(0, 3), SHELF_CARDS.slice(3, 6), SHELF_CARDS.slice(6)];

    expect(SHELF_CARDS).toHaveLength(9);
    expect(stamps.every((card) => card.program === "stamps" && !isLevel(card))).toBe(true);
    expect(points.every((card) => card.program === "points" && !isLevel(card))).toBe(true);
    expect(levels.map((card) => card.headerLabel)).toEqual(["Bronze", "Silver", "Gold"]);
    expect(new Set(levels.map(brandOf)).size).toBe(1);
    expect(levels.map((card) => card.design.background_color)).toEqual([
      LEVEL_LOOKS.bronze.background_color,
      LEVEL_LOOKS.silver.background_color,
      LEVEL_LOOKS.gold.background_color,
    ]);
  });

  test("the six cards that are not levels are six different shops", () => {
    const plain = SHELF_CARDS.filter((card) => !isLevel(card));

    expect(new Set(plain.map(brandOf)).size).toBe(6);
    for (const card of SHELF_CARDS) expect(brandOf(card)).not.toMatch(/\/themes\/(oba|barber)\//);
  });

  test("on a phone it keeps five of them, interleaved: stamps, points, Silver, stamps, Gold", () => {
    const kept = SHELF_ON_PHONE.map((index) => SHELF_CARDS[index]);

    expect(new Set(SHELF_ON_PHONE).size).toBe(5);
    expect(kept.map(kindOf)).toEqual(["stamps", "points", "Silver", "stamps", "Gold"]);
  });
});

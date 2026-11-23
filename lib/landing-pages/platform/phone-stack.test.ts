/**
 * The cards of Platform's phone stack and what they do over time: the deck the front card cycles through
 * (stamps, points and levels, three of them changing in front of the visitor), which card sits where, the clock
 * that moves the deck along, and the still picture a reader who wants less motion keeps. All pure; what the
 * stack looks like on first paint is in `platform-hero.test.tsx`.
 */

import { describe, expect, test } from "bun:test";
import { HERO_FAN_SEASON } from "@/lib/hero-fan";
import { LEVEL_LOOKS } from "@/lib/levels/looks";
import {
  FIRST_PAINT,
  FIRST_REST_MS,
  PHONE_DECK as LIVE_DECK,
  PHONE_STRIPS,
  drawn,
  phoneDeck,
  placement,
  showing,
  stackView,
  stepAfter,
  type StackCard,
  type StackState,
} from "./phone-stack";

/** The year-round deck; the tests below describe it, and the Christmas deck has its own section at the end. */
const PHONE_DECK = phoneDeck("default");
const count = PHONE_DECK.length;
const isLevel = (card: StackCard) => card.level !== undefined;
const brandOf = (card: StackCard) => card.design.logo_url ?? "";
const card = (id: string) => PHONE_DECK.find((candidate) => candidate.id === id) as StackCard;
/** The cards in a slot from the front to the top strip, as the first paint shows them. */
const inView = (state: StackState) =>
  PHONE_DECK.filter((_, index) => !placement(index, state, count).hidden).sort(
    (a, b) => placement(PHONE_DECK.indexOf(a), state, count).slot - placement(PHONE_DECK.indexOf(b), state, count).slot,
  );

describe("the deck the phone stack cycles through, in the default season", () => {
  test("is different shops, none of them the bubble tea shop", () => {
    const logos = PHONE_DECK.map(brandOf);

    expect(count).toBeGreaterThan(PHONE_STRIPS + 2);
    expect(new Set(logos).size).toBe(count);
    for (const logo of logos) expect(logo).not.toMatch(/\/themes\/oba\//);
  });

  test("runs stamps, points and levels, so a visitor who waits sees all three kinds of card", () => {
    expect(PHONE_DECK.some((candidate) => candidate.program === "stamps" && !isLevel(candidate))).toBe(true);
    expect(PHONE_DECK.some((candidate) => candidate.program === "points")).toBe(true);
    expect(PHONE_DECK.some(isLevel)).toBe(true);
  });

  test("a level card prints its level over the count, in a look from the catalog", () => {
    const catalog = Object.values(LEVEL_LOOKS).map((look) => look.background_color);

    for (const level of PHONE_DECK.filter(isLevel)) expect(catalog).toContain(level.design.background_color ?? "");
  });

  test("opens on the sample café's stamp card at 5 of 8, the card the rest of the pages follow", () => {
    const [front] = inView(FIRST_PAINT);

    expect(front.id).toBe("aurevo");
    expect(front.program).toBe("stamps");
    expect(showing(front, false).stamps).toBe(5);
    expect(front.design.total_stamps).toBe(8);
  });

  test("shows a points card, a level card and a stamp card behind it on first paint, so the tops tell the programs apart", () => {
    const behind = inView(FIRST_PAINT).slice(1);
    const kinds = behind.map((candidate) => (isLevel(candidate) ? "levels" : candidate.program));

    expect(behind).toHaveLength(PHONE_STRIPS);
    expect(kinds).toEqual(["points", "levels", "stamps"]);
  });
});

describe("the moments: what the front card shows after it", () => {
  test("Aurevo gets its sixth stamp, the points card twelve more points, and the level card moves up from Silver to Gold", () => {
    expect([showing(card("aurevo"), false).stamps, showing(card("aurevo"), true).stamps]).toEqual([5, 6]);
    expect([showing(card("marginalia"), false).pointsBalance, showing(card("marginalia"), true).pointsBalance]).toEqual([240, 252]);

    const [before, after] = [showing(card("gaspard-gus"), false), showing(card("gaspard-gus"), true)];

    expect([before.level, after.level]).toEqual(["silver", "gold"]);
    expect(before.design.background_color).toBe(LEVEL_LOOKS.silver.background_color);
    expect(after.design.background_color).toBe(LEVEL_LOOKS.gold.background_color);
    expect(after.design.logo_url).toBe(before.design.logo_url);
    expect(after.stamps).toBe(before.stamps);
  });

  test("one moment of each kind, and the other cards have none: before and after are the same card", () => {
    const withMoment = PHONE_DECK.filter((candidate) => candidate.moment);

    expect(withMoment.map((candidate) => candidate.id).sort()).toEqual(["aurevo", "gaspard-gus", "marginalia"]);
    for (const other of PHONE_DECK.filter((candidate) => !candidate.moment)) {
      expect(showing(other, true)).toEqual(showing(other, false));
    }
  });
});

describe("where each card sits", () => {
  const slots = (state: StackState) => PHONE_DECK.map((_, index) => placement(index, state, count).slot);

  test("the front card is at slot 0 and the next ones count up behind it, one strip for each card in view", () => {
    expect(slots(FIRST_PAINT).slice(0, PHONE_STRIPS + 1)).toEqual([0, 1, 2, 3]);
  });

  test("the cards past the top strip are hidden and wait one slot above it, so they fade in from there", () => {
    const waiting = PHONE_DECK.map((_, index) => placement(index, FIRST_PAINT, count)).filter((place) => place.hidden);

    expect(waiting).toHaveLength(count - PHONE_STRIPS - 1);
    for (const place of waiting) expect(place.slot).toBe(PHONE_STRIPS + 1);
  });

  test("after a step the card that was just above takes the front, and the old front goes to the back, out of sight", () => {
    const next: StackState = { front: 1, phase: "rest" };

    expect(placement(1, next, count).slot).toBe(0);
    expect(placement(2, next, count).slot).toBe(1);
    expect(placement(0, next, count).hidden).toBe(true);
  });

  test("while the front card leaves, the rest of the deck already moves up one place, so the stack advances in one motion", () => {
    const leaving: StackState = { front: 2, phase: "leaving" };
    const next: StackState = { front: 3, phase: "rest" };

    expect(placement(2, leaving, count)).toEqual({ behind: 0, slot: 0, hidden: false, leaving: true });
    for (const index of PHONE_DECK.keys()) {
      if (index !== 2) expect(placement(index, leaving, count)).toEqual(placement(index, next, count));
    }
  });

  test("while the front card leaves, it is the only one marked as leaving", () => {
    const leaving: StackState = { front: 3, phase: "leaving" };

    expect(PHONE_DECK.filter((_, index) => placement(index, leaving, count).leaving)).toHaveLength(1);
    expect(placement(3, leaving, count).leaving).toBe(true);
    expect(placement(3, FIRST_PAINT, count).leaving).toBe(false);
  });

  test("the first paint draws the four cards in view and nothing else; the card waiting above joins them once the page is live", () => {
    const places = PHONE_DECK.map((_, index) => placement(index, FIRST_PAINT, count));

    expect(places.filter((place) => drawn(place, false))).toHaveLength(PHONE_STRIPS + 1);
    expect(places.filter((place) => drawn(place, true))).toHaveLength(PHONE_STRIPS + 2);
  });

  test("the card that just left is not drawn, so a lap never leaves a ghost behind", () => {
    const places = PHONE_DECK.map((_, index) => placement(index, { front: 1, phase: "rest" }, count));

    expect(drawn(places[0], true)).toBe(false);
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

  test.each([true, false])("every card holds the front for 3.6 seconds, whether or not it has a moment (%s)", (hasMoment) => {
    let state: StackState = { front: 2, phase: "rest" };
    let time = 0;

    do {
      const step = stepAfter(state, hasMoment);
      time += step.after;
      state = step.state;
    } while (state.front === 2);

    expect(time).toBe(3600);
  });

  test("the first card is on screen a moment before it plays, shorter than a regular rest", () => {
    expect(FIRST_REST_MS).toBeLessThan(stepAfter(FIRST_PAINT, true).after);
  });

  test("a whole lap of the deck is back at Aurevo, and every moment of the deck played on the way", () => {
    let state: StackState = FIRST_PAINT;
    const played: string[] = [];

    for (let cards = 0; cards < count; cards += 1) {
      do {
        state = stepAfter(state, Boolean(PHONE_DECK[state.front].moment), count).state;
        if (state.phase === "moment") played.push(PHONE_DECK[state.front].id);
      } while (state.phase !== "rest");
    }

    expect(state).toEqual(FIRST_PAINT);
    expect(played.sort()).toEqual(["aurevo", "gaspard-gus", "marginalia"]);
  });
});

describe("for a reader who asks for less motion", () => {
  test("the stack is the first paint, whatever the clock said: Aurevo in front at its fifth stamp, nothing playing", () => {
    const view = stackView({ front: 4, phase: "leaving" }, true);

    expect(view).toEqual({ front: 0, phase: "rest", after: false, animated: false });
    expect(PHONE_DECK[view.front].id).toBe("aurevo");
    expect(showing(PHONE_DECK[view.front], view.after).stamps).toBe(5);
  });

  test("otherwise the view follows the clock: the moment shows its after state only while the front plays it or leaves", () => {
    expect(stackView(FIRST_PAINT, false)).toEqual({ ...FIRST_PAINT, after: false, animated: true });
    expect(stackView({ front: 0, phase: "moment" }, false).after).toBe(true);
    expect(stackView({ front: 0, phase: "leaving" }, false).after).toBe(true);
  });
});

describe("the Christmas deck", () => {
  const deck = phoneDeck("christmas");
  const brand = (card: StackCard) => card.design.logo_url ?? "";
  const opening = (state: StackState) =>
    deck
      .map((card, index) => ({ card, place: placement(index, state, deck.length) }))
      .filter(({ place }) => !place.hidden)
      .sort((a, b) => a.place.slot - b.place.slot)
      .map(({ card }) => card);

  test("is seven different shops in Christmas looks, with spare cards so a lap never pops one in at the back", () => {
    expect(deck.length).toBeGreaterThan(PHONE_STRIPS + 2);
    expect(new Set(deck.map(brand)).size).toBe(deck.length);
    for (const card of deck) expect(card.id).toStartWith("christmas-");
  });

  test("opens on Little Santas' stamp card, whole, with a points card and a stamp card among the tops behind it", () => {
    const [front, ...behind] = opening(FIRST_PAINT);

    expect(front.id).toBe("christmas-little-santas");
    expect(front.program).toBe("stamps");
    expect(behind).toHaveLength(PHONE_STRIPS);
    expect(new Set(behind.map((card) => card.program))).toEqual(new Set(["points", "stamps"]));
    expect(deck.some(isLevel)).toBe(false);
  });

  test("gives Little Santas its eighth stamp, Rudolph twelve more points and Santa's Elves their seventh stamp; the rest have no moment", () => {
    const find = (id: string) => deck.find((card) => card.id === `christmas-${id}`) as StackCard;

    expect([showing(find("little-santas"), false).stamps, showing(find("little-santas"), true).stamps]).toEqual([7, 8]);
    expect([showing(find("rudolph"), false).pointsBalance, showing(find("rudolph"), true).pointsBalance]).toEqual([210, 222]);
    expect([showing(find("santas-elves"), false).stamps, showing(find("santas-elves"), true).stamps]).toEqual([6, 7]);
    expect(deck.filter((card) => card.moment)).toHaveLength(3);
  });

  test("a lap of it plays each moment and is back at Little Santas", () => {
    let state: StackState = FIRST_PAINT;
    const played: string[] = [];

    for (let cards = 0; cards < deck.length; cards += 1) {
      do {
        state = stepAfter(state, Boolean(deck[state.front].moment), deck.length).state;
        if (state.phase === "moment") played.push(deck[state.front].id);
      } while (state.phase !== "rest");
    }

    expect(state).toEqual(FIRST_PAINT);
    expect(played.sort()).toEqual(["christmas-little-santas", "christmas-rudolph", "christmas-santas-elves"]);
  });
});

describe("which deck the page shows", () => {
  test("the stack runs the deck of the season the config names", () => {
    expect(LIVE_DECK).toBe(phoneDeck(HERO_FAN_SEASON));
  });

  test("a season without a deck of its own keeps the year-round one", () => {
    expect(phoneDeck("halloween")).toBe(phoneDeck("default"));
  });
});

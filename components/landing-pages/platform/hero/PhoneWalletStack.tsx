"use client";

import { memo, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { WalletCard } from "@/components/card/WalletCard";
import { ScaledBox } from "@/components/ui/ScaledBox";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useWatching } from "@/hooks/useWatching";
import {
  FIRST_PAINT,
  FIRST_REST_MS,
  MOVE_MS,
  PHONE_DECK,
  PHONE_STRIPS,
  drawn,
  placement,
  showing,
  stackView,
  stepAfter,
  type StackCard,
  type StackLevel,
  type StackState,
} from "@/lib/landing-pages/platform/phone-stack";

/** A card is laid out 300px wide and 1.282 tall, the width the wallet card is drawn for. */
const CARD_WIDTH = 300;
const CARD_HEIGHT = Math.round(CARD_WIDTH * 1.282);
/** How much of each card behind shows above the next one: its logo and its count. */
const TOP_HEIGHT = 44;
/** Narrower on a phone, so the buttons under the stack stay in the first screen. */
const PHONE_WIDTH = 255;
/** How far a leaving card slides down as it fades, and how soon it has faded: well before it stops, so it never lingers over the card taking its place. */
const LEAVE_PX = 48;
const LEAVE_FADE_MS = 380;
/** One soft deceleration for every move, so the deck glides rather than steps. */
const EASE = "cubic-bezier(0.32, 0.72, 0, 1)";
/** How long the front card's face takes to cross-fade into what its moment makes it. */
const MOMENT_FADE_MS = 450;

/** False on the server and during hydration, true once the page is live in the browser. */
const subscribeNever = () => () => {};
const useLive = () => useSyncExternalStore(subscribeNever, () => true, () => false);

interface SlotProps {
  card: StackCard;
  slot: number;
  hidden: boolean;
  leaving: boolean;
  /** The face the card's moment makes is drawn over it, ready to fade in (the front card, once the page is live). */
  ready: boolean;
  /** The front card shows what it becomes after its moment. */
  after: boolean;
  /** The front card is playing its moment: it presses 2px, as if stamped. */
  pressed: boolean;
  levelNames: LevelNames;
}

/** What a level card prints over its count, by level. */
type LevelNames = Readonly<Record<StackLevel, string>>;

/** A card's face as the wallet draws it, QR code included, so a card that comes to the front has nothing left to draw. */
function Face({ card, after, levelNames }: Readonly<{ card: StackCard; after: boolean; levelNames: LevelNames }>) {
  const shown = showing(card, after);

  return (
    <WalletCard
      design={shown.design}
      stamps={shown.stamps}
      pointsBalance={shown.pointsBalance}
      pointsRewards={shown.pointsRewards}
      headerLabel={shown.level && levelNames[shown.level]}
    />
  );
}

/**
 * One card in its place: moved by `slot`, faded when hidden or leaving, every move on the same easing and length. A
 * leaving card stays on top as it slides down and fades, over the card taking its place. A card with a moment
 * cross-fades into it rather than swapping its face.
 */
const Slot = memo(function Slot({ card, slot, hidden, leaving, ready, after, pressed, levelNames }: SlotProps) {
  const before = useMemo(() => <Face card={card} after={false} levelNames={levelNames} />, [card, levelNames]);
  const moment = useMemo(() => (card.moment ? <Face card={card} after levelNames={levelNames} /> : null), [card, levelNames]);

  return (
    <div
      className={`absolute top-0 left-0 transition-[transform,opacity] will-change-transform motion-reduce:transition-none ${hidden || leaving ? "opacity-0" : "opacity-100"}`}
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        zIndex: leaving ? 21 : 20 - slot,
        transitionDuration: leaving ? `${MOVE_MS}ms, ${LEAVE_FADE_MS}ms` : `${MOVE_MS}ms`,
        transitionTimingFunction: EASE,
        transform: `translate3d(0, ${(PHONE_STRIPS - slot) * TOP_HEIGHT + (leaving ? LEAVE_PX : 0)}px, 0)`,
      }}
    >
      <div className={`relative ${pressed ? "wst-press" : ""}`} style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}>
        {before}
        {ready && moment && (
          <div
            className="absolute inset-0 transition-opacity motion-reduce:transition-none"
            style={{ opacity: after ? 1 : 0, transitionDuration: `${MOMENT_FADE_MS}ms`, transitionTimingFunction: EASE }}
          >
            {moment}
          </div>
        )}
      </div>
    </div>
  );
});

/**
 * A phone's Wallet: the tops of three cards stacked above the front card, which is drawn whole. Once it is in
 * view the front card plays its moment if it has one, then slides down and fades as the deck moves up into its place.
 * The clock runs only while someone can see the stack; a reader who asks for less motion gets the still first
 * paint, the deck's first card in front. `deck` is the season's cards, the page's by default.
 */
export function PhoneWalletStack({
  label,
  levelNames,
  deck = PHONE_DECK,
}: Readonly<{ label: string; levelNames: LevelNames; deck?: readonly StackCard[] }>) {
  const stage = useRef<HTMLDivElement>(null);
  const [clock, setClock] = useState<StackState>(FIRST_PAINT);
  const reduced = usePrefersReducedMotion();
  const running = useWatching(stage, 0.3);
  const live = useLive();
  const firstRest = useRef(true);
  const view = stackView(clock, reduced);

  useEffect(() => {
    if (!view.animated || !running) return;
    const step = stepAfter(clock, Boolean(deck[clock.front].moment), deck.length);
    const wait = firstRest.current ? FIRST_REST_MS : step.after;
    const timer = setTimeout(() => {
      firstRest.current = false;
      setClock(step.state);
    }, wait);

    return () => clearTimeout(timer);
  }, [clock, running, view.animated, deck]);

  return (
    <div ref={stage} role="img" aria-label={label} className="mx-auto w-fit">
      <ScaledBox
        width={CARD_WIDTH}
        height={PHONE_STRIPS * TOP_HEIGHT + CARD_HEIGHT}
        to={CARD_WIDTH}
        narrowTo={PHONE_WIDTH}
        breakpoint="sm"
      >
        <div aria-hidden className="relative" style={{ width: CARD_WIDTH, height: PHONE_STRIPS * TOP_HEIGHT + CARD_HEIGHT }}>
          {deck.map((card, index) => {
            const place = placement(index, view, deck.length);
            if (!drawn(place, live && view.animated)) return null;
            const isFront = index === view.front;

            return (
              <Slot
                key={card.id}
                card={card}
                slot={place.slot}
                hidden={place.hidden}
                leaving={place.leaving}
                ready={live && view.animated && isFront}
                after={view.after && isFront}
                pressed={view.animated && view.phase === "moment" && isFront}
                levelNames={levelNames}
              />
            );
          })}
        </div>
      </ScaledBox>
    </div>
  );
}

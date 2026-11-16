"use client";

import { memo, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { WalletCard } from "@/components/card/WalletCard";
import { ScaledBox } from "@/components/ui/ScaledBox";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useWatching } from "@/hooks/useWatching";
import {
  FIRST_PAINT,
  FIRST_REST_MS,
  PHONE_DECK,
  PHONE_STRIPS,
  drawn,
  placement,
  showing,
  stackView,
  stepAfter,
  type StackCard,
  type StackState,
} from "@/lib/landing-pages/platform/phone-stack";

/** A card is laid out 300px wide and 1.282 tall, the width the wallet card is drawn for. */
const CARD_WIDTH = 300;
const CARD_HEIGHT = Math.round(CARD_WIDTH * 1.282);
/** How much of each card behind shows above the next one: its logo and its count. */
const TOP_HEIGHT = 44;
/** Narrower on a phone, so the buttons under the stack stay in the first screen. */
const PHONE_WIDTH = 255;
/** How far a leaving card slides down as it fades. */
const LEAVE_PX = 24;

/** False on the server and during hydration, true once the page is live in the browser. */
const subscribeNever = () => () => {};
const useLive = () => useSyncExternalStore(subscribeNever, () => true, () => false);

interface SlotProps {
  card: StackCard;
  slot: number;
  hidden: boolean;
  leaving: boolean;
  /** The card in front shows its QR code, as a pass does when it is open. */
  front: boolean;
  /** The front card shows what it becomes after its moment. */
  after: boolean;
  /** The front card is playing its moment: it presses 2px, as if stamped. */
  pressed: boolean;
}

/** One card in its place: moved by `slot`, faded when hidden or leaving. Only a card whose own state changed redraws its face. */
const Slot = memo(function Slot({ card, slot, hidden, leaving, front, after, pressed }: SlotProps) {
  const face = useMemo(() => {
    const shown = showing(card, after);

    return (
      <WalletCard
        design={shown.design}
        stamps={shown.stamps}
        pointsBalance={shown.pointsBalance}
        pointsRewards={shown.pointsRewards}
        headerLabel={shown.headerLabel}
        showQR={front}
      />
    );
  }, [card, after, front]);

  return (
    <div
      className={`absolute top-0 left-0 transition-[transform,opacity] ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none ${leaving ? "duration-300" : "duration-[400ms]"} ${hidden || leaving ? "opacity-0" : "opacity-100"}`}
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        zIndex: 20 - slot,
        transform: `translate3d(0, ${(PHONE_STRIPS - slot) * TOP_HEIGHT + (leaving ? LEAVE_PX : 0)}px, 0)`,
      }}
    >
      <div className={pressed ? "wst-press" : undefined} style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}>
        {face}
      </div>
    </div>
  );
});

/**
 * A phone's Wallet: the tops of three cards stacked above the front card, which is drawn whole. Once it is in
 * view the front card plays its moment if it has one, slides down and fades, and the next card takes its place.
 * The clock runs only while someone can see the stack; a reader who asks for less motion gets the still first
 * paint, Aurevo's card in front at its fifth stamp.
 */
export function PhoneWalletStack({ label }: Readonly<{ label: string }>) {
  const stage = useRef<HTMLDivElement>(null);
  const [clock, setClock] = useState<StackState>(FIRST_PAINT);
  const reduced = usePrefersReducedMotion();
  const running = useWatching(stage, 0.3);
  const live = useLive();
  const firstRest = useRef(true);
  const view = stackView(clock, reduced);

  useEffect(() => {
    if (!view.animated || !running) return;
    const step = stepAfter(clock, Boolean(PHONE_DECK[clock.front].moment));
    const wait = firstRest.current ? FIRST_REST_MS : step.after;
    const timer = setTimeout(() => {
      firstRest.current = false;
      setClock(step.state);
    }, wait);

    return () => clearTimeout(timer);
  }, [clock, running, view.animated]);

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
          {PHONE_DECK.map((card, index) => {
            const place = placement(index, view, PHONE_DECK.length);
            if (!drawn(place, live && view.animated)) return null;
            const isFront = index === view.front;

            return (
              <Slot
                key={card.id}
                card={card}
                slot={place.slot}
                hidden={place.hidden}
                leaving={place.leaving}
                front={isFront}
                after={view.after && isFront}
                pressed={view.animated && view.phase === "moment" && isFront}
              />
            );
          })}
        </div>
      </ScaledBox>
    </div>
  );
}

"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import { WalletCard } from "@/components/card/WalletCard";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useWatching } from "@/hooks/useWatching";
import {
  FIRST_REST_MS,
  STACK_CARDS,
  STACK_STRIPS,
  placement,
  showing,
  stackView,
  stepAfter,
  type StackCard,
  type StackState,
} from "@/lib/landing-pages/platform/wallet-stack";

/** A card is laid out 300px wide, 1.282 tall: the width the wallet card is drawn for. */
const CARD_WIDTH = 300;
const CARD_HEIGHT = Math.round(CARD_WIDTH * 1.282);
/** How far a leaving card slides down as it fades. */
const LEAVE_PX = 24;
/** The strips land one after another, 50ms apart, the front card last. */
const LAND_STEP_MS = 50;

/** The drop-in and the press, as keyframes; a reader who asks for less motion gets neither. */
const KEYFRAMES = `
@keyframes wst-land { from { opacity: 0; transform: translateY(-8px); } }
@keyframes wst-press { 35% { transform: translateY(2px); } }
.wst-land { animation: wst-land 480ms cubic-bezier(0.2, 0.8, 0.2, 1) both; }
.wst-press { animation: wst-press 450ms ease-out; }
@media (prefers-reduced-motion: reduce) { .wst-land, .wst-press { animation: none; } }
`;

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
  /** How long this card waits before it lands on first paint. */
  landDelay: number;
}

/** One card in its place: moved by `slot`, faded when hidden or leaving. Only a card whose own state changed redraws its face. */
const Slot = memo(function Slot({ card, slot, hidden, leaving, front, after, pressed, landDelay }: SlotProps) {
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
  // The two strips above the fourth stay out of sight on a phone; hidden and leaving cards are out of sight everywhere.
  const opacity = hidden || leaving ? "opacity-0" : slot > STACK_STRIPS.phone ? "max-lg:opacity-0" : "opacity-100";

  return (
    <div
      className={`absolute left-0 transition-[transform,opacity] ease-[cubic-bezier(0.2,0.8,0.2,1)] ${leaving ? "duration-300" : "duration-[400ms]"} ${opacity}`}
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        top: "calc(var(--strips) * var(--pitch))",
        zIndex: 20 - slot,
        transform: `translate3d(0, calc(var(--pitch) * ${-slot} + ${leaving ? LEAVE_PX : 0}px), 0)`,
      }}
    >
      <div className="wst-land" style={{ animationDelay: `${landDelay}ms` }}>
        <div className={pressed ? "wst-press" : undefined} style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}>
          {face}
        </div>
      </div>
    </div>
  );
});

/**
 * The hero's stack of wallet cards, drawn like a phone's Wallet: the front card whole, the others showing only
 * their header as strips above it (four on a phone, six from a laptop). The front card plays its moment if it
 * has one, slides away, and the strip above it takes its place; the card that left comes back at the top many
 * steps later. The clock runs only while the stack is in view and the tab is in front; a reader who asks for
 * less motion gets it still, with Aurevo in front at its sixth stamp. Cards are drawn at 300px wide and the
 * whole stack is scaled to 1.1 from `lg`, so the front card ends above a 900px fold.
 */
export function WalletStack({ label }: Readonly<{ label: string }>) {
  const stage = useRef<HTMLDivElement>(null);
  const [clock, setClock] = useState<StackState>({ front: 0, phase: "rest" });
  const reduced = usePrefersReducedMotion();
  const running = useWatching(stage, 0.3);
  const firstRest = useRef(true);
  const view = stackView(clock, reduced);

  useEffect(() => {
    if (!view.animated || !running) return;
    const step = stepAfter(clock, Boolean(STACK_CARDS[clock.front].moment));
    const wait = firstRest.current ? FIRST_REST_MS : step.after;
    const timer = setTimeout(() => {
      firstRest.current = false;
      setClock(step.state);
    }, wait);

    return () => clearTimeout(timer);
  }, [clock, running, view.animated]);

  return (
    <div
      ref={stage}
      role="img"
      aria-label={label}
      className="relative w-full max-lg:-mx-4 max-lg:w-[calc(100%+2rem)] max-lg:overflow-hidden max-lg:[mask-image:linear-gradient(to_bottom,#000_calc(100%-64px),transparent)]"
    >
      <style href="wallet-stack" precedence="default">
        {KEYFRAMES}
      </style>
      {/* Room above the top strip for its shadow. */}
      <div className="pt-7">
        <div className="mx-auto h-[324px] w-[300px] lg:h-[699px] lg:w-[330px]">
          <div
            aria-hidden
            className="relative origin-top-left [--pitch:46px] [--strips:4] lg:scale-[1.1] lg:[--pitch:41.67px] lg:[--strips:6]"
            style={{ width: CARD_WIDTH }}
          >
            {STACK_CARDS.map((card, index) => {
              const place = placement(index, view, STACK_CARDS.length);
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
                  landDelay={Math.max(STACK_STRIPS.desktop - place.slot, 0) * LAND_STEP_MS}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

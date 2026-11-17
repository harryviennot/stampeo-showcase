"use client";

import { memo, useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { WalletCard } from "@/components/card/WalletCard";
import { CaretLeftIcon, CaretRightIcon } from "@/components/icons";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useWatching } from "@/hooks/useWatching";
import {
  RESKIN_SHOPS,
  RESKIN_STEP_MS,
  reskinCard,
  reskinPlacement,
  reskinStep,
  reskinView,
  swipeDirection,
  type ReskinCard,
  type ReskinRole,
  type ReskinState,
  type ReskinWords,
} from "@/lib/landing-pages/previews/reskin";
import { Chip } from "../../shared/Chip";

/** A card is laid out 300px wide and 1.282 tall; it is drawn at 260px on a phone and 320px from `lg`, a neighbour at 220px. */
const CARD_WIDTH = 300;
const CARD_HEIGHT = 385;

/** Each role's look: size and opacity per breakpoint. A neighbour is invisible on a phone, where the live card stands alone. */
const ROLE: Record<ReskinRole, string> = {
  live: "opacity-100 [--s:0.8667] lg:[--s:1.0667]",
  side: "max-lg:opacity-0 lg:opacity-60 [--s:0.8667] lg:[--s:0.7333]",
  hidden: "opacity-0 [--s:0.8667] lg:[--s:0.7333]",
};
const LAYER: Record<ReskinRole, number> = { live: 30, side: 20, hidden: 10 };

const ROUND_BUTTON =
  "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[var(--foreground)] shadow-[0_1px_2px_rgba(25,18,16,0.08)] ring-1 ring-black/10 transition-colors hover:bg-[var(--background-subtle)] motion-reduce:transition-none";

interface SlotProps {
  card: ReskinCard;
  offset: number;
  role: ReskinRole;
}

/** One shop's card in its place in the row; a card that only moves does not redraw its face. */
const Slot = memo(function Slot({ card, offset, role }: SlotProps) {
  const face = useMemo(
    () => (
      <WalletCard
        design={card.design}
        stamps={card.stamps}
        pointsBalance={card.pointsBalance}
        pointsRewards={card.pointsRewards}
      />
    ),
    [card],
  );

  return (
    <div
      className={`absolute top-1/2 left-1/2 transition-[transform,opacity] ease-[cubic-bezier(0.2,0.8,0.2,1)] [transition-duration:450ms,300ms] motion-reduce:transition-none ${ROLE[role]}`}
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        marginLeft: -CARD_WIDTH / 2,
        marginTop: -CARD_HEIGHT / 2,
        zIndex: LAYER[role],
        transform: `translateX(calc(var(--pitch) * ${offset})) scale(var(--s))`,
      }}
    >
      {face}
    </div>
  );
});

/**
 * The hero's wallet card, one shop at a time: the layout stays put while its logo, colours and stamps change, with a
 * caption and a button either side and a dot for each shop under it. The card moves on slowly by itself while it is in
 * view, until a visitor takes over with a button, a dot or a swipe; a reader who asks for less motion never has it move.
 */
export function ReskinCards({
  captions,
  words,
  alt,
  labels,
}: Readonly<{
  captions: readonly string[];
  /** The words on each card's two fields. */
  words: ReskinWords;
  alt: string;
  labels: { previous: string; next: string; dot: string };
}>) {
  const cards = useMemo(() => RESKIN_SHOPS.map((id) => reskinCard(id, words)), [words]);
  const stage = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number } | null>(null);
  const [state, setState] = useState<ReskinState>({ active: 0, touched: false });
  const reduced = usePrefersReducedMotion();
  const running = useWatching(stage, 0.3);
  const view = reskinView(state, reduced);

  useEffect(() => {
    if (!view.autoplay || !running) return;
    const timer = setTimeout(() => setState((now) => reskinStep(now, { type: "tick" }, cards.length)), RESKIN_STEP_MS);

    return () => clearTimeout(timer);
  }, [state, running, view.autoplay, cards.length]);

  const go = (type: "previous" | "next") => setState((now) => reskinStep(now, { type }, cards.length));
  const show = (index: number) => setState((now) => reskinStep(now, { type: "show", index }, cards.length));

  const startDrag = (event: PointerEvent) => {
    drag.current = { x: event.clientX, y: event.clientY };
  };
  const endDrag = (event: PointerEvent) => {
    const start = drag.current;

    drag.current = null;
    const direction = start && swipeDirection(event.clientX - start.x, event.clientY - start.y);
    if (direction) go(direction);
  };

  return (
    <div className="flex w-full flex-col items-center">
      {/* A finger can still scroll the page up and down over the card; a sideways swipe turns it. */}
      <div
        className="w-full touch-pan-y select-none lg:[mask-image:linear-gradient(to_right,transparent,#000_14%,#000_86%,transparent)]"
        onPointerDown={startDrag}
        onPointerUp={endDrag}
        onPointerCancel={() => (drag.current = null)}
      >
        <div
          ref={stage}
          role="img"
          aria-label={alt}
          className="relative mx-auto h-[334px] w-full max-w-[1000px] [--pitch:0px] lg:h-[491px] lg:overflow-hidden lg:[--pitch:294px]"
        >
          <div aria-hidden>
            {cards.map((card, index) => (
              <Slot key={card.id} card={card} {...reskinPlacement(index, view.active, cards.length)} />
            ))}
          </div>
        </div>
      </div>

      <div aria-live={view.announce ? "polite" : "off"} className="mt-3 lg:mt-1">
        <Chip className="px-4! py-1.5! text-sm!">{captions[view.active]}</Chip>
      </div>

      <div className="mt-2 flex items-center gap-1">
        <button type="button" aria-label={labels.previous} onClick={() => go("previous")} className={ROUND_BUTTON}>
          <CaretLeftIcon size={18} weight="bold" aria-hidden />
        </button>
        <div className="flex items-center">
          {cards.map((card, index) => (
            <button
              key={card.id}
              type="button"
              aria-label={labels.dot.replace("{shop}", captions[index])}
              aria-current={index === view.active ? "true" : undefined}
              onClick={() => show(index)}
              className="group inline-flex h-11 w-6 items-center justify-center"
            >
              <span
                aria-hidden
                className={`h-2 w-2 rounded-full transition-colors duration-300 motion-reduce:transition-none ${index === view.active ? "bg-[var(--foreground)]" : "bg-black/20 group-hover:bg-black/40"}`}
              />
            </button>
          ))}
        </div>
        <button type="button" aria-label={labels.next} onClick={() => go("next")} className={ROUND_BUTTON}>
          <CaretRightIcon size={18} weight="bold" aria-hidden />
        </button>
      </div>
    </div>
  );
}

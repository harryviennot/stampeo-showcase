"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import { WalletCard } from "@/components/card/WalletCard";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useWatching } from "@/hooks/useWatching";
import {
  RESKIN_SHOPS,
  RESKIN_STEP_MS,
  nextShop,
  reskinCard,
  reskinPlacement,
  reskinView,
  type ReskinCard,
  type ReskinRole,
} from "@/lib/landing-pages/previews/reskin";
import { Chip } from "../../shared/PlanChip";

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
      className={`absolute top-1/2 left-1/2 transition-[transform,opacity] ease-[cubic-bezier(0.2,0.8,0.2,1)] [transition-duration:450ms,300ms] ${ROLE[role]}`}
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

const CARDS = RESKIN_SHOPS.map(reskinCard);

/**
 * The hero's wallet card, one shop at a time: the layout stays put while its logo, colours and stamps change, with a
 * caption under it. The clock runs only while the card is in view; a reader who asks for less motion gets the first shop.
 */
export function ReskinCards({ captions, alt }: Readonly<{ captions: readonly string[]; alt: string }>) {
  const stage = useRef<HTMLDivElement>(null);
  const [clock, setClock] = useState(0);
  const reduced = usePrefersReducedMotion();
  const running = useWatching(stage, 0.3);
  const view = reskinView(clock, reduced);

  useEffect(() => {
    if (!view.animated || !running) return;
    const timer = setTimeout(() => setClock((shop) => nextShop(shop, CARDS.length)), RESKIN_STEP_MS);

    return () => clearTimeout(timer);
  }, [clock, running, view.animated]);

  return (
    <div className="flex flex-col items-center">
      {/* On a phone only the top of the card shows, fading out under the fields, so the trial stays in the first screen. */}
      <div className="w-full max-lg:h-[238px] max-lg:overflow-hidden max-lg:pt-6 max-lg:[mask-image:linear-gradient(to_bottom,#000_calc(100%-56px),transparent)]">
        <div
          ref={stage}
          role="img"
          aria-label={alt}
          className="relative mx-auto h-[334px] w-full max-w-[1000px] [--pitch:0px] lg:h-[411px] lg:[--pitch:294px]"
        >
          <div aria-hidden>
            {CARDS.map((card, index) => (
              <Slot key={card.id} card={card} {...reskinPlacement(index, view.active, CARDS.length)} />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4 lg:mt-5">
        <Chip className="px-4! py-1.5! text-sm!">{captions[view.active]}</Chip>
        {view.animated && (
          <div aria-hidden className="flex gap-2">
            {CARDS.map((card, index) => (
              <span
                key={card.id}
                className={`h-2 w-2 rounded-full transition-colors duration-300 ${index === view.active ? "bg-[var(--near-black)]" : "bg-[var(--border)]"}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

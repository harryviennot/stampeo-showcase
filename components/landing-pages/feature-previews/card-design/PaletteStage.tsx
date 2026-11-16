"use client";

import { useEffect, useRef, useState } from "react";
import { WalletCard } from "@/components/card/WalletCard";
import { InkArrow } from "@/components/ui/InkAnnotation";
import { ScaledBox } from "@/components/ui/ScaledBox";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useWatching } from "@/hooks/useWatching";
import { PULP_CARD, PULP_PALETTES, paletteDesign, palettePlayback } from "@/lib/landing-pages/previews/pulp-palettes";
import { STAMPED_STAGE } from "../../platform/classes";

/** The card is laid out 300px wide and 1.282 tall; it is drawn at 260px on a phone. */
const CARD = { width: 300, height: 385, narrow: 260 };
/** Each palette is on show this long while the card tries them in turn, in ms. */
const PLAY_STEP_MS = 1200;

/**
 * The stamped stage of the colour section: the logo on its tile with its label, the card in the selected
 * palette, and a button for each of the five palettes, each a circle split between the card colour and the
 * stamp colour. On a phone the palettes sit above the card, so the card stays in view as they are tapped.
 * Once the stage is in view the card tries the other four palettes in turn and settles on the first; a tap
 * stops that. A reader who asks for less motion gets the first palette and no tour.
 */
export function PaletteStage({
  logoLabel,
  logoAlt,
  cardAlt,
  swatchNames,
}: Readonly<{ logoLabel: string; logoAlt: string; cardAlt: string; swatchNames: readonly string[] }>) {
  const stage = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState(0);
  const reduced = usePrefersReducedMotion();
  const watching = useWatching(stage, 0.4);
  const started = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (!watching || started.current || reduced) return;
    started.current = true;
    timers.current.push(...palettePlayback(reduced).map((index, step) => setTimeout(() => setSelected(index), (step + 1) * PLAY_STEP_MS)));
  }, [watching, reduced]);

  useEffect(() => {
    const pending = timers.current;

    return () => pending.forEach(clearTimeout);
  }, []);

  const pick = (index: number) => {
    timers.current.splice(0).forEach(clearTimeout);
    started.current = true;
    setSelected(index);
  };

  return (
    <div ref={stage} className={`${STAMPED_STAGE} mx-auto max-w-4xl p-5 sm:p-8 lg:px-12 lg:py-12`}>
      <div className="flex flex-col items-center gap-5 lg:flex-row lg:justify-center lg:gap-14">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-[var(--cream)] ring-1 ring-[var(--border)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={PULP_CARD.design.logo_url} alt={logoAlt} className="h-16 w-auto" />
          </div>
          <p className="text-sm font-medium text-[var(--muted-foreground)]">{logoLabel}</p>
        </div>

        <InkArrow variant="down" className="h-12 w-auto lg:hidden" />
        <InkArrow variant="right" className="hidden h-8 w-auto lg:block" />

        <div className="flex flex-col-reverse items-center gap-6 lg:flex-col">
          <div role="img" aria-label={cardAlt}>
            <ScaledBox width={CARD.width} height={CARD.height} to={CARD.width} narrowTo={CARD.narrow} breakpoint="lg">
              <WalletCard design={{ ...PULP_CARD.design, ...paletteDesign(PULP_PALETTES[selected]) }} stamps={PULP_CARD.stamps} />
            </ScaledBox>
          </div>

          <div className="flex gap-3">
            {PULP_PALETTES.map((palette, index) => (
              <button
                key={palette.id}
                type="button"
                aria-label={swatchNames[index]}
                aria-pressed={index === selected}
                onClick={() => pick(index)}
                className={`h-11 w-11 shrink-0 rounded-full ring-offset-2 transition-shadow ${
                  index === selected ? "ring-[1.5px] ring-[var(--near-black)]" : "ring-1 ring-black/10"
                }`}
                style={{ background: `linear-gradient(135deg, ${palette.background} 50%, ${palette.stampFilled} 50%)` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

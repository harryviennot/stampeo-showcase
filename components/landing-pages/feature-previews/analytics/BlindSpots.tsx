"use client";

import { useEffect, useRef, useState } from "react";
import { Segmented } from "@/components/ui/Segmented";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { ANALYTICS_PREVIEW } from "@/lib/landing-pages/copy/previews/analytics";
import { BlindSpotCard } from "./BlindSpotCard";
import { AUTO_FLIP, allPaper, autoFlipDue, faceShown, flipCard, flipDelayMs, flipMotion, setAll, type Face } from "../../../../lib/landing-pages/previews/analytics-flip";
import { ANSWERS } from "../../../../lib/landing-pages/previews/analytics-sample";

/**
 * The control and the six cards. Everything starts on paper; the control turns all six, a tap turns one, and a
 * scroller who reaches the cards without touching anything sees them turn once by themselves.
 */
export function BlindSpots() {
  const { toggle, unknown, cards } = ANALYTICS_PREVIEW.blindSpots;
  const reduced = usePrefersReducedMotion();
  const motion = flipMotion(reduced);
  const [flips, setFlips] = useState(() => allPaper(cards.length));
  const [cause, setCause] = useState<"control" | "tap">("control");
  const stage = useRef<HTMLDivElement>(null);
  const touched = useRef(false);
  const played = useRef(false);

  useEffect(() => {
    const element = stage.current;
    if (!element || !motion.auto || typeof IntersectionObserver === "undefined") return;

    let ratio = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const turn = () => {
      timer = undefined;
      const due = autoFlipDue({
        amountVisible: ratio,
        waitedMs: AUTO_FLIP.waitMs,
        touched: touched.current,
        played: played.current,
        reduced,
      });
      if (!due) return;
      played.current = true;
      setCause("control");
      setFlips(setAll(cards.length, "stampeo"));
    };
    const observer = new IntersectionObserver(
      (entries) => {
        ratio = entries[entries.length - 1].intersectionRatio;
        if (ratio < AUTO_FLIP.visibleAmount) {
          clearTimeout(timer);
          timer = undefined;
        } else if (timer === undefined) {
          timer = setTimeout(turn, AUTO_FLIP.waitMs);
        }
      },
      { threshold: [0, AUTO_FLIP.visibleAmount, 1] },
    );

    observer.observe(element);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [motion.auto, reduced, cards.length]);

  const choose = (face: Face) => {
    touched.current = true;
    setCause("control");
    setFlips(setAll(cards.length, face));
  };
  const tap = (index: number) => {
    touched.current = true;
    setCause("tap");
    setFlips((current) => flipCard(current, index));
  };

  return (
    <div ref={stage} className="mx-auto max-w-[1040px]">
      <div className="flex justify-center">
        <Segmented
          size="lg"
          ariaLabel={toggle.label}
          className="max-w-[420px]"
          options={[
            { value: "paper", label: toggle.paper },
            { value: "stampeo", label: toggle.stampeo },
          ]}
          value={faceShown(flips)}
          onChange={choose}
        />
      </div>

      <ul className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3">
        {cards.map((card, index) => {
          const answer = ANSWERS[card.key];
          const figure = "figure" in card ? card.figure : answer.figure;

          return (
            <BlindSpotCard
              key={card.key}
              cardKey={card.key}
              question={card.question}
              unknown={unknown}
              figure={figure ?? ""}
              trend={answer.trend}
              line={card.line}
              word={"figure" in card}
              flipped={flips[index]}
              delayMs={flipDelayMs(index, motion, cause)}
              durationMs={motion.durationMs}
              onFlip={() => tap(index)}
            />
          );
        })}
      </ul>
    </div>
  );
}

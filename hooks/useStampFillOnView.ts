"use client";

import { useEffect, useRef, useState } from "react";

/** Matches the demo card's offline animation so both cards fill at one pace. */
const START_DELAY_MS = 800;
const STEP_MS = 400;

/**
 * Fills a wallet card's stamps one by one the first time it scrolls into view,
 * then leaves it full. Returns the stamp count to hand to `WalletCard`, plus
 * the ref to attach to the element being watched.
 *
 * Readers who ask for reduced motion get the filled card with no animation.
 */
export function useStampFillOnView(target: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [stamps, setStamps] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let startTimer: ReturnType<typeof setTimeout> | undefined;
    let stepTimer: ReturnType<typeof setInterval> | undefined;

    const prefersReducedMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        // One-shot: the fill is a greeting, not a loop.
        observer.disconnect();

        if (prefersReducedMotion) {
          setStamps(target);
          return;
        }

        startTimer = setTimeout(() => {
          let current = 0;
          stepTimer = setInterval(() => {
            current += 1;
            setStamps(current);
            if (current >= target && stepTimer) clearInterval(stepTimer);
          }, STEP_MS);
        }, START_DELAY_MS);
      },
      { threshold: 0.35 }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      if (startTimer) clearTimeout(startTimer);
      if (stepTimer) clearInterval(stepTimer);
    };
  }, [target]);

  return { ref, stamps };
}

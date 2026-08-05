"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Publishes the hero's scroll progress as `--fan-scroll` (0 → 1), which the fan
 * slots consume to drift outward as the hero leaves. One custom property beats
 * animating seven elements from JS, and it keeps the fan itself a server
 * component — this only wraps it.
 *
 * Two things here are load-bearing for scroll smoothness:
 *
 *   The property is written onto each `.fan-slot`, not onto this wrapper.
 *   Custom properties inherit, so writing it here invalidated the computed
 *   style of all ~200 nodes inside the cards every frame. globals.css declares
 *   `--fan-scroll` with `inherits: false` so the invalidation cannot spread
 *   past the seven elements whose transform actually reads it.
 *
 *   The scroll distance is measured once, not per frame. `offsetTop` and
 *   `offsetHeight` are synchronous layout reads; taking them inside the rAF
 *   callback forced a layout flush on every frame of every scroll.
 */
export function FanParallax({ children }: Readonly<{ children: ReactNode }>) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const slots = Array.from(el.querySelectorAll<HTMLElement>(".fan-slot"));
    if (!slots.length) return;

    let frame = 0;
    let span = 1;
    let last = -1;

    /* Distance from the top of the page to the bottom of the fan: progress is
       0 while the hero is untouched, 1 once it has fully left. */
    const measure = () => {
      span = Math.max(el.offsetTop + el.offsetHeight, 1);
    };

    const update = () => {
      frame = 0;
      const p = Math.min(Math.max(window.scrollY / span, 0), 1);
      // Two decimals is finer than a single pixel of drift at these distances,
      // and it lets a scroll that has settled skip the write entirely.
      const next = Math.round(p * 100) / 100;
      if (next === last) return;
      last = next;
      for (const slot of slots) slot.style.setProperty("--fan-scroll", String(next));
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    const onResize = () => {
      measure();
      onScroll();
    };

    measure();
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <div ref={ref}>{children}</div>;
}

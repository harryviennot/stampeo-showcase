"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * The window the card wheel turns in: it clips the wheel to its stage and marks
 * itself `data-paused` while it is off-screen, which stops the turn (card-wheel.css).
 */
export function WheelWindow({ children }: Readonly<{ children: ReactNode }>) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => element.toggleAttribute("data-paused", !entry.isIntersecting));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} aria-hidden="true" className="card-wheel-window pointer-events-none absolute inset-0 select-none overflow-hidden">
      {children}
    </div>
  );
}

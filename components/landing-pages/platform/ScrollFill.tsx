"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { treeFill } from "@/lib/landing-pages/scroll-fill";

/**
 * Publishes how far the share tree's branches are filled as `--fill`, from 0 to
 * 1, on its own box, following the scroll while the tree is near the screen.
 * The server markup has it full, which a reader who asks for less motion keeps.
 */
export function ScrollFill({ className = "", children }: Readonly<{ className?: string; children: ReactNode }>) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let last = -1;

    const update = () => {
      frame = 0;
      const { top, height } = element.getBoundingClientRect();
      // Hundredths are finer than a pixel of stroke, and let a settled scroll skip the write.
      const fill = Math.round(treeFill({ top, height, viewport: window.innerHeight }) * 100) / 100;
      if (fill === last) return;
      last = fill;
      element.style.setProperty("--fill", String(fill));
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    // Listens to the scroll only while the tree is within a quarter screen of the viewport.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) window.addEventListener("scroll", onScroll, { passive: true });
        else window.removeEventListener("scroll", onScroll);
        update();
      },
      { rootMargin: "25% 0px" },
    );
    observer.observe(element);
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={ref} className={className} style={{ "--fill": 1 } as CSSProperties}>
      {children}
    </div>
  );
}

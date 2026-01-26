"use client";

import { useEffect, useRef, useState } from "react";

interface UseScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: UseScrollRevealOptions = {}
) {
  const { threshold = 0.1, rootMargin = "0px 0px -50px 0px", triggerOnce = true } = options;
  const ref = useRef<T>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsRevealed(true);
            if (triggerOnce) {
              observer.unobserve(entry.target);
            }
          } else if (!triggerOnce) {
            setIsRevealed(false);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, isRevealed };
}

// Helper component for easy scroll reveal
export function useScrollRevealClass(
  baseClass: string,
  revealClass: string = "scroll-reveal",
  options: UseScrollRevealOptions = {}
) {
  const { ref, isRevealed } = useScrollReveal(options);
  const className = `${baseClass} ${revealClass} ${isRevealed ? "revealed" : ""}`;
  return { ref, className, isRevealed };
}

"use client";

import { useEffect, useState, useSyncExternalStore, type RefObject } from "react";

const subscribeToVisibility = (onChange: () => void) => {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
};

/**
 * Whether the element is at least `threshold` in view and the page is the tab in front: what an animation
 * that should run only while someone can see it waits for. False until the observer has reported.
 */
export function useWatching(ref: RefObject<HTMLElement | null>, threshold: number): boolean {
  const [inView, setInView] = useState(false);
  const tabVisible = useSyncExternalStore(
    subscribeToVisibility,
    () => document.visibilityState !== "hidden",
    () => true,
  );

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold });

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, threshold]);

  return inView && tabVisible;
}

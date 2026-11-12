"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * Renders its children once the browser has a quiet moment after the page has
 * loaded, and nothing before: for decoration the first paint does not need.
 */
export function WhenIdle({ children }: Readonly<{ children: ReactNode }>) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const show = () => setReady(true);
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(show, { timeout: 2000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(show, 1200);
    return () => window.clearTimeout(id);
  }, []);

  return ready ? children : null;
}

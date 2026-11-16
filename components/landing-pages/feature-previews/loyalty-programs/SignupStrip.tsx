"use client";

import { useSyncExternalStore } from "react";
import { LevelStrip } from "@/components/acquisition/LevelStrip";
import type { PublicLevel } from "@/lib/levels/levels";

const subscribe = () => () => {};

/**
 * The real sign-up strip, drawn in the browser only: it brings its own heading and "How it works" button, which
 * a picture has no use for in the page's own outline and tap targets. The slot keeps its height until it appears.
 */
export function SignupStrip({ levels }: Readonly<{ levels: PublicLevel[] }>) {
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);

  return (
    <div className="flow-root min-h-[124px] w-full max-w-[320px]">{mounted && <LevelStrip levels={levels} programType="stamps" />}</div>
  );
}

"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

/** Framer skips movement (it keeps fades) for a reader who asks for less motion, where `active`; `children` untouched otherwise. */
export function ReducedMotion({ active, children }: Readonly<{ active: boolean; children: ReactNode }>) {
  return active ? <MotionConfig reducedMotion="user">{children}</MotionConfig> : children;
}

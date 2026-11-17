import type { ReactNode } from "react";
import { CARD_TITLE } from "./classes";

/** A clear step under the section's h2. */
const TITLE = `mb-4 ${CARD_TITLE} lg:text-[1.5rem]`;

/**
 * A light, translucent card that floats over a picture, its title
 * left-aligned. `float` makes it drift a few pixels (still for readers who ask
 * for less motion); the animation owns `transform`, so place a floating card
 * with offsets, not a transform.
 */
export function GlassCard({
  title,
  float = false,
  className = "",
  children,
}: Readonly<{
  title?: string;
  float?: boolean;
  className?: string;
  children?: ReactNode;
}>) {
  return (
    <div
      className={`rounded-[28px] bg-white/80 p-5 shadow-[0_32px_64px_-32px_rgba(25,18,16,0.32),0_6px_16px_-8px_rgba(25,18,16,0.08)] ring-1 ring-black/[0.06] backdrop-blur-xl backdrop-saturate-150 lg:p-6 ${
        float ? "lp-float" : ""
      } ${className}`}
    >
      {title && <h3 className={TITLE}>{title}</h3>}
      {children}
    </div>
  );
}

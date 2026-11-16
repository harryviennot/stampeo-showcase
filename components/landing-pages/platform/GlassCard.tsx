import type { ReactNode } from "react";

/** The card's title: left-aligned over its picture, a clear step under the section's h2. */
const TITLE =
  "mb-4 text-[1.25rem] leading-[1.15] font-medium tracking-[-0.02em] text-balance text-[var(--foreground)] lg:text-[1.5rem]";

/**
 * A white card in the house ink frame that floats over a picture, its title
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
      className={`card-stamp rounded-[20px] bg-white p-5 lg:p-6 ${float ? "lp-float" : ""} ${className}`}
    >
      {title && <h3 className={TITLE}>{title}</h3>}
      {children}
    </div>
  );
}

import type { ReactNode } from "react";

/** A large card title, left-aligned over a picture. */
const TITLE =
  "mb-4 text-[1.5rem] leading-[1.1] font-medium tracking-[-0.025em] text-balance text-[var(--foreground)] lg:text-[1.75rem]";
/** A short centred title over a small figure. */
const CENTRED_TITLE =
  "mb-3 text-[1.25rem] leading-[1.15] font-medium tracking-[-0.02em] text-balance text-[var(--foreground)] lg:text-[1.375rem]";

/** Takes a child out to the card's sides and bottom edge, rounded as the card is. */
export const GLASS_BLEED = "-mx-5 -mb-5 rounded-b-[28px] lg:-mx-6 lg:-mb-6";

/**
 * A light, translucent card that floats over a picture, its title large and
 * left-aligned, or centred with `align="center"`. `float` makes it drift a few
 * pixels (still for readers who ask for less motion); the animation owns
 * `transform`, so place a floating card with offsets, not a transform.
 */
export function GlassCard({
  title,
  align = "left",
  float = false,
  className = "",
  children,
}: Readonly<{
  title?: string;
  align?: "left" | "center";
  float?: boolean;
  className?: string;
  children?: ReactNode;
}>) {
  const centred = align === "center";

  return (
    <div
      className={`rounded-[28px] bg-white/80 p-5 shadow-[0_32px_64px_-32px_rgba(25,18,16,0.32),0_6px_16px_-8px_rgba(25,18,16,0.08)] ring-1 ring-black/[0.06] backdrop-blur-xl backdrop-saturate-150 lg:p-6 ${
        centred ? "text-center" : ""
      } ${float ? "lp-float" : ""} ${className}`}
    >
      {title && <h3 className={centred ? CENTRED_TITLE : TITLE}>{title}</h3>}
      {children}
    </div>
  );
}

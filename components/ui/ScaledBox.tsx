import type { CSSProperties, ReactNode } from "react";

/** The classes that switch a box between its narrow and its wide size at a breakpoint (written out so Tailwind sees them). */
const AT = {
  sm: {
    box: "h-[var(--narrow-h)] w-[var(--narrow-w)] sm:h-[var(--wide-h)] sm:w-[var(--wide-w)]",
    scale: "scale-[var(--narrow-scale)] sm:scale-[var(--wide-scale)]",
  },
  lg: {
    box: "h-[var(--narrow-h)] w-[var(--narrow-w)] lg:h-[var(--wide-h)] lg:w-[var(--wide-w)]",
    scale: "scale-[var(--narrow-scale)] lg:scale-[var(--wide-scale)]",
  },
} as const;

/**
 * Something drawn at `width` by `height` and shrunk by a fixed CSS scale to
 * `to` px wide (the drawn width when left out), so it never resizes on
 * hydration. With `narrowTo` it is that wide below `breakpoint` instead, and
 * its narrow height is a whole number of px.
 */
export function ScaledBox({
  width,
  height,
  to = width,
  narrowTo,
  breakpoint = "lg",
  className = "",
  children,
}: Readonly<{
  width: number;
  height: number;
  to?: number;
  narrowTo?: number;
  breakpoint?: keyof typeof AT;
  className?: string;
  children: ReactNode;
}>) {
  const scale = to / width;

  if (narrowTo === undefined) {
    return (
      <div className={`shrink-0 ${className}`} style={{ width: to, height: height * scale }}>
        <div style={{ width, height, transform: `scale(${scale})`, transformOrigin: "top left" }}>{children}</div>
      </div>
    );
  }

  const narrowScale = narrowTo / width;

  return (
    <div
      className={`shrink-0 ${AT[breakpoint].box} ${className}`}
      style={
        {
          "--narrow-w": `${narrowTo}px`,
          "--narrow-h": `${Math.round(height * narrowScale)}px`,
          "--narrow-scale": narrowScale,
          "--wide-w": `${to}px`,
          "--wide-h": `${height * scale}px`,
          "--wide-scale": scale,
        } as CSSProperties
      }
    >
      <div className={`origin-top-left ${AT[breakpoint].scale}`} style={{ width, height }}>
        {children}
      </div>
    </div>
  );
}

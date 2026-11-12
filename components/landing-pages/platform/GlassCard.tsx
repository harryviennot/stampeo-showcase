import type { ReactNode } from "react";

/**
 * A translucent, blurred card that floats over a picture. `float` makes it
 * drift a few pixels (still for readers who ask for less motion); the
 * animation owns `transform`, so place a floating card with offsets, not a
 * transform.
 */
export function GlassCard({
  title,
  icon,
  float = false,
  className = "",
  children,
}: Readonly<{ title?: string; icon?: ReactNode; float?: boolean; className?: string; children?: ReactNode }>) {
  return (
    <div
      className={`rounded-2xl bg-white/70 p-4 shadow-[0_12px_32px_-12px_rgba(25,18,16,0.25)] ring-1 ring-black/5 backdrop-blur ${
        float ? "lp-float" : ""
      } ${className}`}
    >
      {(title || icon) && (
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-balance text-[var(--foreground)]">
          {icon}
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

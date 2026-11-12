import type { CSSProperties, ReactNode } from "react";

/**
 * Something drawn at `width` by `height` and shrunk by a fixed CSS scale to
 * `narrowWidth` below `lg`, so a phone or a card is smaller on a narrow
 * screen without ever resizing on hydration.
 */
export function ScaledBox({
  width,
  height,
  narrowWidth,
  children,
}: Readonly<{ width: number; height: number; narrowWidth: number; children: ReactNode }>) {
  const scale = narrowWidth / width;

  return (
    <div
      className="relative h-[var(--narrow-h)] w-[var(--narrow-w)] shrink-0 lg:h-[var(--full-h)] lg:w-[var(--full-w)]"
      style={
        {
          "--full-w": `${width}px`,
          "--full-h": `${height}px`,
          "--narrow-w": `${narrowWidth}px`,
          "--narrow-h": `${Math.round(height * scale)}px`,
          "--narrow-scale": scale,
        } as CSSProperties
      }
    >
      <div className="origin-top-left scale-[var(--narrow-scale)] lg:scale-100" style={{ width }}>
        {children}
      </div>
    </div>
  );
}

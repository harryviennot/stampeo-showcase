import type { ReactNode } from "react";
import { ScaledBox } from "@/components/ui/ScaledBox";

/**
 * The dashboard's own colours as its captures show them: the chart and trend
 * inks, and the label grey (the same tokens Platform's analytics tiles use).
 */
export const INK = {
  navy: "#0f172a",
  periwinkle: "#adbbdc",
  up: "#2e9e5b",
  figure: "#1a1a1a",
  label: "#8a8a8a",
  track: "#eceff7",
} as const;

/** A drawn mini is laid out at this size, then shrunk to a thumbnail beside a row's words and shown whole from `lg`. */
export const TILE = { width: 232, height: 244, narrowTo: 128, to: 240 } as const;

/**
 * A piece of the dashboard as one white tile, a row's picture. `label` is the
 * picture's accessible name; what is drawn inside is for the eye.
 */
export function TileFrame({ label, children }: Readonly<{ label: string; children: ReactNode }>) {
  return (
    <ScaledBox width={TILE.width} height={TILE.height} to={TILE.to} narrowTo={TILE.narrowTo}>
      <div
        role="img"
        aria-label={label}
        className="flex flex-col overflow-hidden rounded-[26px] bg-white p-4 shadow-[0_2px_4px_rgba(25,18,16,0.05),0_24px_48px_-24px_rgba(25,18,16,0.32)] ring-1 ring-black/[0.06]"
        style={{ width: TILE.width, height: TILE.height, color: INK.figure }}
      >
        <div aria-hidden className="flex min-h-0 flex-1 flex-col">
          {children}
        </div>
      </div>
    </ScaledBox>
  );
}

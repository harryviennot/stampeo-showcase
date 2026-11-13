import type { ReactNode } from "react";
import { ScaledBox } from "@/components/ui/ScaledBox";

/** A drawn mini is laid out at this size, then shrunk to a thumbnail beside a row's words and shown whole from `lg`. */
export const MINI = { width: 232, height: 244, narrowTo: 128, to: 240 } as const;

/**
 * A piece of a screen as one rounded surface: a row's picture. `label` is the picture's
 * accessible name; what is drawn inside is for the eye. The surface is a `background`
 * colour or a `className`, and `color` is the ink drawn on it.
 */
export function MiniFrame({
  label,
  children,
  className,
  background,
  color,
}: Readonly<{ label: string; children: ReactNode; className?: string; background?: string; color: string }>) {
  return (
    <ScaledBox width={MINI.width} height={MINI.height} to={MINI.to} narrowTo={MINI.narrowTo}>
      <div
        role="img"
        aria-label={label}
        className={`flex flex-col overflow-hidden rounded-[26px]${className ? ` ${className}` : ""} p-4 shadow-[0_2px_4px_rgba(25,18,16,0.05),0_24px_48px_-24px_rgba(25,18,16,0.32)] ring-1 ring-black/[0.06]`}
        style={{ width: MINI.width, height: MINI.height, ...(background ? { backgroundColor: background } : {}), color }}
      >
        <div aria-hidden className="flex min-h-0 flex-1 flex-col">
          {children}
        </div>
      </div>
    </ScaledBox>
  );
}

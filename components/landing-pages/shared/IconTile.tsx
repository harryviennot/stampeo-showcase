import type { ReactNode } from "react";

const TONES = {
  white: "bg-white text-[var(--accent-hover)] ring-1 ring-[var(--border)]",
  subtle: "bg-[var(--background-subtle)] text-[var(--accent-hover)]",
  accent: "bg-[var(--accent-light)] text-[var(--foreground)]",
} as const;

/** A 44px rounded tile that holds one icon. */
export function IconTile({ tone, children }: Readonly<{ tone: keyof typeof TONES; children: ReactNode }>) {
  return (
    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${TONES[tone]}`}>{children}</span>
  );
}

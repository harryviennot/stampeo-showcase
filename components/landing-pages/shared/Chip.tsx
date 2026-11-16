import type { ReactNode } from "react";

export function Chip({ className = "", children }: Readonly<{ className?: string; children: ReactNode }>) {
  return (
    <span
      className={`inline-block shrink-0 rounded-full bg-[var(--background-subtle)] px-3 py-1 align-middle text-xs font-semibold text-[var(--foreground)] ring-1 ring-inset ring-[var(--border)] ${className}`}
    >
      {children}
    </span>
  );
}

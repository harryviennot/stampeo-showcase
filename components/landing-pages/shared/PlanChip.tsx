import type { ReactNode } from "react";
import type { PlanChip as Plan } from "@/lib/landing-pages/copy/types";

/** A small neutral pill: the one chip every plan label and every "coming soon" label is drawn with. */
export function Chip({ className = "", children }: Readonly<{ className?: string; children: ReactNode }>) {
  return (
    <span
      className={`inline-block shrink-0 rounded-full bg-[var(--background-subtle)] px-3 py-1 align-middle text-xs font-semibold text-[var(--foreground)] ring-1 ring-inset ring-[var(--border)] ${className}`}
    >
      {children}
    </span>
  );
}

/** The plans a feature comes with, as a chip. */
export function PlanChip({ plan, className = "" }: Readonly<{ plan: Plan; className?: string }>) {
  return <Chip className={className}>{plan}</Chip>;
}

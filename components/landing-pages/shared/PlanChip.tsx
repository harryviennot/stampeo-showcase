import type { PlanChip as Plan } from "@/lib/landing-pages/copy/types";

/** The plans a feature comes with, as a small neutral pill. One chip draws every label. */
export function PlanChip({ plan, className = "" }: Readonly<{ plan: Plan; className?: string }>) {
  return (
    <span
      className={`inline-block shrink-0 rounded-full bg-[var(--background-subtle)] px-3 py-1 align-middle text-xs font-semibold text-[var(--foreground)] ring-1 ring-inset ring-[var(--border)] ${className}`}
    >
      {plan}
    </span>
  );
}

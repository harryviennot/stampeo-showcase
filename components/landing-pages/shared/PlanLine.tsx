import type { ReactNode } from "react";
import { SHARED } from "@/lib/landing-pages/copy/shared";

/**
 * A line about broadcasts with the plans they come with ("Growth and Pro") as a
 * pill in front of it, in the same paragraph, so the claim never prints without
 * its plans.
 */
export function PlanLine({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <p className="mt-6 max-w-xl text-pretty text-base text-[var(--foreground)]">
      <span className="mr-2 inline-block rounded-full bg-[var(--accent)]/10 px-3 py-1 align-middle text-xs font-bold text-[var(--accent)]">
        {SHARED.broadcastPlans}
      </span>
      {children}
    </p>
  );
}

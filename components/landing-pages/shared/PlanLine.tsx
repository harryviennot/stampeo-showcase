import type { ReactNode } from "react";
import { SHARED } from "@/lib/landing-pages/copy/shared";
import { PlanChip } from "./PlanChip";

/** A line about broadcasts with its plans ("Growth and Pro") as a pill in the same paragraph. */
export function PlanLine({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <p className="mt-6 max-w-xl text-pretty text-base text-[var(--foreground)]">
      <PlanChip plan={SHARED.broadcastPlans} className="mr-2" />
      {children}
    </p>
  );
}

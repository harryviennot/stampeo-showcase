import { OUTCOMES } from "@/lib/landing-pages/copy/outcomes";
import { PlanChip } from "../shared/PlanChip";

/**
 * The five customer groups the dashboard sorts everyone into, as flat labels (they are not buttons), with the plans
 * they come with on a line of their own, so the plan never reads as a sixth group.
 */
export function SegmentChips() {
  return (
    <div className="flex flex-col items-start gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {OUTCOMES.regulars.segments.map((segment) => (
          <span
            key={segment}
            data-segment
            className="inline-flex h-8 items-center rounded-full bg-white/70 px-3.5 text-sm font-medium text-[var(--foreground)] ring-1 ring-inset ring-[var(--border)]"
          >
            {segment}
          </span>
        ))}
      </div>
      <PlanChip plan="Every plan" />
    </div>
  );
}

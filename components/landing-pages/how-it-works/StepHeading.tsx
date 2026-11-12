import { NumberStamp } from "@/components/stamps/StampIcons";
import { LpHeading } from "../shared/LpSection";

/**
 * A step's heading: its number in a stamp beside "Step n", then the title and
 * the lead, on the left. The number matches the one on the steps map.
 */
export function StepHeading({
  number,
  label,
  title,
  lead,
}: Readonly<{
  number: number;
  label: string;
  title: string;
  lead: string;
}>) {
  return (
    <div>
      <p className="mb-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-hover)] sm:text-[13px]">
        <span aria-hidden className="flex">
          <NumberStamp number={number} size={36} color="var(--accent)" />
        </span>
        {label}
      </p>
      <LpHeading title={title} lead={lead} />
    </div>
  );
}

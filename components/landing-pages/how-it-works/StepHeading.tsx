import { NumberStamp } from "@/components/stamps/StampIcons";
import { EYEBROW_PILL, LpHeading } from "../shared/LpSection";

/**
 * A step's heading: its number in a stamp beside "Step n" as an orange pill, then the title and
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
      <p className="mb-4 flex items-center gap-3">
        <span aria-hidden className="flex">
          <NumberStamp number={number} size={36} color="var(--accent)" />
        </span>
        <span className={EYEBROW_PILL}>{label}</span>
      </p>
      <LpHeading title={title} lead={lead} />
    </div>
  );
}

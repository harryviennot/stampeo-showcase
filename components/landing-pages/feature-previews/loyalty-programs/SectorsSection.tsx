import { useLandingCopy } from "@/lib/landing-pages/copy/bundle";
import { CARD_SHADOW, CELL_TITLE } from "../../platform/classes";
import { LpSection } from "../../shared/LpSection";

const CARD = `rounded-[28px] bg-white p-6 ${CARD_SHADOW} ring-1 ring-black/5 lg:p-8`;
const PROGRAMS = ["stamps", "points"] as const;

/** Two white cards, one for stamps and one for points, each listing the kinds of business that most often choose it and why. */
export function SectorsSection() {
  const { eyebrow, title, lead, items, programLabels } = useLandingCopy().previews.loyaltyPrograms.LOYALTY_PROGRAMS_PREVIEW.sectors;

  return (
    <LpSection section="by_business" eyebrow={eyebrow} title={title} lead={lead} align="center">
      <div className="mx-auto grid max-w-[480px] gap-5 text-left sm:max-w-[1040px] sm:grid-cols-2 lg:gap-6">
        {PROGRAMS.map((program) => (
          <div key={program} className={CARD}>
            <h3 className={`${CELL_TITLE} text-[1.5rem] lg:text-[1.75rem]`}>{programLabels[program]}</h3>
            <ul className="mt-4 lg:mt-5">
              {items
                .filter((item) => item.program === program)
                .map((item) => (
                  <li key={item.label} className="border-t border-[var(--border)] py-3.5 first:border-t-0 lg:py-4">
                    <p className="text-base font-semibold text-[var(--foreground)] lg:text-[17px]">{item.label}</p>
                    <p className="mt-0.5 text-[15px] text-[var(--muted-foreground)]">{item.reason}</p>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </LpSection>
  );
}

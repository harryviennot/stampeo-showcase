import type { ReactNode } from "react";
import { StarIcon } from "@/components/icons";
import { CTAButton } from "@/components/ui/CTAButton";
import type { PickerSuggestion } from "@/lib/landing-pages/previews/loyalty-picker";
import { CELL_TITLE } from "../../platform/classes";
import { EYEBROW } from "../../shared/LpSection";
import type { PickerCopy } from "./PickerCard";

/** The suggestion: a sample card or two, our words, the levels line, and the trial button. */
export function PickerResult({
  copy,
  suggestion,
  cards,
  cta,
  onRestart,
}: Readonly<{
  copy: PickerCopy;
  suggestion: PickerSuggestion;
  cards: Readonly<{ stamps: ReactNode; points: ReactNode }>;
  cta: string;
  onRestart: () => void;
}>) {
  const { program, levels } = suggestion;
  const result = copy.results[program];

  return (
    <div className="flex flex-col items-center gap-6 text-center starting:opacity-0 transition-opacity duration-300 motion-reduce:transition-none">
      <div aria-hidden className="flex items-end justify-center gap-4">
        {program !== "points" && cards.stamps}
        {program !== "stamps" && cards.points}
      </div>

      <div>
        <p className={`${EYEBROW} text-[var(--muted-foreground)]`}>{copy.resultLabel}</p>
        <h3 tabIndex={-1} data-focus className={`${CELL_TITLE} mt-2 outline-none`}>
          {result.title}
        </h3>
        <p className="mx-auto mt-3 max-w-md text-base text-pretty text-[var(--muted-foreground)]">{result.body}</p>
      </div>

      <p className="flex max-w-md items-start gap-3 rounded-2xl bg-[var(--background-subtle)] px-4 py-3 text-left text-[15px] text-balance text-[var(--foreground)]">
        <StarIcon size={18} weight="fill" aria-hidden className="mt-0.5 shrink-0 text-[var(--accent-hover)]" />
        {levels ? copy.levels.yes : copy.levels.no}
      </p>

      <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-4">
        <CTAButton label={cta} trackAs="loyalty_picker" keycap className="mb-[3px] sm:mb-0" />
        <button
          type="button"
          onClick={onRestart}
          className="inline-flex min-h-11 items-center px-4 text-sm font-semibold text-[var(--muted-foreground)] underline underline-offset-4 hover:text-[var(--foreground)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
        >
          {copy.restart}
        </button>
      </div>
    </div>
  );
}

import { CheckIcon } from "@/components/icons";

export type PaneState = "past" | "active" | "future";

const PANE: Record<PaneState, string> = {
  past: "pointer-events-none opacity-0 motion-safe:-translate-x-6",
  active: "opacity-100",
  future: "pointer-events-none opacity-0 motion-safe:translate-x-6",
};

const OPTION =
  "flex min-h-14 w-full items-center justify-between gap-3 rounded-2xl px-5 py-3.5 text-left text-base font-medium text-[var(--foreground)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]";

/**
 * One question and its options. All the questions sit in one grid cell, so the card is as tall as the tallest and
 * nothing moves between them; the ones that are not shown are out of reach of Tab and of a reader.
 */
export function PickerQuestion({
  progress,
  question,
  options,
  state,
  selected,
  onChoose,
}: Readonly<{
  progress: string;
  question: string;
  options: readonly string[];
  state: PaneState;
  /** The option just chosen, still highlighted before the next question comes in. */
  selected: number | null;
  onChoose: (option: number) => void;
}>) {
  const active = state === "active";

  return (
    <div
      inert={!active}
      className={`col-start-1 row-start-1 transition-[opacity,transform] duration-300 motion-reduce:transition-none ${PANE[state]}`}
    >
      <p className="text-sm font-semibold text-[var(--muted-foreground)]">{progress}</p>
      <h3
        tabIndex={-1}
        data-focus={active ? "" : undefined}
        className="mt-2 text-[1.375rem] leading-tight font-bold tracking-[-0.015em] text-balance text-[var(--foreground)] outline-none sm:text-[1.625rem]"
      >
        {question}
      </h3>
      <div className="mt-6 flex flex-col gap-3">
        {options.map((label, option) => {
          const chosen = selected === option;

          return (
            <button
              key={label}
              type="button"
              onClick={() => onChoose(option)}
              className={`${OPTION} ${
                chosen
                  ? "bg-[var(--accent)]/10 ring-2 ring-[var(--accent)]"
                  : "bg-white ring-1 ring-[var(--border)] hover:bg-[var(--accent)]/5 hover:ring-[var(--accent)]/40"
              }`}
            >
              <span className="text-pretty">{label}</span>
              <span
                aria-hidden
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-white transition-opacity ${
                  chosen ? "opacity-100" : "opacity-0"
                }`}
              >
                <CheckIcon size={14} weight="bold" />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

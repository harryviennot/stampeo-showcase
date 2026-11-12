import type { CSSProperties } from "react";
import { OUTCOMES } from "@/lib/landing-pages/copy/outcomes";

export type HeadStartChoice = "empty" | "headStart";

const ROWS = [
  { key: "empty", figure: OUTCOMES.headStart.empty },
  { key: "headStart", figure: OUTCOMES.headStart.withHeadStart },
] as const;

/**
 * The two sourced figures as bars on a 0 to 100% track, the chosen one lit.
 * Each bar grows to its figure's own value when the section it sits in is
 * revealed (`.revealed` is set by `ScrollReveal`); readers who ask for less
 * motion get the finished bars.
 */
export function HeadStartBars({ selected }: Readonly<{ selected: HeadStartChoice }>) {
  const { toggle, barLabel } = OUTCOMES.headStart;

  return (
    <div className="flex flex-col gap-5">
      {ROWS.map(({ key, figure }) => {
        const active = key === selected;

        return (
          <div key={key} data-bar={key} data-active={active}>
            <div className="flex items-baseline justify-between gap-4">
              <p
                className={`text-[15px] font-semibold transition-colors duration-300 ${
                  active ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)]"
                }`}
              >
                {toggle[key]}
              </p>
              <p className="flex shrink-0 items-baseline gap-2">
                <span
                  className={`text-h2 tabular-nums transition-colors duration-300 ${
                    active ? "text-[var(--accent-hover)]" : "text-[var(--muted-foreground)]"
                  }`}
                >
                  {figure.value}
                </span>
                <span className="text-sm text-[var(--muted-foreground)]">{barLabel}</span>
              </p>
            </div>
            <div
              role="img"
              aria-label={figure.text}
              className="mt-2 h-4 overflow-hidden rounded-full bg-[var(--muted)]"
            >
              <div
                className={`h-full w-0 rounded-full transition-[width,background-color] duration-1000 ease-out in-[.revealed]:w-[var(--bar)] motion-reduce:w-[var(--bar)] motion-reduce:transition-none ${
                  active ? "bg-[var(--accent)]" : "bg-[var(--near-black)]/25"
                }`}
                style={{ "--bar": figure.value } as CSSProperties}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

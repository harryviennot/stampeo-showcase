"use client";

import { useId, useState } from "react";
import { PROMOTIONAL_CAMPAIGNS_PREVIEW as COPY } from "@/lib/landing-pages/copy/previews/promotional-campaigns";
import { STAMPED_STAGE } from "../../platform/classes";
import { LockScreenSlice } from "../push-notifications/LockScreenSlice";

/** The ideas as the page orders them: the two aimed at everyone first, then the two that nudge a few. */
const ORDER = ["happy-hour", "new", "we-miss-you", "close"] as const;

const IDEAS = ORDER.flatMap((key) => COPY.ideas.rows.filter((row) => row.key === key));

/**
 * A row of idea chips and, under it, the picked idea's message on Aurevo's lock screen with who it goes to. All four
 * stay in the page, stacked in one grid cell, so the stage never changes height and switching is a cross-fade.
 */
export function IdeasChips() {
  const id = useId();
  const [picked, setPicked] = useState<string>(IDEAS[0].key);

  return (
    <div className="mx-auto max-w-[680px]">
      <div
        role="tablist"
        aria-label={COPY.ideas.title}
        className="-mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto scroll-px-4 px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {IDEAS.map((idea) => {
          const active = idea.key === picked;

          return (
            <button
              key={idea.key}
              id={`${id}-${idea.key}-tab`}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls={`${id}-${idea.key}`}
              onClick={() => setPicked(idea.key)}
              className={`inline-flex h-11 shrink-0 snap-start items-center rounded-full border-[1.5px] bg-white px-4 text-[15px] font-semibold transition-colors duration-200 ${
                active ? "border-[var(--near-black)] text-[var(--foreground)]" : "border-[var(--border)] text-[var(--muted-foreground)]"
              }`}
            >
              {idea.chip}
            </button>
          );
        })}
      </div>

      <div className={`mx-auto mt-6 max-w-[520px] p-5 sm:p-6 ${STAMPED_STAGE}`}>
        <div className="grid">
          {IDEAS.map((idea) => {
            const active = idea.key === picked;

            return (
              <div
                key={idea.key}
                id={`${id}-${idea.key}`}
                role="tabpanel"
                aria-labelledby={`${id}-${idea.key}-tab`}
                inert={!active}
                className={`col-start-1 row-start-1 transition-opacity duration-200 motion-reduce:transition-none ${active ? "opacity-100" : "pointer-events-none opacity-0"}`}
              >
                <LockScreenSlice banner={idea.banner} />
                <p className="mt-4 text-center text-[15px] text-pretty text-[var(--muted-foreground)]">{idea.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

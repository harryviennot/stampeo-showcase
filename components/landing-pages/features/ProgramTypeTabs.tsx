"use client";

import { useState, type ReactNode } from "react";
import { Segmented } from "@/components/ui/Segmented";
import { PROGRAM_SWITCH_LINE, PROGRAM_TABS_LABEL, PROGRAM_TYPES } from "@/lib/landing-pages/copy/program-types";
import type { ProgramType } from "@/lib/landing-pages/copy/types";
import { FactList } from "../shared/FactList";
import { PlanChip } from "../shared/PlanChip";
import { LpTrialButton } from "../shared/LpTrialButton";

type Key = ProgramType["key"];

/** All panels share one grid cell; the others are invisible, so they take space but not a reader's attention. */
const panelClass = (open: boolean) => `col-start-1 row-start-1 ${open ? "" : "invisible"}`;

/**
 * Stamps, points and levels as tabs: the section heading, a large tab control,
 * the words of the chosen type and its card. A phone stacks them (tabs, card,
 * words); from `lg` the words sit under the tabs on the left and the card on
 * the right. Every type's words and card are in the server HTML, stacked in one
 * grid cell so the section keeps the tallest one's height; the chosen one shows.
 */
export function ProgramTypeTabs({
  heading,
  visuals,
}: Readonly<{ heading: ReactNode; visuals: Record<Key, ReactNode> }>) {
  const [active, setActive] = useState<Key>(PROGRAM_TYPES[0].key);

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-x-20 lg:gap-y-8">
      <div className="lg:col-start-1 lg:row-start-1 lg:self-end">
        {heading}
        <Segmented
          size="lg"
          ariaLabel={PROGRAM_TABS_LABEL}
          options={PROGRAM_TYPES.map((type) => ({ value: type.key, label: type.label }))}
          value={active}
          onChange={setActive}
          className="mt-8"
        />
      </div>

      <div className="grid justify-items-center lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:items-center">
        {PROGRAM_TYPES.map((type) => (
          <div key={type.key} data-panel={type.key} className={panelClass(type.key === active)}>
            {visuals[type.key]}
          </div>
        ))}
      </div>

      <div className="lg:col-start-1 lg:row-start-2 lg:self-start">
        <div className="grid">
          {PROGRAM_TYPES.map((type) => (
            <div key={type.key} data-panel={type.key} role="tabpanel" className={panelClass(type.key === active)}>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <h3 className="text-h3">{type.title}</h3>
                <PlanChip plan={type.plan} />
              </div>
              <p className="mt-3 max-w-xl text-pretty text-base text-[var(--muted-foreground)]">{type.body}</p>
              <FactList facts={type.facts} className="mt-5" />
            </div>
          ))}
        </div>
        <p className="mt-6 max-w-xl text-pretty text-sm text-[var(--muted-foreground)]">{PROGRAM_SWITCH_LINE}</p>
        <LpTrialButton className="mt-6" />
      </div>
    </div>
  );
}

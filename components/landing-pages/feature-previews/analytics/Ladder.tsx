"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { LockIcon } from "@/components/icons";
import { Segmented } from "@/components/ui/Segmented";
import { ANALYTICS_PREVIEW } from "@/lib/landing-pages/copy/previews/analytics";
import { TIERS } from "@/lib/plans/plan-facts";
import type { TierId } from "@/lib/pricing";
import { STAMPED_STAGE } from "../../platform/classes";
import { CohortsMini, LocationMini } from "./CohortsMini";
import { ladderView } from "./ladder-view";
import { BusiestMini, HabitsMini, RewardProgressMini } from "./QuestionMinis";
import { STARTER_SENTENCES } from "./sample";

/** The width a chart is drawn at under its title on a phone, zoomed up from the thumbnail so its smallest label prints 11px. */
const STACK_WIDTH = 288;
const THUMB_WIDTH = 128;

const CHARTS: Record<"busiest" | "habits" | "rewards", ReactNode> = {
  busiest: <BusiestMini />,
  habits: <HabitsMini />,
  rewards: <RewardProgressMini />,
};

/** A part of a row that is there or not: it fades and folds to nothing, and while it is folded nobody can reach it. */
function Fold({
  active,
  layer,
  extras = false,
  children,
}: Readonly<{ active: boolean; layer?: "sentence" | "chart"; extras?: boolean; children: ReactNode }>) {
  return (
    <div
      data-layer={layer}
      data-extras={extras ? "" : undefined}
      data-active={active}
      inert={!active}
      aria-hidden={!active}
      className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none ${
        active ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      }`}
    >
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  );
}

/**
 * One question of the dashboard. A heading for a screen reader is always there; the visible title belongs to
 * Starter's sentence, because a chart is drawn with its own title. The question sits straight on the stage.
 */
function Tray({ title, className = "", children }: Readonly<{ title: string; className?: string; children: ReactNode }>) {
  return (
    <div className={className}>
      <h3 className="sr-only">{title}</h3>
      {children}
    </div>
  );
}

/** A chart: thumbnail-sized on a phone and zoomed up under the sentence's place, drawn whole from `lg`. The room for its shadow is outside the zoom. */
function Chart({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="pb-7 lg:pb-6">
      <div className="flex justify-center max-lg:[zoom:var(--stack-zoom)]" style={{ "--stack-zoom": STACK_WIDTH / THUMB_WIDTH } as CSSProperties}>
        {children}
      </div>
    </div>
  );
}

/**
 * The plan ladder: a control over Starter, Growth and Pro, the history each keeps in handwriting, and the same
 * three questions answered as that plan answers them: a sentence and a lock on Starter, a chart on Growth and Pro.
 * Pro adds two more under them. Every part is on the page already, so a tap only fades and folds.
 */
export function Ladder() {
  const { toggleLabel, historyLabel, plans, rows, proRows, locked } = ANALYTICS_PREVIEW.ladder;
  const [tier, setTier] = useState<TierId>("starter");
  const view = ladderView(tier);
  const plan = plans[TIERS.indexOf(tier)];

  return (
    <div className={`mx-auto max-w-[1160px] p-5 sm:p-8 lg:p-10 ${STAMPED_STAGE}`}>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <Segmented
          size="lg"
          ariaLabel={toggleLabel}
          className="max-w-[420px] lg:w-[420px]"
          options={TIERS.map((id, at) => ({ value: id, label: plans[at].label }))}
          value={tier}
          onChange={setTier}
        />
        <p data-history className="flex items-baseline gap-2.5" aria-live="polite">
          <span className="ink-figure">{plan.history.value}</span>
          <span className="ink-note">
            {plan.history.unit} {historyLabel}
          </span>
        </p>
      </div>

      <div role="tabpanel" aria-label={plan.label} className="mt-6 flex flex-col lg:mt-8">
        <ul className="grid lg:grid-cols-3 lg:gap-8">
          {rows.map((row) => {
            const sentence = STARTER_SENTENCES[row.key];

            return (
              <li key={row.key} data-row={row.key} className="border-t border-[var(--border)] py-5 first:border-t-0 first:pt-0 last:pb-0 lg:border-0 lg:p-0">
                <Tray title={row.title} className="h-full">
                  <Fold active={view.layer === "sentence"} layer="sentence">
                    <p aria-hidden className="text-[17px] leading-snug font-semibold text-[var(--foreground)]">
                      {row.title}
                    </p>
                    <p className="mt-3 text-[15px] leading-[1.45] text-[var(--muted-foreground)]">
                      {sentence.before}
                      <b className="font-semibold text-[var(--foreground)]">{sentence.bold}</b>
                      {sentence.after}
                    </p>
                    <p className="mt-4 flex items-center gap-2 border-t border-[var(--border)] pt-3 pb-1 text-[13px] leading-snug text-[var(--muted-foreground)]">
                      <LockIcon size={16} weight="bold" aria-hidden className="shrink-0" />
                      {locked}
                    </p>
                  </Fold>
                  <Fold active={view.layer === "chart"} layer="chart">
                    <Chart>{CHARTS[row.key]}</Chart>
                  </Fold>
                </Tray>
              </li>
            );
          })}
        </ul>

        <Fold active={view.cohorts || view.location} extras>
          <div className="grid lg:grid-cols-6 lg:gap-8 lg:pt-4">
            <Tray title={proRows[0].title} className="mt-5 border-t border-[var(--border)] pt-5 lg:col-span-2 lg:col-start-2 lg:mt-0 lg:border-t-0">
              <Chart>
                <CohortsMini />
              </Chart>
            </Tray>
            <Tray title={proRows[1].title} className="mt-5 border-t border-[var(--border)] pt-5 lg:col-span-2 lg:mt-0 lg:border-t-0">
              <Chart>
                <LocationMini />
              </Chart>
            </Tray>
          </div>
        </Fold>
      </div>
    </div>
  );
}

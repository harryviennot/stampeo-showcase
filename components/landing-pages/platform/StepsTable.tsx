import type { ReactNode } from "react";
import type { Tile } from "@/lib/landing-pages/copy/types";
import { PlanChip } from "../shared/PlanChip";
import { CELL_TITLE, STAMPED_CARD } from "./classes";

/** A cell of the table: a titled line, with an icon above it or a plan chip under it where it needs one. */
export type StepCell = Tile & { icon?: ReactNode };

/** Both phones of a steps table are drawn at 280px and shrunk to 160px on a phone. */
export const STEPS_PHONE = { full: 280, narrow: 160 } as const;

/** The table's columns from `lg`, written out so Tailwind sees them: two cells split it in half, three in thirds. */
const COLUMNS: Record<number, string> = {
  2: "lg:grid-cols-2 lg:divide-x lg:divide-y-0",
  3: "lg:grid-cols-3 lg:divide-x lg:divide-y-0",
};

/**
 * A table of steps in the house ink frame, the body of a section. With a `visual` (phones, shown
 * as they are, side by side) their lower parts sink behind the table: low enough
 * that the top of each phone shows above it, with room above for their shadows.
 * Without one it is a plain table. On a phone the table is a stack of rows. A
 * `link` goes centred under it.
 */
export function StepsTable({
  cells,
  visual,
  link,
}: Readonly<{ cells: readonly StepCell[]; visual?: ReactNode; link?: ReactNode }>) {
  return (
    <div className="mx-auto max-w-[560px] lg:max-w-[1040px]">
      {visual && (
        <div className="-mt-6 flex max-h-[286px] justify-center gap-4 overflow-hidden pt-6 lg:max-h-[464px] lg:gap-10">
          {visual}
        </div>
      )}

      {cells.length > 0 && (
        <ol
          className={`relative ${visual ? "-mt-10 " : ""}grid divide-y divide-[var(--border)] overflow-hidden ${STAMPED_CARD}${
            visual ? " lg:-mt-24" : ""
          } ${COLUMNS[cells.length] ?? ""}`}
        >
          {cells.map((cell) => (
            <li key={cell.title} className="p-5 lg:p-8">
              {cell.icon}
              <h3 className={`${CELL_TITLE}${cell.icon ? " mt-4" : ""}`}>{cell.title}</h3>
              <p className="mt-3 text-base text-pretty text-[var(--muted-foreground)]">{cell.body}</p>
              {cell.plan && <PlanChip plan={cell.plan} className="mt-3" />}
            </li>
          ))}
        </ol>
      )}

      {link && <div className="mt-8 flex justify-center">{link}</div>}
    </div>
  );
}

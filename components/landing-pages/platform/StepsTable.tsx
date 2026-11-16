import type { ReactNode } from "react";
import type { Tile } from "@/lib/landing-pages/copy/types";
import { CELL_TITLE } from "./classes";

/** A cell of the table: a titled line, with an icon above it where it needs one. */
export type StepCell = Tile & { icon?: ReactNode };

/** Both phones of a steps table are drawn at 280px and shrunk to 160px on a phone. */
export const STEPS_PHONE = { full: 280, narrow: 160 } as const;

/** The table's columns from `lg`, written out so Tailwind sees them: two cells split it in half, three in thirds. */
const COLUMNS: Record<number, string> = {
  2: "lg:grid-cols-2 lg:divide-x lg:divide-y-0",
  3: "lg:grid-cols-3 lg:divide-x lg:divide-y-0",
};

/**
 * A bordered table of steps, the body of a section. With a `visual` (phones, shown
 * as they are, side by side) their lower parts sink behind the table: low enough
 * that the top of each phone shows above it, with room above for their shadows.
 * Below `lg` the phones' row spans the screen, so the page margins never cut them.
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
        <div className="relative left-1/2 -mt-6 flex max-h-[286px] w-screen -translate-x-1/2 justify-center gap-4 overflow-hidden pt-6 lg:static lg:max-h-[464px] lg:w-auto lg:translate-x-0 lg:gap-10">
          {visual}
        </div>
      )}

      {cells.length > 0 && (
        <ol
          className={`relative ${visual ? "-mt-10 " : ""}grid divide-y divide-[var(--border)] overflow-hidden rounded-2xl border border-[var(--border)] bg-white/80 backdrop-blur-xl${
            visual ? " lg:-mt-24" : ""
          } ${COLUMNS[cells.length] ?? ""}`}
        >
          {cells.map((cell) => (
            <li key={cell.title} className="p-5 lg:p-8">
              {cell.icon}
              <h3 className={`${CELL_TITLE}${cell.icon ? " mt-4" : ""}`}>{cell.title}</h3>
              <p className="mt-3 text-base text-pretty text-[var(--muted-foreground)]">{cell.body}</p>
            </li>
          ))}
        </ol>
      )}

      {link && <div className="mt-8 flex justify-center">{link}</div>}
    </div>
  );
}

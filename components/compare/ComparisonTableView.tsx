"use client";

import { useId, useMemo, useState } from "react";
import { ChevronDownIcon } from "@/components/icons";
import { allOpen, toggleAll, toggleRow, type OpenRows } from "@/lib/compare/page/open-rows";
import { openableRows, type TableGroup } from "@/lib/compare/page/rows";
import { ComparisonGrid } from "./ComparisonGrid";
import { ComparisonRows } from "./ComparisonRows";
import type { Names, TableLabels } from "./TableParts";

/** The comparison table with the state of its open rows: the button above it, the phone list and the table share one set of rows. */
export function ComparisonTableView({ groups, names, labels }: { groups: TableGroup[]; names: Names; labels: TableLabels }) {
  const ids = useMemo(() => openableRows(groups), [groups]);
  const [open, setOpen] = useState<OpenRows>(() => new Set());
  const idBase = useId();
  const everyRowOpen = allOpen(open, ids);

  return (
    <div className="not-prose mt-4 mb-2">
      {ids.length > 0 && (
        <div className="mb-2 flex justify-end">
          <button
            type="button"
            onClick={() => setOpen((current) => toggleAll(current, ids))}
            className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-[var(--accent)] underline-offset-4 hover:underline"
          >
            {everyRowOpen ? labels.hideAll : labels.showAll}
            <ChevronDownIcon aria-hidden="true" weight="bold" className={`h-4 w-4 transition-transform duration-200 ${everyRowOpen ? "rotate-180" : ""}`} />
          </button>
        </div>
      )}
      <ComparisonRows
        groups={groups}
        names={names}
        labels={labels}
        open={open}
        onSet={(id, isOpen) => setOpen((current) => (current.has(id) === isOpen ? current : toggleRow(current, id)))}
      />
      <ComparisonGrid
        groups={groups}
        names={names}
        labels={labels}
        open={open}
        onToggle={(id) => setOpen((current) => toggleRow(current, id))}
        idBase={idBase}
      />
    </div>
  );
}

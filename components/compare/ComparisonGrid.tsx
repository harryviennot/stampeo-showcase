import { Fragment } from "react";
import { ChevronDownIcon } from "@/components/icons";
import { hasDetail, type Side, type TableGroup } from "@/lib/compare/page/rows";
import type { OpenRows } from "@/lib/compare/page/open-rows";
import { GroupChip, SideDetail, type Names, type TableLabels } from "./TableParts";

const STAMPEO_TINT = "bg-[var(--accent)]/5";

interface GridProps {
  groups: TableGroup[];
  names: Names;
  labels: TableLabels;
  open: OpenRows;
  onToggle: (id: string) => void;
  /** Prefix of the ids that tie a row's toggle to the row it opens. */
  idBase: string;
}

/** The comparison from the tablet up: a real table of labels and short answers, each row opening on its full sentences and sources. */
export function ComparisonGrid({ groups, names, labels, open, onToggle, idBase }: GridProps) {
  return (
    <div className="hidden overflow-hidden rounded-3xl border border-[var(--border)] bg-white shadow-sm md:block">
      <table role="table" className="w-full table-fixed border-collapse text-left">
        <caption className="sr-only">{labels.caption}</caption>
        <colgroup>
          <col className="w-[24%]" />
          <col className="w-[38%]" />
          <col className="w-[38%]" />
        </colgroup>
        <thead role="rowgroup">
          <tr role="row">
            <th scope="col" role="columnheader" className="p-5">
              <span className="sr-only">{labels.criterion}</span>
            </th>
            <th scope="col" role="columnheader" className="p-5 text-sm font-bold text-[var(--near-black)]">
              {names.competitor}
            </th>
            <th scope="col" role="columnheader" className={`p-5 text-sm font-bold text-[var(--accent)] ${STAMPEO_TINT}`}>
              {names.stampeo}
            </th>
          </tr>
        </thead>
        {groups.map((group) => (
          <tbody key={group.id} role="rowgroup">
            <tr role="row">
              <th scope="rowgroup" role="rowheader" colSpan={3} className="border-t border-[var(--border)] bg-[var(--cream)]/70 px-5 py-3 text-left">
                <span className="flex items-center gap-3">
                  <GroupChip group={group.id} />
                  <span className="text-h3 text-[var(--near-black)]">{group.label}</span>
                </span>
              </th>
            </tr>
            {group.rows.map((row) => {
              const isOpen = open.has(row.id);
              const detailId = `${idBase}-${row.id}`;

              return (
                <Fragment key={row.id}>
                  <tr role="row">
                    <th scope="row" role="rowheader" className="border-t border-[var(--border)]/60 p-0 text-left align-top">
                      {hasDetail(row) ? (
                        <button
                          type="button"
                          aria-expanded={isOpen}
                          aria-controls={detailId}
                          onClick={() => onToggle(row.id)}
                          className={`flex min-h-11 w-full items-start justify-between gap-2 px-5 pt-4 text-left text-sm font-medium text-[var(--near-black)] hover:text-[var(--accent)] ${isOpen ? "pb-2" : "pb-4"}`}
                        >
                          {row.label}
                          <ChevronDownIcon
                            aria-hidden="true"
                            weight="bold"
                            className={`mt-0.5 h-4 w-4 shrink-0 text-[var(--muted-foreground)] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                          />
                        </button>
                      ) : (
                        <span className="block px-5 py-4 text-sm font-medium text-[var(--near-black)]">{row.label}</span>
                      )}
                    </th>
                    <ShortCell side={row.competitor} compact={isOpen} />
                    <ShortCell side={row.stampeo} tint={STAMPEO_TINT} compact={isOpen} />
                  </tr>
                  {hasDetail(row) && (
                    <tr role="row" id={detailId} hidden={!isOpen}>
                      <td role="cell" aria-hidden="true" />
                      <td role="cell" className="min-w-0 px-5 pb-5 align-top text-sm leading-relaxed break-words text-[var(--muted-foreground)]">
                        <SideDetail side={row.competitor} sourceLabel={labels.source} />
                      </td>
                      <td role="cell" className={`min-w-0 px-5 pb-5 align-top text-sm leading-relaxed break-words text-[var(--muted-foreground)] ${STAMPEO_TINT}`}>
                        <SideDetail side={row.stampeo} sourceLabel={labels.source} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        ))}
      </table>
    </div>
  );
}

/** A product's short answer, with the tax line under it when the row has one. */
function ShortCell({ side, tint = "", compact }: { side: Side; tint?: string; compact: boolean }) {
  return (
    <td role="cell" className={`min-w-0 border-t border-[var(--border)]/60 px-5 align-top break-words ${compact ? "pt-4 pb-2" : "py-4"} ${tint}`}>
      <span className="block text-base leading-snug font-semibold text-[var(--near-black)]">{side.short}</span>
      {side.taxLine && <span className="mt-1 block text-sm text-[var(--muted-foreground)]">{side.taxLine}</span>}
    </td>
  );
}

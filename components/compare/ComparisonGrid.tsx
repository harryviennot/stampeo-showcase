import { Fragment } from "react";
import { ChevronDownIcon } from "@/components/icons";
import { hasDetail, type TableGroup } from "@/lib/compare/page/rows";
import type { OpenRows } from "@/lib/compare/page/open-rows";
import { rowTint, ShortValue, SideDetail, STAMPEO_TINT, type Names, type TableLabels } from "./TableParts";

interface GridProps {
  groups: TableGroup[];
  names: Names;
  labels: TableLabels;
  open: OpenRows;
  onToggle: (id: string) => void;
  /** Prefix of the ids that tie a row's toggle to the row it opens. */
  idBase: string;
}

/** Where each theme's first row falls in the table, so the stripes run on across themes. */
const firstRows = (groups: TableGroup[]) => groups.map((_, index) => groups.slice(0, index).reduce((count, group) => count + group.rows.length, 0));

/**
 * The comparison from the tablet up, drawn like the pricing page's feature
 * table: one card, a bold row per theme, striped rows with Stampeo's column
 * tinted. Each row opens on its full sentences and sources, in the same columns.
 */
export function ComparisonGrid({ groups, names, labels, open, onToggle, idBase }: GridProps) {
  const starts = firstRows(groups);

  return (
    <div className="card-stamp hidden overflow-hidden rounded-3xl bg-white md:block">
      <table role="table" className="w-full table-fixed border-collapse text-left">
        <caption className="sr-only">{labels.caption}</caption>
        <colgroup>
          <col className="w-[34%]" />
          <col className="w-[33%]" />
          <col className="w-[33%]" />
        </colgroup>
        <thead role="rowgroup">
          <tr role="row" className="border-b border-[var(--border)]">
            <th scope="col" role="columnheader" className="p-6">
              <span className="sr-only">{labels.criterion}</span>
            </th>
            <th scope="col" role="columnheader" className="p-6 text-left text-sm font-bold text-[var(--near-black)]">
              {names.competitor}
            </th>
            <th scope="col" role="columnheader" className={`p-6 text-left text-sm font-bold text-[var(--accent)] ${STAMPEO_TINT}`}>
              {names.stampeo}
            </th>
          </tr>
        </thead>
        {groups.map((group, groupIndex) => (
          <tbody key={group.id} role="rowgroup">
            <tr role="row" className="border-t border-[var(--border)]/50">
              <th scope="rowgroup" role="rowheader" colSpan={3} className="px-6 py-4 text-left text-sm font-bold text-[var(--foreground)]">
                {group.label}
              </th>
            </tr>
            {group.rows.map((row, rowIndex) => {
              const isOpen = open.has(row.id);
              const detailId = `${idBase}-${row.id}`;
              const tint = rowTint(starts[groupIndex] + rowIndex);

              return (
                <Fragment key={row.id}>
                  <tr role="row" className={`border-t border-[var(--border)]/50 ${tint}`}>
                    <th scope="row" role="rowheader" className="p-0 text-left text-[13px] font-medium text-[var(--muted-foreground)]">
                      {hasDetail(row) ? (
                        <button
                          type="button"
                          aria-expanded={isOpen}
                          aria-controls={detailId}
                          onClick={() => onToggle(row.id)}
                          className="flex min-h-11 w-full items-center justify-between gap-3 px-6 py-2.5 text-left transition-colors hover:text-[var(--near-black)]"
                        >
                          {row.label}
                          <ChevronDownIcon
                            aria-hidden="true"
                            weight="bold"
                            className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180 text-[var(--accent)]" : ""}`}
                          />
                        </button>
                      ) : (
                        <span className="block px-6 py-2.5">{row.label}</span>
                      )}
                    </th>
                    <td role="cell" className="px-6 py-2.5">
                      <ShortValue side={row.competitor} />
                    </td>
                    <td role="cell" className={`px-6 py-2.5 ${STAMPEO_TINT}`}>
                      <ShortValue side={row.stampeo} />
                    </td>
                  </tr>
                  {hasDetail(row) && (
                    <tr role="row" id={detailId} hidden={!isOpen} className={tint}>
                      <td role="cell" aria-hidden="true" />
                      <td role="cell" className="px-6 pb-1 align-top text-[13px] leading-relaxed break-words text-[var(--muted-foreground)]">
                        <SideDetail side={row.competitor} sourceLabel={labels.source} />
                      </td>
                      <td role="cell" className={`px-6 pb-1 align-top text-[13px] leading-relaxed break-words text-[var(--muted-foreground)] ${STAMPEO_TINT}`}>
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

import { ChevronDownIcon } from "@/components/icons";
import { hasDetail, type TableGroup } from "@/lib/compare/page/rows";
import type { OpenRows } from "@/lib/compare/page/open-rows";
import { rowTint, ShortValue, SideDetail, type Names, type TableLabels } from "./TableParts";

interface RowsProps {
  groups: TableGroup[];
  names: Names;
  labels: TableLabels;
  open: OpenRows;
  /** Called when the browser opens or closes a row on its own, so the state follows it. */
  onSet: (id: string, open: boolean) => void;
}

/**
 * The comparison on a phone, drawn like the pricing page's phone table: one
 * card, a bold title per theme with the two products named under it, and
 * striped rows that open on their full sentences and sources.
 */
export function ComparisonRows({ groups, names, labels, open, onSet }: RowsProps) {
  return (
    <div className="card-stamp overflow-hidden rounded-2xl bg-white md:hidden">
      {groups.map((group) => (
        <section key={group.id} className="border-t border-[var(--border)]/50 first:border-t-0">
          <h3 className="px-5 pt-4 text-sm font-bold text-[var(--foreground)]">{group.label}</h3>
          <div aria-hidden="true" className="grid grid-cols-2 gap-4 px-5 pt-1.5 pb-3 text-xs font-bold">
            <span className="text-[var(--near-black)]">{names.competitor}</span>
            <span className="text-[var(--accent)]">{names.stampeo}</span>
          </div>
          {group.rows.map((row, index) => {
            const summary = (
              <>
                <span className="flex items-start justify-between gap-3 text-[13px] font-medium text-[var(--muted-foreground)]">
                  {row.label}
                  {hasDetail(row) && (
                    <ChevronDownIcon
                      aria-hidden="true"
                      weight="bold"
                      className="mt-px h-4 w-4 shrink-0 transition-transform duration-200 group-open:rotate-180 group-open:text-[var(--accent)]"
                    />
                  )}
                </span>
                <span className="mt-1 grid grid-cols-2 gap-4">
                  <span className="min-w-0">
                    <ShortValue side={row.competitor} />
                  </span>
                  <span className="min-w-0">
                    <ShortValue side={row.stampeo} />
                  </span>
                </span>
              </>
            );
            const rowClass = `border-t border-[var(--border)]/50 ${rowTint(index)}`;

            if (!hasDetail(row)) {
              return (
                <div key={row.id} className={`${rowClass} px-5 py-2.5`}>
                  {summary}
                </div>
              );
            }
            return (
              <details
                key={row.id}
                open={open.has(row.id)}
                onToggle={(event) => onSet(row.id, event.currentTarget.open)}
                className={`group ${rowClass}`}
              >
                <summary className="block min-h-11 cursor-pointer list-none px-5 py-2.5 [&::-webkit-details-marker]:hidden">{summary}</summary>
                <div className="grid grid-cols-2 gap-4 px-5 pb-1 text-[13px] leading-relaxed text-[var(--muted-foreground)]">
                  <div className="min-w-0 break-words">
                    <SideDetail side={row.competitor} sourceLabel={labels.source} />
                  </div>
                  <div className="min-w-0 break-words">
                    <SideDetail side={row.stampeo} sourceLabel={labels.source} />
                  </div>
                </div>
              </details>
            );
          })}
        </section>
      ))}
    </div>
  );
}

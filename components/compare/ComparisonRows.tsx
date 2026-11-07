import { ChevronDownIcon } from "@/components/icons";
import { hasDetail, type Side, type TableGroup } from "@/lib/compare/page/rows";
import type { OpenRows } from "@/lib/compare/page/open-rows";
import { GroupChip, SideDetail, type Names, type TableLabels } from "./TableParts";

interface RowsProps {
  groups: TableGroup[];
  names: Names;
  labels: TableLabels;
  open: OpenRows;
  /** Called when the browser opens or closes a row on its own, so the state follows it. */
  onSet: (id: string, open: boolean) => void;
}

/** The comparison on a phone: one card per theme, one tap-to-open row per fact. */
export function ComparisonRows({ groups, names, labels, open, onSet }: RowsProps) {
  return (
    <div className="space-y-4 md:hidden">
      {groups.map((group) => (
        <section key={group.id} className="rounded-2xl border border-[var(--border)] bg-white">
          <header className="flex items-center gap-3 p-4 pb-3">
            <GroupChip group={group.id} />
            <h3 className="text-h3 text-[var(--near-black)]">{group.label}</h3>
          </header>
          <div aria-hidden="true" className="grid grid-cols-2 gap-3 px-4 pb-2 text-xs font-semibold">
            <span className="text-[var(--muted-foreground)]">{names.competitor}</span>
            <span className="text-[var(--accent)]">{names.stampeo}</span>
          </div>
          {group.rows.map((row) => {
            const summary = (
              <>
                <span className="flex items-center justify-between gap-2 text-sm font-medium text-[var(--near-black)]">
                  {row.label}
                  {hasDetail(row) && (
                    <ChevronDownIcon
                      aria-hidden="true"
                      weight="bold"
                      className="h-4 w-4 shrink-0 text-[var(--muted-foreground)] transition-transform duration-200 group-open:rotate-180"
                    />
                  )}
                </span>
                <span className="mt-1.5 grid grid-cols-2 gap-3">
                  <ShortAnswer side={row.competitor} tint="bg-[var(--muted)]/30" />
                  <ShortAnswer side={row.stampeo} tint="bg-[var(--accent)]/5" />
                </span>
              </>
            );

            if (!hasDetail(row)) {
              return (
                <div key={row.id} className="border-t border-[var(--border)]/60 px-4 py-2.5">
                  {summary}
                </div>
              );
            }
            return (
              <details
                key={row.id}
                open={open.has(row.id)}
                onToggle={(event) => onSet(row.id, event.currentTarget.open)}
                className="group border-t border-[var(--border)]/60"
              >
                <summary className="block min-h-11 cursor-pointer list-none px-4 py-2.5 [&::-webkit-details-marker]:hidden">{summary}</summary>
                <div className="grid grid-cols-2 gap-3 px-4 pb-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
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

/** A product's short answer, with the tax line under it when the row has one. */
function ShortAnswer({ side, tint }: { side: Side; tint: string }) {
  return (
    <span className={`block min-w-0 rounded-xl px-3 py-2 ${tint}`}>
      <span className="block text-[15px] leading-snug font-semibold break-words text-[var(--near-black)]">{side.short}</span>
      {side.taxLine && <span className="mt-1 block text-xs leading-snug font-normal break-words text-[var(--muted-foreground)]">{side.taxLine}</span>}
    </span>
  );
}

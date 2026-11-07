import { ChevronDownIcon } from "@/components/icons";
import type { PageCopy } from "@/lib/compare/page/copy";
import type { Side, TableGroup } from "@/lib/compare/page/rows";
import type { Market } from "@/lib/compare/types";
import { GroupChip, SideDetail } from "./TableParts";

interface Names {
  competitor: string;
  stampeo: string;
}

/** The comparison on a phone: one card per theme, one tap-to-open row per fact. */
export function ComparisonRows({ groups, names, copy, market }: { groups: TableGroup[]; names: Names; copy: PageCopy; market: Market }) {
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
          {group.rows.map((row) => (
            <details key={row.id} className="group border-t border-[var(--border)]/60">
              <summary className="block min-h-11 cursor-pointer list-none px-4 py-3 [&::-webkit-details-marker]:hidden">
                <span className="flex items-center justify-between gap-2 text-sm font-medium text-[var(--muted-foreground)]">
                  {row.label}
                  <ChevronDownIcon
                    aria-hidden="true"
                    weight="bold"
                    className="h-4 w-4 shrink-0 transition-transform duration-200 group-open:rotate-180"
                  />
                </span>
                <span className="mt-2 grid grid-cols-2 gap-3">
                  <ShortAnswer side={row.competitor} tint="bg-[var(--muted)]/30" />
                  <ShortAnswer side={row.stampeo} tint="bg-[var(--accent)]/5" />
                </span>
              </summary>
              <div className="grid grid-cols-2 gap-3 px-4 pb-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
                <div className="min-w-0 break-words">
                  <SideDetail side={row.competitor} market={market} />
                </div>
                <div className="min-w-0 break-words">
                  <SideDetail side={row.stampeo} market={market} />
                </div>
              </div>
            </details>
          ))}
        </section>
      ))}
      <span className="sr-only">{copy.tableCaption(names.competitor)}</span>
    </div>
  );
}

/** A product's short answer in bold, with the tax line under it when the row has one. */
function ShortAnswer({ side, tint }: { side: Side; tint: string }) {
  return (
    <span className={`block min-w-0 rounded-xl px-3 py-2.5 ${tint}`}>
      <span className="block text-[15px] leading-snug font-semibold break-words text-[var(--near-black)]">{side.short}</span>
      {side.taxLine && <span className="mt-1 block text-xs leading-snug font-normal break-words text-[var(--muted-foreground)]">{side.taxLine}</span>}
    </span>
  );
}

import type { Side, TableGroup } from "@/lib/compare/page/rows";
import { rowTint, ShortValue, type Names } from "./TableParts";

/**
 * The comparison on a phone, drawn like the pricing page's phone table: one
 * card, a bold title per theme with the two products named under it, and
 * striped rows of a label above the two short answers.
 */
export function ComparisonRows({ groups, names }: { groups: TableGroup[]; names: Names }) {
  return (
    <div className="card-stamp overflow-hidden rounded-2xl bg-white md:hidden">
      {groups.map((group) => (
        <section key={group.id} className="border-t border-[var(--border)]/50 first:border-t-0">
          <h3 className="px-5 pt-4 text-sm font-bold text-[var(--foreground)]">{group.label}</h3>
          <div aria-hidden="true" className="grid grid-cols-2 gap-4 px-5 pt-1.5 pb-3 text-xs font-bold">
            <span className="text-[var(--near-black)]">{names.competitor}</span>
            <span className="text-[var(--accent)]">{names.stampeo}</span>
          </div>
          <dl>
            {group.rows.map((row, index) => (
              <div key={row.id} className={`grid grid-cols-2 gap-x-4 border-t border-[var(--border)]/50 px-5 py-2.5 ${rowTint(index)}`}>
                <dt className="col-span-2 text-[13px] font-medium text-[var(--muted-foreground)]">{row.label}</dt>
                <Answer name={names.competitor} side={row.competitor} />
                <Answer name={names.stampeo} side={row.stampeo} />
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}

/** One product's short answer; the names line above the rows is hidden from screen readers, so the answer carries its product's name. */
function Answer({ name, side }: { name: string; side: Side }) {
  return (
    <dd className="mt-1 min-w-0">
      <span className="sr-only">{`${name}: `}</span>
      <ShortValue side={side} />
    </dd>
  );
}

import type { Side, TableGroup } from "@/lib/compare/page/rows";
import { rowTint, ShortValue, STAMPEO_TINT, type Names } from "./TableParts";

/**
 * The comparison below laptop width: the table's own card with its label
 * column folded above each row. The two products are named once, in a header
 * that stays under the site header while the rows scroll by, and Stampeo's
 * half is tinted from top to bottom as its column is on the table.
 */
export function ComparisonRows({ groups, names }: { groups: TableGroup[]; names: Names }) {
  return (
    <div className="card-stamp relative isolate overflow-clip rounded-2xl bg-white lg:hidden">
      <div aria-hidden="true" className={`absolute inset-y-0 right-0 -z-10 w-1/2 ${STAMPEO_TINT}`} />
      <div aria-hidden="true" className="sticky top-16 z-10 grid grid-cols-2 border-b border-[var(--border)] bg-white text-sm font-bold">
        <span className="px-5 py-4 text-[var(--near-black)]">{names.competitor}</span>
        <span className={`px-5 py-4 text-[var(--accent)] ${STAMPEO_TINT}`}>{names.stampeo}</span>
      </div>
      {groups.map((group, groupIndex) => (
        <section key={group.id} className="border-t border-[var(--border)]/50 first-of-type:border-t-0">
          <h3 className="px-5 pt-5 pb-2.5 text-sm font-bold text-[var(--foreground)]">{group.label}</h3>
          <dl>
            {group.rows.map((row, index) => (
              <div key={row.id} className={`grid grid-cols-2 border-t border-[var(--border)]/50 py-3 ${rowTint(firstRow(groups, groupIndex) + index)}`}>
                <dt className="col-span-2 px-5 text-[13px] font-medium text-[var(--muted-foreground)]">{row.label}</dt>
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

/** How many rows come before a theme, so the stripes run on across themes as they do on the table. */
const firstRow = (groups: TableGroup[], groupIndex: number) => groups.slice(0, groupIndex).reduce((count, group) => count + group.rows.length, 0);

/** One product's short answer; the names header is hidden from screen readers, so the answer carries its product's name. */
function Answer({ name, side }: { name: string; side: Side }) {
  return (
    <dd className="mt-1 min-w-0 px-5">
      <span className="sr-only">{`${name}: `}</span>
      <ShortValue side={side} />
    </dd>
  );
}

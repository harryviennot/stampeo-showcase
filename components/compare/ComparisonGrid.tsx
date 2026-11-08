import type { TableGroup } from "@/lib/compare/page/rows";
import { rowTint, ShortValue, STAMPEO_TINT, type Names, type TableLabels } from "./TableParts";

interface GridProps {
  groups: TableGroup[];
  names: Names;
  labels: TableLabels;
}

/** Where each theme's first row falls in the table, so the stripes run on across themes. */
const firstRows = (groups: TableGroup[]) => groups.map((_, index) => groups.slice(0, index).reduce((count, group) => count + group.rows.length, 0));

/**
 * The comparison from laptop width up, drawn like the pricing page's feature
 * table: one card, a bold row per theme, then striped rows of a label and the
 * two short answers, with Stampeo's column tinted.
 */
export function ComparisonGrid({ groups, names, labels }: GridProps) {
  const starts = firstRows(groups);

  return (
    <div className="card-stamp hidden overflow-hidden rounded-3xl bg-white lg:block">
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
            {group.rows.map((row, rowIndex) => (
              <tr key={row.id} role="row" className={`border-t border-[var(--border)]/50 ${rowTint(starts[groupIndex] + rowIndex)}`}>
                <th scope="row" role="rowheader" className="px-6 py-2.5 text-left text-[13px] font-medium text-[var(--muted-foreground)]">
                  {row.label}
                </th>
                <td role="cell" className="px-6 py-2.5">
                  <ShortValue side={row.competitor} />
                </td>
                <td role="cell" className={`px-6 py-2.5 ${STAMPEO_TINT}`}>
                  <ShortValue side={row.stampeo} />
                </td>
              </tr>
            ))}
          </tbody>
        ))}
      </table>
    </div>
  );
}

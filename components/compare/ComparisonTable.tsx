import { COPY } from "@/lib/compare/page/copy";
import { tableGroups, type Side, type TableGroup } from "@/lib/compare/page/rows";
import type { ComparisonView } from "@/lib/compare/page/view";
import { ComparisonRows } from "./ComparisonRows";
import { GroupChip, SideDetail } from "./TableParts";

const STAMPEO_TINT = "bg-[var(--accent)]/5";

/**
 * Competitor and Stampeo side by side, grouped into four themes with one row
 * per standard fact the competitor has: tap-to-open rows on a phone, a real
 * table from the tablet up with the full sentences and sources always shown.
 */
export function ComparisonTable({ view }: { view: Pick<ComparisonView, "page" | "competitor" | "stampeo"> }) {
  const { market } = view.page;
  const copy = COPY[market];
  const groups = tableGroups({ market, competitor: view.competitor, stampeo: view.stampeo });
  if (groups.length === 0) return null;

  const names = { competitor: view.competitor.name, stampeo: "Stampeo" };

  return (
    <div className="not-prose mt-6 mb-2">
      <ComparisonRows groups={groups} names={names} copy={copy} market={market} />
      <div className="hidden overflow-hidden rounded-3xl border border-[var(--border)] bg-white shadow-sm md:block">
        <table role="table" className="w-full table-fixed border-collapse text-left">
          <caption className="sr-only">{copy.tableCaption(names.competitor)}</caption>
          <thead role="rowgroup">
            <tr role="row">
              <th scope="col" role="columnheader" className="w-[24%] p-5 text-sm font-semibold text-[var(--muted-foreground)]">
                {copy.criterion}
              </th>
              <th scope="col" role="columnheader" className="w-[38%] p-5 text-sm font-bold">
                {names.competitor}
              </th>
              <th scope="col" role="columnheader" className={`w-[38%] p-5 text-sm font-bold text-[var(--accent)] ${STAMPEO_TINT}`}>
                {names.stampeo}
              </th>
            </tr>
          </thead>
          {groups.map((group) => (
            <GroupBody key={group.id} group={group} names={names} market={market} />
          ))}
        </table>
      </div>
    </div>
  );
}

function GroupBody({ group, names, market }: { group: TableGroup; names: { competitor: string; stampeo: string }; market: ComparisonView["page"]["market"] }) {
  return (
    <tbody role="rowgroup" className="border-t border-[var(--border)]">
      <tr role="row" className="bg-[var(--cream)]/60">
        <th scope="rowgroup" role="rowheader" className="px-5 py-4 text-left">
          <span className="flex items-center gap-3">
            <GroupChip group={group.id} />
            <span className="text-h3 text-[var(--near-black)]">{group.label}</span>
          </span>
        </th>
        <td role="cell" aria-hidden="true" className="px-5 py-4 text-xs font-semibold text-[var(--muted-foreground)]">
          {names.competitor}
        </td>
        <td role="cell" aria-hidden="true" className={`px-5 py-4 text-xs font-semibold text-[var(--accent)] ${STAMPEO_TINT}`}>
          {names.stampeo}
        </td>
      </tr>
      {group.rows.map((row) => (
        <tr key={row.id} role="row">
          <th scope="row" role="rowheader" className="border-t border-[var(--border)]/50 p-5 text-left align-top text-sm font-medium text-[var(--muted-foreground)]">
            {row.label}
          </th>
          <Cell side={row.competitor} market={market} />
          <Cell side={row.stampeo} market={market} tint={STAMPEO_TINT} />
        </tr>
      ))}
    </tbody>
  );
}

function Cell({ side, market, tint = "" }: { side: Side; market: ComparisonView["page"]["market"]; tint?: string }) {
  return (
    <td role="cell" className={`min-w-0 border-t border-[var(--border)]/50 p-5 align-top break-words ${tint}`}>
      <span className="block text-base leading-snug font-semibold text-[var(--near-black)]">{side.short}</span>
      {side.taxLine && <span className="mt-1 block text-sm text-[var(--muted-foreground)]">{side.taxLine}</span>}
      <span className="mt-2 block text-sm leading-relaxed text-[var(--muted-foreground)]">
        <SideDetail side={side} market={market} />
      </span>
    </td>
  );
}

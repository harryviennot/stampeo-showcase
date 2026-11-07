import { COPY } from "@/lib/compare/page/copy";
import { tableGroups } from "@/lib/compare/page/rows";
import type { ComparisonView } from "@/lib/compare/page/view";
import { ComparisonTableView } from "./ComparisonTableView";

/**
 * Competitor and Stampeo side by side, grouped into four themes with one row
 * per standard fact the competitor has. Each row shows two short answers and
 * opens on the full sentences and the competitor's source: tap-to-open rows on
 * a phone, a real table from the tablet up.
 */
export function ComparisonTable({ view }: { view: Pick<ComparisonView, "page" | "competitor" | "stampeo"> }) {
  const { market } = view.page;
  const copy = COPY[market];
  const groups = tableGroups({ market, competitor: view.competitor, stampeo: view.stampeo });
  if (groups.length === 0) return null;

  const names = { competitor: view.competitor.name, stampeo: "Stampeo" };
  const labels = {
    criterion: copy.criterion,
    caption: copy.tableCaption(names.competitor),
    source: copy.source,
    showAll: copy.table.showAll,
    hideAll: copy.table.hideAll,
  };

  return <ComparisonTableView groups={groups} names={names} labels={labels} />;
}

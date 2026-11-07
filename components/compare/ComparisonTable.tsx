import { COPY } from "@/lib/compare/page/copy";
import { tableGroups } from "@/lib/compare/page/rows";
import type { ComparisonView } from "@/lib/compare/page/view";
import { ComparisonGrid } from "./ComparisonGrid";
import { ComparisonRows } from "./ComparisonRows";

/**
 * Competitor and Stampeo side by side, grouped into four themes with one row
 * per standard fact the competitor has, each showing the two short answers: a
 * list of rows on a phone, a real table from the tablet up.
 */
export function ComparisonTable({ view }: { view: Pick<ComparisonView, "page" | "competitor" | "stampeo"> }) {
  const { market } = view.page;
  const copy = COPY[market];
  const groups = tableGroups({ market, competitor: view.competitor, stampeo: view.stampeo });
  if (groups.length === 0) return null;

  const names = { competitor: view.competitor.name, stampeo: "Stampeo" };
  const labels = { criterion: copy.criterion, caption: copy.tableCaption(names.competitor) };

  return (
    <div data-comparison-table className="not-prose mt-6 mb-2">
      <ComparisonRows groups={groups} names={names} />
      <ComparisonGrid groups={groups} names={names} labels={labels} />
    </div>
  );
}

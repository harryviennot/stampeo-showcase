import { CheckIcon, Minus } from "@/components/icons";
import { COPY } from "@/lib/compare/page/copy";
import { tableRows, type Cell } from "@/lib/compare/page/rows";
import type { ComparisonView } from "@/lib/compare/page/view";

/**
 * Competitor and Stampeo side by side, one row per standard fact the
 * competitor has. One `<table>` at every width: from the tablet up it is a
 * table, on a phone each row is a card with the criterion on top and the two
 * values below, each under its vendor's name. The roles keep the table
 * semantics when the browser stops drawing it as one. Stampeo's column wears
 * the tint of the pricing page's Growth column; no cell is marked better.
 */
export function ComparisonTable({ view }: { view: Pick<ComparisonView, "page" | "competitor" | "stampeo"> }) {
  const { market } = view.page;
  const copy = COPY[market];
  const rows = tableRows({ market, competitor: view.competitor, stampeo: view.stampeo });

  return (
    <div className="not-prose my-8">
      <table
        role="table"
        className="block w-full text-left md:table md:overflow-hidden md:rounded-3xl md:border md:border-[var(--border)] md:border-separate md:border-spacing-0 md:bg-white md:shadow-sm"
      >
        <caption className="sr-only">{copy.tableCaption(view.competitor.name)}</caption>
        <thead className="hidden md:table-header-group">
          <tr role="row">
            <th scope="col" role="columnheader" className="w-[34%] p-5 text-left text-sm font-semibold text-[var(--muted-foreground)]">
              {copy.criterion}
            </th>
            <th scope="col" role="columnheader" className="w-[33%] p-5 text-left text-sm font-bold">
              {view.competitor.name}
            </th>
            <th scope="col" role="columnheader" className="w-[33%] bg-[var(--accent)]/5 p-5 text-left text-sm font-bold text-[var(--accent)]">
              Stampeo
            </th>
          </tr>
        </thead>
        <tbody role="rowgroup" className="block space-y-3 md:table-row-group md:space-y-0">
          {rows.map((row) => (
            <tr
              key={row.id}
              role="row"
              className="grid grid-cols-2 gap-x-3 gap-y-3 rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm md:table-row md:rounded-none md:border-0 md:p-0 md:shadow-none"
            >
              <th
                scope="row"
                role="rowheader"
                className="col-span-2 text-left text-sm font-semibold text-[var(--near-black)] md:table-cell md:border-t md:border-[var(--border)]/50 md:p-5 md:font-medium md:text-[var(--muted-foreground)]"
              >
                {row.label}
              </th>
              <td role="cell" className="min-w-0 text-[15px] leading-snug break-words md:table-cell md:border-t md:border-[var(--border)]/50 md:p-5">
                <Vendor name={view.competitor.name} />
                <CellValue cell={row.competitor} />
              </td>
              <td
                role="cell"
                className="min-w-0 rounded-xl bg-[var(--accent)]/5 p-3 text-[15px] leading-snug break-words md:table-cell md:rounded-none md:border-t md:border-[var(--border)]/50 md:p-5"
              >
                <Vendor name="Stampeo" accent />
                <CellValue cell={row.stampeo} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** The vendor's name above a value on a phone, where the column headings are not drawn. */
function Vendor({ name, accent = false }: { name: string; accent?: boolean }) {
  return (
    <span
      className={`mb-1 block text-xs font-semibold md:sr-only ${accent ? "text-[var(--accent)]" : "text-[var(--muted-foreground)]"}`}
    >
      {name}
    </span>
  );
}

/** A value, led by an icon when it opens with a yes or a no. The word stays in the text, so the icon is decoration. */
function CellValue({ cell }: { cell: Cell }) {
  if (cell.tone === "plain") return <span>{cell.text}</span>;
  const Icon = cell.tone === "yes" ? CheckIcon : Minus;

  return (
    <span className="flex items-start gap-2">
      <Icon
        aria-hidden="true"
        weight="bold"
        className={`mt-0.5 h-4 w-4 shrink-0 ${cell.tone === "yes" ? "text-[var(--near-black)]" : "text-[var(--muted-foreground)]"}`}
      />
      <span className="min-w-0">{cell.text}</span>
    </span>
  );
}

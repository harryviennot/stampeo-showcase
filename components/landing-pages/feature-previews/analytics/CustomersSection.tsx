import { ANALYTICS_PREVIEW } from "@/lib/landing-pages/copy/previews/analytics";
import { CARD_STAMPS, CUSTOMER_LIST, SEGMENT_LOOK, type SegmentKey } from "@/lib/landing-pages/previews/analytics-customers";
import { FactList } from "../../shared/FactList";
import { LpSection } from "../../shared/LpSection";

const HEAD = "px-3 py-3 text-[11px] leading-4 font-semibold tracking-wider text-[#8a8a8a] uppercase sm:px-4";

/** A segment's pill, in the colours the dashboard gives it. */
function Pill({ segment, children }: Readonly<{ segment: SegmentKey; children: string }>) {
  const { color, background } = SEGMENT_LOOK[segment];

  return (
    <span className="inline-block rounded-full px-2.5 py-0.5 text-[11px] leading-4 font-semibold whitespace-nowrap" style={{ color, backgroundColor: background }}>
      {children}
    </span>
  );
}

/** A card's stamps as the list draws them: a dot for each stamp on the card, filled for the ones earned, and the count. */
function Stamps({ count }: Readonly<{ count: number }>) {
  return (
    <span className="flex items-center gap-2">
      <span aria-hidden className="hidden items-center gap-1 sm:flex">
        {Array.from({ length: CARD_STAMPS }, (_, index) => (
          <span
            key={index}
            className={`h-3 w-3 rounded-full ${index < count ? "bg-[var(--near-black)]" : "bg-[var(--muted)] ring-1 ring-[var(--border)]"}`}
          />
        ))}
      </span>
      <span className="text-[13px] tabular-nums text-[var(--muted-foreground)] sm:text-sm">
        {count}/{CARD_STAMPS}
      </span>
    </span>
  );
}

/** The customer list as the dashboard's table draws it: seven customers, one in each segment. */
function CustomerTable() {
  const { columns, segments } = ANALYTICS_PREVIEW.customers;
  const labels = Object.fromEntries(segments.map((segment) => [segment.key, segment.label])) as Record<SegmentKey, string>;

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-[0_2px_4px_rgba(25,18,16,0.04),0_24px_48px_-28px_rgba(25,18,16,0.2)] ring-1 ring-black/[0.06]">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-[#f0efeb]">
            {columns.map((column, at) => (
              <th key={column} scope="col" className={`${HEAD} ${at === 3 ? "max-sm:sr-only sm:table-cell" : ""}`}>
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {CUSTOMER_LIST.map(({ name, stamps, segment, lastVisit }) => (
            <tr key={segment} data-customer={segment} className="border-b border-[#f8f7f5] last:border-b-0">
              <td className="px-3 py-3 sm:px-4">
                <span className="flex items-center gap-2.5">
                  <span
                    aria-hidden
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                    style={{ backgroundColor: SEGMENT_LOOK[segment].avatar }}
                  >
                    {name.charAt(0)}
                  </span>
                  <span className="min-w-0 leading-tight">
                    <span className="block text-[13px] font-medium text-[#1a1a1a] sm:text-sm">{name}</span>
                    <span className="mt-0.5 block text-[11px] text-[#8a8a8a] sm:hidden">{lastVisit}</span>
                  </span>
                </span>
              </td>
              <td className="px-3 py-3 sm:px-4">
                <Stamps count={stamps} />
              </td>
              <td className="px-3 py-3 sm:px-4">
                <Pill segment={segment}>{labels[segment]}</Pill>
              </td>
              <td className="hidden px-3 py-3 text-sm whitespace-nowrap text-[var(--muted-foreground)] sm:table-cell sm:px-4">{lastVisit}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** The customer list beside what each of its groups means, with the download of the whole list under them. */
export function CustomersSection() {
  const { eyebrow, title, lead, segments, fact } = ANALYTICS_PREVIEW.customers;

  return (
    <LpSection section="customers" tinted eyebrow={eyebrow} title={title} lead={lead} align="center">
      <div className="mx-auto grid max-w-[1200px] items-center gap-8 text-left lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <CustomerTable />
        </div>

        <div className="lg:col-span-5">
          <dl className="flex flex-col gap-3.5">
            {segments.map(({ key, label, definition }) => (
              <div key={key} className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <dt className="w-[7.75rem] shrink-0">
                  <Pill segment={key}>{label}</Pill>
                </dt>
                <dd className="min-w-0 flex-1 text-[15px] leading-snug text-pretty text-[var(--foreground)] sm:text-base">{definition}</dd>
              </div>
            ))}
          </dl>
          <FactList facts={[{ text: fact }]} className="mt-8" />
        </div>
      </div>
    </LpSection>
  );
}

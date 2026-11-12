import { OUTCOMES } from "@/lib/landing-pages/copy/outcomes";
import { INK } from "./TileFrame";

/** Three customers as the dashboard's customer list shows them: their stamps on an 8-stamp card, and the group they are in. */
const CUSTOMERS = [
  { name: "Sophie M.", stamps: 5, group: "Regular", color: "#8b5cf6" },
  { name: "Claire T.", stamps: 8, group: "Reward ready", color: "#ec4899" },
  { name: "Marc D.", stamps: 3, group: "At risk", color: "#3b82f6" },
] as const;

const SEGMENT = "inline-flex h-8 items-center rounded-full bg-white px-3.5 text-sm font-medium ring-1 ring-inset ring-[var(--border)]";

/**
 * The customers pane, framed like the live feed beside it in the toggle: the five groups the
 * dashboard sorts everyone into, as flat labels (they are not buttons), then three customers
 * with their stamps and group.
 */
export function CustomersMini() {
  return (
    <div
      role="img"
      aria-label={`Customers sorted into ${OUTCOMES.regulars.segments.slice(0, -1).join(", ")} and ${OUTCOMES.regulars.segments.at(-1)}, with three customers listed by their stamps and group.`}
      className="w-full max-w-[360px] overflow-hidden rounded-2xl border-[1.5px] border-[var(--near-black)] bg-white shadow-[0_3px_0_var(--near-black)]"
    >
      <div aria-hidden>
        <div className="border-b border-[var(--border)] px-5 py-3">
          <span className="text-sm font-semibold">Customers</span>
        </div>
        <div className="flex flex-wrap gap-2 px-5 pt-4">
          {OUTCOMES.regulars.segments.map((segment) => (
            <span key={segment} className={SEGMENT} style={{ color: INK.figure }}>
              {segment}
            </span>
          ))}
        </div>
        <ul className="px-3 pt-2 pb-3">
          {CUSTOMERS.map(({ name, stamps, group, color }) => (
            <li key={name} className="flex h-14 items-center gap-3 px-2">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: color }}
              >
                {name.charAt(0)}
              </span>
              <span className="min-w-0 flex-1 leading-tight">
                <span className="block truncate text-sm font-semibold">{name}</span>
                <span className="block text-xs" style={{ color: INK.label }}>
                  {stamps} of 8 stamps
                </span>
              </span>
              <span className="shrink-0 rounded-full bg-[var(--background-subtle)] px-2.5 py-1 text-xs font-semibold">{group}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

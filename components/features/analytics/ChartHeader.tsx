/** Card title with its plan pill in the top-right corner. The pill floats, so a
 *  long title wraps beside or below it instead of running underneath. */
export function ChartHeader({ label, plan }: { label: string; plan: string }) {
  return (
    <div className="flow-root mb-4">
      <span className="float-right -mt-2 -mr-2 ml-3 mb-1 px-3 py-1 rounded-full bg-[var(--stamp-sage)]/10 text-[var(--stamp-sage)] text-xs font-bold whitespace-nowrap">
        {plan}
      </span>
      <p className="text-sm font-semibold text-[var(--muted-foreground)]">{label}</p>
    </div>
  );
}

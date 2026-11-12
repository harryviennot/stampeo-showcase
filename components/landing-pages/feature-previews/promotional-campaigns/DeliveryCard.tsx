import { PROMOTIONAL_CAMPAIGNS_PREVIEW as COPY } from "@/lib/landing-pages/copy/previews/promotional-campaigns";

/** The dashboard's own labels for the card's header. */
const DASHBOARD = { broadcast: "Broadcast", recipients: "recipients" } as const;

/** The colour of each count's segment and dot: Apple dark, Google orange, the two misses in greys. */
const TINTS = ["var(--foreground)", "var(--accent)", "#b9b4ae", "#d9d5d0"] as const;

const METRICS = COPY.delivery.metrics.map((metric, index) => ({
  label: metric.label,
  value: Number(metric.value),
  tint: TINTS[index],
}));
const TOTAL = METRICS.reduce((sum, metric) => sum + metric.value, 0);

/**
 * One sample broadcast as the dashboard reports it: the recipients, a bar cut in
 * proportion to where each message landed, and the four counts under it; read out
 * as one picture.
 */
export function DeliveryCard() {
  const label = `Delivery of one ${DASHBOARD.broadcast.toLowerCase()} to ${TOTAL} ${DASHBOARD.recipients}: ${METRICS.map((metric) => `${metric.label} ${metric.value}`).join(", ")}.`;

  return (
    <div
      role="img"
      aria-label={label}
      className="w-full max-w-[520px] rounded-2xl bg-[var(--blog-bg)] p-5 ring-1 ring-black/[0.05] sm:p-6"
    >
      <p className="text-xs font-semibold tracking-[0.14em] text-[var(--muted-foreground)] uppercase">
        {DASHBOARD.broadcast}
      </p>
      <p className="mt-1 text-[1.75rem] leading-none font-semibold tracking-[-0.03em] tabular-nums text-[#1a1a1a]">
        {TOTAL} <span className="text-base font-medium tracking-normal text-[var(--muted-foreground)]">{DASHBOARD.recipients}</span>
      </p>

      <div className="mt-5 flex h-3 w-full overflow-hidden rounded-full bg-black/[0.06]">
        {METRICS.map((metric) => (
          <div
            key={metric.label}
            data-segment={metric.label}
            style={{ width: `${(100 * metric.value) / TOTAL}%`, backgroundColor: metric.tint }}
          />
        ))}
      </div>

      <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4">
        {METRICS.map((metric) => (
          <li key={metric.label}>
            <p className="flex items-center gap-2 text-xs font-semibold text-[var(--muted-foreground)]">
              <span className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ backgroundColor: metric.tint }} />
              {metric.label}
            </p>
            <p className="mt-1 text-[1.5rem] leading-none font-semibold tracking-[-0.02em] tabular-nums text-[#1a1a1a]">
              {metric.value}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

import type { ReactNode } from "react";
import { ChevronDownIcon } from "@/components/icons";

/**
 * A collapsed section for an edge case or a second path. A native `details`
 * element: no JavaScript, and find-in-page opens it.
 */
export function Details({ summary, children }: { summary: string; children: ReactNode }) {
  return (
    <details className="group my-6 rounded-xl border border-[var(--border)] bg-[var(--paper)]">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-2.5 font-semibold text-[var(--near-black)] [&::-webkit-details-marker]:hidden">
        <span>{summary}</span>
        <ChevronDownIcon
          aria-hidden
          className="h-4 w-4 shrink-0 text-[var(--muted-foreground)] transition-transform group-open:rotate-180"
        />
      </summary>
      <div className="px-4 pb-4 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">{children}</div>
    </details>
  );
}

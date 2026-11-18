"use client";

import type { ReactNode } from "react";
import { ChevronDownIcon } from "@/components/icons";
import { faqSummaryClick } from "@/lib/posthog/site-events";

interface FAQListProps {
  /** `answer` may be a ReactNode: the landing FAQ resolves pricing tokens
   *  per-visitor via RegionText (STA-330). Plain strings render as before. */
  items: Array<{ question: string; answer: ReactNode }>;
  /** Number of items open by default (from index 0). */
  defaultOpenCount?: number;
  /** One white table with hairline rows (the landing pages' table look) instead of the inked cards. */
  table?: boolean;
}

/** The questions as rows of one white table, each row at least 56px to tap. */
function FAQTable({ items, defaultOpenCount }: Readonly<Required<Omit<FAQListProps, "table">>>) {
  return (
    <div className="divide-y divide-[var(--border)] overflow-hidden rounded-2xl border border-[var(--border)] bg-white">
      {items.map((faq, index) => (
        <details key={index} className="group px-5 lg:px-8" open={index < defaultOpenCount}>
          <summary
            onClick={faqSummaryClick(faq.question, index + 1)}
            className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-6 py-4 [&::-webkit-details-marker]:hidden"
          >
            <span className="text-lg leading-snug font-semibold text-[var(--foreground)] transition-colors group-hover:text-[var(--accent-hover)]">
              {faq.question}
            </span>
            <ChevronDownIcon
              size={18}
              weight="bold"
              aria-hidden
              className="shrink-0 text-[var(--muted-foreground)] transition-transform duration-300 group-open:rotate-180 group-open:text-[var(--accent-hover)] motion-reduce:transition-none"
            />
          </summary>
          <div className="pb-5">
            <p className="max-w-[68ch] text-base leading-relaxed text-pretty text-[var(--muted-foreground)]">{faq.answer}</p>
          </div>
        </details>
      ))}
    </div>
  );
}

export function FAQList({ items, defaultOpenCount = 0, table = false }: FAQListProps) {
  if (table) return <FAQTable items={items} defaultOpenCount={defaultOpenCount} />;

  return (
    <div className="flex flex-col gap-5">
      {items.map((faq, index) => (
        <details
          key={index}
          className="group flex flex-col rounded-xl bg-white blog-card-3d px-6 py-4"
          open={index < defaultOpenCount}
        >
          <summary onClick={faqSummaryClick(faq.question, index + 1)} className="flex cursor-pointer items-center justify-between gap-6 py-2 list-none">
            <p className="text-lg font-bold leading-normal group-hover:text-[var(--accent)] transition-colors">
              {faq.question}
            </p>
            <div className="text-[var(--muted-foreground)] transition-transform duration-300 group-open:rotate-180 group-open:text-[var(--accent)]">
              <span className="text-xl font-bold">↓</span>
            </div>
          </summary>
          <div className="pt-2 pb-4">
            <p className="text-[var(--muted-foreground)] text-base font-medium leading-relaxed">
              {faq.answer}
            </p>
          </div>
        </details>
      ))}
    </div>
  );
}

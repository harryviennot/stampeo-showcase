interface FAQListProps {
  items: Array<{ question: string; answer: string }>;
  /** Number of items open by default (from index 0). */
  defaultOpenCount?: number;
}

export function FAQList({ items, defaultOpenCount = 0 }: FAQListProps) {
  return (
    <div className="flex flex-col gap-5">
      {items.map((faq, index) => (
        <details
          key={index}
          className="group flex flex-col rounded-xl bg-white blog-card-3d px-6 py-4"
          open={index < defaultOpenCount}
        >
          <summary className="flex cursor-pointer items-center justify-between gap-6 py-2 list-none">
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

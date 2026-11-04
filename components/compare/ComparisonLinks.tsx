import Link from "next/link";
import { Heading } from "@/components/blog/mdx/Heading";
import { ArrowRightIcon } from "@/components/icons";
import { COPY } from "@/lib/compare/page/copy";
import type { OtherComparison } from "@/lib/compare/page/load";
import type { Market } from "@/lib/compare/types";

/** The other published comparisons of the market, as full-width rows. Nothing when there are none. */
export function ComparisonLinks({ market, others }: { market: Market; others: readonly OtherComparison[] }) {
  if (others.length === 0) return null;

  return (
    <section aria-labelledby="other-comparisons">
      <Heading level={2} id="other-comparisons">
        {COPY[market].otherTitle}
      </Heading>
      <ul className="mt-4 space-y-3">
        {others.map((other) => (
          <li key={other.href}>
            <Link
              href={other.href}
              className="flex min-h-12 items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-white px-4 py-3 font-medium text-[var(--near-black)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              {other.label}
              <ArrowRightIcon aria-hidden="true" className="h-4 w-4 shrink-0" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

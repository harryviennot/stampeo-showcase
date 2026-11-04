import { ContactLink } from "@/components/ui/ContactLink";
import { Heading } from "@/components/blog/mdx/Heading";
import { usedFacts } from "@/lib/compare/checked";
import { COPY } from "@/lib/compare/page/copy";
import { formatDate } from "@/lib/compare/page/format";
import { sourceEntries } from "@/lib/compare/page/sources";
import type { ComparisonView } from "@/lib/compare/page/view";

/**
 * Every page a competitor fact on this page was read from: its title, its
 * domain (never the raw address) and the day it was read. The correction
 * contact and the disclaimer close the list, so every page carries them.
 */
export function SourcesList({ view }: { view: Pick<ComparisonView, "page" | "competitor"> }) {
  const { market } = view.page;
  const copy = COPY[market];
  const entries = sourceEntries(usedFacts(view.page, view.competitor));

  return (
    <section aria-labelledby="sources">
      <Heading level={2} id="sources">
        {copy.sourcesTitle}
      </Heading>
      <ul className="mt-4 divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-white">
        {entries.map((entry) => (
          <li key={entry.url}>
            <a
              href={entry.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-12 flex-col justify-center gap-0.5 px-4 py-3 hover:bg-[var(--cream)]"
            >
              <span className="font-medium text-[var(--near-black)]">{entry.title}</span>
              <span className="text-sm text-[var(--muted-foreground)]">
                {entry.domain} · {copy.sourceRead(formatDate(entry.checkedAt, market))}
              </span>
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-5 text-base text-[var(--near-black)]/80">
        {copy.correction.before}
        <ContactLink
          href={`mailto:${copy.correction.email}`}
          className="inline-flex min-h-11 items-center font-medium text-[var(--accent)] underline-offset-4 hover:underline"
        >
          {copy.correction.email}
        </ContactLink>
        {copy.correction.after}
      </p>
      <p className="mt-3 text-sm text-[var(--muted-foreground)]">{copy.disclaimer}</p>
    </section>
  );
}

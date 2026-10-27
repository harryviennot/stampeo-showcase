import { useTranslations } from "next-intl";
import { CaretRightIcon } from "@/components/icons";

/** The pages named in a page's `related`, as full-width rows. */
export function RelatedPages({ pages }: { pages: ReadonlyArray<{ slug: string; title: string }> }) {
  const t = useTranslations("help.related");

  if (pages.length === 0) return null;

  return (
    <section aria-labelledby="help-related" className="mt-12">
      <h2 id="help-related" className="text-h3 text-[var(--near-black)]">
        {t("title")}
      </h2>
      <ul className="mt-3 divide-y divide-[var(--border)] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--paper)]">
        {pages.map((page) => (
          <li key={page.slug}>
            <a
              href={`/help/${page.slug}`}
              className="flex min-h-12 items-center justify-between gap-3 px-4 py-3 font-medium text-[var(--near-black)] transition-colors hover:bg-[var(--paper-hover)] hover:text-[var(--accent)]"
            >
              <span>{page.title}</span>
              <CaretRightIcon aria-hidden className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

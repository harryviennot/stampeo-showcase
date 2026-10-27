import { useTranslations } from "next-intl";
import { HelpPageList } from "./HelpPageList";

/** The pages named in a page's `related`, as rows. */
export function RelatedPages({ pages }: { pages: ReadonlyArray<{ slug: string; title: string }> }) {
  const t = useTranslations("help.related");

  if (pages.length === 0) return null;

  return (
    <section aria-labelledby="help-related">
      <h2 id="help-related" className="text-h3 mb-3 text-[var(--near-black)]">
        {t("title")}
      </h2>
      <HelpPageList items={pages.map((page) => ({ href: `/help/${page.slug}`, title: page.title }))} />
    </section>
  );
}

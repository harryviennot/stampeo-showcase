import { useTranslations } from "next-intl";
import { CaretRightIcon } from "@/components/icons";

/** Help › Category, above the title. The category is plain text until the category pages exist. */
export function HelpBreadcrumb({ categoryName }: { categoryName: string }) {
  const t = useTranslations("help.article");

  return (
    <nav aria-label={t("breadcrumbLabel")}>
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-[var(--muted-foreground)]">
        <li>
          {/* A plain anchor: a localized Link would render /en/help and cost a redirect. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/help" className="inline-flex min-h-11 items-center hover:text-[var(--accent)]">
            {t("home")}
          </a>
        </li>
        <li aria-hidden>
          <CaretRightIcon className="h-3 w-3" />
        </li>
        <li>{categoryName}</li>
      </ol>
    </nav>
  );
}

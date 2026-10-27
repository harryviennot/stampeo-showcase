import { useTranslations } from "next-intl";
import { CaretRightIcon } from "@/components/icons";
import { HelpSearchPill } from "./search/HelpSearchTrigger";

const LINK = "inline-flex min-h-11 items-center font-medium text-[var(--near-black)] underline-offset-4 hover:underline";

/** Help › Category, with the Search pill at the end of the row. */
export function HelpBreadcrumb({ categoryName, categorySlug }: { categoryName: string; categorySlug: string }) {
  const t = useTranslations("help.article");

  return (
    <div className="flex items-center justify-between gap-3">
      <nav aria-label={t("breadcrumbLabel")}>
        <ol className="flex flex-wrap items-center gap-x-1.5 text-sm">
          <li>
            {/* A plain anchor: a localized Link would render /en/help and cost a redirect. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/help" className={LINK}>
              {t("home")}
            </a>
          </li>
          <li aria-hidden>
            <CaretRightIcon className="h-3 w-3 text-[var(--muted-foreground)]" />
          </li>
          <li>
            <a href={`/help/topics/${categorySlug}`} className={LINK}>
              {categoryName}
            </a>
          </li>
        </ol>
      </nav>
      <HelpSearchPill />
    </div>
  );
}

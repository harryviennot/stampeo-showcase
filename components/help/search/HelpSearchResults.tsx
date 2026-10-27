"use client";

import { useTranslations } from "next-intl";
import { HelpPageList } from "../HelpPageList";
import { StillStuck } from "../StillStuck";
import { Highlight } from "./Highlight";
import type { HelpSearch } from "./use-help-search";

/** The id of result row `index` in the list named `listId`; the input points at it while the keyboard is there. */
export const resultId = (listId: string, index: number) => `${listId}-${index}`;

/**
 * What sits under a search field, on the home's desktop panel and in the
 * search dialog: the popular pages before the first keystroke, the matching
 * pages while typing, and when nothing matches, the query, a suggestion and
 * two ways to reach a person.
 */
export function HelpSearchResults({
  search,
  activeIndex,
  listId,
}: {
  search: HelpSearch;
  activeIndex: number;
  listId: string;
}) {
  const t = useTranslations("help.search");
  const typed = search.query.trim() !== "";

  if (search.status === "error") {
    return (
      <div className="space-y-4">
        <p role="status" className="text-sm text-[var(--muted-foreground)]">
          {t("unavailable")}
        </p>
        <StillStuck channels={["email", "whatsapp"]} />
      </div>
    );
  }

  // The index is a few kilobytes, so this is a blink; nothing is shown rather than a spinner.
  if (search.status === "loading") return null;

  if (!typed) {
    return (
      <section aria-labelledby={`${listId}-popular`}>
        <h2 id={`${listId}-popular`} className="mb-2 text-sm font-semibold text-[var(--near-black)]">
          {t("popular")}
        </h2>
        <HelpPageList
          id={listId}
          items={search.popular.map((entry) => ({ href: `/help/${entry.slug}`, title: entry.title }))}
        />
      </section>
    );
  }

  if (search.hits.length === 0) {
    return (
      <div className="space-y-4">
        <div role="status">
          <p className="text-[var(--near-black)]">
            {t.rich("noResult", { query: search.query.trim(), strong: (chunks) => <strong className="font-semibold">{chunks}</strong> })}
          </p>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">{t("noResultTip")}</p>
        </div>
        <StillStuck channels={["email", "whatsapp"]} />
      </div>
    );
  }

  return (
    <section aria-label={t("results")}>
      <HelpPageList
        id={listId}
        size="result"
        items={search.hits.map(({ entry, snippet }, index) => ({
          id: resultId(listId, index),
          href: `/help/${entry.slug}`,
          active: index === activeIndex,
          eyebrow: entry.category,
          title: <Highlight text={entry.title} tokens={search.tokens} />,
          description: snippet.text ? <Highlight text={snippet.text} tokens={search.tokens} /> : undefined,
        }))}
      />
    </section>
  );
}

"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { MagnifyingGlassIcon } from "@/components/icons";
import { HelpSearchResults } from "./HelpSearchResults";
import { HelpSearchTrigger } from "./HelpSearchTrigger";
import { useActiveResult } from "./use-active-result";
import { useHelpSearch } from "./use-help-search";

/**
 * The search on the help home. On a desktop it is a real input, focused on
 * load, whose results open under it once the reader types (opening on focus
 * would cover the doors). On a phone it is a button that opens the dialog.
 */
export function HelpHomeSearch() {
  const t = useTranslations("help.home");

  return (
    <>
      <div className="lg:hidden">
        <HelpSearchTrigger variant="field" label={t("searchPlaceholder")} />
      </div>
      <div className="hidden lg:block">
        <DesktopSearch />
      </div>
    </>
  );
}

function DesktopSearch() {
  const t = useTranslations("help.home");
  const tSearch = useTranslations("help.search");
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const [query, setQuery] = useState("");
  const [dismissed, setDismissed] = useState(false);
  const search = useHelpSearch(query);
  const keyboard = useActiveResult(search.hits.length, listId);
  const { load } = search;
  const panelOpen = query.trim() !== "" && !dismissed;

  useEffect(load, [load]);

  // A click anywhere else closes the panel; typing opens it again.
  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setDismissed(true);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <form role="search" onSubmit={keyboard.onSubmit}>
        <div className="flex h-14 items-center gap-3 rounded-full border border-[var(--border)] bg-white px-5 shadow-sm focus-within:border-[var(--accent)] focus-within:ring-2 focus-within:ring-[var(--accent)]/30">
          <MagnifyingGlassIcon aria-hidden className="h-5 w-5 shrink-0 text-[var(--muted-foreground)]" />
          <input
            type="search"
            autoFocus
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setDismissed(false);
              keyboard.reset();
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setQuery("");
                return;
              }
              keyboard.onKeyDown(event);
            }}
            placeholder={t("searchPlaceholder")}
            aria-label={tSearch("label")}
            aria-controls={panelOpen ? listId : undefined}
            aria-activedescendant={panelOpen ? keyboard.activeId : undefined}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            enterKeyHint="search"
            className="min-w-0 flex-1 bg-transparent text-base text-[var(--near-black)] outline-none placeholder:text-[var(--muted-foreground)] [&::-webkit-search-cancel-button]:hidden"
          />
        </div>
      </form>

      {panelOpen && (
        <div className="absolute inset-x-0 top-full z-20 mt-2 max-h-[min(28rem,60vh)] overflow-y-auto rounded-2xl border border-[var(--border)] bg-white p-2 shadow-lg">
          <HelpSearchResults search={search} activeIndex={keyboard.active} listId={listId} />
        </div>
      )}
    </div>
  );
}

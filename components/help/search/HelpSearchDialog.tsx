"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { MagnifyingGlassIcon, XMarkIcon } from "@/components/icons";
import { lockBodyScroll } from "@/lib/dom/body-scroll-lock";
import { TAP_TARGET } from "@/lib/privacy/choices-ui";
import { HelpSearchResults } from "./HelpSearchResults";
import { useActiveResult } from "./use-active-result";
import { useHelpSearch } from "./use-help-search";

/**
 * Search as a native `<dialog>`: the whole screen on a phone, a panel under
 * the top edge on a desktop. showModal() brings the focus trap, Escape to
 * close and an inert page for free, as in the cookie preferences.
 */
export function HelpSearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTranslations("help.search");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const listId = useId();
  const [query, setQuery] = useState("");
  const search = useHelpSearch(query);
  const keyboard = useActiveResult(search.hits.length, listId);
  const { load } = search;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    load();
    return lockBodyScroll();
  }, [open, load]);

  return (
    <dialog
      ref={dialogRef}
      aria-label={t("label")}
      // `close` also fires for Escape, which is why the native element is used.
      onClose={() => {
        setQuery("");
        onClose();
      }}
      // A click on the backdrop lands on the dialog itself, never on its content.
      onClick={(event) => {
        if (event.target === dialogRef.current) dialogRef.current?.close();
      }}
      className="m-0 h-dvh max-h-none w-full max-w-none flex-col bg-[var(--blog-bg)] p-0 text-[var(--near-black)] backdrop:bg-[var(--near-black)]/40 open:flex lg:mx-auto lg:mb-auto lg:mt-[12vh] lg:h-auto lg:max-h-[70vh] lg:w-[40rem] lg:rounded-2xl lg:border lg:border-[var(--border)] lg:shadow-xl"
    >
      <form
        role="search"
        onSubmit={keyboard.onSubmit}
        className="flex h-16 shrink-0 items-center gap-3 border-b border-[var(--border)] bg-white px-4 lg:rounded-t-2xl"
      >
        <MagnifyingGlassIcon aria-hidden className="h-5 w-5 shrink-0 text-[var(--muted-foreground)]" />
        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            keyboard.reset();
          }}
          onKeyDown={keyboard.onKeyDown}
          placeholder={t("label")}
          aria-label={t("label")}
          aria-controls={listId}
          aria-activedescendant={keyboard.activeId}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          enterKeyHint="search"
          className="min-w-0 flex-1 bg-transparent text-base text-[var(--near-black)] outline-none placeholder:text-[var(--muted-foreground)] [&::-webkit-search-cancel-button]:hidden"
        />
        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          aria-label={t("close")}
          className={`-mr-2 flex w-11 shrink-0 items-center justify-center rounded-full text-[var(--near-black)] hover:bg-[var(--paper-hover)] ${TAP_TARGET}`}
        >
          <XMarkIcon aria-hidden className="h-5 w-5" />
        </button>
      </form>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
        {open && <HelpSearchResults search={search} activeIndex={keyboard.active} listId={listId} />}
      </div>
    </dialog>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import type { ConsentCategory, ConsentState } from "@/lib/consent";

const CATEGORIES: readonly ConsentCategory[] = ["analytics", "marketing"];

/**
 * The second layer: per-purpose choice.
 *
 * A NATIVE `<dialog>`, on purpose. `showModal()` brings a focus trap, Escape
 * to close, inertness of the rest of the page and a `::backdrop` with no
 * library — which matters twice over here, because the CI Lighthouse run fails
 * the PR below 0.9 on accessibility, and because a consent dialog pulling in a
 * third-party component would be a dependency loading in front of the consent
 * gate it is supposed to render.
 *
 * Both switches start OFF whenever there is no stored choice. A pre-ticked box
 * is not consent, and that is the single most-fined mistake in this area.
 */
export function ConsentPreferences({
  open,
  initial,
  onClose,
  onSave,
}: Readonly<{
  open: boolean;
  initial: ConsentState;
  onClose: () => void;
  onSave: (state: ConsentState) => void;
}>) {
  const t = useTranslations("common.cookies.prefs");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState<ConsentState>(initial);

  // Re-seed from the live choice each time it opens, so reopening after a save
  // shows what is actually stored rather than a stale draft.
  //
  // Adjusted during render rather than in an effect: an effect would paint the
  // stale draft first, so reopening after a save would flash the previous
  // switch positions. This is React's documented pattern for derived state.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setDraft(initial);
  }

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="consent-prefs-title"
      // `close` also fires for Escape and for the backdrop, which is the whole
      // reason for using the native element: one handler covers every exit.
      onClose={onClose}
      className="m-auto max-h-[85dvh] w-[min(32rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--paper)] p-5 text-[var(--foreground)] shadow-xl backdrop:bg-black/40 sm:p-6"
    >
      <h2 id="consent-prefs-title" className="text-lg font-bold">
        {t("title")}
      </h2>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">{t("intro")}</p>

      <div className="mt-5 flex flex-col gap-3">
        {/* Always on, and shown as such rather than hidden: naming what runs
            regardless is what makes the two real choices below credible. */}
        <div className="rounded-xl border border-[var(--border)] p-4">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-semibold">{t("necessary.title")}</span>
            <span className="text-xs font-semibold text-[var(--muted-foreground)]">
              {t("necessary.always")}
            </span>
          </div>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {t("necessary.body")}
          </p>
        </div>

        {CATEGORIES.map((category) => (
          <div key={category} className="rounded-xl border border-[var(--border)] p-4">
            <label
              htmlFor={`consent-${category}`}
              className="flex cursor-pointer items-center justify-between gap-4"
            >
              <span className="text-sm font-semibold">{t(`${category}.title`)}</span>
              {/* A real checkbox, visually hidden, with the switch drawn by
                  two spans BESIDE it. The knob is not a `::before` on the
                  input: pseudo-elements on replaced elements are undefined
                  behaviour and Firefox drops them, which would leave the
                  switch looking identical on and off. Track and knob are both
                  siblings of the input because Tailwind's `peer-checked:`
                  compiles to `~`, which reaches siblings and not their
                  children. `sr-only peer` keeps the native keyboard and
                  screen-reader behaviour instead of rebuilding it by hand. */}
              <span className="relative inline-flex h-6 w-11 shrink-0 items-center">
                <input
                  id={`consent-${category}`}
                  type="checkbox"
                  role="switch"
                  checked={draft[category]}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      [category]: event.target.checked,
                    }))
                  }
                  className="peer sr-only"
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full bg-[var(--border)] transition-colors peer-checked:bg-[var(--accent)] peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--accent)] peer-focus-visible:ring-offset-2"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5"
                />
              </span>
            </label>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {t(`${category}.body`)}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          className="h-11 w-full rounded-full px-5 text-sm font-semibold text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)] sm:w-auto"
        >
          {t("cancel")}
        </button>
        <button
          type="button"
          onClick={() => onSave(draft)}
          className="h-11 w-full rounded-full bg-[var(--foreground)] px-6 text-sm font-semibold text-white transition-all hover:brightness-110 sm:w-auto"
        >
          {t("save")}
        </button>
      </div>
    </dialog>
  );
}

"use client";

import { useEffect, useId, useRef } from "react";
import { useTranslations } from "next-intl";

import { CheckIcon, StarIcon, XMarkIcon } from "@/components/icons";
import type { LadderRow } from "@/lib/levels";

const CLOSE_BUTTON =
  "flex items-center justify-center text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]";

/**
 * The whole ladder: one block per level with its card, how to move up and its
 * perks. A native `<dialog>` like the privacy preferences one (focus trap,
 * Escape, inert page): a bottom sheet on a phone, a centred dialog from `sm` up.
 */
export function LevelSheet({
  open,
  rows,
  onClose,
}: Readonly<{ open: boolean; rows: LadderRow[]; onClose: () => void }>) {
  const t = useTranslations("acquisition.levels");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      // `close` also fires for Escape, so one handler covers every exit.
      onClose={onClose}
      // The dialog has no padding of its own, so a click that lands on it is a click on the backdrop.
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="fixed inset-x-0 bottom-0 top-auto m-0 max-h-[85dvh] w-full max-w-none overflow-y-auto overscroll-contain rounded-t-2xl border-t border-[var(--border)] bg-[var(--paper)] p-0 text-[var(--foreground)] shadow-xl backdrop:bg-black/40 sm:inset-0 sm:m-auto sm:w-[min(32rem,calc(100vw-2rem))] sm:rounded-2xl sm:border"
    >
      <div className="px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5 sm:px-6 sm:pb-6 sm:pt-6">
        <div className="flex items-start justify-between gap-3">
          <h2 id={titleId} className="text-h3 text-balance">
            {t("sheetTitle")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("close")}
            className={`-mr-2 -mt-2 h-11 w-11 shrink-0 rounded-full ${CLOSE_BUTTON}`}
          >
            <XMarkIcon size={20} weight="bold" aria-hidden="true" />
          </button>
        </div>

        <ol className="mt-3 divide-y divide-[var(--border)]">
          {rows.map((row) => (
            <li key={row.rank} className="py-3 first:pt-0 last:pb-0">
              <p className="flex items-center gap-1.5 font-semibold text-[var(--primary)]">
                {row.isTop && (
                  <StarIcon
                    size={14}
                    weight="fill"
                    aria-hidden="true"
                    style={{ color: "var(--business-accent, var(--accent))" }}
                  />
                )}
                {row.name}
              </p>
              {row.card && <p className="mt-0.5 text-sm">{row.card}</p>}
              {row.moveUp && <p className="text-sm text-[var(--muted-foreground)]">{row.moveUp}</p>}
              {row.perks.length > 0 && (
                <ul className="mt-1.5 space-y-1">
                  {row.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-1.5 text-sm">
                      <CheckIcon
                        size={14}
                        weight="bold"
                        aria-hidden="true"
                        className="mt-0.5 shrink-0 text-[var(--muted-foreground)]"
                      />
                      <span className="min-w-0 break-words">{perk}</span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>

        {/* Thumbs reach the bottom of the sheet, not its corner. */}
        <button
          type="button"
          onClick={onClose}
          className="mt-4 h-12 w-full rounded-full border border-[var(--border)] bg-[var(--card-bg)] text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] sm:hidden"
        >
          {t("close")}
        </button>
      </div>
    </dialog>
  );
}

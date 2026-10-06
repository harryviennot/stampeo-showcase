"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { ShieldCheckIcon } from "@/components/icons";
import type { ConsentState } from "@/lib/consent";
import { applyLocks, preferencesView, type PreferencesView } from "@/lib/privacy/choices-ui";
import { POLICY_MATRIX, UNKNOWN_ROW_KEY } from "@/lib/privacy/policy-matrix";
import { PurposeCard } from "./PurposeCard";

/** The dialog when the caller says nothing about the visitor's region: the opt-in one. */
const DEFAULT_VIEW = preferencesView(POLICY_MATRIX.rows[UNKNOWN_ROW_KEY], false);

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
 * Both switches start OFF whenever there is no stored choice in an opt-in
 * region. A pre-ticked box is not consent, and that is the single most-fined
 * mistake in this area.
 *
 * `view` decides the region's version: the US dialog leads with Advertising,
 * explains Global Privacy Control, and shows a purpose it overrides as a fixed
 * "off" label. Without one it is the opt-in dialog. The action row stays in view
 * while the cards scroll, so a switch flipped out of sight is never unsaved.
 */
export function ConsentPreferences({
  open,
  initial,
  view = DEFAULT_VIEW,
  onClose,
  onSave,
}: Readonly<{
  open: boolean;
  initial: ConsentState;
  view?: PreferencesView;
  onClose: () => void;
  onSave: (state: ConsentState) => void;
}>) {
  const t = useTranslations("common.cookies.prefs");
  const tFooter = useTranslations("common.footer");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState<ConsentState>(initial);
  const us = view.variant === "us";
  const scope = us ? "us." : "";

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

  const actionBase = "h-11 rounded-full text-sm font-semibold transition-all";
  const primary = `${actionBase} bg-[var(--foreground)] text-white hover:brightness-110`;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="consent-prefs-title"
      // `close` also fires for Escape and for the backdrop, which is the whole
      // reason for using the native element: one handler covers every exit.
      onClose={onClose}
      className="m-auto max-h-[85dvh] w-[min(32rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--paper)] p-5 pb-0 text-[var(--foreground)] shadow-xl backdrop:bg-black/40 sm:p-6 sm:pb-0"
    >
      <h2 id="consent-prefs-title" className="text-lg font-bold">
        {t(`${scope}title`)}
      </h2>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
        {t(`${scope}intro`, { months: view.months, choices: tFooter("privacyChoices") })}
      </p>

      <div className="mt-5 flex flex-col gap-3">
        {/* One status row explains every lock below it, instead of a reason
            under each card. No border and no control, so it reads as status
            and not as a purpose. */}
        {view.gpcStatus && (
          <div className="flex items-start gap-3 rounded-xl bg-[var(--background-subtle)] p-4">
            <ShieldCheckIcon
              aria-hidden="true"
              className="h-5 w-5 shrink-0 text-[var(--foreground)]"
            />
            <p className="text-sm">
              {t(view.gpcStatus === "all" ? "us.gpc.statusAll" : "us.gpc.statusAdvertising")}
            </p>
          </div>
        )}

        {view.order.map((card) => {
          // Always on, and shown as such rather than hidden: naming what runs
          // regardless is what makes the real choices credible.
          if (card === "necessary") {
            return (
              <PurposeCard
                key={card}
                title={t("necessary.title")}
                body={t("necessary.body")}
                control={{ kind: "state", label: t("necessary.always") }}
              />
            );
          }
          return (
            <PurposeCard
              key={card}
              title={t(`${scope}${card}.title`)}
              body={t(`${scope}${card}.body`)}
              control={
                view.locked.includes(card)
                  ? { kind: "state", label: t("lockedOff") }
                  : {
                      kind: "switch",
                      id: `consent-${card}`,
                      checked: draft[card],
                      onChange: (checked) =>
                        setDraft((current) => ({ ...current, [card]: checked })),
                    }
              }
            />
          );
        })}
      </div>

      {/* Sticks to the bottom of the dialog. The gradient fades the cards
          scrolling under it, and is invisible when everything fits. */}
      <div className="sticky bottom-0 -mx-5 mt-4 flex gap-2 bg-[var(--paper)] px-5 pb-5 pt-2 before:pointer-events-none before:absolute before:inset-x-0 before:-top-4 before:h-4 before:bg-linear-to-t before:from-[var(--paper)] before:to-transparent sm:-mx-6 sm:justify-end sm:px-6 sm:pb-6">
        {view.onlyClose ? (
          <button type="button" onClick={onClose} className={`${primary} w-full px-6 sm:w-auto`}>
            {t("close")}
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={onClose}
              className={`${actionBase} px-4 text-[var(--muted-foreground)] hover:text-[var(--foreground)] sm:px-5`}
            >
              {t("cancel")}
            </button>
            <button
              type="button"
              onClick={() => onSave(applyLocks(draft, view.locked))}
              className={`${primary} flex-1 px-6 sm:flex-none`}
            >
              {t("save")}
            </button>
          </>
        )}
      </div>
    </dialog>
  );
}

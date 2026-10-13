"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { ArrowUpIcon, XIcon } from "@phosphor-icons/react";
import { lockBodyScroll } from "@/lib/dom/body-scroll-lock";
import "./browser-escape-guide.css";

export interface BrowserEscapeGuideProps {
  /** "Google" or "Apple": the sign-in the visitor tried. */
  provider: string;
  /** Called for the close button and for Escape. */
  onClose: () => void;
  onChooseEmail: () => void;
}

const pill = (chunks: ReactNode) => (
  <strong className="mx-0.5 inline-block rounded-md leading-snug bg-[var(--accent)]/15 px-1.5 py-0.5 font-bold text-[var(--near-black)] ring-1 ring-inset ring-[var(--accent)]/40">
    {chunks}
  </strong>
);

/**
 * Full-screen guide shown when the page could not hand itself to the phone's
 * browser: it dims the page, points at the app's own ••• button above the web
 * view and spells out the two taps that open the page in the real browser.
 *
 * A native modal `<dialog>`, like `ConsentPreferences`: it stays above the site
 * header and gives a focus trap, Escape and an inert page behind it.
 */
export function BrowserEscapeGuide({ provider, onClose, onChooseEmail }: BrowserEscapeGuideProps) {
  const t = useTranslations("onboarding.createAccount");
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const emailRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
    }
    emailRef.current?.focus();
    return lockBodyScroll();
  }, []);

  const steps = [
    t.rich("guideStepMenu", { pill }),
    t.rich("guideStepExternal", { pill }),
  ];

  return (
    <dialog
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      // `close` fires for Escape and for the browser's back gesture too.
      onClose={onClose}
      className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none overflow-y-auto overscroll-contain border-0 bg-black/60 p-0 text-[var(--foreground)] backdrop:bg-transparent"
    >
      <div className="relative mx-auto w-full max-w-md pb-6">
        <ArrowUpIcon
          aria-hidden="true"
          weight="bold"
          size={44}
          className="browser-escape-arrow absolute right-2 top-1.5 text-white drop-shadow-md"
        />

        <div className="px-4 pt-16">
          <div className="relative rounded-3xl border border-[var(--border)] bg-[var(--card-bg)] p-5 shadow-xl">
            <button
              type="button"
              onClick={onClose}
              aria-label={t("guideClose")}
              className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-full text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              <XIcon size={20} weight="bold" aria-hidden="true" />
            </button>

            <h2 id={titleId} className="text-h3 text-balance pr-10">
              {t("guideTitle", { provider })}
            </h2>

            <ol className="mt-5 space-y-4" role="list">
              {steps.map((step, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--near-black)] text-sm font-bold text-white"
                  >
                    {index + 1}
                  </span>
                  <span className="min-w-0 text-[15px] leading-7">{step}</span>
                </li>
              ))}
            </ol>

            <p className="mt-5 text-sm text-balance text-[var(--muted-foreground)]">
              {t("guideAccountNote", { provider })}
            </p>

            <button
              ref={emailRef}
              type="button"
              onClick={onChooseEmail}
              className="mt-5 h-12 w-full rounded-full border border-[var(--border)] bg-[var(--card-bg)] text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
            >
              {t("guideUseEmail")}
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}

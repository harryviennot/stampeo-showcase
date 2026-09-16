"use client";

import { useTranslations } from "next-intl";

import { CONSENT_OPEN_EVENT } from "@/lib/consent";

/**
 * The permanent way back to the choice, in the footer's Legal column.
 *
 * Withdrawing consent has to be as easy as giving it, which means it cannot
 * live only in a banner that disappears the moment someone answers.
 *
 * A button rather than a link, and an event rather than a prop: the footer is
 * an async server component and the banner lives up in the locale layout, so
 * there is no React tree between them to pass a handler down. Same idiom as
 * `MarketSuggestion`'s dismiss.
 */
export function CookiePreferencesButton() {
  const t = useTranslations("common.footer");

  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(CONSENT_OPEN_EVENT))}
      className="cursor-pointer text-left text-sm font-medium text-white/60 transition-colors hover:text-[var(--accent)]"
    >
      {t("cookiePreferences")}
    </button>
  );
}

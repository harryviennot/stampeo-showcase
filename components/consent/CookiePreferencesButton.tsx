"use client";

import { useTranslations } from "next-intl";

import { PrivacyChoicesIcon } from "@/components/icons";
import { useConsent } from "@/hooks/use-consent";
import { CONSENT_OPEN_EVENT } from "@/lib/consent";
import { choicesLabel, splitLastWord } from "@/lib/privacy/choices-ui";

/** `footer` is the dark footer's link colour; `page` is for a light page with no footer. */
const TONES = {
  footer: "text-left font-medium text-white/60 hover:text-[var(--accent)]",
  page: "text-center text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
} as const;

/**
 * The permanent way back to the choice: in the footer's Legal column, and under
 * the card on the demo wallet page, which has no footer.
 *
 * Withdrawing consent has to be as easy as giving it, which means it cannot
 * live only in a banner that disappears the moment someone answers.
 *
 * The label comes from the visitor's policy row. A row that shows a notice (the
 * US) gets "Your Privacy Choices" and the opt-out icon; every other row, and
 * the moment before the row is known, gets "Cookie preferences".
 *
 * A button rather than a link, and an event rather than a prop: the footer is
 * an async server component and the banner lives up in the locale layout, so
 * there is no React tree between them to pass a handler down. Same idiom as
 * `MarketSuggestion`'s dismiss.
 */
export function CookiePreferencesButton({ tone = "footer" }: Readonly<{ tone?: keyof typeof TONES }>) {
  const t = useTranslations("common");
  const { surface, ready } = useConsent();
  const { key, icon } = choicesLabel({ surface, ready });
  const { head, tail } = splitLastWord(t(key));

  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(CONSENT_OPEN_EVENT))}
      // 44px tall through padding, offset by an equal negative margin, so the
      // neighbouring links keep their rhythm.
      className={`-my-3 cursor-pointer py-3 text-sm transition-colors ${TONES[tone]}`}
    >
      {head}
      {/* The icon stays with the last word, so it never wraps onto a line of its own. */}
      <span className="whitespace-nowrap">
        {tail}
        {icon && <PrivacyChoicesIcon className="ml-1.5 inline-block h-3.5 w-auto align-[-2px]" />}
      </span>
    </button>
  );
}

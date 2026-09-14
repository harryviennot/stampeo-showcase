"use client";

import { useCallback, useSyncExternalStore } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { detectBrowserCountry } from "@/lib/phone-utils";
import { suggestedMarket } from "@/lib/market-suggestion";
import { MARKETS, type Market } from "@/lib/markets";

const DISMISS_KEY = "stampeo_market_suggestion_dismissed";

/**
 * Offers a visitor the market page that quotes the currency they will be billed
 * in — when that is not the page they are on.
 *
 * The euro pages quote EUR 20 and a US business is billed $49. Until `/us` is
 * indexed, hreflang protects nobody, so every US visitor meets the real number
 * at the last step of a thirty-step wizard. This turns that into one line and
 * one click, before they invest anything.
 *
 * A LINK, never a redirect. Google prefers being offered the switch to an
 * IP-based redirect, a wrong guess costs a click rather than a trapped visitor,
 * and the page stays byte-identical for crawler and human — which is the whole
 * reason geo-detection was rejected for these pages in the first place.
 *
 * Rendered from a client snapshot only. `detectBrowserCountry` reads the
 * timezone and `navigator.language`, neither of which exists on the server;
 * reading them during a shared render pass is what made the phone field's flag
 * flip on hydration and cost React the whole form subtree (see
 * `phone-country.test.ts`). The server snapshot is always `null`.
 */
export function MarketSuggestion({ market }: Readonly<{ market: Market }>) {
  const t = useTranslations("common.marketSuggestion");

  const subscribe = useCallback((onChange: () => void) => {
    window.addEventListener("storage", onChange);
    return () => window.removeEventListener("storage", onChange);
  }, []);

  const suggestion = useSyncExternalStore<Market | null>(
    subscribe,
    () => {
      try {
        if (localStorage.getItem(DISMISS_KEY)) return null;
      } catch {
        // A browser refusing storage is not a reason to hide the offer.
      }
      return suggestedMarket(detectBrowserCountry(), market);
    },
    // Server snapshot: nothing. The banner appears after mount or not at all.
    () => null,
  );

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new Event("storage"));
  }, []);

  if (!suggestion) return null;

  return (
    <div
      className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-xl border border-[var(--border)] bg-[var(--blog-bg)] px-4 py-2.5 text-sm"
      role="status"
    >
      <span className="text-[var(--muted-foreground)]">
        {t("prompt", { country: t(`country.${suggestion}`) })}
      </span>
      <Link
        href={MARKETS[suggestion].path as "/us"}
        className="font-semibold text-[var(--accent)] underline underline-offset-2"
      >
        {t("cta", { country: t(`country.${suggestion}`) })}
      </Link>
      <button
        type="button"
        onClick={dismiss}
        className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
        aria-label={t("dismiss")}
      >
        ×
      </button>
    </div>
  );
}

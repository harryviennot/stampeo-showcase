"use client";

/* eslint-disable @next/next/no-img-element */
import { useTranslations } from "next-intl";
import { APP_STORE_URL, PLAY_STORE_URL } from "@/components/features/scanner-mobile/StoreBadges";
import { storeBadges } from "@/lib/store-badges";

const LINK =
  "inline-flex h-11 items-center rounded-xl transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2";

/** The App Store and Google Play badges, each a 44px link to the Scanner app's listing in a new tab. */
export function AppStoreLinks() {
  const t = useTranslations("features.scanner-mobile.custom");
  const badges = storeBadges("en");

  return (
    <div className="flex flex-wrap items-center gap-3">
      <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" aria-label={t("appStoreAlt")} className={LINK}>
        <img src={badges.apple} alt="" className="h-11 w-auto" />
      </a>
      <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" aria-label={t("googlePlayAlt")} className={LINK}>
        <img src={badges.google} alt="" className="h-11 w-auto" />
      </a>
    </div>
  );
}

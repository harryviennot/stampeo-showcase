"use client";

import { useLocale, useTranslations } from "next-intl";

// Live store listings for the Stampeo scanner app. Canonical, region-free forms
// so each store opens in the visitor's local market + language. Kept in sync with
// web/src/app/scanner-welcome/page.tsx.
export const APP_STORE_URL = "https://apps.apple.com/app/id6761758382";
export const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.hryvnt.stampeo";

type Size = "md" | "lg";

const heights: Record<Size, string> = {
  md: "h-11 sm:h-12",
  lg: "h-12 sm:h-14",
};

interface StoreBadgesProps {
  size?: Size;
  className?: string;
}

/**
 * Clickable App Store + Google Play badges, locale-aware (French art on `fr`).
 * Uses a plain <img> so we don't have to enable SVG handling in next/image.
 */
export function StoreBadges({ size = "md", className = "" }: StoreBadgesProps) {
  const locale = useLocale();
  const t = useTranslations("features.scanner-mobile.custom");

  const appleSrc = locale === "fr" ? "/AppStoreFR.svg" : locale === "es" ? "/AppStoreES.svg" : "/AppStore.svg";
  const googleSrc = locale === "fr" ? "/GooglePlayFR.svg" : locale === "es" ? "/GooglePlayES.svg" : "/GooglePlay.svg";
  const h = heights[size];

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <a
        href={APP_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("appStoreAlt")}
        className="inline-block rounded-xl transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={appleSrc} alt={t("appStoreAlt")} className={`${h} w-auto`} />
      </a>
      <a
        href={PLAY_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("googlePlayAlt")}
        className="inline-block rounded-xl transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={googleSrc} alt={t("googlePlayAlt")} className={`${h} w-auto`} />
      </a>
    </div>
  );
}

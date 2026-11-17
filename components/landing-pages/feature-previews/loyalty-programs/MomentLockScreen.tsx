"use client";

import { useTranslations } from "next-intl";
import { LOCK_WALLPAPER } from "@/components/features/geolocalisation/GeofencingHeroAnimation";
import type { Banner } from "@/lib/landing-pages/copy/types";
import { LockScreenNotification } from "../../platform/LockScreenNotification";
import { levelShopBanner } from "./LevelShopIcon";

/** A lock screen's top: the wallpaper, the clock and date, and the level-up notification in iOS's dark style. */
export function MomentLockScreen({ banner }: Readonly<{ banner: Banner }>) {
  const t = useTranslations("features.geolocalisation.demo");

  return (
    <div className="flex h-full flex-col items-center px-4 pt-9 text-left" style={{ background: LOCK_WALLPAPER }}>
      <p className="text-[64px] leading-none tracking-tight text-white" style={{ fontWeight: 200, textShadow: "0 1px 8px rgba(0,0,0,0.3)" }}>
        9:41
      </p>
      <p className="mt-1 text-[13px] font-medium text-white/75" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.2)" }}>
        {t("lockScreenDate")}
      </p>
      <div className="mt-8 w-full max-w-[340px]">
        <LockScreenNotification {...levelShopBanner(banner)} />
      </div>
    </div>
  );
}

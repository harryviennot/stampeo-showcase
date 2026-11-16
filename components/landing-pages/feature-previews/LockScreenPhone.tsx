"use client";

import type { ComponentProps } from "react";
import { useTranslations } from "next-intl";
import { LOCK_WALLPAPER } from "@/components/features/geolocalisation/GeofencingHeroAnimation";
import { IPhone } from "@/components/ui/IPhone";
import { LockScreenNotification } from "../platform/LockScreenNotification";

/**
 * A still lock screen: the wallpaper, the clock and the site's lock-screen date, and one notification in the
 * same dark style as every notification card on the page. Drawn at `width`; `eager` is for the one in a hero.
 */
export function LockScreenPhone({
  width,
  notification,
  eager = false,
}: Readonly<{ width: number; notification: ComponentProps<typeof LockScreenNotification>; eager?: boolean }>) {
  const t = useTranslations("features.geolocalisation.demo");

  return (
    <IPhone statusBar="lock" width={width} eager={eager}>
      <div className="absolute inset-0" style={{ background: LOCK_WALLPAPER }} />
      <div className="relative z-10 flex flex-col items-center pt-[calc(var(--iphone-safe-top)+2rem)]">
        <div className="text-[72px] leading-none tracking-tight text-white" style={{ fontWeight: 200, textShadow: "0 1px 8px rgba(0,0,0,0.3)" }}>
          9:41
        </div>
        <div className="mt-1 text-[13px] font-medium text-white/75" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.2)" }}>
          {t("lockScreenDate")}
        </div>
      </div>
      <div className="relative z-10 mt-6 px-3">
        <LockScreenNotification {...notification} />
      </div>
    </IPhone>
  );
}

"use client";

import { useTranslations } from "next-intl";
import { LOCK_WALLPAPER } from "@/components/features/geolocalisation/GeofencingHeroAnimation";
import { NotificationBanner } from "@/components/features/notifications-push/NotificationBanner";
import { IPhone } from "@/components/ui/IPhone";
import { GEOLOCATION_PREVIEW } from "@/lib/landing-pages/copy/previews/geolocation";
import { lpBanner } from "../../shared/banner";

/**
 * The lock screen the walk ends on: the hero's wallpaper, the clock and the site's lock-screen date, and the
 * sample café's own notification. A still phone, drawn at `width`; `eager` is for the one in a hero.
 */
export function LockScreenPhone({ width, eager = false }: Readonly<{ width: number; eager?: boolean }>) {
  const t = useTranslations("features.geolocalisation.demo");
  const { sender, title, body } = GEOLOCATION_PREVIEW.banner;

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
        <NotificationBanner {...lpBanner({ sender, body })} title={title} body={body} timeAgo="now" className="bg-white/85! backdrop-blur-none!" />
      </div>
    </IPhone>
  );
}

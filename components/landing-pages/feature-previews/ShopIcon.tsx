/* eslint-disable @next/next/no-img-element */
import type { ComponentProps } from "react";
import type { NotificationBanner } from "@/components/features/notifications-push/NotificationBanner";
import type { Banner } from "@/lib/landing-pages/copy/types";
import { AUREVO } from "../shared/samples";

/** The tile's top edge catches a little light, as an app icon's does. */
const SHEEN = "linear-gradient(160deg, rgba(255,255,255,0.16), rgba(255,255,255,0) 55%)";

/** The sample café's notification icon: its cup on its card colour, a 40px tile, as the Wallet shows a shop's icon. */
export function ShopIcon() {
  return (
    <div
      data-shop-icon
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] shadow-[0_2px_6px_rgba(0,0,0,0.2)] ring-1 ring-white/10"
      style={{ backgroundColor: AUREVO.design.background_color, backgroundImage: SHEEN }}
    >
      <img src="/themes/cafe/cup.png" alt="" className="h-8 w-auto" />
    </div>
  );
}

/** A sample-shop notification with the shop's icon tile, for the phone's banner and the lock-screen cards. */
export function shopBanner(banner: Banner): ComponentProps<typeof NotificationBanner> {
  return { appName: banner.sender, title: banner.body, icon: <ShopIcon /> };
}

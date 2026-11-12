import type { ComponentProps } from "react";
import { NotificationBanner } from "@/components/features/notifications-push/NotificationBanner";
import type { Banner } from "@/lib/landing-pages/copy/types";
import { AUREVO } from "./AurevoCard";

/** The sample café's notification icon: its cup on its card colour, as a wallet pass icon shows. */
function AurevoIcon() {
  return (
    <div
      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px] shadow-[0_2px_6px_rgba(0,0,0,0.15)]"
      style={{ backgroundColor: AUREVO.design.background_color }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/themes/cafe/cup.png" alt="" className="h-6 w-auto" />
    </div>
  );
}

/**
 * A lock-screen notification from the sample café: its name and icon on top,
 * the message in bold, as Apple Wallet shows a card update.
 */
export function lpBanner(banner: Banner): ComponentProps<typeof NotificationBanner> {
  return { appName: banner.sender, title: banner.body, icon: <AurevoIcon /> };
}

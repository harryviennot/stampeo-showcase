/* eslint-disable @next/next/no-img-element */
import type { ComponentProps } from "react";
import { NotificationBanner } from "@/components/features/notifications-push/NotificationBanner";
import type { Banner } from "@/lib/landing-pages/copy/types";
import { AUREVO } from "./AurevoCard";

/** The sample café's notification icon: its cup on its card colour. */
function AurevoIcon() {
  return (
    <div
      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px] shadow-[0_2px_6px_rgba(0,0,0,0.15)]"
      style={{ backgroundColor: AUREVO.design.background_color }}
    >
      <img src="/themes/cafe/cup.png" alt="" className="h-6 w-auto" />
    </div>
  );
}

/** A lock-screen notification from the sample café: its name and icon, the message in bold. */
export function lpBanner(banner: Banner): ComponentProps<typeof NotificationBanner> {
  return { appName: banner.sender, title: banner.body, icon: <AurevoIcon /> };
}

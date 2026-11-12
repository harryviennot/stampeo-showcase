/* eslint-disable @next/next/no-img-element */
import type { ComponentProps } from "react";
import { NotificationBanner } from "@/components/features/notifications-push/NotificationBanner";
import { StampIconSvg } from "@/components/onboarding/StampIconPicker";
import { LEVELS_BUSINESS } from "@/lib/landing-pages/copy/shared";
import type { Banner } from "@/lib/landing-pages/copy/types";
import { AUREVO, BARBER } from "./samples";

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

/** The sample barbershop's notification icon: its scissors on its stamp colour. */
function BarberIcon() {
  return (
    <div
      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px] shadow-[0_2px_6px_rgba(0,0,0,0.15)]"
      style={{ backgroundColor: BARBER.design.stamp_filled_color }}
    >
      <StampIconSvg icon="scissors" className="h-5 w-5" color={BARBER.design.icon_color} />
    </div>
  );
}

/** A lock-screen notification from a sample business: its name and icon, the message in bold. */
export function lpBanner(banner: Banner): ComponentProps<typeof NotificationBanner> {
  return {
    appName: banner.sender,
    title: banner.body,
    icon: banner.sender === LEVELS_BUSINESS ? <BarberIcon /> : <AurevoIcon />,
  };
}

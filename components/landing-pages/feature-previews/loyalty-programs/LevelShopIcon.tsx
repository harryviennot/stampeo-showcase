import type { ComponentProps } from "react";
import type { NotificationBanner } from "@/components/features/notifications-push/NotificationBanner";
import { StampIconSvg } from "@/components/onboarding/StampIconPicker";
import type { Banner } from "@/lib/landing-pages/copy/types";
import { LEVELS_SHOP } from "@/lib/landing-pages/previews/loyalty-ladder";

/** The barbershop's notification icon: the scissors of its stamps on its stamp colour. */
function LevelShopIcon() {
  const { stamp_filled_color, stamp_icon, icon_color } = LEVELS_SHOP.design;

  return (
    <div
      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px] shadow-[0_2px_6px_rgba(0,0,0,0.15)]"
      style={{ backgroundColor: stamp_filled_color }}
    >
      <StampIconSvg icon={stamp_icon} className="h-5 w-5" color={icon_color} />
    </div>
  );
}

/** A notification from the barbershop: its name and icon, the message in bold. */
export function levelShopBanner(banner: Banner): ComponentProps<typeof NotificationBanner> {
  return { appName: banner.sender, title: banner.body, icon: <LevelShopIcon /> };
}

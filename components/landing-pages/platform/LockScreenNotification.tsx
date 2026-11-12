import type { ComponentProps } from "react";
import type { NotificationBanner } from "@/components/features/notifications-push/NotificationBanner";

/** iOS's dark notification: its translucent material and its type colours. */
const DARK = {
  material: "rgba(30, 30, 32, 0.88)",
  primary: "#ffffff",
  secondary: "rgba(235, 235, 245, 0.6)",
} as const;

type Banner = Pick<ComponentProps<typeof NotificationBanner>, "appName" | "title" | "icon" | "timeAgo">;

/**
 * A wallet notification as iOS shows it in dark mode: the sender's icon, its
 * name in bold with the time on the right, and the message under it, in white
 * on the dark material.
 */
export function LockScreenNotification({ appName, title, icon, timeAgo = "now" }: Readonly<Banner>) {
  return (
    <div
      className="flex items-center gap-3 rounded-[22px] py-3 pr-4 pl-3 shadow-[0_12px_28px_-16px_rgba(0,0,0,0.55)] ring-1 ring-white/[0.08] backdrop-blur-2xl backdrop-saturate-150"
      style={{ backgroundColor: DARK.material }}
    >
      {icon}
      <div className="min-w-0 flex-1 text-left">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate text-[15px] leading-5 font-semibold" style={{ color: DARK.primary }}>
            {appName}
          </span>
          <span className="shrink-0 text-[13px] leading-5" style={{ color: DARK.secondary }}>
            {timeAgo}
          </span>
        </div>
        <p className="text-[14px] leading-[1.3] text-balance" style={{ color: DARK.primary }}>
          {title}
        </p>
      </div>
    </div>
  );
}

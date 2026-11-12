import type { ComponentProps, ReactNode } from "react";
import type { NotificationBanner } from "@/components/features/notifications-push/NotificationBanner";

/** A soft warm wallpaper, for a slice of lock screen. */
const WALLPAPER =
  "radial-gradient(90% 130% at 12% 0%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 60%), radial-gradient(80% 140% at 95% 100%, #ef9d72 0%, rgba(239,157,114,0) 70%), linear-gradient(135deg, #fae2d2 0%, #f5c4a6 55%, #eca886 100%)";

type Banner = Pick<ComponentProps<typeof NotificationBanner>, "appName" | "title" | "icon" | "timeAgo">;

/**
 * A wallet notification as iOS shows it on the lock screen: the sender's icon,
 * its name in bold with the time on the right, and the message under it.
 */
export function LockScreenNotification({ appName, title, icon, timeAgo = "now" }: Readonly<Banner>) {
  return (
    <div className="flex items-center gap-3 rounded-[22px] bg-white/70 py-3 pr-4 pl-3 shadow-[0_10px_24px_-14px_rgba(80,30,10,0.45)] ring-1 ring-white/60 backdrop-blur-2xl backdrop-saturate-150">
      {icon}
      <div className="min-w-0 flex-1 text-left">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate text-[15px] leading-5 font-semibold text-[#111]">{appName}</span>
          <span className="shrink-0 text-[13px] leading-5 text-black/45">{timeAgo}</span>
        </div>
        <p className="text-[14px] leading-[1.3] text-balance text-black/80">{title}</p>
      </div>
    </div>
  );
}

/** A slice of a lock screen's wallpaper, for a notification to sit on. */
export function LockScreenSlice({ className = "", children }: Readonly<{ className?: string; children: ReactNode }>) {
  return (
    <div className={className} style={{ background: WALLPAPER }}>
      {children}
    </div>
  );
}

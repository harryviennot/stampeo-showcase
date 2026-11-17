import type { Banner } from "@/lib/landing-pages/copy/types";
import { LockScreenNotification } from "../../platform/LockScreenNotification";
import { shopBanner } from "../ShopIcon";

/**
 * A sample-shop notification as one picture, on a warm grey tray, read out as `alt`. It sits under the lock
 * screen's clock unless `compact` leaves the clock out. A message still being typed in passes `reserve`, the
 * longest words it will reach, which keep the notification's height from moving. `timeAgo` is the time the
 * notification prints.
 */
export function LockScreenSlice({
  banner,
  alt,
  timeAgo,
  reserve,
  compact = false,
  className = "",
}: Readonly<{ banner: Banner; alt: string; timeAgo: string; reserve?: string; compact?: boolean; className?: string }>) {
  return (
    <div
      role="img"
      aria-label={alt}
      className={`relative w-full overflow-hidden rounded-[20px] bg-[var(--background-subtle)] text-left ${
        compact ? "flex flex-col justify-center p-3 sm:p-4" : "px-4 pt-6 pb-5 sm:px-5"
      } ${className}`}
    >
      {!compact && (
        <p
          aria-hidden
          className="mb-4 text-center text-[56px] leading-none tracking-tight text-[var(--foreground)]"
          style={{ fontWeight: 200 }}
        >
          9:41
        </p>
      )}
      <div aria-hidden className="grid w-full">
        {reserve !== undefined && (
          <div className="invisible col-start-1 row-start-1">
            <LockScreenNotification {...shopBanner({ ...banner, body: reserve })} timeAgo={timeAgo} />
          </div>
        )}
        <div className="col-start-1 row-start-1 self-start">
          <LockScreenNotification {...shopBanner(banner)} timeAgo={timeAgo} />
        </div>
      </div>
    </div>
  );
}

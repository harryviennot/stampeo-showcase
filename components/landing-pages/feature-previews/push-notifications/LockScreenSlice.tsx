import type { Banner } from "@/lib/landing-pages/copy/types";
import { LockScreenNotification } from "../../platform/LockScreenNotification";
import { lpBanner } from "../../shared/banner";

/**
 * A sample-shop notification as one picture, read out by who sent it and what it says.
 * The `pane` size is the top of a lock screen: the clock over iOS's dark notification, on
 * the page's warm grey tray. The `thumb` size is the notification alone, straight on the
 * page as Platform shows it, for a small drawing that a caller scales down.
 */
export function LockScreenSlice({
  banner,
  size = "pane",
}: Readonly<{ banner: Banner; size?: "pane" | "thumb" }>) {
  const thumb = size === "thumb";

  return (
    <div
      role="img"
      aria-label={`Lock screen notification from ${banner.sender}: ${banner.body}`}
      className={`relative w-full text-left ${
        thumb
          ? "flex h-full items-center"
          : "max-w-[440px] overflow-hidden rounded-[28px] bg-[var(--background-subtle)] px-5 pt-7 pb-6 lg:px-6"
      }`}
    >
      {!thumb && (
        <p
          aria-hidden
          className="mb-5 text-center text-[64px] leading-none tracking-tight text-[var(--foreground)]"
          style={{ fontWeight: 200 }}
        >
          9:41
        </p>
      )}
      <div aria-hidden className="w-full">
        <LockScreenNotification {...lpBanner(banner)} />
      </div>
    </div>
  );
}

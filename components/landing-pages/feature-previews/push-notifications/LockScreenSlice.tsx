import type { Banner } from "@/lib/landing-pages/copy/types";
import { LockScreenNotification } from "../../platform/LockScreenNotification";
import { lpBanner } from "../../shared/banner";

/** The deep blue wallpaper of the product's own lock-screen demo, for iOS's dark notification to sit on. */
const WALLPAPER = "linear-gradient(to bottom, #1a1a2e, #16213e 55%, #0f3460)";

/**
 * The top of a phone's lock screen with one sample-shop notification on it, read out as a
 * single picture. The `thumb` size is for a small drawing (the clock goes, the padding
 * tightens) that a caller scales down.
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
      className={`relative w-full overflow-hidden text-left ${
        thumb ? "h-full rounded-[22px] px-3.5 pt-5" : "max-w-[440px] rounded-[28px] px-5 pt-7 pb-6 lg:px-6"
      }`}
      style={{ background: WALLPAPER }}
    >
      {!thumb && (
        <p
          aria-hidden
          className="mb-5 text-center text-[64px] leading-none tracking-tight text-white"
          style={{ fontWeight: 200, textShadow: "0 1px 8px rgba(0,0,0,0.3)" }}
        >
          9:41
        </p>
      )}
      <div aria-hidden>
        <LockScreenNotification {...lpBanner(banner)} />
      </div>
    </div>
  );
}

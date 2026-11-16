import { PaperPlaneIcon } from "@/components/icons";
import { PROMOTIONAL_CAMPAIGNS_PREVIEW as COPY } from "@/lib/landing-pages/copy/previews/promotional-campaigns";
import { LockScreenNotification } from "../../platform/LockScreenNotification";
import { EYEBROW } from "../../shared/LpSection";
import { shopBanner } from "../ShopIcon";

/** Three customers' wallpapers: each phone is its owner's own. */
const WALLPAPERS = [
  "linear-gradient(180deg, #1a1a2e 0%, #16213e 55%, #0f3460 100%)",
  "linear-gradient(180deg, #e9a15f 0%, #c1506c 55%, #43296a 100%)",
  "linear-gradient(180deg, #2f7068 0%, #1d4a52 55%, #10263a 100%)",
] as const;

/** A dashed line in the colour of the timeline's rail. */
const DASH = "border-dashed border-[var(--near-black)]/35";

/** The message as the owner wrote it, on a white card with the paper plane that sends it. */
function Source() {
  const { visual } = COPY.how;

  return (
    <div className="relative mx-auto w-full max-w-[460px] rounded-[24px] bg-white p-5 pr-16 text-left shadow-[0_2px_4px_rgba(25,18,16,0.04),0_24px_56px_-28px_rgba(25,18,16,0.22)] ring-1 ring-black/5 sm:p-6 sm:pr-20">
      <p className={`${EYEBROW} text-[var(--muted-foreground)]`}>{visual.messageLabel}</p>
      <p className="mt-2 text-lg leading-snug font-semibold text-pretty text-[var(--foreground)]">{COPY.heroBanner.body}</p>
      <span
        aria-hidden
        className="absolute top-5 right-5 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent)] text-white sm:top-6 sm:right-6"
      >
        <PaperPlaneIcon size={18} weight="fill" aria-hidden />
      </span>
    </div>
  );
}

/** One line down from the message; from `lg` it forks to the three lock screens. */
function Branch() {
  return (
    <div aria-hidden className="relative mx-auto h-9 w-full lg:h-[60px]">
      <span className={`absolute top-0 left-1/2 h-9 -translate-x-px border-l-[1.5px] ${DASH} lg:h-7`} />
      <span
        className={`absolute top-7 right-[calc(16.667%-8px)] left-[calc(16.667%-8px)] hidden border-t-[1.5px] ${DASH} lg:block`}
      />
      {["calc(16.667% - 8px)", "50%", "calc(83.333% + 8px)"].map((left) => (
        <span key={left} className="absolute top-7 hidden h-7 lg:block" style={{ left }}>
          <span className={`absolute inset-y-0 left-0 -translate-x-px border-l-[1.5px] ${DASH}`} />
          <span className="absolute bottom-0 left-0 h-2 w-2 -translate-x-1/2 translate-y-1/2 rounded-full bg-[var(--near-black)]/35" />
        </span>
      ))}
    </div>
  );
}

/** One customer's lock screen: the label above it, a wallpaper, the clock and the message as a notification from the shop. */
function LockTile({ label, wallpaper }: Readonly<{ label: string; wallpaper: string }>) {
  return (
    <div>
      <p className={`${EYEBROW} mb-2 text-center text-[var(--muted-foreground)]`}>{label}</p>
      <div
        className="overflow-hidden rounded-[28px] p-3 shadow-[0_24px_48px_-28px_rgba(25,18,16,0.5)] ring-1 ring-black/10 sm:p-4 sm:pt-6 sm:pb-4"
        style={{ background: wallpaper }}
      >
        <p className="mb-4 text-center text-[44px] leading-none tracking-tight text-white max-sm:hidden" style={{ fontWeight: 200 }}>
          9:41
        </p>
        <LockScreenNotification {...shopBanner(COPY.heroBanner)} />
      </div>
    </div>
  );
}

/**
 * One message written once, and the same notification on three customers' lock screens: the message on a white
 * card, a line forking from it, and a lock screen for each, labelled by the phone it is. It is read out as one
 * picture; a phone shows the three in a column, from `lg` they stand in a row under the fork.
 */
export function MessageToLockScreens() {
  return (
    <div role="img" aria-label={COPY.how.alt} className="mx-auto max-w-[1040px]">
      <div aria-hidden>
        <Source />
        <Branch />
        <div className="mx-auto grid max-w-[460px] gap-5 lg:max-w-none lg:grid-cols-3 lg:gap-6">
          {COPY.how.visual.phones.map((label, index) => (
            <LockTile key={`${label}-${index}`} label={label} wallpaper={WALLPAPERS[index]} />
          ))}
        </div>
      </div>
    </div>
  );
}

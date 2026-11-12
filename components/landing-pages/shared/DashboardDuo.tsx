import Image from "next/image";
import type { CSSProperties } from "react";
import { getTranslations } from "next-intl/server";
import { PhoneScreenshot } from "@/components/ui/PhoneScreenshot";
import { landingShot } from "@/lib/landing/dashboard-shots";
import { SHARED } from "@/lib/landing-pages/copy/shared";

/** On a narrow screen the phone is 116px wide (237px tall) and overhangs the frame by 58px. */
const PHONE_OVERHANG = 58;
const PHONE_HEIGHT = 237;
/** The frame's browser bar, and the capture's aspect ratio (2560 by 1600). */
const BAR = 22;
const CAPTURE_RATIO = 1.6;

/**
 * The dashboard on a computer and on a phone: the desktop capture in a browser
 * frame, the phone capture overlapping its bottom-right edge, at every width.
 * Sized by the box it sits in (container queries), with "Sample data" under it
 * unless `caption` is false; `priority` is for the one in a hero.
 */
export async function DashboardDuo({
  priority = false,
  caption = true,
}: Readonly<{ priority?: boolean; caption?: boolean }>) {
  const t = await getTranslations("variant.dashboard");
  const desktop = landingShot("en", "desktop");
  const phone = landingShot("en", "phone");

  return (
    <figure className="@container mx-auto w-full max-w-[1120px]">
      {/* The phone is taller than a narrow frame: the figure leaves room above for what it overhangs. */}
      <div
        className="relative pt-[var(--duo-lift)] pr-[58px] @2xl:pt-0 @2xl:pr-16 @4xl:pr-20 @min-[1080px]:pr-24"
        style={
          {
            "--duo-lift": `max(0px, calc(${PHONE_HEIGHT}px - (100cqw - ${PHONE_OVERHANG}px) / ${CAPTURE_RATIO} - ${BAR}px))`,
          } as CSSProperties
        }
      >
        <div className="overflow-hidden rounded-xl bg-[var(--paper-hover)] shadow-[0_2px_4px_rgba(25,18,16,0.04),0_32px_72px_-24px_rgba(25,18,16,0.22)] ring-1 ring-[var(--border)] @2xl:rounded-2xl @4xl:rounded-[20px]">
          <div className="flex h-[22px] items-center gap-1.5 border-b border-[var(--border)] bg-white px-2.5 @2xl:h-7 @2xl:gap-2 @2xl:px-4">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-black/15 @2xl:h-2.5 @2xl:w-2.5" />
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-black/15 @2xl:h-2.5 @2xl:w-2.5" />
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-black/15 @2xl:h-2.5 @2xl:w-2.5" />
            <span className="mx-auto rounded-full bg-[var(--background-subtle)] px-3 py-px text-[9px] font-medium text-[var(--muted-foreground)] @2xl:px-4 @2xl:text-xs">
              {SHARED.dashboardUrl}
            </span>
            <span aria-hidden className="w-[33px] @2xl:w-[46px]" />
          </div>
          <Image
            src={desktop.src}
            width={desktop.width}
            height={desktop.height}
            alt={t("alt.desktop")}
            sizes="(min-width: 1280px) 1024px, (min-width: 1024px) 880px, (min-width: 768px) 660px, 300px"
            className="block h-auto w-full"
            {...(priority ? { loading: "eager", fetchPriority: "high" } : {})}
          />
        </div>

        {/* The bezel's PNG leaves 7 pt under the device: the small negative offset puts the device itself on the frame's bottom edge. */}
        <div className="absolute right-0 -bottom-[2px] origin-bottom-right scale-[0.414] @2xl:scale-[0.45] @4xl:scale-[0.6] @min-[1080px]:scale-[0.7]">
          <PhoneScreenshot src={phone.src} alt={t("alt.phone")} eager={priority} />
        </div>
      </div>
      {caption && (
        <figcaption className="mt-4 text-center text-sm text-[var(--muted-foreground)]">
          {SHARED.sampleData} · {SHARED.dashboardPlans}
        </figcaption>
      )}
    </figure>
  );
}

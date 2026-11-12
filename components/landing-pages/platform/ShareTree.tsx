import type { Icon } from "@phosphor-icons/react";
import type { CSSProperties } from "react";
import { FacebookIcon, GlobeIcon, GoogleLogoIcon, InstagramIcon, PrinterIcon, QRCodeIcon } from "@/components/icons";
import { StampeoLogo } from "@/components/logo";
import { PLATFORM } from "@/lib/landing-pages/copy/platform";
import { LpSection } from "../shared/LpSection";
import { ScrollFill } from "./ScrollFill";

/** One icon per channel of `PLATFORM.share.channels`, in the same order: places a link or a code goes. */
export const SHARE_ICONS: Icon[] = [PrinterIcon, QRCodeIcon, InstagramIcon, FacebookIcon, GlobeIcon, GoogleLogoIcon];

/** The tree is drawn in a 1000 by 470 box: the root at the top, a branch to the foot of each channel. */
const BOX = { width: 1000, height: 470 };
const ROOT_Y = 76;
const NODE_Y = 332;

/** A branch is a cubic curve that leaves the root straight down and lands straight down on its channel. */
const branch = (toX: number) =>
  `M${BOX.width / 2} ${ROOT_Y} C${BOX.width / 2} ${ROOT_Y + 130} ${toX} ${NODE_Y - 130} ${toX} ${NODE_Y}`;

/** Each channel sits in its own sixth of the width. */
const columns = PLATFORM.share.channels.map((_, index) => ((index + 0.5) / PLATFORM.share.channels.length) * BOX.width);

/** The accent part of a branch runs from the root as far as `--fill` says (strokes carry pathLength 1). */
const FILLED: CSSProperties = { strokeDasharray: 1, strokeDashoffset: "calc(1 - var(--fill, 1))" };

/** A row's stub on the phone's trunk turns orange once the trunk's fill passes the row, `--at` along it. */
const STUB_FILL = "clamp(0, (var(--fill, 1) - var(--at)) * 20, 1)";

/**
 * "Put your card where customers already are": the Stampeo mark at the top, a
 * branch to each place a link or a code goes. The branches fill in orange from
 * the root as the page scrolls past (whole for readers who ask for less motion).
 * Below a laptop it is a trunk down the left with a row per channel, filling
 * the same way.
 */
export function ShareTree() {
  const { channels } = PLATFORM.share;

  return (
    <LpSection
      section="share"
      eyebrow={PLATFORM.share.eyebrow}
      title={PLATFORM.share.title}
      lead={PLATFORM.share.lead}
      align="center"
    >
      <ScrollFill className="relative mx-auto max-w-[520px] lg:aspect-[1000/470] lg:max-w-[960px]">
        <svg
          viewBox={`0 0 ${BOX.width} ${BOX.height}`}
          fill="none"
          aria-hidden
          className="absolute inset-0 hidden h-full w-full lg:block"
        >
          {columns.map((x) => (
            <path key={`line-${x}`} d={branch(x)} className="stroke-[var(--border)]" strokeWidth={2} />
          ))}
          {columns.map((x) => (
            <path
              key={`lead-${x}`}
              d={branch(x)}
              pathLength={1}
              style={FILLED}
              className="stroke-[var(--accent)]"
              strokeWidth={2}
              strokeLinecap="round"
            />
          ))}
        </svg>

        <div className="flex items-center gap-3 lg:absolute lg:top-0 lg:left-1/2 lg:-translate-x-1/2">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-[var(--accent)] shadow-sm ring-1 ring-black/5 [&_svg]:h-8 [&_svg]:w-8">
            <StampeoLogo />
          </span>
        </div>

        <ul
          className={[
            "relative mt-2 flex flex-col gap-4 pl-[84px] lg:static lg:mt-0 lg:block lg:pl-0",
            "before:absolute before:top-0 before:bottom-6 before:left-[27px] before:w-0.5 before:rounded-full before:content-[''] lg:before:hidden",
            "before:[background:linear-gradient(to_bottom,var(--accent)_calc(var(--fill,1)*100%),var(--border)_0)]",
          ].join(" ")}
        >
          {channels.map((channel, index) => {
            const Icon = SHARE_ICONS[index];

            return (
              <li
                key={channel.title}
                style={
                  {
                    "--x": `${(columns[index] / BOX.width) * 100}%`,
                    "--at": (index + 0.4) / (channels.length - 0.2),
                    "--on": STUB_FILL,
                  } as CSSProperties
                }
                className="relative flex items-center gap-4 before:absolute before:top-1/2 before:-left-[57px] before:h-0.5 before:w-[57px] before:[background:linear-gradient(to_right,var(--accent)_calc(var(--on)*100%),var(--border)_0)] before:content-[''] lg:absolute lg:top-[70.6%] lg:left-[var(--x)] lg:w-[170px] lg:-translate-x-1/2 lg:flex-col lg:gap-3 lg:text-center lg:before:hidden"
              >
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-[var(--foreground)] shadow-sm ring-1 ring-black/5 lg:h-16 lg:w-16">
                  <Icon size={26} weight="regular" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block text-base font-semibold text-[var(--foreground)]">{channel.title}</span>
                  <span className="mt-0.5 block text-sm text-pretty text-[var(--muted-foreground)]">{channel.body}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </ScrollFill>
    </LpSection>
  );
}

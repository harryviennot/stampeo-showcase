import type { CSSProperties } from "react";
import { FacebookIcon, GlobeIcon, GoogleLogoIcon, InstagramIcon, PrinterIcon, QRCodeIcon } from "@/components/icons";
import { StampeoLogo } from "@/components/logo";
import { PLATFORM } from "@/lib/landing-pages/copy/platform";
import { LpSection } from "../shared/LpSection";

/** One icon per channel of `PLATFORM.share.channels`, in the same order: places a link or a code goes. */
export const SHARE_ICONS = [PrinterIcon, QRCodeIcon, InstagramIcon, FacebookIcon, GlobeIcon, GoogleLogoIcon];

/** The tree is drawn in a 1000 by 470 box: the root at the top, a branch to the foot of each channel. */
const BOX = { width: 1000, height: 470 };
const ROOT_Y = 76;
const NODE_Y = 332;
/** How much of each branch, from the root, is drawn in the accent colour. */
const ACCENT_SHARE = 0.3;

type Point = [number, number];

const lerp = (a: Point, b: Point, t: number): Point => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

/** A branch is a cubic curve that leaves the root straight down and lands straight down on its channel. */
function branch(toX: number): [Point, Point, Point, Point] {
  return [
    [BOX.width / 2, ROOT_Y],
    [BOX.width / 2, ROOT_Y + 130],
    [toX, NODE_Y - 130],
    [toX, NODE_Y],
  ];
}

const path = ([a, b, c, d]: Point[]) => `M${a} C${b} ${c} ${d}`;

/** The first `t` of a cubic curve, as a cubic curve (de Casteljau). */
function head([p0, p1, p2, p3]: Point[], t: number): Point[] {
  const ab = lerp(p0, p1, t);
  const bc = lerp(p1, p2, t);
  const cd = lerp(p2, p3, t);
  const abc = lerp(ab, bc, t);
  const bcd = lerp(bc, cd, t);
  return [p0, ab, abc, lerp(abc, bcd, t)];
}

/** Each channel sits in its own sixth of the width. */
const columns = PLATFORM.share.channels.map((_, index) => ((index + 0.5) / PLATFORM.share.channels.length) * BOX.width);

/**
 * "Put your card where customers already are": the Stampeo mark at the top,
 * a branch to each place a link or a code goes. The branches draw in once when
 * the section reveals (still for readers who ask for less motion). Below a laptop
 * it is a trunk down the left with a row per channel.
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
      <div className="relative mx-auto max-w-[520px] lg:aspect-[1000/470] lg:max-w-[960px]">
        <svg
          viewBox={`0 0 ${BOX.width} ${BOX.height}`}
          fill="none"
          aria-hidden
          className="ink-draw absolute inset-0 hidden h-full w-full lg:block"
        >
          {columns.map((x) => (
            <path key={`line-${x}`} d={path(branch(x))} pathLength={1} className="stroke-[var(--border)]" strokeWidth={2} />
          ))}
          {columns.map((x) => (
            <path
              key={`lead-${x}`}
              d={path(head(branch(x), ACCENT_SHARE))}
              pathLength={1}
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
            "before:[background:linear-gradient(to_bottom,var(--accent)_0,var(--accent)_14%,var(--border)_14%)]",
          ].join(" ")}
        >
          {channels.map((channel, index) => {
            const Icon = SHARE_ICONS[index];

            return (
              <li
                key={channel.title}
                style={{ "--x": `${(columns[index] / BOX.width) * 100}%` } as CSSProperties}
                className="relative flex items-center gap-4 before:absolute before:top-1/2 before:-left-[57px] before:h-0.5 before:w-[57px] before:bg-[var(--border)] before:content-[''] lg:absolute lg:top-[70.6%] lg:left-[var(--x)] lg:w-[170px] lg:-translate-x-1/2 lg:flex-col lg:gap-3 lg:text-center lg:before:hidden"
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
      </div>
    </LpSection>
  );
}

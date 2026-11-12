"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { IPhone } from "@/components/ui/IPhone";
import { ScaledBox } from "@/components/ui/ScaledBox";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { iphoneLayout } from "@/lib/devices/iphone";
import { SCANNER_LOOP, scannerLoopFiles, type ScannerLoopFiles } from "@/lib/videos/scanner-loop";

/** The phone is drawn 280px wide and shrunk to the `width` asked for. */
const DRAWN_WIDTH = 280;

/** What shows behind the video before it has a frame (the app's header) and behind the still. */
const BACKGROUND = { loop: "#492c2a", still: "#f6f4f5" };

type Media = Readonly<{ files: ScannerLoopFiles; label: string }>;

/** A muted loop that plays only while some of it is on screen and not inside an `inert` (hidden) tab. */
export function LoopVideo({ files, label }: Media) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    let inView = false;
    const sync = () => {
      if (inView && !video.closest("[inert]")) void video.play().catch(() => {});
      else video.pause();
    };
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    const tabs = new MutationObserver(sync);
    observer.observe(video);
    tabs.observe(document.body, { attributes: true, attributeFilter: ["inert"], subtree: true });
    return () => {
      observer.disconnect();
      tabs.disconnect();
    };
  }, []);

  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      disablePictureInPicture
      preload="metadata"
      poster={files.first}
      width={SCANNER_LOOP.width}
      height={SCANNER_LOOP.height}
      role="img"
      aria-label={label}
      className="absolute inset-0 h-full w-full object-cover"
    >
      <source src={files.webm} type="video/webm" />
      <source src={files.mp4} type="video/mp4" />
    </video>
  );
}

/** The loop's frame as a picture; the files are small webps, so they are served as they are. */
function Frame({ src, label, eager }: Readonly<{ src: string; label: string; eager: boolean }>) {
  const load = eager ? ({ loading: "eager", fetchPriority: "high" } as const) : {};

  return (
    <Image
      unoptimized
      src={src}
      alt={label}
      width={SCANNER_LOOP.width}
      height={SCANNER_LOOP.height}
      className="absolute inset-0 h-full w-full object-cover"
      {...load}
    />
  );
}

/** How far below the screen (or above it) the video is mounted: close enough to be ready when it scrolls in. */
const NEAR = "300px";

/** The first frame until the loop is within `NEAR` of the screen, then the video: a loop far down a page fetches nothing. */
function LazyLoop({ files, label, eager }: Media & Readonly<{ eager: boolean }>) {
  const box = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const element = box.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setNear(true);
        observer.disconnect();
      },
      { rootMargin: NEAR },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={box} className="absolute inset-0">
      {near ? <LoopVideo files={files} label={label} /> : <Frame src={files.first} label={label} eager={eager} />}
    </div>
  );
}

/** The loop on an iPhone `width` px wide, or, with `still`, its success frame and no video. */
export function ScannerLoopPhone({
  width,
  still,
  files,
  label,
  eager = false,
}: Media & Readonly<{ width: number; still: boolean; eager?: boolean }>) {
  return (
    <IPhone width={width} statusBar="light" screenBackground={still ? BACKGROUND.still : BACKGROUND.loop} eager={eager}>
      {still ? (
        <Frame src={files.still} label={label} eager={eager} />
      ) : (
        <LazyLoop files={files} label={label} eager={eager} />
      )}
    </IPhone>
  );
}

/**
 * The Scanner app adding a stamp, as an 8-second muted loop on an iPhone, in
 * the page's locale (the English render where the locale has none yet). It is
 * drawn at 280px and shrunk to `width` (`narrowWidth` below `lg`), so it never
 * resizes on hydration. The page serves the first frame and the video mounts as
 * the phone nears the screen; a reader who asks for less motion gets the success
 * frame instead and never downloads the video. `eager` is for a page's hero.
 */
export function ScannerLoop({
  width = DRAWN_WIDTH,
  narrowWidth,
  eager = false,
}: Readonly<{ width?: number; narrowWidth?: number; eager?: boolean }>) {
  const reduced = usePrefersReducedMotion();
  const files = scannerLoopFiles(useLocale());
  const label = useTranslations("common.scannerLoop")("label");

  return (
    <ScaledBox width={DRAWN_WIDTH} height={iphoneLayout(DRAWN_WIDTH).height} to={width} narrowTo={narrowWidth}>
      <ScannerLoopPhone width={DRAWN_WIDTH} still={reduced} files={files} label={label} eager={eager} />
    </ScaledBox>
  );
}

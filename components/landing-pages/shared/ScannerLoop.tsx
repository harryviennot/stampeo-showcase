"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { IPhone } from "@/components/ui/IPhone";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { iphoneLayout } from "@/lib/devices/iphone";
import { ScaledBox } from "./ScaledBox";
import { SCANNER_LOOP } from "./scanner-loop";

/** The phone is drawn 280px wide and shrunk to the `width` asked for. */
const DRAWN_WIDTH = 280;

/** What shows behind the video before it has a frame (the app's header) and behind the still. */
const BACKGROUND = { loop: "#492c2a", still: "#f6f4f5" };

/** A muted loop that plays only while some of it is on screen and not inside an `inert` (hidden) tab. */
export function LoopVideo() {
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
      poster={SCANNER_LOOP.first}
      width={SCANNER_LOOP.width}
      height={SCANNER_LOOP.height}
      role="img"
      aria-label={SCANNER_LOOP.label}
      className="absolute inset-0 h-full w-full object-cover"
    >
      <source src={SCANNER_LOOP.webm} type="video/webm" />
      <source src={SCANNER_LOOP.mp4} type="video/mp4" />
    </video>
  );
}

/** The loop's frame as a picture; the files are small webps, so they are served as they are. */
function Frame({ src }: Readonly<{ src: string }>) {
  return (
    <Image
      unoptimized
      src={src}
      alt={SCANNER_LOOP.label}
      width={SCANNER_LOOP.width}
      height={SCANNER_LOOP.height}
      className="absolute inset-0 h-full w-full object-cover"
    />
  );
}

/** How far below the screen (or above it) the video is mounted: close enough to be ready when it scrolls in. */
const NEAR = "300px";

/** The first frame until the loop is within `NEAR` of the screen, then the video: a loop far down a page fetches nothing. */
function LazyLoop() {
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
      {near ? <LoopVideo /> : <Frame src={SCANNER_LOOP.first} />}
    </div>
  );
}

/** The loop on an iPhone `width` px wide, or, with `still`, its success frame and no video. */
export function ScannerLoopPhone({ width, still }: Readonly<{ width: number; still: boolean }>) {
  return (
    <IPhone width={width} statusBar="light" screenBackground={still ? BACKGROUND.still : BACKGROUND.loop}>
      {still ? <Frame src={SCANNER_LOOP.still} /> : <LazyLoop />}
    </IPhone>
  );
}

/**
 * The Scanner app adding a stamp, as an 8-second muted loop on an iPhone. It is
 * drawn at 280px and shrunk to `width` (`narrowWidth` below `lg`), so it never
 * resizes on hydration. The page serves the first frame and the video mounts as
 * the phone nears the screen; a reader who asks for less motion gets the success
 * frame instead and never downloads the video.
 */
export function ScannerLoop({ width = DRAWN_WIDTH, narrowWidth }: Readonly<{ width?: number; narrowWidth?: number }>) {
  const reduced = usePrefersReducedMotion();

  return (
    <ScaledBox width={DRAWN_WIDTH} height={iphoneLayout(DRAWN_WIDTH).height} to={width} narrowTo={narrowWidth}>
      <ScannerLoopPhone width={DRAWN_WIDTH} still={reduced} />
    </ScaledBox>
  );
}

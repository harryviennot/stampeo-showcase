"use client";

import { useEffect, useRef, type ReactNode } from "react";
import {
  animate,
  backOut,
  easeIn,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import { useTranslations } from "next-intl";
import { IPhone } from "@/components/ui/IPhone";
import { NotificationBanner } from "@/components/features/notifications-push/NotificationBanner";
import { FADE_END, FADE_START, LOOP, NOTIFY_T, POSTER_T } from "@/lib/feature-pages/geolocation/geofence-walk";
import { GeofenceMap } from "./GeofenceMap";

const linear = (v: number) => v;

/* Dusk over the city: dark at the top so the white clock and status bar
   read, warming to the brand orange at the bottom. Both phones on the page use it. */
export const LOCK_WALLPAPER =
  "radial-gradient(120% 60% at 50% 110%, #f0894e 0%, rgba(240,137,78,0) 62%), linear-gradient(180deg, #1c1613 0%, #2c201a 48%, #4f2c1d 100%)";

/**
 * The geolocation hero: a paper street map with the phone in front of it.
 * A customer walks into the shop's ring and the lock screen wakes with the
 * card's reminder. Children are positioned over the stage (the ink note).
 */
export function GeofencingHeroAnimation({ children }: Readonly<{ children?: ReactNode }>) {
  const t = useTranslations("features.geolocalisation");
  const stageRef = useRef<HTMLDivElement>(null);
  const inView = useInView(stageRef, { amount: 0.3 });
  const reduceMotion = useReducedMotion();
  const clock = useMotionValue(0);

  useEffect(() => {
    if (reduceMotion) {
      clock.set(POSTER_T);
      return;
    }
    if (!inView) return;
    clock.set(0);
    const controls = animate(clock, LOOP, { duration: LOOP, ease: "linear", repeat: Infinity });
    return () => controls.stop();
  }, [clock, inView, reduceMotion]);

  // Asleep until the notification wakes the screen, asleep again at the end.
  const screenDim = useTransform(
    clock,
    [NOTIFY_T - 0.05, NOTIFY_T + 0.3, FADE_START, FADE_END],
    [0.45, 0, 0, 0.45],
  );
  const bannerY = useTransform(
    clock,
    [NOTIFY_T, NOTIFY_T + 0.55, FADE_START, FADE_START + 0.45],
    [-90, 0, 0, -36],
    { ease: [backOut, linear, easeIn] },
  );
  const bannerOpacity = useTransform(
    clock,
    [NOTIFY_T, NOTIFY_T + 0.2, FADE_START, FADE_START + 0.4],
    [0, 1, 1, 0],
  );
  const bannerScale = useTransform(clock, [NOTIFY_T, NOTIFY_T + 0.45], [0.92, 1]);
  const buzz = useTransform(
    clock,
    [NOTIFY_T, NOTIFY_T + 0.06, NOTIFY_T + 0.12, NOTIFY_T + 0.18, NOTIFY_T + 0.24, NOTIFY_T + 0.3],
    [0, -1.4, 1.4, -1, 1, 0],
  );

  return (
    <div
      ref={stageRef}
      className="relative mx-auto aspect-[100/96] w-full max-w-[420px] sm:max-w-[500px] lg:max-w-none xl:max-w-[600px]"
    >
      {/* The map: a stamped paper card, set down slightly crooked */}
      <div className="absolute left-0 top-[8%] h-[84%] w-[74%] -rotate-[1.5deg]">
        <div className="card-stamp relative h-full w-full overflow-hidden rounded-[24px] bg-[var(--paper)]">
          <GeofenceMap t={clock} />
          <div className="paper-grain pointer-events-none absolute inset-0" />
        </div>
      </div>

      {/* The phone, outside the map's clip so its bezel is never cut. Scaled
          only, from its right edge; -mt is half its 572px height, so it sits
          centred. Each band keeps it at ~44% of the stage width. */}
      <div className="absolute right-0 top-1/2 z-10 -mt-[286px] origin-right scale-[0.47] min-[360px]:scale-[0.535] min-[390px]:scale-[0.6] sm:scale-[0.785] lg:scale-[0.69] xl:scale-[0.9]">
        <motion.div style={{ rotate: buzz }}>
          <IPhone statusBar="lock" eager>
            <div className="absolute inset-0" style={{ background: LOCK_WALLPAPER }} />

            <div className="relative z-10 flex flex-col items-center pt-[calc(var(--iphone-safe-top)+2rem)]">
              <div
                className="text-[72px] leading-none tracking-tight text-white"
                style={{ fontWeight: 200, textShadow: "0 1px 8px rgba(0,0,0,0.3)" }}
              >
                9:41
              </div>
              <div
                className="mt-1 text-[13px] font-medium text-white/75"
                style={{ textShadow: "0 1px 2px rgba(0,0,0,0.2)" }}
              >
                {t("demo.lockScreenDate")}
              </div>
            </div>

            <div className="relative z-10 mt-6 px-3">
              <motion.div style={{ y: bannerY, opacity: bannerOpacity, scale: bannerScale }}>
                <NotificationBanner
                  appName="Stampeo"
                  title={t("demo.notificationTitle")}
                  body={t("demo.notificationBody")}
                  timeAgo={t("demo.timeAgo")}
                  // Over this smooth wallpaper a backdrop blur adds nothing, and
                  // on the scaled phone Chrome paints a ghost of text through it.
                  className="bg-white/85! backdrop-blur-none!"
                />
              </motion.div>
            </div>

            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-20 bg-black"
              style={{ opacity: screenDim }}
            />
          </IPhone>
        </motion.div>
      </div>

      {children}
    </div>
  );
}

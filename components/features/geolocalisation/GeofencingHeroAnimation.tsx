"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { MapPinIcon } from "@/components/icons";
import { PhoneMockup } from "@/components/features/notifications-push/PhoneMockup";
import { NotificationBanner } from "@/components/features/notifications-push/NotificationBanner";

export function GeofencingHeroAnimation() {
  const t = useTranslations("features.geolocalisation");
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* CSS keyframe for the pulse */}
      <style>{`
        @keyframes geofence-pulse {
          0% { transform: scale(0.3); opacity: 0.45; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .geofence-ring {
          animation: geofence-pulse 3.6s cubic-bezier(0.2, 0, 0.2, 1) infinite;
          will-change: transform, opacity;
        }
        .geofence-ring:nth-child(2) { animation-delay: 1.2s; }
        .geofence-ring:nth-child(3) { animation-delay: 2.4s; }
      `}</style>

      {/* Map area */}
      <div
        className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#e8f5e9] via-[#f1f8e9] to-[#e0e0e0] aspect-square"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Faint street lines */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-0 right-0 h-[2px] bg-white/50" />
          <div className="absolute top-[60%] left-0 right-0 h-[2px] bg-white/50" />
          <div className="absolute top-0 bottom-0 left-[25%] w-[2px] bg-white/50" />
          <div className="absolute top-0 bottom-0 left-[55%] w-[2px] bg-white/50" />
          <div className="absolute top-0 bottom-0 left-[80%] w-[2px] bg-white/40" />
          <div className="absolute top-[45%] left-[10%] right-[30%] h-[2px] bg-white/40 rotate-[15deg]" />
        </div>

        {/* Pulsing geofence circles */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="geofence-ring absolute rounded-full"
              style={{
                width: 180,
                height: 180,
                boxShadow: "inset 0 0 0 2px var(--accent)",
                opacity: 0,
              }}
            />
          ))}

          {/* Center pin */}
          <div className="relative z-10 flex flex-col items-center">
            <motion.div
              animate={{ y: isHovered ? -4 : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <MapPinIcon className="w-12 h-12 text-[var(--accent)] drop-shadow-lg" />
            </motion.div>

            {/* Radius label on hover */}
            <motion.span
              className="mt-2 px-3 py-1 rounded-full bg-white/90 text-sm font-semibold text-[var(--foreground)] shadow-sm pointer-events-none"
              initial={false}
              animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 4 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {t("demo.radiusLabel")}
            </motion.span>
          </div>
        </div>

        {/* Phone mockup - bottom right */}
        <motion.div
          className="absolute bottom-4 right-4 z-20"
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
        >
          <div className="scale-[0.55] origin-bottom-right">
            <PhoneMockup showStatusBar={false}>
              {/* Lock screen wallpaper */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#e8e0f0] via-[#d4c8e8] to-[#b8a8d8]" />

              {/* Lock screen content */}
              <div className="relative z-10 flex flex-col items-center pt-8">
                <div
                  className="text-[64px] font-light text-white leading-none tracking-tight"
                  style={{ textShadow: "0 1px 4px rgba(0,0,0,0.1)" }}
                >
                  9:41
                </div>
                <div
                  className="text-[15px] font-medium text-white/80 mt-1"
                  style={{ textShadow: "0 1px 2px rgba(0,0,0,0.1)" }}
                >
                  {t("demo.lockScreenDate")}
                </div>
              </div>

              {/* Notification */}
              <motion.div
                className="relative z-10 px-3 mt-8"
                initial={{ y: -80, opacity: 0, scale: 0.9 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 24,
                  mass: 0.8,
                  delay: 1.5,
                }}
              >
                <NotificationBanner
                  appName="Stampeo"
                  title={t("demo.notificationTitle")}
                  body={t("demo.notificationBody")}
                  timeAgo={t("demo.timeAgo")}
                />
              </motion.div>
            </PhoneMockup>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

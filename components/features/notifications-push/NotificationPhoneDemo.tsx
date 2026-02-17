"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { PhoneMockup } from "./PhoneMockup";
import { NotificationBanner } from "./NotificationBanner";

export function NotificationPhoneDemo() {
  const t = useTranslations("features.notifications-push.demo");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Initial delay before first appearance
    const initialDelay = setTimeout(() => setIsVisible(true), 1200);
    return () => clearTimeout(initialDelay);
  }, []);

  useEffect(() => {
    if (!isVisible) {
      // When hidden, show again after 2s
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
    // When visible, hide after 3s
    const timer = setTimeout(() => setIsVisible(false), 3500);
    return () => clearTimeout(timer);
  }, [isVisible]);

  return (
    <PhoneMockup>
      {/* Lock screen wallpaper - subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#e8e0f0] via-[#d4c8e8] to-[#b8a8d8]" />

      {/* Lock screen content */}
      <div className="relative z-10 flex flex-col items-center pt-8">
        {/* Time */}
        <div className="text-[64px] font-thin text-white leading-none tracking-tight" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.1)" }}>
          9:41
        </div>
        <div className="text-[15px] font-medium text-white/80 mt-1" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.1)" }}>
          {t("lockScreenDate")}
        </div>
      </div>

      {/* Notification area */}
      <div className="relative z-10 px-3 mt-8">
        <AnimatePresence>
          {isVisible && (
            <motion.div
              initial={{ y: -80, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -60, opacity: 0, scale: 0.95 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 24,
                mass: 0.8,
              }}
            >
              <NotificationBanner
                appName="Stampeo"
                title={t("notificationTitle")}
                body={t("notificationBody")}
                timeAgo={t("timeAgo")}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PhoneMockup>
  );
}

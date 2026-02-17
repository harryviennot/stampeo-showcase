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
    const initialDelay = setTimeout(() => setIsVisible(true), 2000);
    return () => clearTimeout(initialDelay);
  }, []);

  useEffect(() => {
    if (!isVisible) {
      // Gap before next notification
      const timer = setTimeout(() => setIsVisible(true), 2500);
      return () => clearTimeout(timer);
    }
    // Notification holds — enough time to read
    const timer = setTimeout(() => setIsVisible(false), 5000);
    return () => clearTimeout(timer);
  }, [isVisible]);

  return (
    <PhoneMockup statusBarColor="white" showStatusBar={false}>
      {/* Lock screen wallpaper — deep dark gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f3460]" />

      {/* Subtle noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")" }} />

      {/* Lock screen content */}
      <div className="relative z-10 flex flex-col items-center pt-6">
        {/* Clock — iOS ultralight */}
        <div
          className="text-[72px] leading-none tracking-tight text-white"
          style={{
            fontWeight: 200,
            textShadow: "0 1px 8px rgba(0,0,0,0.3)",
          }}
        >
          9:41
        </div>
        <div
          className="text-[13px] font-medium text-white/70 mt-1"
          style={{ textShadow: "0 1px 2px rgba(0,0,0,0.2)" }}
        >
          {t("lockScreenDate")}
        </div>
      </div>

      {/* Notification area */}
      <div className="relative z-10 px-3 mt-6">
        <AnimatePresence>
          {isVisible && (
            <motion.div
              initial={{ y: -60, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -30, opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 26,
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

      {/* Bottom lock screen icons */}
      <div className="absolute bottom-8 left-0 right-0 z-10 flex items-center justify-between px-6">
        {/* Flashlight */}
        <div className="w-10 h-10 rounded-full backdrop-blur-xl bg-white/15 border border-white/10 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 2h6l1 7H8L9 2Z" />
            <rect x="8" y="9" width="8" height="12" rx="1" />
            <circle cx="12" cy="15" r="1" fill="white" />
          </svg>
        </div>
        {/* Camera */}
        <div className="w-10 h-10 rounded-full backdrop-blur-xl bg-white/15 border border-white/10 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 4h-5L7.5 6H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-3.5L14.5 4Z" />
            <circle cx="12" cy="13" r="3" />
          </svg>
        </div>
      </div>
    </PhoneMockup>
  );
}

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { PhoneMockup } from "./PhoneMockup";
import { NotificationBanner } from "./NotificationBanner";
import { WalletCard } from "@/components/card/WalletCard";
import { ScaledCardWrapper } from "@/components/card/ScaledCardWrapper";

const TABS = ["stamp", "milestone", "reward"] as const;
type TabKey = (typeof TABS)[number];

const tabStamps: Record<TabKey, number> = {
  stamp: 4,
  milestone: 7,
  reward: 8,
};

export function NotificationSequenceDemo() {
  const t = useTranslations("features.notifications-push.notificationTypes");
  const [activeTab, setActiveTab] = useState<TabKey>("stamp");
  const [isPaused, setIsPaused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);

  // Auto-advance tabs every 4s
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveTab((prev) => {
        const idx = TABS.indexOf(prev);
        return TABS[(idx + 1) % TABS.length];
      });
      setProgressKey((k) => k + 1);
    }, 4000);
    return () => clearInterval(timer);
  }, [isPaused]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
      {/* Phone demo */}
      <div className="flex justify-center order-1 lg:order-2">
        <PhoneMockup>
          {/* Light background */}
          <div className="absolute inset-0 bg-[#f2f2f7]" />

          <div className="relative z-10 flex flex-col h-full">
            {/* Mini wallet card */}
            <div className="px-3 pt-1">
              <ScaledCardWrapper baseWidth={280} targetWidth={240}>
                <WalletCard
                  design={{
                    organization_name: "Mon Café",
                    total_stamps: 8,
                    background_color: "#1c1c1e",
                    stamp_filled_color: "#f97316",
                    label_color: "#fff",
                    secondary_fields: [
                      { key: "reward", label: "Reward", value: "Café offert" },
                    ],
                  }}
                  stamps={tabStamps[activeTab]}
                  showQR={false}
                  showSecondaryFields={false}
                />
              </ScaledCardWrapper>
            </div>

            {/* Notification */}
            <div className="px-3 mt-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ y: -30, opacity: 0, scale: 0.95 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: 20, opacity: 0, scale: 0.95 }}
                  transition={{
                    type: "spring",
                    stiffness: 350,
                    damping: 28,
                  }}
                >
                  <NotificationBanner
                    appName="Stampeo"
                    title={t(`${activeTab}.notifTitle`)}
                    body={t(`${activeTab}.notifBody`)}
                    timeAgo={t(`${activeTab}.timeAgo`)}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </PhoneMockup>
      </div>

      {/* Tab descriptions */}
      <div className="order-2 lg:order-1">
        <div className="space-y-3">
          {TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setIsPaused(true);
                  // Resume auto-advance after 8s
                  setTimeout(() => setIsPaused(false), 8000);
                }}
                className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 ${
                  isActive
                    ? "bg-white border-[var(--accent)]/20 shadow-md shadow-[var(--accent)]/5"
                    : "bg-transparent border-transparent hover:bg-white/50"
                }`}
              >
                <div className="flex items-center gap-3 mb-1.5">
                  <div
                    className={`w-2 h-2 rounded-full transition-colors ${
                      isActive ? "bg-[var(--accent)]" : "bg-gray-300"
                    }`}
                  />
                  <h4
                    className={`text-base font-bold transition-colors ${
                      isActive
                        ? "text-[var(--foreground)]"
                        : "text-[var(--muted-foreground)]"
                    }`}
                  >
                    {t(`${tab}.title`)}
                  </h4>
                </div>
                <p
                  className={`text-sm leading-relaxed pl-5 transition-colors ${
                    isActive
                      ? "text-[var(--muted-foreground)]"
                      : "text-[var(--muted-foreground)]/60"
                  }`}
                >
                  {t(`${tab}.description`)}
                </p>

                {/* Progress bar for active tab */}
                {isActive && !isPaused && (
                  <div className="mt-3 ml-5 h-0.5 rounded-full bg-gray-200 overflow-hidden">
                    <motion.div
                      className="h-full bg-[var(--accent)] rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 4, ease: "linear" }}
                      key={`progress-${tab}-${progressKey}`}
                    />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

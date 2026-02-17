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
  const stamps = tabStamps[activeTab];

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
        <PhoneMockup statusBarStyle="time-only">
          {/* Light background */}
          <div className="absolute inset-0 bg-[#f2f2f7]" />

          <div className="relative z-10 flex flex-col h-full">
            {/* Mini wallet card */}
            <div className="px-3">
              <ScaledCardWrapper baseWidth={280} targetWidth={240}>
                <WalletCard
                  design={{
                    organization_name: "Mon Café",
                    total_stamps: 8,
                    background_color: "#1c1c1e",
                    stamp_filled_color: "#f97316",
                    label_color: "#fff",
                    secondary_fields: [
                      {
                        key: "reward",
                        label: "Reward",
                        value: "Café offert",
                      },
                    ],
                  }}
                  stamps={stamps}
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
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
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
        <div className="space-y-2">
          {TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setIsPaused(true);
                  setTimeout(() => setIsPaused(false), 8000);
                }}
                className="relative w-full text-left px-5 py-4 rounded-2xl"
              >
                {/* Animated background */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 bg-white shadow-sm rounded-2xl"
                    layoutId="active-tab-bg"
                    transition={{
                      type: "spring",
                      stiffness: 350,
                      damping: 30,
                    }}
                  />
                )}

                <div className="relative">
                  <div className="flex items-center gap-2.5 mb-1">
                    <div
                      className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${
                        isActive ? "bg-[var(--accent)]" : "bg-gray-300"
                      }`}
                    />
                    <h4
                      className={`text-sm font-semibold transition-colors duration-200 ${
                        isActive
                          ? "text-[var(--foreground)]"
                          : "text-[var(--muted-foreground)]"
                      }`}
                    >
                      {t(`${tab}.title`)}
                    </h4>
                  </div>
                  <p className="text-sm leading-relaxed text-[var(--muted-foreground)] pl-4 pt-0.5">
                    {t(`${tab}.description`)}
                  </p>

                  {/* Progress bar */}
                  {isActive && !isPaused && (
                    <div className="mt-3 ml-4 h-[2px] rounded-full bg-gray-100 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-[var(--accent)]/40"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 4, ease: "linear" }}
                        key={`progress-${tab}-${progressKey}`}
                      />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

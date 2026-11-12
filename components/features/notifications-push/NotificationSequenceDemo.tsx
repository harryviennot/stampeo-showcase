"use client";

import { useState, useEffect, type ComponentProps } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { IPhone } from "@/components/ui/IPhone";
import { NotificationBanner } from "./NotificationBanner";
import { WalletCard } from "@/components/card/WalletCard";
import { ScaledCardWrapper } from "@/components/card/ScaledCardWrapper";
import type { CardDesign } from "@/lib/types/design";

const TABS = ["stamp", "milestone", "reward"] as const;

const tabStamps: Record<(typeof TABS)[number], number> = {
  stamp: 4,
  milestone: 7,
  reward: 8,
};

/** One moment of the sequence: what the tab says, the card at that point, and the banner it sends. */
export interface SequenceMoment {
  key: string;
  title: string;
  description: string;
  /** The plans it comes with, as a small chip next to the title. */
  planLabel?: string;
  stamps: number;
  banner: ComponentProps<typeof NotificationBanner>;
}

const DEFAULT_DESIGN: Partial<CardDesign> = {
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
};

export function NotificationSequenceDemo({
  moments,
  design = DEFAULT_DESIGN,
  phoneClassName = "",
  fullCard = false,
}: Readonly<{
  /** The moments listed, with their banners; the three Stampeo defaults when omitted. */
  moments?: SequenceMoment[];
  /** The card on the lock screen's phone. */
  design?: Partial<CardDesign>;
  /** A class on the phone's column, e.g. to crop it. */
  phoneClassName?: string;
  /** The card's fields and QR code, so it reads as a whole pass. */
  fullCard?: boolean;
}>) {
  const t = useTranslations("features.notifications-push.notificationTypes");
  const items: SequenceMoment[] =
    moments ??
    TABS.map((tab) => ({
      key: tab,
      title: t(`${tab}.title`),
      description: t(`${tab}.description`),
      stamps: tabStamps[tab],
      banner: {
        appName: "Stampeo",
        title: t(`${tab}.notifTitle`),
        body: t(`${tab}.notifBody`),
        timeAgo: t(`${tab}.timeAgo`),
      },
    }));
  const keyList = items.map((item) => item.key).join("|");
  const [activeTab, setActiveTab] = useState(items[0].key);
  const [isPaused, setIsPaused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const active = items.find((item) => item.key === activeTab) ?? items[0];

  // Auto-advance tabs every 4s
  useEffect(() => {
    if (isPaused) return;
    const order = keyList.split("|");
    const timer = setInterval(() => {
      setActiveTab((prev) => order[(order.indexOf(prev) + 1) % order.length]);
      setProgressKey((k) => k + 1);
    }, 4000);
    return () => clearInterval(timer);
  }, [isPaused, keyList]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
      {/* Phone demo */}
      <div className={["flex justify-center order-1 lg:order-2", phoneClassName].filter(Boolean).join(" ")}>
        <IPhone statusBar="light">
          {/* Light background */}
          <div className="absolute inset-0 bg-[#f2f2f7]" />

          <div className="relative z-10 flex flex-col h-full pt-[calc(var(--iphone-safe-top)+0.5rem)]">
            {/* Mini wallet card */}
            <div className="px-3">
              <ScaledCardWrapper size="md">
                <WalletCard
                  design={design}
                  stamps={active.stamps}
                  showQR={fullCard}
                  showSecondaryFields={fullCard}
                />
              </ScaledCardWrapper>
            </div>

            {/* Notification */}
            <div className="px-3 mt-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active.key}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <NotificationBanner {...active.banner} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </IPhone>
      </div>

      {/* Tab descriptions */}
      <div className="order-2 lg:order-1">
        <div className="space-y-2">
          {items.map((item) => {
            const isActive = active.key === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  setActiveTab(item.key);
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
                      {item.title}
                    </h4>
                    {item.planLabel && (
                      <span className="shrink-0 rounded-full bg-[var(--background-subtle)] px-3 py-1 text-xs font-semibold text-[var(--foreground)] ring-1 ring-inset ring-[var(--border)]">
                        {item.planLabel}
                      </span>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed text-[var(--muted-foreground)] pl-4 pt-0.5">
                    {item.description}
                  </p>

                  {/* Progress bar */}
                  {isActive && !isPaused && (
                    <div className="mt-3 ml-4 h-[2px] rounded-full bg-gray-100 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-[var(--accent)]/40"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 4, ease: "linear" }}
                        key={`progress-${item.key}-${progressKey}`}
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

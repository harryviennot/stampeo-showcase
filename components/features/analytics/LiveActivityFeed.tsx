"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";

const FAKE_NAMES = [
  "Sophie M.",
  "Marc D.",
  "Claire T.",
  "Thomas R.",
  "Julie L.",
  "Antoine B.",
  "Emma G.",
  "Lucas P.",
  "Léa F.",
  "Hugo V.",
];

const AVATAR_COLORS = [
  "#8b5cf6",
  "#3b82f6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#6366f1",
  "#14b8a6",
];

interface FeedEvent {
  id: number;
  name: string;
  action: string;
  seconds: number;
  color: string;
}

export function LiveActivityFeed() {
  const t = useTranslations("features.analytiques.custom.activityFeed");
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const idRef = useRef(0);

  const actions = [t("stampAction"), t("rewardAction"), t("newCustomerAction")];

  const generateEvent = useCallback(() => {
    const name = FAKE_NAMES[Math.floor(Math.random() * FAKE_NAMES.length)];
    const action = actions[Math.floor(Math.random() * actions.length)];
    const color = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
    idRef.current += 1;
    const id = idRef.current;

    setEvents((evts) => [
      { id, name, action, seconds: 1, color },
      ...evts.slice(0, 4),
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Seed with 2 initial events
    generateEvent();
    const seedTimeout = setTimeout(() => generateEvent(), 200);

    const interval = setInterval(generateEvent, 2500);

    // Tick seconds
    const secondsInterval = setInterval(() => {
      setEvents((evts) =>
        evts.map((e) => ({ ...e, seconds: e.seconds + 1 }))
      );
    }, 1000);

    return () => {
      clearTimeout(seedTimeout);
      clearInterval(interval);
      clearInterval(secondsInterval);
    };
  }, [generateEvent]);

  return (
    <div className="blog-card-3d rounded-2xl bg-white overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3 border-b border-[var(--border)]">
        <span className="w-2 h-2 rounded-full bg-green-500 pulse-dot" />
        <span className="text-sm font-semibold text-[var(--foreground)]">
          {t("title")}
        </span>
      </div>
      <div className="p-4 space-y-2 min-h-[200px]">
        <AnimatePresence initial={false}>
          {events.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3 p-2 rounded-xl"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                style={{ backgroundColor: event.color }}
              >
                {event.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm text-[var(--foreground)]">
                  <span className="font-semibold">{event.name}</span>{" "}
                  {event.action}
                </span>
              </div>
              <span className="text-xs text-[var(--muted-foreground)] shrink-0">
                {t("timeAgo", { seconds: event.seconds })}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

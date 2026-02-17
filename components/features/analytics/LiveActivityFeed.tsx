"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

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

const MAX_VISIBLE = 5;
const ROW_HEIGHT = 48;

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
      ...evts.slice(0, MAX_VISIBLE),
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    generateEvent();
    const seedTimeout = setTimeout(() => generateEvent(), 200);

    const interval = setInterval(generateEvent, 2500);

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
    <section className="py-16 sm:py-24 bg-[var(--blog-bg)]">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: feed */}
          <ScrollReveal variant="left">
            <div className="blog-card-3d rounded-2xl bg-white overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-[var(--border)]">
                <span className="w-2 h-2 rounded-full bg-green-500 pulse-dot" />
                <span className="text-sm font-semibold text-[var(--foreground)]">
                  {t("title")}
                </span>
              </div>
              <div
                className="p-4 overflow-hidden"
                style={{ height: MAX_VISIBLE * ROW_HEIGHT + 16 }}
              >
                <AnimatePresence initial={false}>
                  {events.slice(0, MAX_VISIBLE).map((event) => (
                    <motion.div
                      key={event.id}
                      layout
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.3 }}
                      style={{ height: ROW_HEIGHT }}
                      className="flex items-center gap-3 px-2 rounded-xl"
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
          </ScrollReveal>

          {/* Right: text */}
          <ScrollReveal variant="right" delay={150}>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--foreground)] mb-4">
              {t("sectionTitle")}
            </h2>
            <p className="text-lg text-[var(--muted-foreground)] leading-relaxed">
              {t("sectionDescription")}
            </p>
          </ScrollReveal>
        </div>
      </Container>
    </section>
  );
}

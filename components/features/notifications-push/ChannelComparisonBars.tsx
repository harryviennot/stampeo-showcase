"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useTranslations } from "next-intl";

interface ChannelBar {
  name: string;
  rate: number;
  isAccent: boolean;
}

export function ChannelComparisonBars() {
  const t = useTranslations("features.notifications-push.channels");
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const channels: ChannelBar[] = [
    { name: t("email"), rate: 20, isAccent: false },
    { name: t("appPush"), rate: 30, isAccent: false },
    { name: t("sms"), rate: 45, isAccent: false },
    { name: t("wallet"), rate: 85, isAccent: true },
  ];

  return (
    <div ref={ref} className="space-y-5 max-w-2xl mx-auto">
      {channels.map((channel, index) => (
        <ChannelBarRow
          key={channel.name}
          channel={channel}
          delay={index * 0.15}
          isInView={isInView}
        />
      ))}
    </div>
  );
}

function ChannelBarRow({
  channel,
  delay,
  isInView,
}: {
  channel: ChannelBar;
  delay: number;
  isInView: boolean;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const startTime = Date.now();
    const delayMs = delay * 1000;
    const duration = 1200;

    const animate = () => {
      const elapsed = Date.now() - startTime - delayMs;
      if (elapsed < 0) {
        requestAnimationFrame(animate);
        return;
      }
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * channel.rate));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, channel.rate, delay]);

  return (
    <div className="flex items-center gap-4">
      <div className="w-24 sm:w-32 text-sm font-medium text-[var(--foreground)] text-right shrink-0">
        {channel.name}
      </div>
      <div className="flex-1 relative">
        <div className="h-10 rounded-full bg-[var(--muted)]/50 overflow-hidden">
          <motion.div
            className={`h-full rounded-full flex items-center justify-end pr-3 ${
              channel.isAccent
                ? "bg-[var(--accent)]"
                : "bg-gray-300"
            }`}
            initial={{ width: "0%" }}
            animate={isInView ? { width: `${channel.rate}%` } : { width: "0%" }}
            transition={{
              duration: 1.2,
              delay,
              ease: [0.25, 0.1, 0.25, 1],
            }}
          >
            <span
              className={`text-sm font-bold ${
                channel.isAccent ? "text-white" : "text-gray-600"
              }`}
            >
              ~{count}%
            </span>
          </motion.div>
        </div>
        {channel.isAccent && isInView && (
          <motion.div
            className="absolute inset-0 rounded-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{
              duration: 2,
              delay: delay + 1.2,
              repeat: Infinity,
              repeatDelay: 1,
            }}
            style={{
              boxShadow: "0 0 20px var(--accent), 0 0 40px var(--accent)",
            }}
          />
        )}
      </div>
    </div>
  );
}

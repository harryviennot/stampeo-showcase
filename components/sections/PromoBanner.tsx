"use client";

import { useState, useEffect, useCallback, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";

const CYCLE_INTERVAL = 4000;

export function PromoBanner({
  visible,
  onDismiss,
}: {
  visible: boolean;
  onDismiss: () => void;
}) {
  const t = useTranslations("common.promoBanner");
  const [index, setIndex] = useState(0);

  const bold = useCallback(
    (chunks: ReactNode) => (
      <span className="font-bold text-[var(--accent)]">{chunks}</span>
    ),
    []
  );

  const items = [
    t.rich("item1", { bold }),
    t.rich("item2", { bold }),
    t.rich("item3", { bold }),
    t.rich("item4", { bold }),
  ];

  useEffect(() => {
    if (!visible) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, CYCLE_INTERVAL);
    return () => clearInterval(timer);
  }, [visible, items.length]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 40, opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="overflow-hidden"
        >
          <a
            href="/programme-fondateur"
            className="relative h-10 flex items-center justify-center bg-black text-white overflow-hidden cursor-pointer group px-10"
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="text-xs sm:text-sm text-center leading-tight group-hover:underline decoration-white/40"
              >
                {items[index]}
              </motion.span>
            </AnimatePresence>
            {/* Dismiss button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDismiss();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-1 hover:bg-white/10 rounded transition-colors"
              aria-label={t("dismiss")}
            >
              <svg
                className="w-4 h-4 text-white/70"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

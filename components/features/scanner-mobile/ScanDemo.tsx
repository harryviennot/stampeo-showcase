"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { PhoneMockup } from "./PhoneMockup";

type Phase = "scanning" | "success" | "result" | "idle";

const PHASE_DURATIONS: Record<Phase, number> = {
  scanning: 1800,
  success: 800,
  result: 2400,
  idle: 400,
};

export function ScanDemo() {
  const t = useTranslations("features.scanner-mobile.custom.scanDemo");
  const [phase, setPhase] = useState<Phase>("scanning");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPhase((prev) => {
        const order: Phase[] = ["scanning", "success", "result", "idle"];
        const next = order[(order.indexOf(prev) + 1) % order.length];
        return next;
      });
    }, PHASE_DURATIONS[phase]);
    return () => clearTimeout(timeout);
  }, [phase]);

  return (
    <PhoneMockup>
      {/* Camera viewfinder background */}
      <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
        {/* Subtle camera noise pattern */}
        <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800" />

        {/* Viewfinder brackets */}
        <motion.div
          className="relative w-40 h-40"
          animate={{
            scale: phase === "scanning" ? [1, 0.92, 1] : phase === "success" ? 0.88 : 1,
          }}
          transition={{
            duration: phase === "scanning" ? 1.8 : 0.3,
            repeat: phase === "scanning" ? Infinity : 0,
            ease: "easeInOut",
          }}
        >
          {/* Corner brackets */}
          {[
            "top-0 left-0 border-t-2 border-l-2 rounded-tl-lg",
            "top-0 right-0 border-t-2 border-r-2 rounded-tr-lg",
            "bottom-0 left-0 border-b-2 border-l-2 rounded-bl-lg",
            "bottom-0 right-0 border-b-2 border-r-2 rounded-br-lg",
          ].map((pos, i) => (
            <div
              key={i}
              className={`absolute w-8 h-8 ${pos} ${
                phase === "success" ? "border-green-400" : "border-white/70"
              } transition-colors duration-300`}
            />
          ))}

          {/* QR code floating in */}
          <AnimatePresence>
            {(phase === "scanning" || phase === "success") && (
              <motion.div
                className="absolute inset-4 flex items-center justify-center"
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
              >
                {/* Simple QR code representation */}
                <div className="w-24 h-24 bg-white rounded-lg p-2 grid grid-cols-5 grid-rows-5 gap-0.5">
                  {Array.from({ length: 25 }).map((_, i) => {
                    const row = Math.floor(i / 5);
                    const col = i % 5;
                    const isFilled =
                      (row < 2 && col < 2) ||
                      (row < 2 && col > 2) ||
                      (row > 2 && col < 2) ||
                      (row === 2 && col === 2) ||
                      (row === 1 && col === 2) ||
                      (row === 3 && col === 3);
                    return (
                      <div
                        key={i}
                        className={`rounded-sm ${isFilled ? "bg-gray-900" : "bg-gray-100"}`}
                      />
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Green flash on success */}
          <AnimatePresence>
            {phase === "success" && (
              <motion.div
                className="absolute inset-0 bg-green-400/20 rounded-lg flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Animated checkmark */}
                <motion.svg
                  className="w-16 h-16 text-green-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <motion.path
                    d="M5 13l4 4L19 7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </motion.svg>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Result card sliding up */}
        <AnimatePresence>
          {phase === "result" && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 p-4"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <div className="bg-white rounded-2xl p-4 shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[var(--accent)] rounded-xl flex items-center justify-center text-white font-bold text-sm">
                    MD
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-gray-900">
                      {t("customerName")}
                    </p>
                    <p className="text-xs text-gray-500">{t("stampCount")}</p>
                  </div>
                  <div className="text-xs text-gray-400 font-mono">
                    {t("timer")}
                  </div>
                </div>
                {/* Stamp progress */}
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full ${
                        i < 5
                          ? "bg-[var(--accent)]"
                          : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
                {/* Toast */}
                <motion.div
                  className="bg-green-50 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-lg text-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {t("toast")}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scanning indicator */}
        {phase === "scanning" && (
          <motion.div
            className="absolute top-12 left-0 right-0 flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full">
              <motion.div
                className="w-2 h-2 bg-red-400 rounded-full"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
              <span className="text-white text-xs font-medium">Scanner...</span>
            </div>
          </motion.div>
        )}
      </div>
    </PhoneMockup>
  );
}

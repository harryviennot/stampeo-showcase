"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { PhoneMockup } from "./PhoneMockup";

type Phase = "scanning" | "success" | "result" | "idle";

const PHASE_DURATIONS: Record<Phase, number> = {
  scanning: 2000,
  success: 900,
  result: 2600,
  idle: 300,
};

export function ScanDemo() {
  const t = useTranslations("features.scanner-mobile.custom.scanDemo");
  const [phase, setPhase] = useState<Phase>("scanning");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPhase((prev) => {
        const order: Phase[] = ["scanning", "success", "result", "idle"];
        return order[(order.indexOf(prev) + 1) % order.length];
      });
    }, PHASE_DURATIONS[phase]);
    return () => clearTimeout(timeout);
  }, [phase]);

  return (
    <PhoneMockup>
      {/* Camera viewfinder */}
      <div className="absolute inset-0 bg-[#0a0a0a] flex flex-col">
        {/* Top bar with camera UI */}
        <div className="pt-14 px-5 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[var(--accent)]" />
            <span className="text-white/90 text-[11px] font-semibold tracking-wide">
              Stampeo
            </span>
          </div>
          <AnimatePresence>
            {phase === "scanning" && (
              <motion.div
                className="flex items-center gap-1.5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="w-1.5 h-1.5 bg-red-400 rounded-full"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <span className="text-white/60 text-[10px]">REC</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Viewfinder area */}
        <div className="flex-1 flex items-center justify-center relative px-6">
          {/* Dimmed edges */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40" />
          </div>

          {/* Viewfinder frame */}
          <motion.div
            className="relative w-44 h-44"
            animate={{
              scale:
                phase === "scanning"
                  ? [1, 0.95, 1]
                  : phase === "success"
                    ? 0.92
                    : 1,
            }}
            transition={{
              duration: phase === "scanning" ? 2 : 0.3,
              repeat: phase === "scanning" ? Infinity : 0,
              ease: "easeInOut",
            }}
          >
            {/* Corner brackets — thicker, more visible */}
            {[
              "top-0 left-0 border-t-[3px] border-l-[3px] rounded-tl-xl",
              "top-0 right-0 border-t-[3px] border-r-[3px] rounded-tr-xl",
              "bottom-0 left-0 border-b-[3px] border-l-[3px] rounded-bl-xl",
              "bottom-0 right-0 border-b-[3px] border-r-[3px] rounded-br-xl",
            ].map((pos, i) => (
              <motion.div
                key={i}
                className={`absolute w-10 h-10 ${pos} transition-colors duration-300`}
                style={{
                  borderColor:
                    phase === "success"
                      ? "#4ade80"
                      : "rgba(255,255,255,0.8)",
                }}
              />
            ))}

            {/* Scanning line */}
            <AnimatePresence>
              {phase === "scanning" && (
                <motion.div
                  className="absolute left-3 right-3 h-[2px] bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent"
                  initial={{ top: "15%", opacity: 0 }}
                  animate={{ top: ["15%", "85%"], opacity: [0, 1, 1, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              )}
            </AnimatePresence>

            {/* QR code */}
            <AnimatePresence>
              {(phase === "scanning" || phase === "success") && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ opacity: 0, y: 16, scale: 0.85 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  <div className="w-28 h-28 bg-white rounded-xl p-2.5 shadow-lg shadow-black/30">
                    <div className="w-full h-full grid grid-cols-7 grid-rows-7 gap-[2px]">
                      {Array.from({ length: 49 }).map((_, i) => {
                        const row = Math.floor(i / 7);
                        const col = i % 7;
                        // QR-like pattern: finder patterns in 3 corners + some data
                        const isFinderTL =
                          row < 3 && col < 3 && !(row === 1 && col === 1);
                        const isFinderTR =
                          row < 3 && col > 3 && !(row === 1 && col === 5);
                        const isFinderBL =
                          row > 3 && col < 3 && !(row === 5 && col === 1);
                        const isData =
                          (row === 3 && (col === 1 || col === 3 || col === 5)) ||
                          (row === 1 && col === 3) ||
                          (row === 5 && col === 5) ||
                          (row === 4 && col === 4) ||
                          (row === 6 && col === 4) ||
                          (row === 6 && col === 6);
                        const isFilled =
                          isFinderTL || isFinderTR || isFinderBL || isData;
                        return (
                          <div
                            key={i}
                            className={`rounded-[1px] ${isFilled ? "bg-gray-900" : "bg-gray-50"}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Green flash + checkmark */}
            <AnimatePresence>
              {phase === "success" && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center z-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="absolute inset-0 rounded-xl bg-green-400/15"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  />
                  <motion.div
                    className="w-14 h-14 rounded-full bg-green-500/90 flex items-center justify-center backdrop-blur-sm"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 15,
                    }}
                  >
                    <motion.svg
                      className="w-7 h-7 text-white"
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
                        transition={{ duration: 0.4, ease: "easeOut" }}
                      />
                    </motion.svg>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Result card */}
        <AnimatePresence>
          {phase === "result" && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 p-3"
              initial={{ y: 120, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 120, opacity: 0 }}
              transition={{ type: "spring", damping: 22, stiffness: 280 }}
            >
              <div className="bg-white rounded-2xl p-4 shadow-xl shadow-black/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[var(--accent)] rounded-xl flex items-center justify-center text-white font-bold text-sm">
                    MD
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[13px] text-gray-900">
                      {t("customerName")}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      {t("stampCount")}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-gray-400 font-mono bg-gray-100 px-2 py-0.5 rounded-md">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6v6h4.5"
                      />
                    </svg>
                    {t("timer")}
                  </div>
                </div>

                {/* Stamp dots */}
                <div className="flex gap-1.5 mb-3">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        i < 5
                          ? "bg-[var(--accent)]"
                          : "border-[1.5px] border-dashed border-gray-300"
                      }`}
                      initial={i === 4 ? { scale: 0 } : {}}
                      animate={i === 4 ? { scale: 1 } : {}}
                      transition={
                        i === 4
                          ? {
                              type: "spring",
                              stiffness: 400,
                              damping: 12,
                              delay: 0.2,
                            }
                          : {}
                      }
                    >
                      {i < 5 && (
                        <svg
                          className="w-2.5 h-2.5 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Toast */}
                <motion.div
                  className="bg-green-50 border border-green-200 text-green-700 text-[11px] font-semibold px-3 py-2 rounded-xl text-center flex items-center justify-center gap-1.5"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {t("toast")}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom hint text */}
        <div className="pb-4 pt-2 flex justify-center">
          <AnimatePresence>
            {phase === "scanning" && (
              <motion.p
                className="text-white/40 text-[10px] text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Placez le QR code dans le cadre
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PhoneMockup>
  );
}

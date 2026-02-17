"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { PhoneMockup } from "./PhoneMockup";

type DemoState =
  | "online"
  | "scanning-online"
  | "stamped-online"
  | "offline"
  | "scanning-offline"
  | "pending"
  | "syncing"
  | "synced";

export function OfflineToggleDemo() {
  const t = useTranslations("features.scanner-mobile.custom.offline");
  const [state, setState] = useState<DemoState>("online");
  const [isOffline, setIsOffline] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [hasToggled, setHasToggled] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const runSequence = useCallback(
    (offline: boolean) => {
      clearTimers();
      if (offline) {
        setState("offline");
        timersRef.current.push(
          setTimeout(() => setState("scanning-offline"), 800)
        );
        timersRef.current.push(
          setTimeout(() => {
            setState("pending");
            setPendingCount(1);
          }, 1800)
        );
        timersRef.current.push(
          setTimeout(() => {
            setState("syncing");
            setIsOffline(false);
          }, 3800)
        );
        timersRef.current.push(
          setTimeout(() => {
            setState("synced");
            setPendingCount(0);
          }, 5000)
        );
        timersRef.current.push(
          setTimeout(() => {
            setState("online");
          }, 6500)
        );
      } else {
        setState("online");
        timersRef.current.push(
          setTimeout(() => setState("scanning-online"), 800)
        );
        timersRef.current.push(
          setTimeout(() => setState("stamped-online"), 1800)
        );
        timersRef.current.push(
          setTimeout(() => setState("online"), 3500)
        );
      }
    },
    [clearTimers]
  );

  const handleToggle = () => {
    if (state === "online" || state === "stamped-online") {
      setHasToggled(true);
      setIsOffline(true);
      runSequence(true);
    }
  };

  const isOfflineState =
    state === "pending" ||
    state === "scanning-offline" ||
    state === "offline";

  const statusColor = isOfflineState
    ? "bg-amber-400"
    : state === "syncing"
      ? "bg-blue-400"
      : "bg-green-400";

  const statusText = isOfflineState
    ? t("offline_label")
    : state === "syncing"
      ? t("syncing")
      : state === "synced"
        ? t("synced")
        : t("online");

  return (
    <PhoneMockup>
      <div className="h-full flex flex-col bg-[#f8f8fa]">
        {/* App header */}
        <div className="pt-14 px-5 pb-4 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-[var(--accent)] rounded-lg flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">S</span>
              </div>
              <span className="text-[13px] font-semibold text-gray-900">
                Stampeo
              </span>
            </div>
            <button
              onClick={handleToggle}
              className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${
                isOffline ? "bg-amber-400" : "bg-green-400"
              }`}
              aria-label="Toggle offline mode"
            >
              <motion.div
                className="absolute top-[3px] w-[18px] h-[18px] bg-white rounded-full shadow-sm"
                animate={{
                  left: isOffline ? "calc(100% - 21px)" : "3px",
                }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
          </div>

          {/* Status pill */}
          <div className="mt-2.5 flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium ${
                isOfflineState
                  ? "bg-amber-50 text-amber-700"
                  : state === "syncing"
                    ? "bg-blue-50 text-blue-700"
                    : "bg-green-50 text-green-700"
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${statusColor}`} />
              {statusText}
              {pendingCount > 0 && state === "pending" && (
                <span className="font-semibold"> · {pendingCount}</span>
              )}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex items-center justify-center p-5">
          <AnimatePresence mode="wait">
            {/* Online scan success */}
            {state === "stamped-online" && (
              <motion.div
                key="stamped"
                className="text-center flex flex-col items-center"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <motion.div
                  className="w-20 h-20 mb-4 rounded-2xl bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/30"
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 18,
                  }}
                >
                  <motion.svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <motion.path
                      d="M5 13l4 4L19 7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.4, delay: 0.15 }}
                    />
                  </motion.svg>
                </motion.div>
                <p className="text-[13px] font-bold text-gray-900">
                  Tampon ajouté
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Synchronisé instantanément
                </p>
              </motion.div>
            )}

            {/* Pending offline */}
            {state === "pending" && (
              <motion.div
                key="pending"
                className="text-center flex flex-col items-center"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <motion.div
                  className="w-20 h-20 mb-4 rounded-2xl bg-amber-400 flex items-center justify-center shadow-lg shadow-amber-400/30"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 18,
                  }}
                >
                  <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </motion.div>
                <p className="text-[13px] font-bold text-amber-700">
                  {t("pending")}
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  1 tampon en file d&apos;attente
                </p>
              </motion.div>
            )}

            {/* Syncing */}
            {state === "syncing" && (
              <motion.div
                key="syncing"
                className="text-center flex flex-col items-center"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <motion.div
                  className="w-20 h-20 mb-4 rounded-2xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/30"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 18,
                  }}
                >
                  <motion.svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </motion.svg>
                </motion.div>
                <p className="text-[13px] font-bold text-blue-600">
                  {t("syncing")}
                </p>
                <motion.p
                  className="text-xs font-semibold text-blue-500 mt-0.5"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  Connexion rétablie
                </motion.p>
              </motion.div>
            )}

            {/* Synced */}
            {state === "synced" && (
              <motion.div
                key="synced"
                className="text-center flex flex-col items-center"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <motion.div
                  className="w-20 h-20 mb-4 rounded-2xl bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/30"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 18,
                  }}
                >
                  <motion.svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <motion.path
                      d="M5 13l4 4L19 7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.4 }}
                    />
                  </motion.svg>
                </motion.div>
                <p className="text-[13px] font-bold text-green-600">
                  {t("synced")}
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Aucun tampon perdu
                </p>
              </motion.div>
            )}

            {/* Default: viewfinder */}
            {(state === "online" ||
              state === "scanning-online" ||
              state === "offline" ||
              state === "scanning-offline") && (
              <motion.div
                key="viewfinder"
                className="w-36 h-36 relative"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Corner brackets */}
                {[
                  "top-0 left-0 border-t-[3px] border-l-[3px] rounded-tl-xl",
                  "top-0 right-0 border-t-[3px] border-r-[3px] rounded-tr-xl",
                  "bottom-0 left-0 border-b-[3px] border-l-[3px] rounded-bl-xl",
                  "bottom-0 right-0 border-b-[3px] border-r-[3px] rounded-br-xl",
                ].map((pos, i) => (
                  <div
                    key={i}
                    className={`absolute w-8 h-8 ${pos} border-gray-300`}
                  />
                ))}
                {/* Scanning line */}
                {(state === "scanning-online" ||
                  state === "scanning-offline") && (
                  <motion.div
                    className={`absolute left-3 right-3 h-[2px] ${
                      isOffline
                        ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.4)]"
                        : "bg-[var(--accent)] shadow-[0_0_8px_rgba(var(--accent-rgb),0.4)]"
                    }`}
                    animate={{ top: ["10%", "90%", "10%"] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                )}
                {/* Center hint */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 border-2 border-dashed border-gray-200 rounded-lg" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom instruction */}
        <div className="px-5 pb-5">
          {isOffline ? (
            <p className="text-xs text-gray-500 text-center font-medium">
              Mode hors ligne activé
            </p>
          ) : (
            <motion.p
              className="text-xs text-gray-600 text-center font-medium flex items-center justify-center gap-1"
              animate={!hasToggled ? { opacity: [0.6, 1, 0.6] } : {}}
              transition={!hasToggled ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : {}}
            >
              <motion.span
                animate={!hasToggled ? { y: [0, -3, 0] } : {}}
                transition={!hasToggled ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" } : {}}
              >
                ↑
              </motion.span>
              Appuyez sur le toggle pour simuler
            </motion.p>
          )}
        </div>
      </div>
    </PhoneMockup>
  );
}

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { PhoneMockup } from "./PhoneMockup";

type DemoState = "online" | "scanning-online" | "stamped-online" | "offline" | "scanning-offline" | "pending" | "syncing" | "synced";

export function OfflineToggleDemo() {
  const t = useTranslations("features.scanner-mobile.custom.offline");
  const [state, setState] = useState<DemoState>("online");
  const [isOffline, setIsOffline] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const runSequence = useCallback((offline: boolean) => {
    clearTimers();
    if (offline) {
      setState("offline");
      timersRef.current.push(setTimeout(() => setState("scanning-offline"), 800));
      timersRef.current.push(setTimeout(() => {
        setState("pending");
        setPendingCount(1);
      }, 1800));
      timersRef.current.push(setTimeout(() => setState("syncing"), 3800));
      timersRef.current.push(setTimeout(() => {
        setState("synced");
        setPendingCount(0);
      }, 5000));
      timersRef.current.push(setTimeout(() => {
        setIsOffline(false);
        setState("online");
      }, 6500));
    } else {
      setState("online");
      timersRef.current.push(setTimeout(() => setState("scanning-online"), 800));
      timersRef.current.push(setTimeout(() => setState("stamped-online"), 1800));
      timersRef.current.push(setTimeout(() => setState("online"), 3500));
    }
  }, [clearTimers]);

  const handleToggle = () => {
    if (state === "online" || state === "stamped-online") {
      setIsOffline(true);
      runSequence(true);
    }
  };

  const statusColor =
    state === "pending" || state === "scanning-offline" || state === "offline"
      ? "bg-amber-400"
      : state === "syncing"
        ? "bg-blue-400"
        : "bg-green-400";

  const statusText =
    state === "pending" || state === "scanning-offline" || state === "offline"
      ? t("offline_label")
      : state === "syncing"
        ? t("syncing")
        : state === "synced"
          ? t("synced")
          : t("online");

  return (
    <PhoneMockup>
      <div className="h-full flex flex-col bg-gray-50">
        {/* Status bar */}
        <div className="pt-10 px-4 pb-3 bg-white border-b border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-900">Stampeo</span>
            <button
              onClick={handleToggle}
              className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${
                isOffline ? "bg-amber-400" : "bg-green-400"
              }`}
              aria-label="Toggle offline mode"
            >
              <motion.div
                className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"
                animate={{ left: isOffline ? "calc(100% - 18px)" : "2px" }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <div className={`w-1.5 h-1.5 rounded-full ${statusColor}`} />
            <span className="text-[10px] text-gray-500">{statusText}</span>
            {pendingCount > 0 && state === "pending" && (
              <span className="text-[10px] text-amber-600 font-medium ml-1">
                ({pendingCount})
              </span>
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex items-center justify-center p-4">
          <AnimatePresence mode="wait">
            {/* Online scan success */}
            {state === "stamped-online" && (
              <motion.div
                key="stamped"
                className="text-center"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
              >
                <motion.div
                  className="w-16 h-16 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <motion.path
                      d="M5 13l4 4L19 7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.4 }}
                    />
                  </svg>
                </motion.div>
                <p className="text-sm font-bold text-gray-900">{t("../scanDemo.toast")}</p>
              </motion.div>
            )}

            {/* Pending offline */}
            {state === "pending" && (
              <motion.div
                key="pending"
                className="text-center"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
              >
                <motion.div
                  className="w-16 h-16 mx-auto mb-3 rounded-full bg-amber-100 flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </motion.div>
                <p className="text-sm font-bold text-amber-700">{t("pending")}</p>
              </motion.div>
            )}

            {/* Syncing */}
            {state === "syncing" && (
              <motion.div
                key="syncing"
                className="text-center"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
              >
                <motion.div
                  className="w-16 h-16 mx-auto mb-3 rounded-full bg-blue-100 flex items-center justify-center"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </motion.div>
                <p className="text-sm font-bold text-blue-600">{t("syncing")}</p>
              </motion.div>
            )}

            {/* Synced */}
            {state === "synced" && (
              <motion.div
                key="synced"
                className="text-center"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
              >
                <motion.div
                  className="w-16 h-16 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <motion.path
                      d="M5 13l4 4L19 7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.4 }}
                    />
                  </svg>
                </motion.div>
                <p className="text-sm font-bold text-green-600">{t("synced")}</p>
              </motion.div>
            )}

            {/* Default scanning states */}
            {(state === "online" || state === "scanning-online" || state === "offline" || state === "scanning-offline") && (
              <motion.div
                key="viewfinder"
                className="w-32 h-32 relative"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Corner brackets */}
                {[
                  "top-0 left-0 border-t-2 border-l-2 rounded-tl-lg",
                  "top-0 right-0 border-t-2 border-r-2 rounded-tr-lg",
                  "bottom-0 left-0 border-b-2 border-l-2 rounded-bl-lg",
                  "bottom-0 right-0 border-b-2 border-r-2 rounded-br-lg",
                ].map((pos, i) => (
                  <div key={i} className={`absolute w-6 h-6 ${pos} border-gray-400`} />
                ))}
                {/* Scanning line */}
                {(state === "scanning-online" || state === "scanning-offline") && (
                  <motion.div
                    className={`absolute left-2 right-2 h-0.5 ${isOffline ? "bg-amber-400" : "bg-[var(--accent)]"}`}
                    animate={{ top: ["10%", "90%", "10%"] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PhoneMockup>
  );
}

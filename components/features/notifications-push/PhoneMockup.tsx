"use client";

import { ReactNode } from "react";

interface PhoneMockupProps {
  children: ReactNode;
  className?: string;
  showStatusBar?: boolean;
  statusBarColor?: "white" | "black";
  /** "full" shows time + icons, "time-only" shows just the clock */
  statusBarStyle?: "full" | "time-only";
}

export function PhoneMockup({
  children,
  className = "",
  showStatusBar = true,
  statusBarColor = "black",
  statusBarStyle = "full",
}: PhoneMockupProps) {
  const barColor = statusBarColor === "white" ? "text-white" : "text-black/80";
  const barFill = statusBarColor === "white" ? "white" : "rgba(0,0,0,0.8)";

  return (
    <div className={`relative ${className}`}>
      {/* Side buttons — left */}
      {/* Mute switch */}
      <div className="absolute left-[-2px] top-[72px] w-[3px] h-[14px] bg-[#2a2a2c] rounded-l-sm" />
      {/* Volume up */}
      <div className="absolute left-[-2px] top-[100px] w-[3px] h-[28px] bg-[#2a2a2c] rounded-l-sm" />
      {/* Volume down */}
      <div className="absolute left-[-2px] top-[136px] w-[3px] h-[28px] bg-[#2a2a2c] rounded-l-sm" />
      {/* Side button — right (power) */}
      <div className="absolute right-[-2px] top-[110px] w-[3px] h-[36px] bg-[#2a2a2c] rounded-r-sm" />

      {/* Phone frame */}
      <div
        className="relative w-[280px] bg-[#1c1c1e] rounded-[2.5rem] p-[10px]"
        style={{
          boxShadow:
            "0 1px 0 0 rgba(255,255,255,0.08) inset, 0 25px 50px -12px rgba(0,0,0,0.4), 0 8px 20px -4px rgba(0,0,0,0.3)",
        }}
      >
        {/* Top frame shine */}
        <div className="absolute top-0 left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent rounded-full" />

        {/* Screen */}
        <div
          className="relative w-full bg-[#f2f2f7] rounded-[2rem] overflow-hidden"
          style={{
            aspectRatio: "9/19.5",
            boxShadow: "inset 0 0 8px rgba(0,0,0,0.15)",
          }}
        >
          {/* Dynamic Island */}
          <div className="absolute top-0 left-0 right-0 z-30 flex justify-center pt-2">
            <div
              className="w-[100px] h-[30px] bg-black rounded-full"
              style={{
                boxShadow: "inset 0 2px 4px rgba(255,255,255,0.05)",
              }}
            />
          </div>

          {/* Status bar */}
          {showStatusBar && (
            <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 pt-3">
              <span className={`text-[11px] font-semibold ${barColor}`}>
                9:41
              </span>
              {statusBarStyle === "full" && (
                <div className="flex items-center gap-1.5">
                  {/* Cellular bars */}
                  <svg
                    width="15"
                    height="10"
                    viewBox="0 0 15 10"
                    fill={barFill}
                  >
                    <rect x="0" y="7" width="2.5" height="3" rx="0.5" />
                    <rect x="3.5" y="5" width="2.5" height="5" rx="0.5" />
                    <rect x="7" y="3" width="2.5" height="7" rx="0.5" />
                    <rect x="10.5" y="0" width="2.5" height="10" rx="0.5" />
                  </svg>
                  {/* Wi-Fi arc */}
                  <svg
                    width="13"
                    height="10"
                    viewBox="0 0 13 10"
                    fill={barFill}
                  >
                    <path d="M6.5 9.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" />
                    <path
                      d="M3.7 6.7a4 4 0 0 1 5.6 0"
                      fill="none"
                      stroke={barFill}
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M1.4 4.3a7 7 0 0 1 10.2 0"
                      fill="none"
                      stroke={barFill}
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                  </svg>
                  {/* Battery */}
                  <div className="flex items-center gap-[1px]">
                    <svg
                      width="22"
                      height="11"
                      viewBox="0 0 22 11"
                      fill="none"
                    >
                      <rect
                        x="0.5"
                        y="0.5"
                        width="18"
                        height="10"
                        rx="2.5"
                        stroke={barFill}
                        strokeWidth="1"
                      />
                      <rect
                        x="2"
                        y="2"
                        width="14"
                        height="7"
                        rx="1"
                        fill="#34C759"
                      />
                      <rect
                        x="19.5"
                        y="3.5"
                        width="2"
                        height="4"
                        rx="0.5"
                        fill={barFill}
                      />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Screen glass reflection */}
          <div
            className="absolute inset-0 z-20 pointer-events-none"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%)",
            }}
          />

          {/* Content area */}
          <div className="relative w-full h-full pt-12">{children}</div>

          {/* Home indicator */}
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-20 w-[100px] h-[4px] bg-black/20 rounded-full" />
        </div>
      </div>
    </div>
  );
}

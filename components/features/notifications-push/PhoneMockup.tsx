"use client";

import { ReactNode } from "react";

interface PhoneMockupProps {
  children: ReactNode;
  className?: string;
}

export function PhoneMockup({ children, className = "" }: PhoneMockupProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Phone frame */}
      <div className="relative w-[280px] bg-[#1c1c1e] rounded-[2.5rem] p-[10px] shadow-2xl shadow-black/20">
        {/* Screen */}
        <div className="relative w-full bg-[#f2f2f7] rounded-[2rem] overflow-hidden" style={{ aspectRatio: "9/19.5" }}>
          {/* Dynamic Island */}
          <div className="absolute top-0 left-0 right-0 z-30 flex justify-center pt-2.5">
            <div className="w-[90px] h-[28px] bg-black rounded-full" />
          </div>

          {/* Status bar */}
          <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 pt-3">
            <span className="text-[11px] font-semibold text-black/80">9:41</span>
            <div className="flex items-center gap-1">
              <svg width="14" height="10" viewBox="0 0 14 10" fill="black" opacity="0.8">
                <rect x="0" y="6" width="2.5" height="4" rx="0.5" />
                <rect x="3.5" y="4" width="2.5" height="6" rx="0.5" />
                <rect x="7" y="2" width="2.5" height="8" rx="0.5" />
                <rect x="10.5" y="0" width="2.5" height="10" rx="0.5" />
              </svg>
              <svg width="14" height="10" viewBox="0 0 14 10" fill="black" opacity="0.8">
                <path d="M7 2C9.76 2 12.17 3.33 13.5 5.5C12.17 7.67 9.76 9 7 9C4.24 9 1.83 7.67 0.5 5.5C1.83 3.33 4.24 2 7 2Z" fillOpacity="0" stroke="black" strokeWidth="1" />
                <circle cx="7" cy="5.5" r="2" />
              </svg>
              <svg width="22" height="10" viewBox="0 0 22 10" fill="black" opacity="0.8">
                <rect x="0.5" y="0.5" width="19" height="9" rx="2" stroke="black" strokeWidth="1" fill="none" />
                <rect x="2" y="2" width="14" height="6" rx="1" fill="black" />
                <rect x="20.5" y="3" width="1.5" height="4" rx="0.5" />
              </svg>
            </div>
          </div>

          {/* Content area */}
          <div className="relative w-full h-full pt-12">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

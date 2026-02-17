"use client";

import type { ReactNode } from "react";

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
        <div
          className="relative w-full bg-[#1a1a1a] rounded-[2rem] overflow-hidden"
          style={{ aspectRatio: "9/19.5" }}
        >
          {/* Dynamic Island */}
          <div className="absolute top-0 left-0 right-0 z-30 flex justify-center pt-2.5">
            <div className="w-[90px] h-[28px] bg-black rounded-full" />
          </div>

          {/* Content area */}
          <div className="relative w-full h-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

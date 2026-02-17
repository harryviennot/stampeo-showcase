"use client";

import type { ReactNode } from "react";

interface PhoneMockupProps {
  children: ReactNode;
  className?: string;
}

export function PhoneMockup({ children, className = "" }: PhoneMockupProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="w-64 h-[500px] bg-[var(--foreground)] rounded-[3rem] p-3 shadow-2xl">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 bg-[var(--foreground)] rounded-b-2xl z-10" />
        {/* Screen */}
        <div className="w-full h-full bg-[var(--background)] rounded-[2.5rem] overflow-hidden relative">
          {children}
        </div>
      </div>
    </div>
  );
}

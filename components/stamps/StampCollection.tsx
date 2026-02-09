"use client";

import { CircleStamp, StarStamp, HeartStamp, CoffeeStamp } from "./StampIcons";

// Colors from CSS variables
const stampColors = {
  coral: "#f97316",
  pink: "#ec4899",
  violet: "#8b5cf6",
  blue: "#3b82f6",
  teal: "#14b8a6",
  green: "#22c55e",
  yellow: "#eab308",
};

export function StampCollection() {
  return (
    <div className="relative w-full max-w-[400px] aspect-square mx-auto">
      {/* Central large stamp */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform hover:scale-105 transition-transform duration-300">
        <CircleStamp color={stampColors.coral} size={120} />
      </div>

      {/* Surrounding stamps - arranged in a circular pattern */}
      <div className="absolute top-[10%] left-[15%] transform hover:scale-110 transition-transform duration-300 hover:rotate-12">
        <StarStamp color={stampColors.yellow} size={64} />
      </div>

      <div className="absolute top-[5%] right-[20%] transform hover:scale-110 transition-transform duration-300 hover:-rotate-6">
        <HeartStamp color={stampColors.pink} size={56} />
      </div>

      <div className="absolute top-[30%] right-[5%] transform hover:scale-110 transition-transform duration-300 hover:rotate-6">
        <CircleStamp color={stampColors.blue} size={72} />
      </div>

      <div className="absolute bottom-[25%] right-[10%] transform hover:scale-110 transition-transform duration-300 hover:-rotate-12">
        <CoffeeStamp color={stampColors.teal} size={60} />
      </div>

      <div className="absolute bottom-[10%] right-[30%] transform hover:scale-110 transition-transform duration-300 hover:rotate-12">
        <StarStamp color={stampColors.violet} size={52} />
      </div>

      <div className="absolute bottom-[5%] left-[25%] transform hover:scale-110 transition-transform duration-300 hover:-rotate-6">
        <HeartStamp color={stampColors.coral} size={48} />
      </div>

      <div className="absolute bottom-[25%] left-[5%] transform hover:scale-110 transition-transform duration-300 hover:rotate-6">
        <CircleStamp color={stampColors.green} size={56} />
      </div>

      <div className="absolute top-[25%] left-[5%] transform hover:scale-110 transition-transform duration-300 hover:-rotate-12">
        <CoffeeStamp color={stampColors.violet} size={52} />
      </div>

      {/* Small accent dots */}
      <div className="absolute top-[15%] left-[40%]">
        <div className="w-3 h-3 rounded-full bg-[#f97316] opacity-60" />
      </div>
      <div className="absolute top-[40%] right-[25%]">
        <div className="w-2 h-2 rounded-full bg-[#ec4899] opacity-60" />
      </div>
      <div className="absolute bottom-[35%] left-[30%]">
        <div className="w-2 h-2 rounded-full bg-[#3b82f6] opacity-60" />
      </div>
      <div className="absolute bottom-[15%] right-[45%]">
        <div className="w-3 h-3 rounded-full bg-[#22c55e] opacity-60" />
      </div>
    </div>
  );
}

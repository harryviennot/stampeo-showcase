"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { MapPinIcon } from "@/components/icons";
import { PhoneMockup } from "@/components/features/notifications-push/PhoneMockup";
import { WalletCard } from "@/components/card/WalletCard";
import { ScaledCardWrapper } from "@/components/card/ScaledCardWrapper";

const pulseCircles = [0, 1, 2];

const cafeDesign = {
  background_color: "#3C2415",
  accent_color: "#D4A574",
  organization_name: "Café Le Comptoir",
  total_stamps: 10,
  stamp_icon: "coffee" as const,
  reward_icon: "gift" as const,
};

export function GeofencingHeroAnimation() {
  const t = useTranslations("features.geolocalisation");
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Map area */}
      <div
        className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#e8f5e9] via-[#f1f8e9] to-[#e0e0e0] aspect-square"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Faint street lines */}
        <div className="absolute inset-0">
          <div className="absolute top-[30%] left-0 right-0 h-[2px] bg-white/50" />
          <div className="absolute top-[60%] left-0 right-0 h-[2px] bg-white/50" />
          <div className="absolute top-0 bottom-0 left-[25%] w-[2px] bg-white/50" />
          <div className="absolute top-0 bottom-0 left-[55%] w-[2px] bg-white/50" />
          <div className="absolute top-0 bottom-0 left-[80%] w-[2px] bg-white/40" />
          <div className="absolute top-[45%] left-[10%] right-[30%] h-[2px] bg-white/40 rotate-[15deg]" />
        </div>

        {/* Pulsing geofence circles */}
        <div className="absolute inset-0 flex items-center justify-center">
          {pulseCircles.map((index) => (
            <motion.div
              key={index}
              className="absolute rounded-full border-2 border-[var(--accent)]"
              style={{ width: 200, height: 200 }}
              animate={
                isHovered
                  ? { scale: 1 + index * 0.35, opacity: 0.2 }
                  : {
                      scale: [0.5, 1.5],
                      opacity: [0.6, 0],
                    }
              }
              transition={
                isHovered
                  ? { duration: 0.4 }
                  : {
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.66,
                      ease: "easeOut",
                    }
              }
            />
          ))}

          {/* Center pin */}
          <div className="relative z-10 flex flex-col items-center">
            <MapPinIcon className="w-12 h-12 text-[var(--accent)] drop-shadow-lg" />

            {/* Radius label on hover */}
            <motion.span
              className="mt-2 px-3 py-1 rounded-full bg-white/90 text-sm font-semibold text-[var(--foreground)] shadow-sm"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : -5 }}
              transition={{ duration: 0.3 }}
            >
              {t("demo.radiusLabel")}
            </motion.span>
          </div>
        </div>

        {/* Phone mockup - bottom right */}
        <motion.div
          className="absolute bottom-4 right-4 z-20"
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
        >
          <div className="scale-[0.55] origin-bottom-right">
            <PhoneMockup>
              <motion.div
                className="p-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.6 }}
              >
                {/* Lock screen date */}
                <div className="text-center mb-4 mt-2">
                  <p className="text-[13px] font-light text-black/60">
                    {t("demo.lockScreenDate")}
                  </p>
                </div>

                <ScaledCardWrapper baseWidth={254}>
                  <WalletCard
                    design={cafeDesign}
                    stamps={7}
                    showQR={false}
                    showSecondaryFields={false}
                  />
                </ScaledCardWrapper>
              </motion.div>
            </PhoneMockup>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

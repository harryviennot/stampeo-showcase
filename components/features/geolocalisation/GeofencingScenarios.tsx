"use client";

import { useTranslations } from "next-intl";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { MapPinIcon } from "@/components/icons";
import { WalletCard } from "@/components/card/WalletCard";
import { ScaledCardWrapper } from "@/components/card/ScaledCardWrapper";

const scenarioDesigns = [
  {
    background_color: "#3C2415",
    accent_color: "#D4A574",
    total_stamps: 10,
    stamp_icon: "coffee" as const,
    reward_icon: "gift" as const,
  },
  {
    background_color: "#F8E8F0",
    accent_color: "#D4688E",
    total_stamps: 8,
    stamp_icon: "heart" as const,
    reward_icon: "star" as const,
  },
  {
    background_color: "#1A2332",
    accent_color: "#4A90D9",
    total_stamps: 6,
    stamp_icon: "checkmark" as const,
    reward_icon: "gift" as const,
  },
];

const scenarioStamps = [7, 5, 3];

export function GeofencingScenarios() {
  const t = useTranslations("features.geolocalisation");

  const items = t.raw("scenarios.items") as {
    name: string;
    business: string;
    initial: string;
    quote: string;
    description: string;
  }[];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {items.map((item, index) => (
        <ScrollReveal key={index} variant="stagger" delay={index * 150}>
          <div className="relative p-6 bg-white rounded-2xl blog-card-3d transition-transform duration-300 hover:-translate-y-2 h-full flex flex-col">
            {/* Corner map pin */}
            <div className="absolute top-4 right-4 text-[var(--muted-foreground)]/40">
              <MapPinIcon className="w-5 h-5" />
            </div>

            {/* Mini WalletCard */}
            <div className="mb-5">
              <ScaledCardWrapper baseWidth={160}>
                <WalletCard
                  design={scenarioDesigns[index]}
                  organizationName={item.business}
                  stamps={scenarioStamps[index]}
                  showQR={false}
                  showSecondaryFields={false}
                />
              </ScaledCardWrapper>
            </div>

            {/* Avatar + Name */}
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{
                  backgroundColor: scenarioDesigns[index].accent_color,
                }}
              >
                {item.initial}
              </div>
              <div>
                <p className="font-semibold text-[var(--foreground)]">
                  {item.name}
                </p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {item.description}
                </p>
              </div>
            </div>

            {/* Quote */}
            <p className="text-[var(--muted-foreground)] italic leading-relaxed mt-auto">
              &ldquo;{item.quote}&rdquo;
            </p>
          </div>
        </ScrollReveal>
      ))}
    </div>
  );
}

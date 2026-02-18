"use client";

import { useTranslations } from "next-intl";
import { ScrollReveal } from "../ui/ScrollReveal";
import { DocumentIcon, DevicePhoneMobileIcon, EyeSlashIcon } from "../icons";
import { PhoneMockup } from "../features/notifications-push/PhoneMockup";
import { WalletCard } from "../card/WalletCard";
import { ScaledCardWrapper } from "../card/ScaledCardWrapper";

export function ProblemSection() {
  const t = useTranslations("landing.problem");

  return (
    <section id="features" className="relative py-24 lg:py-32 bg-[var(--blog-bg)]">
      <div className="relative z-10 max-w-[1100px] mx-auto px-6">
        {/* Problem Statement */}
        <ScrollReveal className="text-center mb-16">
          <p className="text-2xl md:text-3xl lg:text-4xl font-bold leading-relaxed text-[var(--foreground)]">
            {t.rich("statement", {
              muted: (chunks) => (
                <span className="text-[var(--muted-foreground)]">{chunks}</span>
              ),
            })}
          </p>
        </ScrollReveal>

        {/* Problem Cards */}
        <ScrollReveal delay={200} className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {/* Lost Cards */}
          <div className="group relative flex flex-col gap-6 p-8 bg-white rounded-2xl blog-card-3d transition-transform duration-300 hover:-translate-y-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)]">
              <DocumentIcon className="w-7 h-7" />
            </div>
            <div className="flex flex-col gap-3">
              <h3 className="text-2xl font-bold text-[var(--foreground)]">{t("lostTitle")}</h3>
              <p className="text-[var(--muted-foreground)] text-base leading-relaxed">
                {t("lostDesc")}
              </p>
            </div>
          </div>

          {/* App Fatigue */}
          <div className="group relative flex flex-col gap-6 p-8 bg-white rounded-2xl blog-card-3d transition-transform duration-300 hover:-translate-y-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)]">
              <DevicePhoneMobileIcon className="w-7 h-7" />
            </div>
            <div className="flex flex-col gap-3">
              <h3 className="text-2xl font-bold text-[var(--foreground)]">{t("fatigueTitle")}</h3>
              <p className="text-[var(--muted-foreground)] text-base leading-relaxed">
                {t("fatigueDesc")}
              </p>
            </div>
          </div>

          {/* Zero Visibility */}
          <div className="group relative flex flex-col gap-6 p-8 bg-white rounded-2xl blog-card-3d transition-transform duration-300 hover:-translate-y-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)]">
              <EyeSlashIcon className="w-7 h-7" />
            </div>
            <div className="flex flex-col gap-3">
              <h3 className="text-2xl font-bold text-[var(--foreground)]">{t("zeroVisibilityTitle")}</h3>
              <p className="text-[var(--muted-foreground)] text-base leading-relaxed">
                {t("zeroVisibilityDesc")}
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* Divider Arrow */}
        <ScrollReveal delay={300} className="flex justify-center mb-20">
          <div className="flex flex-col items-center gap-4 text-[var(--accent)]">
            <div className="w-px h-16 bg-gradient-to-b from-transparent via-[var(--accent)]/30 to-[var(--accent)]" />
            <span className="text-2xl">↓</span>
          </div>
        </ScrollReveal>

        {/* Solution Statement */}
        <ScrollReveal delay={400} className="text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight text-[var(--foreground)] mb-6">
            {t.rich("solution", {
              br: () => <br className="hidden md:block" />,
            })}
          </h2>
          <p className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[var(--accent)]">
            {t("solutionHighlight")}
          </p>

          {/* Phone Illustration */}
          <div className="mt-16 flex justify-center">
            <PhoneMockup width={260}>
              <div className="flex-1 flex items-center justify-center p-3">
                <ScaledCardWrapper baseWidth={280} targetWidth={230}>
                  <WalletCard
                    design={{
                      organization_name: "Stampeo",
                      total_stamps: 8,
                      background_color: "#1c1c1e",
                      stamp_filled_color: "#f97316",
                      label_color: "#fff",
                      logo_url: "data:image/svg+xml,%3Csvg fill='none' viewBox='0 0 48 48' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath clip-rule='evenodd' d='M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z' fill='%23f97316' fill-rule='evenodd'/%3E%3C/svg%3E",
                      secondary_fields: [
                        { key: "reward", label: "Reward", value: "Free coffee" }
                      ],
                    }}
                    stamps={4}
                    showQR={true}
                    interactive3D={false}
                  />
                </ScaledCardWrapper>
              </div>
            </PhoneMockup>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

"use client";

import { useTranslations } from "next-intl";
import { ScrollReveal } from "../ui/ScrollReveal";
import { DocumentIcon, DevicePhoneMobileIcon, EyeSlashIcon } from "../icons";

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
            {t("solution")}
          </h2>
          <p className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[var(--accent)]">
            {t("solutionHighlight")}
          </p>

          {/* Phone Illustration */}
          <div className="mt-16 flex justify-center">
            <div className="relative">
              <div className="w-64 h-[500px] bg-[var(--foreground)] rounded-[3rem] p-3 shadow-2xl">
                <div className="w-full h-full bg-[var(--background)] rounded-[2.5rem] overflow-hidden flex flex-col">
                  {/* Status bar */}
                  <div className="h-8 bg-[var(--foreground)] flex items-center justify-center">
                    <div className="w-20 h-5 bg-[var(--foreground)] rounded-full" />
                  </div>
                  {/* Wallet notification */}
                  <div className="flex-1 flex items-center justify-center p-4">
                    <div className="w-full bg-[var(--cream)] rounded-2xl p-4 shadow-lg border border-[var(--accent)]/20">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-[var(--accent)] rounded-xl flex items-center justify-center text-white font-bold">
                          S
                        </div>
                        <div>
                          <p className="font-bold text-sm">Stampeo</p>
                          <p className="text-xs text-[var(--muted-foreground)]">{t("notification")}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className={`w-6 h-6 rounded-full ${
                              i <= 4 ? "bg-[var(--accent)]" : "border-2 border-dashed border-[var(--border)]"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

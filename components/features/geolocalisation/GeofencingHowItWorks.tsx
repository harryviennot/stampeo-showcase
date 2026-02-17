"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { NumberStamp } from "@/components/stamps/StampIcons";
import { PhoneMockup } from "@/components/features/notifications-push/PhoneMockup";
import { NotificationBanner } from "@/components/features/notifications-push/NotificationBanner";

const stepColors = ["#f97316", "#ec4899", "#8b5cf6", "#3b82f6"];

export function GeofencingHowItWorks() {
  const t = useTranslations("features.geolocalisation");

  const steps = t.raw("howItWorks.steps") as {
    title: string;
    description: string;
  }[];

  return (
    <Container>
      <ScrollReveal className="text-center max-w-2xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--background)] border border-[var(--border)] text-[var(--muted-foreground)] text-sm font-medium mb-6">
          {t("howItWorks.badge")}
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--foreground)]">
          {t("howItWorks.title")}
        </h2>
      </ScrollReveal>

      {/* Timeline */}
      <div className="max-w-4xl mx-auto">
        {steps.map((step, index) => (
          <ScrollReveal key={index} delay={index * 100} className="relative">
            <div className="flex gap-6 sm:gap-8 pb-12 last:pb-0">
              <div className="flex flex-col items-center">
                <NumberStamp
                  color={stepColors[index]}
                  size={48}
                  number={index + 1}
                />
                {index < steps.length - 1 && (
                  <div className="w-0.5 flex-1 bg-[var(--border)] mt-4" />
                )}
              </div>
              <div className="flex-1 pb-8">
                <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">
                  {step.title}
                </h3>
                <p className="text-[var(--muted-foreground)] leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>

      {/* Customer narrative card */}
      <ScrollReveal delay={400} className="mt-16">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl p-8 sm:p-10 border border-[var(--accent)]/10 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-[var(--foreground)] mb-4">
                {t("howItWorks.customerNarrative.title")}
              </h3>
              <p className="text-[var(--muted-foreground)] leading-relaxed">
                {t("howItWorks.customerNarrative.description")}
              </p>
            </div>
            <div className="flex justify-center">
              <motion.div
                initial={{ y: 40, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <div className="scale-[0.7] origin-center">
                  <PhoneMockup>
                    {/* Lock screen wallpaper */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#e8e0f0] via-[#d4c8e8] to-[#b8a8d8]" />

                    {/* Lock screen content */}
                    <div className="relative z-10 flex flex-col items-center pt-8">
                      <div
                        className="text-[64px] font-thin text-white leading-none tracking-tight"
                        style={{ textShadow: "0 1px 4px rgba(0,0,0,0.1)" }}
                      >
                        9:41
                      </div>
                      <div
                        className="text-[15px] font-medium text-white/80 mt-1"
                        style={{ textShadow: "0 1px 2px rgba(0,0,0,0.1)" }}
                      >
                        {t("demo.lockScreenDate")}
                      </div>
                    </div>

                    {/* Notification */}
                    <div className="relative z-10 px-3 mt-8">
                      <NotificationBanner
                        appName="Stampeo"
                        title={t("demo.notificationTitle")}
                        body={t("demo.notificationBody")}
                        timeAgo={t("demo.timeAgo")}
                      />
                    </div>
                  </PhoneMockup>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </Container>
  );
}

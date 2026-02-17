"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import {
  MapPinIcon,
  SparklesIcon,
  ClockIcon,
  SignalIcon,
} from "@/components/icons";
import { FeatureCTA } from "@/components/features/FeatureCTA";
import { FeaturePrivacy } from "@/components/features/FeaturePrivacy";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { PhoneMockup } from "@/components/features/notifications-push/PhoneMockup";
import { NotificationBanner } from "@/components/features/notifications-push/NotificationBanner";
import { GeofencingHeroAnimation } from "./GeofencingHeroAnimation";
import { RelatedFeatures } from "@/components/features/RelatedFeatures";

const technicalIcons = [MapPinIcon, SignalIcon, ClockIcon];

export function GeofencingPage() {
  const t = useTranslations("features");
  const tp = useTranslations("features.geolocalisation");

  const technicalItems = tp.raw("technical.items") as {
    title: string;
    description: string;
    icon: string;
    badge?: string;
  }[];

  const related = tp.raw("related") as string[];

  return (
    <>
      {/* ============ 1. Hero ============ */}
      <section className="relative min-h-[85vh] flex items-center pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 right-[10%] w-72 h-72 rounded-full bg-[var(--accent)]/5 blur-3xl" />
          <div className="absolute bottom-10 left-[5%] w-48 h-48 rounded-full bg-[var(--stamp-sage)]/5 blur-3xl" />
        </div>

        <Container className="relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left */}
            <ScrollReveal className="flex flex-col gap-6 order-2 lg:order-1">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[var(--accent)]/10 shadow-sm mb-6">
                  <MapPinIcon className="w-4 h-4 text-[var(--accent)]" />
                  <span className="text-sm font-bold tracking-wide">
                    {tp("heroBadge")}
                  </span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--foreground)] leading-[1.1] mb-6">
                  {tp("hero.title")}
                </h1>

                <p className="text-lg lg:text-xl text-[var(--muted-foreground)] leading-relaxed max-w-xl">
                  {tp("hero.subtitle")}
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/onboarding"
                  className="group flex items-center gap-2 bg-[var(--accent)] text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl shadow-[var(--accent)]/25 hover:scale-105 transition-all"
                >
                  <span>{t("ctaButton")}</span>
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </div>

              {/* Wallet badges */}
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black text-white text-sm font-medium">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  <span>Apple Wallet</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-[var(--border)] text-sm font-medium">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  <span>Google Wallet</span>
                </div>
              </div>
            </ScrollReveal>

            {/* Right - Animation */}
            <ScrollReveal
              delay={200}
              className="flex justify-center order-1 lg:order-2"
            >
              <GeofencingHeroAnimation />
            </ScrollReveal>
          </div>
        </Container>
      </section>

      {/* ============ 2. Problem ============ */}
      <section className="py-20 sm:py-28 bg-[var(--blog-bg)]">
        <Container>
          <ScrollReveal className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--foreground)] mb-6">
              {tp("problem.title")}
            </h2>
            <p className="text-lg text-[var(--muted-foreground)] leading-relaxed mb-8">
              {tp("problem.description")}
            </p>
            <p className="text-xl sm:text-2xl font-semibold text-[var(--accent)] italic">
              {tp("problemNarrative")}
            </p>
          </ScrollReveal>
        </Container>
      </section>

      {/* ============ 3. How It Works ============ */}
      <HowItWorks
        translationKey="features.geolocalisation.howItWorks"
        sectionClassName="py-20 sm:py-28 relative bg-[var(--blog-bg-alt)]"
        aside={
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="scale-100 origin-top-right">
              <PhoneMockup showStatusBar={false}>
                <div className="absolute inset-0 bg-gradient-to-b from-[#e8e0f0] via-[#d4c8e8] to-[#b8a8d8]" />
                <div className="relative z-10 flex flex-col items-center pt-8">
                  <div
                    className="text-[64px] font-light text-white leading-none tracking-tight"
                    style={{ textShadow: "0 1px 4px rgba(0,0,0,0.1)" }}
                  >
                    9:41
                  </div>
                  <div
                    className="text-[15px] font-medium text-white/80 mt-1"
                    style={{ textShadow: "0 1px 2px rgba(0,0,0,0.1)" }}
                  >
                    {tp("demo.lockScreenDate")}
                  </div>
                </div>
                <div className="relative z-10 px-3 mt-8">
                  <NotificationBanner
                    appName="Stampeo"
                    title={tp("demo.notificationTitle")}
                    body={tp("demo.notificationBody")}
                    timeAgo={tp("demo.timeAgo")}
                  />
                </div>
              </PhoneMockup>
            </div>
          </motion.div>
        }
      />

      {/* ============ 4. Technical Details ============ */}
      <section className="py-20 sm:py-28 bg-[var(--blog-bg)]">
        <Container>
          <ScrollReveal className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--foreground)]">
              {tp("technical.title")}
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {technicalItems.map((item, index) => {
              const Icon = technicalIcons[index] || SparklesIcon;
              return (
                <ScrollReveal key={index} delay={index * 100}>
                  <div className="relative p-8 bg-white rounded-2xl blog-card-3d transition-transform duration-300 hover:-translate-y-2 h-full">
                    {item.badge && (
                      <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-bold">
                        {item.badge}
                      </span>
                    )}
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] mb-5">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-[var(--foreground)] mb-3">
                      {item.title}
                    </h3>
                    <p className="text-[var(--muted-foreground)] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ============ 6. Privacy ============ */}
      <FeaturePrivacy
        title={tp("privacy.title")}
        subtitle={tp("privacy.subtitle")}
        points={tp.raw("privacy.points") as string[]}
        gdprLabel={tp("privacy.gdprLabel")}
      />

      {/* ============ 7. CTA ============ */}
      <FeatureCTA title={tp("cta.title")} subtitle={tp("cta.subtitle")} />

      <RelatedFeatures related={related} />
    </>
  );
}

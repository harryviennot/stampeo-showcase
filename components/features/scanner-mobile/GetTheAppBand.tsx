"use client";

import { QRCodeSVG } from "qrcode.react";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { DevicePhoneMobileIcon, QRCodeIcon } from "@/components/icons";
import { PhoneMockup } from "./PhoneMockup";
import { StoreBadges } from "./StoreBadges";

const SHOWCASE_URL =
  process.env.NEXT_PUBLIC_SHOWCASE_URL || "https://stampeo.app";
const QR_TARGET = `${SHOWCASE_URL}/go/app`;

/** Static, motion-free app screen — a calm "ready to scan" viewfinder. */
function ReadyScreen() {
  const t = useTranslations("features.scanner-mobile.custom.scanDemo");
  return (
    <div className="absolute inset-0 flex flex-col bg-[#0a0a0a]">
      <div className="flex items-center gap-2 px-5 pt-14 pb-3">
        <div className="h-2 w-2 rounded-full bg-[var(--accent)]" />
        <span className="text-[11px] font-semibold tracking-wide text-white/90">
          Stampeo
        </span>
      </div>
      <div className="relative flex flex-1 items-center justify-center px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40" />
        <div className="relative h-44 w-44">
          {[
            "top-0 left-0 border-t-[4px] border-l-[4px]",
            "top-0 right-0 border-t-[4px] border-r-[4px]",
            "bottom-0 left-0 border-b-[4px] border-l-[4px]",
            "bottom-0 right-0 border-b-[4px] border-r-[4px]",
          ].map((pos, i) => (
            <div
              key={i}
              className={`absolute h-10 w-10 border-white/80 ${pos}`}
            />
          ))}
          {/* <div className="absolute inset-x-3 top-1/2 h-[2px] bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent" /> */}
        </div>
      </div>
      <div className="flex justify-center pb-5 pt-2">
        <p className="text-center text-[10px] text-white/40">{t("hint")}</p>
      </div>
    </div>
  );
}

export function GetTheAppBand() {
  const t = useTranslations("features.scanner-mobile.custom.getApp");

  return (
    <section className="py-20 sm:py-28">
      <Container>
        <ScrollReveal>
          <div className="relative">
            {/* Outer glow */}
            <div className="pointer-events-none absolute -inset-3 rounded-[2rem] bg-[var(--accent)]/8 blur-2xl" />

            <div className="feature-cta-card relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[var(--foreground)] p-8 sm:p-12 lg:p-14">
              {/* Noise texture */}
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-overlay"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                }}
              />
              {/* Ambient glows */}
              <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-[var(--accent)]/[0.08] blur-3xl" />
              <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-[var(--stamp-sand)]/[0.05] blur-3xl" />
              {/* Floating stamps */}
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="stamp-decoration geo-float absolute -top-3 -left-3 h-20 w-20 bg-[var(--accent)] opacity-[0.12]" />
                <div
                  className="geo-float absolute top-1/2 -left-2 h-8 w-8 rotate-45 rounded-sm bg-[var(--stamp-sage)] opacity-[0.12]"
                  style={{ animationDelay: "3s" }}
                />
                <div
                  className="stamp-decoration geo-float absolute -bottom-2 right-10 h-16 w-16 bg-[var(--stamp-coral)] opacity-[0.15]"
                  style={{ animationDelay: "1s" }}
                />
              </div>

              <div className="relative z-10 grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
                {/* Left — copy + badges + QR */}
                <div className="order-2 lg:order-1">
                  <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-bold tracking-wide text-white/80">
                    <DevicePhoneMobileIcon className="h-4 w-4" />
                    {t("badge")}
                  </div>
                  <h2 className="mb-4 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
                    {t("title")}
                  </h2>
                  <p className="mb-8 max-w-md text-lg leading-relaxed text-gray-400">
                    {t("subtitle")}
                  </p>

                  <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                    <StoreBadges size="lg" />

                    {/* QR tile */}
                    <div className="flex flex-col items-center gap-2.5 sm:border-l sm:border-white/10 sm:pl-6">
                      <div className="rounded-2xl bg-white p-3 shadow-lg">
                        <QRCodeSVG
                          value={QR_TARGET}
                          size={92}
                          level="M"
                          marginSize={0}
                          bgColor="#ffffff"
                          fgColor="#191210"
                        />
                      </div>
                      <p className="flex items-center gap-1.5 text-sm font-medium text-gray-400">
                        <QRCodeIcon className="h-4 w-4 shrink-0" />
                        {t("qrCaption")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right — phone */}
                <div className="order-1 flex justify-center lg:order-2">
                  <PhoneMockup>
                    <ReadyScreen />
                  </PhoneMockup>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </Container>
    </section>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ScrollReveal } from "../ui/ScrollReveal";
import { WalletCard } from "../card/WalletCard";
import { ScaledCardWrapper } from "../card/ScaledCardWrapper";
import { AppleIcon, GoogleIcon } from "../icons";
import { useDemoSession } from "@/hooks/useDemoSession";
import { useIsMobilePhone } from "@/hooks/useIsMobilePhone";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function StampButton({
  onClick,
  stamps,
  isDisabled,
  t,
}: {
  onClick: () => void;
  stamps: number;
  isDisabled: boolean;
  t: ReturnType<typeof useTranslations<"landing.hero">>;
}) {
  const isComplete = stamps >= 8;

  return (
    <div className="relative mt-6 max-w-[380px] mx-auto animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-[var(--accent)]/10">
        <div className="text-center mb-4">
          <p className="text-sm font-bold text-[var(--muted-foreground)]">
            {isComplete
              ? t("stamp.complete")
              : t("stamp.ready")}
          </p>
        </div>

        {isComplete ? (
          <Link
            href="/onboarding"
            className="block w-full py-4 rounded-full font-bold text-lg transition-all text-center bg-[var(--accent)] text-white hover:scale-[1.02] hover:shadow-lg hover:shadow-[var(--accent)]/25 active:scale-[0.98] animate-pulse"
          >
            {t("stamp.claimFree")}
          </Link>
        ) : (
          <button
            onClick={onClick}
            disabled={isDisabled}
            className={`
              w-full py-4 rounded-full font-bold text-lg transition-all
              ${isDisabled
                ? "bg-gray-200 text-gray-400 cursor-wait"
                : "bg-[var(--accent)] text-white hover:scale-[1.02] hover:shadow-lg hover:shadow-[var(--accent)]/25 active:scale-[0.98]"
              }
            `}
          >
            {t("stamp.addStamp")}
          </button>
        )}

        <p className="text-xs text-center text-[var(--muted-foreground)] mt-3">
          {t("stamp.watchPhone")}
        </p>
      </div>
    </div>
  );
}

function MobileWalletButton({
  sessionToken,
  t,
}: {
  sessionToken: string | null;
  t: ReturnType<typeof useTranslations<"landing.hero">>;
}) {
  if (!sessionToken) return null;

  const passUrl = `${API_URL}/demo/pass/${sessionToken}`;

  return (
    <div className="relative mt-6 max-w-[380px] mx-auto animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-[var(--accent)]/10">
        <a
          href={passUrl}
          className="block w-full py-4 px-4 rounded-full font-bold text-sm sm:text-base transition-all text-center bg-[var(--accent)] text-white hover:scale-[1.02] hover:shadow-lg hover:shadow-[var(--accent)]/25 active:scale-[0.98]"
        >
          {t("stamp.mobileAddWallet")}
        </a>
        <p className="text-xs text-center text-[var(--muted-foreground)] mt-3">
          {t("stamp.mobileHint")}
        </p>
        <div className="flex items-center justify-center gap-3 mt-3">
          <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
            <AppleIcon className="w-4 h-4" />
            <span>Apple Wallet</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
            <GoogleIcon className="w-4 h-4" />
            <span>Google Wallet</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function DemoStatusHint({
  status,
  t,
}: {
  status: string;
  t: ReturnType<typeof useTranslations<"landing.hero">>;
}) {
  if (status === "pending") {
    return (
      <div className="relative mt-6 max-w-[380px] mx-auto">
        <div className="bg-white/80 backdrop-blur rounded-xl p-4 border border-[var(--accent)]/10 text-center">
          <p className="text-sm text-[var(--muted-foreground)]">
            {t.rich("stamp.scanQR", {
              bold: (chunks) => <span className="font-semibold">{chunks}</span>,
            })}
          </p>
        </div>
      </div>
    );
  }

  if (status === "pass_downloaded") {
    return (
      <div className="relative mt-6 max-w-[380px] mx-auto">
        <div className="bg-white/80 backdrop-blur rounded-xl p-4 border border-[var(--accent)]/10 text-center">
          <p className="text-sm text-[var(--muted-foreground)]">
            <span className="inline-block animate-pulse mr-2">⏳</span>
            {t("stamp.addToWallet")}
          </p>
        </div>
      </div>
    );
  }

  return null;
}

function useOfflineStampAnimation(isOffline: boolean, totalStamps: number) {
  const [animatedStamps, setAnimatedStamps] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isOffline) return;

    // Start animation after a short delay
    const startDelay = setTimeout(() => {
      let current = 0;
      timerRef.current = setInterval(() => {
        current += 1;
        setAnimatedStamps(current);
        if (current >= totalStamps) {
          if (timerRef.current) clearInterval(timerRef.current);
        }
      }, 400);
    }, 800);

    return () => {
      clearTimeout(startDelay);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOffline, totalStamps]);

  return animatedStamps;
}

export function HeroSection() {
  const { qrUrl, status, stamps, isLoading, isStamping, addStamp, sessionToken } = useDemoSession();
  const t = useTranslations("landing.hero");
  const tCommon = useTranslations("common");
  const isMobilePhone = useIsMobilePhone();

  // After 3s, stop showing skeleton so the fake QR appears as fallback
  const [qrTimedOut, setQrTimedOut] = useState(false);
  useEffect(() => {
    if (!isLoading && !isStamping) return;
    const timer = setTimeout(() => setQrTimedOut(true), 3000);
    return () => clearTimeout(timer);
  }, [isLoading, isStamping]);

  const isOffline = !isLoading && status === "error";
  const showFakeDemo = isOffline || (qrTimedOut && !qrUrl);
  const offlineStamps = useOfflineStampAnimation(showFakeDemo, 8);
  const displayStamps = showFakeDemo ? offlineStamps : stamps;

  return (
    <section className="relative min-h-screen flex flex-col pt-8 sm:pt-0">
      <main className="relative z-10 flex-1 flex items-center px-6 lg:px-10 py-12 lg:py-24">
        <div className="w-full max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left Column: Content */}
          <ScrollReveal className="flex flex-col gap-8">
            <div>
              <h1 className="text-5xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6">
                {t.rich("title", {
                  accent: (chunks) => <span className="text-[var(--accent)]">{chunks}</span>,
                })}
              </h1>

              <p className="text-lg lg:text-xl text-[var(--muted-foreground)] leading-relaxed max-w-xl">
                {t("subtitle")}
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/onboarding"
                className="group flex items-center gap-2 bg-[var(--accent)] text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl shadow-[var(--accent)]/25 hover:scale-105 transition-all"
              >
                <span>{t("cta")}</span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>

            {/* Wallet badges */}
            <div className="flex items-center gap-4 pt-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black text-white text-sm font-medium">
                <AppleIcon className="w-5 h-5" />
                <span>Apple Wallet</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-[var(--border)] text-sm font-medium">
                <GoogleIcon className="w-5 h-5" />
                <span>Google Wallet</span>
              </div>
            </div>
          </ScrollReveal>

          {/* Right Column: Card + Demo Controls */}
          <ScrollReveal delay={200} className="flex flex-col items-center">
            {/* Desktop demo hint */}
            {!isMobilePhone && !showFakeDemo && status !== "pass_installed" && status !== "pass_downloaded" && (
              <p className="text-base font-bold text-[var(--foreground)] mb-4 text-center">
                {t("stamp.demoCallout")}
                <svg className="inline-block w-5 h-5 text-[var(--accent)] animate-bounce ml-1.5 -mb-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
                </svg>
              </p>
            )}

            <div className="w-full max-w-[380px]">
              <ScaledCardWrapper baseWidth={280} targetWidth={380}>
                <WalletCard
                  design={{
                    organization_name: "Stampeo",
                    total_stamps: 8,
                    background_color: "#1c1c1e",
                    stamp_filled_color: "#f97316",
                    label_color: "#fff",
                    logo_url: "data:image/svg+xml,%3Csvg fill='none' viewBox='0 0 48 48' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath clip-rule='evenodd' d='M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z' fill='%23f97316' fill-rule='evenodd'/%3E%3C/svg%3E",
                    secondary_fields: [
                      { key: "reward", label: tCommon("reward"), value: displayStamps === 8 ? tCommon("rewarded") : tCommon("rewardText") }
                    ],
                  }}
                  stamps={displayStamps}
                  showQR={!isMobilePhone}
                  qrUrl={qrUrl}
                  isQRLoading={!qrTimedOut && (isLoading || isStamping)}
                  interactive3D={true}
                />
              </ScaledCardWrapper>
            </div>

            {/* Demo controls */}
            {isMobilePhone ? (
              // Mobile: direct wallet download or stamp button
              status === "pass_installed" ? (
                <StampButton
                  onClick={addStamp}
                  stamps={stamps}
                  isDisabled={isStamping}
                  t={t}
                />
              ) : status === "pass_downloaded" ? (
                <DemoStatusHint status={status} t={t} />
              ) : (
                <MobileWalletButton sessionToken={sessionToken} t={t} />
              )
            ) : (
              // Desktop: QR scan flow
              status === "pass_installed" ? (
                <StampButton
                  onClick={addStamp}
                  stamps={stamps}
                  isDisabled={isStamping}
                  t={t}
                />
              ) : (
                <DemoStatusHint status={status} t={t} />
              )
            )}
          </ScrollReveal>
        </div>
      </main>
    </section>
  );
}

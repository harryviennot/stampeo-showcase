"use client";

import Link from "next/link";
import { ScrollReveal } from "../ui/ScrollReveal";
import { WalletCard } from "../card/WalletCard";
import { ScaledCardWrapper } from "../card/ScaledCardWrapper";
import { AppleIcon, GoogleIcon } from "../icons";
import { useDemoSession } from "@/hooks/useDemoSession";

function GeometricDecorations() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
      <div className="absolute top-20 left-[10%] w-64 h-64 rounded-full bg-[var(--accent)]/20 blur-3xl" />
      <div className="absolute bottom-20 right-[5%] w-96 h-96 bg-[var(--accent)]/10 blur-2xl rotate-45" />
      <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-[var(--stamp-sage)]/30 rounded-full blur-2xl" />
      <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-[var(--stamp-coral)]/20 blur-3xl rotate-12" />
    </div>
  );
}

function StampButton({
  onClick,
  stamps,
  isDisabled
}: {
  onClick: () => void;
  stamps: number;
  isDisabled: boolean;
}) {
  const isComplete = stamps >= 8;

  return (
    <div className="relative mt-6 max-w-[380px] mx-auto animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-[var(--accent)]/10">
        <div className="text-center mb-4">
          <p className="text-sm font-bold text-[var(--muted-foreground)]">
            {isComplete
              ? "You've unlocked 30 days free!"
              : "Your pass is ready! Try adding a stamp."}
          </p>
        </div>

        {isComplete ? (
          <Link
            href="/onboarding"
            className="block w-full py-4 rounded-full font-bold text-lg transition-all text-center bg-[var(--accent)] text-white hover:scale-[1.02] hover:shadow-lg hover:shadow-[var(--accent)]/25 active:scale-[0.98] animate-pulse"
          >
            Claim Your 30 Days Free →
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
            Add Stamp
          </button>
        )}

        <p className="text-xs text-center text-[var(--muted-foreground)] mt-3">
          Watch your phone - the pass updates in real-time!
        </p>
      </div>
    </div>
  );
}

function DemoStatusHint({ status }: { status: string }) {
  if (status === "pending") {
    return (
      <div className="relative mt-6 max-w-[380px] mx-auto">
        <div className="bg-white/80 backdrop-blur rounded-xl p-4 border border-[var(--accent)]/10 text-center">
          <p className="text-sm text-[var(--muted-foreground)]">
            <span className="font-semibold">Scan the QR code</span> with your iPhone to try the demo
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
            Add the pass to your Apple Wallet...
          </p>
        </div>
      </div>
    );
  }

  return null;
}

export function HeroSection() {
  const { qrUrl, status, stamps, isLoading, addStamp } = useDemoSession();

  return (
    <section className="relative min-h-screen flex flex-col pt-24">
      <GeometricDecorations />

      <main className="relative z-10 flex-1 flex items-center px-6 lg:px-10 py-12 lg:py-24">
        <div className="w-full max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left Column: Content */}
          <ScrollReveal className="flex flex-col gap-8 order-2 lg:order-1">
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[var(--accent)]/10 shadow-sm mb-6">
                <span className="flex h-2 w-2 rounded-full bg-[var(--accent)] pulse-dot" />
                <span className="text-sm font-bold tracking-wide">30-day free trial</span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6">
                Loyalty cards your customers{" "}
                <span className="text-[var(--accent)]">actually keep.</span>
              </h1>

              <p className="text-lg lg:text-xl text-[var(--muted-foreground)] leading-relaxed max-w-xl">
                Digital passes that live in Apple Wallet. Upload your logo, pick your colors,
                and your card is ready in minutes. No app for your customers to download.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/onboarding"
                className="group flex items-center gap-2 bg-[var(--accent)] text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl shadow-[var(--accent)]/25 hover:scale-105 transition-all"
              >
                <span>Get Started</span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <Link
                href="#features"
                className="flex items-center gap-2 bg-white border-2 border-[var(--border)] px-8 py-4 rounded-full font-bold text-lg hover:bg-[var(--muted)] transition-all"
              >
                See how it works
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

          {/* Right Column: 3D Digital Card + Demo Controls */}
          <ScrollReveal delay={200} className="flex flex-col order-1 lg:order-2">
            <div className="w-full max-w-[380px] mx-auto">
              <ScaledCardWrapper baseWidth={380} minScale={0.7}>
                <WalletCard
                  design={{
                    organization_name: "Stampeo",
                    total_stamps: 8,
                    background_color: "#1c1c1e",
                    stamp_filled_color: "#f97316",
                    secondary_fields: [
                      { key: "reward", label: "Reward", value: "30 days free trial" }
                    ],
                  }}
                  stamps={stamps}
                  showQR={true}
                  qrUrl={qrUrl}
                  isQRLoading={isLoading}
                  interactive3D={true}
                />
              </ScaledCardWrapper>
            </div>

            {/* Demo controls */}
            {status === "pass_installed" ? (
              <StampButton
                onClick={addStamp}
                stamps={stamps}
                isDisabled={false}
              />
            ) : (
              <DemoStatusHint status={status} />
            )}
          </ScrollReveal>
        </div>
      </main>
    </section>
  );
}

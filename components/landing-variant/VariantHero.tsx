import { getTranslations } from "next-intl/server";
import { ScrollReveal } from "../ui/ScrollReveal";
import { CTAButton } from "../ui/CTAButton";
import { AppleIcon, GoogleIcon } from "../icons";
import { WalletCard } from "../card/WalletCard";
import { ScaledCardWrapper } from "../card/ScaledCardWrapper";
import { STAMPEO_LOGO } from "@/lib/stampeo-card";

export async function VariantHero() {
  const t = await getTranslations("variant.hero");
  const tCommon = await getTranslations("common");

  return (
    <section className="relative min-h-screen flex flex-col pt-8 sm:pt-0">
      <main className="relative z-10 flex-1 flex items-center px-6 lg:px-10 py-12 lg:py-24">
        <div className="w-full max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-16 lg:gap-20 items-center">
          <ScrollReveal className="flex flex-col gap-8">
            <div>
              {/* Manual weekly update — bump the number in messages/{fr,en,es}/landing.json → variant.hero.momentum each Monday (keep the three locales in sync). */}
              <span className="inline-block px-4 py-1.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-sm font-semibold mb-6">
                {t.rich("momentum", {
                  accent: (chunks) => <span className="font-bold">{chunks}</span>,
                })}
              </span>
              <h1 className="text-5xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6">
                {t.rich("title", {
                  accent: (chunks) => <span className="text-[var(--accent)]">{chunks}</span>,
                })}
              </h1>

              <p className="text-lg lg:text-xl text-[var(--muted-foreground)] leading-relaxed max-w-xl">
                {t("subtitle")}
              </p>
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              <CTAButton label={t("primaryCta")} trackAs="hero" />
            </div>

            <p className="text-sm text-[var(--muted-foreground)] font-medium">
              {t("reassurance")}
            </p>

            <div className="flex items-center gap-4 pt-2">
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

          {/* A calm static card up top; the real interactive demo lives further
              down in its own "Try it yourself" section so visitors read the
              pitch first. This button jumps them straight to it. */}
          <ScrollReveal delay={200} className="flex flex-col items-center gap-6">
            <div className="w-full max-w-[360px]">
              <ScaledCardWrapper baseWidth={280} targetWidth={360}>
                <WalletCard
                  design={{
                    organization_name: "Stampeo",
                    total_stamps: 8,
                    background_color: "#1c1c1e",
                    stamp_filled_color: "#f97316",
                    label_color: "#fff",
                    logo_url: STAMPEO_LOGO,
                    secondary_fields: [
                      { key: "reward", label: tCommon("reward"), value: tCommon("rewardText") },
                    ],
                  }}
                  stamps={5}
                  showQR={false}
                  interactive3D
                />
              </ScaledCardWrapper>
            </div>
            <a
              href="#try-it"
              className="group inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] font-semibold hover:bg-[var(--accent)]/15 transition-colors"
            >
              {t("tryDemoCta")}
              <svg
                className="w-4 h-4 group-hover:translate-y-0.5 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
              </svg>
            </a>
          </ScrollReveal>
        </div>
      </main>
    </section>
  );
}

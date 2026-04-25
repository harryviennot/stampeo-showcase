import { getTranslations } from "next-intl/server";
import { ScrollReveal } from "../ui/ScrollReveal";
import { CTAButton } from "../ui/CTAButton";
import { AppleIcon, GoogleIcon } from "../icons";
import dynamic from "next/dynamic";

const HeroDemo = dynamic(() => import("../sections/HeroDemo").then((m) => m.HeroDemo));

export async function VariantHero() {
  const t = await getTranslations("variant.hero");

  return (
    <section className="relative min-h-screen flex flex-col pt-8 sm:pt-0">
      <main className="relative z-10 flex-1 flex items-center px-6 lg:px-10 py-12 lg:py-24">
        <div className="w-full max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-16 lg:gap-20 items-center">
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

          <ScrollReveal delay={200} className="flex flex-col items-center">
            <HeroDemo />
          </ScrollReveal>
        </div>
      </main>
    </section>
  );
}

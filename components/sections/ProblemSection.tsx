import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { ScrollReveal } from "../ui/ScrollReveal";
import { DocumentIcon, DevicePhoneMobileIcon, EyeSlashIcon } from "../icons";

export async function ProblemSection() {
  const t = await getTranslations("landing.problem");
  const locale = await getLocale();
  const cardImage =
    locale === "en" ? "/CardExampleEN.png" : "/CardExampleFR.png";

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
              <p className="text-2xl font-bold text-[var(--foreground)]">{t("lostTitle")}</p>
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
              <p className="text-2xl font-bold text-[var(--foreground)]">{t("fatigueTitle")}</p>
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
              <p className="text-2xl font-bold text-[var(--foreground)]">{t("zeroVisibilityTitle")}</p>
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
            <Image
              src={cardImage}
              alt="Stampeo loyalty card in Apple Wallet"
              width={280}
              height={564}
              priority
              className="drop-shadow-2xl"
            />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

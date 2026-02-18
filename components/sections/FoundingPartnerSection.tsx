"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ScrollReveal } from "../ui/ScrollReveal";

export function FoundingPartnerSection() {
  const t = useTranslations("landing.foundingPartner");

  const valueProps = t.raw("valueProps") as string[];

  return (
    <section className="relative py-24 lg:py-32">
      <div className="max-w-[1000px] mx-auto px-6">
        <ScrollReveal className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 mb-4 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-bold uppercase tracking-widest">
            {t("badge")}
          </span>
          <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-6">
            {t.rich("title", {
              br: () => <br className="hidden md:block" />,
            })}
          </h2>
          <p className="text-[var(--muted-foreground)] text-lg lg:text-xl font-medium max-w-2xl mx-auto">
            {t.rich("subtitle", {
              br: () => <br className="hidden md:block" />,
            })}
          </p>
        </ScrollReveal>

        <ScrollReveal delay={200} className="max-w-lg mx-auto">
          <div className="rounded-3xl border-[3px] border-[var(--accent)] bg-white blog-card-3d p-8 lg:p-10">
            <ul className="flex flex-col gap-4 mb-8">
              {valueProps.map((prop) => (
                <li key={prop} className="flex items-start gap-3 text-[15px] font-medium">
                  <span className="text-[var(--accent)] text-lg">&#10003;</span>
                  <span>{prop}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/onboarding"
              className="w-full flex cursor-pointer items-center justify-center rounded-full h-14 px-6 bg-[var(--accent)] text-white text-base font-extrabold shadow-lg shadow-[var(--accent)]/30 transition-all hover:scale-[1.02] active:scale-95"
            >
              <span>{t("cta")}</span>
            </Link>

            <p className="mt-4 text-center text-sm text-[var(--muted-foreground)]">
              {t("urgency")}
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

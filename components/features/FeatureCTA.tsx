import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

interface FeatureCTAProps {
  title: string;
  subtitle: string;
  buttonText?: string;
  urgencyText?: string;
  className?: string;
}

export function FeatureCTA({
  title,
  subtitle,
  buttonText,
  urgencyText,
  className,
}: FeatureCTAProps) {
  const t = useTranslations("features");
  const label = buttonText ?? t("ctaButton");

  return (
    <section className={`py-16 sm:py-24 ${className ?? ""}`}>
      <Container className="max-w-3xl">
        <ScrollReveal>
          {/* Outer glow */}
          <div className="relative">
            <div className="absolute -inset-3 bg-[var(--accent)]/8 blur-2xl rounded-[2rem] pointer-events-none" />

            <div className="feature-cta-card relative overflow-hidden rounded-3xl bg-[var(--foreground)] border border-white/[0.08] p-10 sm:p-14 text-center">
              {/* Noise texture overlay */}
              <div
                className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                }}
              />
              {/* Diagonal gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-white/[0.02] pointer-events-none" />

              {/* Internal ambient glow — top-right accent wash */}
              <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-[var(--accent)]/[0.07] blur-3xl pointer-events-none" />
              {/* Bottom-left secondary glow */}
              <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-[var(--stamp-sand)]/[0.05] blur-3xl pointer-events-none" />

              {/* Stamp decorations — brand identity */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Top-left stamp */}
                <div
                  className="stamp-decoration absolute -top-3 -left-3 w-20 h-20 bg-[var(--accent)] opacity-[0.12] geo-float"
                />
                {/* Top-right circle */}
                <div
                  className="absolute top-8 right-10 w-5 h-5 rounded-full border-2 border-[var(--stamp-sand)] opacity-[0.2] geo-float"
                  style={{ animationDelay: "2s" }}
                />
                {/* Mid-left diamond */}
                <div
                  className="absolute top-1/2 -left-2 w-8 h-8 rotate-45 rounded-sm bg-[var(--stamp-sage)] opacity-[0.12] geo-float"
                  style={{ animationDelay: "3.5s" }}
                />
                {/* Bottom-right stamp */}
                <div
                  className="stamp-decoration absolute -bottom-2 -right-2 w-18 h-18 bg-[var(--stamp-coral)] opacity-[0.15] geo-float"
                  style={{ animationDelay: "1s" }}
                />
                {/* Center-right small circle */}
                <div
                  className="absolute bottom-12 left-[12%] w-3 h-3 rounded-full bg-[var(--accent)] opacity-[0.25] geo-float"
                  style={{ animationDelay: "4s" }}
                />
                {/* Accent dot top center */}
                <div
                  className="absolute top-14 left-1/3 w-2 h-2 rounded-full bg-[var(--stamp-sand)] opacity-[0.3] geo-float"
                  style={{ animationDelay: "2.5s" }}
                />
              </div>

              <div className="relative z-10">
                <h2 className="text-white text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
                  {title}
                </h2>
                <p className="text-gray-400 mb-10 max-w-lg mx-auto text-lg leading-relaxed">
                  {subtitle}
                </p>

                <Link
                  href="/onboarding"
                  className="feature-cta-button group inline-flex items-center gap-2 bg-[var(--accent)] text-white px-10 py-4 rounded-full font-bold text-lg shadow-lg shadow-[var(--accent)]/25 transition-all"
                >
                  <span>{label}</span>
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </Link>

                {urgencyText && (
                  <p className="mt-6 text-sm text-gray-500 font-medium">
                    {urgencyText}
                  </p>
                )}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </Container>
    </section>
  );
}

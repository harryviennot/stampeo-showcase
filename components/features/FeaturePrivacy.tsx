import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { ShieldCheckIcon, CheckIcon } from "@/components/icons";

interface FeaturePrivacyProps {
  title: string;
  subtitle?: string;
  points: string[];
  gdprLabel?: string;
  className?: string;
}

export function FeaturePrivacy({
  title,
  subtitle,
  points,
  gdprLabel = "GDPR",
  className,
}: FeaturePrivacyProps) {
  return (
    <section className={`py-20 sm:py-28 ${className ?? ""}`}>
      <Container>
        <ScrollReveal>
          <div className="bg-white rounded-2xl blog-card-3d p-8 sm:p-10 lg:p-12">
            <div className="flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-12">
              {/* Left — content */}
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--stamp-sage)]/10 text-[var(--stamp-sage)]">
                    <ShieldCheckIcon className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
                    {title}
                  </h2>
                </div>

                {subtitle && (
                  <p className="text-[var(--muted-foreground)] mb-5 leading-relaxed">
                    {subtitle}
                  </p>
                )}

                <ul className="space-y-3.5">
                  {points.map((point, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--stamp-sage)]/10 mt-0.5 flex-shrink-0">
                        <CheckIcon className="w-3.5 h-3.5 text-[var(--stamp-sage)]" />
                      </span>
                      <span className="text-[var(--muted-foreground)] leading-relaxed">
                        {point}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right — GDPR badge */}
              <div className="flex justify-center lg:justify-end flex-shrink-0">
                <div className="flex flex-col items-center justify-center w-28 h-28 sm:w-32 sm:h-32 rounded-full border-2 border-[var(--near-black)] bg-white">
                  <ShieldCheckIcon className="w-8 h-8 sm:w-9 sm:h-9 text-[var(--stamp-sage)] mb-1" />
                  <span className="text-sm sm:text-base font-extrabold tracking-wider text-[var(--foreground)]">
                    {gdprLabel}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </Container>
    </section>
  );
}

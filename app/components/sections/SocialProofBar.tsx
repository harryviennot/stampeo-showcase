import { Container } from "../ui/Container";

const stats = [
  { value: "200+", label: "Businesses" },
  { value: "50K+", label: "Cards issued" },
  { value: "4.9", label: "Rating", suffix: "/5" },
];

export function SocialProofBar() {
  return (
    <section className="py-16 relative overflow-hidden">
      <Container>
        <div className="premium-card rounded-3xl p-8 sm:p-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <p className="text-sm font-medium text-[var(--muted-foreground)] mb-1">
                Trusted by businesses worldwide
              </p>
              <p className="text-lg font-semibold text-[var(--foreground)]">
                Join 200+ independent businesses already using Stampeo
              </p>
            </div>

            <div className="flex items-center gap-8 sm:gap-12">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-3xl sm:text-4xl font-bold gradient-text">
                    {stat.value}
                    {stat.suffix && (
                      <span className="text-lg text-[var(--muted-foreground)]">
                        {stat.suffix}
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-[var(--muted-foreground)] mt-1">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

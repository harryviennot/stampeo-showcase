"use client";

import { Container } from "../ui/Container";
import { Button } from "../ui/Button";
import { CheckIcon } from "../icons";
import { ScrollReveal } from "../ui/ScrollReveal";

const plans = [
  {
    name: "Pay",
    price: "20",
    description: "For single-location businesses",
    features: [
      { text: "1 card template", included: true },
      { text: "Unlimited customers", included: true },
      { text: "Unlimited scans", included: true },
      { text: "Up to 3 scanner accounts", included: true },
      { text: "Basic analytics", included: true },
      { text: "Push notifications", included: true },
      { text: "Scheduled campaigns", included: false },
      { text: "Multi-location support", included: false },
    ],
    cta: "Start free trial",
    featured: false,
  },
  {
    name: "Pro",
    price: "40",
    description: "For growing & multi-location businesses",
    features: [
      { text: "Multiple card templates", included: true },
      { text: "Unlimited customers", included: true },
      { text: "Unlimited scans", included: true },
      { text: "Unlimited scanner accounts", included: true },
      { text: "Advanced analytics", included: true },
      { text: "Push notifications", included: true },
      { text: "Scheduled campaigns", included: true },
      { text: "Multi-location & geofencing", included: true },
    ],
    cta: "Start free trial",
    featured: true,
  },
];

export function PricingSection() {
  return (
    <section
      id="pricing"
      className="py-20 sm:py-28 lg:py-36 relative"
    >
      <Container>
        <ScrollReveal className="text-center max-w-2xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--muted)] border border-[var(--border)] text-[var(--muted-foreground)] text-sm font-medium mb-6">
            Simple pricing
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--foreground)]">
            Start free. Scale when you&apos;re ready.
          </h2>
          <p className="mt-6 text-lg text-[var(--muted-foreground)]">
            14-day free trial. No credit card required.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <ScrollReveal
              key={plan.name}
              delay={index * 100}
              variant="scale"
            >
              <div
                className={`relative h-full p-8 rounded-3xl ${
                  plan.featured
                    ? "bg-[var(--foreground)] text-[var(--background)]"
                    : "clean-card"
                }`}
              >
                {plan.featured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-[var(--accent)] text-white text-xs font-bold uppercase tracking-wide">
                    Most popular
                  </div>
                )}

                <div className="mb-8">
                  <h3
                    className={`text-xl font-semibold ${
                      plan.featured ? "text-[var(--background)]" : "text-[var(--foreground)]"
                    }`}
                  >
                    {plan.name}
                  </h3>
                  <p
                    className={`text-sm mt-1 ${
                      plan.featured
                        ? "text-[var(--background)]/70"
                        : "text-[var(--muted-foreground)]"
                    }`}
                  >
                    {plan.description}
                  </p>
                </div>

                <div className="mb-8">
                  <span
                    className={`text-5xl font-bold ${
                      plan.featured ? "text-[var(--background)]" : "text-[var(--foreground)]"
                    }`}
                  >
                    &euro;{plan.price}
                  </span>
                  <span
                    className={`text-sm ${
                      plan.featured
                        ? "text-[var(--background)]/70"
                        : "text-[var(--muted-foreground)]"
                    }`}
                  >
                    /month
                  </span>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                          feature.included
                            ? plan.featured
                              ? "bg-[var(--accent)]"
                              : "bg-[#22c55e]"
                            : plan.featured
                              ? "bg-[var(--background)]/10"
                              : "bg-[var(--muted)]"
                        }`}
                      >
                        {feature.included ? (
                          <CheckIcon
                            className={`w-3 h-3 ${
                              plan.featured ? "text-white" : "text-white"
                            }`}
                          />
                        ) : (
                          <span
                            className={`w-1.5 h-0.5 rounded-full ${
                              plan.featured
                                ? "bg-[var(--background)]/30"
                                : "bg-[var(--muted-foreground)]/50"
                            }`}
                          />
                        )}
                      </div>
                      <span
                        className={`text-sm ${
                          feature.included
                            ? plan.featured
                              ? "text-[var(--background)]/90"
                              : "text-[var(--foreground)]"
                            : plan.featured
                              ? "text-[var(--background)]/40"
                              : "text-[var(--muted-foreground)]/60"
                        }`}
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  href="/signup"
                  variant={plan.featured ? "secondary" : "primary"}
                  className={`w-full ${
                    plan.featured
                      ? "!bg-[var(--background)] !text-[var(--foreground)] hover:!bg-[var(--background)]/90"
                      : ""
                  }`}
                >
                  {plan.cta}
                </Button>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <p className="text-center mt-8 text-sm text-[var(--muted-foreground)]">
          Both plans include a 14-day free trial. Cancel anytime.
        </p>
      </Container>
    </section>
  );
}

"use client";

import { Container } from "../ui/Container";
import { Button } from "../ui/Button";
import { CheckIcon } from "../icons";
import { ScrollReveal } from "../ui/ScrollReveal";

const plans = [
  {
    name: "Free",
    price: "0",
    description: "Perfect for getting started",
    features: [
      "1 card design",
      "Up to 100 customers",
      "Basic analytics",
      "Email support",
    ],
    cta: "Start free",
    featured: false,
  },
  {
    name: "Pro",
    price: "19",
    description: "For growing businesses",
    features: [
      "Unlimited card designs",
      "Unlimited customers",
      "Advanced analytics",
      "Push notifications",
      "Custom branding",
      "Priority support",
    ],
    cta: "Start free trial",
    featured: true,
  },
  {
    name: "Business",
    price: "49",
    description: "For multi-location businesses",
    features: [
      "Everything in Pro",
      "Multiple locations",
      "Team access",
      "API access",
      "White-label option",
      "Dedicated support",
    ],
    cta: "Contact sales",
    featured: false,
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/50 text-emerald-700 text-sm font-medium mb-6 dark:from-emerald-900/20 dark:to-teal-900/20 dark:border-emerald-800/30 dark:text-emerald-400">
            Simple pricing
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--foreground)]">
            Start free. Grow when you&apos;re ready.
          </h2>
          <p className="mt-6 text-lg text-[var(--muted-foreground)]">
            No hidden fees. Cancel anytime.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <ScrollReveal
              key={plan.name}
              delay={index * 100}
              variant="scale"
              className={`relative rounded-3xl transition-all duration-300 ${
                plan.featured
                  ? "lg:scale-105 lg:-my-4"
                  : ""
              }`}
            >
              {plan.featured && (
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-500 rounded-3xl blur-xl opacity-20" />
              )}

              <div
                className={`relative h-full p-8 rounded-3xl ${
                  plan.featured
                    ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-2xl shadow-amber-500/30"
                    : "premium-card"
                }`}
              >
                {plan.featured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-white text-amber-600 text-xs font-bold uppercase tracking-wide shadow-lg">
                    Most popular
                  </div>
                )}

                <div className="mb-8">
                  <h3
                    className={`text-xl font-semibold ${
                      plan.featured ? "text-white" : "text-[var(--foreground)]"
                    }`}
                  >
                    {plan.name}
                  </h3>
                  <p
                    className={`text-sm mt-1 ${
                      plan.featured
                        ? "text-white/80"
                        : "text-[var(--muted-foreground)]"
                    }`}
                  >
                    {plan.description}
                  </p>
                </div>

                <div className="mb-8">
                  <span
                    className={`text-5xl font-bold ${
                      plan.featured ? "text-white" : "text-[var(--foreground)]"
                    }`}
                  >
                    €{plan.price}
                  </span>
                  <span
                    className={`text-sm ${
                      plan.featured
                        ? "text-white/80"
                        : "text-[var(--muted-foreground)]"
                    }`}
                  >
                    /month
                  </span>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                          plan.featured
                            ? "bg-white/20"
                            : "bg-emerald-100 dark:bg-emerald-900/30"
                        }`}
                      >
                        <CheckIcon
                          className={`w-3 h-3 ${
                            plan.featured
                              ? "text-white"
                              : "text-emerald-600 dark:text-emerald-400"
                          }`}
                        />
                      </div>
                      <span
                        className={`text-sm ${
                          plan.featured
                            ? "text-white/90"
                            : "text-[var(--muted-foreground)]"
                        }`}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  href="#"
                  variant={plan.featured ? "secondary" : "primary"}
                  className={`w-full ${
                    plan.featured
                      ? "!bg-white !text-amber-600 hover:!bg-white/90 !border-0 !shadow-lg"
                      : ""
                  }`}
                >
                  {plan.cta}
                </Button>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

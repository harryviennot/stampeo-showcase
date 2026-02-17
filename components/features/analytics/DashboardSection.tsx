"use client";

import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Check, TrendUp } from "@phosphor-icons/react";

const AVATAR_COLORS = ["#8b5cf6", "#f59e0b", "#ec4899", "#3b82f6"];

const CUSTOMERS = [
  { name: "Sophie M.", stamps: 7, total: 8, recent: true },
  { name: "Marc D.", stamps: 4, total: 8, recent: false },
  { name: "Claire T.", stamps: 6, total: 8, recent: true },
  { name: "Thomas R.", stamps: 2, total: 8, recent: false },
];

function Sparkline({ trend }: { trend: "up" | "down" }) {
  const d =
    trend === "up"
      ? "M0 16 L6 12 L12 14 L18 8 L24 10 L30 4 L36 2"
      : "M0 4 L6 6 L12 5 L18 10 L24 8 L30 14 L36 16";
  const color = trend === "up" ? "#22c55e" : "#ef4444";
  return (
    <svg width="36" height="18" viewBox="0 0 36 18" className="flex-shrink-0">
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function DashboardSection() {
  const t = useTranslations("features.analytiques.custom.dashboard");
  const td = useTranslations("landing.dashboard");

  const features = t.raw("features") as string[];

  return (
    <section className="py-16 sm:py-24">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: text */}
          <ScrollReveal variant="left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-sm font-bold mb-6">
              {t("badge")}
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--foreground)] mb-4">
              {t("title")}
            </h2>
            <p className="text-lg text-[var(--muted-foreground)] leading-relaxed mb-8">
              {t("description")}
            </p>
            <div className="space-y-4">
              {features.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-6 h-6 bg-[#22c55e] rounded-full flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-white" weight="bold" />
                  </div>
                  <span className="text-[var(--foreground)] font-medium">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </ScrollReveal>

          {/* Right: polished dashboard mockup */}
          <ScrollReveal variant="right" delay={150} className="relative">
            <div className="bg-white blog-card-3d rounded-3xl overflow-hidden">
              {/* Browser chrome */}
              <div className="relative flex items-center px-5 py-3.5 bg-[var(--muted)] border-b border-[var(--border)]">
                <div className="flex gap-2 absolute left-5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-[var(--background)] rounded-lg px-4 py-1.5 text-xs text-[var(--muted-foreground)] text-center border border-[var(--border)]">
                    app.stampeo.app
                  </div>
                </div>
              </div>

              {/* Dashboard content */}
              <div className="p-5 bg-[var(--background)]">
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
                    { label: td("stats.totalCustomers"), value: "1,234", change: "+12%", trend: "up" as const },
                    { label: td("stats.visitsThisWeek"), value: "89", change: "+23%", trend: "up" as const },
                    { label: td("stats.rewardsClaimed"), value: "156", change: "+8%", trend: "up" as const },
                  ].map((stat, index) => (
                    <div
                      key={index}
                      className="bg-[var(--muted)] rounded-2xl p-4"
                    >
                      <p className="text-[10px] font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                        {stat.label}
                      </p>
                      <div className="flex items-end justify-between mt-2">
                        <p className="text-xl font-bold text-[var(--foreground)] leading-none">
                          {stat.value}
                        </p>
                        <Sparkline trend={stat.trend} />
                      </div>
                      <div className="flex items-center gap-1 mt-1.5">
                        <TrendUp className="w-3 h-3 text-green-600" weight="bold" />
                        <span className="text-[10px] font-bold text-green-600">
                          {stat.change}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Customer list */}
                <div>
                  <div className="flex items-center justify-between text-[10px] text-[var(--muted-foreground)] px-1 font-semibold uppercase tracking-wider mb-2">
                    <span>{td("recentCustomers")}</span>
                    <span>{td("progress")}</span>
                  </div>
                  <div className="space-y-2">
                    {CUSTOMERS.map((customer, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-[var(--muted)] rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white"
                            style={{ backgroundColor: AVATAR_COLORS[index] }}
                          >
                            {customer.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[var(--foreground)] leading-tight">
                              {customer.name}
                            </p>
                            {customer.recent && (
                              <p className="text-[10px] text-green-600 font-medium">
                                {td("visitedToday")}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5">
                          {customer.stamps === customer.total - 1 && (
                            <span className="text-[10px] bg-[var(--accent)]/10 text-[var(--accent)] px-2 py-0.5 rounded-full font-bold">
                              {td("almost")}
                            </span>
                          )}
                          {/* Stamp dots */}
                          <div className="hidden sm:flex gap-0.5">
                            {Array.from({ length: customer.total }).map((_, i) => (
                              <div
                                key={i}
                                className={`w-2 h-2 rounded-full ${
                                  i < customer.stamps
                                    ? "bg-[var(--accent)]"
                                    : "bg-[var(--border)]"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs font-bold text-[var(--foreground)] min-w-[28px] text-right tabular-nums">
                            {customer.stamps}/{customer.total}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </Container>
    </section>
  );
}

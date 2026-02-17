"use client";

import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { LiveActivityFeed } from "./LiveActivityFeed";

export function DashboardSection() {
  const t = useTranslations("features.analytiques.custom.dashboard");
  const td = useTranslations("landing.dashboard");

  const features = t.raw("features") as string[];

  return (
    <section className="py-16 sm:py-24">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-start">
          {/* Left: text */}
          <ScrollReveal variant="left" className="lg:col-span-2">
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
                    <svg
                      className="w-3.5 h-3.5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-[var(--foreground)] font-medium">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </ScrollReveal>

          {/* Right: dashboard mockup + activity feed */}
          <ScrollReveal variant="right" delay={150} className="lg:col-span-3 space-y-6">
            {/* Dashboard mockup */}
            <div className="bg-white blog-card-3d rounded-3xl overflow-hidden">
              {/* Browser chrome */}
              <div className="flex items-center gap-3 px-5 py-4 bg-[var(--muted)] border-b border-[var(--border)]">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-[var(--background)] rounded-lg px-4 py-1.5 text-xs text-[var(--muted-foreground)] text-center max-w-[200px] mx-auto border border-[var(--border)]">
                    dashboard.stampeo.com
                  </div>
                </div>
              </div>

              {/* Dashboard content */}
              <div className="p-6 bg-[var(--background)]">
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[
                    { label: td("stats.totalCustomers"), value: "1,234", change: "+12%" },
                    { label: td("stats.visitsThisWeek"), value: "89", change: "+23%" },
                    { label: td("stats.rewardsClaimed"), value: "156", change: "+8%" },
                  ].map((stat, index) => (
                    <div key={index} className="bg-[var(--muted)] rounded-2xl p-4">
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {stat.label}
                      </p>
                      <div className="flex items-end gap-2 mt-1">
                        <p className="text-2xl font-bold text-[var(--foreground)]">
                          {stat.value}
                        </p>
                        <span className="text-xs text-green-600 font-medium mb-1">
                          {stat.change}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Customer list */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] px-2 font-medium">
                    <span>{td("recentCustomers")}</span>
                    <span>{td("progress")}</span>
                  </div>
                  {[
                    { name: "Sophie M.", stamps: 7, total: 8, recent: true },
                    { name: "Marc D.", stamps: 4, total: 8, recent: false },
                    { name: "Claire T.", stamps: 6, total: 8, recent: true },
                    { name: "Thomas R.", stamps: 2, total: 8, recent: false },
                  ].map((customer, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-[var(--muted)] rounded-2xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#8b5cf6] rounded-xl flex items-center justify-center text-sm font-semibold text-white">
                          {customer.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[var(--foreground)]">
                            {customer.name}
                          </p>
                          {customer.recent && (
                            <p className="text-xs text-green-600">
                              {td("visitedToday")}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {customer.stamps === 7 && (
                          <span className="text-xs bg-[var(--accent)]/10 text-[var(--accent)] px-2 py-1 rounded-full font-medium">
                            {td("almost")}
                          </span>
                        )}
                        <div className="w-20 h-2 bg-[var(--border)] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[var(--accent)] rounded-full"
                            style={{
                              width: `${(customer.stamps / customer.total) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium text-[var(--foreground)] min-w-[35px]">
                          {customer.stamps}/{customer.total}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Activity feed */}
            <LiveActivityFeed />
          </ScrollReveal>
        </div>
      </Container>
    </section>
  );
}

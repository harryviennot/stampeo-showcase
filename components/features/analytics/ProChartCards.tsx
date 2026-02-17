"use client";

import { useEffect, useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { motion, useInView } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

// Heatmap data: 7 days x 5 time slots, values 0.1-0.9
const HEATMAP_DATA = [
  [0.3, 0.5, 0.8, 0.6, 0.2],
  [0.4, 0.7, 0.9, 0.7, 0.3],
  [0.2, 0.6, 0.8, 0.5, 0.2],
  [0.5, 0.8, 0.9, 0.8, 0.4],
  [0.6, 0.9, 0.7, 0.6, 0.3],
  [0.8, 0.7, 0.4, 0.3, 0.1],
  [0.7, 0.6, 0.3, 0.2, 0.1],
];

/* ─── Row 1 (all screens): existing charts ─── */

function LineChart({ label, trend }: { label: string; trend: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const points = "10,80 40,60 70,45 100,50 130,30 160,25 190,15";
  const areaPoints = `10,90 ${points} 190,90`;

  return (
    <div ref={ref} className="blog-card-3d rounded-2xl bg-white p-6 relative overflow-hidden">
      <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[var(--stamp-sage)]/10 text-[var(--stamp-sage)] text-xs font-bold">
        Pro
      </span>
      <p className="text-sm font-semibold text-[var(--muted-foreground)] mb-4">
        {label}
      </p>
      <svg viewBox="0 0 200 100" className="w-full h-auto mb-3">
        {[25, 50, 75].map((y) => (
          <line
            key={y}
            x1="10"
            y1={y}
            x2="190"
            y2={y}
            stroke="var(--border)"
            strokeWidth="0.5"
            strokeDasharray="4 4"
          />
        ))}
        <motion.polygon
          points={areaPoints}
          fill="var(--accent)"
          fillOpacity={0.1}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.5 }}
        />
        <motion.polyline
          points={points}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={isInView ? { pathLength: 1 } : {}}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <div className="flex items-center gap-2">
        <span className="text-green-600 text-sm font-bold">{trend}</span>
        <span className="text-xs text-[var(--muted-foreground)]">vs semaine dernière</span>
      </div>
    </div>
  );
}

function Heatmap({ label, days }: { label: string; days: string[] }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const cellSize = 22;
  const gap = 4;

  return (
    <div ref={ref} className="blog-card-3d rounded-2xl bg-white p-6 relative overflow-hidden">
      <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[var(--stamp-sage)]/10 text-[var(--stamp-sage)] text-xs font-bold">
        Pro
      </span>
      <p className="text-sm font-semibold text-[var(--muted-foreground)] mb-4">
        {label}
      </p>
      <svg
        viewBox={`0 0 ${7 * (cellSize + gap)} ${5 * (cellSize + gap) + 20}`}
        className="w-full h-auto mb-1"
      >
        {HEATMAP_DATA.map((row, dayIdx) =>
          row.map((val, slotIdx) => (
            <motion.rect
              key={`${dayIdx}-${slotIdx}`}
              x={dayIdx * (cellSize + gap)}
              y={slotIdx * (cellSize + gap)}
              width={cellSize}
              height={cellSize}
              rx={5}
              fill="var(--accent)"
              initial={{ fillOpacity: 0 }}
              animate={isInView ? { fillOpacity: val } : {}}
              transition={{
                duration: 0.4,
                delay: (slotIdx * 7 + dayIdx) * 0.03,
              }}
            />
          ))
        )}
        {days.map((day, i) => (
          <text
            key={i}
            x={i * (cellSize + gap) + cellSize / 2}
            y={5 * (cellSize + gap) + 14}
            textAnchor="middle"
            fill="var(--muted-foreground)"
            fontSize="10"
            fontWeight="500"
          >
            {day}
          </text>
        ))}
      </svg>
    </div>
  );
}

function DonutChart({ label, valueLabel }: { label: string; valueLabel: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [count, setCount] = useState(0);

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const targetPercent = 72;
  const targetOffset = circumference * (1 - targetPercent / 100);

  useEffect(() => {
    if (!isInView) return;
    let current = 0;
    const step = () => {
      current += 1;
      if (current <= targetPercent) {
        setCount(current);
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }, [isInView]);

  return (
    <div ref={ref} className="blog-card-3d rounded-2xl bg-white p-6 relative overflow-hidden">
      <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[var(--stamp-sage)]/10 text-[var(--stamp-sage)] text-xs font-bold">
        Pro
      </span>
      <p className="text-sm font-semibold text-[var(--muted-foreground)] mb-4">
        {label}
      </p>
      <div className="flex justify-center">
        <svg viewBox="0 0 100 100" className="w-32 h-32">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="var(--border)"
            strokeWidth="8"
          />
          <motion.circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="var(--stamp-sage)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={isInView ? { strokeDashoffset: targetOffset } : {}}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{
              transformOrigin: "50% 50%",
              transform: "rotate(-90deg)",
            }}
          />
          <text
            x="50"
            y="50"
            textAnchor="middle"
            dominantBaseline="central"
            fill="var(--foreground)"
            fontSize="16"
            fontWeight="700"
          >
            {count}%
          </text>
        </svg>
      </div>
      <p className="text-center text-xs text-[var(--muted-foreground)] mt-2">
        {valueLabel}
      </p>
    </div>
  );
}

/* ─── Row 2 (desktop only): customer segments, churn risk, best days ─── */

function SegmentsChart({ label, categories }: { label: string; categories: string[] }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const data = [
    { pct: 28, color: "var(--accent)", opacity: 0.4 },
    { pct: 24, color: "var(--accent)", opacity: 0.65 },
    { pct: 33, color: "var(--stamp-sage)", opacity: 0.8 },
    { pct: 15, color: "var(--stamp-sage)", opacity: 1 },
  ];

  return (
    <div ref={ref} className="blog-card-3d rounded-2xl bg-white p-6 relative overflow-hidden">
      <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[var(--stamp-sage)]/10 text-[var(--stamp-sage)] text-xs font-bold">
        Pro
      </span>
      <p className="text-sm font-semibold text-[var(--muted-foreground)] mb-4">
        {label}
      </p>
      <div className="space-y-2.5">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-[11px] font-medium text-[var(--muted-foreground)] w-[80px] text-right shrink-0 truncate">
              {categories[i]}
            </span>
            <div className="flex-1 h-6 bg-[var(--muted)] rounded-lg overflow-hidden">
              <motion.div
                className="h-full rounded-lg"
                style={{ backgroundColor: d.color, opacity: d.opacity }}
                initial={{ width: 0 }}
                animate={isInView ? { width: `${d.pct}%` } : {}}
                transition={{ duration: 0.7, delay: i * 0.1, ease: "easeOut" }}
              />
            </div>
            <span className="text-xs font-bold text-[var(--foreground)] w-8 tabular-nums">
              {d.pct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChurnChart({ label, value, subtitle }: { label: string; value: string; subtitle: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [count, setCount] = useState(0);
  const target = parseInt(value, 10);

  useEffect(() => {
    if (!isInView) return;
    let current = 0;
    const step = () => {
      current += 1;
      if (current <= target) {
        setCount(current);
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }, [isInView, target]);

  return (
    <div ref={ref} className="blog-card-3d rounded-2xl bg-white p-6 relative overflow-hidden">
      <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[var(--stamp-sage)]/10 text-[var(--stamp-sage)] text-xs font-bold">
        Pro
      </span>
      <p className="text-sm font-semibold text-[var(--muted-foreground)] mb-4">
        {label}
      </p>
      <div className="flex items-end gap-4">
        <span className="text-5xl font-extrabold text-[#ef4444] leading-none tabular-nums">
          {count}
        </span>
        <svg width="80" height="32" viewBox="0 0 80 32" className="flex-shrink-0 mb-1">
          <motion.path
            d="M0 4 L13 8 L26 6 L40 14 L53 18 L66 24 L80 30"
            fill="none"
            stroke="#ef4444"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={isInView ? { pathLength: 1 } : {}}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>
      </div>
      <p className="text-xs text-[var(--muted-foreground)] mt-2">{subtitle}</p>
    </div>
  );
}

function BestDaysChart({ label, days }: { label: string; days: string[] }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const values = [32, 45, 38, 41, 52, 28, 14];
  const maxVal = Math.max(...values);
  const minVal = Math.min(...values);
  const maxH = 60;

  return (
    <div ref={ref} className="blog-card-3d rounded-2xl bg-white p-6 relative overflow-hidden">
      <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[var(--stamp-sage)]/10 text-[var(--stamp-sage)] text-xs font-bold">
        Pro
      </span>
      <p className="text-sm font-semibold text-[var(--muted-foreground)] mb-4">
        {label}
      </p>
      <div className="flex items-end justify-between gap-2" style={{ height: maxH + 20 }}>
        {values.map((val, i) => {
          const h = (val / maxVal) * maxH;
          const isBest = val === maxVal;
          const isWorst = val === minVal;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <motion.div
                className="w-full rounded-md"
                style={{
                  backgroundColor: isBest
                    ? "var(--stamp-sage)"
                    : isWorst
                      ? "#ef4444"
                      : "var(--accent)",
                  opacity: isBest || isWorst ? 1 : 0.3,
                }}
                initial={{ height: 0 }}
                animate={isInView ? { height: h } : {}}
                transition={{ duration: 0.5, delay: i * 0.06, ease: "easeOut" }}
              />
              <span
                className="text-[10px] font-semibold"
                style={{
                  color: isBest
                    ? "var(--stamp-sage)"
                    : isWorst
                      ? "#ef4444"
                      : "var(--muted-foreground)",
                }}
              >
                {days[i]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Row 3 (desktop only): time to reward, completion rate, return rate ─── */

function TimeToRewardChart({ label, value, unit }: { label: string; value: string; unit: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [count, setCount] = useState(0);
  const target = parseInt(value, 10);

  useEffect(() => {
    if (!isInView) return;
    let current = 0;
    const step = () => {
      current += 1;
      if (current <= target) {
        setCount(current);
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }, [isInView, target]);

  return (
    <div ref={ref} className="blog-card-3d rounded-2xl bg-white p-6 relative overflow-hidden">
      <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[var(--stamp-sage)]/10 text-[var(--stamp-sage)] text-xs font-bold">
        Pro
      </span>
      <p className="text-sm font-semibold text-[var(--muted-foreground)] mb-4">
        {label}
      </p>
      <div className="flex items-end gap-1 mb-3">
        <span className="text-5xl font-extrabold text-[var(--foreground)] leading-none tabular-nums">
          {count}
        </span>
        <span className="text-sm font-medium text-[var(--muted-foreground)] mb-1">
          {unit}
        </span>
      </div>
      <svg viewBox="0 0 200 50" className="w-full h-auto">
        <motion.polygon
          points="0,50 20,42 40,35 60,25 80,18 100,12 120,10 140,14 160,22 180,34 200,50"
          fill="var(--accent)"
          fillOpacity={0.12}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
        />
        <motion.polyline
          points="20,42 40,35 60,25 80,18 100,12 120,10 140,14 160,22 180,34"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={isInView ? { pathLength: 1 } : {}}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
    </div>
  );
}

function CompletionRateChart({ label, value, subtitle }: { label: string; value: string; subtitle: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [count, setCount] = useState(0);
  const target = parseInt(value, 10);

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const targetOffset = circumference * (1 - target / 100);

  useEffect(() => {
    if (!isInView) return;
    let current = 0;
    const step = () => {
      current += 1;
      if (current <= target) {
        setCount(current);
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }, [isInView, target]);

  return (
    <div ref={ref} className="blog-card-3d rounded-2xl bg-white p-6 relative overflow-hidden">
      <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[var(--stamp-sage)]/10 text-[var(--stamp-sage)] text-xs font-bold">
        Pro
      </span>
      <p className="text-sm font-semibold text-[var(--muted-foreground)] mb-4">
        {label}
      </p>
      <div className="flex items-center gap-5">
        <svg viewBox="0 0 100 100" className="w-28 h-28 shrink-0">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--border)" strokeWidth="8" />
          <motion.circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={isInView ? { strokeDashoffset: targetOffset } : {}}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{ transformOrigin: "50% 50%", transform: "rotate(-90deg)" }}
          />
          <text x="50" y="50" textAnchor="middle" dominantBaseline="central" fill="var(--foreground)" fontSize="18" fontWeight="800">
            {count}%
          </text>
        </svg>
        <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

function ReturnRateChart({ label, value, subtitle }: { label: string; value: string; subtitle: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [count, setCount] = useState(0);
  const target = parseInt(value, 10);

  useEffect(() => {
    if (!isInView) return;
    let current = 0;
    const step = () => {
      current += 1;
      if (current <= target) {
        setCount(current);
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }, [isInView, target]);

  return (
    <div ref={ref} className="blog-card-3d rounded-2xl bg-white p-6 relative overflow-hidden">
      <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[var(--stamp-sage)]/10 text-[var(--stamp-sage)] text-xs font-bold">
        Pro
      </span>
      <p className="text-sm font-semibold text-[var(--muted-foreground)] mb-4">
        {label}
      </p>
      <div className="flex items-end gap-1 mb-4">
        <span className="text-5xl font-extrabold text-[var(--stamp-sage)] leading-none tabular-nums">
          {count}%
        </span>
      </div>
      <div className="space-y-2">
        <div className="h-5 bg-[var(--muted)] rounded-lg overflow-hidden">
          <motion.div
            className="h-full rounded-lg bg-[var(--accent)]"
            initial={{ width: 0 }}
            animate={isInView ? { width: "100%" } : {}}
            transition={{ duration: 0.7, ease: "easeOut" }}
          />
        </div>
        <div className="h-5 bg-[var(--muted)] rounded-lg overflow-hidden">
          <motion.div
            className="h-full rounded-lg"
            style={{ backgroundColor: "var(--stamp-sage)" }}
            initial={{ width: 0 }}
            animate={isInView ? { width: `${target}%` } : {}}
            transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
          />
        </div>
      </div>
      <p className="text-xs text-[var(--muted-foreground)] mt-2">{subtitle}</p>
    </div>
  );
}

/* ─── Section ─── */

export function ProChartCards() {
  const t = useTranslations("features.analytiques.custom");

  return (
    <section className="py-16 sm:py-24 bg-[var(--blog-bg-alt)]">
      <Container>
        <ScrollReveal className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--stamp-sage)]/10 text-[var(--stamp-sage)] text-sm font-bold mb-6">
            {t("proAnalytics.badge")}
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--foreground)] mb-4">
            {t("proAnalytics.title")}
          </h2>
          <p className="text-lg text-[var(--muted-foreground)] leading-relaxed">
            {t("proAnalytics.description")}
          </p>
        </ScrollReveal>

        {/* Mobile: single column */}
        <div className="flex flex-col gap-6 md:hidden">
          <ScrollReveal delay={0}>
            <LineChart
              label={t("proCharts.lineChart.label")}
              trend={t("proCharts.lineChart.trend")}
            />
          </ScrollReveal>
          <ScrollReveal delay={100}>
            <Heatmap
              label={t("proCharts.heatmap.label")}
              days={t.raw("proCharts.heatmap.days") as string[]}
            />
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <DonutChart
              label={t("proCharts.donut.label")}
              valueLabel={t("proCharts.donut.value")}
            />
          </ScrollReveal>
        </div>

        {/* Desktop: masonry via CSS columns */}
        <div className="hidden md:block columns-3 gap-6 [&>*]:mb-6 [&>*]:break-inside-avoid">
          {/* Col 1: LineChart → Segments → ReturnRate */}
          <ScrollReveal delay={0}>
            <LineChart
              label={t("proCharts.lineChart.label")}
              trend={t("proCharts.lineChart.trend")}
            />
          </ScrollReveal>
          <ScrollReveal delay={300}>
            <SegmentsChart
              label={t("proCharts.segments.label")}
              categories={t.raw("proCharts.segments.categories") as string[]}
            />
          </ScrollReveal>
          <ScrollReveal delay={600}>

            <CompletionRateChart
              label={t("proCharts.completionRate.label")}
              value={t("proCharts.completionRate.value")}
              subtitle={t("proCharts.completionRate.subtitle")}
            />
          </ScrollReveal>

          {/* Col 2: Churn → Heatmap → TimeToReward */}
          <ScrollReveal delay={100}>
            <ChurnChart
              label={t("proCharts.churn.label")}
              value={t("proCharts.churn.value")}
              subtitle={t("proCharts.churn.subtitle")}
            />
          </ScrollReveal>
          <ScrollReveal delay={400}>
            <Heatmap
              label={t("proCharts.heatmap.label")}
              days={t.raw("proCharts.heatmap.days") as string[]}
            />
          </ScrollReveal>
          <ScrollReveal delay={700}>
            <BestDaysChart
              label={t("proCharts.bestDays.label")}
              days={t.raw("proCharts.bestDays.days") as string[]}
            />
          </ScrollReveal>

          {/* Col 3: DonutChart → BestDays → CompletionRate */}
          <ScrollReveal delay={200}>
            <DonutChart
              label={t("proCharts.donut.label")}
              valueLabel={t("proCharts.donut.value")}
            />
          </ScrollReveal>
          <ScrollReveal delay={500}>

            <TimeToRewardChart
              label={t("proCharts.timeToReward.label")}
              value={t("proCharts.timeToReward.value")}
              unit={t("proCharts.timeToReward.unit")}
            />
          </ScrollReveal>
          <ScrollReveal delay={800}>
            <ReturnRateChart
              label={t("proCharts.returnRate.label")}
              value={t("proCharts.returnRate.value")}
              subtitle={t("proCharts.returnRate.subtitle")}
            />
          </ScrollReveal>
        </div>
      </Container>
    </section>
  );
}

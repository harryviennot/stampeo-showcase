"use client";

import { useEffect, useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { motion, useInView } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

// Heatmap data: 7 days × 5 time slots, values 0.1–0.9
const HEATMAP_DATA = [
  [0.3, 0.5, 0.8, 0.6, 0.2],
  [0.4, 0.7, 0.9, 0.7, 0.3],
  [0.2, 0.6, 0.8, 0.5, 0.2],
  [0.5, 0.8, 0.9, 0.8, 0.4],
  [0.6, 0.9, 0.7, 0.6, 0.3],
  [0.8, 0.7, 0.4, 0.3, 0.1],
  [0.7, 0.6, 0.3, 0.2, 0.1],
];

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
        {/* Grid lines */}
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
        {/* Filled area */}
        <motion.polygon
          points={areaPoints}
          fill="var(--accent)"
          fillOpacity={0.1}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.5 }}
        />
        {/* Line */}
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
        {/* Day labels */}
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
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="var(--border)"
            strokeWidth="8"
          />
          {/* Foreground arc */}
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
          {/* Center text */}
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
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
      </Container>
    </section>
  );
}

"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { motion, useInView } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

function MethodNumber({ n, isActive }: { n: number; isActive: boolean }) {
  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shrink-0 transition-all duration-500"
      style={{
        background: isActive ? "var(--accent)" : "var(--muted)",
        color: isActive ? "#fff" : "var(--muted-foreground)",
      }}
    >
      {n}
    </div>
  );
}

function HandoffIllustration() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <div ref={ref} className="relative w-full h-48 flex items-center justify-center">
      {/* Upload arrow animation */}
      <svg viewBox="0 0 200 120" className="w-full max-w-[200px] h-auto">
        {/* File icon */}
        <motion.g
          initial={{ opacity: 0, x: -20 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <rect x="20" y="30" width="40" height="50" rx="6" fill="var(--muted)" stroke="var(--border)" strokeWidth="2" />
          <rect x="28" y="42" width="24" height="3" rx="1.5" fill="var(--border)" />
          <rect x="28" y="50" width="18" height="3" rx="1.5" fill="var(--border)" />
          <rect x="28" y="58" width="21" height="3" rx="1.5" fill="var(--border)" />
        </motion.g>

        {/* Arrow */}
        <motion.path
          d="M 75 55 L 120 55"
          stroke="var(--accent)"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
        />
        <motion.path
          d="M 112 48 L 122 55 L 112 62"
          stroke="var(--accent)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.3, delay: 0.9 }}
        />

        {/* Card icon */}
        <motion.g
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <rect x="130" y="25" width="50" height="60" rx="8" fill="var(--accent)" />
          <rect x="138" y="35" width="12" height="12" rx="4" fill="rgba(255,255,255,0.3)" />
          <rect x="138" y="55" width="34" height="3" rx="1.5" fill="rgba(255,255,255,0.4)" />
          <rect x="138" y="62" width="24" height="3" rx="1.5" fill="rgba(255,255,255,0.3)" />
          {/* Sparkle */}
          <motion.circle
            cx="172"
            cy="30"
            r="4"
            fill="var(--stamp-sand)"
            initial={{ scale: 0 }}
            animate={isInView ? { scale: [0, 1.3, 1] } : {}}
            transition={{ duration: 0.4, delay: 1.2 }}
          />
        </motion.g>
      </svg>
    </div>
  );
}

function AIIllustration() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <div ref={ref} className="relative w-full h-48 flex items-center justify-center">
      <svg viewBox="0 0 200 120" className="w-full max-w-[200px] h-auto">
        {/* Camera frame */}
        <motion.rect
          x="15" y="20" width="70" height="80" rx="8"
          fill="none" stroke="var(--border)" strokeWidth="2" strokeDasharray="6 4"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.4 }}
        />
        {/* Old card sketch */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 0.6 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <rect x="25" y="32" width="50" height="56" rx="4" fill="var(--muted)" />
          {/* Stamp circles */}
          {[0, 1, 2, 3, 4].map((i) => (
            <circle key={i} cx={35 + i * 9} cy={55} r="3.5" fill="var(--border)" />
          ))}
          <rect x="32" y="68" width="30" height="3" rx="1.5" fill="var(--border)" />
        </motion.g>

        {/* Scanning beam */}
        <motion.line
          x1="20" y1="60" x2="80" y2="60"
          stroke="var(--accent)"
          strokeWidth="2"
          initial={{ opacity: 0 }}
          animate={isInView ? {
            opacity: [0, 0.8, 0.8, 0],
            y1: [30, 90, 30, 90],
            y2: [30, 90, 30, 90],
          } : {}}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />

        {/* Arrow */}
        <motion.path
          d="M 95 60 L 120 60"
          stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" fill="none"
          initial={{ pathLength: 0 }}
          animate={isInView ? { pathLength: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
        />
        <motion.path
          d="M 113 53 L 122 60 L 113 67"
          stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.3, delay: 1.2 }}
        />

        {/* Digital card result */}
        <motion.g
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, delay: 1 }}
        >
          <rect x="130" y="25" width="50" height="60" rx="8" fill="var(--accent)" opacity="0.15" stroke="var(--accent)" strokeWidth="1.5" />
          <rect x="138" y="35" width="12" height="12" rx="4" fill="var(--accent)" opacity="0.3" />
          {[0, 1, 2, 3].map((i) => (
            <circle key={i} cx={142 + i * 8} cy={58} r="3" fill="var(--accent)" opacity="0.4" />
          ))}
          <rect x="138" y="68" width="30" height="3" rx="1.5" fill="var(--accent)" opacity="0.3" />
        </motion.g>

        {/* AI sparkles */}
        {[{ x: 125, y: 22, d: 0.8 }, { x: 185, y: 30, d: 1.1 }, { x: 178, y: 82, d: 1.4 }].map((s, i) => (
          <motion.circle
            key={i} cx={s.x} cy={s.y} r="3" fill="var(--stamp-sand)"
            initial={{ scale: 0 }}
            animate={isInView ? { scale: [0, 1.2, 0.8, 1] } : {}}
            transition={{ duration: 0.5, delay: s.d }}
          />
        ))}
      </svg>
    </div>
  );
}

function EditorIllustration() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <div ref={ref} className="relative w-full h-48 flex items-center justify-center overflow-hidden">
      <svg viewBox="0 0 200 120" className="w-full max-w-[200px] h-auto">
        {/* Editor panel */}
        <motion.g
          initial={{ opacity: 0, x: -10 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <rect x="10" y="15" width="80" height="90" rx="8" fill="white" stroke="var(--border)" strokeWidth="1.5" />
          {/* Color picker row */}
          {["#f97316", "#8B4513", "#60A5FA", "#D4688E"].map((color, i) => (
            <motion.circle
              key={i}
              cx={28 + i * 16}
              cy={35}
              r="5"
              fill={color}
              initial={{ scale: 0 }}
              animate={isInView ? { scale: 1 } : {}}
              transition={{ duration: 0.3, delay: 0.3 + i * 0.1 }}
            />
          ))}
          {/* Sliders */}
          {[50, 65, 80].map((y, i) => (
            <motion.g key={i}>
              <rect x="20" y={y} width="60" height="4" rx="2" fill="var(--muted)" />
              <motion.circle
                cx={35 + i * 15}
                cy={y + 2}
                r="5"
                fill="var(--accent)"
                stroke="white"
                strokeWidth="2"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ delay: 0.6 + i * 0.15 }}
              />
            </motion.g>
          ))}
        </motion.g>

        {/* Card preview */}
        <motion.g
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <rect x="110" y="20" width="75" height="80" rx="10" fill="#1c1c1e" />
          {/* Mini stamp grid */}
          {[0, 1, 2, 3].map((i) => (
            <motion.circle
              key={i}
              cx={127 + i * 14}
              cy={55}
              r="5"
              fill={i < 3 ? "var(--accent)" : "rgba(255,255,255,0.15)"}
              initial={{ scale: 0 }}
              animate={isInView ? { scale: 1 } : {}}
              transition={{ duration: 0.3, delay: 0.8 + i * 0.1 }}
            />
          ))}
          <rect x="120" y="72" width="40" height="3" rx="1.5" fill="rgba(255,255,255,0.3)" />
          <rect x="120" y="80" width="28" height="3" rx="1.5" fill="rgba(255,255,255,0.2)" />
          {/* Real-time indicator */}
          <motion.circle
            cx="178" cy="26" r="4" fill="#22c55e"
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.g>
      </svg>
    </div>
  );
}

export function CreationMethodsSection() {
  const t = useTranslations("features.design-de-carte.custom.methods");

  const methods = [
    {
      number: 1,
      title: t("handoff.title"),
      description: t("handoff.description"),
      badge: t("handoff.badge"),
      badgeColor: "var(--accent)",
      steps: t.raw("handoff.steps") as string[],
      illustration: <HandoffIllustration />,
    },
    {
      number: 2,
      title: t("ai.title"),
      description: t("ai.description"),
      badge: t("ai.badge"),
      badgeColor: "var(--stamp-sage)",
      steps: t.raw("ai.steps") as string[],
      illustration: <AIIllustration />,
    },
    {
      number: 3,
      title: t("editor.title"),
      description: t("editor.description"),
      badge: null,
      badgeColor: null,
      steps: t.raw("editor.steps") as string[],
      illustration: <EditorIllustration />,
    },
  ];

  return (
    <section className="py-16 sm:py-24">
      <Container>
        <ScrollReveal className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--foreground)] mb-4">
            {t("sectionTitle")}
          </h2>
          <p className="text-lg text-[var(--muted-foreground)] leading-relaxed">
            {t("sectionSubtitle")}
          </p>
        </ScrollReveal>

        <div className="space-y-8 sm:space-y-12">
          {methods.map((method, index) => (
            <ScrollReveal key={index} delay={index * 100}>
              <div className="relative bg-white blog-card-3d rounded-3xl overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                  {/* Illustration side */}
                  <div
                    className={`bg-[var(--muted)] p-6 sm:p-8 flex items-center justify-center ${
                      index % 2 === 1 ? "lg:order-2" : ""
                    }`}
                  >
                    {method.illustration}
                  </div>

                  {/* Content side */}
                  <div className="p-6 sm:p-10 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-4">
                      <MethodNumber n={method.number} isActive={true} />
                      {method.badge && (
                        <span
                          className="px-3 py-1 rounded-full text-xs font-bold"
                          style={{
                            backgroundColor: `color-mix(in srgb, ${method.badgeColor} 15%, transparent)`,
                            color: method.badgeColor!,
                          }}
                        >
                          {method.badge}
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] mb-3">
                      {method.title}
                    </h3>

                    <p className="text-[var(--muted-foreground)] leading-relaxed mb-6">
                      {method.description}
                    </p>

                    {/* Steps */}
                    <div className="space-y-3">
                      {method.steps.map((step, stepIdx) => (
                        <div key={stepIdx} className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-[var(--accent)]/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-[var(--accent)]">
                              {stepIdx + 1}
                            </span>
                          </div>
                          <span className="text-sm text-[var(--foreground)]">
                            {step}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

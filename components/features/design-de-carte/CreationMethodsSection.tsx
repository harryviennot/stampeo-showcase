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
    <div ref={ref} className="relative w-full h-64 sm:h-72 flex items-center justify-center">
      <svg viewBox="0 0 320 200" className="w-full max-w-sm h-auto">
        {/* Brand brief — a document with brand elements */}
        <motion.g
          initial={{ opacity: 0, x: -15 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          {/* Brief document */}
          <rect x="10" y="28" width="90" height="115" rx="8" fill="white" stroke="var(--border)" strokeWidth="1.5" />
          {/* Header bar */}
          <rect x="10" y="28" width="90" height="24" rx="8" fill="var(--muted)" />
          <rect x="10" y="44" width="90" height="8" fill="var(--muted)" />
          <rect x="22" y="35" width="40" height="5" rx="2" fill="var(--border)" opacity="0.5" />

          {/* Logo placeholder */}
          <motion.g
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <rect x="22" y="60" width="28" height="28" rx="6" fill="var(--muted)" stroke="var(--border)" strokeWidth="1" strokeDasharray="4 3" />
            <text x="36" y="78" textAnchor="middle" fontSize="9" fill="var(--muted-foreground)" fontFamily="sans-serif">Logo</text>
          </motion.g>

          {/* Color swatches */}
          {["var(--accent)", "#f97316", "#1c1c1e"].map((color, i) => (
            <motion.rect
              key={i}
              x={60 + i * 12}
              y={64}
              width="9"
              height="9"
              rx="2"
              fill={color}
              initial={{ scale: 0 }}
              animate={isInView ? { scale: 1 } : {}}
              transition={{ duration: 0.25, delay: 0.35 + i * 0.08 }}
            />
          ))}

          {/* Text content lines */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <rect x="22" y="98" width="65" height="4" rx="2" fill="var(--border)" opacity="0.4" />
            <rect x="22" y="107" width="50" height="4" rx="2" fill="var(--border)" opacity="0.3" />
            <rect x="22" y="116" width="58" height="4" rx="2" fill="var(--border)" opacity="0.25" />
            <rect x="22" y="125" width="35" height="4" rx="2" fill="var(--border)" opacity="0.2" />
          </motion.g>
        </motion.g>

        {/* Floating elements animating from brief toward card */}
        {[
          { startX: 80, startY: 74, endX: 195, endY: 50, delay: 0.7, color: "var(--accent)", size: 6 },
          { startX: 72, startY: 64, endX: 230, endY: 42, delay: 0.85, color: "#f97316", size: 5 },
          { startX: 85, startY: 100, endX: 210, endY: 95, delay: 1.0, color: "var(--accent)", size: 4 },
        ].map((p, i) => (
          <motion.circle
            key={i}
            r={p.size}
            fill={p.color}
            opacity="0.5"
            initial={{ cx: p.startX, cy: p.startY, opacity: 0 }}
            animate={isInView ? {
              cx: [p.startX, (p.startX + p.endX) / 2, p.endX],
              cy: [p.startY, p.startY - 15, p.endY],
              opacity: [0, 0.6, 0],
            } : {}}
            transition={{ duration: 0.9, delay: p.delay, ease: "easeInOut" }}
          />
        ))}

        {/* Polished wallet card assembling */}
        <motion.g
          initial={{ opacity: 0, scale: 0.85 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.9 }}
        >
          {/* Card body */}
          <rect x="175" y="25" width="120" height="150" rx="14" fill="var(--accent)" />
          {/* Inner card styling */}
          <rect x="175" y="25" width="120" height="45" rx="14" fill="rgba(255,255,255,0.08)" />

          {/* Logo placeholder fading in */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.4, delay: 1.2 }}
          >
            <rect x="190" y="38" width="24" height="24" rx="6" fill="rgba(255,255,255,0.25)" />
            <circle cx="202" cy="50" r="6" fill="rgba(255,255,255,0.4)" />
          </motion.g>

          {/* Business name text lines */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.3, delay: 1.4 }}
          >
            <rect x="222" y="40" width="55" height="5" rx="2.5" fill="rgba(255,255,255,0.5)" />
            <rect x="222" y="50" width="38" height="4" rx="2" fill="rgba(255,255,255,0.3)" />
          </motion.g>

          {/* Stamp dots appearing one by one */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <motion.circle
              key={i}
              cx={196 + (i % 4) * 24}
              cy={95 + Math.floor(i / 4) * 24}
              r="8"
              fill={i < 5 ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.1)"}
              initial={{ scale: 0 }}
              animate={isInView ? { scale: 1 } : {}}
              transition={{ type: "spring", stiffness: 300, damping: 15, delay: 1.5 + i * 0.08 }}
            />
          ))}

          {/* Bottom text */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.3, delay: 1.9 }}
          >
            <rect x="190" y="148" width="70" height="4" rx="2" fill="rgba(255,255,255,0.3)" />
            <rect x="190" y="157" width="45" height="3" rx="1.5" fill="rgba(255,255,255,0.2)" />
          </motion.g>

          {/* Checkmark sparkle */}
          <motion.g
            initial={{ scale: 0 }}
            animate={isInView ? { scale: [0, 1.4, 1] } : {}}
            transition={{ duration: 0.5, ease: "easeOut", delay: 2.1 }}
          >
            <circle cx="290" cy="30" r="10" fill="var(--stamp-sand)" />
            <path d="M 285 30 L 288 33 L 295 26" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </motion.g>
        </motion.g>
      </svg>
    </div>
  );
}

function AIIllustration() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <div ref={ref} className="relative w-full h-64 sm:h-72 flex items-center justify-center">
      <svg viewBox="0 0 320 200" className="w-full max-w-sm h-auto">
        {/* Physical card - landscape, slightly tilted */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
        >
          <g transform="rotate(-3, 65, 100)">
            {/* Card body - landscape orientation */}
            <rect x="5" y="48" width="120" height="78" rx="8" fill="#f5f0e8" stroke="var(--border)" strokeWidth="1.5" />
            {/* Subtle paper texture lines */}
            <line x1="5" y1="62" x2="125" y2="62" stroke="var(--border)" strokeWidth="0.3" opacity="0.3" />
            <line x1="5" y1="76" x2="125" y2="76" stroke="var(--border)" strokeWidth="0.3" opacity="0.3" />

            {/* Shop name - handwritten feel */}
            <rect x="15" y="54" width="45" height="6" rx="2" fill="var(--border)" opacity="0.7" />
            <rect x="15" y="63" width="30" height="4" rx="1.5" fill="var(--border)" opacity="0.4" />

            {/* Stamp row - horizontal, like a real cardboard card */}
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <circle
                key={i}
                cx={22 + i * 13}
                cy={88}
                r="5"
                fill="none"
                stroke="var(--border)"
                strokeWidth="1.2"
              />
            ))}
            {/* Filled stamps - messy ink look */}
            {[0, 1, 2, 3, 4].map((i) => (
              <circle
                key={`fill-${i}`}
                cx={22 + i * 13}
                cy={88}
                r="4"
                fill="var(--border)"
                opacity="0.55"
              />
            ))}

            {/* Bottom small text */}
            <rect x="15" y="102" width="55" height="3" rx="1.5" fill="var(--border)" opacity="0.3" />
            <rect x="15" y="108" width="35" height="3" rx="1.5" fill="var(--border)" opacity="0.2" />

            {/* Coffee ring stain for realism */}
            <circle cx="105" cy="68" r="10" fill="none" stroke="var(--border)" strokeWidth="0.8" opacity="0.2" />
            <circle cx="105" cy="68" r="9" fill="none" stroke="var(--border)" strokeWidth="0.3" opacity="0.15" />
          </g>

          {/* Camera viewfinder overlay */}
          <motion.g
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            {/* Corner brackets - fitting landscape card */}
            <path d="M 2 55 L 2 43 L 14 43" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 128 55 L 128 43 L 116 43" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 2 122 L 2 134 L 14 134" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 128 122 L 128 134 L 116 134" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" />
            {/* Shutter button */}
            <circle cx="65" cy="148" r="8" fill="none" stroke="var(--accent)" strokeWidth="1.5" />
            <motion.circle
              cx="65" cy="148" r="5.5"
              fill="var(--accent)"
              initial={{ scale: 1 }}
              animate={isInView ? { scale: [1, 0.7, 1] } : {}}
              transition={{ duration: 0.3, delay: 0.6 }}
            />
          </motion.g>
        </motion.g>

        {/* Scanning beam sweeping across landscape card */}
        <motion.line
          x1="5" y1="88" x2="125" y2="88"
          stroke="var(--accent)"
          strokeWidth="2"
          opacity="0.7"
          initial={{ opacity: 0 }}
          animate={isInView ? {
            opacity: [0, 0.7, 0.7, 0],
            y1: [50, 125, 50, 125],
            y2: [50, 125, 50, 125],
          } : {}}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        />

        {/* Data particles flying along curved path */}
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.circle
            key={i}
            r="3"
            fill="var(--accent)"
            initial={{ opacity: 0, cx: 120, cy: 100 }}
            animate={isInView ? {
              opacity: [0, 0.8, 0.8, 0],
              cx: [120, 150, 180, 210],
              cy: [100, 85 - i * 6, 80 + i * 4, 100],
            } : {}}
            transition={{
              duration: 1,
              delay: 1.2 + i * 0.15,
              ease: "easeOut",
            }}
          />
        ))}

        {/* Digital wallet card result */}
        <motion.g
          initial={{ opacity: 0, scale: 0.85 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ type: "spring", stiffness: 200, damping: 20, delay: 1.4 }}
        >
          {/* Card body */}
          <rect x="195" y="25" width="110" height="150" rx="14" fill="var(--accent)" opacity="0.12" stroke="var(--accent)" strokeWidth="1.5" />

          {/* Logo placeholder */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.4, delay: 1.8 }}
          >
            <rect x="210" y="40" width="22" height="22" rx="6" fill="var(--accent)" opacity="0.25" />
            <circle cx="221" cy="51" r="5" fill="var(--accent)" opacity="0.4" />
          </motion.g>

          {/* Clean text lines */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.3, delay: 1.9 }}
          >
            <rect x="240" y="42" width="50" height="5" rx="2.5" fill="var(--accent)" opacity="0.4" />
            <rect x="240" y="52" width="32" height="4" rx="2" fill="var(--accent)" opacity="0.25" />
          </motion.g>

          {/* Polished stamp circles */}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <motion.circle
              key={i}
              cx={222 + (i % 3) * 24}
              cy={90 + Math.floor(i / 3) * 24}
              r="8"
              fill={i < 4 ? "var(--accent)" : "none"}
              stroke="var(--accent)"
              strokeWidth="1.5"
              opacity={i < 4 ? 0.35 : 0.2}
              initial={{ scale: 0 }}
              animate={isInView ? { scale: 1 } : {}}
              transition={{ type: "spring", stiffness: 300, damping: 15, delay: 2 + i * 0.08 }}
            />
          ))}

          {/* Bottom text */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.3, delay: 2.3 }}
          >
            <rect x="210" y="148" width="65" height="4" rx="2" fill="var(--accent)" opacity="0.3" />
            <rect x="210" y="157" width="40" height="3" rx="1.5" fill="var(--accent)" opacity="0.2" />
          </motion.g>
        </motion.g>

        {/* AI sparkles */}
        {[
          { x: 192, y: 22, d: 1.6 },
          { x: 308, y: 35, d: 1.9 },
          { x: 300, y: 170, d: 2.2 },
          { x: 198, y: 175, d: 2.0 },
        ].map((s, i) => (
          <motion.g
            key={i}
            initial={{ scale: 0 }}
            animate={isInView ? { scale: [0, 1.3, 0.9, 1] } : {}}
            transition={{ duration: 0.5, delay: s.d }}
          >
            {/* 4-pointed star sparkle */}
            <path
              d={`M ${s.x} ${s.y - 5} L ${s.x + 1.5} ${s.y - 1.5} L ${s.x + 5} ${s.y} L ${s.x + 1.5} ${s.y + 1.5} L ${s.x} ${s.y + 5} L ${s.x - 1.5} ${s.y + 1.5} L ${s.x - 5} ${s.y} L ${s.x - 1.5} ${s.y - 1.5} Z`}
              fill="var(--stamp-sand)"
            />
          </motion.g>
        ))}
      </svg>
    </div>
  );
}

function EditorIllustration() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const colors = ["#f97316", "#8B4513", "#60A5FA", "#D4688E", "#22c55e"];

  return (
    <div ref={ref} className="relative w-full h-64 sm:h-72 flex items-center justify-center overflow-hidden">
      <svg viewBox="0 0 320 200" className="w-full max-w-sm h-auto">
        {/* Editor panel */}
        <motion.g
          initial={{ opacity: 0, x: -15 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <rect x="10" y="15" width="135" height="170" rx="10" fill="white" stroke="var(--border)" strokeWidth="1.5" />

          {/* Toolbar at top */}
          <rect x="10" y="15" width="135" height="28" rx="10" fill="var(--muted)" />
          <rect x="10" y="33" width="135" height="10" fill="var(--muted)" />
          {/* Toolbar icons */}
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={22 + i * 20} y="23" width="12" height="12" rx="3" fill="var(--border)" opacity="0.5" />
          ))}

          {/* "Couleurs" label */}
          <text x="22" y="62" fontSize="8" fill="var(--muted-foreground)" fontFamily="sans-serif" fontWeight="600">Couleurs</text>

          {/* Color palette row */}
          {colors.map((color, i) => (
            <motion.circle
              key={i}
              cx={28 + i * 22}
              cy={78}
              r="8"
              fill={color}
              initial={{ scale: 0 }}
              animate={isInView ? { scale: 1 } : {}}
              transition={{ duration: 0.3, delay: 0.3 + i * 0.08 }}
            />
          ))}
          {/* Selection ring on first color */}
          <motion.circle
            cx={28}
            cy={78}
            r="11"
            fill="none"
            stroke={colors[0]}
            strokeWidth="2"
            initial={{ scale: 0, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : {}}
            transition={{ duration: 0.4, delay: 0.8 }}
          />

          {/* "Taille" label */}
          <text x="22" y="105" fontSize="8" fill="var(--muted-foreground)" fontFamily="sans-serif" fontWeight="600">Taille</text>

          {/* Slider */}
          <rect x="22" y="113" width="110" height="4" rx="2" fill="var(--muted)" />
          <rect x="22" y="113" width="65" height="4" rx="2" fill="var(--accent)" opacity="0.4" />
          <motion.circle
            cx="87"
            cy="115"
            r="7"
            fill="var(--accent)"
            stroke="white"
            strokeWidth="2.5"
            initial={{ cx: 40 }}
            animate={isInView ? { cx: [40, 87] } : {}}
            transition={{ duration: 0.8, delay: 1.0, ease: "easeOut" }}
          />

          {/* Text input field */}
          <text x="22" y="140" fontSize="8" fill="var(--muted-foreground)" fontFamily="sans-serif" fontWeight="600">Nom</text>
          <rect x="22" y="147" width="110" height="22" rx="5" fill="var(--muted)" stroke="var(--border)" strokeWidth="1" />
          <motion.g
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.3, delay: 1.2 }}
          >
            <text x="30" y="162" fontSize="9" fill="var(--foreground)" fontFamily="sans-serif">Mon Café</text>
          </motion.g>
          {/* Blinking cursor */}
          <motion.line
            x1="72" y1="151" x2="72" y2="165"
            stroke="var(--accent)"
            strokeWidth="1.5"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </motion.g>

        {/* Card preview */}
        <motion.g
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {/* Card body with color transition */}
          <motion.rect
            x="170" y="20" width="135" height="165" rx="14"
            initial={{ fill: "#374151" }}
            animate={isInView ? { fill: ["#374151", colors[0]] } : {}}
            transition={{ duration: 0.6, delay: 1.0 }}
          />
          {/* Header area */}
          <motion.rect
            x="170" y="20" width="135" height="50" rx="14"
            fill="rgba(255,255,255,0.08)"
          />

          {/* Logo area */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.3, delay: 0.7 }}
          >
            <rect x="185" y="32" width="26" height="26" rx="7" fill="rgba(255,255,255,0.25)" />
            <text x="198" y="50" textAnchor="middle" fontSize="12" fill="rgba(255,255,255,0.7)" fontFamily="sans-serif" fontWeight="bold">M</text>
          </motion.g>

          {/* Business name */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.3, delay: 1.3 }}
          >
            <rect x="220" y="35" width="65" height="6" rx="3" fill="rgba(255,255,255,0.5)" />
            <rect x="220" y="46" width="42" height="4" rx="2" fill="rgba(255,255,255,0.3)" />
          </motion.g>

          {/* Stamp grid */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <motion.circle
              key={i}
              cx={196 + (i % 4) * 26}
              cy={95 + Math.floor(i / 4) * 26}
              r="9"
              fill={i < 5 ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.1)"}
              initial={{ scale: 0 }}
              animate={isInView ? { scale: 1 } : {}}
              transition={{ type: "spring", stiffness: 300, damping: 15, delay: 1.4 + i * 0.1 }}
            />
          ))}

          {/* Bottom details */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.3, delay: 2.0 }}
          >
            <rect x="185" y="155" width="80" height="4" rx="2" fill="rgba(255,255,255,0.3)" />
            <rect x="185" y="164" width="50" height="3" rx="1.5" fill="rgba(255,255,255,0.2)" />
          </motion.g>

          {/* Scale pulse on card when changes happen */}
          <motion.rect
            x="170" y="20" width="135" height="165" rx="14"
            fill="none"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="0"
            initial={{ strokeWidth: 0 }}
            animate={isInView ? { strokeWidth: [0, 3, 0] } : {}}
            transition={{ duration: 0.6, delay: 1.1 }}
          />

          {/* Live green dot */}
          <motion.circle
            cx="298" cy="28" r="5" fill="#22c55e"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          {/* Live dot ping */}
          <motion.circle
            cx="298" cy="28" r="5" fill="none" stroke="#22c55e" strokeWidth="1.5"
            animate={{ r: [5, 10], opacity: [0.6, 0] }}
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

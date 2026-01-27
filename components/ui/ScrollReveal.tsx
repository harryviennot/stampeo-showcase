"use client";

import { ReactNode } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

type RevealVariant = "default" | "left" | "right" | "scale" | "blur" | "stagger";

interface ScrollRevealProps {
  children: ReactNode;
  variant?: RevealVariant;
  className?: string;
  delay?: number;
  threshold?: number;
}

const variantClasses: Record<RevealVariant, string> = {
  default: "scroll-reveal",
  left: "scroll-reveal-left",
  right: "scroll-reveal-right",
  scale: "scroll-reveal-scale",
  blur: "scroll-reveal-blur",
  stagger: "scroll-reveal-stagger",
};

export function ScrollReveal({
  children,
  variant = "default",
  className = "",
  delay = 0,
  threshold = 0.1,
}: ScrollRevealProps) {
  const { ref, isRevealed } = useScrollReveal({ threshold });

  return (
    <div
      ref={ref}
      className={`${variantClasses[variant]} ${isRevealed ? "revealed" : ""} ${className}`}
      style={{ transitionDelay: delay ? `${delay}ms` : undefined }}
    >
      {children}
    </div>
  );
}

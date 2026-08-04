import { ReactNode } from "react";

type RevealVariant = "default" | "left" | "right" | "scale" | "stagger";

interface ScrollRevealProps {
  children: ReactNode;
  variant?: RevealVariant;
  className?: string;
  delay?: number;
  id?: string;
}

const variantClasses: Record<RevealVariant, string> = {
  default: "scroll-reveal",
  left: "scroll-reveal-left",
  right: "scroll-reveal-right",
  scale: "scroll-reveal-scale",
  stagger: "scroll-reveal-stagger",
};

/**
 * Server component that renders a div with scroll-reveal CSS classes.
 * Animation is powered by the ScrollRevealInit inline script (single IntersectionObserver).
 * No React hydration needed — zero JS per instance.
 */
export function ScrollReveal({
  children,
  variant = "default",
  className = "",
  delay = 0,
  id,
}: ScrollRevealProps) {
  return (
    <div
      data-sr
      id={id}
      className={`${variantClasses[variant]} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}

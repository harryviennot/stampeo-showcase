import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import type { LandingSectionId } from "@/lib/landing-pages/pages";

/** Vertical rhythm: the heroes clear the fixed header; the one that ends on the dashboard is short below. */
const PADDING = {
  default: "py-16 lg:py-24",
  hero: "pt-24 pb-16 lg:pt-36 lg:pb-24",
  heroDuo: "pt-24 pb-10 lg:pt-32 lg:pb-14",
} as const;

const TINT = "bg-[var(--blog-bg)]";

/** The classes of a tinted section, for a block that brings its own `<section>`. */
export const TINTED_BAND = `${PADDING.default} ${TINT}`;

/**
 * A section title with its lead: one h2 and at most one paragraph under it,
 * with a small label above when the page gives one. `align="center"` is for a
 * heading over a full-width picture.
 */
export function LpHeading({
  title,
  lead,
  eyebrow,
  align = "left",
  className = "",
}: Readonly<{
  title: ReactNode;
  lead?: ReactNode;
  eyebrow?: string;
  align?: "left" | "center";
  className?: string;
}>) {
  const centered = align === "center";

  return (
    <div className={`max-w-2xl ${centered ? "mx-auto text-center" : ""} ${className}`}>
      {eyebrow && (
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-hover)] sm:text-[13px]">
          {eyebrow}
        </p>
      )}
      <h2 className="text-h2 text-balance">{title}</h2>
      {lead && (
        <p
          className={`mt-4 text-lead text-pretty text-[var(--muted-foreground)] ${
            centered ? "mx-auto max-w-2xl" : "max-w-xl"
          }`}
        >
          {lead}
        </p>
      )}
    </div>
  );
}

/**
 * The frame of every landing-page section: its registry id as `data-landing-section`, the rhythm and a
 * `Container`. `anchor` makes the id a jump target; `bare` is for blocks that bring their own section.
 */
export function LpSection({
  section,
  anchor = false,
  bare = false,
  tinted = false,
  size = "default",
  padding = "default",
  title,
  lead,
  eyebrow,
  align,
  className = "",
  children,
}: Readonly<{
  section: LandingSectionId;
  anchor?: boolean;
  bare?: boolean;
  /** The page's one tinted band. */
  tinted?: boolean;
  size?: "default" | "narrow";
  padding?: keyof typeof PADDING;
  title?: string;
  lead?: string;
  /** With `title`: the heading's small label and alignment. */
  eyebrow?: string;
  align?: "left" | "center";
  className?: string;
  children?: ReactNode;
}>) {
  const Wrapper = bare ? "div" : "section";
  const body =
    title === undefined ? (
      children
    ) : (
      <>
        <ScrollReveal>
          <LpHeading title={title} lead={lead} eyebrow={eyebrow} align={align} />
        </ScrollReveal>
        <ScrollReveal delay={120} className="mt-10 lg:mt-14">
          {children}
        </ScrollReveal>
      </>
    );

  return (
    <Wrapper
      data-landing-section={section}
      id={anchor ? section : undefined}
      className={
        bare
          ? undefined
          : `relative scroll-mt-24 ${PADDING[padding]} ${tinted ? TINT : ""} ${className}`
      }
    >
      {bare ? body : <Container size={size}>{body}</Container>}
    </Wrapper>
  );
}

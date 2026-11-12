import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import type { LandingSectionId } from "@/lib/landing-pages/pages";

/** Vertical rhythm: the hero clears the fixed header. */
const PADDING = {
  default: "py-16 lg:py-24",
  hero: "pt-24 pb-16 lg:pt-36 lg:pb-24",
  heroCropped: "pt-24 pb-0 lg:pt-36 lg:pb-24",
} as const;

const TINT = "bg-[var(--blog-bg)]";

/** The classes of a tinted section, for a block that brings its own `<section>`. */
export const TINTED_BAND = `${PADDING.default} ${TINT}`;

/** A section title with its lead: one h2 and at most one paragraph under it. */
export function LpHeading({
  title,
  lead,
  className = "",
}: Readonly<{ title: string; lead?: string; className?: string }>) {
  return (
    <div className={`max-w-2xl ${className}`}>
      <h2 className="text-h2 text-balance">{title}</h2>
      {lead && <p className="mt-4 max-w-xl text-lead text-pretty text-[var(--muted-foreground)]">{lead}</p>}
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
          <LpHeading title={title} lead={lead} />
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

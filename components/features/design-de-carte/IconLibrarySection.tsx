"use client";

import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import {
  stampIcons,
  StampIconSvg,
  type StampIconType,
} from "@/components/onboarding/StampIconPicker";

/** Tile colors sampled from the brand-bank cards, so the catalog reads like
 *  the rest of the page instead of a uniform grid. */
const TILE_COLORS = [
  "#F97316", // Stampeo orange
  "#0B1B2B", // Lustre navy
  "#0F766E", // Patoune teal
  "#D6006E", // Vanity magenta
  "#5E8B57", // Tige sage
  "#432889", // OBA violet
  "#4B2E2B", // Aurevo brown
  "#14432E", // Marginalia green
];

function MarqueeRow({
  icons,
  colorOffset,
  reverse,
  duration,
}: {
  icons: StampIconType[];
  colorOffset: number;
  reverse?: boolean;
  duration: number;
}) {
  // Track holds the list twice; the keyframes travel exactly one list-width
  // (-50%), so the loop is seamless. Tile gap must be uniform (gap-3 both
  // between and across copies) or the seam shows as a wider gap.
  const track = [...icons, ...icons];
  return (
    <div className="overflow-hidden">
      <div
        className="flex w-max gap-3 py-1.5 will-change-transform"
        style={{
          animation: `marquee-scroll ${duration}s linear infinite${reverse ? " reverse" : ""}`,
        }}
      >
        {track.map((id, i) => (
          <div
            key={`${id}-${i}`}
            className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl shadow-sm"
            style={{
              // Key the color to the position within ONE copy of the list, so
              // both halves are identical and the loop seam is invisible.
              backgroundColor:
                TILE_COLORS[((i % icons.length) + colorOffset) % TILE_COLORS.length],
            }}
          >
            <StampIconSvg icon={id} className="w-6 h-6" color="#ffffff" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * The full 98-icon catalog as two counter-scrolling marquee rows: abundance
 * shown, not claimed, without a static wall of tiles.
 */
export function IconLibrarySection() {
  const t = useTranslations("features.design-de-carte.custom.iconLibrary");

  const ids = stampIcons.map((i) => i.id);
  const rowA = ids.filter((_, i) => i % 2 === 0);
  const rowB = ids.filter((_, i) => i % 2 === 1);

  return (
    <section className="py-16 sm:py-24 bg-[var(--blog-bg)] overflow-hidden">
      <Container>
        <ScrollReveal className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-h2 text-[var(--foreground)] mb-4">
            {t("title")}
          </h2>
          <p className="text-lead text-[var(--muted-foreground)] leading-relaxed">
            {t("description")}
          </p>
        </ScrollReveal>
      </Container>

      {/* Edge-to-edge marquee with soft fades into the section background */}
      <ScrollReveal>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 sm:w-32 bg-gradient-to-r from-[var(--blog-bg)] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 sm:w-32 bg-gradient-to-l from-[var(--blog-bg)] to-transparent" />
          <MarqueeRow icons={rowA} colorOffset={0} duration={70} />
          <MarqueeRow icons={rowB} colorOffset={3} reverse duration={85} />
        </div>
      </ScrollReveal>
    </section>
  );
}

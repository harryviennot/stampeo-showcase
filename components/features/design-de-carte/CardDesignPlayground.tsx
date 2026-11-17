"use client";

import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import {
  CustomIconControl,
  IconModeControl,
  PersonalizationControl,
  PointsControl,
  PresetIconControl,
  ProgramControl,
  StampsControl,
  ThemeControl,
} from "./playground/controls";
import { PlaygroundBody } from "./playground/PlaygroundBody";
import { usePlayground } from "./playground/usePlayground";

/** The card playground as a section of the card-design page: heading, live card and every control. */
export function CardDesignPlayground() {
  const p = usePlayground({ rewards: 1 });
  const { t, isPoints, iconMode } = p;

  return (
    <section id="playground" className="py-16 sm:py-24 scroll-mt-24">
      <Container>
        <ScrollReveal className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-h2 text-[var(--foreground)] mb-4">
            {t("sectionTitle")}
          </h2>
          <p className="text-lead text-[var(--muted-foreground)] leading-relaxed">
            {t("sectionSubtitle")}
          </p>
        </ScrollReveal>

        <PlaygroundBody
          p={p}
          className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center max-w-6xl mx-auto"
          cardClassName="w-full max-w-[300px]"
          panelClassName="w-full max-w-xl rounded-2xl border border-[var(--border)] bg-white p-5 sm:p-6 space-y-4 shadow-sm"
          showQR={false}
        >
          <ProgramControl p={p} />
          {!isPoints && <IconModeControl p={p} />}
          <ThemeControl p={p} />
          {isPoints && <PointsControl p={p} />}
          {!isPoints && iconMode === "preset" && <PresetIconControl p={p} />}
          {!isPoints && iconMode === "custom" && <CustomIconControl p={p} />}
          {!isPoints && <StampsControl p={p} />}
          <PersonalizationControl p={p} />
          <p className="text-sm text-[var(--muted-foreground)] pt-1">
            {t("hint")}
          </p>
        </PlaygroundBody>
      </Container>
    </section>
  );
}

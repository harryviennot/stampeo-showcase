"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { InkNote } from "@/components/ui/InkAnnotation";
import { DoodleCard } from "@/components/ui/InkDoodles";

export default function NotFound() {
  const t = useTranslations("errors.notFound");

  return (
    <main className="min-h-screen bg-[var(--cream)] flex items-center justify-center p-6">
      {/* ScrollReveal so the doodle sketches itself in on arrival. */}
      <ScrollReveal>
        <div className="paper-card rounded-2xl p-8 max-w-md text-center">
          <DoodleCard className="w-28 mx-auto" />
          <InkNote rotate={-2} className="block mb-5">
            {t("annotation")}
          </InkNote>

          <h1 className="text-2xl font-bold text-[var(--primary)] mb-2">
            {t("title")}
          </h1>

          <p className="text-[var(--muted-foreground)] mb-6">
            {t("description")}
          </p>

          <Link
            href="/"
            className="btn-primary inline-block px-6 py-3 text-sm font-semibold"
          >
            {t("backToStampeo")}
          </Link>
        </div>
      </ScrollReveal>
    </main>
  );
}

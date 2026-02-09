"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("errors.notFound");

  return (
    <main className="min-h-screen bg-[var(--cream)] flex items-center justify-center p-6">
      <div className="paper-card rounded-2xl p-8 max-w-md text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--accent)] flex items-center justify-center">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

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
    </main>
  );
}

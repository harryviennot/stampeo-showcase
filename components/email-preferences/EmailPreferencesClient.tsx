"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type Category = "reengagement" | "marketing" | "product_updates";
const CATEGORIES: Category[] = ["reengagement", "marketing", "product_updates"];

type Preferences = Record<`${Category}_opt_out`, boolean>;

type Status = "loading" | "ready" | "saving" | "saved" | "error_token" | "error_generic";

const EMPTY_PREFS: Preferences = {
  reengagement_opt_out: false,
  marketing_opt_out: false,
  product_updates_opt_out: false,
};

export function EmailPreferencesClient() {
  const t = useTranslations("email_preferences");
  const params = useSearchParams();
  const u = params.get("u");
  const token = params.get("t");

  const hasCredentials = !!(u && token);
  const [status, setStatus] = useState<Status>(hasCredentials ? "loading" : "error_token");
  const [prefs, setPrefs] = useState<Preferences>(EMPTY_PREFS);

  useEffect(() => {
    if (!hasCredentials) return;
    const url = `${API_URL}/email/preferences?u=${encodeURIComponent(u!)}&t=${encodeURIComponent(token!)}`;
    fetch(url)
      .then(async (res) => {
        if (res.status === 403) {
          setStatus("error_token");
          return;
        }
        if (!res.ok) {
          setStatus("error_generic");
          return;
        }
        const data = await res.json();
        setPrefs({
          reengagement_opt_out: !!data.reengagement_opt_out,
          marketing_opt_out: !!data.marketing_opt_out,
          product_updates_opt_out: !!data.product_updates_opt_out,
        });
        setStatus("ready");
      })
      .catch(() => setStatus("error_generic"));
  }, [hasCredentials, u, token]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!u || !token) return;
    setStatus("saving");
    try {
      const res = await fetch(
        `${API_URL}/email/preferences?u=${encodeURIComponent(u)}&t=${encodeURIComponent(token)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(prefs),
        },
      );
      if (res.status === 403) {
        setStatus("error_token");
        return;
      }
      if (!res.ok) {
        setStatus("error_generic");
        return;
      }
      setStatus("saved");
    } catch {
      setStatus("error_generic");
    }
  };

  if (status === "loading") {
    return (
      <main className="pt-32 pb-20 min-h-[60vh]">
        <div className="max-w-xl mx-auto px-6 text-center text-[var(--muted-foreground)]">
          {t("loading")}
        </div>
      </main>
    );
  }

  if (status === "error_token") {
    return (
      <main className="pt-32 pb-20 min-h-[60vh]">
        <div className="max-w-xl mx-auto px-6 text-center">
          <p className="text-base text-red-600">{t("error_invalid_token")}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-32 pb-20">
      <div className="max-w-xl mx-auto px-6">
        <header className="mb-10">
          <p className="text-xs font-bold uppercase tracking-[2px] text-[var(--accent)] mb-3">
            {t("title")}
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-4">
            {t("headline")}
          </h1>
          <p className="text-base text-[var(--muted-foreground)] leading-relaxed">
            {t("description")}
          </p>
        </header>

        <form onSubmit={onSubmit} className="space-y-4">
          {CATEGORIES.map((category) => {
            const optOutKey: `${Category}_opt_out` = `${category}_opt_out`;
            const enabled = !prefs[optOutKey];
            return (
              <label
                key={category}
                className="flex items-start gap-4 p-5 rounded-2xl border border-[var(--accent)]/10 bg-white/60 cursor-pointer hover:border-[var(--accent)]/30 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) =>
                    setPrefs((prev) => ({
                      ...prev,
                      [optOutKey]: !e.target.checked,
                    }))
                  }
                  className="mt-1 h-5 w-5 rounded border-[var(--accent)]/30 text-[var(--accent)] focus:ring-[var(--accent)]/40"
                />
                <div className="flex-1">
                  <p className="font-semibold text-sm mb-1">
                    {t(`categories.${category}.label`)}
                  </p>
                  <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                    {t(`categories.${category}.description`)}
                  </p>
                </div>
              </label>
            );
          })}

          <p className="text-xs text-[var(--muted-foreground)] italic px-2">
            {t("transactional_note")}
          </p>

          {status === "error_generic" && (
            <p className="text-sm text-red-600">{t("error_generic")}</p>
          )}
          {status === "saved" && (
            <p className="text-sm text-green-700">{t("saved")}</p>
          )}

          <button
            type="submit"
            disabled={status === "saving"}
            className="w-full h-12 bg-[var(--accent)] text-white text-sm font-bold rounded-xl hover:brightness-110 shadow-lg shadow-[var(--accent)]/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {status === "saving" ? t("saving") : t("save")}
          </button>
        </form>
      </div>
    </main>
  );
}

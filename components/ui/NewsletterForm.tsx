"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export function NewsletterForm() {
  const t = useTranslations("common.footer.newsletter");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    // TODO: Replace with actual API call
    setSubmitted(true);
    setEmail("");
  };

  if (submitted) {
    return (
      <p className="text-sm text-[var(--accent)] font-medium">{t("success")}</p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t("placeholder")}
        className="w-full px-3.5 py-2.5 text-sm bg-white/10 border border-white/10 rounded-lg text-white placeholder:text-[#a1a1aa] focus:outline-none focus:border-[var(--accent)]/50 transition-colors"
      />
      <button
        type="submit"
        className="w-full px-4 py-2.5 text-sm font-semibold bg-[var(--accent)] text-white rounded-lg hover:brightness-110 transition-all"
      >
        {t("button")}
      </button>
      <p className="text-[#71717a] text-xs">{t("disclaimer")}</p>
    </form>
  );
}

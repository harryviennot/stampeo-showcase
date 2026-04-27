"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth, type OAuthProvider } from "@/lib/supabase/auth-provider";

interface OAuthButtonsProps {
  returnTo?: string;
  disabled?: boolean;
  onError?: (message: string) => void;
}

export function OAuthButtons({ returnTo, disabled, onError }: OAuthButtonsProps) {
  const t = useTranslations("auth.oauth");
  const { signInWithOAuth } = useAuth();
  const [pending, setPending] = useState<OAuthProvider | null>(null);

  const handle = async (provider: OAuthProvider) => {
    setPending(provider);
    const { error } = await signInWithOAuth(provider, returnTo);
    if (error) {
      onError?.(t("error"));
      setPending(null);
    }
    // On success Supabase redirects, no need to clear pending.
  };

  const isDisabled = (p: OAuthProvider) => disabled || (pending !== null && pending !== p);

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => handle("apple")}
        disabled={isDisabled("apple")}
        className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-black text-white font-semibold rounded-full hover:bg-neutral-800 focus:ring-2 focus:ring-black focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white dark:text-black dark:hover:bg-neutral-200 dark:focus:ring-white"
      >
        <AppleLogo />
        <span>{pending === "apple" ? t("connecting") : t("apple")}</span>
      </button>

      <button
        type="button"
        onClick={() => handle("google")}
        disabled={isDisabled("google")}
        className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-white text-neutral-800 font-semibold rounded-full border border-[var(--border)] hover:bg-neutral-50 focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white/5 dark:text-[var(--foreground)] dark:hover:bg-white/10"
      >
        <GoogleLogo />
        <span>{pending === "google" ? t("connecting") : t("google")}</span>
      </button>
    </div>
  );
}

export function OAuthDivider() {
  const t = useTranslations("auth.oauth");
  return (
    <div className="relative my-2">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-[var(--border)]" />
      </div>
      <div className="relative flex justify-center">
        <span className="px-3 text-xs uppercase tracking-wider text-[var(--muted-foreground)] bg-[var(--card-bg)]">
          {t("divider")}
        </span>
      </div>
    </div>
  );
}

function AppleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

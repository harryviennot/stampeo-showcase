"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CaretRightIcon, EnvelopeSimpleIcon } from "@phosphor-icons/react";
import { useAuth, type OAuthProvider } from "@/lib/supabase/auth-provider";
import { AppleLogo, GoogleLogo } from "./OAuthButtons";
import { useLastLogin } from "@/lib/use-last-login";

interface AuthMethodChooserProps {
  /** Translation namespace that contains continueGoogle / continueApple / continueEmail keys. */
  namespace: string;
  returnTo?: string;
  onChooseEmail: () => void;
  onError?: (message: string) => void;
}

export function AuthMethodChooser({
  namespace,
  returnTo,
  onChooseEmail,
  onError,
}: AuthMethodChooserProps) {
  const t = useTranslations(namespace);
  const tOAuth = useTranslations("auth.oauth");
  const { signInWithOAuth } = useAuth();
  const [pending, setPending] = useState<OAuthProvider | null>(null);
  const lastUsed = useLastLogin()?.method ?? null;

  const handleOAuth = async (provider: OAuthProvider) => {
    setPending(provider);
    const { error } = await signInWithOAuth(provider, returnTo);
    if (error) {
      onError?.(tOAuth("error"));
      setPending(null);
    }
  };

  const lastUsedLabel = tOAuth("lastUsed");

  return (
    <div className="space-y-3">
      <MethodButton
        onClick={() => handleOAuth("google")}
        disabled={pending !== null}
        loading={pending === "google"}
        loadingLabel={tOAuth("connecting")}
        icon={<GoogleLogo size={20} />}
        lastUsedLabel={lastUsed === "google" ? lastUsedLabel : undefined}
      >
        {t("continueGoogle")}
      </MethodButton>
      <MethodButton
        onClick={() => handleOAuth("apple")}
        disabled={pending !== null}
        loading={pending === "apple"}
        loadingLabel={tOAuth("connecting")}
        icon={<AppleLogo size={20} />}
        lastUsedLabel={lastUsed === "apple" ? lastUsedLabel : undefined}
      >
        {t("continueApple")}
      </MethodButton>
      <MethodButton
        onClick={onChooseEmail}
        disabled={pending !== null}
        icon={<EnvelopeSimpleIcon size={20} />}
        lastUsedLabel={lastUsed === "email" ? lastUsedLabel : undefined}
      >
        {t("continueEmail")}
      </MethodButton>
    </div>
  );
}

interface MethodButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  loadingLabel?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  lastUsedLabel?: string;
}

function MethodButton({
  onClick,
  disabled,
  loading,
  loadingLabel,
  icon,
  children,
  lastUsedLabel,
}: MethodButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center gap-3 px-5 h-14 rounded-full border border-[var(--border)] bg-[var(--card-bg)] hover:bg-[var(--muted)] transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <span className="flex items-center justify-center w-7 h-7">{icon}</span>
      <span className="font-medium text-sm flex-1 text-[var(--foreground)]">
        {loading && loadingLabel ? loadingLabel : children}
      </span>
      {lastUsedLabel && (
        <span className="text-[10px] uppercase tracking-wide font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
          {lastUsedLabel}
        </span>
      )}
      <CaretRightIcon
        size={16}
        className="text-[var(--muted-foreground)]"
        weight="bold"
      />
    </button>
  );
}

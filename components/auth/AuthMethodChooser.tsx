"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { CaretRightIcon, EnvelopeSimpleIcon } from "@phosphor-icons/react";
import { useAuth, type OAuthProvider } from "@/lib/supabase/auth-provider";
import { AppleLogo, GoogleLogo } from "./OAuthButtons";
import { useLastLogin } from "@/lib/use-last-login";

// SSR-safe layout effect — useLayoutEffect logs a warning when rendered on the
// server. The chooser is a client component, but Next can still pre-render it.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

interface AuthMethodChooserProps {
  /** Translation namespace that contains continueGoogle / continueApple / continueEmail keys
   * and matching {key}Short variants used when the full label doesn't fit. */
  namespace: string;
  returnTo?: string;
  onChooseEmail: () => void;
  onError?: (message: string) => void;
  /** Fires synchronously before the OAuth redirect — use it to stash data the
   * callback page needs (e.g. step-1 fields the provider won't return). */
  onBeforeOAuth?: (provider: OAuthProvider) => void;
}

export function AuthMethodChooser({
  namespace,
  returnTo,
  onChooseEmail,
  onError,
  onBeforeOAuth,
}: AuthMethodChooserProps) {
  const t = useTranslations(namespace);
  const tOAuth = useTranslations("auth.oauth");
  const { signInWithOAuth } = useAuth();
  const [pending, setPending] = useState<OAuthProvider | null>(null);
  const lastUsed = useLastLogin()?.method ?? null;

  const handleOAuth = async (provider: OAuthProvider) => {
    setPending(provider);
    onBeforeOAuth?.(provider);
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
        shortLabel={t("continueGoogleShort")}
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
        shortLabel={t("continueAppleShort")}
        lastUsedLabel={lastUsed === "apple" ? lastUsedLabel : undefined}
      >
        {t("continueApple")}
      </MethodButton>
      <MethodButton
        onClick={onChooseEmail}
        disabled={pending !== null}
        icon={<EnvelopeSimpleIcon size={20} />}
        shortLabel={t("continueEmailShort")}
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
  shortLabel?: string;
  lastUsedLabel?: string;
}

function MethodButton({
  onClick,
  disabled,
  loading,
  loadingLabel,
  icon,
  children,
  shortLabel,
  lastUsedLabel,
}: MethodButtonProps) {
  const [useShort, setUseShort] = useState(false);
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);

  const longLabel = loading && loadingLabel ? loadingLabel : children;

  useIsomorphicLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    const measure = measureRef.current;
    if (!wrapper || !measure || !shortLabel) {
      setUseShort(false);
      return;
    }

    const check = () => {
      const longWidth = measure.scrollWidth;
      const availableWidth = wrapper.clientWidth;
      setUseShort(longWidth > availableWidth);
    };

    check();

    const obs = new ResizeObserver(check);
    obs.observe(wrapper);
    return () => obs.disconnect();
  }, [longLabel, shortLabel, lastUsedLabel]);

  const visibleLabel = useShort && shortLabel ? shortLabel : longLabel;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center gap-3 px-5 h-14 rounded-full border border-[var(--border)] bg-[var(--card-bg)] hover:bg-[var(--muted)] transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <span className="flex items-center justify-center w-7 h-7 shrink-0">
        {icon}
      </span>
      <span
        ref={wrapperRef}
        className="font-medium text-sm flex-1 min-w-0 text-[var(--foreground)] relative"
      >
        <span
          ref={measureRef}
          aria-hidden="true"
          className="invisible absolute top-0 left-0 whitespace-nowrap pointer-events-none"
        >
          {longLabel}
        </span>
        <span className="block truncate">{visibleLabel}</span>
      </span>
      {lastUsedLabel && (
        <span className="shrink-0 text-[10px] uppercase tracking-wide font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
          {lastUsedLabel}
        </span>
      )}
      <CaretRightIcon
        size={16}
        className="text-[var(--muted-foreground)] shrink-0"
        weight="bold"
      />
    </button>
  );
}

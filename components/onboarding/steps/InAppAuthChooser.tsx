"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import posthog from "posthog-js";
import { EnvelopeSimpleIcon } from "@phosphor-icons/react";
import { MethodButton } from "@/components/auth/AuthMethodChooser";
import { AppleLogo, GoogleLogo } from "@/components/auth/OAuthButtons";
import { useDevicePlatform } from "@/hooks/useDevicePlatform";
import { attemptBrowserEscape } from "@/lib/auth/browser-escape";
import { escapeParamsFromCookies } from "@/lib/auth/escape-params";
import { buildBrowserEscapeUrl, type InAppBrowser } from "@/lib/auth/in-app-browser";
import { useAuth, type OAuthProvider } from "@/lib/supabase/auth-provider";

interface InAppAuthChooserProps {
  inAppBrowser: InAppBrowser;
  returnTo: string;
  onChooseEmail: () => void;
  onError: (message: string) => void;
  /** Fires synchronously before the OAuth redirect, to stash the step-1 fields. */
  onBeforeOAuth: (provider: OAuthProvider) => void;
}

/**
 * The account chooser inside Meta's in-app browsers: email first, because it is
 * the one method that always works there. Google and Apple follow and first try
 * to reopen the page in the phone's real browser, where the saved login lives;
 * when that does not happen, the visitor can continue with the provider here.
 */
export function InAppAuthChooser({
  inAppBrowser,
  returnTo,
  onChooseEmail,
  onError,
  onBeforeOAuth,
}: InAppAuthChooserProps) {
  const t = useTranslations("onboarding.createAccount");
  const tOAuth = useTranslations("auth.oauth");
  const { signInWithOAuth } = useAuth();
  const locale = useLocale();
  const platform = useDevicePlatform();
  const [pending, setPending] = useState<OAuthProvider | null>(null);
  const [stayedOn, setStayedOn] = useState<OAuthProvider | null>(null);

  const continueHere = async (provider: OAuthProvider) => {
    setPending(provider);
    onBeforeOAuth(provider);
    const { error } = await signInWithOAuth(provider, returnTo);
    if (error) {
      onError(tOAuth("error"));
      setPending(null);
    }
  };

  const openInBrowser = async (provider: OAuthProvider) => {
    if (platform === "desktop") return continueHere(provider);

    const event = { provider, platform, in_app_browser: inAppBrowser };
    setStayedOn(null);
    setPending(provider);
    posthog.capture("onboarding_browser_escape_attempted", event);

    const url = buildBrowserEscapeUrl({
      platform,
      origin: window.location.origin,
      path: `/${locale}/onboarding`,
      params: escapeParamsFromCookies(document.cookie),
    });
    const outcome = await attemptBrowserEscape({
      url,
      navigate: (target) => window.location.assign(target),
      doc: document,
      win: window,
    });

    setPending(null);
    if (outcome === "stayed") {
      posthog.capture("onboarding_browser_escape_failed", event);
      setStayedOn(provider);
    }
  };

  const providers = [
    { id: "google", name: "Google", Logo: GoogleLogo, label: t("continueGoogle"), short: t("continueGoogleShort") },
    { id: "apple", name: "Apple", Logo: AppleLogo, label: t("continueApple"), short: t("continueAppleShort") },
  ] as const;

  return (
    <div className="space-y-3">
      <MethodButton
        onClick={onChooseEmail}
        disabled={pending !== null}
        icon={<EnvelopeSimpleIcon size={20} />}
        shortLabel={t("continueEmailShort")}
      >
        {t("continueEmail")}
      </MethodButton>

      {providers.map(({ id, name, Logo, label, short }) => (
        <div key={id}>
          <MethodButton
            onClick={() => openInBrowser(id)}
            disabled={pending !== null}
            loading={pending === id}
            loadingLabel={tOAuth("connecting")}
            icon={<Logo size={20} />}
            shortLabel={short}
          >
            {label}
          </MethodButton>
          <div aria-live="polite">
            {stayedOn === id && (
              <div className="mt-3 space-y-3 text-center">
                <p className="text-sm text-[var(--muted-foreground)]">{t("escapeHint")}</p>
                <button
                  type="button"
                  onClick={() => continueHere(id)}
                  disabled={pending !== null}
                  className="w-full h-11 px-5 rounded-full border border-[var(--border)] text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t("continueHere", { provider: name })}
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
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
import { BrowserEscapeGuide } from "./BrowserEscapeGuide";

export interface InAppAuthChooserProps {
  inAppBrowser: InAppBrowser;
  returnTo: string;
  onChooseEmail: () => void;
  onError: (message: string) => void;
  /** Fires synchronously before the OAuth redirect, to stash the step-1 fields. */
  onBeforeOAuth: (provider: OAuthProvider) => void;
}

/** The chooser inside Meta's in-app browsers: email first, Google and Apple try the phone's own browser before signing in here. */
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
  const [guideFor, setGuideFor] = useState<OAuthProvider | null>(null);
  const rows = useRef<Partial<Record<OAuthProvider, HTMLDivElement | null>>>({});
  const returnFocusTo = useRef<OAuthProvider | null>(null);

  // Once the guide is gone the page is interactive again: hand focus back to the row that was tapped.
  useEffect(() => {
    if (guideFor !== null || returnFocusTo.current === null) return;
    rows.current[returnFocusTo.current]?.querySelector("button")?.focus();
    returnFocusTo.current = null;
  }, [guideFor]);

  const openInBrowser = async (provider: OAuthProvider) => {
    // No phone browser to hand over to: sign in here.
    if (platform === "desktop") {
      setPending(provider);
      onBeforeOAuth(provider);
      const { error } = await signInWithOAuth(provider, returnTo);
      if (error) {
        onError(tOAuth("error"));
        setPending(null);
      }
      return;
    }

    const event = { provider, platform, in_app_browser: inAppBrowser };
    setPending(provider);
    posthog.capture("onboarding_browser_escape_attempted", event);

    const url = buildBrowserEscapeUrl({
      platform,
      origin: window.location.origin,
      path: `/${locale}/start`,
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
      returnFocusTo.current = provider;
      setGuideFor(provider);
    }
  };

  const providers = [
    { id: "google", name: "Google", Logo: GoogleLogo, label: t("continueGoogle"), short: t("continueGoogleShort") },
    { id: "apple", name: "Apple", Logo: AppleLogo, label: t("continueApple"), short: t("continueAppleShort") },
  ] as const;

  return (
    <>
      <div className="space-y-3">
        <MethodButton
          onClick={onChooseEmail}
          disabled={pending !== null}
          icon={<EnvelopeSimpleIcon size={20} />}
          shortLabel={t("continueEmailShort")}
        >
          {t("continueEmail")}
        </MethodButton>

        {providers.map(({ id, Logo, label, short }) => (
          <div
            key={id}
            ref={(node) => {
              rows.current[id] = node;
            }}
          >
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
          </div>
        ))}
      </div>

      {guideFor && (
        <BrowserEscapeGuide
          provider={providers.find(({ id }) => id === guideFor)?.name ?? ""}
          onClose={() => setGuideFor(null)}
          onChooseEmail={() => {
            returnFocusTo.current = null;
            setGuideFor(null);
            onChooseEmail();
          }}
        />
      )}
    </>
  );
}

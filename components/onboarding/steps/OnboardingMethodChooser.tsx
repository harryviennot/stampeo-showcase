"use client";

import { AuthMethodChooser } from "@/components/auth/AuthMethodChooser";
import { useInAppBrowser } from "@/hooks/useInAppBrowser";
import { InAppAuthChooser, type InAppAuthChooserProps } from "./InAppAuthChooser";

/** The sign-up method chooser: Meta's in-app browsers get their own, every other browser the shared one. */
export function OnboardingMethodChooser(props: Omit<InAppAuthChooserProps, "inAppBrowser">) {
  const inAppBrowser = useInAppBrowser();
  if (inAppBrowser) return <InAppAuthChooser inAppBrowser={inAppBrowser} {...props} />;
  return <AuthMethodChooser namespace="onboarding.createAccount" {...props} />;
}

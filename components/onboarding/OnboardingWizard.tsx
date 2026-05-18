"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import posthog from "posthog-js";
import { useAuth } from "@/lib/supabase/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { updateUserProfile } from "@/lib/onboarding";
import { UserInfoStep } from "./steps/UserInfoStep";
import {
  AuthenticationStep,
  type AuthPhase,
} from "./steps/AuthenticationStep";

const OAUTH_STASH_KEY = "stampeo_onboarding_oauth_pending_v1";
const DRAFT_STORAGE_KEY = "stampeo_onboarding_draft_v1";

const STEP_NAMES: Record<number, string> = {
  1: "user_info",
  2: "authentication",
};

interface DraftData {
  name: string;
  phone: string;
}

interface OAuthStash {
  name?: string;
  phone?: string;
}

function loadDraft(): DraftData {
  if (typeof window === "undefined") return { name: "", phone: "" };
  try {
    const raw = sessionStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return { name: "", phone: "" };
    const parsed = JSON.parse(raw) as Partial<DraftData>;
    return { name: parsed.name ?? "", phone: parsed.phone ?? "" };
  } catch {
    return { name: "", phone: "" };
  }
}

function saveDraft(data: DraftData) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore quota
  }
}

function clearDraft() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(DRAFT_STORAGE_KEY);
    sessionStorage.removeItem(OAUTH_STASH_KEY);
  } catch {
    // ignore
  }
}

function readOAuthStash(): OAuthStash | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(OAUTH_STASH_KEY);
    return raw ? (JSON.parse(raw) as OAuthStash) : null;
  } catch {
    return null;
  }
}

function redirectToApp() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.stampeo.app";
  window.location.href = appUrl;
}

export function OnboardingWizard() {
  const t = useTranslations("onboarding.steps");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, loading: authLoading } = useAuth();
  const justAuthed = searchParams.get("just_authed") === "oauth";

  const [step, setStep] = useState<1 | 2>(1);
  const [authPhase, setAuthPhase] = useState<AuthPhase>("choose");
  const [data, setData] = useState<DraftData>(() => loadDraft());
  const [email, setEmail] = useState("");

  const startedRef = useRef(false);
  const oauthHandledRef = useRef(false);

  useEffect(() => {
    saveDraft(data);
  }, [data]);

  // Already-signed-in users (no oauth flag) bypass the wizard.
  useEffect(() => {
    if (justAuthed) return;
    if (authLoading) return;
    if (session?.access_token) {
      clearDraft();
      redirectToApp();
    }
  }, [justAuthed, authLoading, session]);

  // OAuth round-trip completion: sync stashed step-1 fields, then redirect.
  useEffect(() => {
    if (!justAuthed) return;
    if (authLoading) return;
    if (oauthHandledRef.current) return;

    if (!session?.access_token) {
      // Edge case: came back with the flag but no session (cookies wiped,
      // provider rejection, etc). Drop the flag so the wizard renders normally.
      oauthHandledRef.current = true;
      router.replace("/onboarding");
      return;
    }

    oauthHandledRef.current = true;
    (async () => {
      const stash = readOAuthStash();
      const supabase = createClient();
      const meta: Record<string, unknown> = {};
      if (stash?.name && stash.name.trim()) meta.name = stash.name.trim();
      if (stash?.phone && stash.phone.trim()) meta.phone = stash.phone.trim();

      if (Object.keys(meta).length > 0) {
        await supabase.auth.updateUser({ data: meta });
        if (stash?.phone && stash.phone.trim()) {
          await updateUserProfile(
            { phone: stash.phone.trim() },
            session.access_token
          );
        }
      }

      clearDraft();
      redirectToApp();
    })();
  }, [justAuthed, authLoading, session, router]);

  useEffect(() => {
    if (startedRef.current) return;
    if (authLoading || justAuthed) return;
    startedRef.current = true;
    posthog.capture("onboarding_wizard_started", {
      is_authenticated: !!session?.access_token,
    });
  }, [authLoading, justAuthed, session]);

  const completeStep = useCallback(
    (currentStep: 1 | 2) => {
      posthog.capture("onboarding_step_completed", {
        step: currentStep,
        step_name: STEP_NAMES[currentStep] ?? `step_${currentStep}`,
      });
    },
    []
  );

  const handleStep1Next = useCallback(() => {
    completeStep(1);
    setStep(2);
    setAuthPhase("choose");
  }, [completeStep]);

  const handleBackToStep1 = useCallback(() => {
    setStep(1);
  }, []);

  const handleAuthCompleted = useCallback(
    async (opts?: { isExistingUser?: boolean }) => {
      completeStep(2);
      // Email signup writes phone to public.users via the auth trigger (raw E.164).
      // PUT /profile/me with the same phone so the validator normalizes it to
      // the canonical dashed format. OAuth completion handles its own sync above.
      // Skip the write for existing users — they already have a profile and the
      // step-1 fields they re-entered shouldn't clobber it.
      if (data.phone && !opts?.isExistingUser) {
        const supabase = createClient();
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;
        if (token) {
          await updateUserProfile({ phone: data.phone }, token);
        }
      }
      clearDraft();
      redirectToApp();
    },
    [completeStep, data.phone]
  );

  const stepDots = useMemo(() => [1, 2] as const, []);

  if (justAuthed) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 min-h-[40vh]">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[var(--muted-foreground)]">
          {t("settingUp")}
        </p>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If a logged-in user landed here (the redirect effect above will run, but
  // render nothing while it does to avoid flashing the wizard).
  if (session?.access_token) {
    return null;
  }

  return (
    <div className="w-full max-w-md mx-auto px-0 sm:px-4">
      <div className="mb-6 flex justify-center gap-2">
        {stepDots.map((dot) => (
          <div
            key={dot}
            className={`h-2 rounded-full transition-all duration-300 ${
              dot === step
                ? "w-6 bg-[var(--accent)]"
                : dot < step
                  ? "w-2 bg-[var(--accent)]"
                  : "w-2 bg-[var(--muted)]"
            }`}
          />
        ))}
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-4 sm:p-8 shadow-sm">
        {step === 1 && (
          <UserInfoStep
            value={data}
            onChange={(patch) => setData((d) => ({ ...d, ...patch }))}
            onNext={handleStep1Next}
          />
        )}
        {step === 2 && (
          <AuthenticationStep
            name={data.name}
            phone={data.phone}
            email={email}
            onEmailChange={setEmail}
            phase={authPhase}
            onPhaseChange={setAuthPhase}
            onBack={handleBackToStep1}
            onCompleted={handleAuthCompleted}
            oauthStashKey={OAUTH_STASH_KEY}
          />
        )}
      </div>
    </div>
  );
}

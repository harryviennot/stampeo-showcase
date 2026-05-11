"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/supabase/auth-provider";
import { suggestCorrectedEmail } from "@/lib/email-typo-check";

interface AccountStepProps {
  value: { name: string; phone: string; email: string; password: string };
  locale: string;
  onChange: (patch: { email?: string; password?: string }) => void;
  onOtpRequested: () => void;
  onBack: () => void;
}

const MIN_PASSWORD_LEN = 8;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Step 2 — email + password. Calls `signUp` with all the metadata collected
 * so far (name, phone, locale). On success, advances to OTP. Handles the
 * "user already exists" case by silently attempting sign-in so returning
 * users don't get stuck.
 */
export function AccountStep({ value, locale, onChange, onOtpRequested, onBack }: AccountStepProps) {
  const tStep = useTranslations("signup.steps.account");
  const tErr = useTranslations("signup.errors");
  const tCommon = useTranslations("signup");
  const { signUp, signIn, resendOtp } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const emailValid = EMAIL_RE.test(value.email);
  const passwordValid = value.password.length >= MIN_PASSWORD_LEN;
  const formValid = emailValid && passwordValid;

  const typoSuggestion = emailValid ? suggestCorrectedEmail(value.email) : null;

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!formValid) {
        setShowErrors(true);
        return;
      }
      setError(null);
      setLoading(true);

      try {
        const { data: signUpData, error: signUpError } = await signUp(
          value.email,
          value.password,
          value.name,
          locale,
          value.phone || undefined
        );

        if (!signUpError) {
          // Supabase returns user with empty identities[] when the email is already in use
          // (email enumeration protection). Treat as existing user.
          const isExistingUser = !signUpData?.user || signUpData.user.identities?.length === 0;
          if (isExistingUser) {
            const { error: signInError } = await signIn(value.email, value.password);
            if (!signInError) {
              // Already authenticated — bounce to app.
              const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.stampeo.app";
              window.location.href = appUrl;
              return;
            }
            const signInMsg = signInError.message.toLowerCase();
            if (signInMsg.includes("email not confirmed")) {
              await resendOtp(value.email);
              onOtpRequested();
              return;
            }
            setError(tErr("generic"));
            return;
          }
          // New user — OTP sent automatically by signUp.
          onOtpRequested();
          return;
        }

        // Explicit "already exists" error path.
        const errorMsg = signUpError.message.toLowerCase();
        if (
          errorMsg.includes("already registered") ||
          errorMsg.includes("already exists") ||
          errorMsg.includes("user already")
        ) {
          const { error: signInError } = await signIn(value.email, value.password);
          if (!signInError) {
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.stampeo.app";
            window.location.href = appUrl;
            return;
          }
          if (signInError.message.toLowerCase().includes("email not confirmed")) {
            await resendOtp(value.email);
            onOtpRequested();
            return;
          }
          setError(tErr("generic"));
          return;
        }

        setError(signUpError.message);
      } catch (err) {
        setError(err instanceof Error ? err.message : tErr("generic"));
      } finally {
        setLoading(false);
      }
    },
    [formValid, value, locale, signUp, signIn, resendOtp, onOtpRequested, tErr]
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-[22px] min-[768px]:text-[26px] font-semibold leading-tight">
          {tStep("title")}
        </h1>
        <p className="text-[14px] text-[#7A7A7A]">{tStep("subtitle")}</p>
      </header>

      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="signup-email" className="text-[13px] font-medium">
            {tStep("email")}
          </label>
          <input
            id="signup-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoFocus
            value={value.email}
            onChange={(e) => onChange({ email: e.target.value })}
            placeholder={tStep("emailPlaceholder")}
            className="h-11 rounded-[10px] border border-[var(--border)] bg-white px-3.5 text-[14px] outline-none focus:border-[var(--accent)] transition-colors"
          />
          {typoSuggestion && (
            <button
              type="button"
              onClick={() => onChange({ email: typoSuggestion })}
              className="text-[11.5px] text-[var(--accent)] text-left underline-offset-2 hover:underline"
            >
              {tErr("emailTypoSuggest", { suggestion: typoSuggestion })}
            </button>
          )}
          {showErrors && !emailValid && (
            <p className="text-[12px] text-red-600">{tErr("emailInvalid")}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="signup-password" className="text-[13px] font-medium">
            {tStep("password")}
          </label>
          <div className="relative">
            <input
              id="signup-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={value.password}
              onChange={(e) => onChange({ password: e.target.value })}
              placeholder={tStep("passwordPlaceholder")}
              className="h-11 w-full rounded-[10px] border border-[var(--border)] bg-white pl-3.5 pr-11 text-[14px] outline-none focus:border-[var(--accent)] transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888] hover:text-[var(--foreground)]"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeSlash className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[11.5px] text-[#999]">{tStep("passwordHint")}</p>
          {showErrors && !passwordValid && (
            <p className="text-[12px] text-red-600">{tErr("passwordTooShort")}</p>
          )}
        </div>

        {error && (
          <div className="rounded-[10px] border border-red-200 bg-red-50 px-3 py-2.5 text-[12.5px] text-red-700">
            {error}
          </div>
        )}
      </div>

      <Button className="w-full min-h-[48px]">
        {loading ? tStep("submitting") : tStep("submit")}
      </Button>

      <button
        type="button"
        onClick={onBack}
        className="text-center text-[13px] text-[#888] hover:text-[var(--foreground)] -mt-2"
      >
        ← {tCommon("back")}
      </button>
    </form>
  );
}

"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { OnboardingStore } from "@/hooks/useOnboardingStore";
import { useAuth } from "@/lib/supabase/auth-provider";

interface CreateAccountStepProps {
  store: OnboardingStore;
  onNext: () => void;
  onBack: () => void;
}

export function CreateAccountStep({
  store,
  onNext,
  onBack,
}: CreateAccountStepProps) {
  const t = useTranslations("onboarding.createAccount");
  const tc = useTranslations("common.buttons");
  const { data, updateData } = store;
  const { signUp, signIn, verifyOtp, resendOtp } = useAuth();
  const locale = useLocale();

  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<"form" | "verify">("form");
  const [otpCode, setOtpCode] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [codeSentMessage, setCodeSentMessage] = useState(false);
  const otpInputRef = useRef<HTMLInputElement>(null);

  const isFormValid =
    data.email.includes("@") && data.email.includes(".") && password.length >= 6;

  const isOtpValid = otpCode.length === 6;

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Auto-focus OTP input when entering verify phase
  useEffect(() => {
    if (phase === "verify") {
      setTimeout(() => otpInputRef.current?.focus(), 100);
    }
  }, [phase]);

  const handleFormSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!isFormValid) return;

      setError(null);
      setLoading(true);

      try {
        // 1. Try signup first
        const { error: signUpError } = await signUp(
          data.email,
          password,
          data.ownerName,
          locale
        );

        if (!signUpError) {
          // New user created — move to OTP verification
          setResendCooldown(60);
          setPhase("verify");
          setLoading(false);
          return;
        }

        // 2. If already registered, silently try sign-in
        const errorMsg = signUpError.message.toLowerCase();
        if (
          errorMsg.includes("already registered") ||
          errorMsg.includes("already exists") ||
          errorMsg.includes("user already")
        ) {
          const { error: signInError } = await signIn(data.email, password);

          if (!signInError) {
            // Existing verified user — proceed directly
            onNext();
            return;
          }

          const signInMsg = signInError.message.toLowerCase();
          if (signInMsg.includes("email not confirmed")) {
            // Existing unverified user — resend OTP and show verify phase
            await resendOtp(data.email);
            setResendCooldown(60);
            setPhase("verify");
            setLoading(false);
            return;
          }

          // Wrong password for existing account
          setError(t("accountExistsWrongPassword"));
          setLoading(false);
          return;
        }

        // Other signup error
        setError(signUpError.message);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setLoading(false);
      }
    },
    [isFormValid, data.email, data.ownerName, password, signUp, signIn, resendOtp, onNext, locale, t]
  );

  const handleVerifySubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!isOtpValid) return;

      setError(null);
      setLoading(true);

      try {
        const { error: verifyError } = await verifyOtp(data.email, otpCode);

        if (verifyError) {
          setError(t("invalidCode"));
          setOtpCode("");
          setLoading(false);
          return;
        }

        // Verification successful — session is now established
        onNext();
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setLoading(false);
      }
    },
    [isOtpValid, data.email, otpCode, verifyOtp, onNext, t]
  );

  const handleResend = useCallback(async () => {
    if (resendCooldown > 0) return;

    const { error } = await resendOtp(data.email);
    if (!error) {
      setResendCooldown(60);
      setCodeSentMessage(true);
      setTimeout(() => setCodeSentMessage(false), 3000);
    }
  }, [resendCooldown, resendOtp, data.email]);

  const handleChangeEmail = useCallback(() => {
    setPhase("form");
    setOtpCode("");
    setError(null);
    setCodeSentMessage(false);
  }, []);

  // OTP input handler — only allow digits
  const handleOtpChange = useCallback((value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 6);
    setOtpCode(digits);
  }, []);

  if (phase === "verify") {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
            {t("verifyTitle")}
          </h1>
          <p className="text-[var(--muted-foreground)] mt-2">
            {t("verifySubtitle", { email: data.email })}
          </p>
        </div>

        <form onSubmit={handleVerifySubmit} className="space-y-5">
          {error && (
            <div className="p-4 rounded-2xl bg-red-50 text-red-600 text-sm border border-red-100 dark:bg-red-950/50 dark:border-red-900/50 dark:text-red-400">
              {error}
            </div>
          )}

          {codeSentMessage && (
            <div className="p-4 rounded-2xl bg-green-50 text-green-600 text-sm border border-green-100 dark:bg-green-950/50 dark:border-green-900/50 dark:text-green-400">
              {t("codeSent")}
            </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="otp"
              className="block text-sm font-medium text-[var(--foreground)]"
            >
              {t("verifyCode")}
            </label>
            <input
              ref={otpInputRef}
              id="otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={otpCode}
              onChange={(e) => handleOtpChange(e.target.value)}
              maxLength={6}
              className="w-full px-4 py-3.5 rounded-xl border border-[var(--border)] bg-white/50 dark:bg-white/5 focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] outline-none transition-all duration-200 text-[var(--foreground)] text-center text-2xl font-mono tracking-[0.5em] placeholder:text-[var(--muted-foreground)] placeholder:tracking-[0.5em] placeholder:text-lg"
              placeholder={t("verifyCodePlaceholder")}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleChangeEmail}
              disabled={loading}
              className="flex-1 py-3.5 px-4 border border-[var(--border)] text-[var(--foreground)] font-semibold rounded-full hover:bg-[var(--muted)] focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 transition-all duration-200 disabled:opacity-50"
            >
              {tc("back")}
            </button>
            <button
              type="submit"
              disabled={!isOtpValid || loading}
              className="flex-1 py-3.5 px-4 bg-[var(--accent)] text-white font-semibold rounded-full hover:bg-[var(--accent-hover)] hover:scale-[1.02] hover:shadow-lg hover:shadow-[var(--accent)]/25 focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? t("verifying") : t("verifyButton")}
            </button>
          </div>

          <div className="text-center pt-2 space-y-2">
            <p className="text-sm text-[var(--muted-foreground)]">
              {resendCooldown > 0 ? (
                t("resendIn", { seconds: resendCooldown })
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-[var(--accent)] hover:opacity-80 font-medium transition-colors"
                >
                  {t("resendCode")}
                </button>
              )}
            </p>
            <p>
              <button
                type="button"
                onClick={handleChangeEmail}
                className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              >
                {t("changeEmail")}
              </button>
            </p>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
          {t("title")}
        </h1>
        <p className="text-[var(--muted-foreground)] mt-2">
          {t("subtitle")}
        </p>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-5">
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 text-red-600 text-sm border border-red-100 dark:bg-red-950/50 dark:border-red-900/50 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Email */}
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-[var(--foreground)]"
          >
            {t("email")}
          </label>
          <input
            id="email"
            type="email"
            value={data.email}
            onChange={(e) => updateData({ email: e.target.value })}
            required
            className="w-full px-4 py-3.5 rounded-xl border border-[var(--border)] bg-white/50 dark:bg-white/5 focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] outline-none transition-all duration-200 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
            placeholder={t("emailPlaceholder")}
          />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-[var(--foreground)]"
          >
            {t("password")}
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-3.5 rounded-xl border border-[var(--border)] bg-white/50 dark:bg-white/5 focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] outline-none transition-all duration-200 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
            placeholder={t("passwordPlaceholder")}
          />
          <p className="text-xs text-[var(--muted-foreground)]">
            {t("passwordHint")}
          </p>
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onBack}
            disabled={loading}
            className="flex-1 py-3.5 px-4 border border-[var(--border)] text-[var(--foreground)] font-semibold rounded-full hover:bg-[var(--muted)] focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 transition-all duration-200 disabled:opacity-50"
          >
            {tc("back")}
          </button>
          <button
            type="submit"
            disabled={!isFormValid || loading}
            className="flex-1 py-3.5 px-4 bg-[var(--accent)] text-white font-semibold rounded-full hover:bg-[var(--accent-hover)] hover:scale-[1.02] hover:shadow-lg hover:shadow-[var(--accent)]/25 focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? t("submitting") : t("continue")}
          </button>
        </div>
      </form>
    </div>
  );
}

"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Eye, EyeSlash, Check } from "@phosphor-icons/react";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/lib/supabase/auth-provider";
import { suggestCorrectedEmail } from "@/lib/email-typo-check";
import { AuthMethodChooser } from "@/components/auth/AuthMethodChooser";

export type AuthPhase = "choose" | "form" | "verify";

/** "signup" = verify the signup-confirmation OTP for a brand-new account.
 *  "signin" = verify the magic-link OTP we sent to log in an EXISTING account
 *  (wrong password, OAuth-only, unconfirmed email — all routed here so we
 *  never block the user with an error). */
type VerifyMode = "signup" | "signin";

interface AuthenticationStepProps {
  name: string;
  phone: string;
  email: string;
  onEmailChange: (email: string) => void;
  phase: AuthPhase;
  onPhaseChange: (phase: AuthPhase) => void;
  onBack: () => void;
  onCompleted: (opts?: { isExistingUser?: boolean }) => void;
  /** sessionStorage key where {name, phone} is stashed before OAuth redirect. */
  oauthStashKey: string;
}

export function AuthenticationStep({
  name,
  phone,
  email,
  onEmailChange,
  phase,
  onPhaseChange,
  onBack,
  onCompleted,
  oauthStashKey,
}: AuthenticationStepProps) {
  const t = useTranslations("onboarding.createAccount");
  const tAuth = useTranslations("onboarding.authentication");
  const tc = useTranslations("common.buttons");
  const { signUp, signIn, verifyOtp, resendOtp, signInWithOtp } = useAuth();
  const locale = useLocale();

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [codeSentMessage, setCodeSentMessage] = useState(false);
  const [verifyMode, setVerifyMode] = useState<VerifyMode>("signup");
  const otpInputRef = useRef<HTMLInputElement>(null);

  const passwordChecks = useMemo(
    () => ({
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      symbol: /[^a-zA-Z0-9]/.test(password),
      minLength: password.length >= 6,
    }),
    [password]
  );

  const isPasswordStrong = Object.values(passwordChecks).every(Boolean);
  const isFormValid =
    email.includes("@") && email.includes(".") && isPasswordStrong;
  const isOtpValid = otpCode.length === 6;

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  useEffect(() => {
    if (phase === "verify") {
      setTimeout(() => otpInputRef.current?.focus(), 100);
    }
  }, [phase]);

  const typoSuggestion = useMemo(
    () => suggestCorrectedEmail(email),
    [email]
  );

  const applyTypoSuggestion = useCallback(() => {
    if (typoSuggestion) {
      onEmailChange(typoSuggestion);
    }
  }, [typoSuggestion, onEmailChange]);

  const stashForOAuth = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.setItem(
        oauthStashKey,
        JSON.stringify({ name, phone })
      );
    } catch {
      // sessionStorage may be unavailable (private mode, quota); proceed anyway.
    }
  }, [name, phone, oauthStashKey]);

  // Route an existing user through OTP verification when we can't sign them in
  // with the password they typed (wrong password, OAuth-only account, etc.).
  // Sends a sign-in OTP and switches to the verify phase — they'll land in the
  // dashboard after entering the code. We never surface an "account exists"
  // error: registering an existing email always resolves to a logged-in state.
  const routeExistingUserToOtp = useCallback(async () => {
    setVerifyMode("signin");
    const { error: otpError } = await signInWithOtp(email);
    if (otpError) {
      // signInWithOtp can fail for unconfirmed emails (`shouldCreateUser:false`
      // requires a confirmed user on some Supabase configs). Fall back to the
      // signup-confirmation OTP, which works for unconfirmed accounts.
      setVerifyMode("signup");
      await resendOtp(email);
    }
    setResendCooldown(60);
    onPhaseChange("verify");
    setLoading(false);
  }, [email, signInWithOtp, resendOtp, onPhaseChange]);

  const handleFormSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!isFormValid) return;

      setError(null);
      setLoading(true);

      try {
        const { data: signUpData, error: signUpError } = await signUp(
          email,
          password,
          name,
          locale,
          phone || undefined
        );

        // Existing account — Supabase signals this two ways: signUp returns
        // an "already registered" error, or it succeeds with an empty
        // identities array (the secure "don't leak whether the email exists"
        // path). Treat both identically: try the password, fall back to OTP.
        const errorMsg = signUpError?.message.toLowerCase() ?? "";
        const isExistingFromError =
          !!signUpError &&
          (errorMsg.includes("already registered") ||
            errorMsg.includes("already exists") ||
            errorMsg.includes("user already"));
        const isExistingFromIdentities =
          !signUpError &&
          (!signUpData?.user || signUpData.user.identities?.length === 0);

        if (isExistingFromError || isExistingFromIdentities) {
          const { error: signInError } = await signIn(email, password);
          if (!signInError) {
            onCompleted({ isExistingUser: true });
            return;
          }
          await routeExistingUserToOtp();
          return;
        }

        if (signUpError) {
          setError(signUpError.message);
          setLoading(false);
          return;
        }

        // Fresh signup — go to the confirmation OTP.
        setVerifyMode("signup");
        setResendCooldown(60);
        onPhaseChange("verify");
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setLoading(false);
      }
    },
    [
      isFormValid,
      email,
      name,
      password,
      phone,
      locale,
      signUp,
      signIn,
      onCompleted,
      onPhaseChange,
      routeExistingUserToOtp,
    ]
  );

  const handleVerifySubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!isOtpValid) return;

      setError(null);
      setLoading(true);

      try {
        const otpType = verifyMode === "signin" ? "email" : "signup";
        const { error: verifyError } = await verifyOtp(email, otpCode, otpType);

        if (verifyError) {
          setError(t("invalidCode"));
          setOtpCode("");
          setLoading(false);
          return;
        }

        onCompleted({ isExistingUser: verifyMode === "signin" });
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setLoading(false);
      }
    },
    [isOtpValid, email, otpCode, verifyOtp, verifyMode, onCompleted, t]
  );

  const handleResend = useCallback(async () => {
    if (resendCooldown > 0) return;

    const { error } =
      verifyMode === "signin"
        ? await signInWithOtp(email)
        : await resendOtp(email);
    if (!error) {
      setResendCooldown(60);
      setCodeSentMessage(true);
      setTimeout(() => setCodeSentMessage(false), 3000);
    }
  }, [resendCooldown, resendOtp, signInWithOtp, verifyMode, email]);

  const handleChangeEmail = useCallback(() => {
    onPhaseChange("form");
    setOtpCode("");
    setError(null);
    setCodeSentMessage(false);
  }, [onPhaseChange]);

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
            {t.rich("verifySubtitle", {
              email,
              strong: (chunks) => (
                <strong className="font-semibold text-[var(--foreground)]">
                  {chunks}
                </strong>
              ),
            })}
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

  if (phase === "choose") {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
            {t("chooseTitle")}
          </h1>
          <p className="text-[var(--muted-foreground)] mt-2">
            {t("chooseSubtitle")}
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 text-red-600 text-sm border border-red-100 dark:bg-red-950/50 dark:border-red-900/50 dark:text-red-400 mb-5">
            {error}
          </div>
        )}

        <AuthMethodChooser
          namespace="onboarding.createAccount"
          returnTo={`/${locale}/onboarding?just_authed=oauth`}
          onChooseEmail={() => {
            onPhaseChange("form");
            setError(null);
          }}
          onBeforeOAuth={stashForOAuth}
          onError={(message) => setError(message)}
        />

        <div className="flex pt-5">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 py-3.5 px-4 border border-[var(--border)] text-[var(--foreground)] font-semibold rounded-full hover:bg-[var(--muted)] focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 transition-all duration-200"
          >
            {tc("back")}
          </button>
        </div>

        <p className="text-xs text-center text-[var(--muted-foreground)] mt-5">
          {t.rich("legalNotice", {
            terms: (chunks) => (
              <Link href="/terms" className="underline hover:text-[var(--foreground)]">
                {chunks}
              </Link>
            ),
            privacy: (chunks) => (
              <Link href="/privacy" className="underline hover:text-[var(--foreground)]">
                {chunks}
              </Link>
            ),
          })}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
          {t("emailTitle")}
        </h1>
        <p className="text-[var(--muted-foreground)] mt-2">
          {t("emailSubtitle")}
        </p>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-5">
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 text-red-600 text-sm border border-red-100 dark:bg-red-950/50 dark:border-red-900/50 dark:text-red-400">
            {error}
          </div>
        )}

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
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            required
            className="w-full px-4 py-3.5 rounded-xl border border-[var(--border)] bg-white/50 dark:bg-white/5 focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] outline-none transition-all duration-200 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
            placeholder={t("emailPlaceholder")}
          />
          {typoSuggestion && (
            <p className="text-xs text-[var(--muted-foreground)]">
              {t("emailTypoSuggestion", { suggestion: typoSuggestion })}{" "}
              <button
                type="button"
                onClick={applyTypoSuggestion}
                className="text-[var(--accent)] hover:underline font-medium"
              >
                {t("emailTypoApply", { suggestion: typoSuggestion })}
              </button>
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-[var(--foreground)]"
            >
              {t("password")}
            </label>
            <Link
              href="/reset-password"
              className="text-xs text-[var(--accent)] hover:underline"
            >
              {tAuth("forgotPassword")}
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3.5 pr-12 rounded-xl border border-[var(--border)] bg-white/50 dark:bg-white/5 focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] outline-none transition-all duration-200 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
              placeholder={t("passwordPlaceholder")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {password.length > 0 && (
            <ul className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
              {(["lowercase", "uppercase", "number", "symbol", "minLength"] as const).map((key) => (
                <li
                  key={key}
                  className={`flex items-center gap-1.5 text-xs transition-colors ${
                    passwordChecks[key]
                      ? "text-green-600 dark:text-green-400"
                      : "text-[var(--muted-foreground)]"
                  }`}
                >
                  <Check size={12} weight={passwordChecks[key] ? "bold" : "regular"} />
                  {t(`passwordRequirements.${key}`)}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              onPhaseChange("choose");
              setError(null);
            }}
            disabled={loading}
            className="py-3.5 px-6 border border-[var(--border)] text-[var(--foreground)] font-semibold rounded-full hover:bg-[var(--muted)] focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 transition-all duration-200 disabled:opacity-50"
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

        <p className="text-xs text-center text-[var(--muted-foreground)] mt-3">
          {t.rich("legalNotice", {
            terms: (chunks) => (
              <Link href="/terms" className="underline hover:text-[var(--foreground)]">
                {chunks}
              </Link>
            ),
            privacy: (chunks) => (
              <Link href="/privacy" className="underline hover:text-[var(--foreground)]">
                {chunks}
              </Link>
            ),
          })}
        </p>
      </form>
    </div>
  );
}

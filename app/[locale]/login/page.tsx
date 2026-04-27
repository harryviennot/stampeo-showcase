"use client";

import { Suspense, useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { StampeoLogo } from "@/components/logo";
import { useAuth } from "@/lib/supabase/auth-provider";
import { OAuthButtons, OAuthDivider } from "@/components/auth/OAuthButtons";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
          <div className="animate-spin h-8 w-8 border-2 border-amber-500 border-t-transparent rounded-full" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const t = useTranslations("auth.login");
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") ?? "";
  const redirectParam = searchParams.get("redirect");
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<"login" | "verify" | "forgot">("login");
  const [otpCode, setOtpCode] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [codeSentMessage, setCodeSentMessage] = useState(false);
  const otpInputRef = useRef<HTMLInputElement>(null);
  const [resetSent, setResetSent] = useState(false);
  const { signIn, verifyOtp, resendOtp, resetPasswordForEmail } = useAuth();
  const tForgot = useTranslations("auth.forgotPassword");
  const tErrors = useTranslations("auth.errors");

  const translateError = useCallback((message: string) => {
    const msg = message.toLowerCase();
    if (msg.includes("invalid") && (msg.includes("credentials") || msg.includes("password") || msg.includes("login"))) {
      return tErrors("invalidCredentials");
    }
    if (msg.includes("rate") || msg.includes("too many") || msg.includes("429")) {
      return tErrors("tooManyRequests");
    }
    if (msg.includes("user not found") || msg.includes("no user")) {
      return tErrors("userNotFound");
    }
    if (msg.includes("network") || msg.includes("fetch")) {
      return tErrors("networkError");
    }
    return tErrors("generic");
  }, [tErrors]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Auto-focus OTP input
  useEffect(() => {
    if (phase === "verify") {
      setTimeout(() => otpInputRef.current?.focus(), 100);
    }
  }, [phase]);

  // Resolve where to send the user after a successful sign-in. We honor the
  // `redirect` query param when it points to the configured app host, so
  // flows like the team-invite "switch account" link can return the user to
  // the exact invite URL after authenticating.
  const resolvePostLoginUrl = useCallback(() => {
    const fallback =
      process.env.NEXT_PUBLIC_APP_URL || "https://app.stampeo.app";
    if (!redirectParam) return fallback;
    try {
      const target = new URL(redirectParam);
      const allowedHost = new URL(fallback).host;
      if (target.host === allowedHost) {
        return target.toString();
      }
    } catch {
      // not a valid absolute URL — ignore
    }
    return fallback;
  }, [redirectParam]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("email not confirmed")) {
        // Unverified user — resend OTP and show verify phase
        await resendOtp(email);
        setResendCooldown(60);
        setPhase("verify");
        setError(null);
        setLoading(false);
        return;
      }
      setError(translateError(error.message));
      setLoading(false);
      return;
    }

    // Redirect to business app (or honored ?redirect=) after successful login
    globalThis.location.href = resolvePostLoginUrl();
  };

  const handleVerifySubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (otpCode.length !== 6) return;

      setError(null);
      setLoading(true);

      const { error: verifyError } = await verifyOtp(email, otpCode);

      if (verifyError) {
        setError(t("invalidCode"));
        setOtpCode("");
        setLoading(false);
        return;
      }

      // Verified — redirect to app (or honored ?redirect=)
      globalThis.location.href = resolvePostLoginUrl();
    },
    [email, otpCode, verifyOtp, t, resolvePostLoginUrl]
  );

  const handleResend = useCallback(async () => {
    if (resendCooldown > 0) return;
    const { error } = await resendOtp(email);
    if (!error) {
      setResendCooldown(60);
      setCodeSentMessage(true);
      setTimeout(() => setCodeSentMessage(false), 3000);
    }
  }, [resendCooldown, resendOtp, email]);

  const handleOtpChange = useCallback((value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 6);
    setOtpCode(digits);
  }, []);

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await resetPasswordForEmail(email);

    if (error) {
      setError(translateError(error.message));
      setLoading(false);
      return;
    }

    setResetSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <Link href="/" className="inline-block group">
          <div className="flex items-center gap-2 transition-transform group-hover:scale-105">
            <StampeoLogo />
            <span className="text-2xl font-bold gradient-text ">
              Stampeo
            </span>
          </div>
        </Link>
      </header>
      <div className="w-full max-w-md p-8 space-y-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl shadow-sm">
        {phase === "forgot" ? (
          <>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-[var(--foreground)]">
                {tForgot("title")}
              </h1>
              <p className="text-[var(--muted-foreground)] mt-2 text-sm">
                {tForgot("subtitle")}
              </p>
            </div>

            {resetSent ? (
              <div className="space-y-5">
                <div className="p-4 rounded-2xl bg-green-50 text-green-600 text-sm border border-green-100 dark:bg-green-950/50 dark:border-green-900/50 dark:text-green-400">
                  <p className="font-medium">{tForgot("emailSent")}</p>
                  <p className="mt-1">{tForgot("emailSentDescription", { email })}</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setPhase("login"); setResetSent(false); setError(null); }}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-full hover:from-amber-600 hover:to-orange-600 hover:scale-[1.02] hover:shadow-lg hover:shadow-amber-500/25 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all duration-200"
                >
                  {tForgot("backToLogin")}
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-5">
                {error && (
                  <div className="p-4 rounded-2xl bg-red-50 text-red-600 text-sm border border-red-100 dark:bg-red-950/50 dark:border-red-900/50 dark:text-red-400">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label
                    htmlFor="forgot-email"
                    className="block text-sm font-medium text-[var(--foreground)]"
                  >
                    {t("email")}
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3.5 rounded-xl border border-[var(--border)] bg-white/50 dark:bg-white/5 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all duration-200 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
                    placeholder={t("emailPlaceholder")}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-full hover:from-amber-600 hover:to-orange-600 hover:scale-[1.02] hover:shadow-lg hover:shadow-amber-500/25 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? tForgot("sending") : tForgot("sendLink")}
                </button>

                <p className="text-center">
                  <button
                    type="button"
                    onClick={() => { setPhase("login"); setError(null); }}
                    className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                  >
                    {tForgot("backToLogin")}
                  </button>
                </p>
              </form>
            )}
          </>
        ) : phase === "verify" ? (
          <>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-[var(--foreground)]">
                {t("emailNotConfirmed")}
              </h1>
              <p className="text-[var(--muted-foreground)] mt-2 text-sm">
                {email}
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
                <label htmlFor="otp" className="block text-sm font-medium text-[var(--foreground)]">
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
                  className="w-full px-4 py-3.5 rounded-xl border border-[var(--border)] bg-white/50 dark:bg-white/5 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all duration-200 text-[var(--foreground)] text-center text-2xl font-mono tracking-[0.5em] placeholder:text-[var(--muted-foreground)] placeholder:tracking-[0.5em] placeholder:text-lg"
                  placeholder={t("verifyCodePlaceholder")}
                />
              </div>

              <button
                type="submit"
                disabled={otpCode.length !== 6 || loading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-full hover:from-amber-600 hover:to-orange-600 hover:scale-[1.02] hover:shadow-lg hover:shadow-amber-500/25 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? t("verifying") : t("verifyButton")}
              </button>

              <div className="text-center space-y-2">
                <p className="text-sm text-[var(--muted-foreground)]">
                  {resendCooldown > 0 ? (
                    t("resendIn", { seconds: resendCooldown })
                  ) : (
                    <button
                      type="button"
                      onClick={handleResend}
                      className="text-amber-600 hover:text-amber-700 font-medium transition-colors"
                    >
                      {t("resendCode")}
                    </button>
                  )}
                </p>
                <p>
                  <button
                    type="button"
                    onClick={() => {
                      setPhase("login");
                      setOtpCode("");
                      setError(null);
                    }}
                    className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                  >
                    {t("signIn")}
                  </button>
                </p>
              </div>
            </form>
          </>
        ) : (
          <>

            <form onSubmit={handleLoginSubmit} className="space-y-5">
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
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3.5 rounded-xl border border-[var(--border)] bg-white/50 dark:bg-white/5 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all duration-200 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
                  placeholder={t("emailPlaceholder")}
                />
              </div>

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
                  className="w-full px-4 py-3.5 rounded-xl border border-[var(--border)] bg-white/50 dark:bg-white/5 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all duration-200 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
                  placeholder={t("passwordPlaceholder")}
                />
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => { setPhase("forgot"); setError(null); setResetSent(false); }}
                    className="text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors"
                  >
                    {t("forgotPassword")}
                  </button>
                </div>
                <OAuthDivider />
                <OAuthButtons
                  disabled={loading}
                  onError={(message) => setError(message)}
                  returnTo={redirectParam ?? undefined}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-full hover:from-amber-600 hover:to-orange-600 hover:scale-[1.02] hover:shadow-lg hover:shadow-amber-500/25 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? t("signingIn") : t("signIn")}
              </button>
            </form>

            <p className="text-center text-sm text-[var(--muted-foreground)]">
              {t("noAccount")}{" "}
              <Link
                href="/onboarding"
                className="text-amber-600 hover:text-amber-700 font-medium transition-colors"
              >
                {t("getStarted")}
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

"use client";

import { Suspense, useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { StampeoLogo } from "@/components/logo";
import { useAuth } from "@/lib/supabase/auth-provider";
import {
  createRecoveryClient,
  passwordRefusalKeys,
  saveNewPassword,
  verifyRecoveryLink,
  type PasswordRefusalKey,
} from "@/lib/supabase/recovery-client";
import {
  addressWithoutRecoveryParams,
  resetPageView,
  type VerifyFailureReason,
  type VerifyState,
} from "@/lib/auth/reset-page-state";
import { isPasswordAcceptable } from "@/lib/auth/password-rules";
import { PasswordRequirement } from "@/components/auth/PasswordRequirement";
import { Eye, EyeSlash } from "@phosphor-icons/react";

const ERROR_BOX_CLASS =
  "p-4 rounded-2xl bg-red-50 text-red-600 text-sm border border-red-100 dark:bg-red-950/50 dark:border-red-900/50 dark:text-red-400";
const PILL_LINK_CLASS =
  "block w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-full hover:from-amber-600 hover:to-orange-600 hover:scale-[1.02] hover:shadow-lg hover:shadow-amber-500/25 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all duration-200 text-center";
const REFUSAL_ID = "newPassword-refusal";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="animate-spin h-8 w-8 border-2 border-amber-500 border-t-transparent rounded-full" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const t = useTranslations("auth.resetPassword");
  const tErrors = useTranslations("auth.errors");
  const searchParams = useSearchParams();
  const { signIn } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refusal, setRefusal] = useState<PasswordRefusalKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  // The token lives in memory only: the address bar is cleaned right after load.
  const [tokenHash] = useState(() => searchParams.get("token_hash"));
  const [verify, setVerify] = useState<VerifyState>({ status: "pending" });
  const verifyStarted = useRef(false);

  // Lazy initialiser: one client for the life of the page, not one per render.
  const [recovery] = useState(createRecoveryClient);

  const view = resetPageView({ hasToken: Boolean(tokenHash), verify, saved });

  const isPasswordStrong = isPasswordAcceptable(newPassword);
  const passwordsMatch = newPassword === confirmPassword;

  const translateError = useCallback((message: string) => {
    const msg = message.toLowerCase();
    if (msg.includes("rate") || msg.includes("too many") || msg.includes("429")) {
      return tErrors("tooManyRequests");
    }
    if (msg.includes("network") || msg.includes("fetch")) {
      return tErrors("networkError");
    }
    if (msg.includes("expired") || msg.includes("invalid") || msg.includes("otp")) {
      return t("linkExpired");
    }
    return t("updateFailed");
  }, [tErrors, t]);

  useEffect(() => {
    if (!tokenHash || verifyStarted.current) return;
    verifyStarted.current = true;
    void verifyRecoveryLink(recovery, tokenHash).then(setVerify);
  }, [recovery, tokenHash]);

  useEffect(() => {
    if (!tokenHash) return;
    // Deferred so Next's router has patched the history API and follows the change.
    const timer = setTimeout(() => {
      window.history.replaceState(null, "", addressWithoutRecoveryParams(window.location.href));
    }, 0);
    return () => clearTimeout(timer);
  }, [tokenHash]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setRefusal([]);

      if (!isPasswordStrong) {
        return;
      }

      if (!passwordsMatch) {
        setError(t("passwordMismatch"));
        return;
      }

      setLoading(true);

      const { email, error, code, reasons } = await saveNewPassword(recovery, newPassword);

      if (error) {
        const refusalKeys = passwordRefusalKeys(code, reasons);
        if (refusalKeys.length > 0) setRefusal(refusalKeys);
        else setError(translateError(error));
        setLoading(false);
        return;
      }

      if (email) {
        const { error: signInError } = await signIn(email, newPassword);
        if (!signInError) {
          globalThis.location.href =
            process.env.NEXT_PUBLIC_APP_URL || "https://app.stampeo.app";
          return;
        }
      }

      setSaved(true);
      setLoading(false);
    },
    [recovery, newPassword, isPasswordStrong, passwordsMatch, t, signIn, translateError]
  );

  const failureText: Record<VerifyFailureReason, string> = {
    linkExpired: t("linkExpired"),
    network: tErrors("networkError"),
    rateLimited: tErrors("tooManyRequests"),
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-3 py-20 sm:px-0">
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
      <div className="w-full max-w-md p-4 sm:p-8 space-y-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl shadow-sm">
        {view.view === "verifying" ? (
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-2 border-amber-500 border-t-transparent rounded-full mx-auto" />
          </div>
        ) : view.view === "success" ? (
          <>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-[var(--foreground)]">
                {t("success")}
              </h1>
              <p className="text-[var(--muted-foreground)] mt-2 text-sm">
                {t("successDescription")}
              </p>
            </div>
            <Link href="/login" className={PILL_LINK_CLASS}>
              {t("signIn")}
            </Link>
          </>
        ) : view.view === "no-session" ? (
          <>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-[var(--foreground)]">
                {t("title")}
              </h1>
            </div>
            <div className={ERROR_BOX_CLASS}>{failureText[view.reason]}</div>
            <Link href="/login" className={PILL_LINK_CLASS}>
              {t("signIn")}
            </Link>
          </>
        ) : (
          <>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-[var(--foreground)]">
                {t("title")}
              </h1>
              {view.email && (
                <>
                  <p className="text-[var(--muted-foreground)] mt-2 text-sm">
                    <span className="text-[var(--foreground)] font-medium wrap-anywhere">
                      {view.email}
                    </span>
                  </p>
                  <p className="text-[var(--muted-foreground)] mt-1 text-xs">
                    {t("notYourAddress")}
                  </p>
                </>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className={ERROR_BOX_CLASS}>{error}</div>
              )}

              {/* New password */}
              <div className="space-y-2">
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-[var(--foreground)]"
                >
                  {t("newPassword")}
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setRefusal([]);
                    }}
                    required
                    aria-invalid={refusal.length > 0 || undefined}
                    aria-describedby={refusal.length > 0 ? REFUSAL_ID : undefined}
                    className="w-full px-4 py-3.5 pr-12 rounded-xl border border-[var(--border)] bg-white/50 dark:bg-white/5 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all duration-200 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
                    placeholder={t("newPasswordPlaceholder")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <PasswordRequirement password={newPassword} label={t("passwordRequirement")} />
                {refusal.length > 0 && (
                  <div id={REFUSAL_ID} role="alert" className="space-y-1">
                    {refusal.map((key) => (
                      <p key={key} className="text-sm text-red-600 dark:text-red-400">
                        {t(key)}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-[var(--foreground)]"
                >
                  {t("confirmPassword")}
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3.5 pr-12 rounded-xl border border-[var(--border)] bg-white/50 dark:bg-white/5 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all duration-200 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
                    placeholder={t("confirmPasswordPlaceholder")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((s) => !s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeSlash size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {confirmPassword.length > 0 && !passwordsMatch && (
                  <p className="text-sm text-red-600 dark:text-red-400">{t("passwordMismatch")}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !isPasswordStrong || !passwordsMatch || !confirmPassword}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-full hover:from-amber-600 hover:to-orange-600 hover:scale-[1.02] hover:shadow-lg hover:shadow-amber-500/25 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? t("submitting") : t("submit")}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

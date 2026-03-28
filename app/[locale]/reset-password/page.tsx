"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { StampeoLogo } from "@/components/logo";
import { useAuth } from "@/lib/supabase/auth-provider";
import { createClient } from "@supabase/supabase-js";
import { Eye, EyeSlash, Check } from "@phosphor-icons/react";

function createStandaloneClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

export default function ResetPasswordPage() {
  const t = useTranslations("auth.resetPassword");
  const tErrors = useTranslations("auth.errors");
  const searchParams = useSearchParams();
  const { signIn } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const hasTokenHash = searchParams.has("token_hash");
  const [ready, setReady] = useState(!hasTokenHash);
  const verified = useRef(false);

  const supabaseRef = useRef(createStandaloneClient());

  const passwordChecks = useMemo(() => ({
    lowercase: /[a-z]/.test(newPassword),
    uppercase: /[A-Z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    symbol: /[^a-zA-Z0-9]/.test(newPassword),
    minLength: newPassword.length >= 6,
  }), [newPassword]);

  const isPasswordStrong = Object.values(passwordChecks).every(Boolean);
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
    if (verified.current || !hasTokenHash) return;
    verified.current = true;

    const tokenHash = searchParams.get("token_hash")!;
    supabaseRef.current.auth
      .verifyOtp({ token_hash: tokenHash, type: "recovery" })
      .then(({ error }) => {
        if (error) {
          setError(translateError(error.message));
        }
        setReady(true);
      });
  }, [searchParams, hasTokenHash, translateError]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      if (!isPasswordStrong) {
        return;
      }

      if (!passwordsMatch) {
        setError(t("passwordMismatch"));
        return;
      }

      setLoading(true);

      const { error, data } = await supabaseRef.current.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setError(translateError(error.message));
        setLoading(false);
        return;
      }

      const email = data.user?.email;
      if (email) {
        const { error: signInError } = await signIn(email, newPassword);
        if (!signInError) {
          globalThis.location.href =
            process.env.NEXT_PUBLIC_APP_URL || "https://app.stampeo.app";
          return;
        }
      }

      setSuccess(true);
      setLoading(false);
    },
    [newPassword, isPasswordStrong, passwordsMatch, t, signIn, translateError]
  );

  const checkLabels = [
    ["lowercase", t("lowercase")],
    ["uppercase", t("uppercase")],
    ["number", t("number")],
    ["symbol", t("symbol")],
    ["minLength", t("minLength")],
  ] as const;

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
        {!ready ? (
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-2 border-amber-500 border-t-transparent rounded-full mx-auto" />
          </div>
        ) : success ? (
          <>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-[var(--foreground)]">
                {t("success")}
              </h1>
              <p className="text-[var(--muted-foreground)] mt-2 text-sm">
                {t("successDescription")}
              </p>
            </div>
            <Link
              href="/login"
              className="block w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-full hover:from-amber-600 hover:to-orange-600 hover:scale-[1.02] hover:shadow-lg hover:shadow-amber-500/25 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all duration-200 text-center"
            >
              {t("signIn")}
            </Link>
          </>
        ) : (
          <>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-[var(--foreground)]">
                {t("title")}
              </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 rounded-2xl bg-red-50 text-red-600 text-sm border border-red-100 dark:bg-red-950/50 dark:border-red-900/50 dark:text-red-400">
                  {error}
                </div>
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
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
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
                {newPassword.length > 0 && (
                  <ul className="grid grid-cols-2 gap-x-4 gap-y-0.5 mt-1">
                    {checkLabels.map(([key, label]) => (
                      <li
                        key={key}
                        className={`flex items-center gap-1.5 text-xs transition-colors ${
                          passwordChecks[key]
                            ? "text-green-600 dark:text-green-400"
                            : "text-[var(--muted-foreground)]"
                        }`}
                      >
                        <Check size={12} weight={passwordChecks[key] ? "bold" : "regular"} />
                        {label}
                      </li>
                    ))}
                  </ul>
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
                  <p className="text-xs text-red-500">{t("passwordMismatch")}</p>
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

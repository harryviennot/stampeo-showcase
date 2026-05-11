"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/supabase/auth-provider";

interface OtpStepProps {
  email: string;
  onVerified: () => void;
  onBack: () => void;
}

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_S = 60;

/**
 * Step 3 — OTP verification. The code is sent automatically by `signUp` in
 * step 2; this step just collects it and calls `verifyOtp`. On success we
 * advance via `onVerified`, which redirects to the web wizard.
 */
export function OtpStep({ email, onVerified, onBack }: OtpStepProps) {
  const tStep = useTranslations("signup.steps.otp");
  const tErr = useTranslations("signup.errors");
  const tCommon = useTranslations("signup");
  const { verifyOtp, resendOtp } = useAuth();

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN_S);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Focus the input on mount + countdown the resend cooldown.
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setInterval(() => setResendCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [resendCooldown]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (code.length !== OTP_LENGTH) return;
      setError(null);
      setLoading(true);
      try {
        const { error: verifyError } = await verifyOtp(email, code);
        if (verifyError) {
          setError(tErr("otpInvalid"));
          setCode("");
          inputRef.current?.focus();
          return;
        }
        onVerified();
      } catch (err) {
        setError(err instanceof Error ? err.message : tErr("generic"));
      } finally {
        setLoading(false);
      }
    },
    [code, email, verifyOtp, onVerified, tErr]
  );

  const handleResend = useCallback(async () => {
    if (resendCooldown > 0) return;
    setError(null);
    try {
      await resendOtp(email);
      setResendCooldown(RESEND_COOLDOWN_S);
    } catch (err) {
      setError(err instanceof Error ? err.message : tErr("generic"));
    }
  }, [resendCooldown, email, resendOtp, tErr]);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-[22px] min-[768px]:text-[26px] font-semibold leading-tight">
          {tStep("title")}
        </h1>
        <p className="text-[14px] text-[#7A7A7A]">{tStep("subtitle", { email })}</p>
      </header>

      <div className="flex flex-col gap-2">
        <label htmlFor="signup-otp" className="text-[13px] font-medium">
          {tStep("code")}
        </label>
        <input
          ref={inputRef}
          id="signup-otp"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={OTP_LENGTH}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH))}
          placeholder={tStep("codePlaceholder")}
          className="h-12 rounded-[10px] border border-[var(--border)] bg-white px-3.5 text-[18px] tracking-[0.4em] text-center font-mono outline-none focus:border-[var(--accent)] transition-colors"
        />
        {error && <p className="text-[12px] text-red-600">{error}</p>}
      </div>

      <Button className="w-full min-h-[48px]">
        {loading ? tStep("submitting") : tStep("submit")}
      </Button>

      <div className="flex items-center justify-center gap-2 text-[12.5px]">
        <span className="text-[#888]">{tStep("didntReceive")}</span>
        {resendCooldown > 0 ? (
          <span className="text-[#999]">{tStep("resendIn", { seconds: resendCooldown })}</span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            className="text-[var(--accent)] font-semibold underline-offset-2 hover:underline"
          >
            {tStep("resend")}
          </button>
        )}
      </div>

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

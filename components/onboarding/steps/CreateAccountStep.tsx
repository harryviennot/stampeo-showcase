"use client";

import { useState, useCallback } from "react";
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
  const { data, updateData } = store;
  const { signUp, signIn } = useAuth();

  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"signup" | "login">("signup");

  const isValid =
    data.email.includes("@") && data.email.includes(".") && password.length >= 6;

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!isValid) return;

      setError(null);
      setLoading(true);

      try {
        if (mode === "signup") {
          const { error: authError } = await signUp(
            data.email,
            password,
            data.ownerName
          );

          if (authError) {
            // Check if user already exists
            const errorMsg = authError.message.toLowerCase();
            if (errorMsg.includes("already registered") || errorMsg.includes("already exists")) {
              setError("This email is already registered. Please log in instead.");
              setMode("login");
            } else {
              setError(authError.message);
            }
            setLoading(false);
            return;
          }
        } else {
          // Login mode
          const { error: authError } = await signIn(data.email, password);

          if (authError) {
            setError(authError.message);
            setLoading(false);
            return;
          }
        }

        // Success - move to next step
        onNext();
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setLoading(false);
      }
    },
    [isValid, data.email, data.ownerName, password, signUp, signIn, onNext, mode]
  );

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
          {mode === "signup" ? "Create your account" : "Welcome back"}
        </h1>
        <p className="text-[var(--muted-foreground)] mt-2">
          {mode === "signup"
            ? "Almost there! Set up your login credentials"
            : "Log in to continue setting up your business"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
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
            Email
          </label>
          <input
            id="email"
            type="email"
            value={data.email}
            onChange={(e) => updateData({ email: e.target.value })}
            required
            className="w-full px-4 py-3.5 rounded-xl border border-[var(--border)] bg-white/50 dark:bg-white/5 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all duration-200 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
            placeholder="you@example.com"
          />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-[var(--foreground)]"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-3.5 rounded-xl border border-[var(--border)] bg-white/50 dark:bg-white/5 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all duration-200 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
            placeholder="At least 6 characters"
          />
          <p className="text-xs text-[var(--muted-foreground)]">
            Minimum 6 characters
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
            Back
          </button>
          <button
            type="submit"
            disabled={!isValid || loading}
            className="flex-1 py-3.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-full hover:from-amber-600 hover:to-orange-600 hover:scale-[1.02] hover:shadow-lg hover:shadow-amber-500/25 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading
              ? mode === "signup"
                ? "Creating account..."
                : "Signing in..."
              : mode === "signup"
                ? "Create account"
                : "Sign in"}
          </button>
        </div>

        <p className="text-center text-sm text-[var(--muted-foreground)] pt-2">
          {mode === "signup" ? (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError(null);
                }}
                className="text-amber-600 hover:text-amber-700 font-medium transition-colors"
              >
                Sign in
              </button>
            </>
          ) : (
            <>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setError(null);
                }}
                className="text-amber-600 hover:text-amber-700 font-medium transition-colors"
              >
                Create one
              </button>
            </>
          )}
        </p>
      </form>
    </div>
  );
}

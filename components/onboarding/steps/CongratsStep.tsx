"use client";

import { useCallback } from "react";
import { OnboardingStore } from "@/hooks/useOnboardingStore";

interface CongratsStepProps {
  store: OnboardingStore;
}

export function CongratsStep({ store }: CongratsStepProps) {
  const { data } = store;

  const handleLetsGo = useCallback(() => {
    // Clear onboarding data before redirecting for a clean slate
    store.clearStore();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.stampeo.app";
    window.location.href = appUrl;
  }, [store]);

  return (
    <div className="w-full max-w-md mx-auto text-center py-4">
      {/* Celebration icon */}
      <div className="mb-6">
        <div
          className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
          style={{ backgroundColor: "var(--accent)" }}
        >
          <svg
            className="w-10 h-10 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      </div>

      {/* Title */}
      <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] mb-3">
        You&apos;re all set!
      </h1>

      {/* Subtitle */}
      <p className="text-[var(--muted-foreground)] text-lg mb-6">
        Welcome to your new loyalty program
      </p>

      {/* Business info card */}
      <div className="bg-[var(--muted)]/30 rounded-2xl p-5 mb-8 text-left">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "var(--accent)" }}
          >
            <span className="text-white font-bold text-sm">
              {data.businessName
                ? data.businessName
                    .trim()
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((w) => w[0])
                    .join("")
                    .toUpperCase()
                : "YB"}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-[var(--foreground)]">
              {data.businessName || "Your Business"}
            </h3>
            <p className="text-sm text-[var(--muted-foreground)]">
              stampeo.app/{data.urlSlug || "your-business"}
            </p>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-[var(--foreground)]">
            <svg
              className="w-4 h-4"
              style={{ color: "var(--accent)" }}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span>Your business space is ready</span>
          </div>
          <div className="flex items-center gap-2 text-[var(--foreground)]">
            <svg
              className="w-4 h-4"
              style={{ color: "var(--accent)" }}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span>Your loyalty card is designed</span>
          </div>
          <div className="flex items-center gap-2 text-[var(--foreground)]">
            <svg
              className="w-4 h-4"
              style={{ color: "var(--accent)" }}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span>Ready to welcome customers</span>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <button
        type="button"
        onClick={handleLetsGo}
        className="w-full py-4 px-6 bg-[var(--accent)] text-white font-semibold rounded-full hover:bg-[var(--accent-hover)] hover:scale-[1.02] hover:shadow-lg hover:shadow-[var(--accent)]/25 focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 transition-all duration-200 text-lg"
      >
        Let&apos;s go!
      </button>
    </div>
  );
}

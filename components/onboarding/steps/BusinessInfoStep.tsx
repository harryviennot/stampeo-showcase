"use client";

import { useEffect, useCallback, useState } from "react";
import { OnboardingStore } from "@/hooks/useOnboardingStore";
import { checkSlugAvailability } from "@/lib/onboarding";
import { CheckIcon, XMarkIcon } from "@/components/icons";

interface BusinessInfoStepProps {
  store: OnboardingStore;
  onNext: () => void;
}

export function BusinessInfoStep({ store, onNext }: BusinessInfoStepProps) {
  const { data, updateBusinessName, updateSlug, updateData, isSlugAvailable, slugErrorReason, isSlugChecking, setIsSlugAvailable, setSlugErrorReason, setIsSlugChecking, validatedSlug, markSlugValidated } = store;
  const [debouncedSlug, setDebouncedSlug] = useState(data.urlSlug);

  // Debounce slug checking
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSlug(data.urlSlug);
    }, 300);
    return () => clearTimeout(timer);
  }, [data.urlSlug]);

  // Check slug availability
  useEffect(() => {
    if (!debouncedSlug || debouncedSlug.length < 3) {
      setIsSlugAvailable(null);
      setSlugErrorReason(null);
      return;
    }

    // Skip check if this slug was already validated
    if (debouncedSlug === validatedSlug) {
      setIsSlugAvailable(true);
      setSlugErrorReason(null);
      setIsSlugChecking(false);
      return;
    }

    let cancelled = false;
    setIsSlugChecking(true);

    checkSlugAvailability(debouncedSlug).then((result) => {
      if (!cancelled) {
        setIsSlugAvailable(result.available);
        setSlugErrorReason(result.reason || null);
        setIsSlugChecking(false);
        // Cache the slug if it's available
        if (result.available) {
          markSlugValidated();
        }
      }
    });

    return () => {
      cancelled = true;
    };
  }, [debouncedSlug, setIsSlugAvailable, setSlugErrorReason, setIsSlugChecking, validatedSlug, markSlugValidated]);

  const isValid =
    data.businessName.trim().length >= 2 &&
    data.urlSlug.length >= 3 &&
    data.ownerName.trim().length >= 2 &&
    isSlugAvailable === true;

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (isValid) {
        onNext();
      }
    },
    [isValid, onNext]
  );

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
          Let&apos;s set up your business
        </h1>
        <p className="text-[var(--muted-foreground)] mt-2">
          Tell us about your business to get started
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Business Name */}
        <div className="space-y-2">
          <label
            htmlFor="businessName"
            className="block text-sm font-medium text-[var(--foreground)]"
          >
            Business name
          </label>
          <input
            id="businessName"
            type="text"
            value={data.businessName}
            onChange={(e) => updateBusinessName(e.target.value)}
            required
            className="w-full px-4 py-3.5 rounded-xl border border-[var(--border)] bg-white/50 dark:bg-white/5 focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] outline-none transition-all duration-200 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
            placeholder="e.g. Cafe Aroma"
          />
        </div>

        {/* URL Slug */}
        <div className="space-y-2">
          <label
            htmlFor="urlSlug"
            className="block text-sm font-medium text-[var(--foreground)]"
          >
            Your unique URL
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--muted-foreground)] text-sm">
              stampeo.app/
            </div>
            <input
              id="urlSlug"
              type="text"
              value={data.urlSlug}
              onChange={(e) => updateSlug(e.target.value)}
              required
              minLength={3}
              className="w-full pl-[100px] pr-12 py-3.5 rounded-xl border border-[var(--border)] bg-white/50 dark:bg-white/5 focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] outline-none transition-all duration-200 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
              placeholder="cafe-aroma"
            />
            {/* Availability indicator */}
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
              {isSlugChecking && (
                <div className="w-5 h-5 border-2 border-[var(--muted-foreground)] border-t-transparent rounded-full animate-spin" />
              )}
              {!isSlugChecking && isSlugAvailable === true && (
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                  <CheckIcon className="w-4 h-4 text-white" />
                </div>
              )}
              {!isSlugChecking && isSlugAvailable === false && (
                <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                  <XMarkIcon className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          </div>
          {data.urlSlug.length > 0 && data.urlSlug.length < 3 && (
            <p className="text-xs text-[var(--muted-foreground)]">
              Must be at least 3 characters
            </p>
          )}
          {!isSlugChecking && isSlugAvailable === false && slugErrorReason && (
            <p className="text-xs text-red-500">
              {slugErrorReason}
            </p>
          )}
          {!isSlugChecking && isSlugAvailable === true && (
            <p className="text-xs text-green-600">
              This URL is available!
            </p>
          )}
        </div>

        {/* Owner Name */}
        <div className="space-y-2">
          <label
            htmlFor="ownerName"
            className="block text-sm font-medium text-[var(--foreground)]"
          >
            Your name
          </label>
          <input
            id="ownerName"
            type="text"
            value={data.ownerName}
            onChange={(e) => updateData({ ownerName: e.target.value })}
            required
            className="w-full px-4 py-3.5 rounded-xl border border-[var(--border)] bg-white/50 dark:bg-white/5 focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] outline-none transition-all duration-200 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
            placeholder="John Doe"
          />
        </div>

        <button
          type="submit"
          disabled={!isValid}
          className="w-full py-3.5 px-4 bg-[var(--accent)] text-white font-semibold rounded-full hover:bg-[var(--accent-hover)] hover:scale-[1.02] hover:shadow-lg hover:shadow-[var(--accent)]/25 focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          Continue
        </button>
      </form>
    </div>
  );
}

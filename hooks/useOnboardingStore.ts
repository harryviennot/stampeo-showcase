"use client";

import { useState, useEffect, useCallback } from "react";

export interface OnboardingData {
  // Step 1
  businessName: string;
  urlSlug: string;
  ownerName: string;
  // Step 2
  category: string | null;
  description: string;
  // Step 4
  email: string;
  // Step 5
  selectedPlan: "pay" | "pro" | null;
}

export interface OnboardingState {
  currentStep: number;
  data: OnboardingData;
  isSlugAvailable: boolean | null;
  isSlugChecking: boolean;
}

const STORAGE_KEY = "stampeo_onboarding";
const STORAGE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

const initialData: OnboardingData = {
  businessName: "",
  urlSlug: "",
  ownerName: "",
  category: null,
  description: "",
  email: "",
  selectedPlan: null,
};

interface StoredState {
  data: OnboardingData;
  currentStep: number;
  timestamp: number;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function useOnboardingStore() {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(initialData);
  const [isSlugAvailable, setIsSlugAvailable] = useState<boolean | null>(null);
  const [slugErrorReason, setSlugErrorReason] = useState<string | null>(null);
  const [isSlugChecking, setIsSlugChecking] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: StoredState = JSON.parse(stored);
        const now = Date.now();

        // Check if data is still valid (not expired)
        if (now - parsed.timestamp < STORAGE_EXPIRY_MS) {
          setData(parsed.data);
          setCurrentStep(parsed.currentStep);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    setIsInitialized(true);
  }, []);

  // Save to localStorage when data or step changes
  useEffect(() => {
    if (!isInitialized) return;

    const state: StoredState = {
      data,
      currentStep,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [data, currentStep, isInitialized]);

  const updateData = useCallback((updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateBusinessName = useCallback((name: string) => {
    const slug = slugify(name);
    setData((prev) => ({
      ...prev,
      businessName: name,
      urlSlug: slug,
    }));
    setIsSlugAvailable(null);
    setSlugErrorReason(null);
  }, []);

  const updateSlug = useCallback((slug: string) => {
    const cleanSlug = slugify(slug);
    setData((prev) => ({ ...prev, urlSlug: cleanSlug }));
    setIsSlugAvailable(null);
    setSlugErrorReason(null);
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, 5));
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }, []);

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= 5) {
      setCurrentStep(step);
    }
  }, []);

  const clearStore = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setData(initialData);
    setCurrentStep(1);
    setIsSlugAvailable(null);
  }, []);

  return {
    currentStep,
    data,
    isSlugAvailable,
    slugErrorReason,
    isSlugChecking,
    isInitialized,
    setIsSlugAvailable,
    setSlugErrorReason,
    setIsSlugChecking,
    updateData,
    updateBusinessName,
    updateSlug,
    nextStep,
    prevStep,
    goToStep,
    clearStore,
  };
}

export type OnboardingStore = ReturnType<typeof useOnboardingStore>;

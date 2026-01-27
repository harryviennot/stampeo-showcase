"use client";

import { useState, useEffect, useCallback } from "react";

export interface CardDesign {
  backgroundColor: string;
  accentColor: string;
}

export interface OnboardingData {
  // Step 1
  businessName: string;
  urlSlug: string;
  ownerName: string;
  // Step 2
  category: string | null;
  description: string;
  // Step 3 - Card customization (optional)
  cardDesign: CardDesign;
  // Step 4
  email: string;
  // Step 5
  selectedPlan: "pay" | "pro" | null;
}

export interface OnboardingState {
  currentStep: number;
  completedSteps: number[];
  data: OnboardingData;
  isSlugAvailable: boolean | null;
  isSlugChecking: boolean;
}

const STORAGE_KEY = "stampeo_onboarding";
const STORAGE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

const defaultCardDesign: CardDesign = {
  backgroundColor: "#1c1c1e",
  accentColor: "#c75b39",
};

const initialData: OnboardingData = {
  businessName: "",
  urlSlug: "",
  ownerName: "",
  category: null,
  description: "",
  cardDesign: defaultCardDesign,
  email: "",
  selectedPlan: null,
};

interface StoredState {
  data: OnboardingData;
  currentStep: number;
  completedSteps: number[];
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

export function useOnboardingStore(isAuthenticated = false) {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [data, setData] = useState<OnboardingData>(initialData);
  const [isSlugAvailable, setIsSlugAvailable] = useState<boolean | null>(null);
  const [slugErrorReason, setSlugErrorReason] = useState<string | null>(null);
  const [isSlugChecking, setIsSlugChecking] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  // Cache the validated slug so we don't re-check it
  const [validatedSlug, setValidatedSlug] = useState<string | null>(null);

  // Load from localStorage on mount - only if authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      // Not authenticated - start fresh, don't load from storage
      setIsInitialized(true);
      return;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: StoredState = JSON.parse(stored);
        const now = Date.now();

        // Check if data is still valid (not expired)
        if (now - parsed.timestamp < STORAGE_EXPIRY_MS) {
          setData({ ...initialData, ...parsed.data });
          setCurrentStep(parsed.currentStep);
          setCompletedSteps(parsed.completedSteps || []);
          // Restore validated slug if it matches
          if (parsed.data.urlSlug) {
            setValidatedSlug(parsed.data.urlSlug);
            setIsSlugAvailable(true);
          }
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    setIsInitialized(true);
  }, [isAuthenticated]);

  // Save to localStorage when data or step changes - only if authenticated
  useEffect(() => {
    if (!isInitialized || !isAuthenticated) return;

    const state: StoredState = {
      data,
      currentStep,
      completedSteps,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [data, currentStep, completedSteps, isInitialized, isAuthenticated]);

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
    // Only reset availability if slug changed from the validated one
    if (cleanSlug !== validatedSlug) {
      setIsSlugAvailable(null);
      setSlugErrorReason(null);
    }
  }, [validatedSlug]);

  // Mark current slug as validated (call this when slug check returns available)
  const markSlugValidated = useCallback(() => {
    setValidatedSlug(data.urlSlug);
  }, [data.urlSlug]);

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

  const markStepCompleted = useCallback((step: number) => {
    setCompletedSteps((prev) => {
      if (prev.includes(step)) return prev;
      return [...prev, step].sort((a, b) => a - b);
    });
  }, []);

  const updateCardDesign = useCallback((updates: Partial<CardDesign>) => {
    setData((prev) => ({
      ...prev,
      cardDesign: { ...prev.cardDesign, ...updates },
    }));
  }, []);

  const clearStore = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setData(initialData);
    setCurrentStep(1);
    setCompletedSteps([]);
    setIsSlugAvailable(null);
  }, []);

  return {
    currentStep,
    completedSteps,
    data,
    isSlugAvailable,
    slugErrorReason,
    isSlugChecking,
    isInitialized,
    validatedSlug,
    setIsSlugAvailable,
    setSlugErrorReason,
    setIsSlugChecking,
    updateData,
    updateBusinessName,
    updateSlug,
    updateCardDesign,
    markStepCompleted,
    markSlugValidated,
    nextStep,
    prevStep,
    goToStep,
    clearStore,
  };
}

export type OnboardingStore = ReturnType<typeof useOnboardingStore>;

"use client";

import { useState, useEffect, useCallback } from "react";
import slugify from "slugify";

export interface CardDesign {
  backgroundColor: string;
  accentColor: string;
  iconColor: string;              // Stamp icon color (the icon inside the stamp)
  logoUrl: string | null;         // URL or base64 data URL
  stampIcon: string;              // Preset icon: 'checkmark' | 'coffee' | 'star' | 'heart' | 'gift' | 'thumbsup'
  rewardIcon: string;             // Final stamp (reward) icon: 'gift' | 'trophy' | 'star' | 'crown' | etc.
}

export type TeamSize = "solo" | "2-5" | "6-20" | "20+";
export type LocationCount = "1" | "2-5" | "6+";
export type PrimaryGoal = "acquire" | "retain" | "both";

export interface OnboardingData {
  // Step 1.1 — identity
  businessName: string;
  urlSlug: string;
  // Step 1.2 — category
  category: string | null;
  description: string;
  // Step 1.3 — size (NEW)
  teamSize: TeamSize | null;
  locations: LocationCount | null;
  // Step 1.4 — primary goal (NEW)
  primaryGoal: PrimaryGoal | null;
  // Step 2 — card design
  cardDesign: CardDesign;
  // Step 3 — about you
  ownerName: string;
  website: string;
  phone: string;
  // Step 4 — account
  email: string;
  // Step 6 — done (HDYHAU now collected on the success screen)
  heardFrom: string | null;
  heardFromOther: string;
  // Track created business to prevent re-creation
  businessId: string | null;
}

export interface OnboardingState {
  currentStep: number;
  completedSteps: number[];
  data: OnboardingData;
  isSlugAvailable: boolean | null;
  isSlugChecking: boolean;
}

// v2: bumped after STA-135 restructure (step renumbering + new fields).
// Mid-flow users on the old shape get reset rather than landing on a missing step.
const STORAGE_KEY = "stampeo_onboarding_v2";
const SESSION_STORAGE_KEY = "stampeo_onboarding_session_v2";
const STORAGE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

const defaultCardDesign: CardDesign = {
  backgroundColor: "#1c1c1e",
  accentColor: "#f97316",
  iconColor: "#ffffff",
  logoUrl: null,
  stampIcon: "checkmark",
  rewardIcon: "gift",
};

const initialData: OnboardingData = {
  businessName: "",
  urlSlug: "",
  category: null,
  description: "",
  teamSize: null,
  locations: null,
  primaryGoal: null,
  cardDesign: defaultCardDesign,
  ownerName: "",
  website: "",
  phone: "",
  email: "",
  heardFrom: null,
  heardFromOther: "",
  businessId: null,
};

interface StoredState {
  data: OnboardingData;
  currentStep: number;
  completedSteps: number[];
  step1Substep?: 1 | 2 | 3 | 4 | 5;
  createAccountPhase?: "choose" | "form" | "verify";
  timestamp: number;
}

function toSlug(text: string): string {
  return slugify(text, { lower: true, strict: true, trim: true });
}

export function useOnboardingStore(isAuthenticated = false, authLoading = true) {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [data, setData] = useState<OnboardingData>(initialData);
  const [isSlugAvailable, setIsSlugAvailable] = useState<boolean | null>(null);
  const [slugErrorReason, setSlugErrorReason] = useState<string | null>(null);
  const [isSlugChecking, setIsSlugChecking] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  // Cache the validated slug so we don't re-check it
  const [validatedSlug, setValidatedSlug] = useState<string | null>(null);
  // Sub-step state persisted so locale switches don't reset within a step
  const [step1Substep, setStep1Substep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [createAccountPhase, setCreateAccountPhase] = useState<"choose" | "form" | "verify">("choose");

  // Load from storage on mount - prioritize sessionStorage for current session
  useEffect(() => {
    // Wait for auth to finish loading before initializing
    if (authLoading) return;
    // Only initialize once
    if (isInitialized) return;

    let restored = false;

    // 1. Try sessionStorage first (current browser session - survives auth state changes)
    try {
      const sessionData = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (sessionData) {
        const parsed: StoredState = JSON.parse(sessionData);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setData({ ...initialData, ...parsed.data });
        setCurrentStep(parsed.currentStep);
        setCompletedSteps(parsed.completedSteps || []);
        if (parsed.step1Substep) setStep1Substep(parsed.step1Substep);
        if (parsed.createAccountPhase) setCreateAccountPhase(parsed.createAccountPhase);
        if (parsed.data.urlSlug) {
          setValidatedSlug(parsed.data.urlSlug);
          setIsSlugAvailable(true);
        }
        restored = true;
      }
    } catch {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }

    // 2. If no session data and authenticated, try localStorage (cross-session persistence)
    if (!restored && isAuthenticated) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed: StoredState = JSON.parse(stored);
          const now = Date.now();

          if (now - parsed.timestamp < STORAGE_EXPIRY_MS) {
            setData({ ...initialData, ...parsed.data });
            setCurrentStep(parsed.currentStep);
            setCompletedSteps(parsed.completedSteps || []);
            if (parsed.step1Substep) setStep1Substep(parsed.step1Substep);
            if (parsed.createAccountPhase) setCreateAccountPhase(parsed.createAccountPhase);
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
    }

    setIsInitialized(true);
  }, [authLoading, isAuthenticated, isInitialized]);

  // Always save to sessionStorage (survives auth state changes within session)
  useEffect(() => {
    if (!isInitialized) return;

    const state: StoredState = {
      data,
      currentStep,
      completedSteps,
      step1Substep,
      createAccountPhase,
      timestamp: Date.now(),
    };
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(state));
  }, [data, currentStep, completedSteps, step1Substep, createAccountPhase, isInitialized]);

  // Also save to localStorage when authenticated (for cross-session persistence)
  useEffect(() => {
    if (!isInitialized || !isAuthenticated) return;

    const state: StoredState = {
      data,
      currentStep,
      completedSteps,
      step1Substep,
      createAccountPhase,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [data, currentStep, completedSteps, step1Substep, createAccountPhase, isInitialized, isAuthenticated]);

  // Reset sub-step state when leaving a step. This keeps "back then forward"
  // behaving as before (lands on the first sub-step) while preserving sub-step
  // across locale switches (which don't change currentStep).
  const resetSubstepsFor = useCallback((newStep: number) => {
    if (newStep !== 1) setStep1Substep(1);
    if (newStep !== 4) setCreateAccountPhase("choose");
  }, []);

  const updateData = useCallback((updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateBusinessName = useCallback((name: string) => {
    const slug = toSlug(name);
    setData((prev) => ({
      ...prev,
      businessName: name,
      urlSlug: slug,
    }));
    setIsSlugAvailable(null);
    setSlugErrorReason(null);
  }, []);

  const updateSlug = useCallback((slug: string) => {
    const cleanSlug = toSlug(slug).replace(/^-/, "");

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
    setCurrentStep((prev) => {
      const next = Math.min(prev + 1, 6);
      resetSubstepsFor(next);
      return next;
    });
  }, [resetSubstepsFor]);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => {
      const next = Math.max(prev - 1, 1);
      resetSubstepsFor(next);
      return next;
    });
  }, [resetSubstepsFor]);

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= 6) {
      setCurrentStep(step);
      resetSubstepsFor(step);
    }
  }, [resetSubstepsFor]);

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
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
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
    step1Substep,
    createAccountPhase,
    setIsSlugAvailable,
    setSlugErrorReason,
    setIsSlugChecking,
    setStep1Substep,
    setCreateAccountPhase,
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

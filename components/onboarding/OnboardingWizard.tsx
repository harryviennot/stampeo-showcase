"use client";

import { useEffect, useState, useCallback } from "react";
import { useOnboardingStore } from "@/hooks/useOnboardingStore";
import { useAuth } from "@/lib/supabase/auth-provider";
import {
  getUserBusinesses,
  saveOnboardingProgress,
  getOnboardingProgress,
} from "@/lib/onboarding";
import { OnboardingCardPreview } from "./OnboardingCardPreview";
import { BusinessInfoStep } from "./steps/BusinessInfoStep";
import { BusinessTypeStep } from "./steps/BusinessTypeStep";
import { CardPreviewStep } from "./steps/CardPreviewStep";
import { CreateAccountStep } from "./steps/CreateAccountStep";
import { ChoosePlanStep } from "./steps/ChoosePlanStep";
import { CongratsStep } from "./steps/CongratsStep";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";

// Helper to adjust color brightness for hover states

function adjustBrightness(hex: string, percent: number): string {
  const num = Number.parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + percent));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + percent));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + percent));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

export function OnboardingWizard() {
  const { session, loading: authLoading } = useAuth();
  const isAuthenticated = !!session?.access_token;
  const store = useOnboardingStore(isAuthenticated, authLoading);
  const [checkingBusinesses, setCheckingBusinesses] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [animatingStampIndex, setAnimatingStampIndex] = useState<number | null>(null);
  const [direction, setDirection] = useState(0);
  const [prevStep, setPrevStep] = useState(1);

  // Card position: left for steps 1-2, right for steps 3+
  const cardPosition = store.currentStep < 3 ? "left" : "right";

  // Track if user has visited step 3 (design step) to persist colors
  const hasVisitedDesignStep = store.completedSteps.includes(2) || store.currentStep >= 3;

  // Update page accent color to match their business color (once they've reached design step)
  useEffect(() => {
    const accentColor = store.data.cardDesign?.accentColor;
    if (accentColor && hasVisitedDesignStep) {
      document.documentElement.style.setProperty("--accent", accentColor);
      document.documentElement.style.setProperty("--accent-hover", adjustBrightness(accentColor, -15));
    }

    // Cleanup: reset to default when leaving onboarding
    return () => {
      document.documentElement.style.removeProperty("--accent");
      document.documentElement.style.removeProperty("--accent-hover");
    };
  }, [store.data.cardDesign?.accentColor, hasVisitedDesignStep]);

  // Check if authenticated user already has a business (completed onboarding)
  useEffect(() => {
    async function checkUserBusinesses() {
      if (!session?.access_token || authChecked) return;

      setCheckingBusinesses(true);
      const { data: businesses } = await getUserBusinesses(session.access_token);

      if (businesses.length > 0) {
        // User already has a business - redirect to app
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.stampeo.app";
        window.location.href = appUrl;
        return;
      }

      // User is authenticated but has no business - they need to complete onboarding
      // If they're on Step 4 (create account), skip to Step 5
      if (store.currentStep === 4) {
        store.goToStep(5);
      }

      setCheckingBusinesses(false);
      setAuthChecked(true);
    }

    if (!authLoading && session) {
      checkUserBusinesses();
    } else if (!authLoading && !session) {
      setAuthChecked(true);
    }
  }, [session, authLoading, authChecked, store]);

  // Sync progress to backend when authenticated and data changes
  useEffect(() => {
    if (!session?.access_token || !store.isInitialized) return;
    // Only save if we have meaningful data (at least business name)
    if (!store.data.businessName) return;

    const saveToBackend = async () => {
      await saveOnboardingProgress(
        {
          business_name: store.data.businessName,
          url_slug: store.data.urlSlug,
          owner_name: store.data.ownerName || undefined,
          category: store.data.category || undefined,
          description: store.data.description || undefined,
          email: store.data.email || undefined,
          card_design: store.data.cardDesign ? {
            background_color: store.data.cardDesign.backgroundColor,
            accent_color: store.data.cardDesign.accentColor,
          } : undefined,
          current_step: store.currentStep,
          completed_steps: store.completedSteps,
        },
        session.access_token
      );
    };

    // Debounce the save to avoid too many API calls
    const timeoutId = setTimeout(saveToBackend, 1000);
    return () => clearTimeout(timeoutId);
  }, [
    session?.access_token,
    store.isInitialized,
    store.data.businessName,
    store.data.urlSlug,
    store.data.ownerName,
    store.data.category,
    store.data.description,
    store.data.email,
    store.data.cardDesign,
    store.currentStep,
    store.completedSteps,
  ]);

  // On initial load, fetch progress from backend if authenticated
  useEffect(() => {
    if (!session?.access_token || authLoading || !authChecked) return;

    const fetchFromBackend = async () => {
      const { data: serverProgress } = await getOnboardingProgress(session.access_token);

      // Only restore from server if we have server data and local data is empty/default
      if (serverProgress && !store.data.businessName) {
        store.updateData({
          businessName: serverProgress.business_name,
          urlSlug: serverProgress.url_slug,
          ownerName: serverProgress.owner_name || "",
          category: serverProgress.category || null,
          description: serverProgress.description || "",
          email: serverProgress.email || "",
          cardDesign: serverProgress.card_design ? {
            backgroundColor: serverProgress.card_design.background_color,
            accentColor: serverProgress.card_design.accent_color,
          } : store.data.cardDesign,
        });

        // Restore step progress
        if (serverProgress.current_step > store.currentStep) {
          store.goToStep(serverProgress.current_step);
        }
        serverProgress.completed_steps.forEach((step) => {
          if (!store.completedSteps.includes(step)) {
            store.markStepCompleted(step);
          }
        });
      }
    };

    fetchFromBackend();
  }, [session?.access_token, authLoading, authChecked]);

  // Handle step completion with animation
  const handleStepComplete = useCallback((nextStep: number) => {
    const currentStep = store.currentStep;

    // Mark current step as completed (triggers stamp animation)
    store.markStepCompleted(currentStep);

    // Animate the stamp (0-indexed, so step 1 = index 0)
    setAnimatingStampIndex(currentStep - 1);

    // Wait for animation, then advance
    setTimeout(() => {
      setAnimatingStampIndex(null);

      // Skip step 4 if already authenticated
      if (nextStep === 4 && isAuthenticated) {
        store.goToStep(5);
      } else {
        setPrevStep(currentStep); // Update previous step for animation logic
        setDirection(nextStep > currentStep ? 1 : -1);
        store.goToStep(nextStep);
      }
    }, 50);
  }, [store, isAuthenticated]);

  // Custom next step handlers for each step
  const handleStep1Next = useCallback(() => {
    handleStepComplete(2);
  }, [handleStepComplete]);

  const handleStep2Next = useCallback(() => {
    handleStepComplete(3);
  }, [handleStepComplete]);

  const handleStep3Next = useCallback(() => {
    handleStepComplete(4);
  }, [handleStepComplete]);

  const handleStep4Next = useCallback(() => {
    handleStepComplete(5);
  }, [handleStepComplete]);

  const handleStep5Next = useCallback(() => {
    handleStepComplete(6);
  }, [handleStepComplete]);

  // Don't render until we've loaded from localStorage and checked auth
  if (!store.isInitialized || authLoading || checkingBusinesses || !authChecked) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const renderStep = () => {
    switch (store.currentStep) {
      case 1:
        return <BusinessInfoStep store={store} onNext={handleStep1Next} />;
      case 2:
        return (
          <BusinessTypeStep
            store={store}
            onNext={handleStep2Next}
            onBack={() => {
              setDirection(-1);
              setPrevStep(2);
              store.prevStep();
            }}
          />
        );
      case 3:
        return (
          <CardPreviewStep
            store={store}
            onNext={handleStep3Next}
            onBack={() => {
              setDirection(-1);
              setPrevStep(3);
              store.prevStep();
            }}
          />
        );
      case 4:
        return (
          <CreateAccountStep
            store={store}
            onNext={handleStep4Next}
            onBack={() => {
              setDirection(-1);
              setPrevStep(4);
              store.prevStep();
            }}
          />
        );
      case 5:
        return <ChoosePlanStep store={store} onNext={handleStep5Next} onBack={() => {
          setDirection(-1);
          setPrevStep(5);
          store.prevStep();
        }} />;
      case 6:
        return <CongratsStep store={store} />;
      default:
        return <BusinessInfoStep store={store} onNext={handleStep1Next} />;
    }
  };

  // Variants for step transitions

  const stepVariants = {
    enter: (custom: { direction: number; isSpecial: boolean }) => {
      // Standard transition
      let x = custom.direction > 0 ? 50 : -50;
      let opacity = 0;
      let scale = 0.98;

      if (custom.isSpecial) {
        // Step 2 -> 3 (Enter Form 3 from Left)
        if (custom.direction > 0) {
          x = -100; // Use % in string if needed, but here simple number might be safer or string "-100%"
          return { x: "-100%", opacity: 0, scale: 0.7, zIndex: 10 };
        }
        // Step 3 -> 2 (Enter Form 2 from Right)
        return { x: "100%", opacity: 0, scale: 0.7, zIndex: 10 };
      }

      return { x, opacity, scale, zIndex: 10 };
    },
    center: {
      zIndex: 10,
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "tween" as const,
        ease: "easeInOut" as const,
        duration: 0.5
      }
    },
    exit: (custom: { direction: number; isSpecial: boolean }) => {
      if (custom.isSpecial) {
        // Step 2 -> 3 (Exit Form 2 to Right)
        if (custom.direction > 0) {
          return {
            zIndex: 0,
            x: "150%",
            opacity: 0,
            scale: 0.7,
            position: "absolute",
            top: 0, // Align to top of container
            width: "100%", // Maintain width
            transition: { duration: 0.5, ease: "easeInOut" as const }
          };
        }
        // Step 3 -> 2 (Exit Form 3 to Left)
        return {
          zIndex: 0,
          x: "-150%",
          opacity: 0,
          scale: 0.7,
          position: "absolute",
          top: 0,
          width: "100%",
          transition: { duration: 0.5, ease: "easeInOut" as const }
        };
      }
      return {
        zIndex: 0,
        x: custom.direction < 0 ? 50 : -50,
        opacity: 0,
        scale: 0.98,
        position: "absolute",
        top: 0,
        width: "100%",
        transition: {
          duration: 0.3,
          ease: "easeInOut" as const
        }
      };
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      {/* LayoutGroup enables layout animations across components */}
      <LayoutGroup>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[70vh]">
          {/* Card Panel */}
          <motion.div
            layout
            className="flex items-center justify-center"
            style={{
              order: cardPosition === "left" ? 0 : 1,
            }}
            transition={{
              type: "tween",
              ease: "easeInOut",
              duration: 0.5
            }}
          >
            <motion.div
              layout
              className="w-full max-w-[360px]"
              transition={{
                type: "tween",
                ease: "easeInOut",
                duration: 0.5
              }}
            >
              <OnboardingCardPreview
                businessName={store.data.businessName}
                category={store.data.category}
                completedSteps={store.completedSteps.length}
                animatingStampIndex={animatingStampIndex}
                design={store.data.cardDesign}
              />

              {/* Step indicator */}
              <motion.div className="mt-6 flex justify-center gap-2 lg:hidden" layout>
                {[1, 2, 3, 4, 5, 6].map((step) => (
                  <div
                    key={step}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${store.completedSteps.includes(step)
                      ? "bg-[var(--accent)]"
                      : step === store.currentStep
                        ? "bg-[var(--accent)] ring-2 ring-[var(--accent)]/30"
                        : "bg-[var(--muted)]"
                      }`}
                  />
                ))}
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Form Panel */}
          <motion.div
            layout
            className="flex flex-col justify-center relative" // Added relative for absolute positioning of children
            style={{
              order: cardPosition === "left" ? 1 : 0,
            }}
            transition={{
              type: "tween",
              ease: "easeInOut",
              duration: 0.5
            }}
          >
            {/* Step Content with AnimatePresence */}
            <AnimatePresence mode="popLayout" custom={{
              direction,
              isSpecial: (prevStep === 2 && store.currentStep === 3) || (prevStep === 3 && store.currentStep === 2)
            }}>
              <motion.div
                key={store.currentStep}
                custom={{
                  direction,
                  isSpecial: (prevStep === 2 && store.currentStep === 3) || (prevStep === 3 && store.currentStep === 2)
                }}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full"
              >
                {/* Step labels */}
                <div className="hidden lg:flex justify-center gap-8 mb-6 text-sm">
                  {[
                    { step: 1, label: "Business" },
                    { step: 2, label: "Type" },
                    { step: 3, label: "Design" },
                    { step: 4, label: "Account" },
                    { step: 5, label: "Plan" },
                    { step: 6, label: "Ready" },
                  ].map(({ step, label }) => (
                    <button
                      key={step}
                      type="button"
                      onClick={() => {
                        if (store.completedSteps.includes(step) && step !== store.currentStep) {
                          setPrevStep(store.currentStep);
                          setDirection(step > store.currentStep ? 1 : -1);
                          store.goToStep(step);
                        }
                      }}
                      disabled={!store.completedSteps.includes(step)}
                      className={`transition-colors duration-200 ${step === store.currentStep
                        ? "text-[var(--accent)] font-medium"
                        : store.completedSteps.includes(step)
                          ? "text-[var(--accent)] hover:underline cursor-pointer"
                          : "text-[var(--muted-foreground)] cursor-default"
                        }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 sm:p-8 shadow-sm">
                  {renderStep()}
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </LayoutGroup>
    </div>
  );
}

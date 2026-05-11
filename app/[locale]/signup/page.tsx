import { SignupFlow } from "@/components/signup/SignupFlow";

/**
 * Replacement for the old 6-step /onboarding wizard. Showcase is now responsible
 * for identity + auth only (name + phone + email + password + OTP); business
 * creation moves to the web wizard at /onboarding/business/*.
 */
export default function SignupPage() {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-[var(--background)]">
      <SignupFlow />
    </div>
  );
}

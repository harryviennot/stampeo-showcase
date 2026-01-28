"use client";

import { useCallback } from "react";
import { OnboardingStore } from "@/hooks/useOnboardingStore";
import { useAuth } from "@/lib/supabase/auth-provider";
import { ImageUploadBox } from "@/components/ui/ImageUploadBox";
import { StampIconPicker, StampIconType } from "../StampIconPicker";
import { uploadOnboardingLogo, deleteOnboardingLogo } from "@/lib/onboarding";

interface AssetUploadSubstepProps {
  store: OnboardingStore;
}

// Convert File to base64 data URL for pre-auth storage
async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function AssetUploadSubstep({ store }: AssetUploadSubstepProps) {
  const { data, updateCardDesign } = store;
  const { session } = useAuth();

  const handleLogoUpload = useCallback(
    async (file: File) => {
      if (!session?.access_token) {
        // Not authenticated: store as base64 data URL temporarily
        const dataUrl = await fileToDataUrl(file);
        updateCardDesign({ logoUrl: dataUrl });
      } else {
        // Authenticated: upload to Supabase Storage
        const url = await uploadOnboardingLogo(file, session.access_token);
        updateCardDesign({ logoUrl: url });
      }
    },
    [session?.access_token, updateCardDesign]
  );

  const handleLogoClear = useCallback(async () => {
    if (session?.access_token && data.cardDesign.logoUrl?.startsWith("http")) {
      // Delete from Supabase if it was uploaded
      try {
        await deleteOnboardingLogo(session.access_token);
      } catch {
        // Ignore errors, just clear locally
      }
    }
    updateCardDesign({ logoUrl: null });
  }, [session?.access_token, data.cardDesign.logoUrl, updateCardDesign]);

  const handleStampIconChange = useCallback(
    (icon: StampIconType) => {
      updateCardDesign({ stampIcon: icon });
    },
    [updateCardDesign]
  );

  return (
    <div className="space-y-6">
      {/* Logo Upload - horizontal layout */}
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
            Business Logo
            <span className="text-[var(--muted-foreground)] font-normal ml-1">(optional)</span>
          </label>
          <p className="text-sm text-[var(--muted-foreground)]">
            Upload your logo to replace the initials on your card. PNG format, max 2MB.
          </p>
        </div>
        <ImageUploadBox
          value={data.cardDesign.logoUrl}
          onUpload={handleLogoUpload}
          onClear={handleLogoClear}
          hint="PNG"
          logoMode
        />
      </div>

      {/* Stamp Icon Picker */}
      <div>
        <label className="block text-sm font-medium text-[var(--foreground)] mb-3">
          Stamp Icon
        </label>
        <StampIconPicker
          value={data.cardDesign.stampIcon as StampIconType}
          onChange={handleStampIconChange}
          accentColor={data.cardDesign.accentColor}
        />
      </div>
    </div>
  );
}

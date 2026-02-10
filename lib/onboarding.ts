import { createClient } from "./supabase/client";

const API_URL = process.env.NEXT_PUBLIC_API_URL

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined");
} else {
  console.log(`[API] API_BASE_URL: ${API_URL}`);
}

export interface BusinessCreatePayload {
  name: string;
  url_slug: string;
  subscription_tier: "pro";
  settings: {
    category?: string;
    description?: string;
    owner_name?: string;
    accentColor?: string;
    backgroundColor?: string;
  };
  logo_url?: string;
}

export interface BusinessResponse {
  id: string;
  name: string;
  url_slug: string;
  subscription_tier: string;
  settings: Record<string, unknown>;
  logo_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SlugAvailabilityResponse {
  available: boolean;
  reason?: string;
}

/**
 * Check if a URL slug is available
 * @returns object with available boolean and optional reason
 */
export async function checkSlugAvailability(
  slug: string
): Promise<SlugAvailabilityResponse> {
  if (!slug || slug.length < 3) {
    return { available: false, reason: "Slug must be at least 3 characters" };
  }

  try {
    const response = await fetch(`${API_URL}/businesses/slug/${slug}/available`);
    if (!response.ok) {
      return { available: false, reason: "Failed to check availability" };
    }
    return await response.json();
  } catch {
    return { available: false, reason: "Failed to check availability" };
  }
}

/**
 * Create a new business with the authenticated user as owner
 * @param payload - Business creation data
 * @param accessToken - Optional access token (if not provided, will try to get from Supabase)
 */
export async function createBusiness(
  payload: BusinessCreatePayload,
  accessToken?: string
): Promise<{ data: BusinessResponse | null; error: string | null }> {
  try {
    let token = accessToken;

    // If no token provided, try to get from Supabase
    if (!token) {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      token = session?.access_token;
    }

    if (!token) {
      return { data: null, error: "Not authenticated" };
    }

    const response = await fetch(`${API_URL}/businesses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // FastAPI detail can be a string or an array of validation errors
      let errorMessage = `Failed to create business (${response.status})`;
      if (typeof errorData.detail === "string") {
        errorMessage = errorData.detail;
      } else if (Array.isArray(errorData.detail) && errorData.detail.length > 0) {
        errorMessage = errorData.detail[0]?.msg || errorMessage;
      }
      return { data: null, error: errorMessage };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Failed to create business",
    };
  }
}

/**
 * Get all businesses for the authenticated user
 * Used to check if user has completed onboarding (has at least one business)
 */
export async function getUserBusinesses(
  accessToken: string
): Promise<{ data: BusinessResponse[]; error: string | null }> {
  try {
    const response = await fetch(`${API_URL}/businesses`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      return { data: [], error: `Failed to fetch businesses (${response.status})` };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (err) {
    return {
      data: [],
      error: err instanceof Error ? err.message : "Failed to fetch businesses",
    };
  }
}

// ============================================
// Onboarding Progress API
// ============================================

export interface OnboardingProgressPayload {
  business_name: string;
  url_slug: string;
  owner_name?: string;
  category?: string;
  description?: string;
  email?: string;
  card_design?: {
    background_color: string;
    accent_color: string;
    icon_color?: string;
    logo_url?: string;
    stamp_icon?: string;
    reward_icon?: string;
  };
  current_step: number;
  completed_steps: number[];
}

export interface OnboardingProgressResponse {
  id: string;
  user_id: string;
  business_name: string;
  url_slug: string;
  owner_name?: string;
  category?: string;
  description?: string;
  email?: string;
  card_design?: {
    background_color: string;
    accent_color: string;
    icon_color?: string;
    logo_url?: string;
    stamp_icon?: string;
    reward_icon?: string;
  };
  current_step: number;
  completed_steps: number[];
  created_at: string;
  updated_at: string;
}

/**
 * Save onboarding progress to the backend
 * Allows users to resume onboarding on another device
 */
export async function saveOnboardingProgress(
  payload: OnboardingProgressPayload,
  accessToken: string
): Promise<{ data: OnboardingProgressResponse | null; error: string | null }> {
  try {
    const response = await fetch(`${API_URL}/onboarding/progress`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      let errorMessage = `Failed to save progress (${response.status})`;
      if (typeof errorData.detail === "string") {
        errorMessage = errorData.detail;
      }
      return { data: null, error: errorMessage };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Failed to save progress",
    };
  }
}

/**
 * Get onboarding progress from the backend
 * Used when a user returns to continue onboarding
 */
export async function getOnboardingProgress(
  accessToken: string
): Promise<{ data: OnboardingProgressResponse | null; error: string | null }> {
  try {
    const response = await fetch(`${API_URL}/onboarding/progress`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return { data: null, error: null }; // No progress saved yet
      }
      return { data: null, error: `Failed to fetch progress (${response.status})` };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Failed to fetch progress",
    };
  }
}

/**
 * Delete onboarding progress after completion
 */
export async function deleteOnboardingProgress(
  accessToken: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const response = await fetch(`${API_URL}/onboarding/progress`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      return { success: false, error: `Failed to delete progress (${response.status})` };
    }

    return { success: true, error: null };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete progress",
    };
  }
}

// ============================================
// Logo Upload API
// ============================================

/**
 * Upload a logo image during onboarding
 * @param file - The PNG file to upload
 * @param accessToken - The user's access token
 * @returns The URL of the uploaded logo
 */
export async function uploadOnboardingLogo(
  file: File,
  accessToken: string
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/onboarding/progress/upload/logo`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to upload logo (${response.status})`);
  }

  const data = await response.json();
  return data.url;
}

/**
 * Delete the user's onboarding logo
 * @param accessToken - The user's access token
 */
export async function deleteOnboardingLogo(
  accessToken: string
): Promise<void> {
  const response = await fetch(`${API_URL}/onboarding/progress/upload/logo`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to delete logo (${response.status})`);
  }
}

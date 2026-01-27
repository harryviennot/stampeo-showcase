import { createClient } from "./supabase/client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface BusinessCreatePayload {
  name: string;
  url_slug: string;
  subscription_tier: "pay" | "pro";
  settings: {
    category?: string;
    description?: string;
    owner_name?: string;
  };
}

export interface BusinessResponse {
  id: string;
  name: string;
  url_slug: string;
  subscription_tier: string;
  settings: Record<string, unknown>;
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
      return {
        data: null,
        error: errorData.detail || `Failed to create business (${response.status})`,
      };
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

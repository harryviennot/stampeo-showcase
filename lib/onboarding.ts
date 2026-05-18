const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined");
} else {
  console.log(`[API] API_BASE_URL: ${API_URL}`);
}

// ============================================
// User Profile API
// ============================================

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  is_reseller: boolean;
  reseller_discount_percent: number | null;
}

export async function getUserProfile(
  accessToken: string
): Promise<{ data: UserProfile | null; error: string | null }> {
  try {
    const response = await fetch(`${API_URL}/profile/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      return { data: null, error: `Failed to fetch profile (${response.status})` };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Failed to fetch profile",
    };
  }
}

export interface UserProfileUpdate {
  name?: string;
  phone?: string;
  locale?: "fr" | "en";
}

/**
 * Update the current user's profile. Used post-OAuth to write step-1 fields
 * (phone, optionally name) into public.users — the auth.users INSERT trigger
 * only fires once at user creation and can't capture data collected later.
 */
export async function updateUserProfile(
  payload: UserProfileUpdate,
  accessToken: string
): Promise<{ data: UserProfile | null; error: string | null }> {
  try {
    const response = await fetch(`${API_URL}/profile/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return { data: null, error: `Failed to update profile (${response.status})` };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Failed to update profile",
    };
  }
}

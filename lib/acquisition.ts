/**
 * API functions for customer loyalty card acquisition flow.
 * These endpoints are public (no authentication required).
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ============================================
// Types
// ============================================

export interface BusinessPublicResponse {
  id: string;
  name: string;
  url_slug: string;
  subscription_tier: string;
  logo_url?: string | null;
  settings: {
    category?: string;
    description?: string;
    accentColor?: string;
    backgroundColor?: string;
    customer_data_collection?: {
      collect_name: boolean;
      collect_email: boolean;
      collect_phone: boolean;
    };
  };
  created_at: string;
  updated_at: string;
}

export interface CardDesignPublicResponse {
  id: string;
  name: string;
  is_active: boolean;
  organization_name: string;
  description: string;
  logo_text?: string | null;
  foreground_color: string;
  background_color: string;
  label_color: string;
  total_stamps: number;
  stamp_filled_color: string;
  stamp_empty_color: string;
  stamp_border_color: string;
  logo_url?: string | null;
}

export interface CustomerCreatePublic {
  name?: string;
  email?: string;
  phone?: string;
}

export interface CustomerPublicResponse {
  status: "created" | "exists_email_sent";
  customer_id?: string;
  pass_url?: string;
  google_wallet_url?: string;
  message: string;
}

// ============================================
// API Functions
// ============================================

/**
 * Get a business by its URL slug.
 * This is a public endpoint - no authentication required.
 */
export async function getBusinessBySlug(
  slug: string
): Promise<{ data: BusinessPublicResponse | null; error: string | null }> {
  try {
    const response = await fetch(`${API_URL}/businesses/slug/${slug}`);

    if (!response.ok) {
      if (response.status === 404) {
        return { data: null, error: "Business not found" };
      }
      return { data: null, error: `Failed to fetch business (${response.status})` };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Failed to fetch business",
    };
  }
}

/**
 * Get the active card design for a business.
 * This is a public endpoint - no authentication required.
 */
export async function getActiveCardDesign(
  businessId: string
): Promise<{ data: CardDesignPublicResponse | null; error: string | null }> {
  try {
    const response = await fetch(`${API_URL}/designs/${businessId}/active`);

    if (!response.ok) {
      if (response.status === 404) {
        return { data: null, error: "No active card design found" };
      }
      return { data: null, error: `Failed to fetch card design (${response.status})` };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Failed to fetch card design",
    };
  }
}

/**
 * Register a new customer for a business.
 * This is a public endpoint - no authentication required.
 *
 * If the customer already exists (by email), returns status "exists_email_sent"
 * and sends them their pass via email for security.
 */
export async function createPublicCustomer(
  businessId: string,
  data: CustomerCreatePublic
): Promise<{ data: CustomerPublicResponse | null; error: string | null }> {
  try {
    const response = await fetch(`${API_URL}/public/customers/${businessId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      let errorMessage = `Failed to register (${response.status})`;

      if (typeof errorData.detail === "string") {
        errorMessage = errorData.detail;
      } else if (Array.isArray(errorData.detail) && errorData.detail.length > 0) {
        errorMessage = errorData.detail[0]?.msg || errorMessage;
      }

      return { data: null, error: errorMessage };
    }

    const responseData = await response.json();
    return { data: responseData, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Failed to register",
    };
  }
}

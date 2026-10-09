import type { Metadata } from "next";
import { NOINDEX } from "@/lib/seo/page-robots";
import { AuthProvider } from "@/lib/supabase/auth-provider";

// The page is a client component, so its metadata lives here.
export const metadata: Metadata = { robots: NOINDEX };

// AuthProvider loads supabase-js, so only the sign-in pages mount it.
export default function LoginLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <AuthProvider>{children}</AuthProvider>;
}

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import * as Sentry from "@sentry/nextjs";
import { createClient } from "./client";
import type { User, Session, AuthError, Provider } from "@supabase/supabase-js";

export type OAuthProvider = Extract<Provider, "google" | "apple">;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    name: string,
    locale?: string
  ) => Promise<{ data: { user: User | null } | null; error: AuthError | null }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: AuthError | null }>;
  signInWithOAuth: (
    provider: OAuthProvider,
    returnTo?: string
  ) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  verifyOtp: (
    email: string,
    token: string
  ) => Promise<{ error: AuthError | null }>;
  resendOtp: (email: string) => Promise<{ error: AuthError | null }>;
  resetPasswordForEmail: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (password: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Clear all Supabase auth storage to break infinite refresh loops.
 * When a stale refresh token triggers 429 → _removeSession → _handleTokenChanged
 * → getSession → _callRefreshToken → 429 ..., the only way to break it is to
 * remove the stale token from storage so the next getSession finds nothing.
 */
function nukeSupabaseAuthStorage() {
  // Clear sb-* cookies
  document.cookie.split(";").forEach((c) => {
    const name = c.trim().split("=")[0];
    if (name.startsWith("sb-") && !name.includes("code-verifier")) {
      document.cookie = `${name}=; Max-Age=0; Path=/`;
      // Also try with domain
      const cookieDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN;
      if (cookieDomain) {
        document.cookie = `${name}=; Max-Age=0; Path=/; Domain=${cookieDomain}`;
      }
    }
  });
  // Clear sb-* localStorage keys
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (key?.startsWith("sb-")) {
      localStorage.removeItem(key);
    }
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const signedOutCountRef = useRef(0);
  const signedOutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        // Stale or invalid session — nuke storage to prevent retry loops
        nukeSupabaseAuthStorage();
        setSession(null);
        setUser(null);
        Sentry.setUser(null);
      } else {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          Sentry.setUser({ id: session.user.id, email: session.user.email });
        } else {
          Sentry.setUser(null);
        }
      }
      setLoading(false);
    });

    // Listen for auth changes — detect infinite refresh loops
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        signedOutCountRef.current++;

        // If we get 3+ SIGNED_OUT events within 5 seconds, it's a loop
        if (signedOutCountRef.current >= 3) {
          nukeSupabaseAuthStorage();
          signedOutCountRef.current = 0;
          setSession(null);
          setUser(null);
          setLoading(false);
          return;
        }

        // Reset counter after 5 seconds of no SIGNED_OUT events
        if (signedOutTimerRef.current) clearTimeout(signedOutTimerRef.current);
        signedOutTimerRef.current = setTimeout(() => {
          signedOutCountRef.current = 0;
        }, 5000);
      }

      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        Sentry.setUser({ id: session.user.id, email: session.user.email });
      } else {
        Sentry.setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
      if (signedOutTimerRef.current) clearTimeout(signedOutTimerRef.current);
    };
  }, [supabase.auth]);

  const signUp = useCallback(
    async (email: string, password: string, name: string, locale?: string) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, locale: locale || "fr" },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      return { data: data ? { user: data.user } : null, error };
    },
    [supabase.auth]
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    },
    [supabase.auth]
  );

  const signInWithOAuth = useCallback(
    async (provider: OAuthProvider, returnTo?: string) => {
      // Pin redirect to the configured showcase URL so OAuth lands on the
      // cookie-domain-compatible host (e.g. nip.io) even if the current
      // tab somehow resolved to localhost.
      const baseUrl =
        process.env.NEXT_PUBLIC_SHOWCASE_URL || globalThis.location.origin;
      const callbackUrl = new URL("/auth/callback", baseUrl);
      if (returnTo) callbackUrl.searchParams.set("next", returnTo);
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: callbackUrl.toString() },
      });
      return { error };
    },
    [supabase.auth]
  );

  const verifyOtp = useCallback(
    async (email: string, token: string) => {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "signup",
      });
      return { error };
    },
    [supabase.auth]
  );

  const resendOtp = useCallback(
    async (email: string) => {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      });
      return { error };
    },
    [supabase.auth]
  );

  const resetPasswordForEmail = useCallback(
    async (email: string) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${globalThis.location.origin}/reset-password`,
      });
      return { error };
    },
    [supabase.auth]
  );

  const updatePassword = useCallback(
    async (password: string) => {
      const { error } = await supabase.auth.updateUser({ password });
      return { error };
    },
    [supabase.auth]
  );

  const signOut = useCallback(async () => {
    // Clear onboarding session data on logout
    sessionStorage.removeItem("stampeo_onboarding_session");
    localStorage.removeItem("stampeo_onboarding");
    await supabase.auth.signOut();
  }, [supabase.auth]);

  return (
    <AuthContext.Provider
      value={{ user, session, loading, signUp, signIn, signInWithOAuth, signOut, verifyOtp, resendOtp, resetPasswordForEmail, updatePassword }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

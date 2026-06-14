import React, { useState, useEffect, useCallback, useContext, createContext } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface AuthCtx {
  user: User | null;
  session: Session | null;
  isLoaded: boolean;
  signInEmail: (email: string, password: string) => Promise<void>;
  signUpEmail: (email: string, password: string, displayName: string) => Promise<void>;
  signInGoogle: () => Promise<void>;
  signInMagicLink: (email: string) => Promise<void>;
  logOut: () => Promise<void>;
  authError: string | null;
  magicLinkSent: boolean;
  googleNotEnabled: boolean;
  clearError: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

function parseError(msg: string): string {
  if (msg.includes("Unsupported provider") || msg.includes("provider is not enabled"))
    return "Google login belum diaktifkan di Supabase — gunakan Email atau Magic Link";
  if (msg.includes("Invalid login credentials")) return "Email atau password salah";
  if (msg.includes("Email not confirmed")) return "Cek email kamu untuk verifikasi akun dulu";
  if (msg.includes("User already registered")) return "Email sudah terdaftar, coba Sign In";
  if (msg.includes("Password should be at least")) return "Password minimal 6 karakter";
  if (msg.includes("Unable to validate email") || msg.includes("invalid email"))
    return "Format email tidak valid";
  if (msg.includes("Email rate limit exceeded") || msg.includes("over_email_send_rate_limit"))
    return "Terlalu banyak percobaan — coba Magic Link";
  if (msg.includes("For security purposes")) return "Tunggu sebentar sebelum mencoba lagi";
  return msg || "Login gagal, coba lagi";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [googleNotEnabled, setGoogleNotEnabled] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setIsLoaded(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoaded(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const clearError = useCallback(() => {
    setAuthError(null);
    setMagicLinkSent(false);
    setGoogleNotEnabled(false);
  }, []);

  const signInEmail = useCallback(async (email: string, password: string) => {
    setAuthError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setAuthError(parseError(error.message)); throw error; }
  }, []);

  const signUpEmail = useCallback(async (email: string, password: string, displayName: string) => {
    setAuthError(null);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName.trim() || email.split("@")[0] } },
    });
    if (error) { setAuthError(parseError(error.message)); throw error; }
  }, []);

  const signInGoogle = useCallback(async () => {
    setAuthError(null);
    setGoogleNotEnabled(false);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      const isProviderError =
        error.message.includes("Unsupported provider") ||
        error.message.includes("provider is not enabled");
      if (isProviderError) setGoogleNotEnabled(true);
      setAuthError(parseError(error.message));
      throw error;
    }
  }, []);

  const signInMagicLink = useCallback(async (email: string) => {
    setAuthError(null);
    setMagicLinkSent(false);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    if (error) { setAuthError(parseError(error.message)); throw error; }
    setMagicLinkSent(true);
  }, []);

  const logOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return React.createElement(
    Ctx.Provider,
    { value: { user, session, isLoaded, signInEmail, signUpEmail, signInGoogle, signInMagicLink, logOut, authError, magicLinkSent, googleNotEnabled, clearError } },
    children
  );
}

export function useAuth(): AuthCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

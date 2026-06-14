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
  clearError: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

function parseError(msg: string): string {
  if (msg.includes("Invalid login credentials")) return "Incorrect email or password";
  if (msg.includes("Email not confirmed")) return "Please verify your email first";
  if (msg.includes("User already registered")) return "Email is already registered";
  if (msg.includes("Password should be at least")) return "Password must be at least 6 characters";
  if (msg.includes("Unable to validate email")) return "Invalid email address";
  if (msg.includes("Email rate limit exceeded")) return "Too many attempts — use Magic Link instead";
  if (msg.includes("over_email_send_rate_limit")) return "Too many attempts — use Magic Link instead";
  return msg || "Sign-in failed, please try again";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

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

  const clearError = useCallback(() => { setAuthError(null); setMagicLinkSent(false); }, []);

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
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) { setAuthError(parseError(error.message)); throw error; }
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
    { value: { user, session, isLoaded, signInEmail, signUpEmail, signInGoogle, signInMagicLink, logOut, authError, magicLinkSent, clearError } },
    children
  );
}

export function useAuth(): AuthCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}


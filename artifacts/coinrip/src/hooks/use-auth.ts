import React, { useState, useEffect, useCallback, useContext, createContext } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface AuthCtx {
  user: User | null;
  session: Session | null;
  isLoaded: boolean;
  signInMagicLink: (email: string) => Promise<void>;
  logOut: () => Promise<void>;
  authError: string | null;
  magicLinkSent: boolean;
  clearError: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

function parseError(msg: string): string {
  if (msg.includes("Error sending confirmation email") || msg.includes("sending confirmation"))
    return "Gagal kirim email — coba lagi dalam beberapa menit";
  if (msg.includes("Email rate limit exceeded") || msg.includes("over_email_send_rate_limit"))
    return "Terlalu banyak percobaan — tunggu beberapa menit lalu coba lagi";
  if (msg.includes("For security purposes")) return "Tunggu sebentar sebelum mencoba lagi";
  if (msg.includes("Unable to validate email") || msg.includes("invalid email"))
    return "Format email tidak valid";
  if (msg.includes("signup_disabled") || msg.includes("Signups not allowed"))
    return "Pendaftaran sementara dinonaktifkan";
  return msg || "Gagal mengirim magic link, coba lagi";
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

  const clearError = useCallback(() => {
    setAuthError(null);
    setMagicLinkSent(false);
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
    { value: { user, session, isLoaded, signInMagicLink, logOut, authError, magicLinkSent, clearError } },
    children
  );
}

export function useAuth(): AuthCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

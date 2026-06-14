import React, { useState, useEffect, useCallback, useContext, createContext } from "react";
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  AuthError,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

interface AuthCtx {
  user: User | null;
  isLoaded: boolean;
  signInEmail: (email: string, password: string) => Promise<void>;
  signUpEmail: (email: string, password: string, displayName: string) => Promise<void>;
  signInGoogle: () => Promise<void>;
  logOut: () => Promise<void>;
  authError: string | null;
  clearError: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

function parseAuthError(error: AuthError): string {
  switch (error.code) {
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Email atau password salah";
    case "auth/email-already-in-use":
      return "Email sudah terdaftar";
    case "auth/weak-password":
      return "Password minimal 6 karakter";
    case "auth/invalid-email":
      return "Format email tidak valid";
    case "auth/popup-closed-by-user":
      return "Login dibatalkan";
    case "auth/network-request-failed":
      return "Koneksi gagal, coba lagi";
    default:
      return "Terjadi kesalahan, coba lagi";
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsLoaded(true);
    });
    return unsub;
  }, []);

  const clearError = useCallback(() => setAuthError(null), []);

  const signInEmail = useCallback(async (email: string, password: string) => {
    try {
      setAuthError(null);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
      setAuthError(parseAuthError(e as AuthError));
      throw e;
    }
  }, []);

  const signUpEmail = useCallback(async (email: string, password: string, displayName: string) => {
    try {
      setAuthError(null);
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: displayName.trim() || email.split("@")[0] });
      setUser({ ...cred.user, displayName: displayName.trim() || email.split("@")[0] } as User);
    } catch (e) {
      setAuthError(parseAuthError(e as AuthError));
      throw e;
    }
  }, []);

  const signInGoogle = useCallback(async () => {
    try {
      setAuthError(null);
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      setAuthError(parseAuthError(e as AuthError));
      throw e;
    }
  }, []);

  const logOut = useCallback(async () => {
    await signOut(auth);
  }, []);

  return React.createElement(
    Ctx.Provider,
    { value: { user, isLoaded, signInEmail, signUpEmail, signInGoogle, logOut, authError, clearError } },
    children
  );
}

export function useAuth(): AuthCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

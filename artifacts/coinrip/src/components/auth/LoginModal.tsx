import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/Logo";
import { useAuth } from "@/hooks/use-auth";
import { Mail, Lock, User, AlertCircle, Loader2, Sparkles, CheckCircle2 } from "lucide-react";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

type Tab = "login" | "register" | "magic";

export function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const { signInEmail, signUpEmail, signInGoogle, signInMagicLink, authError, magicLinkSent, googleNotEnabled, clearError } = useAuth();
  const [tab, setTab] = useState<Tab>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const resetForm = () => { setEmail(""); setPassword(""); setName(""); clearError(); };
  const handleClose = (v: boolean) => { if (!v) resetForm(); onOpenChange(v); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (tab === "magic") {
        await signInMagicLink(email);
      } else if (tab === "login") {
        await signInEmail(email, password);
        handleClose(false);
      } else {
        await signUpEmail(email, password, name);
        handleClose(false);
      }
    } catch {
      // error handled in hook
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try { await signInGoogle(); } catch { setGoogleLoading(false); }
  };

  const TABS: { key: Tab; label: string }[] = [
    { key: "login", label: "Sign In" },
    { key: "register", label: "Register" },
    { key: "magic", label: "Magic Link" },
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="border-border sm:max-w-[400px] w-[88vw] rounded-3xl overflow-hidden p-0">
        <div
          className="relative p-6"
          style={{ background: "linear-gradient(155deg, #0F0F1E 0%, #07070D 50%, #0D0A18 100%)" }}
        >
          <div className="absolute -top-8 -left-8 w-36 h-36 rounded-full blur-3xl pointer-events-none" style={{ background: "rgba(226,255,0,0.12)" }} />
          <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full blur-3xl pointer-events-none" style={{ background: "rgba(217,70,239,0.10)" }} />

          <DialogHeader className="relative z-10 text-center space-y-2 pb-2">
            <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 280, damping: 18 }} className="mx-auto">
              <Logo className="w-12 h-12 mx-auto sticker-shadow" />
            </motion.div>
            <DialogTitle className="font-display text-2xl uppercase tracking-tight text-center text-white">
              {tab === "login" ? "Welcome Back" : tab === "register" ? "Join the Flip" : "Magic Link"}
            </DialogTitle>
          </DialogHeader>

          {/* Tab switcher */}
          <div className="relative z-10 flex rounded-2xl bg-white/5 border border-white/8 p-1 mt-3 mb-4">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => { setTab(t.key); clearError(); }}
                className="flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all duration-200"
                style={tab === t.key ? {
                  background: "linear-gradient(135deg, rgba(226,255,0,0.2), rgba(226,255,0,0.08))",
                  color: "#E2FF00",
                  border: "1px solid rgba(226,255,0,0.3)",
                  boxShadow: "0 0 12px rgba(226,255,0,0.15)",
                } : { color: "rgba(255,255,255,0.4)" }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Google button — hide on magic tab */}
          <AnimatePresence>
            {tab !== "magic" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                <motion.button
                  onClick={handleGoogle}
                  disabled={googleLoading || loading}
                  whileHover={{ scale: googleNotEnabled ? 1 : 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative z-10 w-full flex items-center justify-center gap-2.5 rounded-2xl border py-3 text-sm font-bold transition-all mb-3"
                  style={googleNotEnabled ? {
                    borderColor: "rgba(239,68,68,0.3)",
                    background: "rgba(239,68,68,0.08)",
                    color: "rgba(255,255,255,0.4)",
                    cursor: "not-allowed",
                  } : {
                    borderColor: "rgba(255,255,255,0.12)",
                    background: "rgba(255,255,255,0.06)",
                    color: "white",
                  }}
                >
                  {googleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleIcon />}
                  {googleLoading
                    ? "Redirecting to Google…"
                    : googleNotEnabled
                    ? "Google belum diaktifkan"
                    : "Continue with Google"}
                </motion.button>

                {/* Google not enabled banner */}
                <AnimatePresence>
                  {googleNotEnabled && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-3 flex items-start gap-2 rounded-xl px-3 py-2.5 text-xs text-amber-400"
                      style={{ background: "rgba(251,191,36,0.10)", border: "1px solid rgba(251,191,36,0.25)" }}
                    >
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <div>
                        Google OAuth belum diaktifkan di Supabase.{" "}
                        <button
                          type="button"
                          onClick={() => { setTab("magic"); clearError(); }}
                          className="font-bold underline text-primary"
                        >
                          Pakai Magic Link
                        </button>{" "}
                        untuk login tanpa password.
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="relative z-10 flex items-center gap-3 mb-3">
                  <div className="flex-1 h-px bg-white/8" />
                  <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">or</span>
                  <div className="flex-1 h-px bg-white/8" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Magic link sent state */}
          <AnimatePresence>
            {magicLinkSent && tab === "magic" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 flex flex-col items-center gap-3 py-6 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 280, damping: 16, delay: 0.1 }}
                >
                  <CheckCircle2 className="w-12 h-12" style={{ color: "#E2FF00", filter: "drop-shadow(0 0 12px rgba(226,255,0,0.6))" }} />
                </motion.div>
                <p className="font-display font-black text-lg text-white uppercase">Cek inbox kamu!</p>
                <p className="text-sm text-zinc-400">Magic link dikirim ke <span className="text-white font-semibold">{email}</span>. Klik link itu untuk langsung masuk.</p>
                <button onClick={() => { clearError(); setEmail(""); }} className="text-xs text-primary/70 font-bold hover:text-primary transition-colors mt-1">
                  Ganti email
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          {(!magicLinkSent || tab !== "magic") && (
            <form onSubmit={handleSubmit} className="relative z-10 flex flex-col gap-2.5">
              <AnimatePresence>
                {tab === "register" && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <Input placeholder="Display name" value={name} onChange={(e) => setName(e.target.value)}
                        className="pl-10 bg-white/5 border-white/10 rounded-xl h-12 text-sm" maxLength={20} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 rounded-xl h-12 text-sm" required />
              </div>

              <AnimatePresence>
                {tab !== "magic" && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 bg-white/5 border-white/10 rounded-xl h-12 text-sm" required={tab !== "magic"} minLength={6} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {tab === "magic" && (
                <p className="text-[10px] text-zinc-500 text-center px-2">
                  Tanpa password — kami kirim link login ke email kamu via Resend. Tidak ada rate limit.
                </p>
              )}

              <AnimatePresence>
                {authError && !googleNotEnabled && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold text-red-400"
                    style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)" }}>
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {authError}
                    {(authError.includes("Magic Link") || authError.includes("coba Magic Link")) && (
                      <button type="button" onClick={() => { setTab("magic"); clearError(); }}
                        className="ml-auto text-primary font-bold underline text-[10px] shrink-0">Pindah</button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                <Button type="submit" disabled={loading || googleLoading}
                  className="w-full h-12 font-display font-bold text-sm uppercase bg-primary text-black hover:bg-primary/90 rounded-2xl"
                  style={{ boxShadow: "0 4px 24px rgba(226,255,0,0.4)" }}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> :
                    tab === "login" ? "Sign In →" :
                    tab === "register" ? "Buat Akun →" :
                    <><Sparkles className="w-4 h-4 mr-1" />Kirim Magic Link</>}
                </Button>
              </motion.div>
            </form>
          )}

          {tab !== "magic" && (
            <p className="relative z-10 text-center text-[10px] text-zinc-600 mt-3">
              {tab === "login" ? "Tidak ingat password? " : "Sudah punya akun? "}
              <button
                onClick={() => { setTab(tab === "login" ? "magic" : "login"); clearError(); }}
                className="text-primary/80 font-bold hover:text-primary transition-colors"
              >
                {tab === "login" ? "Pakai Magic Link" : "Sign In"}
              </button>
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

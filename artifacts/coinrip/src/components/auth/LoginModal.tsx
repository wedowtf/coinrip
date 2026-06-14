import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/Logo";
import { useAuth } from "@/hooks/use-auth";
import { Mail, Lock, User, AlertCircle, Loader2 } from "lucide-react";

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

export function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const { signInEmail, signUpEmail, signInGoogle, authError, clearError } = useAuth();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const resetForm = () => {
    setEmail(""); setPassword(""); setName(""); clearError();
  };

  const handleClose = (v: boolean) => {
    if (!v) resetForm();
    onOpenChange(v);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (tab === "login") {
        await signInEmail(email, password);
      } else {
        await signUpEmail(email, password, name);
      }
      handleClose(false);
    } catch {
      // error handled in hook
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await signInGoogle();
      handleClose(false);
    } catch {
      // error handled in hook
    } finally {
      setGoogleLoading(false);
    }
  };

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
              {tab === "login" ? "Welcome Back" : "Join the Flip"}
            </DialogTitle>
          </DialogHeader>

          {/* Tab switcher */}
          <div className="relative z-10 flex rounded-2xl bg-white/5 border border-white/8 p-1 mt-3 mb-4">
            {(["login", "register"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); clearError(); }}
                className="flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-200"
                style={tab === t ? {
                  background: "linear-gradient(135deg, rgba(226,255,0,0.2), rgba(226,255,0,0.08))",
                  color: "#E2FF00",
                  border: "1px solid rgba(226,255,0,0.3)",
                  boxShadow: "0 0 12px rgba(226,255,0,0.15)",
                } : { color: "rgba(255,255,255,0.4)" }}
              >
                {t === "login" ? "Masuk" : "Daftar"}
              </button>
            ))}
          </div>

          {/* Google button */}
          <motion.button
            onClick={handleGoogle}
            disabled={googleLoading || loading}
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
            className="relative z-10 w-full flex items-center justify-center gap-2.5 rounded-2xl border border-white/12 bg-white/6 py-3 text-sm font-bold text-white transition-all hover:bg-white/10 hover:border-white/20 mb-3"
          >
            {googleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleIcon />}
            Lanjutkan dengan Google
          </motion.button>

          <div className="relative z-10 flex items-center gap-3 mb-3">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">atau</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          <form onSubmit={handleSubmit} className="relative z-10 flex flex-col gap-2.5">
            <AnimatePresence>
              {tab === "register" && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <Input
                      placeholder="Nama tampilan"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10 bg-white/5 border-white/10 rounded-xl h-12 text-sm"
                      maxLength={20}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 rounded-xl h-12 text-sm"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 rounded-xl h-12 text-sm"
                required
                minLength={6}
              />
            </div>

            <AnimatePresence>
              {authError && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold text-red-400"
                  style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)" }}>
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {authError}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full h-12 font-display font-bold text-sm uppercase bg-primary text-black hover:bg-primary/90 rounded-2xl"
                style={{ boxShadow: "0 4px 24px rgba(226,255,0,0.4)" }}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : tab === "login" ? "Masuk →" : "Buat Akun →"}
              </Button>
            </motion.div>
          </form>

          <p className="relative z-10 text-center text-[10px] text-zinc-600 mt-3">
            {tab === "login" ? "Belum punya akun? " : "Sudah punya akun? "}
            <button
              onClick={() => { setTab(tab === "login" ? "register" : "login"); clearError(); }}
              className="text-primary/80 font-bold hover:text-primary transition-colors"
            >
              {tab === "login" ? "Daftar sekarang" : "Masuk"}
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

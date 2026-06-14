import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/Logo";
import { useAuth } from "@/hooks/use-auth";
import { Mail, AlertCircle, Loader2, Sparkles, CheckCircle2 } from "lucide-react";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const { signInMagicLink, authError, magicLinkSent, clearError } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const resetForm = () => { setEmail(""); clearError(); };
  const handleClose = (v: boolean) => { if (!v) resetForm(); onOpenChange(v); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInMagicLink(email);
    } catch {
      // error handled in hook
    } finally {
      setLoading(false);
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

          <DialogHeader className="relative z-10 text-center space-y-2 pb-4">
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 280, damping: 18 }}
              className="mx-auto"
            >
              <Logo className="w-12 h-12 mx-auto sticker-shadow" />
            </motion.div>
            <DialogTitle className="font-display text-2xl uppercase tracking-tight text-center text-white">
              Sign In
            </DialogTitle>
            <p className="text-xs text-zinc-500">Enter your email — we'll send a login link instantly.</p>
          </DialogHeader>

          {/* Magic link sent state */}
          <AnimatePresence>
            {magicLinkSent && (
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
                <p className="font-display font-black text-lg text-white uppercase">Check your inbox!</p>
                <p className="text-sm text-zinc-400">
                  Magic link sent to <span className="text-white font-semibold">{email}</span>. Click the link to sign in instantly.
                </p>
                <button
                  onClick={() => { clearError(); setEmail(""); }}
                  className="text-xs text-primary/70 font-bold hover:text-primary transition-colors mt-1"
                >
                  Use a different email
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          {!magicLinkSent && (
            <form onSubmit={handleSubmit} className="relative z-10 flex flex-col gap-2.5">
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 rounded-xl h-12 text-sm"
                  required
                />
              </div>

              <p className="text-[10px] text-zinc-500 text-center px-2">
                No password needed — we'll email you a magic link to sign in.
              </p>

              <AnimatePresence>
                {authError && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold text-red-400"
                    style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)" }}
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {authError}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 font-display font-bold text-sm uppercase bg-primary text-black hover:bg-primary/90 rounded-2xl"
                  style={{ boxShadow: "0 4px 24px rgba(226,255,0,0.4)" }}
                >
                  {loading
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <><Sparkles className="w-4 h-4 mr-1" />Send Magic Link</>
                  }
                </Button>
              </motion.div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/Logo";
import { useAuth } from "@/hooks/use-auth";
import { useGameState } from "@/hooks/use-game-state";
import { Loader2, Sparkles, CheckCircle2, AtSign } from "lucide-react";

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

function hint(val: string): string | null {
  if (!val) return null;
  if (val.length < 3) return "At least 3 characters";
  if (val.length > 20) return "Max 20 characters";
  if (!/^[a-zA-Z0-9_]+$/.test(val)) return "Letters, numbers and underscores only";
  return null;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode?: "setup" | "change";
  initialValue?: string;
}

export function UsernameSetupModal({ open, onOpenChange, mode = "setup", initialValue = "" }: Props) {
  const { setDisplayName } = useAuth();
  const { updateUsername } = useGameState();
  const [value, setValue] = useState(initialValue);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const err = hint(value);
  const isValid = USERNAME_RE.test(value);
  const isChange = mode === "change";

  // Reset state when modal opens
  const handleOpenChange = (v: boolean) => {
    if (!loading && !done) {
      if (v) { setValue(initialValue); setDone(false); setError(null); }
      onOpenChange(v);
    }
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || loading) return;
    setLoading(true);
    setError(null);
    try {
      await setDisplayName(value.trim());
      await updateUsername(value.trim());
      setDone(true);
      setTimeout(() => { onOpenChange(false); setDone(false); }, 1200);
    } catch (err) {
      setError((err as Error).message ?? "Failed to save. Try again.");
    } finally {
      setLoading(false);
    }
  }, [isValid, loading, value, setDisplayName, updateUsername, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="border-border sm:max-w-[400px] w-[88vw] rounded-3xl overflow-hidden p-0">
        <div
          className="relative p-6"
          style={{ background: "linear-gradient(155deg, #0F0F1E 0%, #07070D 55%, #0D0A18 100%)" }}
        >
          <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full blur-3xl pointer-events-none"
            style={{ background: "rgba(226,255,0,0.10)" }} />
          <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full blur-3xl pointer-events-none"
            style={{ background: "rgba(217,70,239,0.08)" }} />

          {/* Done */}
          <AnimatePresence>
            {done && (
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 flex flex-col items-center gap-3 py-8 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                >
                  <CheckCircle2
                    className="w-14 h-14"
                    style={{ color: "#E2FF00", filter: "drop-shadow(0 0 14px rgba(226,255,0,0.7))" }}
                  />
                </motion.div>
                <p className="font-display font-black text-xl text-white uppercase">
                  {isChange ? "Name Updated!" : `Welcome, ${value}!`}
                </p>
                <p className="text-sm text-zinc-400">
                  {isChange
                    ? `Your new name "${value}" is live on the leaderboard.`
                    : "Your name is saved. You're on the leaderboard!"}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          {!done && (
            <div className="relative z-10 flex flex-col gap-5">
              <div className="flex flex-col items-center gap-2 text-center">
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 280, damping: 18 }}
                >
                  <Logo className="w-11 h-11 mx-auto sticker-shadow" />
                </motion.div>
                <div>
                  <h2 className="font-display font-black text-2xl uppercase tracking-tight text-white">
                    {isChange ? "Change Username" : "Pick Your Name"}
                  </h2>
                  <p className="text-xs text-zinc-500 mt-1">
                    {isChange
                      ? "Your new name will show on the leaderboard immediately."
                      : "This appears on the leaderboard — choose wisely."}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <div className="relative">
                  <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <Input
                    type="text"
                    placeholder="your_username"
                    value={value}
                    onChange={e => { setValue(e.target.value.replace(/\s/g, "_")); setError(null); }}
                    className="pl-10 bg-white/5 border-white/10 rounded-xl h-12 text-sm font-mono"
                    maxLength={20}
                    autoFocus
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                  />
                  {value.length > 0 && (
                    <span
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-mono"
                      style={{ color: value.length > 18 ? "#F97316" : "rgba(255,255,255,0.25)" }}
                    >
                      {value.length}/20
                    </span>
                  )}
                </div>

                <AnimatePresence>
                  {(err || error) && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-xs text-red-400 font-semibold px-1"
                    >
                      {error ?? err}
                    </motion.p>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {isValid && !err && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-1.5 text-xs px-1"
                      style={{ color: "#E2FF00" }}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span className="font-bold">Looks good!</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <p className="text-[10px] text-zinc-600 text-center">
                  3–20 characters · letters, numbers, underscores
                </p>

                <div className="flex gap-2.5">
                  {isChange && (
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 h-12 rounded-2xl border-white/10 text-zinc-400"
                      onClick={() => onOpenChange(false)}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  )}
                  <motion.div
                    className={isChange ? "flex-1" : "w-full"}
                    whileHover={{ scale: isValid ? 1.01 : 1 }}
                    whileTap={{ scale: isValid ? 0.98 : 1 }}
                  >
                    <Button
                      type="submit"
                      disabled={!isValid || loading}
                      className="w-full h-12 font-display font-bold text-sm uppercase rounded-2xl"
                      style={{
                        background: isValid ? "linear-gradient(135deg, #E2FF00, #CCE600)" : "rgba(255,255,255,0.06)",
                        color: isValid ? "#000" : "rgba(255,255,255,0.25)",
                        boxShadow: isValid ? "0 4px 24px rgba(226,255,0,0.4)" : "none",
                        border: isValid ? "none" : "1px solid rgba(255,255,255,0.08)",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {loading
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : isChange
                          ? <><Sparkles className="w-4 h-4 mr-1.5" />Save Name</>
                          : <><Sparkles className="w-4 h-4 mr-1.5" />Set My Name</>
                      }
                    </Button>
                  </motion.div>
                </div>
              </form>

              <AnimatePresence>
                {isValid && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="rounded-xl px-4 py-3 flex items-center gap-3"
                    style={{
                      background: "rgba(226,255,0,0.05)",
                      border: "1px solid rgba(226,255,0,0.12)",
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                      style={{
                        background: "linear-gradient(135deg, rgba(226,255,0,0.25), rgba(226,255,0,0.08))",
                        border: "1.5px solid rgba(226,255,0,0.4)",
                      }}
                    >
                      <span className="font-display font-black text-xs uppercase" style={{ color: "#E2FF00" }}>
                        {value.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-white truncate">{value}</p>
                      <p className="text-[10px] text-zinc-500">Leaderboard preview</p>
                    </div>
                    <div className="ml-auto text-right shrink-0">
                      <p className="font-display font-black text-sm" style={{ color: "#E2FF00" }}>#{isChange ? "?" : "new"}</p>
                      <p className="text-[10px] text-zinc-600">rank</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

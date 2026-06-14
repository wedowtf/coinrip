import { useGameState } from "@/hooks/use-game-state";
import { Link, useLocation } from "wouter";
import { Logo } from "@/components/ui/Logo";
import { PackageOpen, LayoutGrid, UserCircle, Info } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export function Layout({ children }: { children: React.ReactNode }) {
  const { state, login, isLoaded } = useGameState();
  const [location] = useLocation();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loginInput, setLoginInput] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginInput.trim()) {
      login(loginInput.trim());
      setIsLoginOpen(false);
      setLoginInput("");
    }
  };

  if (!isLoaded) return <div className="min-h-[100dvh] bg-background" />;

  const navItems = [
    { href: '/', icon: <PackageOpen className="w-5 h-5" />, label: 'Packs' },
    { href: '/collection', icon: <LayoutGrid className="w-5 h-5" />, label: 'Vault' },
    { href: '/about', icon: <Info className="w-5 h-5" />, label: 'About' },
  ];

  return (
    <div className="min-h-[100dvh] bg-background text-foreground pb-20 flex flex-col max-w-md mx-auto relative overflow-hidden border-x border-border shadow-2xl">

      {/* ─── Top Nav ─── */}
      <header
        className="flex items-center justify-between px-4 py-3 z-10 sticky top-0 scanline-overlay"
        style={{
          background: 'rgba(7,7,13,0.95)',
          backdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 1px 0 rgba(226,255,0,0.08), 0 4px 32px rgba(0,0,0,0.5)',
        }}
      >
        {/* Animated accent line on bottom of header */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(226,255,0,0.4) 30%, rgba(217,70,239,0.3) 70%, transparent)',
          }}
        />

        <Link href="/" className="flex items-center gap-2 group">
          <motion.div
            whileHover={{ rotate: [0, -8, 8, 0], scale: 1.08 }}
            transition={{ duration: 0.4 }}
          >
            <Logo className="w-8 h-8 sticker-shadow" />
          </motion.div>
          <span
            className="font-display font-black text-xl tracking-tight"
            style={{ textShadow: '0 0 20px rgba(226,255,0,0.3)' }}
          >
            CoinFlip
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {state.username ? (
            <Link href="/profile" className="flex items-center gap-2 active:scale-95 transition-transform">
              <motion.div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(226,255,0,0.14), rgba(226,255,0,0.06))',
                  border: '1px solid rgba(226,255,0,0.28)',
                  boxShadow: '0 0 18px rgba(226,255,0,0.14)',
                }}
                whileHover={{ boxShadow: '0 0 28px rgba(226,255,0,0.3)' }}
              >
                <motion.span
                  className="font-mono font-black text-sm"
                  style={{ color: '#E2FF00', textShadow: '0 0 10px rgba(226,255,0,0.8)' }}
                  animate={{ textShadow: ['0 0 6px rgba(226,255,0,0.5)', '0 0 16px rgba(226,255,0,0.95)', '0 0 6px rgba(226,255,0,0.5)'] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {state.coinBalance}
                </motion.span>
                <span className="text-[10px] font-black text-zinc-500">🪙</span>
              </motion.div>
              <motion.div
                className="w-8 h-8 rounded-full flex items-center justify-center border-2 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(226,255,0,0.25), rgba(226,255,0,0.08))',
                  borderColor: 'rgba(226,255,0,0.55)',
                }}
                animate={{ boxShadow: ['0 0 0px rgba(226,255,0,0)', '0 0 14px rgba(226,255,0,0.5)', '0 0 0px rgba(226,255,0,0)'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <span className="font-display font-black text-xs text-primary uppercase">
                  {state.username.charAt(0)}
                </span>
              </motion.div>
            </Link>
          ) : (
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLoginOpen(true)}
                className="font-bold uppercase tracking-wide bg-primary text-black hover:bg-primary/90 border-primary h-8 px-4 text-xs"
                style={{ boxShadow: '0 0 16px rgba(226,255,0,0.35)' }}
              >
                Login
              </Button>
            </motion.div>
          )}
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

      {/* ─── Bottom Nav ─── */}
      <nav
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md flex items-center justify-around py-2 px-2 z-50"
        style={{
          background: 'rgba(5,5,10,0.92)',
          backdropFilter: 'blur(28px)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 -4px 40px rgba(0,0,0,0.7), 0 -1px 0 rgba(226,255,0,0.06)',
        }}
      >
        {/* Top accent line on nav */}
        <div
          className="absolute top-0 left-8 right-8 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(226,255,0,0.25), transparent)' }}
        />

        {navItems.map(item => {
          const active = location === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all duration-200 relative ${active ? 'text-primary' : 'text-muted-foreground hover:text-zinc-300'}`}
            >
              {active && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: 'linear-gradient(135deg, rgba(226,255,0,0.14), rgba(226,255,0,0.06))' }}
                  transition={{ type: 'spring', duration: 0.35 }}
                />
              )}
              {active && (
                <motion.div
                  layoutId="nav-dot"
                  className="absolute -top-px left-1/2 -translate-x-1/2 w-6 h-px rounded-full"
                  style={{ background: '#E2FF00', boxShadow: '0 0 8px rgba(226,255,0,0.8)' }}
                  transition={{ type: 'spring', duration: 0.35 }}
                />
              )}
              <motion.div
                animate={active ? { scale: [1, 1.15, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {item.icon}
              </motion.div>
              <span className="text-[9px] font-black uppercase tracking-wider">{item.label}</span>
            </Link>
          );
        })}

        {state.username ? (
          <Link
            href="/profile"
            className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all duration-200 relative ${location === '/profile' ? 'text-primary' : 'text-muted-foreground hover:text-zinc-300'}`}
          >
            {location === '/profile' && (
              <>
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: 'linear-gradient(135deg, rgba(226,255,0,0.14), rgba(226,255,0,0.06))' }}
                  transition={{ type: 'spring', duration: 0.35 }}
                />
                <motion.div
                  layoutId="nav-dot"
                  className="absolute -top-px left-1/2 -translate-x-1/2 w-6 h-px rounded-full"
                  style={{ background: '#E2FF00', boxShadow: '0 0 8px rgba(226,255,0,0.8)' }}
                  transition={{ type: 'spring', duration: 0.35 }}
                />
              </>
            )}
            <motion.div
              className="w-5 h-5 rounded-full flex items-center justify-center"
              style={{
                background: location === '/profile'
                  ? 'linear-gradient(135deg, rgba(226,255,0,0.35), rgba(226,255,0,0.15))'
                  : 'rgba(226,255,0,0.12)',
                border: '1.5px solid rgba(226,255,0,0.35)',
              }}
            >
              <span className="font-display font-black text-[9px] text-primary uppercase">
                {state.username.charAt(0)}
              </span>
            </motion.div>
            <span className="text-[9px] font-black uppercase tracking-wider">
              {state.username.slice(0, 6)}
            </span>
          </Link>
        ) : (
          <button
            onClick={() => setIsLoginOpen(true)}
            className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl text-muted-foreground hover:text-primary transition-colors"
          >
            <UserCircle className="w-5 h-5" />
            <span className="text-[9px] font-black uppercase tracking-wider">Login</span>
          </button>
        )}
      </nav>

      {/* ─── Login Modal ─── */}
      <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
        <DialogContent className="border-border sm:max-w-[400px] w-[88vw] rounded-3xl overflow-hidden p-0">
          {/* Modal background with aurora */}
          <div
            className="relative p-6"
            style={{
              background: 'linear-gradient(155deg, #0F0F1E 0%, #07070D 50%, #0D0A18 100%)',
            }}
          >
            {/* Background glow orbs */}
            <div className="absolute -top-8 -left-8 w-36 h-36 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(226,255,0,0.12)' }} />
            <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(217,70,239,0.1)' }} />
            <div className="absolute inset-0 bg-dot opacity-40 pointer-events-none" />

            <DialogHeader className="relative z-10 text-center space-y-2 pb-2">
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 280, damping: 18 }}
                className="mx-auto"
              >
                <Logo className="w-14 h-14 mx-auto sticker-shadow" />
              </motion.div>
              <DialogTitle className="font-display text-2xl uppercase tracking-tight text-center text-white">
                Enter the Flip
              </DialogTitle>
              <p className="text-xs text-muted-foreground text-center">Pick a username — no signup needed</p>
            </DialogHeader>

            <form onSubmit={handleLogin} className="flex flex-col gap-3 mt-4 relative z-10">
              <Input
                placeholder="your_username"
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                className="bg-input border-border text-center font-bold text-lg h-14 tracking-wide rounded-2xl focus:border-primary/50 focus:ring-primary/20 transition-all"
                style={{ boxShadow: loginInput ? '0 0 0 1px rgba(226,255,0,0.3), 0 0 20px rgba(226,255,0,0.1)' : undefined }}
                autoFocus
                maxLength={20}
              />

              <div className="grid grid-cols-3 gap-2 text-center text-[10px] text-muted-foreground">
                {[
                  { top: 'Free', sub: 'Daily flip' },
                  { top: '+2', sub: 'Per flip' },
                  { top: '50', sub: 'Welcome' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 + 0.1 }}
                    className="rounded-xl py-2 px-2 border border-border/60"
                    style={{ background: 'rgba(255,255,255,0.03)' }}
                  >
                    <div className="font-black text-white text-sm">{item.top}</div>
                    <div>{item.sub}</div>
                  </motion.div>
                ))}
              </div>

              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  className="w-full h-13 font-display font-bold text-base uppercase bg-primary text-black hover:bg-primary/90 active:scale-95 transition-transform rounded-2xl"
                  style={{ boxShadow: '0 4px 24px rgba(226,255,0,0.4), 0 0 50px rgba(226,255,0,0.15)' }}
                >
                  Start Flipping →
                </Button>
              </motion.div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

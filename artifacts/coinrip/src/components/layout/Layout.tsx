import { useGameState } from "@/hooks/use-game-state";
import { Link, useLocation } from "wouter";
import { Logo } from "@/components/ui/Logo";
import { PackageOpen, LayoutGrid, UserCircle, Info } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

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
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-background/95 backdrop-blur z-10 sticky top-0">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="w-8 h-8 sticker-shadow" />
          <span className="font-display font-black text-xl tracking-tight">CoinRip</span>
        </Link>

        <div className="flex items-center gap-2">
          {state.username ? (
            <Link href="/profile" className="flex items-center gap-2 active:scale-95 transition-transform">
              <div className="flex items-center gap-2 bg-secondary/50 px-2.5 py-1.5 rounded-full border border-border">
                <span className="font-mono text-primary font-bold text-xs">{state.coinBalance}</span>
                <span className="text-[9px] text-muted-foreground font-bold">COINS</span>
              </div>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-primary/40 bg-primary/15"
              >
                <span className="font-display font-black text-xs text-primary uppercase">
                  {state.username.charAt(0)}
                </span>
              </div>
            </Link>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLoginOpen(true)}
              className="font-bold uppercase tracking-wide bg-primary text-black hover:bg-primary/90 border-primary h-8 px-4 text-xs"
            >
              Login
            </Button>
          )}
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

      {/* ─── Bottom Nav ─── */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-background/96 backdrop-blur border-t border-border flex items-center justify-around py-2 px-2 z-50">
        {navItems.map(item => {
          const active = location === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors relative ${active ? 'text-primary' : 'text-muted-foreground'}`}
            >
              {active && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 bg-primary/10 rounded-xl"
                  transition={{ type: 'spring', duration: 0.3 }}
                />
              )}
              {item.icon}
              <span className="text-[9px] font-black uppercase tracking-wider">{item.label}</span>
            </Link>
          );
        })}

        {/* Profile / Login tab */}
        {state.username ? (
          <Link
            href="/profile"
            className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors relative ${location === '/profile' ? 'text-primary' : 'text-muted-foreground'}`}
          >
            {location === '/profile' && (
              <motion.div
                layoutId="nav-indicator"
                className="absolute inset-0 bg-primary/10 rounded-xl"
                transition={{ type: 'spring', duration: 0.3 }}
              />
            )}
            <div className="w-5 h-5 rounded-full bg-primary/25 flex items-center justify-center">
              <span className="font-display font-black text-[9px] text-primary uppercase">
                {state.username.charAt(0)}
              </span>
            </div>
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
        <DialogContent className="bg-card border-border sm:max-w-[400px] w-[85vw] rounded-2xl">
          <DialogHeader>
            <Logo className="w-12 h-12 mx-auto mb-1 sticker-shadow" />
            <DialogTitle className="font-display text-2xl uppercase tracking-tight text-center">
              Enter the Rip
            </DialogTitle>
            <p className="text-xs text-muted-foreground text-center">Pick a username — no signup needed</p>
          </DialogHeader>
          <form onSubmit={handleLogin} className="flex flex-col gap-3 mt-1">
            <Input
              placeholder="your_username"
              value={loginInput}
              onChange={(e) => setLoginInput(e.target.value)}
              className="bg-input border-border text-center font-bold text-lg h-14 tracking-wide"
              autoFocus
              maxLength={20}
            />
            <div className="grid grid-cols-3 gap-2 text-center text-[10px] text-muted-foreground">
              <div className="bg-secondary/40 rounded-lg py-1.5 px-2">
                <div className="font-black text-white text-xs">Free</div>
                Daily rip
              </div>
              <div className="bg-secondary/40 rounded-lg py-1.5 px-2">
                <div className="font-black text-white text-xs">+2</div>
                Per rip
              </div>
              <div className="bg-secondary/40 rounded-lg py-1.5 px-2">
                <div className="font-black text-white text-xs">20</div>
                Coins
              </div>
            </div>
            <Button
              type="submit"
              className="w-full h-12 font-display font-bold text-base uppercase bg-primary text-black hover:bg-primary/90 active:scale-95 transition-transform"
            >
              Start Ripping →
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

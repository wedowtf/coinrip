import { useGameState } from "@/hooks/use-game-state";
import { Link, useLocation } from "wouter";
import { Logo } from "@/components/ui/Logo";
import { Coins, PackageOpen, LayoutGrid, UserCircle, Info } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function Layout({ children }: { children: React.ReactNode }) {
  const { state, login, logout, isLoaded } = useGameState();
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

  if (!isLoaded) return <div className="min-h-[100dvh] bg-background text-foreground" />;

  return (
    <div className="min-h-[100dvh] bg-background text-foreground pb-20 flex flex-col max-w-md mx-auto relative overflow-hidden border-x border-border shadow-2xl">
      {/* Top Nav */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-background/95 backdrop-blur z-10 sticky top-0">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="w-8 h-8 sticker-shadow" />
          <span className="font-display font-black text-xl tracking-tight">CoinRip</span>
        </Link>
        <div className="flex items-center gap-3">
          {state.username ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-full border border-border">
                <Coins className="w-3.5 h-3.5 text-primary" />
                <span className="font-mono text-primary font-bold text-sm">{state.coinBalance}</span>
              </div>
              <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                <span className="font-display font-black text-[11px] text-primary uppercase">
                  {state.username.charAt(0)}
                </span>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLoginOpen(true)}
              className="font-bold uppercase tracking-wide bg-primary text-black hover:bg-primary/90 h-8 px-3 text-xs"
            >
              Login
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 w-full max-w-md mx-auto bg-background/95 backdrop-blur border-t border-border flex items-center justify-around py-2 px-4 z-50">
        <Link href="/" className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-colors ${location === '/' ? 'text-primary' : 'text-muted-foreground'}`}>
          <PackageOpen className="w-5 h-5" />
          <span className="text-[9px] font-black uppercase tracking-wider">Packs</span>
        </Link>
        <Link href="/collection" className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-colors ${location === '/collection' ? 'text-primary' : 'text-muted-foreground'}`}>
          <LayoutGrid className="w-5 h-5" />
          <span className="text-[9px] font-black uppercase tracking-wider">Vault</span>
        </Link>
        <Link href="/about" className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-colors ${location === '/about' ? 'text-primary' : 'text-muted-foreground'}`}>
          <Info className="w-5 h-5" />
          <span className="text-[9px] font-black uppercase tracking-wider">About</span>
        </Link>
        {state.username ? (
          <button onClick={logout} className="flex flex-col items-center gap-1 px-3 py-1 rounded-xl text-muted-foreground hover:text-destructive transition-colors">
            <UserCircle className="w-5 h-5" />
            <span className="text-[9px] font-black uppercase tracking-wider">{state.username.slice(0, 6)}</span>
          </button>
        ) : (
          <button onClick={() => setIsLoginOpen(true)} className="flex flex-col items-center gap-1 px-3 py-1 rounded-xl text-muted-foreground hover:text-primary transition-colors">
            <UserCircle className="w-5 h-5" />
            <span className="text-[9px] font-black uppercase tracking-wider">Login</span>
          </button>
        )}
      </nav>

      {/* Login Modal */}
      <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
        <DialogContent className="bg-card border-border sm:max-w-[425px] w-[85vw] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl uppercase tracking-tight text-center mb-1">Enter the Rip</DialogTitle>
            <p className="text-xs text-muted-foreground text-center">Pick a username — no signup needed</p>
          </DialogHeader>
          <form onSubmit={handleLogin} className="flex flex-col gap-3 mt-2">
            <Input
              placeholder="Your username"
              value={loginInput}
              onChange={(e) => setLoginInput(e.target.value)}
              className="bg-input border-border text-center font-bold text-lg h-14"
              autoFocus
              maxLength={20}
            />
            <Button type="submit" className="w-full h-12 font-display font-bold text-lg uppercase bg-primary text-black hover:bg-primary/90 active:scale-95 transition-transform">
              Start Ripping
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useGameState } from "@/hooks/use-game-state";
import { Link, useLocation } from "wouter";
import { Logo } from "@/components/ui/Logo";
import { Coins, PackageOpen, LayoutGrid, UserCircle } from "lucide-react";
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
      <header className="flex items-center justify-between p-4 border-b border-border bg-background/95 backdrop-blur z-10 sticky top-0">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="w-8 h-8 sticker-shadow" />
          <span className="font-display font-bold text-xl tracking-tight">CoinRip</span>
        </Link>
        <div className="flex items-center gap-4">
          {state.username ? (
            <div className="flex items-center gap-3 bg-secondary/50 px-3 py-1.5 rounded-full border border-border">
              <span className="font-mono text-primary font-bold text-sm flex items-center gap-1">
                <Coins className="w-4 h-4" /> {state.coinBalance}
              </span>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setIsLoginOpen(true)} className="font-bold uppercase tracking-wide bg-primary text-black hover:bg-primary/90">
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
      <nav className="fixed bottom-0 w-full max-w-md mx-auto bg-background/95 backdrop-blur border-t border-border flex items-center justify-around p-3 z-50">
        <Link href="/" className={`flex flex-col items-center gap-1 ${location === '/' ? 'text-primary' : 'text-muted-foreground'} active:scale-95 transition-transform`}>
          <PackageOpen className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Packs</span>
        </Link>
        <Link href="/collection" className={`flex flex-col items-center gap-1 ${location === '/collection' ? 'text-primary' : 'text-muted-foreground'} active:scale-95 transition-transform`}>
          <LayoutGrid className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Collection</span>
        </Link>
        {state.username ? (
          <button onClick={logout} className="flex flex-col items-center gap-1 text-muted-foreground hover:text-destructive active:scale-95 transition-transform">
            <UserCircle className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Logout</span>
          </button>
        ) : (
          <button onClick={() => setIsLoginOpen(true)} className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary active:scale-95 transition-transform">
            <UserCircle className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Login</span>
          </button>
        )}
      </nav>

      {/* Login Modal */}
      <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
        <DialogContent className="bg-card border-border sm:max-w-[425px] w-[90vw] rounded-xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl uppercase tracking-tight text-center mb-4">Enter the Rip</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <Input 
              placeholder="Username" 
              value={loginInput}
              onChange={(e) => setLoginInput(e.target.value)}
              className="bg-input border-border text-center font-bold text-lg h-14"
              autoFocus
            />
            <Button type="submit" className="w-full h-14 font-display font-bold text-xl uppercase bg-primary text-black hover:bg-primary/90 active:scale-95 transition-transform">
              Start Ripping
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
import { useGameState } from "@/hooks/use-game-state";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Package } from "lucide-react";

export default function Home() {
  const { state, canRipFree, payForRip } = useGameState();
  const [, setLocation] = useLocation();

  const handleRipFree = () => {
    if (!state.username) return;
    if (canRipFree()) {
      setLocation("/rip?type=free");
    }
  };

  const handleRipMystery = () => {
    if (!state.username) return;
    if (payForRip(10)) {
      setLocation("/rip?type=mystery");
    } else {
      alert("Not enough coins! You need 10 COINS.");
    }
  };

  return (
    <div className="p-6 flex flex-col gap-8">
      <div className="text-center space-y-2 mt-4">
        <h1 className="text-4xl font-display font-extrabold uppercase italic tracking-tighter text-primary sticker-shadow">CoinRip</h1>
        <p className="text-sm text-muted-foreground font-medium">Rip packs. Collect real ecosystem coins. Redeem later.</p>
      </div>

      <div className="flex flex-col gap-6">
        <h2 className="font-display text-xl font-bold uppercase tracking-wide border-b border-border pb-2">Available Packs</h2>
        
        <div className="flex overflow-x-auto gap-4 pb-6 -mx-6 px-6 snap-x snap-mandatory">
          {/* Free Pack */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className={`snap-center shrink-0 w-[280px] rounded-2xl border-2 p-6 flex flex-col items-center justify-between gap-6 relative overflow-hidden bg-card ${state.username && canRipFree() ? 'border-primary shadow-[0_0_15px_rgba(226,255,0,0.3)]' : 'border-border opacity-70'}`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
            <h3 className="font-display text-2xl font-bold uppercase z-10 text-center">Free Daily<br/>Pack</h3>
            <div className="w-32 h-40 bg-zinc-800 rounded-lg flex items-center justify-center border border-zinc-700 sticker-shadow animate-float z-10">
              <Package className="w-16 h-16 text-zinc-500" />
            </div>
            {!state.username ? (
              <Button disabled className="w-full font-bold uppercase h-12 z-10">Log in to Rip</Button>
            ) : canRipFree() ? (
              <Button onClick={handleRipFree} className="w-full font-bold uppercase h-12 bg-primary text-black hover:bg-primary/90 active:scale-95 transition-transform z-10">
                Rip Now (Free)
              </Button>
            ) : (
              <Button disabled className="w-full font-bold uppercase h-12 z-10">Available Tomorrow</Button>
            )}
          </motion.div>

          {/* Mystery Pack */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className={`snap-center shrink-0 w-[280px] rounded-2xl border-2 p-6 flex flex-col items-center justify-between gap-6 relative overflow-hidden bg-card ${state.username && state.coinBalance >= 10 ? 'border-pulsar shadow-[0_0_15px_rgba(217,70,239,0.3)]' : 'border-border opacity-70'}`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent pointer-events-none" />
            <h3 className="font-display text-2xl font-bold uppercase z-10 text-center text-[#D946EF]">Mystery<br/>Pack</h3>
            <div className="w-32 h-40 bg-zinc-900 rounded-lg flex items-center justify-center border border-purple-500/30 sticker-shadow animate-float z-10" style={{ animationDelay: '0.5s' }}>
              <Package className="w-16 h-16 text-[#D946EF]" />
            </div>
            {!state.username ? (
              <Button disabled className="w-full font-bold uppercase h-12 z-10">Log in to Rip</Button>
            ) : (
              <Button 
                onClick={handleRipMystery} 
                disabled={state.coinBalance < 10}
                className="w-full font-bold uppercase h-12 bg-[#D946EF] text-white hover:bg-[#D946EF]/90 active:scale-95 transition-transform z-10"
              >
                Rip (10 COINS)
              </Button>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
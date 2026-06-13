import { useState, useEffect } from "react";
import { useGameState } from "@/hooks/use-game-state";
import { getRandomCoin, Coin } from "@/lib/dataset";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

export default function Rip() {
  const { state, addCoin } = useGameState();
  const [, setLocation] = useLocation();
  const [stage, setStage] = useState<'shaking' | 'tearing' | 'reveal'>('shaking');
  const [revealedCoin, setRevealedCoin] = useState<Coin | null>(null);

  useEffect(() => {
    if (!state.username) {
      setLocation("/");
      return;
    }

    // Determine coin immediately but don't show yet
    const coin = getRandomCoin();
    setRevealedCoin(coin);

    // Sequence
    const t1 = setTimeout(() => setStage('tearing'), 1500);
    const t2 = setTimeout(() => setStage('reveal'), 3000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [state.username, setLocation]);

  const handleClaim = () => {
    if (revealedCoin) {
      addCoin(revealedCoin.name);
      setLocation("/collection");
    }
  };

  if (!revealedCoin) return <div className="min-h-screen bg-background" />;

  const isSingularity = revealedCoin.tier === 'SINGULARITY';

  return (
    <div className="relative min-h-[80vh] flex flex-col items-center justify-center p-6 overflow-hidden">
      
      <AnimatePresence>
        {stage !== 'reveal' && (
          <motion.div 
            className="absolute inset-0 flex items-center justify-center z-20"
            exit={{ opacity: 0, scale: 1.5, filter: 'brightness(2)' }}
            transition={{ duration: 0.5 }}
          >
            <div className={`w-48 h-64 bg-zinc-800 rounded-xl border border-zinc-600 sticker-shadow flex items-center justify-center ${stage === 'shaking' ? 'animate-shake' : ''}`}>
              {stage === 'tearing' && (
                <>
                  <div className="absolute inset-0 bg-zinc-800 rounded-xl animate-tear-left" style={{ clipPath: 'polygon(0 0, 50% 0, 30% 100%, 0 100%)' }} />
                  <div className="absolute inset-0 bg-zinc-800 rounded-xl animate-tear-right" style={{ clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 30% 100%)' }} />
                  <div className="absolute inset-0 bg-white animate-ping opacity-50" />
                </>
              )}
              {stage === 'shaking' && <div className="font-display font-bold text-2xl uppercase tracking-widest text-zinc-500">RIP ME</div>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {stage === 'reveal' && (
        <motion.div 
          className={`flex flex-col items-center gap-8 z-30 ${isSingularity ? 'animate-shake' : ''}`}
          initial={{ scale: 0, rotateY: 180 }}
          animate={{ scale: 1, rotateY: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          <div className={`tier-${revealedCoin.tier.toLowerCase()}`}>
            <h2 className={`font-display text-4xl font-extrabold uppercase text-center mb-8 ${isSingularity ? 'animate-pulse' : ''}`} style={{ color: 'var(--tier-color)' }}>
              {revealedCoin.tier}
            </h2>
            
            <div className="w-64 aspect-[3/4] bg-card rounded-2xl border-4 tier-glow p-6 flex flex-col items-center justify-center gap-4 sticker-shadow relative overflow-hidden">
              <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
              
              <div className="w-24 h-24 rounded-full flex items-center justify-center border-4" style={{ borderColor: 'var(--tier-color)', backgroundColor: 'var(--tier-glow)' }}>
                <span className="font-display font-bold text-4xl" style={{ color: 'var(--tier-color)' }}>{revealedCoin.name.charAt(0)}</span>
              </div>
              
              <div className="text-center z-10">
                <h3 className="font-display text-2xl font-bold text-white leading-tight">{revealedCoin.name}</h3>
                <p className="text-sm text-zinc-400 mt-2 font-medium">{revealedCoin.tagline}</p>
              </div>
              
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <span className="text-[10px] font-mono text-zinc-500 uppercase">Cap: ${(revealedCoin.marketCap / 1000).toFixed(1)}k</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full max-w-[256px]">
            <Button onClick={handleClaim} className="w-full h-14 font-display font-bold text-xl uppercase bg-primary text-black hover:bg-primary/90 active:scale-95 transition-transform">
              Add to Collection
            </Button>
            <Button variant="outline" onClick={() => setLocation("/")} className="w-full h-14 font-display font-bold uppercase active:scale-95 transition-transform">
              Back to Packs
            </Button>
          </div>
        </motion.div>
      )}

      {/* Confetti/Particles for reveal */}
      {stage === 'reveal' && isSingularity && (
        <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-500/20 via-transparent to-transparent animate-pulse" />
        </div>
      )}
    </div>
  );
}
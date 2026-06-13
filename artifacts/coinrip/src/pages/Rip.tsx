import { useState, useEffect, useRef } from "react";
import { useGameState } from "@/hooks/use-game-state";
import { getRandomCoinForPack, Coin, PackId, PACKS } from "@/lib/dataset";
import { Button } from "@/components/ui/button";
import { useLocation, useSearch } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

function CoinLogo({ coin }: { coin: Coin }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className="w-24 h-24 rounded-full flex items-center justify-center border-4 overflow-hidden relative"
      style={{ borderColor: 'var(--tier-color)', background: 'var(--tier-glow)' }}
    >
      {!imgError ? (
        <img
          src={coin.logoUrl}
          alt={coin.name}
          className="w-14 h-14 object-contain"
          onError={() => setImgError(true)}
        />
      ) : (
        <span
          className="font-display font-black text-3xl"
          style={{ color: 'var(--tier-color)' }}
        >
          {coin.name.charAt(0)}
        </span>
      )}
    </div>
  );
}

function Particle({ index }: { index: number }) {
  const angle = (index / 20) * 360;
  const dist = 80 + Math.random() * 120;
  const x = Math.cos((angle * Math.PI) / 180) * dist;
  const y = Math.sin((angle * Math.PI) / 180) * dist;
  const colors = ['#FBBF24', '#D946EF', '#06B6D4', '#E2FF00', '#F97316'];
  const color = colors[index % colors.length];

  return (
    <motion.div
      className="absolute w-2 h-2 rounded-full top-1/2 left-1/2"
      style={{ backgroundColor: color }}
      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
      animate={{ x, y, opacity: 0, scale: 0 }}
      transition={{ duration: 0.8 + Math.random() * 0.5, ease: 'easeOut', delay: Math.random() * 0.2 }}
    />
  );
}

export default function Rip() {
  const { state, addCoin, canRipFree } = useGameState();
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const packId = (params.get('pack') || 'daily') as PackId;
  const pack = PACKS.find(p => p.id === packId) ?? PACKS[0];

  const [stage, setStage] = useState<'shaking' | 'tearing' | 'reveal'>('shaking');
  const [revealedCoin, setRevealedCoin] = useState<Coin | null>(null);
  const [showParticles, setShowParticles] = useState(false);
  const claimed = useRef(false);

  useEffect(() => {
    if (!state.username) {
      setLocation("/");
      return;
    }

    const coin = getRandomCoinForPack(packId);
    setRevealedCoin(coin);

    const t1 = setTimeout(() => setStage('tearing'), 1400);
    const t2 = setTimeout(() => {
      setStage('reveal');
      setShowParticles(true);
    }, 2800);

    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [state.username, setLocation, packId]);

  const handleClaim = () => {
    if (revealedCoin && !claimed.current) {
      claimed.current = true;
      addCoin(revealedCoin.name);
      setLocation("/collection");
    }
  };

  const handleRipAgain = () => {
    if (pack.isFreeDaily) {
      setLocation("/");
    } else {
      setLocation(`/rip?pack=${packId}`);
    }
  };

  if (!revealedCoin) return <div className="min-h-screen bg-background" />;

  const isSingularity = revealedCoin.tier === 'SINGULARITY';

  return (
    <div className="relative min-h-[80vh] flex flex-col items-center justify-center p-6 overflow-hidden">
      {isSingularity && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(251,191,36,0.12),transparent_70%)] animate-pulse" />
        </div>
      )}

      <AnimatePresence>
        {stage !== 'reveal' && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center z-20"
            exit={{ opacity: 0, scale: 1.5, filter: 'brightness(3)' }}
            transition={{ duration: 0.45 }}
          >
            <div
              className={`w-44 h-60 rounded-2xl flex items-center justify-center relative overflow-hidden ${stage === 'shaking' ? 'animate-shake' : ''}`}
              style={{
                background: `linear-gradient(135deg, ${pack.shadowColor}, #12121A)`,
                border: `2px solid ${pack.color}66`,
              }}
            >
              {stage === 'tearing' && (
                <>
                  <div
                    className="absolute inset-0 rounded-2xl animate-tear-left"
                    style={{
                      background: `linear-gradient(135deg, ${pack.shadowColor}, #12121A)`,
                      clipPath: 'polygon(0 0, 55% 0, 35% 100%, 0 100%)',
                    }}
                  />
                  <div
                    className="absolute inset-0 rounded-2xl animate-tear-right"
                    style={{
                      background: `linear-gradient(135deg, ${pack.shadowColor}, #12121A)`,
                      clipPath: 'polygon(55% 0, 100% 0, 100% 100%, 35% 100%)',
                    }}
                  />
                  <div className="absolute inset-0 bg-white rounded-2xl animate-ping opacity-60" />
                </>
              )}
              {stage === 'shaking' && (
                <div className="flex flex-col items-center gap-2">
                  <span className="font-display font-black text-xl uppercase tracking-widest" style={{ color: pack.color }}>
                    {pack.name}
                  </span>
                  <span className="font-display font-bold text-sm uppercase text-zinc-500">
                    {pack.subtitle}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {stage === 'reveal' && (
        <motion.div
          className={`flex flex-col items-center gap-6 z-30 ${isSingularity ? 'animate-shake' : ''}`}
          initial={{ scale: 0, rotateY: 180, opacity: 0 }}
          animate={{ scale: 1, rotateY: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 22 }}
        >
          {/* Particle burst */}
          {showParticles && isSingularity && (
            <div className="absolute pointer-events-none z-40 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              {Array.from({ length: 20 }).map((_, i) => <Particle key={i} index={i} />)}
            </div>
          )}

          <div className={`tier-${revealedCoin.tier.toLowerCase()}`}>
            <div className="flex flex-col items-center gap-2 mb-4">
              <span
                className="text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full"
                style={{ backgroundColor: 'var(--tier-color)22', color: 'var(--tier-color)', border: '1px solid var(--tier-color)44' }}
              >
                {revealedCoin.tier}
              </span>
              {isSingularity && (
                <span className="text-xs text-yellow-400 font-bold animate-pulse">★ ULTRA RARE PULL ★</span>
              )}
            </div>

            <div
              className="w-64 aspect-[3/4] bg-card rounded-3xl border-4 tier-glow p-6 flex flex-col items-center justify-center gap-4 relative overflow-hidden"
            >
              <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />

              {isSingularity && (
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-purple-500/5 to-cyan-500/10 animate-pulse" />
              )}

              <CoinLogo coin={revealedCoin} />

              <div className="text-center z-10 space-y-1">
                <h3 className="font-display text-2xl font-black text-white leading-tight">{revealedCoin.name}</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-zinc-400">
                  {revealedCoin.category}
                </span>
                <p className="text-xs text-zinc-400 mt-2 font-medium leading-snug">{revealedCoin.tagline}</p>
              </div>

              <div className="absolute bottom-4 left-0 right-0 text-center">
                <span className="text-[9px] font-mono text-zinc-600 uppercase">
                  MCap: ${(revealedCoin.marketCap / 1000).toFixed(1)}k
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground font-medium">+2 COINS earned</p>

          <div className="flex flex-col gap-3 w-full max-w-[256px]">
            <Button
              onClick={handleClaim}
              className="w-full h-14 font-display font-bold text-lg uppercase bg-primary text-black hover:bg-primary/90 active:scale-95 transition-transform"
            >
              Add to Collection
            </Button>
            <Button
              variant="outline"
              onClick={handleRipAgain}
              className="w-full h-12 font-display font-bold uppercase active:scale-95 transition-transform text-sm"
            >
              {pack.isFreeDaily ? 'Back to Packs' : `Rip Again (${pack.cost} COINS)`}
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

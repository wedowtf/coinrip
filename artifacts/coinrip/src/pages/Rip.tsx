import { useState, useEffect, useRef } from "react";
import { useGameState } from "@/hooks/use-game-state";
import { getRandomCoinForPack, Coin, PackId, PACKS, COINS } from "@/lib/dataset";
import { useLocation, useSearch } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

const TIER_META = {
  SINGULARITY: { color: '#FBBF24', shadow: 'rgba(251,191,36,0.5)', label: 'SINGULARITY' },
  PULSAR:      { color: '#D946EF', shadow: 'rgba(217,70,239,0.4)', label: 'PULSAR' },
  NOVA:        { color: '#06B6D4', shadow: 'rgba(6,182,212,0.4)', label: 'NOVA' },
  FLARE:       { color: '#F97316', shadow: 'rgba(249,115,22,0.4)', label: 'FLARE' },
  SPARK:       { color: '#E2E8F0', shadow: 'rgba(226,232,240,0.2)', label: 'SPARK' },
} as const;

function CoinLogo({ coin }: { coin: Coin }) {
  const [imgError, setImgError] = useState(false);
  const meta = TIER_META[coin.tier as keyof typeof TIER_META];

  return (
    <div
      className="w-28 h-28 rounded-full flex items-center justify-center border-4 overflow-hidden relative"
      style={{
        borderColor: meta.color,
        background: `radial-gradient(circle, ${meta.shadow}, transparent 70%)`,
        boxShadow: `0 0 30px ${meta.shadow}`,
      }}
    >
      {!imgError && coin.logoUrl ? (
        <img
          src={coin.logoUrl}
          alt={coin.name}
          className="w-20 h-20 object-contain"
          onError={() => setImgError(true)}
        />
      ) : (
        <span className="font-display font-black text-4xl" style={{ color: meta.color }}>
          {coin.name.charAt(0)}
        </span>
      )}
    </div>
  );
}

function Particle({ index, color }: { index: number; color: string }) {
  const angle = (index / 24) * 360 + Math.random() * 15;
  const dist = 90 + Math.random() * 140;
  const x = Math.cos((angle * Math.PI) / 180) * dist;
  const y = Math.sin((angle * Math.PI) / 180) * dist;
  const size = 3 + Math.random() * 5;

  return (
    <motion.div
      className="absolute rounded-full top-1/2 left-1/2"
      style={{ backgroundColor: color, width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2 }}
      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
      animate={{ x, y, opacity: 0, scale: 0 }}
      transition={{ duration: 0.9 + Math.random() * 0.6, ease: 'easeOut', delay: Math.random() * 0.15 }}
    />
  );
}

export default function Rip() {
  const { state, addCoin, isLoaded } = useGameState();
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const packId = (params.get('pack') || 'daily') as PackId;
  const pack = PACKS.find(p => p.id === packId) ?? PACKS[0];

  const [stage, setStage] = useState<'shaking' | 'tearing' | 'reveal'>('shaking');
  const [revealedCoin, setRevealedCoin] = useState<Coin | null>(null);
  const [showParticles, setShowParticles] = useState(false);
  const claimed = useRef(false);
  const ripStarted = useRef(false);

  useEffect(() => {
    // CRITICAL: wait for localStorage to finish loading before checking username
    if (!isLoaded) return;

    if (!state.username) {
      setLocation('/');
      return;
    }

    // Only start the rip animation once
    if (ripStarted.current) return;
    ripStarted.current = true;

    const coin = getRandomCoinForPack(packId);
    setRevealedCoin(coin);

    const t1 = setTimeout(() => setStage('tearing'), 1400);
    const t2 = setTimeout(() => {
      setStage('reveal');
      setShowParticles(true);
    }, 2800);

    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [isLoaded, state.username, setLocation, packId]);

  const handleClaim = () => {
    if (revealedCoin && !claimed.current) {
      claimed.current = true;
      addCoin(revealedCoin.name, packId);
      setLocation('/collection');
    }
  };

  const handleRipAgain = () => {
    setLocation('/');
  };

  // Show loading spinner while state loads from localStorage
  if (!isLoaded) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
        <motion.div
          className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        />
        <p className="text-sm text-muted-foreground font-bold uppercase tracking-wider">Loading…</p>
      </div>
    );
  }

  if (!revealedCoin) return <div className="min-h-screen bg-background" />;

  const meta = TIER_META[revealedCoin.tier as keyof typeof TIER_META];
  const isSingularity = revealedCoin.tier === 'SINGULARITY';
  const isPulsar = revealedCoin.tier === 'PULSAR';
  const isSpecial = isSingularity || isPulsar;

  // Check if this is a duplicate
  const alreadyOwned = state.collection.find(c => c.name === revealedCoin.name);

  const particleColors = isSingularity
    ? ['#FBBF24', '#FDE68A', '#F59E0B', '#FFF', '#D946EF']
    : [pack.color, '#FFF', meta.color];

  return (
    <div className="relative min-h-[82vh] flex flex-col items-center justify-center p-6 overflow-hidden">

      {/* Background glow for special tiers */}
      {isSpecial && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at center, ${meta.shadow} 0%, transparent 65%)`,
            animation: 'pulse 2s infinite',
          }}
        />
      )}

      {/* ─── Pack animation (shaking + tearing) ─── */}
      <AnimatePresence>
        {stage !== 'reveal' && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center z-20"
            exit={{ opacity: 0, scale: 1.6, filter: 'brightness(4)' }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              animate={stage === 'shaking' ? {
                rotate: [0, -4, 4, -4, 4, -3, 3, 0],
                y: [0, -4, 4, -4, 4, 0],
              } : {}}
              transition={{ duration: 0.5, repeat: Infinity, repeatType: 'loop' }}
            >
              <div
                className="w-48 h-64 rounded-3xl flex flex-col items-center justify-center relative overflow-hidden"
                style={{
                  background: `linear-gradient(145deg, ${pack.color}33, #12121A 60%)`,
                  border: `2px solid ${pack.color}66`,
                  boxShadow: `0 0 40px ${pack.shadowColor}`,
                }}
              >
                {/* Pack art layers */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent" />
                <div className="absolute top-3 right-3 left-3 flex justify-between items-start">
                  <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: pack.color }}>
                    {pack.subtitle}
                  </span>
                  {pack.badgeLabel && (
                    <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full" style={{ background: pack.color, color: '#000' }}>
                      {pack.badgeLabel}
                    </span>
                  )}
                </div>

                <div className="flex flex-col items-center gap-2 z-10">
                  <span className="font-display font-black text-3xl uppercase tracking-tighter" style={{ color: pack.color }}>
                    {pack.name}
                  </span>
                  <div className="w-12 h-0.5 rounded-full" style={{ background: pack.color + '66' }} />
                  <span className="font-display font-bold text-xs uppercase text-zinc-500 tracking-widest">
                    {stage === 'tearing' ? 'Opening...' : 'Ripping!'}
                  </span>
                </div>

                {stage === 'tearing' && (
                  <>
                    <motion.div
                      className="absolute inset-0 rounded-3xl"
                      style={{
                        background: `linear-gradient(145deg, ${pack.color}33, #12121A)`,
                        clipPath: 'polygon(0 0, 52% 0, 30% 100%, 0 100%)',
                      }}
                      animate={{ x: -60, rotate: -8, opacity: 0 }}
                      transition={{ duration: 0.6, ease: 'easeIn' }}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-3xl"
                      style={{
                        background: `linear-gradient(145deg, ${pack.color}33, #12121A)`,
                        clipPath: 'polygon(52% 0, 100% 0, 100% 100%, 30% 100%)',
                      }}
                      animate={{ x: 60, rotate: 8, opacity: 0 }}
                      transition={{ duration: 0.6, ease: 'easeIn' }}
                    />
                    <div className="absolute inset-0 bg-white rounded-3xl opacity-80 animate-ping" />
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Coin Reveal ─── */}
      {stage === 'reveal' && (
        <motion.div
          className="flex flex-col items-center gap-5 z-30 w-full max-w-[280px]"
          initial={{ scale: 0.3, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        >
          {/* Particle burst */}
          {showParticles && (
            <div className="absolute pointer-events-none z-40 top-1/2 left-1/2">
              {Array.from({ length: isSpecial ? 28 : 14 }).map((_, i) => (
                <Particle key={i} index={i} color={particleColors[i % particleColors.length]} />
              ))}
            </div>
          )}

          {/* Tier label */}
          <div className="flex flex-col items-center gap-1">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest"
              style={{
                backgroundColor: meta.color + '22',
                color: meta.color,
                border: `1px solid ${meta.color}55`,
                boxShadow: `0 0 12px ${meta.shadow}`,
              }}
            >
              {isSingularity ? '✦ SINGULARITY ✦' : meta.label}
            </motion.div>
            {isSingularity && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-xs font-bold text-yellow-400 tracking-wide animate-pulse"
              >
                ULTRA RARE PULL
              </motion.p>
            )}
          </div>

          {/* Coin Card */}
          <motion.div
            className="w-full rounded-3xl border-2 p-6 flex flex-col items-center gap-4 relative overflow-hidden"
            style={{
              borderColor: meta.color + '55',
              background: `linear-gradient(145deg, ${meta.shadow}, #12121A 70%)`,
              boxShadow: `0 8px 40px ${meta.shadow}`,
            }}
            animate={isSingularity ? { boxShadow: [`0 8px 40px ${meta.shadow}`, `0 8px 60px ${meta.shadow}`, `0 8px 40px ${meta.shadow}`] } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

            {/* Duplicate badge */}
            {alreadyOwned && (
              <div className="absolute top-3 right-3 bg-zinc-700 text-zinc-300 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                +1 Duplicate
              </div>
            )}

            <CoinLogo coin={revealedCoin} />

            <div className="text-center space-y-1.5 z-10 w-full">
              <h3 className="font-display text-2xl font-black text-white leading-tight">{revealedCoin.name}</h3>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <span
                  className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{ background: meta.color + '22', color: meta.color }}
                >
                  {revealedCoin.category}
                </span>
              </div>
              <p className="text-xs text-zinc-400 leading-snug px-1">{revealedCoin.tagline}</p>
            </div>

            <div className="flex items-center justify-between w-full pt-1 border-t border-white/10">
              <span className="text-[9px] font-mono text-zinc-500">MCap</span>
              <span className="text-[10px] font-mono font-bold text-zinc-400">
                ${(revealedCoin.marketCap / 1000).toFixed(1)}k
              </span>
            </div>
          </motion.div>

          {/* +2 COINS earned */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-1.5 bg-primary/10 border border-primary/30 rounded-full px-4 py-1.5"
          >
            <span className="text-primary font-black text-sm">+2</span>
            <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">COINS earned</span>
          </motion.div>

          {/* Actions */}
          <div className="flex flex-col gap-2.5 w-full">
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onClick={handleClaim}
              className="w-full h-13 py-3.5 rounded-2xl font-display font-bold text-base uppercase tracking-wide active:scale-95 transition-transform"
              style={{ background: meta.color, color: isSingularity || isPulsar ? '#000' : '#000' }}
            >
              Add to Vault
            </motion.button>
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              onClick={handleRipAgain}
              className="w-full py-3 rounded-2xl border border-border font-display font-bold text-sm uppercase tracking-wide text-muted-foreground active:scale-95 transition-transform"
            >
              Back to Packs
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

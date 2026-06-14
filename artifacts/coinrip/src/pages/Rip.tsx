import { useState, useEffect, useRef } from "react";
import { useGameState } from "@/hooks/use-game-state";
import { getRandomCoinForPack, Coin, PackId, PACKS } from "@/lib/dataset";
import { useLocation, useSearch } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

const TIER_META = {
  SINGULARITY: { color: '#FBBF24', shadow: 'rgba(251,191,36,0.55)', label: 'SINGULARITY', order: 5 },
  PULSAR:      { color: '#D946EF', shadow: 'rgba(217,70,239,0.45)', label: 'PULSAR',      order: 4 },
  NOVA:        { color: '#06B6D4', shadow: 'rgba(6,182,212,0.45)',  label: 'NOVA',        order: 3 },
  FLARE:       { color: '#F97316', shadow: 'rgba(249,115,22,0.4)',  label: 'FLARE',       order: 2 },
  SPARK:       { color: '#E2E8F0', shadow: 'rgba(226,232,240,0.25)',label: 'SPARK',       order: 1 },
} as const;

const PACK_COINS = 6;

function MiniCoinCard({ coin, index, isBest }: { coin: Coin; index: number; isBest: boolean }) {
  const [imgErr, setImgErr] = useState(false);
  const meta = TIER_META[coin.tier as keyof typeof TIER_META];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.88 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.09 + 0.12, type: 'spring', stiffness: 280, damping: 22 }}
      className="relative rounded-2xl p-3 flex flex-col items-center gap-2 overflow-hidden"
      style={{
        background: `linear-gradient(145deg, ${meta.color}18 0%, #0D0D18 80%)`,
        border: `1.5px solid ${isBest ? meta.color + 'CC' : meta.color + '44'}`,
        boxShadow: isBest
          ? `0 0 28px ${meta.shadow}, 0 0 55px ${meta.shadow}55`
          : `0 0 8px ${meta.shadow}44`,
      }}
    >
      {/* Shimmer */}
      <motion.div
        className="absolute inset-0 pointer-events-none rounded-2xl"
        style={{ background: `linear-gradient(108deg, transparent 30%, ${meta.color}20 50%, transparent 70%)` }}
        initial={{ x: '-100%' }} animate={{ x: '200%' }}
        transition={{ duration: 2.2, repeat: Infinity, repeatDelay: isBest ? 1.5 : 4, ease: 'easeInOut' }}
      />

      {isBest && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: index * 0.09 + 0.45, type: 'spring', stiffness: 400 }}
          className="absolute -top-1.5 -right-1.5 text-[7px] font-black uppercase px-1.5 py-0.5 rounded-full z-10"
          style={{ background: meta.color, color: '#000', boxShadow: `0 0 10px ${meta.color}` }}
        >BEST</motion.div>
      )}

      {/* Logo */}
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center border-2 overflow-hidden relative shrink-0"
        style={{
          borderColor: meta.color + '88',
          background: `radial-gradient(circle at 35% 35%, ${meta.color}38, ${meta.shadow} 55%, #0A0A14 100%)`,
          boxShadow: `0 0 ${isBest ? 20 : 10}px ${meta.shadow}`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none rounded-full" />
        {!imgErr && coin.logoUrl ? (
          <img src={coin.logoUrl} alt={coin.name} className="w-9 h-9 object-contain relative z-10"
            onError={() => setImgErr(true)} />
        ) : (
          <span className="font-display font-black text-xl relative z-10" style={{ color: meta.color }}>
            {coin.name.charAt(0)}
          </span>
        )}
      </div>

      {/* Ticker */}
      <span
        className="text-xs font-black tracking-wide"
        style={{ color: meta.color, textShadow: isBest ? `0 0 10px ${meta.color}` : 'none' }}
      >
        {coin.ticker}
      </span>

      {/* Tier badge */}
      <div
        className="text-[7px] font-black uppercase px-2 py-0.5 rounded-full leading-none"
        style={{
          background: meta.color + '1C',
          color: meta.color,
          border: `1px solid ${meta.color}35`,
        }}
      >
        {coin.tier === 'SINGULARITY' ? '✦ SING' : meta.label}
      </div>

      {/* Name */}
      <p className="text-[9px] font-bold text-center leading-tight w-full text-zinc-400">
        {coin.name.length > 13 ? coin.name.slice(0, 12) + '…' : coin.name}
      </p>
    </motion.div>
  );
}

function Particle({ index, color, big }: { index: number; color: string; big: boolean }) {
  const angle = (index / (big ? 48 : 28)) * 360 + Math.random() * 25;
  const dist = (big ? 100 : 70) + Math.random() * 180;
  const x = Math.cos((angle * Math.PI) / 180) * dist;
  const y = Math.sin((angle * Math.PI) / 180) * dist;
  const size = big ? 2 + Math.random() * 8 : 2 + Math.random() * 5;
  const isLong = Math.random() > 0.55;
  return (
    <motion.div
      className="absolute top-1/2 left-1/2 rounded-full"
      style={{
        backgroundColor: color,
        width: isLong ? size * 0.55 : size,
        height: isLong ? size * 3.2 : size,
        marginLeft: -(isLong ? size * 0.55 : size) / 2,
        marginTop: -(isLong ? size * 3.2 : size) / 2,
        rotate: angle,
      }}
      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
      animate={{ x, y, opacity: 0, scale: 0 }}
      transition={{ duration: 0.9 + Math.random() * 0.6, ease: 'easeOut', delay: Math.random() * 0.18 }}
    />
  );
}

export default function Rip() {
  const { state, addPackCoins, isLoaded } = useGameState();
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const packId = (params.get('pack') || 'daily') as PackId;
  const pack = PACKS.find(p => p.id === packId) ?? PACKS[0];

  const [stage, setStage] = useState<'shaking' | 'tearing' | 'reveal'>('shaking');
  const [revealedCoins, setRevealedCoins] = useState<Coin[]>([]);
  const [showParticles, setShowParticles] = useState(false);
  const [screenFlash, setScreenFlash] = useState(false);
  const claimed = useRef(false);
  const ripStarted = useRef(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (!state.username) { setLocation('/'); return; }
    if (ripStarted.current) return;
    ripStarted.current = true;

    const coins = Array.from({ length: PACK_COINS }, () => getRandomCoinForPack(packId));
    setRevealedCoins(coins);

    const t1 = setTimeout(() => setStage('tearing'), 1400);
    const t2 = setTimeout(() => {
      setScreenFlash(true);
      setTimeout(() => setScreenFlash(false), 350);
      setStage('reveal');
      setShowParticles(true);
    }, 2700);

    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [isLoaded, state.username, setLocation, packId]);

  const handleClaim = () => {
    if (revealedCoins.length && !claimed.current) {
      claimed.current = true;
      addPackCoins(revealedCoins.map(c => c.name), packId);
      setLocation('/collection');
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
        <motion.div className="w-12 h-12 rounded-full border-4"
          style={{ borderColor: 'rgba(226,255,0,0.25)', borderTopColor: '#E2FF00' }}
          animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }} />
        <p className="text-sm text-muted-foreground font-bold uppercase tracking-wider">Loading…</p>
      </div>
    );
  }

  /* ── Pack animation (shaking + tearing) ── */
  if (stage !== 'reveal') {
    return (
      <div className="relative min-h-[82vh] flex flex-col items-center justify-center p-6 overflow-hidden">
        <AnimatePresence>
          {screenFlash && (
            <motion.div className="absolute inset-0 z-50 pointer-events-none"
              style={{ background: pack.color }}
              initial={{ opacity: 0.8 }} animate={{ opacity: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }} />
          )}
        </AnimatePresence>
        <div className="absolute inset-0 bg-dot opacity-20 pointer-events-none" />

        <motion.div
          animate={stage === 'shaking' ? {
            rotate: [0, -5, 5, -5, 5, -4, 4, -3, 3, 0],
            y: [0, -5, 5, -5, 5, -3, 3, 0],
            x: [0, -3, 3, -3, 3, 0],
          } : {}}
          transition={{ duration: 0.45, repeat: Infinity, repeatType: 'loop' }}
        >
          <div
            className="w-52 h-72 rounded-3xl flex flex-col items-center justify-center relative overflow-hidden"
            style={{
              background: `linear-gradient(145deg, ${pack.color}38, #10101A 60%)`,
              border: `2px solid ${pack.color}70`,
              boxShadow: `0 0 50px ${pack.shadowColor}, 0 0 100px ${pack.shadowColor}44`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/8 to-transparent" />
            <div className="absolute inset-0 bg-grid opacity-30" />
            <motion.div
              className="absolute inset-0 pointer-events-none rounded-3xl"
              style={{ background: `linear-gradient(108deg, transparent 33%, ${pack.color}40 50%, transparent 67%)` }}
              initial={{ x: '-100%' }} animate={{ x: '220%' }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5, ease: 'easeInOut' }}
            />
            <div className="absolute top-3 right-3 left-3 flex justify-between items-start">
              <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: pack.color }}>
                {pack.subtitle}
              </span>
              {pack.badgeLabel && (
                <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full"
                  style={{ background: pack.color, color: '#000' }}>{pack.badgeLabel}</span>
              )}
            </div>
            <div className="flex flex-col items-center gap-2 z-10">
              <span className="font-display font-black text-4xl uppercase tracking-tighter"
                style={{ color: pack.color, textShadow: `0 0 30px ${pack.color}` }}>
                {pack.name}
              </span>
              <div className="w-16 h-0.5 rounded-full" style={{ background: pack.color + '66' }} />
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">6 coins inside</span>
              <motion.span className="font-display font-bold text-xs uppercase text-zinc-500 tracking-widest"
                animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 0.8, repeat: Infinity }}>
                {stage === 'tearing' ? 'Opening...' : 'Ripping!'}
              </motion.span>
            </div>

            {stage === 'tearing' && (
              <>
                <motion.div className="absolute inset-0 rounded-3xl"
                  style={{ background: `linear-gradient(145deg, ${pack.color}38, #10101A)`, clipPath: 'polygon(0 0, 52% 0, 30% 100%, 0 100%)' }}
                  animate={{ x: -80, rotate: -12, opacity: 0 }} transition={{ duration: 0.55, ease: 'easeIn' }} />
                <motion.div className="absolute inset-0 rounded-3xl"
                  style={{ background: `linear-gradient(145deg, ${pack.color}38, #10101A)`, clipPath: 'polygon(52% 0, 100% 0, 100% 100%, 30% 100%)' }}
                  animate={{ x: 80, rotate: 12, opacity: 0 }} transition={{ duration: 0.55, ease: 'easeIn' }} />
                <motion.div className="absolute inset-0 rounded-3xl" style={{ backgroundColor: pack.color }}
                  initial={{ opacity: 0 }} animate={{ opacity: [0, 0.9, 0] }} transition={{ duration: 0.4, delay: 0.1 }} />
              </>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  /* ── Reveal stage ── */
  const bestCoin = revealedCoins.reduce((best, coin) =>
    TIER_META[coin.tier as keyof typeof TIER_META].order >
    TIER_META[best.tier as keyof typeof TIER_META].order ? coin : best,
    revealedCoins[0]
  );
  const bestMeta = TIER_META[bestCoin.tier as keyof typeof TIER_META];
  const isBig = bestCoin.tier === 'SINGULARITY';
  const isMed = bestCoin.tier === 'PULSAR';
  const isSpecial = isBig || isMed;
  const totalEarned = revealedCoins.length * 2;
  const particleColors = isBig
    ? ['#FBBF24', '#FDE68A', '#F59E0B', '#FFFFFF', '#D946EF']
    : isMed ? ['#D946EF', '#F0ABFC', '#FFFFFF', '#A855F7']
    : [pack.color, '#FFF', bestMeta.color];

  return (
    <div className="relative min-h-[82vh] flex flex-col p-5 pb-8 overflow-hidden">

      {/* Background glow */}
      {isBig && (
        <motion.div className="absolute inset-0 pointer-events-none" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ background: 'radial-gradient(ellipse at center, rgba(251,191,36,0.13) 0%, rgba(217,70,239,0.05) 45%, transparent 70%)' }} />
      )}
      {isSpecial && (
        <motion.div className="absolute inset-0 pointer-events-none" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ background: `radial-gradient(ellipse at center, ${bestMeta.shadow} 0%, transparent 60%)` }} />
      )}
      <div className="absolute inset-0 bg-dot opacity-20 pointer-events-none" />

      {/* Particles */}
      {showParticles && (
        <div className="absolute pointer-events-none z-40" style={{ top: '28%', left: '50%' }}>
          {Array.from({ length: isBig ? 56 : isSpecial ? 36 : 24 }).map((_, i) => (
            <Particle key={i} index={i} color={particleColors[i % particleColors.length]} big={isBig} />
          ))}
        </div>
      )}

      {/* Header */}
      <motion.div className="w-full z-10 mb-3"
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Pack Opened</p>
            <h2 className="font-display text-xl font-black uppercase text-white leading-tight"
              style={{ textShadow: `0 0 18px ${pack.color}55` }}>
              {pack.name} <span className="text-sm font-bold text-zinc-400">×6</span>
            </h2>
          </div>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ delay: 0.35, type: 'spring', stiffness: 320 }}
            className="flex flex-col items-end gap-0.5">
            <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-500">Best pull</span>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{ background: bestMeta.color + '1C', border: `1px solid ${bestMeta.color}55`, boxShadow: `0 0 12px ${bestMeta.shadow}` }}>
              <span className="text-xs font-black" style={{ color: bestMeta.color }}>
                {bestCoin.ticker}
              </span>
              <span className="text-[9px] font-black uppercase" style={{ color: bestMeta.color }}>
                {bestCoin.tier === 'SINGULARITY' ? '✦SING' : bestMeta.label}
              </span>
            </div>
          </motion.div>
        </div>
        <motion.div className="mt-2 h-px"
          style={{ background: `linear-gradient(90deg, ${pack.color}70, transparent)` }}
          initial={{ width: 0 }} animate={{ width: '100%' }}
          transition={{ delay: 0.2, duration: 0.5 }} />
      </motion.div>

      {/* 2×3 coin grid */}
      <div className="w-full z-10 grid grid-cols-2 gap-2.5 mb-4">
        {revealedCoins.map((coin, i) => (
          <MiniCoinCard key={coin.name + i} coin={coin} index={i} isBest={coin === bestCoin} />
        ))}
      </div>

      {/* Coins earned */}
      <motion.div
        initial={{ opacity: 0, scale: 0.75, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.7, type: 'spring', stiffness: 300, damping: 20 }}
        className="w-full z-10 flex items-center justify-center gap-3 rounded-2xl px-5 py-3 mb-3 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(226,255,0,0.1), rgba(226,255,0,0.04))',
          border: '1px solid rgba(226,255,0,0.3)',
          boxShadow: '0 0 22px rgba(226,255,0,0.15)',
        }}
      >
        <motion.div className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(226,255,0,0.14), transparent)' }}
          initial={{ x: '-100%' }} animate={{ x: '200%' }}
          transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 1.5 }} />
        <motion.span className="font-display font-black text-2xl"
          style={{ color: '#E2FF00', textShadow: '0 0 16px rgba(226,255,0,0.9)' }}
          animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}>
          +{totalEarned}
        </motion.span>
        <div className="flex flex-col">
          <span className="text-xs font-black text-zinc-200 uppercase tracking-wider">COINS EARNED 🪙</span>
          <span className="text-[9px] text-zinc-500">{PACK_COINS} coins × 2 each</span>
        </div>
      </motion.div>

      {/* Actions */}
      <div className="flex flex-col gap-2.5 w-full z-10">
        <motion.button
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85 }}
          onClick={handleClaim}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          className="w-full py-4 rounded-2xl font-display font-black text-base uppercase tracking-wide relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${bestMeta.color}, ${bestMeta.color}CC)`,
            color: '#000',
            boxShadow: `0 4px 24px ${bestMeta.shadow}, 0 0 50px ${bestMeta.shadow}50`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/25 to-transparent pointer-events-none" />
          <motion.div className="absolute inset-0 pointer-events-none rounded-2xl"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)' }}
            initial={{ x: '-100%' }} animate={{ x: '200%' }}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }} />
          ✦ Add All {PACK_COINS} to Vault
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.95 }}
          onClick={() => setLocation('/')}
          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}
          className="w-full py-3 rounded-2xl font-display font-bold text-sm uppercase tracking-wide text-muted-foreground"
          style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}
        >
          ← Rip Another Pack
        </motion.button>
      </div>
    </div>
  );
}

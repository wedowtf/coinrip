import { useState, useEffect, useRef } from "react";
import { useGameState } from "@/hooks/use-game-state";
import { getRandomCoinForPack, Coin, PackId, PACKS, COINS } from "@/lib/dataset";
import { useLocation, useSearch } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

const TIER_META = {
  SINGULARITY: { color: '#FBBF24', shadow: 'rgba(251,191,36,0.55)', label: 'SINGULARITY', bg: 'rgba(251,191,36,0.08)' },
  PULSAR:      { color: '#D946EF', shadow: 'rgba(217,70,239,0.45)', label: 'PULSAR',      bg: 'rgba(217,70,239,0.06)' },
  NOVA:        { color: '#06B6D4', shadow: 'rgba(6,182,212,0.45)',  label: 'NOVA',        bg: 'rgba(6,182,212,0.05)'  },
  FLARE:       { color: '#F97316', shadow: 'rgba(249,115,22,0.4)',  label: 'FLARE',       bg: 'rgba(249,115,22,0.05)' },
  SPARK:       { color: '#E2E8F0', shadow: 'rgba(226,232,240,0.25)',label: 'SPARK',       bg: 'rgba(226,232,240,0.03)'},
} as const;

function CoinLogo({ coin }: { coin: Coin }) {
  const [imgError, setImgError] = useState(false);
  const meta = TIER_META[coin.tier as keyof typeof TIER_META];

  return (
    <div className="relative flex items-center justify-center" style={{ width: 176, height: 176 }}>
      {/* Outer slow-rotating dashed ring */}
      <motion.div
        className="absolute rounded-full border-2"
        style={{ width: 174, height: 174, borderColor: meta.color + '55', borderStyle: 'dashed' }}
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
      />
      {/* Middle counter-rotating ring */}
      <motion.div
        className="absolute rounded-full border"
        style={{ width: 156, height: 156, borderColor: meta.color + '35' }}
        animate={{ rotate: -360 }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
      />
      {/* Extra thin ring */}
      <motion.div
        className="absolute rounded-full"
        style={{ width: 142, height: 142, border: `1px solid ${meta.color}20` }}
        animate={{ rotate: 180 }}
        transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
      />

      {/* Pulsing volumetric glow */}
      <motion.div
        className="absolute rounded-full"
        style={{ width: 142, height: 142 }}
        animate={{
          boxShadow: [
            `0 0 24px ${meta.shadow}, 0 0 48px ${meta.shadow}55`,
            `0 0 56px ${meta.shadow}, 0 0 100px ${meta.shadow}80`,
            `0 0 24px ${meta.shadow}, 0 0 48px ${meta.shadow}55`,
          ],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Coin circle */}
      <div
        className="w-28 h-28 rounded-full flex items-center justify-center border-4 overflow-hidden relative z-10"
        style={{
          borderColor: meta.color,
          background: `radial-gradient(circle at 35% 35%, ${meta.color}40, ${meta.shadow} 55%, #0A0A14 100%)`,
          boxShadow: `0 0 50px ${meta.shadow}, inset 0 0 24px ${meta.shadow}50`,
        }}
      >
        {/* Gloss layer */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none rounded-full" />
        {!imgError && coin.logoUrl ? (
          <img src={coin.logoUrl} alt={coin.name} className="w-20 h-20 object-contain relative z-10" onError={() => setImgError(true)} />
        ) : (
          <span className="font-display font-black text-4xl relative z-10" style={{ color: meta.color }}>{coin.name.charAt(0)}</span>
        )}
      </div>
    </div>
  );
}

function Particle({ index, color, isSingularity }: { index: number; color: string; isSingularity: boolean }) {
  const angle = (index / (isSingularity ? 48 : 24)) * 360 + Math.random() * 25;
  const dist = (isSingularity ? 100 : 70) + Math.random() * 200;
  const x = Math.cos((angle * Math.PI) / 180) * dist;
  const y = Math.sin((angle * Math.PI) / 180) * dist;
  const size = isSingularity ? 2 + Math.random() * 8 : 2 + Math.random() * 6;
  const isLong = Math.random() > 0.6;

  return (
    <motion.div
      className="absolute top-1/2 left-1/2 rounded-full"
      style={{
        backgroundColor: color,
        width: isLong ? size * 0.6 : size,
        height: isLong ? size * 3 : size,
        marginLeft: -(isLong ? size * 0.6 : size) / 2,
        marginTop: -(isLong ? size * 3 : size) / 2,
        rotate: angle,
      }}
      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
      animate={{ x, y, opacity: 0, scale: 0 }}
      transition={{ duration: 0.8 + Math.random() * 0.7, ease: 'easeOut', delay: Math.random() * 0.18 }}
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
  const [screenFlash, setScreenFlash] = useState(false);
  const claimed = useRef(false);
  const ripStarted = useRef(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (!state.username) { setLocation('/'); return; }
    if (ripStarted.current) return;
    ripStarted.current = true;

    const coin = getRandomCoinForPack(packId);
    setRevealedCoin(coin);

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
    if (revealedCoin && !claimed.current) {
      claimed.current = true;
      addCoin(revealedCoin.name, packId);
      setLocation('/collection');
    }
  };

  const handleRipAgain = () => setLocation('/');

  if (!isLoaded) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
        <motion.div
          className="w-12 h-12 rounded-full border-4"
          style={{ borderColor: 'rgba(226,255,0,0.25)', borderTopColor: '#E2FF00' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
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

  const alreadyOwned = state.collection.find(c => c.name === revealedCoin.name);

  const particleColors = isSingularity
    ? ['#FBBF24', '#FDE68A', '#F59E0B', '#FFFFFF', '#D946EF', '#FFF']
    : isPulsar
    ? ['#D946EF', '#F0ABFC', '#FFFFFF', '#A855F7']
    : [pack.color, '#FFF', meta.color];

  return (
    <div className="relative min-h-[82vh] flex flex-col items-center justify-center p-6 overflow-hidden">

      {/* Screen flash on reveal */}
      <AnimatePresence>
        {screenFlash && (
          <motion.div
            className="absolute inset-0 z-50 pointer-events-none"
            style={{ background: meta.color }}
            initial={{ opacity: 0.7 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          />
        )}
      </AnimatePresence>

      {/* Singularity full-screen radial glow */}
      {isSingularity && stage === 'reveal' && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            background: 'radial-gradient(ellipse at center, rgba(251,191,36,0.18) 0%, rgba(217,70,239,0.08) 40%, transparent 70%)',
          }}
        />
      )}

      {/* Background glow for special tiers */}
      {isSpecial && stage === 'reveal' && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            background: `radial-gradient(ellipse at center, ${meta.shadow} 0%, transparent 60%)`,
          }}
        />
      )}

      {/* Grid pattern background */}
      <div className="absolute inset-0 bg-dot opacity-20 pointer-events-none" />

      {/* ─── Pack animation (shaking + tearing) ─── */}
      <AnimatePresence>
        {stage !== 'reveal' && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center z-20"
            exit={{ opacity: 0, scale: 1.8, filter: 'brightness(5)' }}
            transition={{ duration: 0.35 }}
          >
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
                {/* Pack art layers */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/8 to-transparent" />
                <div className="absolute inset-0 bg-grid opacity-30" />

                {/* Shimmer on pack */}
                <motion.div
                  className="absolute inset-0 pointer-events-none rounded-3xl"
                  style={{ background: `linear-gradient(108deg, transparent 33%, ${pack.color}40 50%, transparent 67%)` }}
                  initial={{ x: '-100%' }}
                  animate={{ x: '220%' }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5, ease: 'easeInOut' }}
                />

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
                  <span
                    className="font-display font-black text-4xl uppercase tracking-tighter"
                    style={{ color: pack.color, textShadow: `0 0 30px ${pack.color}` }}
                  >
                    {pack.name}
                  </span>
                  <div className="w-16 h-0.5 rounded-full" style={{ background: pack.color + '66' }} />
                  <motion.span
                    className="font-display font-bold text-xs uppercase text-zinc-400 tracking-widest"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  >
                    {stage === 'tearing' ? 'Opening...' : 'Ripping!'}
                  </motion.span>
                </div>

                {stage === 'tearing' && (
                  <>
                    <motion.div
                      className="absolute inset-0 rounded-3xl"
                      style={{
                        background: `linear-gradient(145deg, ${pack.color}38, #10101A)`,
                        clipPath: 'polygon(0 0, 52% 0, 30% 100%, 0 100%)',
                      }}
                      animate={{ x: -80, rotate: -12, opacity: 0 }}
                      transition={{ duration: 0.55, ease: 'easeIn' }}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-3xl"
                      style={{
                        background: `linear-gradient(145deg, ${pack.color}38, #10101A)`,
                        clipPath: 'polygon(52% 0, 100% 0, 100% 100%, 30% 100%)',
                      }}
                      animate={{ x: 80, rotate: 12, opacity: 0 }}
                      transition={{ duration: 0.55, ease: 'easeIn' }}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-3xl"
                      style={{ backgroundColor: pack.color }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 0.9, 0] }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                    />
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
          className="flex flex-col items-center gap-5 z-30 w-full max-w-[290px]"
          initial={{ scale: 0.25, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 240, damping: 20 }}
        >
          {/* Particle burst */}
          {showParticles && (
            <div className="absolute pointer-events-none z-40 top-1/2 left-1/2">
              {Array.from({ length: isSingularity ? 56 : isPulsar ? 36 : 22 }).map((_, i) => (
                <Particle key={i} index={i} color={particleColors[i % particleColors.length]} isSingularity={isSingularity} />
              ))}
            </div>
          )}

          {/* Tier label */}
          <div className="flex flex-col items-center gap-1.5">
            <motion.div
              initial={{ opacity: 0, scale: 0.4, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 20 }}
              className="px-5 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest relative overflow-hidden"
              style={{
                backgroundColor: meta.color + '22',
                color: meta.color,
                border: `1px solid ${meta.color}60`,
                boxShadow: `0 0 20px ${meta.shadow}, 0 0 40px ${meta.shadow}50`,
              }}
            >
              {/* Shimmer on badge */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{ background: `linear-gradient(90deg, transparent, ${meta.color}30, transparent)` }}
                initial={{ x: '-100%' }}
                animate={{ x: '200%' }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
              />
              {isSingularity ? '✦ SINGULARITY ✦' : meta.label}
            </motion.div>

            {isSingularity && (
              <motion.p
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: 'spring' }}
                className="text-xs font-black tracking-wide"
                style={{ color: '#FBBF24', textShadow: '0 0 12px rgba(251,191,36,0.8)', animation: 'glow-pulse 1.5s ease-in-out infinite' }}
              >
                ✦ ULTRA RARE PULL ✦
              </motion.p>
            )}
          </div>

          {/* Coin Card */}
          <motion.div
            className="w-full rounded-3xl border-2 p-6 flex flex-col items-center gap-4 relative overflow-hidden"
            style={{
              borderColor: meta.color + '70',
              background: `linear-gradient(145deg, ${meta.color}1A 0%, #0F0F18 50%, ${meta.shadow}0A 100%)`,
              boxShadow: `0 10px 50px ${meta.shadow}, 0 0 100px ${meta.shadow}40, inset 0 1px 0 rgba(255,255,255,0.1)`,
            }}
            animate={isSpecial ? {
              boxShadow: [
                `0 10px 50px ${meta.shadow}, 0 0 100px ${meta.shadow}40, inset 0 1px 0 rgba(255,255,255,0.1)`,
                `0 10px 70px ${meta.shadow}, 0 0 150px ${meta.shadow}65, inset 0 1px 0 rgba(255,255,255,0.1)`,
                `0 10px 50px ${meta.shadow}, 0 0 100px ${meta.shadow}40, inset 0 1px 0 rgba(255,255,255,0.1)`,
              ]
            } : {}}
            transition={{ duration: 1.6, repeat: Infinity }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/7 via-transparent to-black/40 pointer-events-none" />
            <div className="absolute inset-0 bg-grid opacity-15 pointer-events-none" />

            {/* Shimmer sweep */}
            <motion.div
              className="absolute inset-0 pointer-events-none rounded-3xl"
              style={{ background: `linear-gradient(110deg, transparent 30%, ${meta.color}22 50%, transparent 70%)` }}
              initial={{ x: '-100%' }}
              animate={{ x: '200%' }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
            />

            {/* Duplicate badge */}
            {alreadyOwned && (
              <div
                className="absolute top-3 right-3 text-[9px] font-black uppercase px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(255,255,255,0.08)', color: '#8A8A9E', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                +1 Duplicate
              </div>
            )}

            <CoinLogo coin={revealedCoin} />

            <div className="text-center space-y-2 z-10 w-full">
              <h3
                className="font-display text-2xl font-black text-white leading-tight"
                style={{ textShadow: `0 0 20px ${meta.shadow}` }}
              >
                {revealedCoin.name}
              </h3>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <span
                  className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{ background: meta.color + '22', color: meta.color, border: `1px solid ${meta.color}35` }}
                >
                  {revealedCoin.category}
                </span>
              </div>
              <p className="text-xs text-zinc-400 leading-snug px-1">{revealedCoin.tagline}</p>
            </div>

            <div
              className="flex items-center justify-between w-full pt-2 border-t"
              style={{ borderColor: 'rgba(255,255,255,0.08)' }}
            >
              <span className="text-[9px] font-mono text-zinc-500">MCap</span>
              <span className="text-[10px] font-mono font-bold text-zinc-400">
                ${(revealedCoin.marketCap / 1000).toFixed(1)}k
              </span>
            </div>
          </motion.div>

          {/* +2 COINS earned */}
          <motion.div
            initial={{ opacity: 0, scale: 0.65, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.35, type: 'spring', stiffness: 320, damping: 18 }}
            className="flex items-center gap-2 rounded-full px-6 py-2.5 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(226,255,0,0.16), rgba(226,255,0,0.06))',
              border: '1px solid rgba(226,255,0,0.4)',
              boxShadow: '0 0 24px rgba(226,255,0,0.2)',
            }}
          >
            {/* Shimmer */}
            <motion.div
              className="absolute inset-0 pointer-events-none rounded-full"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(226,255,0,0.2), transparent)' }}
              initial={{ x: '-100%' }}
              animate={{ x: '200%' }}
              transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 1.5 }}
            />
            <motion.span
              className="font-display font-black text-xl"
              style={{ color: '#E2FF00', textShadow: '0 0 14px rgba(226,255,0,0.9)' }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.3, repeat: Infinity, ease: 'easeInOut' }}
            >
              +2
            </motion.span>
            <span className="text-sm font-black text-zinc-300 uppercase tracking-widest">COINS EARNED 🪙</span>
          </motion.div>

          {/* Actions */}
          <div className="flex flex-col gap-2.5 w-full">
            <motion.button
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28 }}
              onClick={handleClaim}
              whileHover={{ scale: 1.02, boxShadow: `0 6px 30px ${meta.shadow}, 0 0 60px ${meta.shadow}60` }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-4 rounded-2xl font-display font-black text-base uppercase tracking-wide relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${meta.color}, ${meta.color}CC)`,
                color: '#000',
                boxShadow: `0 4px 24px ${meta.shadow}, 0 0 50px ${meta.shadow}55`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/25 to-transparent pointer-events-none" />
              <motion.div
                className="absolute inset-0 pointer-events-none rounded-2xl"
                style={{ background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)` }}
                initial={{ x: '-100%' }}
                animate={{ x: '200%' }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
              />
              ✦ Add to Vault
            </motion.button>

            <motion.button
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38 }}
              onClick={handleRipAgain}
              whileHover={{ scale: 1.01, borderColor: 'rgba(255,255,255,0.2)' }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-3 rounded-2xl font-display font-bold text-sm uppercase tracking-wide text-muted-foreground transition-all"
              style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}
            >
              ← Back to Packs
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

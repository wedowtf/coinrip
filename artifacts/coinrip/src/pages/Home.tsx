import { useState, useEffect } from "react";
import { useGameState } from "@/hooks/use-game-state";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { PACKS, COINS, PackDef, Tier } from "@/lib/dataset";
import { Lock, Sparkles } from "lucide-react";

function CoinMini({ logoUrl, name, tierColor }: { logoUrl: string; name: string; tierColor: string }) {
  const [err, setErr] = useState(false);
  return (
    <div
      className="w-14 h-14 rounded-full flex items-center justify-center border-2 overflow-hidden shrink-0"
      style={{
        borderColor: tierColor + "99",
        background: `radial-gradient(circle, ${tierColor}30, ${tierColor}10)`,
        boxShadow: `0 0 10px ${tierColor}55`,
      }}
    >
      {!err && logoUrl ? (
        <img
          src={logoUrl}
          alt={name}
          className="w-9 h-9 object-contain"
          onError={() => setErr(true)}
        />
      ) : (
        <span className="font-display font-black text-base" style={{ color: tierColor }}>
          {name.charAt(0)}
        </span>
      )}
    </div>
  );
}

const TIER_COLORS: Record<Tier, string> = {
  SPARK: "#E2E8F0",
  FLARE: "#F97316",
  NOVA: "#06B6D4",
  PULSAR: "#D946EF",
  SINGULARITY: "#FBBF24",
};

function getPreviewCoins(pack: PackDef) {
  const eligible = (Object.entries(pack.tierWeights) as [Tier, number][])
    .filter(([, w]) => w > 0)
    .map(([t]) => t);
  const pool = COINS.filter(c => eligible.includes(c.tier));
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 4);
}

function PackCard({ pack, canAfford, canRipFree, timeLeft, onRip, onLoginRequired }: {
  pack: PackDef;
  canAfford: boolean;
  canRipFree: boolean;
  timeLeft: string | null;
  onRip: () => void;
  onLoginRequired: () => void;
}) {
  const isFree = pack.isFreeDaily;
  const isAvailable = isFree ? canRipFree : canAfford;
  const previewCoins = getPreviewCoins(pack);

  const eligibleTiers = (Object.entries(pack.tierWeights) as [Tier, number][])
    .filter(([, w]) => w > 0)
    .sort((a, b) => b[1] - a[1]);

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -8 }}
      whileTap={{ scale: 0.95 }}
      className="snap-center shrink-0 w-[215px] rounded-3xl border-2 p-4 flex flex-col gap-3 relative overflow-hidden cursor-pointer card-shine"
      style={{
        borderColor: isAvailable ? pack.color + 'CC' : "#1E1E28",
        boxShadow: isAvailable
          ? `0 0 30px ${pack.shadowColor}, 0 0 70px ${pack.shadowColor}44, inset 0 1px 0 rgba(255,255,255,0.1)`
          : "inset 0 1px 0 rgba(255,255,255,0.02)",
        opacity: isAvailable ? 1 : 0.45,
        background: isAvailable
          ? `linear-gradient(155deg, ${pack.color}18 0%, #0C0C14 50%, ${pack.shadowColor}0C 100%)`
          : '#0A0A12',
      }}
    >
      {/* Shimmer sweep */}
      {isAvailable && (
        <motion.div
          className="absolute inset-0 pointer-events-none z-20 rounded-3xl"
          style={{ background: `linear-gradient(108deg, transparent 33%, ${pack.color}35 50%, transparent 67%)` }}
          initial={{ x: '-100%' }}
          animate={{ x: '220%' }}
          transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 3.5, ease: 'easeInOut' }}
        />
      )}

      {/* Corner glow accent */}
      <div
        className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${pack.color}40, transparent 70%)` }}
      />
      {/* Bottom left accent */}
      <div
        className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${pack.shadowColor} 0%, transparent 70%)` }}
      />

      {pack.badgeLabel && (
        <motion.span
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute top-3 right-3 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full z-10"
          style={{ backgroundColor: pack.color, color: "#000", boxShadow: `0 0 12px ${pack.color}AA` }}
        >
          {pack.badgeLabel}
        </motion.span>
      )}

      <div className="absolute inset-0 bg-gradient-to-b from-white/6 via-transparent to-black/40 pointer-events-none rounded-3xl" />

      {/* Pack type label */}
      <div className="z-10">
        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: pack.color }}>
          {pack.subtitle}
        </p>
        <h3
          className="font-display text-xl font-black uppercase leading-tight text-white"
          style={{ textShadow: isAvailable ? `0 0 28px ${pack.color}90` : 'none' }}
        >
          {pack.name}
        </h3>
      </div>

      {/* Coin preview */}
      <div
        className="w-full rounded-2xl p-3 z-10 relative overflow-hidden"
        style={{
          background: `linear-gradient(145deg, ${pack.color}1A, ${pack.shadowColor} 120%)`,
          border: `1px solid ${pack.color}44`,
        }}
      >
        <div className="grid grid-cols-2 gap-2 mb-2">
          {previewCoins.slice(0, 4).map((coin, i) => (
            <motion.div
              key={coin.name}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.07, type: "spring", stiffness: 300, damping: 18 }}
              className="flex items-center justify-center"
            >
              <CoinMini
                logoUrl={coin.logoUrl}
                name={coin.name}
                tierColor={TIER_COLORS[coin.tier]}
              />
            </motion.div>
          ))}
        </div>
        <div className="flex items-center gap-1 flex-wrap justify-center">
          {eligibleTiers.slice(0, 3).map(([tier]) => (
            <span
              key={tier}
              className="text-[7px] font-black uppercase px-1.5 py-0.5 rounded-full leading-none"
              style={{ backgroundColor: TIER_COLORS[tier as Tier] + "30", color: TIER_COLORS[tier as Tier] }}
            >
              {tier === "SINGULARITY" ? "✦SING" : tier}
            </span>
          ))}
        </div>
      </div>

      <p className="text-[9px] text-zinc-500 z-10 leading-snug">{pack.description}</p>

      <button
        className="w-full h-11 rounded-xl font-display font-bold text-sm uppercase tracking-wide z-10 transition-all active:scale-95 flex items-center justify-center gap-1.5"
        style={{
          background: isAvailable
            ? `linear-gradient(135deg, ${pack.color}, ${pack.color}CC)`
            : "#1C1C26",
          color: isAvailable ? "#000" : "#3A3A48",
          cursor: isAvailable ? "pointer" : "not-allowed",
          boxShadow: isAvailable ? `0 4px 18px ${pack.shadowColor}, 0 0 30px ${pack.shadowColor}55` : "none",
        }}
        onClick={() => {
          if (isAvailable) onRip();
          else onLoginRequired();
        }}
      >
        {isFree ? (
          isAvailable ? "🎁 Rip Free" : (timeLeft ?? "⏳ Tomorrow")
        ) : isAvailable ? (
          `RIP — ${pack.cost} 🪙`
        ) : (
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3" /> {pack.cost} COINS
          </span>
        )}
      </button>
    </motion.div>
  );
}

const DROP_RATES = [
  { tier: "SINGULARITY", color: "#FBBF24", range: "> $100K mcap", pct: "2%",  icon: "✦", fill: 2  },
  { tier: "PULSAR",      color: "#D946EF", range: "$20K–$100K",    pct: "8%",  icon: "◈", fill: 8  },
  { tier: "NOVA",        color: "#06B6D4", range: "$10K–$20K",     pct: "15%", icon: "◆", fill: 15 },
  { tier: "FLARE",       color: "#F97316", range: "$7K–$10K",      pct: "30%", icon: "▲", fill: 30 },
  { tier: "SPARK",       color: "#E2E8F0", range: "< $7K mcap",    pct: "45%", icon: "•", fill: 45 },
];

export default function Home() {
  const { state, canRipFree, getTimeUntilFreeRip, payForRip } = useGameState();
  const [, setLocation] = useLocation();
  const [showNeedLogin, setShowNeedLogin] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showInsufficientCoins, setShowInsufficientCoins] = useState<string | null>(null);

  const timeLeft = getTimeUntilFreeRip();
  const isNewUser = state.username && (state.totalRips || 0) === 0;

  useEffect(() => {
    if (isNewUser) {
      setShowWelcome(true);
      const t = setTimeout(() => setShowWelcome(false), 5000);
      return () => clearTimeout(t);
    }
  }, [state.username]);

  const handleRip = (pack: PackDef) => {
    if (!state.username) {
      setShowNeedLogin(true);
      setTimeout(() => setShowNeedLogin(false), 2500);
      return;
    }
    if (pack.isFreeDaily) {
      if (canRipFree()) setLocation(`/rip?pack=${pack.id}`);
      return;
    }
    if (payForRip(pack.cost)) {
      setLocation(`/rip?pack=${pack.id}`);
    } else {
      setShowInsufficientCoins(`Need ${pack.cost} COINS — rip packs to earn more!`);
      setTimeout(() => setShowInsufficientCoins(null), 3000);
    }
  };

  return (
    <div className="flex flex-col gap-5 pb-4">
      {/* ── Hero ── */}
      <div className="relative overflow-hidden px-6 pt-7 pb-3">
        {/* Grid background */}
        <div className="absolute inset-0 bg-grid opacity-60 pointer-events-none" />

        {/* Animated orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute -top-14 -left-14 w-56 h-56 rounded-full blur-3xl"
            style={{ background: '#E2FF00' }}
            animate={{ scale: [1, 1.25, 1], opacity: [0.14, 0.22, 0.14] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -top-8 -right-10 w-44 h-44 rounded-full blur-3xl"
            style={{ background: '#D946EF' }}
            animate={{ scale: [1.1, 0.85, 1.1], opacity: [0.1, 0.18, 0.1] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          />
          <motion.div
            className="absolute top-16 left-1/2 -translate-x-1/2 w-36 h-36 rounded-full blur-3xl"
            style={{ background: '#06B6D4' }}
            animate={{ scale: [0.85, 1.35, 0.85], opacity: [0.08, 0.16, 0.08] }}
            transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          />
        </div>

        <motion.div
          className="text-center space-y-2 relative z-10"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div className="inline-flex flex-col items-center">
            <motion.h1
              className="text-6xl font-display font-extrabold uppercase italic tracking-tighter sticker-shadow"
              style={{ color: '#E2FF00', textShadow: '0 0 40px rgba(226,255,0,0.5), 0 2px 0 rgba(0,0,0,0.9)' }}
              animate={{ textShadow: [
                '0 0 40px rgba(226,255,0,0.4), 0 2px 0 rgba(0,0,0,0.9)',
                '0 0 70px rgba(226,255,0,0.75), 0 2px 0 rgba(0,0,0,0.9)',
                '0 0 40px rgba(226,255,0,0.4), 0 2px 0 rgba(0,0,0,0.9)',
              ] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              CoinRip
            </motion.h1>
            {/* Underline accent */}
            <motion.div
              className="h-0.5 rounded-full mt-0.5"
              style={{ background: 'linear-gradient(90deg, transparent, #E2FF00, transparent)' }}
              initial={{ width: 0 }}
              animate={{ width: '120px' }}
              transition={{ delay: 0.4, duration: 0.6, ease: 'easeOut' }}
            />
          </motion.div>

          <motion.p
            className="text-sm text-zinc-400 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Rip packs. Collect real ecosystem coins. Redeem later.
          </motion.p>

          <AnimatePresence>
            {showNeedLogin && (
              <motion.div
                initial={{ opacity: 0, scale: 0.88, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92 }}
                className="inline-flex items-center gap-1.5 text-xs text-black font-black bg-primary py-1.5 px-4 rounded-full"
                style={{ boxShadow: '0 0 20px rgba(226,255,0,0.5)' }}
              >
                ↑ Log in to start ripping packs
              </motion.div>
            )}
            {showInsufficientCoins && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="inline-flex items-center gap-1.5 text-xs text-white font-bold bg-red-500/20 border border-red-500/30 py-1.5 px-4 rounded-full"
              >
                {showInsufficientCoins}
              </motion.div>
            )}
          </AnimatePresence>

          {!state.username && !showNeedLogin && (
            <motion.p
              className="text-xs text-zinc-600 font-medium"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              Press LOGIN ↑ to get started free
            </motion.p>
          )}
        </motion.div>
      </div>

      {/* ── Welcome Bonus Banner ── */}
      <AnimatePresence>
        {showWelcome && state.username && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            className="mx-6 rounded-2xl overflow-hidden relative"
            style={{ background: 'linear-gradient(135deg, #E2FF00, #06B6D4)', boxShadow: '0 0 40px rgba(226,255,0,0.5), 0 4px 20px rgba(0,0,0,0.4)' }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/15 to-transparent pointer-events-none" />
            <div className="p-4 flex items-center gap-3">
              <motion.div
                className="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center shrink-0"
                animate={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 1.5, repeat: 2 }}
              >
                <Sparkles className="w-5 h-5 text-white" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-black text-black text-sm uppercase tracking-wide leading-tight">
                  Welcome, {state.username}! 🎉
                </p>
                <p className="text-[11px] text-black/70 font-semibold leading-snug mt-0.5">
                  <strong className="font-black">+50 COINS</strong> added to your wallet — start ripping!
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-mono font-black text-2xl text-black">50</p>
                <p className="text-[9px] font-black text-black/60 uppercase">COINS</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Stats bar (logged in) ── */}
      {state.username && (
        <div className="flex gap-2 px-6">
          {[
            { label: "Rips",   value: state.totalRips || 0,   accent: "#E2E8F0", icon: "🎴" },
            { label: "Unique", value: state.collection.length, accent: "#06B6D4", icon: "💎" },
            { label: "COINS",  value: state.coinBalance,       accent: "#E2FF00", icon: "🪙" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10, scale: 0.88 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.1, type: 'spring', stiffness: 320, damping: 22 }}
              className="flex-1 text-center relative overflow-hidden rounded-2xl p-3"
              style={{
                background: `linear-gradient(145deg, ${s.accent}14 0%, #0A0A12 100%)`,
                border: `1px solid ${s.accent}30`,
                boxShadow: `0 0 22px ${s.accent}12`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
              {/* Glow dot top */}
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${s.accent}60, transparent)` }}
              />
              <p className="text-base mb-0.5">{s.icon}</p>
              <p
                className="font-mono font-black text-xl"
                style={{ color: s.accent, textShadow: `0 0 14px ${s.accent}80` }}
              >
                {s.value}
              </p>
              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Packs */}
      <div className="flex flex-col gap-2 px-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-black uppercase tracking-widest text-white">
            Available Packs
          </h2>
          <motion.span
            className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{ background: '#E2FF0020', color: '#E2FF00', border: '1px solid rgba(226,255,0,0.2)' }}
            animate={{ boxShadow: ['0 0 0px rgba(226,255,0,0)', '0 0 8px rgba(226,255,0,0.3)', '0 0 0px rgba(226,255,0,0)'] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {PACKS.length} types
          </motion.span>
        </div>

        <div className="flex overflow-x-auto gap-3 pb-4 -mx-6 px-6 snap-x snap-mandatory scrollbar-none">
          {PACKS.map((pack, i) => (
            <motion.div
              key={pack.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, type: 'spring', stiffness: 260, damping: 22 }}
            >
              <PackCard
                pack={pack}
                canAfford={state.coinBalance >= pack.cost}
                canRipFree={canRipFree()}
                timeLeft={timeLeft}
                onRip={() => handleRip(pack)}
                onLoginRequired={() => {
                  setShowNeedLogin(true);
                  setTimeout(() => setShowNeedLogin(false), 2500);
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Drop rates */}
      <div className="flex flex-col gap-2 px-6 pb-6">
        <h2 className="font-display text-base font-black uppercase tracking-widest text-white">
          Drop Rates
        </h2>
        <div className="flex flex-col gap-2">
          {DROP_RATES.map((t, i) => (
            <motion.div
              key={t.tier}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="rounded-xl px-3 py-2.5 border relative overflow-hidden"
              style={{ borderColor: t.color + '20', background: t.color + '07' }}
            >
              {/* Animated fill bar background */}
              <motion.div
                className="absolute inset-y-0 left-0 rounded-xl"
                style={{ background: `linear-gradient(90deg, ${t.color}18, transparent)` }}
                initial={{ width: 0 }}
                animate={{ width: `${t.fill}%` }}
                transition={{ delay: i * 0.08 + 0.3, duration: 0.8, ease: 'easeOut' }}
              />
              <div className="relative flex items-center gap-3 z-10">
                <span className="text-sm shrink-0 w-4 text-center font-black" style={{ color: t.color }}>{t.icon}</span>
                <span className="font-black text-xs shrink-0 w-24" style={{ color: t.color }}>{t.tier}</span>
                <span className="text-[10px] text-muted-foreground flex-1">{t.range}</span>
                <div
                  className="text-[10px] font-mono font-black px-1.5 py-0.5 rounded-full shrink-0"
                  style={{ background: t.color + '22', color: t.color, border: `1px solid ${t.color}30` }}
                >
                  {t.pct}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

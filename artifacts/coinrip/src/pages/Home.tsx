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
      className="w-10 h-10 rounded-full flex items-center justify-center border-2 overflow-hidden shrink-0"
      style={{ borderColor: tierColor + "99", background: tierColor + "22" }}
    >
      {!err && logoUrl ? (
        <img
          src={logoUrl}
          alt={name}
          className="w-7 h-7 object-contain"
          onError={() => setErr(true)}
        />
      ) : (
        <span className="font-display font-black text-sm" style={{ color: tierColor }}>
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
  const primaryTier = eligibleTiers[0]?.[0] as Tier;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      className="snap-center shrink-0 w-[200px] rounded-2xl border-2 p-4 flex flex-col gap-3 relative overflow-hidden bg-card"
      style={{
        borderColor: isAvailable ? pack.color : "#2A2A35",
        boxShadow: isAvailable ? `0 0 20px ${pack.shadowColor}` : "none",
        opacity: isAvailable ? 1 : 0.6,
      }}
    >
      {pack.badgeLabel && (
        <span
          className="absolute top-3 right-3 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full z-10"
          style={{ backgroundColor: pack.color, color: "#000" }}
        >
          {pack.badgeLabel}
        </span>
      )}

      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

      {/* Pack type label */}
      <div className="z-10">
        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: pack.color }}>
          {pack.subtitle}
        </p>
        <h3 className="font-display text-xl font-black uppercase leading-tight text-white">
          {pack.name}
        </h3>
      </div>

      {/* Coin logos preview — THE KEY FIX */}
      <div
        className="w-full rounded-xl p-2 flex flex-col items-center gap-2 z-10 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${pack.shadowColor}, ${pack.color}11)`,
          border: `1px solid ${pack.color}33`,
          minHeight: "100px",
        }}
      >
        {/* Row of coin logos */}
        <div className="flex gap-2 justify-center flex-wrap">
          {previewCoins.slice(0, 4).map((coin, i) => (
            <motion.div
              key={coin.name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="relative"
              style={{ marginTop: i % 2 === 1 ? 6 : 0 }}
            >
              <CoinMini
                logoUrl={coin.logoUrl}
                name={coin.name}
                tierColor={TIER_COLORS[coin.tier]}
              />
            </motion.div>
          ))}
        </div>
        {/* Tier drop hint */}
        <div className="flex items-center gap-1 flex-wrap justify-center">
          {eligibleTiers.slice(0, 3).map(([tier]) => (
            <span
              key={tier}
              className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: TIER_COLORS[tier as Tier] + "33", color: TIER_COLORS[tier as Tier] }}
            >
              {tier === "SINGULARITY" ? "✦ SING" : tier}
            </span>
          ))}
        </div>
      </div>

      <p className="text-[9px] text-zinc-400 z-10 leading-snug">{pack.description}</p>

      <button
        className="w-full h-10 rounded-xl font-display font-bold text-sm uppercase tracking-wide z-10 transition-all active:scale-95 flex items-center justify-center gap-1.5"
        style={{
          backgroundColor: isAvailable ? pack.color : "#2A2A35",
          color: isAvailable ? "#000" : "#555",
          cursor: isAvailable ? "pointer" : "default",
        }}
        onClick={() => {
          if (isAvailable) onRip();
          else if (!canAfford && !isFree) onLoginRequired();
        }}
      >
        {!isAvailable && !isFree && <Lock className="w-3 h-3" />}
        {isFree
          ? isAvailable
            ? "Rip Free"
            : timeLeft ?? "Tomorrow"
          : `${pack.cost} COINS`}
      </button>
    </motion.div>
  );
}

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
      {/* ── Spectacular Hero ── */}
      <div className="relative overflow-hidden px-6 pt-6 pb-2">
        {/* Animated background orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute -top-10 -left-10 w-48 h-48 rounded-full blur-3xl opacity-20"
            style={{ background: '#E2FF00' }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -top-6 -right-8 w-40 h-40 rounded-full blur-3xl opacity-15"
            style={{ background: '#D946EF' }}
            animate={{ scale: [1.1, 0.9, 1.1], opacity: [0.12, 0.2, 0.12] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          />
          <motion.div
            className="absolute top-14 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full blur-3xl opacity-10"
            style={{ background: '#06B6D4' }}
            animate={{ scale: [0.9, 1.3, 0.9], opacity: [0.1, 0.18, 0.1] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          />
        </div>

        <motion.div
          className="text-center space-y-2 relative z-10"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h1
            className="text-5xl font-display font-extrabold uppercase italic tracking-tighter sticker-shadow"
            style={{ color: '#E2FF00', textShadow: '0 0 40px rgba(226,255,0,0.4), 0 2px 0 rgba(0,0,0,0.8)' }}
            animate={{ textShadow: ['0 0 40px rgba(226,255,0,0.4)', '0 0 60px rgba(226,255,0,0.7)', '0 0 40px rgba(226,255,0,0.4)'] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            CoinRip
          </motion.h1>
          <p className="text-sm text-zinc-400 font-medium">
            Rip packs. Collect real ecosystem coins. Redeem later.
          </p>
          <AnimatePresence>
            {showNeedLogin && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="inline-flex items-center gap-1.5 text-xs text-black font-black bg-primary py-1.5 px-4 rounded-full"
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
            <p className="text-xs text-zinc-600 font-medium">Press LOGIN ↑ to get started free</p>
          )}
        </motion.div>
      </div>

      {/* ── Welcome Bonus Banner ── */}
      <AnimatePresence>
        {showWelcome && state.username && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            className="mx-6 rounded-2xl overflow-hidden relative"
            style={{ background: 'linear-gradient(135deg, #E2FF00, #06B6D4)', boxShadow: '0 0 30px rgba(226,255,0,0.4)' }}
          >
            <div className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
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
            { label: "Rips", value: state.totalRips || 0, color: "text-white" },
            { label: "Unique", value: state.collection.length, color: "text-cyan-400" },
            { label: "COINS", value: state.coinBalance, color: "text-primary" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-card border border-border rounded-xl p-2.5 flex-1 text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/3 to-transparent pointer-events-none" />
              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">{s.label}</p>
              <p className={`font-mono font-black text-lg ${s.color}`}>{s.value}</p>
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
          <span
            className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{ background: '#E2FF0022', color: '#E2FF00' }}
          >
            {PACKS.length} types
          </span>
        </div>

        <div className="flex overflow-x-auto gap-3 pb-4 -mx-6 px-6 snap-x snap-mandatory scrollbar-none">
          {PACKS.map(pack => (
            <PackCard
              key={pack.id}
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
          ))}
        </div>
      </div>

      {/* Drop rates table */}
      <div className="flex flex-col gap-2 px-6 pb-6">
        <h2 className="font-display text-base font-black uppercase tracking-widest text-white">
          Drop Rates
        </h2>
        <div className="flex flex-col gap-1.5">
          {(
            [
              { tier: "SINGULARITY", color: "#FBBF24", range: "> $100K mcap", pct: "2%", icon: "✦" },
              { tier: "PULSAR",      color: "#D946EF", range: "$20K–$100K",    pct: "8%", icon: "◈" },
              { tier: "NOVA",        color: "#06B6D4", range: "$10K–$20K",     pct: "15%", icon: "◆" },
              { tier: "FLARE",       color: "#F97316", range: "$7K–$10K",      pct: "30%", icon: "▲" },
              { tier: "SPARK",       color: "#E2E8F0", range: "< $7K mcap",    pct: "45%", icon: "•" },
            ] as { tier: string; color: string; range: string; pct: string; icon: string }[]
          ).map((t, i) => (
            <motion.div
              key={t.tier}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 border relative overflow-hidden"
              style={{ borderColor: t.color + '25', background: t.color + '08' }}
            >
              <span className="text-sm shrink-0 w-4 text-center" style={{ color: t.color }}>{t.icon}</span>
              <span className="font-black text-xs shrink-0 w-24" style={{ color: t.color }}>{t.tier}</span>
              <span className="text-[10px] text-muted-foreground flex-1">{t.range}</span>
              <div
                className="text-[10px] font-mono font-black px-1.5 py-0.5 rounded-full"
                style={{ background: t.color + '22', color: t.color }}
              >
                {t.pct}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

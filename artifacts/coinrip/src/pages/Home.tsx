import { useState } from "react";
import { useGameState } from "@/hooks/use-game-state";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { PACKS, COINS, PackDef, Tier } from "@/lib/dataset";
import { Lock } from "lucide-react";

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

  const timeLeft = getTimeUntilFreeRip();

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
      alert(`Not enough COINS! You need ${pack.cost}.`);
    }
  };

  return (
    <div className="p-6 flex flex-col gap-6 pb-4">
      {/* Hero */}
      <div className="text-center space-y-1.5 mt-4">
        <h1 className="text-4xl font-display font-extrabold uppercase italic tracking-tighter text-primary sticker-shadow">
          CoinRip
        </h1>
        <p className="text-sm text-muted-foreground font-medium">
          Rip packs. Collect real ecosystem coins. Redeem later.
        </p>
        <AnimatePresence>
          {showNeedLogin && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-xs text-primary font-black animate-pulse bg-primary/10 py-1 px-3 rounded-full inline-block"
            >
              ↑ Log in to start ripping packs
            </motion.p>
          )}
        </AnimatePresence>
        {!state.username && !showNeedLogin && (
          <p className="text-xs text-zinc-500 font-medium">Press LOGIN ↑ to get started</p>
        )}
      </div>

      {/* Stats bar (logged in) */}
      {state.username && (
        <div className="flex gap-2">
          {[
            { label: "Rips", value: state.totalRips || 0 },
            { label: "Unique", value: state.collection.length },
            { label: "COINS", value: state.coinBalance, highlight: true },
          ].map(s => (
            <div key={s.label} className="bg-secondary/40 border border-border rounded-xl p-2.5 flex-1 text-center">
              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">{s.label}</p>
              <p className={`font-mono font-bold text-base ${s.highlight ? "text-primary" : "text-white"}`}>
                {s.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Packs */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-black uppercase tracking-widest text-white">
            Available Packs
          </h2>
          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
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
      <div className="flex flex-col gap-2">
        <h2 className="font-display text-base font-black uppercase tracking-widest text-white">
          Drop Rates
        </h2>
        <div className="flex flex-col gap-1.5">
          {(
            [
              { tier: "SINGULARITY", color: "#FBBF24", range: "> $100K mcap", pct: "2%" },
              { tier: "PULSAR", color: "#D946EF", range: "$20K–$100K", pct: "8%" },
              { tier: "NOVA", color: "#06B6D4", range: "$10K–$20K", pct: "15%" },
              { tier: "FLARE", color: "#F97316", range: "$7K–$10K", pct: "30%" },
              { tier: "SPARK", color: "#E2E8F0", range: "< $7K mcap", pct: "45%" },
            ] as { tier: string; color: string; range: string; pct: string }[]
          ).map(t => (
            <div key={t.tier} className="flex items-center gap-3 bg-secondary/30 rounded-lg px-3 py-2 border border-border">
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: t.color, boxShadow: `0 0 5px ${t.color}` }}
              />
              <span className="font-black text-xs shrink-0" style={{ color: t.color }}>
                {t.tier}
              </span>
              <span className="text-[10px] text-muted-foreground flex-1">{t.range}</span>
              <span className="text-[10px] font-mono font-bold text-muted-foreground">{t.pct}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useGameState } from "@/hooks/use-game-state";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { PACKS, PackDef } from "@/lib/dataset";
import { Lock, Zap, Star } from "lucide-react";

function PackCard({ pack, canAfford, canRipFree, timeLeft, onRip }: {
  pack: PackDef;
  canAfford: boolean;
  canRipFree: boolean;
  timeLeft: string | null;
  onRip: () => void;
}) {
  const isFree = pack.isFreeDaily;
  const isAvailable = isFree ? canRipFree : canAfford;

  return (
    <motion.div
      whileHover={{ scale: isAvailable ? 1.03 : 1 }}
      whileTap={{ scale: isAvailable ? 0.97 : 1 }}
      className="snap-center shrink-0 w-[200px] rounded-2xl border-2 p-5 flex flex-col gap-4 relative overflow-hidden bg-card cursor-pointer select-none"
      style={{
        borderColor: isAvailable ? pack.color : '#2A2A35',
        boxShadow: isAvailable ? `0 0 20px ${pack.shadowColor}` : 'none',
        opacity: isAvailable ? 1 : 0.55,
      }}
      onClick={isAvailable ? onRip : undefined}
    >
      {pack.badgeLabel && (
        <span
          className="absolute top-3 right-3 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full"
          style={{ backgroundColor: pack.color, color: '#000' }}
        >
          {pack.badgeLabel}
        </span>
      )}

      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

      <div className="z-10 space-y-0.5">
        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: pack.color }}>
          {pack.subtitle}
        </p>
        <h3 className="font-display text-xl font-black uppercase leading-tight text-white">
          {pack.name}
        </h3>
      </div>

      <div
        className="w-full aspect-[3/4] max-h-[120px] rounded-xl flex items-center justify-center z-10 relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${pack.shadowColor}, transparent)`, border: `1.5px solid ${pack.color}33` }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center animate-float"
          style={{ background: `radial-gradient(circle, ${pack.shadowColor}, transparent)`, boxShadow: `0 0 20px ${pack.shadowColor}` }}
        >
          {pack.id === 'galaxy' ? (
            <Star className="w-8 h-8" style={{ color: pack.color }} />
          ) : pack.id === 'cosmic' ? (
            <Star className="w-7 h-7" style={{ color: pack.color }} />
          ) : pack.id === 'blazer' ? (
            <Zap className="w-7 h-7" style={{ color: pack.color }} />
          ) : (
            <div className="font-display font-black text-2xl" style={{ color: pack.color }}>
              {pack.name.charAt(0)}
            </div>
          )}
        </div>
        {/* Holographic shimmer for premium packs */}
        {(pack.id === 'cosmic' || pack.id === 'galaxy') && (
          <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-white via-transparent to-white animate-pulse" />
        )}
      </div>

      <p className="text-[10px] text-zinc-400 z-10 leading-snug">{pack.description}</p>

      <button
        disabled={!isAvailable}
        onClick={e => { e.stopPropagation(); if (isAvailable) onRip(); }}
        className="w-full h-10 rounded-xl font-display font-bold text-sm uppercase tracking-wide z-10 transition-all active:scale-95 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
        style={{
          backgroundColor: isAvailable ? pack.color : '#2A2A35',
          color: isAvailable ? '#000' : '#555',
        }}
      >
        {!isAvailable && <Lock className="w-3 h-3" />}
        {isFree
          ? isAvailable ? 'Rip Free' : timeLeft ?? 'Tomorrow'
          : isAvailable ? `${pack.cost} COINS` : `${pack.cost} COINS`}
      </button>
    </motion.div>
  );
}

export default function Home() {
  const { state, canRipFree, getTimeUntilFreeRip, payForRip } = useGameState();
  const [, setLocation] = useLocation();

  const timeLeft = getTimeUntilFreeRip();

  const handleRip = (pack: PackDef) => {
    if (!state.username) {
      return;
    }

    if (pack.isFreeDaily) {
      if (canRipFree()) {
        setLocation(`/rip?pack=${pack.id}`);
      }
      return;
    }

    if (payForRip(pack.cost)) {
      setLocation(`/rip?pack=${pack.id}`);
    } else {
      alert(`Not enough COINS! You need ${pack.cost} COINS.`);
    }
  };

  return (
    <div className="p-6 flex flex-col gap-8 pb-4">
      <div className="text-center space-y-1.5 mt-4">
        <h1 className="text-4xl font-display font-extrabold uppercase italic tracking-tighter text-primary sticker-shadow">
          CoinRip
        </h1>
        <p className="text-sm text-muted-foreground font-medium">
          Rip packs. Collect real ecosystem coins. Redeem later.
        </p>
        {!state.username && (
          <p className="text-xs text-primary font-bold mt-1 animate-pulse">
            Log in to start ripping packs
          </p>
        )}
      </div>

      {state.username && (
        <div className="flex gap-3">
          <div className="bg-secondary/40 border border-border rounded-xl p-3 flex-1 text-center">
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Rips Done</p>
            <p className="font-mono font-bold text-lg text-white">{state.totalRips || 0}</p>
          </div>
          <div className="bg-secondary/40 border border-border rounded-xl p-3 flex-1 text-center">
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Collected</p>
            <p className="font-mono font-bold text-lg text-white">{state.collection.length}</p>
          </div>
          <div className="bg-secondary/40 border border-border rounded-xl p-3 flex-1 text-center">
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Balance</p>
            <p className="font-mono font-bold text-lg text-primary">{state.coinBalance}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
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
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-display text-base font-black uppercase tracking-widest text-white">
          Drop Rates
        </h2>
        <div className="grid grid-cols-1 gap-2">
          {[
            { tier: 'SPARK', color: '#E2E8F0', label: 'Spark', range: '< $7K mcap', spark: 45, mystery: 45 },
            { tier: 'FLARE', color: '#F97316', label: 'Flare', range: '$7K–$10K mcap', spark: 30, mystery: 30 },
            { tier: 'NOVA', color: '#06B6D4', label: 'Nova', range: '$10K–$20K mcap', spark: 15, mystery: 15 },
            { tier: 'PULSAR', color: '#D946EF', label: 'Pulsar', range: '$20K–$100K mcap', spark: 8, mystery: 8 },
            { tier: 'SINGULARITY', color: '#FBBF24', label: 'Singularity', range: '> $100K mcap', spark: 2, mystery: 2 },
          ].map(t => (
            <div key={t.tier} className="flex items-center gap-3 bg-secondary/30 rounded-lg px-3 py-2 border border-border">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: t.color, boxShadow: `0 0 6px ${t.color}` }} />
              <div className="flex-1 min-w-0">
                <span className="font-bold text-xs" style={{ color: t.color }}>{t.label}</span>
                <span className="text-[10px] text-muted-foreground ml-2">{t.range}</span>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                {t.spark}% base
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

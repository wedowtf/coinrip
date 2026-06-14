import { useState } from "react";
import { useGameState } from "@/hooks/use-game-state";
import { COINS, CATEGORIES } from "@/lib/dataset";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trophy, Zap, Grid3X3, List } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function CoinLogoSmall({ logoUrl, name, tierColor }: { logoUrl: string; name: string; tierColor: string }) {
  const [err, setErr] = useState(false);
  return (
    <div
      className="w-11 h-11 rounded-full flex items-center justify-center border-2 overflow-hidden shrink-0"
      style={{
        borderColor: tierColor,
        background: `radial-gradient(circle, ${tierColor}28, ${tierColor}08)`,
        boxShadow: `0 0 8px ${tierColor}44`,
      }}
    >
      {!err ? (
        <img src={logoUrl} alt={name} className="w-7 h-7 object-contain" onError={() => setErr(true)} />
      ) : (
        <span className="font-display font-black text-lg" style={{ color: tierColor }}>{name.charAt(0)}</span>
      )}
    </div>
  );
}

const TIER_META: Record<string, { color: string; label: string; shadow: string }> = {
  SINGULARITY: { color: '#FBBF24', label: 'Singularity', shadow: 'rgba(251,191,36,0.35)' },
  PULSAR:      { color: '#D946EF', label: 'Pulsar',      shadow: 'rgba(217,70,239,0.3)' },
  NOVA:        { color: '#06B6D4', label: 'Nova',        shadow: 'rgba(6,182,212,0.3)' },
  FLARE:       { color: '#F97316', label: 'Flare',       shadow: 'rgba(249,115,22,0.3)' },
  SPARK:       { color: '#E2E8F0', label: 'Spark',       shadow: 'rgba(226,232,240,0.2)' },
};

export default function Collection() {
  const { state, isLoaded } = useGameState();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [redeemCoin, setRedeemCoin] = useState<string | null>(null);

  if (!isLoaded) return <div className="min-h-[80vh]" />;

  if (!state.username) {
    return (
      <div className="p-6 text-center mt-20 space-y-3">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        >
          <Trophy className="w-14 h-14 mx-auto" style={{ color: '#E2FF00', filter: 'drop-shadow(0 0 12px rgba(226,255,0,0.5))' }} />
        </motion.div>
        <h2 className="font-display text-2xl font-bold uppercase">Log in to view vault</h2>
        <p className="text-muted-foreground text-sm">Your collected coins will appear here</p>
      </div>
    );
  }

  const enrichedCollection = state.collection.map(c => {
    const coinDef = COINS.find(def => def.name === c.name);
    return { ...c, ...coinDef };
  }).filter(c => c.name) as (typeof state.collection[0] & typeof COINS[0])[];

  const totalCoins = state.collection.reduce((acc, c) => acc + c.quantity, 0);
  const rarestCoin = enrichedCollection.slice().sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0))[0];
  const uniqueCount = enrichedCollection.length;

  const categories = ['All', ...CATEGORIES.filter(cat =>
    enrichedCollection.some(c => c.category === cat)
  )];

  const filtered = selectedCategory === 'All'
    ? enrichedCollection
    : enrichedCollection.filter(c => c.category === selectedCategory);

  const tiers = ['SINGULARITY', 'PULSAR', 'NOVA', 'FLARE', 'SPARK'] as const;

  return (
    <div className="p-6 pb-24 flex flex-col gap-5">
      {/* Header Stats */}
      <div className="space-y-3">
        <motion.h1
          className="text-2xl font-display font-extrabold uppercase tracking-tighter"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          My Vault
        </motion.h1>

        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Total Rips', value: totalCoins,  color: '#E2E8F0' },
            { label: 'Unique',     value: uniqueCount, color: '#E2FF00' },
            { label: 'Balance',    value: state.coinBalance, color: '#06B6D4' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="relative overflow-hidden rounded-xl p-3 text-center border"
              style={{
                background: `linear-gradient(145deg, ${s.color}12, #0A0A12)`,
                borderColor: s.color + '25',
                boxShadow: `0 0 16px ${s.color}10`,
              }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-px" style={{ background: `linear-gradient(90deg, transparent, ${s.color}50, transparent)` }} />
              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">{s.label}</p>
              <p className="font-mono text-lg font-bold" style={{ color: s.color }}>{s.value}</p>
            </motion.div>
          ))}
        </div>

        {rarestCoin && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="border rounded-xl p-3 flex items-center gap-3 relative overflow-hidden"
            style={{
              borderColor: `${TIER_META[rarestCoin.tier]?.color}30`,
              background: `linear-gradient(135deg, ${TIER_META[rarestCoin.tier]?.color}10, #0A0A12)`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/4 to-transparent pointer-events-none" />
            <Trophy className="w-4 h-4 shrink-0" style={{ color: '#FBBF24', filter: 'drop-shadow(0 0 6px rgba(251,191,36,0.6))' }} />
            <div className="min-w-0 flex-1">
              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Rarest Coin</p>
              <p className="font-bold text-sm truncate text-white">{rarestCoin.name}</p>
            </div>
            <span
              className="text-[9px] font-black uppercase tracking-wider ml-auto px-2 py-0.5 rounded-full shrink-0"
              style={{
                backgroundColor: `${TIER_META[rarestCoin.tier]?.color}22`,
                color: TIER_META[rarestCoin.tier]?.color,
                border: `1px solid ${TIER_META[rarestCoin.tier]?.color}40`,
              }}
            >
              {rarestCoin.tier}
            </span>
          </motion.div>
        )}
      </div>

      {totalCoins === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16 border-2 border-dashed rounded-2xl space-y-3 relative overflow-hidden"
          style={{ borderColor: 'rgba(226,255,0,0.15)', background: 'rgba(226,255,0,0.02)' }}
        >
          <div className="absolute inset-0 bg-dot opacity-30 pointer-events-none" />
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Zap className="w-12 h-12 mx-auto" style={{ color: '#E2FF00', filter: 'drop-shadow(0 0 10px rgba(226,255,0,0.5))' }} />
          </motion.div>
          <p className="text-white font-bold">Your vault is empty.</p>
          <p className="text-sm text-zinc-500">Go rip some packs!</p>
        </motion.div>
      ) : (
        <>
          {/* Filters & View Toggle */}
          <div className="flex items-center gap-2">
            <div className="flex-1 flex overflow-x-auto gap-2 scrollbar-none">
              {categories.map(cat => (
                <motion.button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  whileTap={{ scale: 0.94 }}
                  className="shrink-0 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full border transition-all"
                  style={{
                    backgroundColor: selectedCategory === cat ? '#E2FF00' : 'transparent',
                    borderColor: selectedCategory === cat ? '#E2FF00' : '#22222E',
                    color: selectedCategory === cat ? '#000' : '#8A8A9E',
                    boxShadow: selectedCategory === cat ? '0 0 12px rgba(226,255,0,0.4)' : 'none',
                  }}
                >
                  {cat}
                </motion.button>
              ))}
            </div>
            <div className="flex gap-1 shrink-0">
              {[
                { mode: 'grid' as const, icon: <Grid3X3 className="w-3.5 h-3.5" /> },
                { mode: 'list' as const, icon: <List className="w-3.5 h-3.5" /> },
              ].map(v => (
                <button
                  key={v.mode}
                  onClick={() => setViewMode(v.mode)}
                  className="p-1.5 rounded-lg transition-all"
                  style={{
                    background: viewMode === v.mode ? '#E2FF00' : 'transparent',
                    color: viewMode === v.mode ? '#000' : '#8A8A9E',
                    boxShadow: viewMode === v.mode ? '0 0 10px rgba(226,255,0,0.35)' : 'none',
                  }}
                >
                  {v.icon}
                </button>
              ))}
            </div>
          </div>

          {/* Coins by Tier */}
          <div className="flex flex-col gap-6">
            {tiers.map((tier, tIdx) => {
              const coinsInTier = filtered.filter(c => c.tier === tier);
              if (coinsInTier.length === 0) return null;
              const meta = TIER_META[tier];

              return (
                <motion.div
                  key={tier}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: tIdx * 0.08 }}
                  className={`tier-${tier.toLowerCase()}`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    {/* Tier header line */}
                    <motion.div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: meta.color, boxShadow: `0 0 8px ${meta.color}` }}
                      animate={{ boxShadow: [`0 0 6px ${meta.color}`, `0 0 14px ${meta.color}`, `0 0 6px ${meta.color}`] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <h2 className="font-display text-sm font-black uppercase tracking-widest" style={{ color: meta.color }}>
                      {tier}
                    </h2>
                    <span className="text-[10px] font-mono text-muted-foreground">({coinsInTier.length})</span>
                    <div className="flex-1 h-px ml-1" style={{ background: `linear-gradient(90deg, ${meta.color}30, transparent)` }} />
                  </div>

                  <AnimatePresence>
                    {viewMode === 'grid' ? (
                      <div className="grid grid-cols-2 gap-3">
                        {coinsInTier.map((coin, cIdx) => (
                          <motion.div
                            key={coin.name}
                            initial={{ opacity: 0, scale: 0.88 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: cIdx * 0.05, type: 'spring', stiffness: 280, damping: 22 }}
                            whileHover={{ y: -3, boxShadow: `0 8px 24px ${meta.shadow}` }}
                            className="rounded-2xl border p-3.5 relative overflow-hidden cursor-pointer"
                            style={{
                              background: `linear-gradient(145deg, ${meta.color}0E, #0A0A12)`,
                              borderColor: meta.color + '30',
                              boxShadow: `0 2px 10px ${meta.shadow}`,
                            }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-b from-white/4 to-transparent pointer-events-none" />
                            {/* Shimmer */}
                            <motion.div
                              className="absolute inset-0 pointer-events-none rounded-2xl"
                              style={{ background: `linear-gradient(110deg, transparent 30%, ${meta.color}14 50%, transparent 70%)` }}
                              initial={{ x: '-100%' }}
                              animate={{ x: '200%' }}
                              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 4, ease: 'easeInOut' }}
                            />

                            {/* Quantity badge */}
                            <div
                              className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black font-mono border"
                              style={{
                                background: meta.color + '22',
                                borderColor: meta.color + '55',
                                color: meta.color,
                              }}
                            >
                              {coin.quantity}
                            </div>

                            <CoinLogoSmall logoUrl={coin.logoUrl} name={coin.name} tierColor={meta.color} />
                            <div className="mt-2.5 space-y-0.5">
                              <h3 className="font-display font-bold text-sm leading-tight">{coin.name}</h3>
                              <p className="text-[9px] text-muted-foreground line-clamp-2 leading-snug">{coin.tagline}</p>
                            </div>
                            <button
                              onClick={() => setRedeemCoin(coin.name)}
                              className="w-full text-[9px] h-6 mt-2.5 uppercase font-bold tracking-wider rounded-lg border transition-all opacity-35 cursor-not-allowed"
                              style={{ borderColor: meta.color + '30', color: meta.color }}
                            >
                              Redeem
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {coinsInTier.map((coin, cIdx) => (
                          <motion.div
                            key={coin.name}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: cIdx * 0.04 }}
                            className="rounded-xl border p-3 flex items-center gap-3 relative overflow-hidden"
                            style={{
                              background: `linear-gradient(135deg, ${meta.color}08, #0A0A12)`,
                              borderColor: meta.color + '25',
                            }}
                          >
                            <CoinLogoSmall logoUrl={coin.logoUrl} name={coin.name} tierColor={meta.color} />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-display font-bold text-sm leading-tight">{coin.name}</h3>
                              <p className="text-[10px] text-muted-foreground truncate">{coin.tagline}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1 shrink-0">
                              <span className="text-[10px] font-mono font-bold" style={{ color: meta.color }}>×{coin.quantity}</span>
                              <span className="text-[9px] text-muted-foreground font-mono">${(coin.marketCap / 1000).toFixed(0)}k</span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </>
      )}

      {/* Redeem Modal */}
      <Dialog open={!!redeemCoin} onOpenChange={() => setRedeemCoin(null)}>
        <DialogContent className="border-border w-[85vw] rounded-2xl overflow-hidden p-0">
          <div
            className="p-5 relative"
            style={{ background: 'linear-gradient(155deg, #0F0F1E, #07070D)' }}
          >
            <div className="absolute inset-0 bg-dot opacity-30 pointer-events-none" />
            <DialogHeader className="relative z-10">
              <DialogTitle className="font-display text-xl uppercase text-center">Redeem Coin</DialogTitle>
            </DialogHeader>
            <div className="text-center space-y-3 py-3 relative z-10">
              <p className="text-sm text-muted-foreground">
                Redemption for <strong className="text-white">{redeemCoin}</strong> opens when this project joins the CoinRip reward pool.
              </p>
              <p className="text-xs text-zinc-500">Stay tuned — integrations are launching soon.</p>
              <Button
                className="w-full bg-primary text-black font-bold uppercase"
                style={{ boxShadow: '0 4px 16px rgba(226,255,0,0.35)' }}
                onClick={() => setRedeemCoin(null)}
              >
                Got it
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

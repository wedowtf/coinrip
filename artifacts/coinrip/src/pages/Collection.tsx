import { useState } from "react";
import { useGameState } from "@/hooks/use-game-state";
import { COINS, getTier, CATEGORIES } from "@/lib/dataset";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trophy, Zap, Grid3X3, List } from "lucide-react";

function CoinLogoSmall({ logoUrl, name, tierColor }: { logoUrl: string; name: string; tierColor: string }) {
  const [err, setErr] = useState(false);
  return (
    <div
      className="w-11 h-11 rounded-full flex items-center justify-center border-2 overflow-hidden shrink-0"
      style={{ borderColor: tierColor, background: `${tierColor}22` }}
    >
      {!err ? (
        <img src={logoUrl} alt={name} className="w-7 h-7 object-contain" onError={() => setErr(true)} />
      ) : (
        <span className="font-display font-black text-lg" style={{ color: tierColor }}>{name.charAt(0)}</span>
      )}
    </div>
  );
}

const TIER_META: Record<string, { color: string; label: string }> = {
  SINGULARITY: { color: '#FBBF24', label: 'Singularity' },
  PULSAR:      { color: '#D946EF', label: 'Pulsar' },
  NOVA:        { color: '#06B6D4', label: 'Nova' },
  FLARE:       { color: '#F97316', label: 'Flare' },
  SPARK:       { color: '#E2E8F0', label: 'Spark' },
};

export default function Collection() {
  const { state } = useGameState();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [redeemCoin, setRedeemCoin] = useState<string | null>(null);

  if (!state.username) {
    return (
      <div className="p-6 text-center mt-20 space-y-2">
        <Trophy className="w-12 h-12 mx-auto text-muted-foreground" />
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
  const rarestCoin = enrichedCollection.sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0))[0];
  const uniqueCount = enrichedCollection.length;

  const categories = ['All', ...CATEGORIES.filter(cat =>
    enrichedCollection.some(c => c.category === cat)
  )];

  const filtered = selectedCategory === 'All'
    ? enrichedCollection
    : enrichedCollection.filter(c => c.category === selectedCategory);

  const tiers = ['SINGULARITY', 'PULSAR', 'NOVA', 'FLARE', 'SPARK'] as const;

  return (
    <div className="p-6 pb-24 flex flex-col gap-6">
      {/* Header Stats */}
      <div className="space-y-3">
        <h1 className="text-2xl font-display font-extrabold uppercase tracking-tighter">My Vault</h1>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-secondary/40 border border-border rounded-xl p-3 text-center">
            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Total Rips</p>
            <p className="font-mono text-lg font-bold">{totalCoins}</p>
          </div>
          <div className="bg-secondary/40 border border-border rounded-xl p-3 text-center">
            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Unique</p>
            <p className="font-mono text-lg font-bold text-primary">{uniqueCount}</p>
          </div>
          <div className="bg-secondary/40 border border-border rounded-xl p-3 text-center">
            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Balance</p>
            <p className="font-mono text-lg font-bold text-primary">{state.coinBalance}</p>
          </div>
        </div>
        {rarestCoin && (
          <div className="bg-secondary/30 border border-border rounded-xl p-3 flex items-center gap-3">
            <Trophy className="w-4 h-4 text-yellow-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Rarest Coin</p>
              <p className="font-bold text-sm truncate text-white">{rarestCoin.name}</p>
            </div>
            <span
              className="text-[9px] font-black uppercase tracking-wider ml-auto px-2 py-0.5 rounded-full shrink-0"
              style={{ backgroundColor: `${TIER_META[rarestCoin.tier]?.color}22`, color: TIER_META[rarestCoin.tier]?.color }}
            >
              {rarestCoin.tier}
            </span>
          </div>
        )}
      </div>

      {totalCoins === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl space-y-2">
          <Zap className="w-10 h-10 mx-auto text-muted-foreground" />
          <p className="text-muted-foreground font-bold">Your vault is empty.</p>
          <p className="text-sm text-zinc-500">Go rip some packs!</p>
        </div>
      ) : (
        <>
          {/* Filters & View Toggle */}
          <div className="flex items-center gap-2">
            <div className="flex-1 flex overflow-x-auto gap-2 scrollbar-none">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className="shrink-0 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full border transition-all"
                  style={{
                    backgroundColor: selectedCategory === cat ? '#E2FF00' : 'transparent',
                    borderColor: selectedCategory === cat ? '#E2FF00' : '#2A2A35',
                    color: selectedCategory === cat ? '#000' : '#A0A0B0',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="flex gap-1 shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg ${viewMode === 'grid' ? 'bg-primary text-black' : 'text-muted-foreground'}`}
              >
                <Grid3X3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg ${viewMode === 'list' ? 'bg-primary text-black' : 'text-muted-foreground'}`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Coins by Tier */}
          <div className="flex flex-col gap-6">
            {tiers.map(tier => {
              const coinsInTier = filtered.filter(c => c.tier === tier);
              if (coinsInTier.length === 0) return null;
              const meta = TIER_META[tier];

              return (
                <div key={tier} className={`tier-${tier.toLowerCase()}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: meta.color, boxShadow: `0 0 6px ${meta.color}` }} />
                    <h2 className="font-display text-sm font-black uppercase tracking-widest" style={{ color: meta.color }}>
                      {tier}
                    </h2>
                    <span className="text-[10px] font-mono text-muted-foreground">({coinsInTier.length})</span>
                  </div>

                  {viewMode === 'grid' ? (
                    <div className="grid grid-cols-2 gap-3">
                      {coinsInTier.map(coin => (
                        <div key={coin.name} className="bg-card rounded-2xl border border-border p-3.5 relative overflow-hidden">
                          <div className="absolute top-2 right-2 bg-background border border-border rounded-full w-5 h-5 flex items-center justify-center text-[9px] font-black font-mono" style={{ color: meta.color }}>
                            {coin.quantity}
                          </div>
                          <CoinLogoSmall logoUrl={coin.logoUrl} name={coin.name} tierColor={meta.color} />
                          <div className="mt-2.5 space-y-0.5">
                            <h3 className="font-display font-bold text-sm leading-tight">{coin.name}</h3>
                            <p className="text-[9px] text-muted-foreground line-clamp-2 leading-snug">{coin.tagline}</p>
                          </div>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setRedeemCoin(coin.name)}
                            className="w-full text-[9px] h-6 mt-2.5 uppercase font-bold tracking-wider opacity-40 cursor-not-allowed"
                          >
                            Redeem
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {coinsInTier.map(coin => (
                        <div key={coin.name} className="bg-card rounded-xl border border-border p-3 flex items-center gap-3">
                          <CoinLogoSmall logoUrl={coin.logoUrl} name={coin.name} tierColor={meta.color} />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-display font-bold text-sm leading-tight">{coin.name}</h3>
                            <p className="text-[10px] text-muted-foreground truncate">{coin.tagline}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className="text-[10px] font-mono font-bold" style={{ color: meta.color }}>×{coin.quantity}</span>
                            <span className="text-[9px] text-muted-foreground font-mono">${(coin.marketCap / 1000).toFixed(0)}k</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Redeem Modal */}
      <Dialog open={!!redeemCoin} onOpenChange={() => setRedeemCoin(null)}>
        <DialogContent className="bg-card border-border w-[85vw] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl uppercase text-center">Redeem Coin</DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              Redemption for <strong className="text-white">{redeemCoin}</strong> opens when this project joins the CoinRip reward pool.
            </p>
            <p className="text-xs text-zinc-500">Stay tuned — integrations are launching soon.</p>
            <Button className="w-full bg-primary text-black font-bold uppercase" onClick={() => setRedeemCoin(null)}>
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

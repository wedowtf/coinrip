import { useGameState } from "@/hooks/use-game-state";
import { COINS, getTier } from "@/lib/dataset";
import { Button } from "@/components/ui/button";

export default function Collection() {
  const { state } = useGameState();

  if (!state.username) {
    return (
      <div className="p-6 text-center mt-20">
        <h2 className="font-display text-2xl font-bold uppercase">Log in to view collection</h2>
      </div>
    );
  }

  // Enrich collection data with full coin info
  const enrichedCollection = state.collection.map(c => {
    const coinDef = COINS.find(def => def.name === c.name);
    return {
      ...c,
      ...coinDef
    };
  }).filter(c => c.name) as (typeof state.collection[0] & typeof COINS[0])[];

  const totalCoins = state.collection.reduce((acc, c) => acc + c.quantity, 0);

  // Group by tier
  const tiers = ['SINGULARITY', 'PULSAR', 'NOVA', 'FLARE', 'SPARK'] as const;

  return (
    <div className="p-6 pb-24 flex flex-col gap-8">
      <div className="space-y-2 border-b border-border pb-6">
        <h1 className="text-3xl font-display font-extrabold uppercase tracking-tighter">My Vault</h1>
        <div className="flex gap-4">
          <div className="bg-secondary/50 rounded-lg p-3 flex-1 border border-border">
            <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Total Rips</div>
            <div className="font-mono text-xl font-bold">{totalCoins}</div>
          </div>
          <div className="bg-secondary/50 rounded-lg p-3 flex-1 border border-border">
            <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Coins Earned</div>
            <div className="font-mono text-xl font-bold text-primary">{state.coinBalance}</div>
          </div>
        </div>
      </div>

      {totalCoins === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
          <p className="text-muted-foreground font-medium">Your vault is empty.</p>
          <p className="text-sm text-zinc-500 mt-1">Go rip some packs!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {tiers.map(tier => {
            const coinsInTier = enrichedCollection.filter(c => c.tier === tier);
            if (coinsInTier.length === 0) return null;

            return (
              <div key={tier} className={`tier-${tier.toLowerCase()}`}>
                <h2 className="font-display text-xl font-bold uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: 'var(--tier-color)' }}>
                  {tier} <span className="text-sm font-mono text-muted-foreground opacity-50">({coinsInTier.length})</span>
                </h2>
                
                <div className="grid grid-cols-2 gap-4">
                  {coinsInTier.map(coin => (
                    <div key={coin.name} className="bg-card rounded-xl border border-border p-4 relative overflow-hidden">
                      {/* Quantity Badge */}
                      <div className="absolute top-2 right-2 bg-background border border-border rounded-full w-6 h-6 flex items-center justify-center text-[10px] font-bold font-mono">
                        x{coin.quantity}
                      </div>
                      
                      <div className="w-12 h-12 rounded-full flex items-center justify-center border-2 mb-3 shadow-[0_0_10px_var(--tier-glow)]" style={{ borderColor: 'var(--tier-color)', backgroundColor: 'var(--tier-glow)' }}>
                        <span className="font-display font-bold text-xl" style={{ color: 'var(--tier-color)' }}>{coin.name.charAt(0)}</span>
                      </div>
                      
                      <h3 className="font-display font-bold text-sm leading-tight mb-1">{coin.name}</h3>
                      <p className="text-[10px] text-muted-foreground line-clamp-2 mb-3 h-7">{coin.tagline}</p>
                      
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="w-full text-[10px] h-7 uppercase font-bold tracking-wider opacity-50 cursor-not-allowed"
                        title="Redemption opens when this project joins the CoinRip reward pool"
                      >
                        Redeem
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
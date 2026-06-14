import { useState } from "react";
import { useGameState } from "@/hooks/use-game-state";
import { COINS } from "@/lib/dataset";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { LogOut, Package, LayoutGrid, Trophy, Zap, Star, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const TIER_META = {
  SINGULARITY: { color: '#FBBF24', label: 'Singularity', order: 0 },
  PULSAR:      { color: '#D946EF', label: 'Pulsar', order: 1 },
  NOVA:        { color: '#06B6D4', label: 'Nova', order: 2 },
  FLARE:       { color: '#F97316', label: 'Flare', order: 3 },
  SPARK:       { color: '#E2E8F0', label: 'Spark', order: 4 },
} as const;

type TierKey = keyof typeof TIER_META;

const getRank = (totalRips: number): { title: string; color: string } => {
  if (totalRips >= 100) return { title: 'ORYNTH LEGEND', color: '#FBBF24' };
  if (totalRips >= 50)  return { title: 'COLLECTOR ELITE', color: '#D946EF' };
  if (totalRips >= 20)  return { title: 'VAULT SEEKER', color: '#06B6D4' };
  if (totalRips >= 6)   return { title: 'PACK JUNKIE', color: '#F97316' };
  return { title: 'ROOKIE RIPPER', color: '#E2E8F0' };
};

function CoinLogo({ logoUrl, name, color }: { logoUrl: string; name: string; color: string }) {
  const [err, setErr] = useState(false);
  return (
    <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden border-2 shrink-0" style={{ borderColor: color + '66', background: color + '18' }}>
      {!err && logoUrl ? (
        <img src={logoUrl} alt={name} className="w-7 h-7 object-contain" onError={() => setErr(true)} />
      ) : (
        <span className="font-display font-black text-sm" style={{ color }}>{name.charAt(0)}</span>
      )}
    </div>
  );
}

export default function Profile() {
  const { state, logout, isLoaded } = useGameState();
  const [, setLocation] = useLocation();
  const [showLogout, setShowLogout] = useState(false);

  if (!isLoaded) return <div className="min-h-[80vh]" />;

  if (!state.username) {
    return (
      <div className="p-6 text-center mt-20 space-y-3">
        <Trophy className="w-14 h-14 mx-auto text-muted-foreground" />
        <h2 className="font-display text-2xl font-bold uppercase">Log in to view profile</h2>
        <p className="text-muted-foreground text-sm">Your stats and collection live here</p>
        <Button className="bg-primary text-black font-bold" onClick={() => setLocation('/')}>
          Go Home
        </Button>
      </div>
    );
  }

  const rank = getRank(state.totalRips || 0);
  const uniqueCount = state.collection.length;
  const totalCoins = COINS.length;
  const completionPct = Math.round((uniqueCount / totalCoins) * 100);

  const enriched = state.collection.map(c => {
    const def = COINS.find(d => d.name === c.name);
    return def ? { ...c, ...def } : null;
  }).filter(Boolean) as (typeof COINS[0] & { quantity: number })[];

  const highestTier = (['SINGULARITY', 'PULSAR', 'NOVA', 'FLARE', 'SPARK'] as TierKey[])
    .find(t => enriched.some(c => c.tier === t));

  const recentCoins = (state.recentPulls || []).slice(0, 6).map(name => {
    const def = COINS.find(d => d.name === name);
    return def ?? null;
  }).filter(Boolean) as typeof COINS;

  const tierCounts = (['SINGULARITY', 'PULSAR', 'NOVA', 'FLARE', 'SPARK'] as TierKey[]).map(tier => {
    const total = COINS.filter(c => c.tier === tier).length;
    const owned = enriched.filter(c => c.tier === tier).length;
    return { tier, total, owned, color: TIER_META[tier].color };
  });

  return (
    <div className="p-5 pb-28 flex flex-col gap-5">

      {/* ─── User Hero Card ─── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl overflow-hidden border border-border bg-card p-5"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-purple-500/5 pointer-events-none" />
        <div className="relative flex items-start gap-4">
          {/* Avatar */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border-2"
            style={{
              background: `linear-gradient(135deg, ${rank.color}44, ${rank.color}11)`,
              borderColor: rank.color + '55',
            }}
          >
            <span className="font-display font-black text-3xl" style={{ color: rank.color }}>
              {state.username.charAt(0).toUpperCase()}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="font-display font-black text-xl text-white leading-tight truncate">
              {state.username}
            </h2>
            <div
              className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest"
              style={{ background: rank.color + '22', color: rank.color }}
            >
              <Star className="w-2.5 h-2.5" />
              {rank.title}
            </div>
          </div>

          {/* COINS badge */}
          <div className="shrink-0 text-right">
            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Balance</p>
            <p className="font-mono font-black text-xl text-primary">{state.coinBalance}</p>
            <p className="text-[8px] text-muted-foreground">COINS</p>
          </div>
        </div>
      </motion.div>

      {/* ─── Stats Row ─── */}
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { label: 'Total Rips', value: state.totalRips || 0, icon: <Zap className="w-3 h-3" />, color: '#E2FF00' },
          { label: 'Unique Coins', value: uniqueCount, icon: <Package className="w-3 h-3" />, color: '#06B6D4' },
          { label: 'Best Tier', value: highestTier ? TIER_META[highestTier].label : '—', icon: <Trophy className="w-3 h-3" />, color: highestTier ? TIER_META[highestTier].color : '#555' },
        ].map(s => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-3 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/3 to-transparent pointer-events-none" />
            <div className="flex items-center justify-center gap-1 mb-1" style={{ color: s.color }}>
              {s.icon}
              <p className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground">
                {s.label}
              </p>
            </div>
            <p className="font-display font-black text-base text-white leading-tight">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* ─── Collection Progress ─── */}
      <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-black text-sm uppercase tracking-widest text-white">Collection</h3>
          <span className="text-xs font-mono font-bold text-primary">{uniqueCount} / {totalCoins}</span>
        </div>

        {/* Master progress bar */}
        <div className="relative h-3 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ background: 'linear-gradient(90deg, #E2FF00, #06B6D4)' }}
            initial={{ width: 0 }}
            animate={{ width: `${completionPct}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
        <p className="text-[10px] text-muted-foreground font-medium text-center">{completionPct}% complete</p>

        {/* Per-tier bars */}
        <div className="space-y-2 pt-1">
          {tierCounts.map(({ tier, total, owned, color }) => (
            <div key={tier} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
              <span className="text-[9px] font-black uppercase shrink-0 w-24" style={{ color }}>{tier}</span>
              <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: color }}
                  initial={{ width: 0 }}
                  animate={{ width: total > 0 ? `${(owned / total) * 100}%` : '0%' }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                />
              </div>
              <span className="text-[9px] font-mono text-muted-foreground shrink-0 w-8 text-right">{owned}/{total}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Recent Pulls ─── */}
      {recentCoins.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-display font-black text-sm uppercase tracking-widest text-white">Recent Pulls</h3>
          <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
            {recentCoins.map((coin, i) => {
              const meta = TIER_META[coin.tier as TierKey];
              return (
                <motion.div
                  key={`${coin.name}-${i}`}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex-shrink-0 flex flex-col items-center gap-1.5 w-16"
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center border overflow-hidden"
                    style={{ borderColor: meta.color + '55', background: meta.color + '18' }}
                  >
                    <CoinLogo logoUrl={coin.logoUrl} name={coin.name} color={meta.color} />
                  </div>
                  <p className="text-[8px] font-bold text-center leading-tight text-zinc-400 truncate w-full text-center">
                    {coin.name}
                  </p>
                  <div
                    className="text-[7px] font-black uppercase px-1.5 py-0.5 rounded-full"
                    style={{ background: meta.color + '25', color: meta.color }}
                  >
                    {coin.tier === 'SINGULARITY' ? 'SING' : coin.tier}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Quick Actions ─── */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setLocation('/')}
          className="flex items-center justify-between bg-card border border-border rounded-2xl p-4 text-left active:scale-95 transition-transform"
        >
          <div>
            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Go</p>
            <p className="font-display font-black text-sm text-white">Rip Packs</p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center">
            <Package className="w-4 h-4 text-primary" />
          </div>
        </button>

        <button
          onClick={() => setLocation('/collection')}
          className="flex items-center justify-between bg-card border border-border rounded-2xl p-4 text-left active:scale-95 transition-transform"
        >
          <div>
            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Browse</p>
            <p className="font-display font-black text-sm text-white">My Vault</p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 flex items-center justify-center">
            <LayoutGrid className="w-4 h-4 text-cyan-400" />
          </div>
        </button>
      </div>

      {/* ─── Achievements ─── */}
      <div className="space-y-2">
        <h3 className="font-display font-black text-sm uppercase tracking-widest text-white">Achievements</h3>
        <div className="grid grid-cols-1 gap-2">
          {[
            { icon: '🎯', title: 'First Blood', desc: 'Rip your first pack', done: (state.totalRips || 0) >= 1 },
            { icon: '🔥', title: 'Pack Addict', desc: 'Rip 10 packs', done: (state.totalRips || 0) >= 10 },
            { icon: '⚡', title: 'FLARE Hunter', desc: 'Collect a FLARE coin', done: enriched.some(c => c.tier === 'FLARE') },
            { icon: '💎', title: 'Nova Breaker', desc: 'Collect a NOVA coin', done: enriched.some(c => c.tier === 'NOVA') },
            { icon: '🌸', title: 'Pulsar Touch', desc: 'Collect a PULSAR coin', done: enriched.some(c => c.tier === 'PULSAR') },
            { icon: '✦', title: 'Singularity', desc: 'Pull the ultra rare', done: enriched.some(c => c.tier === 'SINGULARITY') },
          ].map(a => (
            <div
              key={a.title}
              className={`flex items-center gap-3 rounded-xl border p-3 transition-all ${a.done ? 'border-primary/30 bg-primary/5' : 'border-border bg-card opacity-50'}`}
            >
              <span className="text-xl shrink-0">{a.done ? a.icon : '🔒'}</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-xs text-white">{a.title}</p>
                <p className="text-[10px] text-muted-foreground">{a.desc}</p>
              </div>
              {a.done && (
                <span className="text-[9px] bg-primary text-black font-black px-1.5 py-0.5 rounded-full shrink-0">DONE</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ─── Logout ─── */}
      <button
        onClick={() => setShowLogout(true)}
        className="flex items-center justify-center gap-2 border border-red-500/30 rounded-2xl p-3.5 text-red-400 text-sm font-bold hover:bg-red-500/10 transition-colors active:scale-95"
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </button>

      {/* Confirm Logout Modal */}
      <Dialog open={showLogout} onOpenChange={setShowLogout}>
        <DialogContent className="bg-card border-border w-[85vw] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl uppercase text-center">Sign Out?</DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Your vault is saved locally. You can log back in with the same username anytime.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowLogout(false)}>Cancel</Button>
              <Button
                className="flex-1 bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 font-bold"
                onClick={() => { logout(); setShowLogout(false); }}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

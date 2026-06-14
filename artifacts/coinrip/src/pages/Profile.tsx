import { useState } from "react";
  import { useGameState } from "@/hooks/use-game-state";
  import { useAuth } from "@/hooks/use-auth";
  import { COINS } from "@/lib/dataset";
  import { motion, AnimatePresence } from "framer-motion";
  import { useLocation } from "wouter";
  import { LogOut, Package, LayoutGrid, Trophy, Zap, Star, Mail } from "lucide-react";
  import { Button } from "@/components/ui/button";
  import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
  import { LoginModal } from "@/components/auth/LoginModal";

  const TIER_META = {
    SINGULARITY: { color: '#FBBF24', label: 'Singularity', shadow: 'rgba(251,191,36,0.4)', order: 0 },
    PULSAR:      { color: '#D946EF', label: 'Pulsar',      shadow: 'rgba(217,70,239,0.35)', order: 1 },
    NOVA:        { color: '#06B6D4', label: 'Nova',        shadow: 'rgba(6,182,212,0.35)', order: 2 },
    FLARE:       { color: '#F97316', label: 'Flare',       shadow: 'rgba(249,115,22,0.3)', order: 3 },
    SPARK:       { color: '#E2E8F0', label: 'Spark',       shadow: 'rgba(226,232,240,0.2)', order: 4 },
  } as const;

  type TierKey = keyof typeof TIER_META;

  const getRank = (totalFlips: number): { title: string; color: string; shadow: string } => {
    if (totalFlips >= 100) return { title: 'ORYNTH LEGEND',   color: '#FBBF24', shadow: 'rgba(251,191,36,0.4)' };
    if (totalFlips >= 50)  return { title: 'COLLECTOR ELITE', color: '#D946EF', shadow: 'rgba(217,70,239,0.35)' };
    if (totalFlips >= 20)  return { title: 'VAULT SEEKER',    color: '#06B6D4', shadow: 'rgba(6,182,212,0.35)' };
    if (totalFlips >= 6)   return { title: 'PACK JUNKIE',     color: '#F97316', shadow: 'rgba(249,115,22,0.3)' };
    return { title: 'ROOKIE FLIPPER', color: '#E2E8F0', shadow: 'rgba(226,232,240,0.2)' };
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
    const { user } = useAuth();
    const [, setLocation] = useLocation();
    const [showLogout, setShowLogout] = useState(false);
    const [showLogin, setShowLogin] = useState(false);

    if (!isLoaded) return <div className="min-h-[80vh]" />;

    if (!user) {
      return (
        <>
          <div className="p-6 text-center mt-16 space-y-5">
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            >
              <Trophy className="w-16 h-16 mx-auto" style={{ color: '#E2FF00', filter: 'drop-shadow(0 0 16px rgba(226,255,0,0.6))' }} />
            </motion.div>
            <div className="space-y-1.5">
              <h2 className="font-display text-2xl font-black uppercase">Your Vault Awaits</h2>
              <p className="text-muted-foreground text-sm px-4">Sign in to track your collection, stats, and achievements</p>
            </div>
            <div className="flex flex-col gap-2.5 max-w-xs mx-auto pt-2">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                <Button
                  className="w-full h-12 bg-primary text-black font-display font-black uppercase rounded-2xl"
                  style={{ boxShadow: '0 4px 20px rgba(226,255,0,0.4)' }}
                  onClick={() => setShowLogin(true)}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Sign In with Magic Link
                </Button>
              </motion.div>
              <Button variant="ghost" className="text-zinc-500 text-sm" onClick={() => setLocation('/')}>
                Browse packs first
              </Button>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-2 max-w-xs mx-auto opacity-40">
              {[
                { icon: '🎴', label: 'Collection' },
                { icon: '🏆', label: 'Achievements' },
                { icon: '📊', label: 'Stats' },
              ].map(item => (
                <div key={item.label} className="flex flex-col items-center gap-1.5 border border-white/8 rounded-2xl p-3">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-[10px] font-black uppercase text-zinc-500">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
          <LoginModal open={showLogin} onOpenChange={setShowLogin} />
        </>
      );
    }

    const rank = getRank(state.totalFlips || 0);
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
      return { tier, total, owned, color: TIER_META[tier].color, shadow: TIER_META[tier].shadow };
    });

    const userAvatar = user?.user_metadata?.avatar_url as string | undefined;

    return (
      <div className="p-5 pb-28 flex flex-col gap-5">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl overflow-hidden border p-5"
          style={{
            borderColor: rank.color + '35',
            background: `linear-gradient(155deg, ${rank.color}12 0%, #0A0A14 50%, ${rank.shadow} 100%)`,
            boxShadow: `0 0 40px ${rank.shadow}, inset 0 1px 0 rgba(255,255,255,0.07)`,
          }}
        >
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <motion.div className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl" style={{ background: rank.color }}
              animate={{ scale: [1, 1.3, 1], opacity: [0.12, 0.2, 0.12] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} />
            <motion.div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full blur-3xl" style={{ background: rank.color }}
              animate={{ scale: [1.1, 0.85, 1.1], opacity: [0.08, 0.15, 0.08] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${rank.color}60, transparent)` }} />
          <div className="relative flex items-start gap-4">
            <motion.div
              className="w-16 h-16 rounded-2xl shrink-0 border-2 relative overflow-hidden flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${rank.color}44, ${rank.color}11)`, borderColor: rank.color + '60' }}
              animate={{ boxShadow: [`0 0 0px ${rank.shadow}`, `0 0 20px ${rank.shadow}`, `0 0 0px ${rank.shadow}`] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              {userAvatar ? (
                <img src={userAvatar} alt={state.username ?? ''} className="w-full h-full object-cover" />
              ) : (
                <span className="font-display font-black text-3xl" style={{ color: rank.color, textShadow: `0 0 20px ${rank.color}` }}>
                  {(state.username ?? 'F').charAt(0).toUpperCase()}
                </span>
              )}
            </motion.div>
            <div className="flex-1 min-w-0">
              <h2 className="font-display font-black text-xl text-white leading-tight truncate">{state.username}</h2>
              {user?.email && <p className="text-[10px] text-zinc-500 truncate mt-0.5">{user.email}</p>}
              <motion.div
                className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest"
                style={{ background: rank.color + '22', color: rank.color, border: `1px solid ${rank.color}40`, boxShadow: `0 0 10px ${rank.shadow}` }}
                animate={{ boxShadow: [`0 0 6px ${rank.shadow}`, `0 0 16px ${rank.shadow}`, `0 0 6px ${rank.shadow}`] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                <Star className="w-2.5 h-2.5" />{rank.title}
              </motion.div>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Balance</p>
              <motion.p className="font-mono font-black text-xl" style={{ color: '#E2FF00', textShadow: '0 0 12px rgba(226,255,0,0.7)' }}
                key={state.coinBalance} animate={{ scale: [1, 1.14, 1] }} transition={{ duration: 0.3 }}>
                {state.coinBalance}
              </motion.p>
              <p className="text-[8px] text-muted-foreground">COINS</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-3 gap-2.5">
          {[
            { label: 'Total Flips',  value: state.totalFlips || 0,                           icon: <Zap className="w-3 h-3" />,     color: '#E2FF00' },
            { label: 'Unique Coins', value: uniqueCount,                                      icon: <Package className="w-3 h-3" />, color: '#06B6D4' },
            { label: 'Best Tier',    value: highestTier ? TIER_META[highestTier].label : '—', icon: <Trophy className="w-3 h-3" />,  color: highestTier ? TIER_META[highestTier].color : '#555' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 + 0.1 }}
              className="relative overflow-hidden rounded-2xl p-3 text-center border"
              style={{ background: `linear-gradient(145deg, ${s.color}12, #0A0A12)`, borderColor: s.color + '25', boxShadow: `0 0 16px ${s.color}10` }}>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-px" style={{ background: `linear-gradient(90deg, transparent, ${s.color}55, transparent)` }} />
              <div className="flex items-center justify-center gap-1 mb-1" style={{ color: s.color }}>
                {s.icon}<p className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground">{s.label}</p>
              </div>
              <p className="font-display font-black text-base text-white leading-tight">{s.value}</p>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="border border-border rounded-2xl p-4 space-y-3 relative overflow-hidden"
          style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.02), #0A0A12)' }}>
          <div className="flex items-center justify-between">
            <h3 className="font-display font-black text-sm uppercase tracking-widest text-white">Collection</h3>
            <span className="text-xs font-mono font-bold text-primary">{uniqueCount} / {totalCoins}</span>
          </div>
          <div className="relative h-2.5 bg-secondary rounded-full overflow-hidden">
            <motion.div className="absolute inset-y-0 left-0 rounded-full"
              style={{ background: 'linear-gradient(90deg, #E2FF00, #06B6D4, #D946EF)' }}
              initial={{ width: 0 }} animate={{ width: `${completionPct}%` }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }} />
            <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent pointer-events-none rounded-full" />
          </div>
          <p className="text-[10px] text-muted-foreground font-medium text-center">{completionPct}% complete</p>
          <div className="space-y-2 pt-1">
            {tierCounts.map(({ tier, total, owned, color, shadow }, i) => (
              <div key={tier} className="flex items-center gap-2">
                <motion.div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }}
                  animate={{ boxShadow: [`0 0 4px ${color}80`, `0 0 10px ${color}`, `0 0 4px ${color}80`] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }} />
                <span className="text-[9px] font-black uppercase shrink-0 w-24" style={{ color }}>{tier}</span>
                <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                  <motion.div className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${color}, ${color}AA)`, boxShadow: total > 0 && owned > 0 ? `0 0 6px ${shadow}` : 'none' }}
                    initial={{ width: 0 }} animate={{ width: total > 0 ? `${(owned / total) * 100}%` : '0%' }}
                    transition={{ duration: 0.9, ease: 'easeOut', delay: i * 0.08 + 0.15 }} />
                </div>
                <span className="text-[9px] font-mono text-muted-foreground shrink-0 w-8 text-right">{owned}/{total}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {recentCoins.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-3">
            <h3 className="font-display font-black text-sm uppercase tracking-widest text-white">Recent Pulls</h3>
            <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
              {recentCoins.map((coin, i) => {
                const meta = TIER_META[coin.tier as TierKey];
                return (
                  <motion.div key={`${coin.name}-${i}`} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.06, type: 'spring', stiffness: 280, damping: 20 }}
                    className="flex-shrink-0 flex flex-col items-center gap-1.5 w-16">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center border overflow-hidden relative"
                      style={{ borderColor: meta.color + '50', background: `linear-gradient(145deg, ${meta.color}18, #0A0A12)`, boxShadow: `0 0 10px ${meta.shadow}` }}>
                      <CoinLogo logoUrl={coin.logoUrl} name={coin.name} color={meta.color} />
                      {i === 0 && <div className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-primary animate-pulse" style={{ boxShadow: '0 0 6px rgba(226,255,0,0.8)' }} />}
                    </div>
                    <p className="text-[8px] font-bold text-center leading-tight text-zinc-400 truncate w-full">{coin.name}</p>
                    <div className="text-[7px] font-black uppercase px-1.5 py-0.5 rounded-full"
                      style={{ background: meta.color + '22', color: meta.color, border: `1px solid ${meta.color}35` }}>
                      {coin.tier === 'SINGULARITY' ? 'SING' : coin.tier}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Go', sub: 'Flip Packs', href: '/', icon: <Package className="w-4 h-4" />, color: '#E2FF00' },
            { label: 'Browse', sub: 'My Vault', href: '/collection', icon: <LayoutGrid className="w-4 h-4" />, color: '#06B6D4' },
          ].map(item => (
            <motion.button key={item.href} onClick={() => setLocation(item.href)}
              whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.96 }}
              className="flex items-center justify-between rounded-2xl p-4 text-left border relative overflow-hidden"
              style={{ background: `linear-gradient(145deg, ${item.color}0E, #0A0A12)`, borderColor: item.color + '25' }}>
              <div className="absolute inset-0 bg-gradient-to-b from-white/4 to-transparent pointer-events-none" />
              <div className="relative z-10">
                <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">{item.label}</p>
                <p className="font-display font-black text-sm text-white">{item.sub}</p>
              </div>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center relative z-10" style={{ background: item.color + '20', color: item.color }}>
                {item.icon}
              </div>
            </motion.button>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-2">
          <h3 className="font-display font-black text-sm uppercase tracking-widest text-white">Achievements</h3>
          <div className="grid grid-cols-1 gap-2">
            {[
              { icon: '🎯', title: 'First Blood',   desc: 'Flip your first pack',   done: (state.totalFlips || 0) >= 1,               color: '#E2FF00' },
              { icon: '🔥', title: 'Pack Addict',   desc: 'Flip 10 packs',          done: (state.totalFlips || 0) >= 10,              color: '#F97316' },
              { icon: '⚡', title: 'FLARE Hunter',  desc: 'Collect a FLARE coin',   done: enriched.some(c => c.tier === 'FLARE'),      color: '#F97316' },
              { icon: '💎', title: 'Nova Breaker',  desc: 'Collect a NOVA coin',    done: enriched.some(c => c.tier === 'NOVA'),       color: '#06B6D4' },
              { icon: '🌸', title: 'Pulsar Touch',  desc: 'Collect a PULSAR coin',  done: enriched.some(c => c.tier === 'PULSAR'),     color: '#D946EF' },
              { icon: '✦',  title: 'Singularity',   desc: 'Pull the ultra rare',    done: enriched.some(c => c.tier === 'SINGULARITY'), color: '#FBBF24' },
            ].map((a, i) => (
              <motion.div key={a.title} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 + 0.4 }}
                className="flex items-center gap-3 rounded-xl border p-3 transition-all relative overflow-hidden"
                style={a.done ? { borderColor: a.color + '35', background: `linear-gradient(135deg, ${a.color}0E, #0A0A12)`, boxShadow: `0 0 12px ${a.color}12` }
                  : { borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)', opacity: 0.45 }}>
                {a.done && (
                  <motion.div className="absolute inset-y-0 left-0 w-0.5 rounded-r-full" style={{ background: a.color }}
                    initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: i * 0.05 + 0.5, duration: 0.4 }} />
                )}
                <span className="text-xl shrink-0">{a.done ? a.icon : '🔒'}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-xs text-white">{a.title}</p>
                  <p className="text-[10px] text-muted-foreground">{a.desc}</p>
                </div>
                {a.done && <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full shrink-0" style={{ background: a.color, color: '#000' }}>DONE</span>}
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.button onClick={() => setShowLogout(true)} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}
          className="flex items-center justify-center gap-2 border border-red-500/25 rounded-2xl p-3.5 text-red-400 text-sm font-bold hover:bg-red-500/8 transition-colors">
          <LogOut className="w-4 h-4" />Sign Out
        </motion.button>

        <Dialog open={showLogout} onOpenChange={setShowLogout}>
          <DialogContent className="border-border w-[85vw] rounded-2xl overflow-hidden p-0">
            <div className="p-5 relative" style={{ background: 'linear-gradient(155deg, #0F0F1E, #07070D)' }}>
              <div className="absolute inset-0 bg-dot opacity-30 pointer-events-none" />
              <DialogHeader className="relative z-10">
                <DialogTitle className="font-display text-xl uppercase text-center">Sign Out?</DialogTitle>
              </DialogHeader>
              <div className="text-center space-y-4 py-3 relative z-10">
                <p className="text-sm text-muted-foreground">Vault kamu tersimpan. Login lagi kapan saja dengan akun yang sama.</p>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setShowLogout(false)}>Cancel</Button>
                  <Button className="flex-1 bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 font-bold"
                    onClick={() => { logout(); setShowLogout(false); }}>Sign Out</Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
  
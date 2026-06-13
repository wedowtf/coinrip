import { motion } from "framer-motion";
import { Zap, Star, Package, Coins, ExternalLink } from "lucide-react";

const TIERS = [
  { name: 'SPARK', color: '#E2E8F0', range: '< $7K mcap', pct: '45%', desc: 'The common ones. Everyone gets Sparks — and that\'s okay.' },
  { name: 'FLARE', color: '#F97316', range: '$7K–$10K', pct: '30%', desc: 'Heating up. Solid projects gaining traction.' },
  { name: 'NOVA', color: '#06B6D4', range: '$10K–$20K', pct: '15%', desc: 'These are building something real. Uncommon.' },
  { name: 'PULSAR', color: '#D946EF', range: '$20K–$100K', pct: '8%', desc: 'Top-tier ecosystem projects. Rare pulls.' },
  { name: 'SINGULARITY', color: '#FBBF24', range: '> $100K', pct: '2%', desc: 'Ultra rare. If you pull one — brag about it.' },
];

const ROADMAP = [
  { phase: '01', title: 'Launch', items: ['Pack opening game', '6 pack types', '20 orynth.dev coins', 'Local collection vault'], done: true },
  { phase: '02', title: 'Expand', items: ['Live orynth.dev price feeds', 'Project logo verification', 'Daily quests & streaks', 'Leaderboard'], done: false },
  { phase: '03', title: 'Redeem', items: ['Real coin redemptions', 'Project reward pools', 'Trading between users', 'NFT minting'], done: false },
];

export default function About() {
  return (
    <div className="p-6 pb-24 flex flex-col gap-10">
      {/* Hero */}
      <motion.div
        className="text-center space-y-3 mt-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-display font-extrabold uppercase italic tracking-tighter text-primary sticker-shadow">
          About CoinRip
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
          CoinRip is the pack-opening game for the <strong className="text-white">Orynth ecosystem</strong> — 
          real products, real market caps, collectible rarity.
        </p>
      </motion.div>

      {/* What is it */}
      <div className="space-y-3">
        <h2 className="font-display text-base font-black uppercase tracking-widest text-white flex items-center gap-2">
          <Package className="w-4 h-4 text-primary" /> What is CoinRip?
        </h2>
        <div className="bg-secondary/30 border border-border rounded-2xl p-4 space-y-3 text-sm text-zinc-300 leading-relaxed">
          <p>
            CoinRip turns <strong className="text-white">orynth.dev</strong> — a marketplace where products find their first users — into a collectible card game.
          </p>
          <p>
            Every product listed on Orynth has a real market cap. That market cap determines its <strong className="text-white">rarity tier</strong>. 
            Higher cap = rarer coin = harder to pull.
          </p>
          <p>
            Rip packs. Collect coins. Once projects join the reward pool, you'll be able to redeem your coins for real perks, discounts, and access.
          </p>
        </div>
      </div>

      {/* How to Play */}
      <div className="space-y-3">
        <h2 className="font-display text-base font-black uppercase tracking-widest text-white flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" /> How to Play
        </h2>
        <div className="flex flex-col gap-3">
          {[
            { step: '1', title: 'Log in', desc: 'Pick a username. Your vault is saved locally — no account needed.' },
            { step: '2', title: 'Rip a pack', desc: 'Grab your free daily pack, or spend COINS on premium packs with better drop rates.' },
            { step: '3', title: 'Collect coins', desc: 'Every rip adds a project coin to your vault and earns you 2 COINS.' },
            { step: '4', title: 'Redeem (soon)', desc: 'When projects join the reward pool, trade your coins for real perks.' },
          ].map(item => (
            <div key={item.step} className="flex gap-3 bg-secondary/30 border border-border rounded-xl p-3">
              <div className="w-7 h-7 rounded-full bg-primary text-black font-display font-black text-sm flex items-center justify-center shrink-0">
                {item.step}
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">{item.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tiers */}
      <div className="space-y-3">
        <h2 className="font-display text-base font-black uppercase tracking-widest text-white flex items-center gap-2">
          <Star className="w-4 h-4 text-primary" /> Rarity Tiers
        </h2>
        <div className="flex flex-col gap-2">
          {TIERS.map(tier => (
            <div key={tier.name} className="bg-secondary/30 border border-border rounded-xl p-3 flex gap-3">
              <div className="w-2 shrink-0 rounded-full mt-0.5" style={{ backgroundColor: tier.color, minHeight: '100%' }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-display font-black text-xs uppercase" style={{ color: tier.color }}>{tier.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-muted-foreground font-mono">{tier.range}</span>
                    <span className="text-[9px] font-black font-mono" style={{ color: tier.color }}>{tier.pct}</span>
                  </div>
                </div>
                <p className="text-[10px] text-zinc-400 leading-snug">{tier.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pack Economy */}
      <div className="space-y-3">
        <h2 className="font-display text-base font-black uppercase tracking-widest text-white flex items-center gap-2">
          <Coins className="w-4 h-4 text-primary" /> The COIN Economy
        </h2>
        <div className="bg-secondary/30 border border-border rounded-2xl p-4 space-y-2 text-sm">
          <div className="flex justify-between text-xs border-b border-border pb-2 mb-2">
            <span className="text-muted-foreground font-bold uppercase tracking-wider">Action</span>
            <span className="text-muted-foreground font-bold uppercase tracking-wider">COINS</span>
          </div>
          {[
            ['Any rip (any pack)', '+2'],
            ['Free Daily Pack', '0'],
            ['Mystery Pack', '-10'],
            ['Starter Bundle', '-25'],
            ['Blazer Pack', '-50'],
            ['Cosmic Vault', '-100'],
            ['Galaxy Pull', '-200'],
          ].map(([action, cost]) => (
            <div key={action} className="flex justify-between text-xs">
              <span className="text-zinc-300">{action}</span>
              <span className={`font-mono font-bold ${cost.startsWith('+') ? 'text-primary' : 'text-muted-foreground'}`}>{cost}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Roadmap */}
      <div className="space-y-3">
        <h2 className="font-display text-base font-black uppercase tracking-widest text-white">Roadmap</h2>
        <div className="flex flex-col gap-3">
          {ROADMAP.map(phase => (
            <div key={phase.phase} className={`border rounded-2xl p-4 space-y-2 ${phase.done ? 'border-primary/30 bg-primary/5' : 'border-border bg-secondary/20'}`}>
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-xs" style={{ color: phase.done ? '#E2FF00' : '#555' }}>Phase {phase.phase}</span>
                <span className="font-display font-black text-sm text-white">{phase.title}</span>
                {phase.done && <span className="text-[9px] bg-primary text-black font-black px-1.5 py-0.5 rounded-full ml-auto">LIVE</span>}
              </div>
              <ul className="space-y-1">
                {phase.items.map(item => (
                  <li key={item} className="text-xs text-zinc-400 flex items-center gap-1.5">
                    <span className={`w-1 h-1 rounded-full shrink-0 ${phase.done ? 'bg-primary' : 'bg-zinc-600'}`} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Orynth link */}
      <a
        href="https://orynth.dev"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 border border-border rounded-2xl p-4 text-sm font-bold text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
      >
        <ExternalLink className="w-4 h-4" />
        Explore coins at orynth.dev
      </a>
    </div>
  );
}

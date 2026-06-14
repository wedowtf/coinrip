import { useState } from "react";
import { useGameState } from "@/hooks/use-game-state";
import { COINS, CATEGORIES, Tier } from "@/lib/dataset";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Zap } from "lucide-react";

/* ── tier pastel palette (matches Rip.tsx) ── */
const TIER_PASTEL: Record<Tier, {
  bg: string; tri: string; crimp: string; text: string; sub: string; glow: string;
}> = {
  SINGULARITY: { bg: "#F0C838", tri: "#FFFACC", crimp: "#BF9000", text: "#201800", sub: "#705000", glow: "rgba(240,200,56,0.45)" },
  PULSAR:      { bg: "#CC7AE8", tri: "#F5E0FF", crimp: "#8830C0", text: "#28003A", sub: "#6010A0", glow: "rgba(204,122,232,0.4)" },
  NOVA:        { bg: "#50C8E8", tri: "#D8F8FF", crimp: "#1888C0", text: "#001828", sub: "#004878", glow: "rgba(80,200,232,0.4)" },
  FLARE:       { bg: "#F09055", tri: "#FFEACC", crimp: "#C05020", text: "#2A0A00", sub: "#7A2808", glow: "rgba(240,144,85,0.4)" },
  SPARK:       { bg: "#D0D8E8", tri: "#F0F4FF", crimp: "#8898B0", text: "#1A2030", sub: "#485868", glow: "rgba(208,216,232,0.3)" },
};

const TIER_ORDER: Tier[] = ["SINGULARITY", "PULSAR", "NOVA", "FLARE", "SPARK"];
const CRIMP = 13;

/* ── physical collectible coin card ── */
function CoinCard({
  coin, quantity, index, onTap,
}: {
  coin: typeof COINS[0];
  quantity: number;
  index: number;
  onTap: () => void;
}) {
  const [imgErr, setImgErr] = useState(false);
  const p = TIER_PASTEL[coin.tier];

  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.88 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.045, type: "spring", stiffness: 280, damping: 22, willChange: "transform" }}
      whileTap={{ scale: 0.96, y: 2 }}
      onClick={onTap}
      style={{
        borderRadius: 14,
        overflow: "hidden",
        cursor: "pointer",
        willChange: "transform",
        boxShadow: `0 2px 4px rgba(0,0,0,0.18), 0 8px 18px rgba(0,0,0,0.26), 0 20px 40px rgba(0,0,0,0.16), inset 0 1px 0 rgba(255,255,255,0.55), inset 0 -1px 0 rgba(0,0,0,0.15)`,
      }}
    >
      {/* TOP CRIMP */}
      <div style={{ height: CRIMP, background: p.crimp, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.09) 2px, rgba(0,0,0,0.09) 3px)` }} />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(180deg, rgba(255,255,255,0.40), transparent)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(0,0,0,0.16) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.16) 100%)" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 6, fontWeight: 900, color: p.text + "70", textTransform: "uppercase", letterSpacing: "0.28em" }}>COINFLIP</span>
        </div>
      </div>

      {/* MAIN BODY */}
      <div style={{ background: p.bg, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center", padding: "10px 8px 11px", gap: 6 }}>
        {/* Triangle accent */}
        <div style={{ position: "absolute", top: 0, right: 0, width: 0, height: 0, borderStyle: "solid", borderWidth: "0 70px 44px 0", borderColor: `transparent ${p.tri} transparent transparent`, opacity: 0.85 }} />
        {/* Gloss */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(145deg, rgba(255,255,255,0.42) 0%, transparent 50%)", pointerEvents: "none" }} />
        {/* Bottom fade */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.07) 100%)", pointerEvents: "none" }} />

        {/* Quantity badge */}
        {quantity > 1 && (
          <div style={{
            position: "absolute", top: CRIMP + 5, right: 6, zIndex: 20,
            background: p.crimp, color: p.tri,
            fontSize: 7, fontWeight: 900,
            padding: "2px 5px", borderRadius: 99,
            boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
          }}>×{quantity}</div>
        )}

        {/* Tier label */}
        <p style={{ position: "relative", zIndex: 10, alignSelf: "flex-start", fontSize: 7, fontWeight: 900, color: p.sub, textTransform: "uppercase", letterSpacing: "0.10em" }}>
          {coin.tier === "SINGULARITY" ? "✦ SING" : `◆ ${coin.tier}`}
        </p>

        {/* Logo */}
        <div style={{
          width: 52, height: 52, borderRadius: "50%",
          background: "rgba(0,0,0,0.11)", border: "2px solid rgba(0,0,0,0.13)",
          display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden", position: "relative", zIndex: 10,
          boxShadow: "inset 0 2px 5px rgba(0,0,0,0.14), 0 2px 6px rgba(0,0,0,0.12)",
        }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "50%", background: "linear-gradient(180deg, rgba(255,255,255,0.28), transparent)", borderRadius: "50% 50% 0 0" }} />
          {!imgErr && coin.logoUrl ? (
            <img src={coin.logoUrl} alt={coin.name}
              style={{ width: 36, height: 36, objectFit: "contain", position: "relative", zIndex: 1 }}
              onError={() => setImgErr(true)} />
          ) : (
            <span style={{ fontWeight: 900, fontSize: 18, color: p.text + "AA", zIndex: 1 }}>{coin.name[0]}</span>
          )}
        </div>

        {/* Ticker + name */}
        <div style={{ position: "relative", zIndex: 10, textAlign: "center" }}>
          <p style={{ fontSize: 14, fontWeight: 900, color: p.text, textShadow: "0 1px 0 rgba(255,255,255,0.5)", lineHeight: 1, letterSpacing: "0.03em" }}>
            {coin.ticker}
          </p>
          <p style={{ fontSize: 8, fontWeight: 700, color: p.sub, marginTop: 3, lineHeight: 1.2 }}>
            {coin.name.length > 11 ? coin.name.slice(0, 10) + "…" : coin.name}
          </p>
        </div>
      </div>

      {/* BOTTOM CRIMP */}
      <div style={{ height: CRIMP, background: p.crimp, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.09) 2px, rgba(0,0,0,0.09) 3px)` }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 4, background: "linear-gradient(0deg, rgba(0,0,0,0.20), transparent)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(0,0,0,0.16) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.16) 100%)" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 1.5 }}>
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} style={{ width: i % 3 === 0 ? 2 : 1, height: i % 4 === 0 ? 9 : 6, background: p.text + "50", borderRadius: 0.5 }} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ── detail sheet (bottom drawer style) ── */
function CoinDetail({
  coin, quantity, onClose,
}: {
  coin: typeof COINS[0] & { quantity: number };
  quantity: number;
  onClose: () => void;
}) {
  const p = TIER_PASTEL[coin.tier];
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col justify-end"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 32 }}
        className="relative rounded-t-3xl overflow-hidden"
        style={{ background: "#0D0D18", maxHeight: "80vh" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="px-5 pt-2 pb-4"
          style={{ background: `linear-gradient(180deg, ${p.bg}18 0%, transparent 100%)` }}>
          <div className="flex items-center gap-4">
            {/* Mini card preview */}
            <div style={{
              width: 56, height: 56, borderRadius: "50%",
              background: p.bg,
              border: `2.5px solid ${p.crimp}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              overflow: "hidden",
              boxShadow: `0 0 20px ${p.glow}, 0 4px 12px rgba(0,0,0,0.3)`,
              flexShrink: 0,
            }}>
              {coin.logoUrl ? (
                <img src={coin.logoUrl} alt={coin.name} style={{ width: 38, height: 38, objectFit: "contain" }} />
              ) : (
                <span style={{ fontSize: 20, fontWeight: 900, color: p.text }}>{coin.name[0]}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{ background: p.bg + "22", color: p.bg, border: `1px solid ${p.bg}44` }}>
                  {coin.tier === "SINGULARITY" ? "✦ SINGULARITY" : `◆ ${coin.tier}`}
                </span>
              </div>
              <h3 className="font-display font-black text-xl text-white uppercase leading-tight truncate">{coin.name}</h3>
              <p className="text-[11px] font-black tracking-wide" style={{ color: p.bg }}>{coin.ticker}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-mono font-black text-2xl" style={{ color: p.bg, textShadow: `0 0 16px ${p.glow}` }}>×{quantity}</p>
              <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider">owned</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-5 h-px" style={{ background: `linear-gradient(90deg, transparent, ${p.bg}40, transparent)` }} />

        {/* Info grid */}
        <div className="p-5 flex flex-col gap-3">
          {coin.tagline && (
            <p className="text-sm text-zinc-400 leading-relaxed">{coin.tagline}</p>
          )}
          {coin.description && (
            <p className="text-xs text-zinc-600 leading-relaxed">{coin.description}</p>
          )}
          <div className="grid grid-cols-2 gap-2 mt-1">
            {[
              { label: "Category", value: coin.category },
              { label: "Market Cap", value: coin.marketCap ? `$${(coin.marketCap / 1e9).toFixed(1)}B` : "—" },
              { label: "Ticker", value: coin.ticker },
              { label: "Owned", value: `×${quantity}` },
            ].map(row => (
              <div key={row.label} className="rounded-xl p-3"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider mb-0.5">{row.label}</p>
                <p className="text-sm font-bold text-white truncate">{row.value}</p>
              </div>
            ))}
          </div>

          {/* Redeem coming soon */}
          <div className="rounded-xl p-3 flex items-center gap-3"
            style={{ background: `${p.bg}12`, border: `1px solid ${p.bg}28` }}>
            <span className="text-lg">🔒</span>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: p.bg }}>Redeem</p>
              <p className="text-[10px] text-zinc-500">Reward redemption launching soon</p>
            </div>
          </div>

          {/* Close */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider text-zinc-500 mt-1"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          >Close</motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════
   Collection page
══════════════════════════════════════════ */
export default function Collection() {
  const { state, isLoaded } = useGameState();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [detailCoin, setDetailCoin] = useState<string | null>(null);

  if (!isLoaded) return <div className="min-h-[80vh]" />;

  if (!state.username) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[72vh] p-6 gap-4">
        <motion.div
          initial={{ scale: 0.7, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
        >
          <Trophy className="w-16 h-16 mx-auto" style={{ color: "#E2FF00", filter: "drop-shadow(0 0 18px rgba(226,255,0,0.55))" }} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="text-center space-y-1">
          <h2 className="font-display text-2xl font-bold uppercase text-white">My Vault</h2>
          <p className="text-zinc-500 text-sm">Log in to see your collected coins</p>
        </motion.div>
      </div>
    );
  }

  const enriched = state.collection.map(c => {
    const def = COINS.find(d => d.name === c.name);
    return def ? { ...def, quantity: c.quantity } : null;
  }).filter(Boolean) as (typeof COINS[0] & { quantity: number })[];

  const totalOwned = state.collection.reduce((a, c) => a + c.quantity, 0);
  const uniqueCount = enriched.length;
  const bestTier = TIER_ORDER.find(t => enriched.some(c => c.tier === t));

  const categories = ["All", ...CATEGORIES.filter(cat => enriched.some(c => c.category === cat))];
  const filtered = selectedCategory === "All" ? enriched : enriched.filter(c => c.category === selectedCategory);

  const detailCoinData = detailCoin ? enriched.find(c => c.name === detailCoin) : null;

  return (
    <div className="flex flex-col gap-4 pb-24">

      {/* ── HEADER ── */}
      <div className="px-5 pt-5">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-4">
          <div>
            <h1 className="font-display text-3xl font-black uppercase tracking-tighter text-white leading-none">Vault</h1>
            <p className="text-xs text-zinc-500 font-medium mt-0.5">Your collectible coins</p>
          </div>
          {bestTier && (
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 320 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{
                background: TIER_PASTEL[bestTier].bg + "22",
                border: `1.5px solid ${TIER_PASTEL[bestTier].bg}44`,
                boxShadow: `0 0 14px ${TIER_PASTEL[bestTier].glow}`,
              }}
            >
              <span className="text-[8px] font-black uppercase tracking-wider" style={{ color: TIER_PASTEL[bestTier].bg }}>
                Best: {bestTier === "SINGULARITY" ? "✦SING" : bestTier}
              </span>
            </motion.div>
          )}
        </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: "Total",   value: totalOwned,           accent: "#E2E8F0", icon: "🎴" },
            { label: "Unique",  value: uniqueCount,          accent: "#E2FF00", icon: "💎" },
            { label: "Coins",   value: state.coinBalance,    accent: "#06B6D4", icon: "🪙" },
          ].map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, type: "spring", stiffness: 300 }}
              className="rounded-2xl p-3 text-center relative overflow-hidden"
              style={{ background: `linear-gradient(145deg, ${s.accent}12, #0A0A12)`, border: `1px solid ${s.accent}25` }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${s.accent}50, transparent)` }} />
              <p className="text-base mb-0.5">{s.icon}</p>
              <p className="font-mono font-black text-lg" style={{ color: s.accent }}>{s.value}</p>
              <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── EMPTY STATE ── */}
      {totalOwned === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}
          className="mx-5 text-center py-16 rounded-3xl flex flex-col items-center gap-4"
          style={{ background: "rgba(226,255,0,0.03)", border: "1.5px dashed rgba(226,255,0,0.14)" }}
        >
          <motion.div animate={{ y: [0, -7, 0] }} transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}>
            <Zap className="w-12 h-12" style={{ color: "#E2FF00", filter: "drop-shadow(0 0 12px rgba(226,255,0,0.55))" }} />
          </motion.div>
          <div className="space-y-1">
            <p className="font-display font-bold text-white text-lg">Vault is empty</p>
            <p className="text-sm text-zinc-500">Go flip some packs to fill it up!</p>
          </div>
        </motion.div>
      ) : (
        <>
          {/* Category filter pills */}
          <div className="flex overflow-x-auto gap-2 px-5 pb-1 scrollbar-none"
            style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}>
            {categories.map(cat => (
              <motion.button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                whileTap={{ scale: 0.93 }}
                className="shrink-0 text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full transition-colors"
                style={{
                  background: selectedCategory === cat ? "#E2FF00" : "rgba(255,255,255,0.05)",
                  color: selectedCategory === cat ? "#000" : "#8A8A9E",
                  border: selectedCategory === cat ? "none" : "1px solid rgba(255,255,255,0.08)",
                  boxShadow: selectedCategory === cat ? "0 0 14px rgba(226,255,0,0.4)" : "none",
                }}
              >{cat}</motion.button>
            ))}
          </div>

          {/* Coins by tier */}
          <div className="flex flex-col gap-6 px-5">
            {TIER_ORDER.map((tier, tIdx) => {
              const coins = filtered.filter(c => c.tier === tier);
              if (coins.length === 0) return null;
              const p = TIER_PASTEL[tier];

              return (
                <motion.div key={tier}
                  initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: tIdx * 0.06 }}>

                  {/* Tier header */}
                  <div className="flex items-center gap-2 mb-3">
                    <motion.div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: p.bg, boxShadow: `0 0 8px ${p.glow}` }}
                      animate={{ boxShadow: [`0 0 6px ${p.glow}`, `0 0 16px ${p.glow}`, `0 0 6px ${p.glow}`] }}
                      transition={{ duration: 2.2, repeat: Infinity }}
                    />
                    <h2 className="font-display text-sm font-black uppercase tracking-widest" style={{ color: p.bg }}>
                      {tier === "SINGULARITY" ? "✦ Singularity" : tier}
                    </h2>
                    <span className="text-[10px] font-mono text-zinc-600">({coins.length})</span>
                    <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${p.bg}30, transparent)` }} />
                  </div>

                  {/* Physical card grid */}
                  <div className="grid grid-cols-3 gap-2.5">
                    {coins.map((coin, cIdx) => (
                      <CoinCard
                        key={coin.name}
                        coin={coin}
                        quantity={coin.quantity}
                        index={tIdx * 6 + cIdx}
                        onTap={() => setDetailCoin(coin.name)}
                      />
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </>
      )}

      {/* Detail sheet */}
      <AnimatePresence>
        {detailCoinData && (
          <CoinDetail
            coin={detailCoinData}
            quantity={detailCoinData.quantity}
            onClose={() => setDetailCoin(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

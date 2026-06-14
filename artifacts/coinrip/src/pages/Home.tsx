import { useState, useEffect } from "react";
import { useGameState } from "@/hooks/use-game-state";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { PACKS, COINS, PackDef, Tier, Coin, PackId } from "@/lib/dataset";
import { Sparkles } from "lucide-react";

const TIER_COLORS: Record<Tier, string> = {
  SPARK: "#64748B", FLARE: "#EA580C", NOVA: "#0284C7",
  PULSAR: "#A21CAF", SINGULARITY: "#B45309",
};
const TIER_ICONS: Record<Tier, string> = {
  SPARK: "•", FLARE: "▲", NOVA: "◆", PULSAR: "◈", SINGULARITY: "✦",
};

/* ── per-pack pastel palette ── */
const PKG: Record<PackId, {
  bg: string; tri: string; crimp: string; text: string; sub: string; btn: string;
}> = {
  daily:   { bg:"#F5E95A", tri:"#FFFDE0", crimp:"#D4CC20", text:"#2A2600", sub:"#6A6200", btn:"#2A2600" },
  mystery: { bg:"#CC7AE8", tri:"#F0D8FF", crimp:"#9038C0", text:"#28003A", sub:"#60108A", btn:"#28003A" },
  starter: { bg:"#F09055", tri:"#FFEACC", crimp:"#C85820", text:"#2A0A00", sub:"#7A2800", btn:"#2A0A00" },
  blazer:  { bg:"#50C8E8", tri:"#D0F4FF", crimp:"#1888C0", text:"#001828", sub:"#004870", btn:"#001828" },
  cosmic:  { bg:"#A870D8", tri:"#E8D8FF", crimp:"#6830B0", text:"#18003A", sub:"#48009A", btn:"#18003A" },
  galaxy:  { bg:"#F0C838", tri:"#FFF8CC", crimp:"#C09000", text:"#201800", sub:"#705000", btn:"#201800" },
};

/* ── tiny coin for the grid ── */
function CoinCell({ coin }: { coin: Coin }) {
  const [err, setErr] = useState(false);
  const pkg = PKG[coin.name as PackId] ?? { text: "#000" };
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden"
        style={{
          background: "rgba(0,0,0,0.12)",
          border: "1.5px solid rgba(0,0,0,0.12)",
          boxShadow: "inset 0 1px 3px rgba(0,0,0,0.15)",
        }}
      >
        {!err && coin.logoUrl ? (
          <img src={coin.logoUrl} alt={coin.name} className="w-7 h-7 object-contain"
            onError={() => setErr(true)} />
        ) : (
          <span className="font-display font-black text-sm text-black/50">{coin.name[0]}</span>
        )}
      </div>
      <span className="text-[7.5px] font-black tracking-wide text-black/60 leading-none">
        {coin.ticker}
      </span>
    </div>
  );
}

function getPreviewCoins(pack: PackDef): Coin[] {
  const eligible = (Object.entries(pack.tierWeights) as [Tier, number][])
    .filter(([, w]) => w > 0).map(([t]) => t);
  const pool = COINS.filter(c => eligible.includes(c.tier));
  return [...pool].sort(() => Math.random() - 0.5).slice(0, 6);
}

/* ══════════════════════════════════════════
   PackCard — physical 3D snack-pack portrait
══════════════════════════════════════════ */
const W = 248;
const H = 430;
const CRIMP = 30;

function PackCard({
  pack, canAfford, canRipFree, timeLeft, onRip, onLoginRequired,
}: {
  pack: PackDef; canAfford: boolean; canRipFree: boolean;
  timeLeft: string | null; onRip: () => void; onLoginRequired: () => void;
}) {
  const isFree = pack.isFreeDaily;
  const isAvailable = isFree ? canRipFree : canAfford;
  const [previewCoins] = useState(() => getPreviewCoins(pack));
  const [isFlipped, setIsFlipped] = useState(false);
  const p = PKG[pack.id];

  const eligibleTiers = (Object.entries(pack.tierWeights) as [Tier, number][])
    .filter(([, w]) => w > 0)
    .sort((a, b) => {
      const order: Tier[] = ["SINGULARITY","PULSAR","NOVA","FLARE","SPARK"];
      return order.indexOf(a[0] as Tier) - order.indexOf(b[0] as Tier);
    });
  const totalWeight = eligibleTiers.reduce((s,[,w]) => s + w, 0);

  /* shared physical depth shadow */
  const physicalShadow = isAvailable
    ? `0 2px 4px rgba(0,0,0,0.18),
       0 8px 18px rgba(0,0,0,0.28),
       0 22px 50px rgba(0,0,0,0.32),
       0 45px 90px rgba(0,0,0,0.20),
       inset 0 1px 0 rgba(255,255,255,0.65),
       inset 0 -2px 0 rgba(0,0,0,0.20),
       inset 1.5px 0 0 rgba(255,255,255,0.40),
       inset -1.5px 0 0 rgba(0,0,0,0.12)`
    : `0 4px 12px rgba(0,0,0,0.15), 0 12px 30px rgba(0,0,0,0.18)`;

  return (
    <div
      className="snap-center shrink-0"
      style={{ width: W, height: H, perspective: "1100px" }}
    >
      <motion.div
        style={{ transformStyle: "preserve-3d", position: "relative", width: "100%", height: "100%" }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 24 }}
      >

        {/* ══ FRONT — physical snack-pack portrait ══ */}
        <motion.div
          className="absolute inset-0 cursor-pointer select-none"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            borderRadius: 20,
            overflow: "hidden",
            opacity: isAvailable ? 1 : 0.50,
            boxShadow: physicalShadow,
          }}
          whileTap={isAvailable ? { scale: 0.975, y: 3 } : {}}
        >

          {/* ── TOP CRIMP ── */}
          <div style={{
            height: CRIMP,
            background: p.crimp,
            position: "relative",
            overflow: "hidden",
          }}>
            {/* corrugated texture */}
            <div style={{
              position: "absolute", inset: 0,
              backgroundImage: `repeating-linear-gradient(0deg,
                transparent, transparent 2.5px,
                rgba(0,0,0,0.10) 2.5px, rgba(0,0,0,0.10) 3.5px)`,
            }} />
            {/* top highlight */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 6,
              background: "linear-gradient(180deg, rgba(255,255,255,0.45), transparent)",
            }} />
            {/* left/right edge darkening */}
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(90deg, rgba(0,0,0,0.15) 0%, transparent 25%, transparent 75%, rgba(0,0,0,0.15) 100%)",
            }} />
            {/* barcode hint + brand */}
            <div className="absolute inset-0 flex items-center justify-between px-4">
              <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.3em", color: p.text + "99", textTransform: "uppercase" }}>
                COINRIP
              </span>
              {pack.badgeLabel && (
                <span style={{
                  fontSize: 7, fontWeight: 900, textTransform: "uppercase",
                  background: p.text, color: p.bg, padding: "2px 6px", borderRadius: 99,
                  letterSpacing: "0.1em",
                }}>{pack.badgeLabel}</span>
              )}
              {isFree && (
                <motion.span
                  animate={{ scale: [1, 1.07, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                  style={{
                    fontSize: 7, fontWeight: 900, textTransform: "uppercase",
                    background: p.text, color: p.bg, padding: "2px 6px", borderRadius: 99,
                    letterSpacing: "0.1em",
                  }}
                >🎁 FREE</motion.span>
              )}
            </div>
          </div>

          {/* ── MAIN BODY ── */}
          <div style={{
            flex: 1,
            height: H - CRIMP * 2,
            background: p.bg,
            position: "relative",
            overflow: "hidden",
          }}>
            {/* diagonal triangle accent (upper-right) */}
            <div style={{
              position: "absolute", top: 0, right: 0,
              width: 0, height: 0,
              borderStyle: "solid",
              borderWidth: `0 ${W}px ${Math.round(H * 0.30)}px 0`,
              borderColor: `transparent ${p.tri} transparent transparent`,
              opacity: 0.9,
            }} />

            {/* Top-left lighting gradient (physical sheen) */}
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(145deg, rgba(255,255,255,0.45) 0%, transparent 45%)",
              pointerEvents: "none",
            }} />
            {/* Bottom darkening */}
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.10) 100%)",
              pointerEvents: "none",
            }} />
            {/* Animated shine sweep */}
            {isAvailable && (
              <motion.div
                style={{
                  position: "absolute", inset: 0, pointerEvents: "none",
                  background: "linear-gradient(108deg, transparent 25%, rgba(255,255,255,0.30) 48%, rgba(255,255,255,0.12) 52%, transparent 75%)",
                }}
                initial={{ x: "-100%" }} animate={{ x: "200%" }}
                transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 3.8, ease: "easeInOut" }}
              />
            )}

            {/* Content layer */}
            <div style={{
              position: "relative", zIndex: 10,
              height: "100%",
              display: "flex", flexDirection: "column",
              padding: "14px 16px 12px",
            }}>
              {/* pack subtitle */}
              <p style={{
                fontSize: 9, fontWeight: 800, textTransform: "uppercase",
                letterSpacing: "0.25em", color: p.sub, marginBottom: 2,
              }}>
                {pack.subtitle}
              </p>

              {/* Pack name — BIG */}
              <h2 style={{
                fontSize: pack.name.length > 9 ? 34 : 40,
                fontWeight: 900, fontFamily: "var(--font-display, inherit)",
                textTransform: "uppercase", lineHeight: 0.92,
                color: p.text,
                textShadow: `1px 2px 0 rgba(255,255,255,0.5), 0 1px 0 rgba(0,0,0,0.12)`,
                marginBottom: 8,
              }}>{pack.name}</h2>

              {/* divider */}
              <div style={{
                height: 1.5, width: 48, borderRadius: 2,
                background: p.text + "40", marginBottom: 10,
              }} />

              {/* coin preview 2×3 */}
              <div style={{
                display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
                gap: "8px 6px", marginBottom: 10,
              }}>
                {previewCoins.map((coin, i) => (
                  <motion.div key={coin.name + i}
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.06, type: "spring", stiffness: 300, damping: 22 }}
                    style={{ display: "flex", justifyContent: "center" }}
                  >
                    <CoinCell coin={coin} />
                  </motion.div>
                ))}
              </div>

              {/* tier badges */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
                {eligibleTiers.map(([tier]) => (
                  <span key={tier} style={{
                    fontSize: 7, fontWeight: 900, textTransform: "uppercase",
                    padding: "2px 6px", borderRadius: 99,
                    background: "rgba(0,0,0,0.10)",
                    color: p.text + "CC",
                    border: `1px solid ${p.text}28`,
                    letterSpacing: "0.08em",
                  }}>
                    {TIER_ICONS[tier as Tier]} {tier === "SINGULARITY" ? "SING" : tier}
                  </span>
                ))}
              </div>

              {/* description */}
              <p style={{
                fontSize: 9.5, color: p.sub, fontWeight: 600, lineHeight: 1.4,
                marginBottom: "auto",
              }}>
                {pack.description}
              </p>

              {/* rates hint */}
              <div
                style={{
                  display: "flex", alignItems: "center", justifyContent: "flex-end",
                  gap: 4, marginBottom: 6, cursor: "pointer", opacity: 0.5,
                }}
                onClick={(e) => { e.stopPropagation(); setIsFlipped(true); }}
              >
                <span style={{ fontSize: 7, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: p.text }}>
                  Drop Rates
                </span>
                <span style={{ fontSize: 9 }}>→</span>
              </div>

              {/* RIP BUTTON */}
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isAvailable) onRip(); else onLoginRequired();
                }}
                style={{
                  width: "100%", height: 48, borderRadius: 14,
                  border: "none", cursor: isAvailable ? "pointer" : "default",
                  background: isAvailable
                    ? `linear-gradient(180deg, ${p.btn}EE 0%, ${p.btn} 100%)`
                    : "rgba(0,0,0,0.12)",
                  color: isAvailable ? p.bg : p.text + "44",
                  fontSize: 13, fontWeight: 900, textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  boxShadow: isAvailable
                    ? `0 3px 0 rgba(0,0,0,0.30), 0 6px 14px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.20)`
                    : "none",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  position: "relative", overflow: "hidden",
                }}
              >
                {isAvailable && (
                  <motion.div
                    style={{
                      position: "absolute", inset: 0, pointerEvents: "none",
                      background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)",
                    }}
                    initial={{ x: "-100%" }} animate={{ x: "200%" }}
                    transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 2.8 }}
                  />
                )}
                {isFree
                  ? isAvailable ? <>🎁 RIP FREE · 6 COINS</> : <>⏳ {timeLeft ?? "Tomorrow"}</>
                  : isAvailable
                  ? <>⚡ RIP · {pack.cost} 🪙</>
                  : <>🔒 {pack.cost} COINS</>
                }
              </motion.button>
            </div>
          </div>

          {/* ── BOTTOM CRIMP ── */}
          <div style={{
            height: CRIMP,
            background: p.crimp,
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", inset: 0,
              backgroundImage: `repeating-linear-gradient(0deg,
                transparent, transparent 2.5px,
                rgba(0,0,0,0.10) 2.5px, rgba(0,0,0,0.10) 3.5px)`,
            }} />
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0, height: 6,
              background: "linear-gradient(0deg, rgba(0,0,0,0.20), transparent)",
            }} />
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(90deg, rgba(0,0,0,0.15) 0%, transparent 25%, transparent 75%, rgba(0,0,0,0.15) 100%)",
            }} />
            {/* barcode-style lines at center */}
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 2,
            }}>
              {Array.from({ length: 18 }).map((_, i) => (
                <div key={i} style={{
                  width: i % 3 === 0 ? 2 : 1,
                  height: i % 5 === 0 ? 14 : 10,
                  background: p.text + "50",
                  borderRadius: 1,
                }} />
              ))}
            </div>
          </div>

        </motion.div>

        {/* ══ BACK — drop rates ══ */}
        <div
          className="absolute inset-0 rounded-[20px] overflow-hidden flex flex-col cursor-pointer"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: `linear-gradient(160deg, ${p.bg}CC 0%, #0A0A14 40%, #0a0a12 100%)`,
            boxShadow: physicalShadow,
          }}
          onClick={() => setIsFlipped(false)}
        >
          {/* Texture */}
          <div className="absolute inset-0 opacity-15" style={{
            backgroundImage: `repeating-linear-gradient(-48deg, transparent, transparent 8px, ${p.bg}20 8px, ${p.bg}20 16px)`,
          }} />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50 pointer-events-none" />
          <div className="absolute top-0 left-4 right-4 h-px" style={{
            background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)`,
          }} />

          {/* Animated shimmer */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{ background: `linear-gradient(108deg, transparent 30%, ${p.bg}30 50%, transparent 70%)` }}
            initial={{ x: "-100%" }} animate={{ x: "250%" }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 4 }}
          />

          {/* Header */}
          <div className="relative z-10 px-4 pt-4 pb-2">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[8px] font-bold uppercase tracking-widest" style={{ color: p.bg + "AA" }}>
                  DROP RATES
                </p>
                <h3 className="font-display text-2xl font-black uppercase text-white leading-tight"
                  style={{ textShadow: `0 0 20px ${p.bg}80` }}>
                  {pack.name}
                </h3>
              </div>
              <span
                className="text-[7px] font-black uppercase px-2 py-0.5 rounded-full mt-1"
                style={{ background: p.bg + "22", color: p.bg, border: `1px solid ${p.bg}40` }}>
                6/rip
              </span>
            </div>
            <div className="mt-2 h-px" style={{
              background: `linear-gradient(90deg, ${p.bg}80, transparent)`,
            }} />
          </div>

          {/* Rates bars */}
          <div className="relative z-10 flex-1 px-4 flex flex-col gap-2.5 overflow-y-auto">
            {eligibleTiers.map(([tier, weight], i) => {
              const pct = Math.round((weight / totalWeight) * 100);
              const color = TIER_COLORS[tier as Tier];
              const bright: Record<Tier, string> = {
                SPARK: "#94A3B8", FLARE: "#FB923C", NOVA: "#38BDF8",
                PULSAR: "#D946EF", SINGULARITY: "#FBBF24",
              };
              const c = bright[tier as Tier] ?? color;
              return (
                <div key={tier} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span style={{ color: c, fontSize: 11, fontWeight: 900 }}>{TIER_ICONS[tier as Tier]}</span>
                      <span className="text-[10px] font-black uppercase tracking-wide" style={{ color: c }}>{tier}</span>
                    </div>
                    <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-full"
                      style={{ background: c + "1E", color: c, border: `1px solid ${c}30` }}>{pct}%</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: c + "16", border: `1px solid ${c}18` }}>
                    <motion.div className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${c}, ${c}99)`, boxShadow: `0 0 8px ${c}` }}
                      initial={{ width: 0 }}
                      animate={{ width: isFlipped ? `${pct}%` : 0 }}
                      transition={{ delay: i * 0.09 + 0.15, duration: 0.65, ease: "easeOut" }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Coin grid */}
          <div className="relative z-10 px-4 py-3">
            <div className="h-px mb-2.5"
              style={{ background: `linear-gradient(90deg, transparent, ${p.bg}60, transparent)` }} />
            <div className="grid grid-cols-3 gap-x-3 gap-y-1.5">
              {previewCoins.map((coin, i) => {
                const [e2, setE2] = useState(false);
                const c = TIER_COLORS[coin.tier];
                return (
                  <motion.div key={coin.name + i}
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: isFlipped ? 1 : 0, scale: isFlipped ? 1 : 0.7 }}
                    transition={{ delay: i * 0.07 + 0.3, type: "spring", stiffness: 280, damping: 22 }}
                    className="flex flex-col items-center gap-0.5"
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden"
                      style={{
                        background: `radial-gradient(circle, ${c}28, #0a0a1200)`,
                        border: `1.5px solid ${c}44`,
                        boxShadow: `0 0 8px ${c}33`,
                      }}>
                      {!e2 && coin.logoUrl ? (
                        <img src={coin.logoUrl} alt={coin.name} className="w-7 h-7 object-contain"
                          onError={() => setE2(true)} />
                      ) : (
                        <span className="font-display font-black text-sm" style={{ color: c }}>{coin.name[0]}</span>
                      )}
                    </div>
                    <span className="text-[7.5px] font-black tracking-wide" style={{ color: c }}>{coin.ticker}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Back button */}
          <div className="relative z-10 px-4 pb-4">
            <button
              className="w-full h-9 rounded-2xl font-bold text-xs uppercase tracking-wider text-zinc-400"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              onClick={(e) => { e.stopPropagation(); setIsFlipped(false); }}
            >← Back to Pack</button>
          </div>
        </div>

      </motion.div>
    </div>
  );
}

/* ─────────────────── page ─────────────────── */
export default function Home() {
  const { state, canRipFree, getTimeUntilFreeRip, payForRip } = useGameState();
  const [, setLocation] = useLocation();
  const [showNeedLogin, setShowNeedLogin] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showInsufficient, setShowInsufficient] = useState<string | null>(null);

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
      setShowInsufficient(`Need ${pack.cost} coins — rip packs to earn more!`);
      setTimeout(() => setShowInsufficient(null), 3000);
    }
  };

  return (
    <div className="flex flex-col gap-5 pb-4">

      {/* Hero */}
      <div className="relative overflow-hidden px-6 pt-7 pb-3">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div className="absolute -top-14 -left-14 w-56 h-56 rounded-full blur-3xl"
            style={{ background: "#E2FF00" }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.12, 0.20, 0.12] }}
            transition={{ duration: 4.5, repeat: Infinity }} />
          <motion.div className="absolute -top-8 -right-10 w-44 h-44 rounded-full blur-3xl"
            style={{ background: "#D946EF" }}
            animate={{ scale: [1.1, 0.85, 1.1], opacity: [0.08, 0.16, 0.08] }}
            transition={{ duration: 5.5, repeat: Infinity, delay: 1 }} />
        </div>
        <motion.div className="text-center space-y-2 relative z-10"
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
          <motion.h1
            className="text-6xl font-display font-extrabold uppercase italic tracking-tighter"
            style={{ color: "#E2FF00", textShadow: "0 0 40px rgba(226,255,0,0.5), 0 2px 0 rgba(0,0,0,0.9)" }}
            animate={{ textShadow: [
              "0 0 40px rgba(226,255,0,0.4), 0 2px 0 rgba(0,0,0,0.9)",
              "0 0 70px rgba(226,255,0,0.75), 0 2px 0 rgba(0,0,0,0.9)",
              "0 0 40px rgba(226,255,0,0.4), 0 2px 0 rgba(0,0,0,0.9)",
            ] }}
            transition={{ duration: 3, repeat: Infinity }}
          >CoinRip</motion.h1>
          <motion.p className="text-sm text-zinc-400 font-medium"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            Rip packs · 6 real coins each · Collect &amp; redeem
          </motion.p>
          <AnimatePresence>
            {showNeedLogin && (
              <motion.div
                initial={{ opacity: 0, scale: 0.88, y: -8 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="inline-flex items-center gap-1.5 text-xs text-black font-black py-1.5 px-4 rounded-full"
                style={{ background: "#E2FF00", boxShadow: "0 0 20px rgba(226,255,0,0.5)" }}
              >↑ Log in to start ripping packs</motion.div>
            )}
            {showInsufficient && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="inline-flex items-center gap-1.5 text-xs text-white font-bold py-1.5 px-4 rounded-full"
                style={{ background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.3)" }}
              >{showInsufficient}</motion.div>
            )}
          </AnimatePresence>
          {!state.username && !showNeedLogin && (
            <motion.p className="text-xs text-zinc-600 font-medium"
              animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2.5, repeat: Infinity }}>
              Press LOGIN ↑ · get 500 free demo coins
            </motion.p>
          )}
        </motion.div>
      </div>

      {/* Welcome banner */}
      <AnimatePresence>
        {showWelcome && state.username && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-6 rounded-2xl overflow-hidden"
            style={{ background: "linear-gradient(135deg, #E2FF00, #06B6D4)", boxShadow: "0 0 40px rgba(226,255,0,0.4)" }}
          >
            <div className="p-4 flex items-center gap-3">
              <motion.div className="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center shrink-0"
                animate={{ rotate: [0, -5, 5, 0] }} transition={{ duration: 1.5, repeat: 2 }}>
                <Sparkles className="w-5 h-5 text-white" />
              </motion.div>
              <div className="flex-1">
                <p className="font-display font-black text-black text-sm uppercase">Welcome, {state.username}! 🎉</p>
                <p className="text-[11px] text-black/70 font-semibold mt-0.5"><strong>+500 demo COINS</strong> loaded!</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-mono font-black text-2xl text-black">500</p>
                <p className="text-[9px] font-black text-black/60 uppercase">COINS</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      {state.username && (
        <div className="flex gap-2 px-6">
          {[
            { label: "Rips",   value: state.totalRips || 0,   accent: "#E2E8F0", icon: "🎴" },
            { label: "Unique", value: state.collection.length, accent: "#06B6D4", icon: "💎" },
            { label: "COINS",  value: state.coinBalance,       accent: "#E2FF00", icon: "🪙" },
          ].map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 320, damping: 22 }}
              className="flex-1 text-center relative overflow-hidden rounded-2xl p-3"
              style={{ background: `linear-gradient(145deg, ${s.accent}14, #0A0A12)`, border: `1px solid ${s.accent}30` }}
            >
              <p className="text-base mb-0.5">{s.icon}</p>
              <p className="font-mono font-black text-xl"
                style={{ color: s.accent, textShadow: `0 0 14px ${s.accent}80` }}>{s.value}</p>
              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Packs */}
      <div className="flex flex-col gap-2 px-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-black uppercase tracking-widest text-white">Packs</h2>
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-zinc-500 italic">tap → rates</span>
            <motion.span
              className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
              style={{ background: "#E2FF0020", color: "#E2FF00", border: "1px solid rgba(226,255,0,0.2)" }}
              animate={{ boxShadow: ["0 0 0px rgba(226,255,0,0)", "0 0 8px rgba(226,255,0,0.3)", "0 0 0px rgba(226,255,0,0)"] }}
              transition={{ duration: 2, repeat: Infinity }}
            >{PACKS.length} packs</motion.span>
          </div>
        </div>

        <div
          className="flex overflow-x-auto gap-4 pb-4 -mx-6 px-6 snap-x snap-mandatory scrollbar-none"
          style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}
        >
          {PACKS.map((pack, i) => (
            <motion.div key={pack.id}
              initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07, type: "spring", stiffness: 260, damping: 22 }}>
              <PackCard
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
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

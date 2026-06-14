import { useState, useEffect, useRef } from "react";
import { useGameState } from "@/hooks/use-game-state";
import { useLocation } from "wouter";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { PACKS, COINS, PackDef, Tier, Coin } from "@/lib/dataset";
import { Sparkles } from "lucide-react";

const TIER_COLORS: Record<Tier, string> = {
  SPARK: "#E2E8F0",
  FLARE: "#F97316",
  NOVA: "#06B6D4",
  PULSAR: "#D946EF",
  SINGULARITY: "#FBBF24",
};

const TIER_ICONS: Record<Tier, string> = {
  SPARK: "•", FLARE: "▲", NOVA: "◆", PULSAR: "◈", SINGULARITY: "✦",
};

/* ─────────────── tiny coin for pack visual strip ─────────────── */
function CoinTiny({ coin }: { coin: Coin }) {
  const [err, setErr] = useState(false);
  const color = TIER_COLORS[coin.tier];
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center border overflow-hidden"
        style={{
          borderColor: color + "99",
          background: `radial-gradient(circle, ${color}28, #0a0a1200)`,
          boxShadow: `0 0 8px ${color}55`,
        }}
      >
        {!err && coin.logoUrl ? (
          <img src={coin.logoUrl} alt={coin.name} className="w-6 h-6 object-contain"
            onError={() => setErr(true)} />
        ) : (
          <span className="font-display font-black text-xs" style={{ color }}>{coin.name[0]}</span>
        )}
      </div>
      <span className="text-[7px] font-black tracking-wide" style={{ color, textShadow: `0 0 5px ${color}70` }}>
        {coin.ticker}
      </span>
    </div>
  );
}

/* ─────────────── coin grid for flip back ─────────────── */
function CoinMiniBack({ coin }: { coin: Coin }) {
  const [err, setErr] = useState(false);
  const color = TIER_COLORS[coin.tier];
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center border-2 overflow-hidden"
        style={{
          borderColor: color + "88",
          background: `radial-gradient(circle, ${color}24, #0a0a1200)`,
          boxShadow: `0 0 10px ${color}44`,
        }}
      >
        {!err && coin.logoUrl ? (
          <img src={coin.logoUrl} alt={coin.name} className="w-7 h-7 object-contain"
            onError={() => setErr(true)} />
        ) : (
          <span className="font-display font-black text-sm" style={{ color }}>{coin.name[0]}</span>
        )}
      </div>
      <span className="text-[8px] font-black tracking-wide leading-none" style={{ color }}>
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

/* ─────────────── main pack card ─────────────── */
const CARD_W = 248;
const CARD_H = 430;

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
  const cardRef = useRef<HTMLDivElement>(null);

  const eligibleTiers = (Object.entries(pack.tierWeights) as [Tier, number][])
    .filter(([, w]) => w > 0)
    .sort((a, b) => {
      const order: Tier[] = ["SINGULARITY", "PULSAR", "NOVA", "FLARE", "SPARK"];
      return order.indexOf(a[0] as Tier) - order.indexOf(b[0] as Tier);
    });
  const totalWeight = eligibleTiers.reduce((s, [, w]) => s + w, 0);

  return (
    <div
      className="snap-center shrink-0"
      style={{ width: CARD_W, height: CARD_H, perspective: "1200px" }}
    >
      <motion.div
        ref={cardRef}
        style={{ transformStyle: "preserve-3d", position: "relative", width: "100%", height: "100%" }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 26 }}
      >

        {/* ══════════ FRONT — physical pack ══════════ */}
        <div
          className="absolute inset-0 rounded-[24px] overflow-hidden flex flex-col"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            boxShadow: isAvailable
              ? `0 0 0 1.5px ${pack.color}80,
                 0 6px 20px rgba(0,0,0,0.5),
                 0 20px 60px ${pack.shadowColor},
                 0 40px 100px ${pack.shadowColor}44,
                 inset 0 1px 0 rgba(255,255,255,0.18),
                 inset 0 -2px 0 rgba(0,0,0,0.6),
                 inset 1px 0 0 rgba(255,255,255,0.08),
                 inset -1px 0 0 rgba(0,0,0,0.4)`
              : `0 0 0 1px #1e1e28,
                 0 8px 30px rgba(0,0,0,0.6),
                 inset 0 1px 0 rgba(255,255,255,0.04)`,
            opacity: isAvailable ? 1 : 0.48,
          }}
          onClick={() => setIsFlipped(f => !f)}
        >
          {/* ── Foil base gradient ── */}
          <div className="absolute inset-0" style={{
            background: isAvailable
              ? `linear-gradient(155deg,
                  ${pack.color}55 0%,
                  #12121e 22%,
                  ${pack.color}22 44%,
                  #0a0a14 60%,
                  ${pack.color}38 80%,
                  #16161f 100%
                )`
              : "linear-gradient(155deg, #14141c, #0a0a12)",
          }} />

          {/* ── Diagonal foil stripe texture ── */}
          {isAvailable && (
            <div className="absolute inset-0 opacity-30" style={{
              background: `repeating-linear-gradient(
                -48deg,
                transparent,
                transparent 10px,
                ${pack.color}0d 10px,
                ${pack.color}0d 20px
              )`,
            }} />
          )}

          {/* ── Rainbow foil band (static, rotated) ── */}
          {isAvailable && (
            <div className="absolute inset-0 opacity-10" style={{
              background: `linear-gradient(
                115deg,
                transparent 10%,
                #ff006688 25%,
                #ffaa0088 35%,
                #00ff8888 45%,
                #0088ff88 55%,
                #aa00ff88 65%,
                transparent 80%
              )`,
              mixBlendMode: "screen",
            }} />
          )}

          {/* ── Animated shine sweep ── */}
          {isAvailable && (
            <motion.div
              className="absolute inset-0 pointer-events-none z-20"
              style={{
                background: `linear-gradient(
                  108deg,
                  transparent 25%,
                  ${pack.color}44 46%,
                  rgba(255,255,255,0.22) 50%,
                  ${pack.color}30 54%,
                  transparent 75%
                )`,
              }}
              initial={{ x: "-100%" }}
              animate={{ x: "250%" }}
              transition={{ duration: 2.8, repeat: Infinity, repeatDelay: 3.5, ease: "easeInOut" }}
            />
          )}

          {/* ── Top edge highlight ── */}
          <div className="absolute top-0 left-4 right-4 h-px z-10"
            style={{ background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)` }} />
          {/* ── Bottom-to-top vignette ── */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 z-10 pointer-events-none" />

          {/* ── HEADER ── */}
          <div className="relative z-30 flex items-start justify-between px-4 pt-4">
            <div className="flex flex-col gap-0.5">
              <span
                className="font-display text-[9px] font-black uppercase tracking-[0.28em]"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >COINRIP</span>
              <span
                className="text-[8px] font-bold uppercase tracking-[0.15em]"
                style={{ color: pack.color + "CC" }}
              >{pack.subtitle}</span>
            </div>
            <div className="flex flex-col items-end gap-1">
              {isFree && (
                <motion.span
                  animate={{ scale: [1, 1.06, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                  className="text-[9px] font-black uppercase px-2.5 py-1 rounded-full"
                  style={{ background: "#E2FF00", color: "#000", boxShadow: "0 0 14px rgba(226,255,0,0.7)" }}
                >🎁 FREE</motion.span>
              )}
              {pack.badgeLabel && !isFree && (
                <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full"
                  style={{ background: pack.color, color: "#000", boxShadow: `0 0 10px ${pack.color}` }}>
                  {pack.badgeLabel}
                </span>
              )}
              <div className="flex items-center gap-0.5 opacity-30">
                <span className="text-[7px] text-white uppercase font-semibold tracking-wider">tap → rates</span>
              </div>
            </div>
          </div>

          {/* ── CENTER: pack name ── */}
          <div className="relative z-30 flex-1 flex flex-col items-center justify-center px-4 gap-2">
            {/* Glow orb behind name */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <motion.div
                className="w-44 h-44 rounded-full blur-3xl"
                style={{ background: pack.color }}
                animate={{ scale: [0.9, 1.1, 0.9], opacity: isAvailable ? [0.22, 0.35, 0.22] : [0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>

            <div className="relative flex flex-col items-center gap-1.5">
              {/* Pack name */}
              <motion.h2
                className="font-display font-black uppercase text-center leading-[0.9]"
                style={{
                  fontSize: pack.name.length > 8 ? "36px" : "42px",
                  color: "#fff",
                  textShadow: isAvailable
                    ? `0 0 20px ${pack.color}, 0 0 50px ${pack.color}80, 0 3px 0 rgba(0,0,0,0.9), 0 1px 0 rgba(0,0,0,1)`
                    : `0 3px 0 rgba(0,0,0,0.8)`,
                }}
                animate={isAvailable ? {
                  textShadow: [
                    `0 0 20px ${pack.color}, 0 0 50px ${pack.color}80, 0 3px 0 rgba(0,0,0,0.9)`,
                    `0 0 35px ${pack.color}, 0 0 80px ${pack.color}BB, 0 3px 0 rgba(0,0,0,0.9)`,
                    `0 0 20px ${pack.color}, 0 0 50px ${pack.color}80, 0 3px 0 rgba(0,0,0,0.9)`,
                  ]
                } : {}}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                {pack.name}
              </motion.h2>

              {/* Divider with pack name */}
              <div className="flex items-center gap-2 w-full justify-center">
                <div className="flex-1 h-px max-w-[30px]"
                  style={{ background: `linear-gradient(90deg, transparent, ${pack.color}80)` }} />
                <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                  PACK · 6 COINS
                </span>
                <div className="flex-1 h-px max-w-[30px]"
                  style={{ background: `linear-gradient(90deg, ${pack.color}80, transparent)` }} />
              </div>

              {/* Cost pill */}
              <div
                className="flex items-center gap-1.5 px-3 py-1 rounded-full mt-0.5"
                style={{
                  background: pack.color + "1A",
                  border: `1px solid ${pack.color}44`,
                  boxShadow: isAvailable ? `0 0 12px ${pack.shadowColor}` : "none",
                }}
              >
                <span className="text-sm">🪙</span>
                <span className="font-display font-black text-sm" style={{ color: pack.color }}>
                  {pack.cost === 0 ? "FREE" : `${pack.cost} COINS`}
                </span>
              </div>
            </div>
          </div>

          {/* ── BOTTOM: coin strip ── */}
          <div className="relative z-30 px-4 pb-3">
            <div
              className="rounded-2xl px-3 py-2.5 relative overflow-hidden"
              style={{
                background: `linear-gradient(145deg, ${pack.color}18, rgba(0,0,0,0.5))`,
                border: `1px solid ${pack.color}30`,
                backdropFilter: "blur(4px)",
              }}
            >
              <div className="grid grid-cols-3 gap-x-2 gap-y-1.5">
                {previewCoins.map((coin, i) => (
                  <motion.div key={coin.name + i}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.06, type: "spring", stiffness: 320, damping: 22 }}
                    className="flex justify-center"
                  >
                    <CoinTiny coin={coin} />
                  </motion.div>
                ))}
              </div>
              {/* tier pills */}
              <div className="flex flex-wrap justify-center gap-1 mt-2 pt-1.5 border-t border-white/5">
                {eligibleTiers.map(([tier]) => (
                  <span key={tier}
                    className="text-[6.5px] font-black uppercase px-1.5 py-0.5 rounded-full leading-none"
                    style={{ background: TIER_COLORS[tier as Tier] + "22", color: TIER_COLORS[tier as Tier] }}>
                    {TIER_ICONS[tier as Tier]} {tier === "SINGULARITY" ? "SING" : tier}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIP BUTTON (part of front face) ── */}
          <div className="relative z-30 px-4 pb-4">
            <motion.button
              className="w-full h-12 rounded-2xl font-display font-black text-sm uppercase tracking-wide flex items-center justify-center gap-2 relative overflow-hidden"
              style={{
                background: isAvailable
                  ? `linear-gradient(135deg, ${pack.color}, ${pack.color}CC)`
                  : "#1C1C28",
                color: isAvailable ? "#000" : "#3A3A50",
                boxShadow: isAvailable
                  ? `0 4px 22px ${pack.shadowColor}, 0 0 40px ${pack.shadowColor}55, inset 0 1px 0 rgba(255,255,255,0.3)`
                  : "none",
                cursor: isAvailable ? "pointer" : "default",
              }}
              whileTap={isAvailable ? { scale: 0.96 } : {}}
              onClick={(e) => {
                e.stopPropagation();
                if (isAvailable) onRip(); else onLoginRequired();
              }}
            >
              {isAvailable && (
                <motion.div
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)" }}
                  initial={{ x: "-100%" }} animate={{ x: "220%" }}
                  transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 2.5 }}
                />
              )}
              {isFree
                ? isAvailable
                  ? <><span>🎁</span> RIP FREE · 6 COINS</>
                  : <><span>⏳</span> {timeLeft ?? "Tomorrow"}</>
                : isAvailable
                ? <><span>⚡</span> RIP · {pack.cost} 🪙 · 6 COINS</>
                : <><span>🔒</span> {pack.cost} COINS NEEDED</>
              }
            </motion.button>
          </div>
        </div>

        {/* ══════════ BACK — drop rates ══════════ */}
        <div
          className="absolute inset-0 rounded-[24px] overflow-hidden flex flex-col"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: `linear-gradient(160deg, ${pack.color}1A 0%, #0A0A12 50%, ${pack.shadowColor}0C 100%)`,
            boxShadow: `0 0 0 1.5px ${pack.color}70, 0 20px 60px ${pack.shadowColor}, inset 0 1px 0 rgba(255,255,255,0.10)`,
          }}
          onClick={() => setIsFlipped(false)}
        >
          {/* BG texture */}
          <div className="absolute inset-0 opacity-20" style={{
            background: `repeating-linear-gradient(-48deg, transparent, transparent 10px, ${pack.color}0d 10px, ${pack.color}0d 20px)`,
          }} />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50 pointer-events-none" />
          <div className="absolute top-0 left-4 right-4 h-px" style={{ background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)` }} />

          {/* Animated shimmer */}
          <motion.div
            className="absolute inset-0 pointer-events-none z-10"
            style={{ background: `linear-gradient(108deg, transparent 30%, ${pack.color}30 50%, transparent 70%)` }}
            initial={{ x: "-100%" }} animate={{ x: "250%" }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 4 }}
          />

          {/* Header */}
          <div className="relative z-20 px-4 pt-4 pb-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[8px] font-bold uppercase tracking-widest" style={{ color: pack.color + "AA" }}>
                  DROP RATES
                </span>
                <h3 className="font-display text-2xl font-black uppercase text-white leading-tight"
                  style={{ textShadow: `0 0 20px ${pack.color}80` }}>
                  {pack.name}
                </h3>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[7px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{ background: pack.color + "22", color: pack.color, border: `1px solid ${pack.color}30` }}>
                  6 coins/rip
                </span>
                <span className="text-[7px] text-zinc-600 uppercase tracking-wider">tap to close</span>
              </div>
            </div>
            <div className="mt-2 h-px" style={{ background: `linear-gradient(90deg, ${pack.color}70, transparent)` }} />
          </div>

          {/* Rates */}
          <div className="relative z-20 flex-1 px-4 flex flex-col gap-2.5 overflow-y-auto">
            {eligibleTiers.map(([tier, weight], i) => {
              const pct = Math.round((weight / totalWeight) * 100);
              const color = TIER_COLORS[tier as Tier];
              return (
                <div key={tier} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black" style={{ color }}>{TIER_ICONS[tier as Tier]}</span>
                      <span className="text-[11px] font-black uppercase tracking-wide" style={{ color }}>
                        {tier}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-full"
                      style={{ background: color + "20", color, border: `1px solid ${color}30` }}>
                      {pct}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden relative" style={{ background: color + "14", border: `1px solid ${color}18` }}>
                    <motion.div
                      className="h-full rounded-full absolute inset-y-0 left-0"
                      style={{ background: `linear-gradient(90deg, ${color}, ${color}99)`, boxShadow: `0 0 8px ${color}` }}
                      initial={{ width: 0 }}
                      animate={{ width: isFlipped ? `${pct}%` : 0 }}
                      transition={{ delay: i * 0.09 + 0.15, duration: 0.65, ease: "easeOut" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Coin grid preview on back */}
          <div className="relative z-20 px-4 pb-3">
            <div className="h-px mb-2.5" style={{ background: `linear-gradient(90deg, transparent, ${pack.color}50, transparent)` }} />
            <div className="grid grid-cols-3 gap-2">
              {previewCoins.map((coin, i) => (
                <motion.div key={coin.name + i}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: isFlipped ? 1 : 0, scale: isFlipped ? 1 : 0.6 }}
                  transition={{ delay: i * 0.06 + 0.3, type: "spring", stiffness: 280, damping: 22 }}
                  className="flex justify-center"
                >
                  <CoinMiniBack coin={coin} />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Back button */}
          <div className="relative z-20 px-4 pb-4">
            <button
              className="w-full h-10 rounded-2xl font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 text-zinc-400"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              onClick={(e) => { e.stopPropagation(); setIsFlipped(false); }}
            >
              ← Back to Pack
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  );
}

/* ─────────────── page ─────────────── */
export default function Home() {
  const { state, canRipFree, getTimeUntilFreeRip, payForRip } = useGameState();
  const [, setLocation] = useLocation();
  const [showNeedLogin, setShowNeedLogin] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showInsufficientCoins, setShowInsufficientCoins] = useState<string | null>(null);

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
      setShowInsufficientCoins(`Need ${pack.cost} coins — rip packs to earn more!`);
      setTimeout(() => setShowInsufficientCoins(null), 3000);
    }
  };

  return (
    <div className="flex flex-col gap-5 pb-4">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden px-6 pt-7 pb-3">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div className="absolute -top-14 -left-14 w-56 h-56 rounded-full blur-3xl"
            style={{ background: "#E2FF00" }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.12, 0.2, 0.12] }}
            transition={{ duration: 4.5, repeat: Infinity }} />
          <motion.div className="absolute -top-8 -right-10 w-44 h-44 rounded-full blur-3xl"
            style={{ background: "#D946EF" }}
            animate={{ scale: [1.1, 0.85, 1.1], opacity: [0.08, 0.16, 0.08] }}
            transition={{ duration: 5.5, repeat: Infinity, delay: 1 }} />
        </div>

        <motion.div className="text-center space-y-2 relative z-10"
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
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
            Rip packs · Get 6 real coins each · Collect &amp; redeem
          </motion.p>

          <AnimatePresence>
            {showNeedLogin && (
              <motion.div
                initial={{ opacity: 0, scale: 0.88, y: -8 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92 }}
                className="inline-flex items-center gap-1.5 text-xs text-black font-black bg-primary py-1.5 px-4 rounded-full"
                style={{ boxShadow: "0 0 20px rgba(226,255,0,0.5)" }}
              >↑ Log in to start ripping packs</motion.div>
            )}
            {showInsufficientCoins && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 6 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="inline-flex items-center gap-1.5 text-xs text-white font-bold bg-red-500/20 border border-red-500/30 py-1.5 px-4 rounded-full"
              >{showInsufficientCoins}</motion.div>
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

      {/* ── Welcome Banner ── */}
      <AnimatePresence>
        {showWelcome && state.username && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-6 rounded-2xl overflow-hidden relative"
            style={{ background: "linear-gradient(135deg, #E2FF00, #06B6D4)", boxShadow: "0 0 40px rgba(226,255,0,0.5)" }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/15 to-transparent pointer-events-none" />
            <div className="p-4 flex items-center gap-3">
              <motion.div className="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center shrink-0"
                animate={{ rotate: [0, -5, 5, 0] }} transition={{ duration: 1.5, repeat: 2 }}>
                <Sparkles className="w-5 h-5 text-white" />
              </motion.div>
              <div className="flex-1 min-w-0">
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

      {/* ── Stats ── */}
      {state.username && (
        <div className="flex gap-2 px-6">
          {[
            { label: "Rips",   value: state.totalRips || 0,    accent: "#E2E8F0", icon: "🎴" },
            { label: "Unique", value: state.collection.length,  accent: "#06B6D4", icon: "💎" },
            { label: "COINS",  value: state.coinBalance,        accent: "#E2FF00", icon: "🪙" },
          ].map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 320, damping: 22 }}
              className="flex-1 text-center relative overflow-hidden rounded-2xl p-3"
              style={{ background: `linear-gradient(145deg, ${s.accent}14, #0A0A12)`, border: `1px solid ${s.accent}30` }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
              <p className="text-base mb-0.5">{s.icon}</p>
              <p className="font-mono font-black text-xl"
                style={{ color: s.accent, textShadow: `0 0 14px ${s.accent}80` }}>{s.value}</p>
              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Packs ── */}
      <div className="flex flex-col gap-2 px-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-black uppercase tracking-widest text-white">Packs</h2>
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-zinc-500 italic">tap card → rates</span>
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

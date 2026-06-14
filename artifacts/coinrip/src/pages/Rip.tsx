import { useState, useEffect, useRef } from "react";
import { useGameState } from "@/hooks/use-game-state";
import { getRandomCoinForPack, Coin, PackId, PACKS } from "@/lib/dataset";
import { useLocation, useSearch } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

/* ── tier-based pastel palette (matches physical pack style) ── */
const TIER_PASTEL = {
  SINGULARITY: { bg: "#F0C838", tri: "#FFFACC", crimp: "#BF9000", text: "#201800", sub: "#705000", glow: "rgba(240,200,56,0.5)" },
  PULSAR:      { bg: "#CC7AE8", tri: "#F5E0FF", crimp: "#8830C0", text: "#28003A", sub: "#6010A0", glow: "rgba(204,122,232,0.5)" },
  NOVA:        { bg: "#50C8E8", tri: "#D8F8FF", crimp: "#1888C0", text: "#001828", sub: "#004878", glow: "rgba(80,200,232,0.45)" },
  FLARE:       { bg: "#F09055", tri: "#FFEACC", crimp: "#C05020", text: "#2A0A00", sub: "#7A2808", glow: "rgba(240,144,85,0.45)" },
  SPARK:       { bg: "#D0D8E8", tri: "#F0F4FF", crimp: "#8898B0", text: "#1A2030", sub: "#485868", glow: "rgba(208,216,232,0.35)" },
} as const;

/* ── pack packaging colors (matches Home.tsx PKG) ── */
const PKG_RIP: Record<PackId, { bg: string; tri: string; crimp: string; text: string; sub: string }> = {
  daily:   { bg: "#F5E95A", tri: "#FFFDE0", crimp: "#D4CC20", text: "#2A2600", sub: "#6A6200" },
  mystery: { bg: "#CC7AE8", tri: "#F0D8FF", crimp: "#9038C0", text: "#28003A", sub: "#60108A" },
  starter: { bg: "#F09055", tri: "#FFEACC", crimp: "#C85820", text: "#2A0A00", sub: "#7A2800" },
  blazer:  { bg: "#50C8E8", tri: "#D0F4FF", crimp: "#1888C0", text: "#001828", sub: "#004870" },
  cosmic:  { bg: "#A870D8", tri: "#E8D8FF", crimp: "#6830B0", text: "#18003A", sub: "#48009A" },
  galaxy:  { bg: "#F0C838", tri: "#FFF8CC", crimp: "#C09000", text: "#201800", sub: "#705000" },
};

const CRIMP_S = 16; /* crimp height for coin cards */
const PACK_COINS = 6;

/* ════════════════════════════════════════
   Physical coin card — snack-pack style
════════════════════════════════════════ */
function CoinCard({ coin, index, isBest }: { coin: Coin; index: number; isBest: boolean }) {
  const [imgErr, setImgErr] = useState(false);
  const p = TIER_PASTEL[coin.tier as keyof typeof TIER_PASTEL];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, rotateX: 20, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
      transition={{
        delay: index * 0.11 + 0.18,
        type: "spring",
        stiffness: 240,
        damping: 20,
      }}
      style={{
        borderRadius: 16,
        overflow: "hidden",
        position: "relative",
        boxShadow: isBest
          ? `0 2px 4px rgba(0,0,0,0.22), 0 10px 24px rgba(0,0,0,0.32), 0 28px 60px rgba(0,0,0,0.25), 0 0 0 2px ${p.crimp}, inset 0 1px 0 rgba(255,255,255,0.65), inset 0 -2px 0 rgba(0,0,0,0.18), 0 0 40px ${p.glow}`
          : `0 2px 4px rgba(0,0,0,0.18), 0 8px 18px rgba(0,0,0,0.26), 0 20px 44px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.55), inset 0 -1px 0 rgba(0,0,0,0.15)`,
      }}
    >
      {/* BEST sticker */}
      {isBest && (
        <motion.div
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: -12 }}
          transition={{ delay: index * 0.11 + 0.55, type: "spring", stiffness: 420 }}
          style={{
            position: "absolute", top: CRIMP_S + 6, right: 8, zIndex: 30,
            background: p.crimp, color: p.tri, fontSize: 7, fontWeight: 900,
            textTransform: "uppercase", padding: "3px 7px", borderRadius: 99,
            letterSpacing: "0.12em",
            boxShadow: `0 2px 8px rgba(0,0,0,0.3), 0 0 12px ${p.glow}`,
          }}
        >★ BEST</motion.div>
      )}

      {/* ── TOP CRIMP ── */}
      <div style={{
        height: CRIMP_S, background: p.crimp,
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.10) 2px, rgba(0,0,0,0.10) 3px)`,
        }} />
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 4,
          background: "linear-gradient(180deg, rgba(255,255,255,0.40), transparent)",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(90deg, rgba(0,0,0,0.18) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.18) 100%)",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontSize: 7, fontWeight: 900, color: p.text + "80", textTransform: "uppercase", letterSpacing: "0.25em" }}>
            COINRIP
          </span>
        </div>
      </div>

      {/* ── MAIN BODY ── */}
      <div style={{
        background: p.bg, position: "relative", overflow: "hidden",
        display: "flex", flexDirection: "column", alignItems: "center",
        padding: "10px 10px 12px", gap: 8,
      }}>
        {/* Diagonal accent */}
        <div style={{
          position: "absolute", top: 0, right: 0, width: 0, height: 0,
          borderStyle: "solid", borderWidth: "0 80px 50px 0",
          borderColor: `transparent ${p.tri} transparent transparent`,
          opacity: 0.85,
        }} />
        {/* Top-left gloss */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(145deg, rgba(255,255,255,0.42) 0%, transparent 50%)",
          pointerEvents: "none",
        }} />
        {/* Bottom darkening */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.08) 100%)",
          pointerEvents: "none",
        }} />
        {/* Animated shine */}
        {isBest && (
          <motion.div
            style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              background: "linear-gradient(108deg, transparent 25%, rgba(255,255,255,0.28) 48%, rgba(255,255,255,0.10) 52%, transparent 75%)",
            }}
            initial={{ x: "-100%" }} animate={{ x: "200%" }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1.8, ease: "easeInOut" }}
          />
        )}

        {/* Tier label */}
        <div style={{
          position: "relative", zIndex: 10, alignSelf: "flex-start",
          fontSize: 7, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em",
          color: p.sub,
        }}>
          {coin.tier === "SINGULARITY" ? "✦ SINGULARITY" : `◆ ${coin.tier}`}
        </div>

        {/* Logo circle */}
        <div style={{
          width: 60, height: 60, borderRadius: "50%",
          background: "rgba(0,0,0,0.12)",
          border: `2px solid rgba(0,0,0,0.14)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden", position: "relative", zIndex: 10, flexShrink: 0,
          boxShadow: "inset 0 2px 6px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.15)",
        }}>
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: "50%",
            background: "linear-gradient(180deg, rgba(255,255,255,0.30), transparent)",
            borderRadius: "50% 50% 0 0",
          }} />
          {!imgErr && coin.logoUrl ? (
            <img src={coin.logoUrl} alt={coin.name}
              style={{ width: 42, height: 42, objectFit: "contain", position: "relative", zIndex: 1 }}
              onError={() => setImgErr(true)} />
          ) : (
            <span style={{ fontWeight: 900, fontSize: 22, color: p.text + "AA", zIndex: 1 }}>
              {coin.name[0]}
            </span>
          )}
        </div>

        {/* Ticker — big */}
        <div style={{
          position: "relative", zIndex: 10, textAlign: "center",
        }}>
          <p style={{
            fontSize: 15, fontWeight: 900, letterSpacing: "0.04em",
            color: p.text,
            textShadow: "0 1px 0 rgba(255,255,255,0.5)",
            lineHeight: 1,
          }}>{coin.ticker}</p>
          <p style={{
            fontSize: 8.5, fontWeight: 700, color: p.sub,
            marginTop: 3, lineHeight: 1.2,
          }}>
            {coin.name.length > 12 ? coin.name.slice(0, 11) + "…" : coin.name}
          </p>
        </div>
      </div>

      {/* ── BOTTOM CRIMP ── */}
      <div style={{
        height: CRIMP_S, background: p.crimp,
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.10) 2px, rgba(0,0,0,0.10) 3px)`,
        }} />
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 4,
          background: "linear-gradient(0deg, rgba(0,0,0,0.20), transparent)",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(90deg, rgba(0,0,0,0.18) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.18) 100%)",
        }} />
        {/* mini barcode */}
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 1.5,
        }}>
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} style={{
              width: i % 3 === 0 ? 2 : 1,
              height: i % 4 === 0 ? 10 : 7,
              background: p.text + "55", borderRadius: 0.5,
            }} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ── confetti particle ── */
function Particle({ index, color, big }: { index: number; color: string; big: boolean }) {
  const count = big ? 52 : 28;
  const angle = (index / count) * 360 + Math.random() * 30;
  const dist = (big ? 90 : 60) + Math.random() * 200;
  const x = Math.cos((angle * Math.PI) / 180) * dist;
  const y = Math.sin((angle * Math.PI) / 180) * dist;
  const size = big ? 3 + Math.random() * 9 : 2 + Math.random() * 5;
  const isStrip = Math.random() > 0.5;
  return (
    <motion.div
      style={{
        position: "absolute", top: "50%", left: "50%",
        borderRadius: isStrip ? 2 : "50%",
        backgroundColor: color,
        width: isStrip ? size * 0.5 : size,
        height: isStrip ? size * 3.5 : size,
        marginLeft: -(isStrip ? size * 0.5 : size) / 2,
        marginTop: -(isStrip ? size * 3.5 : size) / 2,
        rotate: angle,
      }}
      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
      animate={{ x, y, opacity: 0, scale: 0.2 }}
      transition={{ duration: 0.85 + Math.random() * 0.7, ease: "easeOut", delay: Math.random() * 0.2 }}
    />
  );
}

/* ── physical pack for shake/tear stage ── */
function PhysicalPack({ pack, stage }: { pack: typeof PACKS[0]; stage: "shaking" | "tearing" }) {
  const p = PKG_RIP[pack.id];
  const CRIMP_P = 28;

  return (
    <div style={{
      width: 200, height: 310,
      borderRadius: 20, overflow: "hidden",
      boxShadow: `0 8px 20px rgba(0,0,0,0.3), 0 24px 60px rgba(0,0,0,0.4), 0 50px 100px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.60), inset 0 -2px 0 rgba(0,0,0,0.20)`,
    }}>
      {/* Top crimp */}
      <div style={{ height: CRIMP_P, background: p.crimp, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.10) 3px, rgba(0,0,0,0.10) 4px)` }} />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 6, background: "linear-gradient(180deg, rgba(255,255,255,0.45), transparent)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(0,0,0,0.15) 0%, transparent 25%, transparent 75%, rgba(0,0,0,0.15) 100%)" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 12px" }}>
          <span style={{ fontSize: 8, fontWeight: 900, color: p.text + "88", textTransform: "uppercase", letterSpacing: "0.3em" }}>COINRIP</span>
          {pack.badgeLabel && (
            <span style={{ fontSize: 7, fontWeight: 900, background: p.text, color: p.bg, padding: "2px 6px", borderRadius: 99, textTransform: "uppercase" }}>{pack.badgeLabel}</span>
          )}
          {pack.isFreeDaily && (
            <span style={{ fontSize: 7, fontWeight: 900, background: p.text, color: p.bg, padding: "2px 6px", borderRadius: 99 }}>🎁 FREE</span>
          )}
        </div>
      </div>

      {/* Main body */}
      <div style={{ flex: 1, height: 310 - CRIMP_P * 2, background: p.bg, position: "relative", overflow: "hidden" }}>
        {/* Diagonal triangle */}
        <div style={{ position: "absolute", top: 0, right: 0, width: 0, height: 0, borderStyle: "solid", borderWidth: "0 200px 110px 0", borderColor: `transparent ${p.tri} transparent transparent`, opacity: 0.85 }} />
        {/* Gloss */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(145deg, rgba(255,255,255,0.42) 0%, transparent 45%)", pointerEvents: "none" }} />
        {/* Animated shine */}
        <motion.div
          style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(108deg, transparent 25%, rgba(255,255,255,0.28) 48%, rgba(255,255,255,0.10) 52%, transparent 75%)" }}
          initial={{ x: "-100%" }} animate={{ x: "200%" }}
          transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 0.8, ease: "easeInOut" }}
        />
        {/* Content */}
        <div style={{ position: "relative", zIndex: 10, height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, padding: "0 20px" }}>
          <p style={{ fontSize: 9, fontWeight: 800, color: p.sub, textTransform: "uppercase", letterSpacing: "0.2em" }}>{pack.subtitle}</p>
          <h2 style={{ fontSize: 36, fontWeight: 900, color: p.text, textTransform: "uppercase", textAlign: "center", lineHeight: 0.9, textShadow: "1px 2px 0 rgba(255,255,255,0.5)" }}>{pack.name}</h2>
          <div style={{ width: 40, height: 2, background: p.text + "40", borderRadius: 2 }} />
          <motion.p
            style={{ fontSize: 10, fontWeight: 700, color: p.sub, textTransform: "uppercase", letterSpacing: "0.15em" }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.65, repeat: Infinity }}
          >
            {stage === "tearing" ? "Opening…" : "Ripping!"}
          </motion.p>
        </div>
      </div>

      {/* Bottom crimp */}
      <div style={{ height: CRIMP_P, background: p.crimp, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.10) 3px, rgba(0,0,0,0.10) 4px)` }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 6, background: "linear-gradient(0deg, rgba(0,0,0,0.22), transparent)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(0,0,0,0.15) 0%, transparent 25%, transparent 75%, rgba(0,0,0,0.15) 100%)" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}>
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} style={{ width: i % 3 === 0 ? 2 : 1, height: i % 5 === 0 ? 14 : 10, background: p.text + "50", borderRadius: 1 }} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   Main Rip page
══════════════════════════════════════════════ */
export default function Rip() {
  const { state, addPackCoins, isLoaded } = useGameState();
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const packId = (params.get("pack") || "daily") as PackId;
  const pack = PACKS.find(p => p.id === packId) ?? PACKS[0];
  const packColor = PKG_RIP[packId].bg;

  const [stage, setStage] = useState<"shaking" | "tearing" | "reveal">("shaking");
  const [revealedCoins, setRevealedCoins] = useState<Coin[]>([]);
  const [showParticles, setShowParticles] = useState(false);
  const [screenFlash, setScreenFlash] = useState(false);
  const claimed = useRef(false);
  const ripStarted = useRef(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (!state.username) { setLocation("/"); return; }
    if (ripStarted.current) return;
    ripStarted.current = true;

    const coins = Array.from({ length: PACK_COINS }, () => getRandomCoinForPack(packId));
    setRevealedCoins(coins);

    const t1 = setTimeout(() => setStage("tearing"), 1600);
    const t2 = setTimeout(() => {
      setScreenFlash(true);
      setTimeout(() => setScreenFlash(false), 400);
      setStage("reveal");
      setShowParticles(true);
    }, 3000);

    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [isLoaded, state.username, setLocation, packId]);

  const handleClaim = () => {
    if (revealedCoins.length && !claimed.current) {
      claimed.current = true;
      addPackCoins(revealedCoins.map(c => c.name), packId);
      setLocation("/collection");
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
        <motion.div className="w-12 h-12 rounded-full border-4"
          style={{ borderColor: "rgba(226,255,0,0.25)", borderTopColor: "#E2FF00" }}
          animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }} />
        <p className="text-sm text-muted-foreground font-bold uppercase tracking-wider">Loading…</p>
      </div>
    );
  }

  /* ── Shake + Tear phase ── */
  if (stage !== "reveal") {
    return (
      <div className="relative min-h-[82vh] flex flex-col items-center justify-center overflow-hidden">
        {/* Screen flash */}
        <AnimatePresence>
          {screenFlash && (
            <motion.div className="absolute inset-0 z-50 pointer-events-none"
              style={{ background: packColor }}
              initial={{ opacity: 0.9 }} animate={{ opacity: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }} />
          )}
        </AnimatePresence>

        {/* Background pulse */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at center, ${packColor}25 0%, transparent 65%)` }}
          animate={{ scale: stage === "shaking" ? [1, 1.08, 1] : 1, opacity: stage === "shaking" ? [0.8, 1, 0.8] : 1 }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />

        {/* Pack with shake animation */}
        <motion.div
          animate={stage === "shaking" ? {
            rotate: [0, -6, 6, -7, 7, -5, 5, -4, 4, -3, 3, 0],
            x: [0, -4, 4, -5, 5, -4, 4, -2, 2, 0],
            y: [0, -3, 3, -4, 4, -2, 2, -3, 3, 0],
            scale: [1, 1.02, 0.99, 1.03, 0.98, 1.01, 1],
          } : {}}
          transition={stage === "shaking" ? {
            duration: 0.55, repeat: Infinity, ease: "easeInOut",
          } : { duration: 0 }}
          style={{ transformOrigin: "center center" }}
        >
          {stage === "tearing" ? (
            /* ── TEAR: pack splits in two ── */
            <div style={{ position: "relative", width: 200, height: 310 }}>
              {/* Top half flies up */}
              <motion.div
                style={{ position: "absolute", inset: 0, overflow: "hidden", transformOrigin: "center top" }}
                animate={{ y: -180, rotate: -8, opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.55, ease: [0.25, 0, 0.5, 1], delay: 0.1 }}
              >
                <div style={{ clipPath: "polygon(0 0, 100% 0, 100% 52%, 60% 48%, 40% 52%, 0 48%)" }}>
                  <PhysicalPack pack={pack} stage="tearing" />
                </div>
              </motion.div>
              {/* Bottom half flies down */}
              <motion.div
                style={{ position: "absolute", inset: 0, overflow: "hidden", transformOrigin: "center bottom" }}
                animate={{ y: 180, rotate: 8, opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.55, ease: [0.25, 0, 0.5, 1], delay: 0.1 }}
              >
                <div style={{ clipPath: "polygon(0 52%, 40% 48%, 60% 52%, 100% 48%, 100% 100%, 0 100%)" }}>
                  <PhysicalPack pack={pack} stage="tearing" />
                </div>
              </motion.div>
              {/* Center flash */}
              <motion.div
                style={{ position: "absolute", inset: 0, borderRadius: 20, background: packColor }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 0.45, delay: 0.08 }}
              />
            </div>
          ) : (
            <PhysicalPack pack={pack} stage="shaking" />
          )}
        </motion.div>

        {/* Hint text */}
        {stage === "shaking" && (
          <motion.p
            className="absolute bottom-16 font-bold text-xs uppercase tracking-widest"
            style={{ color: packColor + "CC" }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1, repeat: Infinity }}
          >Ripping open…</motion.p>
        )}
      </div>
    );
  }

  /* ── Reveal ── */
  const bestCoin = revealedCoins.reduce((best, coin) =>
    (TIER_PASTEL[coin.tier as keyof typeof TIER_PASTEL]?.glow?.length ?? 0) >
    (TIER_PASTEL[best.tier as keyof typeof TIER_PASTEL]?.glow?.length ?? 0)
      ? coin
      : best,
    revealedCoins[0]
  );
  /* More accurate best: use tier order */
  const tierOrder: Record<string, number> = { SINGULARITY: 5, PULSAR: 4, NOVA: 3, FLARE: 2, SPARK: 1 };
  const actualBest = revealedCoins.reduce((b, c) => (tierOrder[c.tier] ?? 0) > (tierOrder[b.tier] ?? 0) ? c : b, revealedCoins[0]);

  const bp = TIER_PASTEL[actualBest.tier as keyof typeof TIER_PASTEL];
  const isBig = actualBest.tier === "SINGULARITY";
  const isMed = actualBest.tier === "PULSAR";
  const isSpecial = isBig || isMed;
  const totalEarned = PACK_COINS * 2;

  const particleColors = isBig
    ? ["#F0C838", "#FDE68A", "#FFF", "#CC7AE8", "#FBBF24"]
    : isMed ? ["#CC7AE8", "#F0D8FF", "#FFF", "#A870D8"]
    : [packColor, "#FFF", bp.bg];

  return (
    <div className="relative min-h-[82vh] flex flex-col p-5 pb-8 overflow-hidden">
      {/* BG glow */}
      {isSpecial && (
        <motion.div className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ background: `radial-gradient(ellipse at 50% 30%, ${bp.glow} 0%, transparent 65%)` }} />
      )}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% -10%, ${packColor}15 0%, transparent 55%)` }} />

      {/* Particles */}
      {showParticles && (
        <div className="absolute pointer-events-none z-40" style={{ top: "30%", left: "50%" }}>
          {Array.from({ length: isBig ? 60 : isSpecial ? 40 : 26 }).map((_, i) => (
            <Particle key={i} index={i} color={particleColors[i % particleColors.length]} big={isBig || isMed} />
          ))}
        </div>
      )}

      {/* Header */}
      <motion.div className="w-full z-10 mb-4"
        initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Pack Opened</p>
            <h2 className="font-display text-2xl font-black uppercase text-white leading-tight"
              style={{ textShadow: `0 0 20px ${packColor}60` }}>
              {pack.name}
              <span className="text-base font-bold text-zinc-400 ml-2">×6</span>
            </h2>
          </div>
          <motion.div initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 340 }}
            className="flex flex-col items-end gap-1">
            <span className="text-[7px] font-bold uppercase tracking-wider text-zinc-500">Best Pull</span>
            <div className="px-3 py-1.5 rounded-full"
              style={{
                background: bp.bg + "22",
                border: `1.5px solid ${bp.bg}66`,
                boxShadow: `0 0 16px ${bp.glow}`,
              }}>
              <span className="font-black text-sm" style={{ color: bp.bg }}>{actualBest.ticker}</span>
              <span className="font-black text-[9px] uppercase ml-1.5" style={{ color: bp.sub }}>
                {actualBest.tier === "SINGULARITY" ? "✦SING" : actualBest.tier}
              </span>
            </div>
          </motion.div>
        </div>
        <motion.div className="mt-2 h-0.5 rounded-full"
          style={{ background: `linear-gradient(90deg, ${packColor}80, transparent)` }}
          initial={{ width: 0 }} animate={{ width: "100%" }}
          transition={{ delay: 0.2, duration: 0.55 }} />
      </motion.div>

      {/* 2×3 coin card grid */}
      <div className="w-full z-10 grid grid-cols-2 gap-3 mb-4">
        {revealedCoins.map((coin, i) => (
          <CoinCard key={coin.name + i} coin={coin} index={i} isBest={coin === actualBest} />
        ))}
      </div>

      {/* Coins earned banner */}
      <motion.div
        initial={{ opacity: 0, y: 14, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.75, type: "spring", stiffness: 280, damping: 20 }}
        className="w-full z-10 flex items-center justify-center gap-3 rounded-2xl px-5 py-3.5 mb-3 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(226,255,0,0.12), rgba(226,255,0,0.04))",
          border: "1px solid rgba(226,255,0,0.28)",
          boxShadow: "0 0 28px rgba(226,255,0,0.12)",
        }}
      >
        <motion.div className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{ background: "linear-gradient(90deg, transparent, rgba(226,255,0,0.16), transparent)" }}
          initial={{ x: "-100%" }} animate={{ x: "200%" }}
          transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 1.8 }} />
        <motion.span className="font-display font-black text-3xl"
          style={{ color: "#E2FF00", textShadow: "0 0 20px rgba(226,255,0,0.9)" }}
          animate={{ scale: [1, 1.12, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}>
          +{totalEarned}
        </motion.span>
        <div className="flex flex-col">
          <span className="text-xs font-black text-zinc-200 uppercase tracking-wider">COINS EARNED 🪙</span>
          <span className="text-[9px] text-zinc-500">{PACK_COINS} cards × 2 each</span>
        </div>
      </motion.div>

      {/* Actions */}
      <div className="flex flex-col gap-2.5 w-full z-10">
        <motion.button
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, type: "spring", stiffness: 280 }}
          onClick={handleClaim}
          whileTap={{ scale: 0.97 }}
          className="w-full py-4 rounded-2xl font-display font-black text-base uppercase tracking-wide relative overflow-hidden"
          style={{
            background: `linear-gradient(180deg, ${bp.bg} 0%, ${bp.crimp} 100%)`,
            color: bp.text,
            boxShadow: `0 3px 0 rgba(0,0,0,0.30), 0 8px 24px rgba(0,0,0,0.20), 0 0 40px ${bp.glow}`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/25 to-transparent pointer-events-none rounded-2xl" />
          <motion.div className="absolute inset-0 pointer-events-none rounded-2xl"
            style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)" }}
            initial={{ x: "-100%" }} animate={{ x: "200%" }}
            transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 2.2 }} />
          ✦ Add All {PACK_COINS} to Vault
        </motion.button>
        <motion.button
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, type: "spring", stiffness: 280 }}
          onClick={() => setLocation("/")}
          whileTap={{ scale: 0.97 }}
          className="w-full py-3 rounded-2xl font-bold text-sm uppercase tracking-wide text-zinc-500"
          style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}
        >← Rip Another Pack</motion.button>
      </div>
    </div>
  );
}

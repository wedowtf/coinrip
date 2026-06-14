import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { apiClient, type LeaderboardEntry } from "@/lib/api-client";

type SortMode = "flips" | "unique";

const MEDAL: Record<number, { bg: string; text: string; glow: string; label: string }> = {
  1: { bg: "rgba(255,215,0,0.14)", text: "#FFD700", glow: "0 0 24px rgba(255,215,0,0.35)", label: "🥇" },
  2: { bg: "rgba(192,192,192,0.12)", text: "#C0C0C0", glow: "0 0 18px rgba(192,192,192,0.25)", label: "🥈" },
  3: { bg: "rgba(205,127,50,0.12)", text: "#CD7F32", glow: "0 0 18px rgba(205,127,50,0.25)", label: "🥉" },
};

function RankBadge({ rank }: { rank: number }) {
  const m = MEDAL[rank];
  if (m) {
    return (
      <span className="text-xl leading-none w-8 text-center">{m.label}</span>
    );
  }
  return (
    <span
      className="w-8 text-center font-mono font-black text-xs"
      style={{ color: "rgba(255,255,255,0.35)" }}
    >
      {rank}
    </span>
  );
}

function EntryRow({ entry, sortMode, index }: { entry: LeaderboardEntry; sortMode: SortMode; index: number }) {
  const m = MEDAL[entry.rank];
  const initials = entry.username.slice(0, 2).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, type: "spring", stiffness: 280, damping: 22 }}
      className="flex items-center gap-3 px-4 py-3 rounded-2xl relative overflow-hidden"
      style={{
        background: m ? m.bg : "rgba(255,255,255,0.03)",
        border: m ? `1px solid ${m.text}30` : "1px solid rgba(255,255,255,0.06)",
        boxShadow: m ? m.glow : "none",
      }}
    >
      {m && (
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)" }}
          initial={{ x: "-100%" }} animate={{ x: "200%" }}
          transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 3 }}
        />
      )}

      <RankBadge rank={entry.rank} />

      <div
        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
        style={{
          background: m
            ? `linear-gradient(135deg, ${m.text}30, ${m.text}10)`
            : "rgba(226,255,0,0.08)",
          border: m ? `1.5px solid ${m.text}50` : "1.5px solid rgba(226,255,0,0.18)",
        }}
      >
        <span
          className="font-display font-black text-xs uppercase"
          style={{ color: m ? m.text : "#E2FF00" }}
        >
          {initials}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <p
          className="font-bold text-sm truncate"
          style={{ color: m ? m.text : "rgba(255,255,255,0.85)" }}
        >
          {entry.username}
        </p>
        <p className="text-[10px] text-zinc-500 font-mono">
          {sortMode === "flips"
            ? `${entry.uniqueCoins} unique coins`
            : `${entry.totalFlips} flips`}
        </p>
      </div>

      <div className="text-right flex-shrink-0">
        <p
          className="font-display font-black text-base"
          style={{ color: m ? m.text : "#E2FF00" }}
        >
          {sortMode === "flips" ? entry.totalFlips : entry.uniqueCoins}
        </p>
        <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">
          {sortMode === "flips" ? "flips" : "unique"}
        </p>
      </div>
    </motion.div>
  );
}

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [sortMode, setSortMode] = useState<SortMode>("flips");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .getLeaderboard(50)
      .then(data => setEntries(data.entries))
      .catch(err => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, []);

  const sorted = [...entries].sort((a, b) =>
    sortMode === "flips"
      ? b.totalFlips - a.totalFlips
      : b.uniqueCoins - a.uniqueCoins,
  ).map((e, i) => ({ ...e, rank: i + 1 }));

  return (
    <div className="px-4 py-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <motion.h1
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display font-black text-2xl uppercase tracking-tight"
          style={{ textShadow: "0 0 30px rgba(226,255,0,0.35)" }}
        >
          🏆 Leaderboard
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-xs text-zinc-500 font-bold uppercase tracking-wider"
        >
          Top collectors in the Orynth ecosystem
        </motion.p>
      </div>

      {/* Sort tabs */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="flex rounded-xl overflow-hidden"
        style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}
      >
        {(["flips", "unique"] as SortMode[]).map(mode => (
          <button
            key={mode}
            onClick={() => setSortMode(mode)}
            className="flex-1 py-2.5 text-xs font-black uppercase tracking-wider transition-all relative"
            style={{
              color: sortMode === mode ? "#E2FF00" : "rgba(255,255,255,0.35)",
              background: sortMode === mode
                ? "linear-gradient(135deg, rgba(226,255,0,0.14), rgba(226,255,0,0.06))"
                : "transparent",
            }}
          >
            {mode === "flips" ? "🔥 Most Flips" : "💎 Most Unique"}
          </button>
        ))}
      </motion.div>

      {/* Content */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <motion.div
            className="w-10 h-10 rounded-full border-4"
            style={{ borderColor: "rgba(226,255,0,0.2)", borderTopColor: "#E2FF00" }}
            animate={{ rotate: 360 }}
            transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Loading…</p>
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
          <p className="text-3xl">⚠️</p>
          <p className="text-sm font-bold text-zinc-400">{error}</p>
          <p className="text-xs text-zinc-600">Make sure the API server is configured.</p>
        </div>
      )}

      {!loading && !error && sorted.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
          <p className="text-3xl">🌌</p>
          <p className="text-sm font-bold text-zinc-400">No players yet</p>
          <p className="text-xs text-zinc-600">Be the first to flip a pack!</p>
        </div>
      )}

      {!loading && !error && sorted.length > 0 && (
        <div className="flex flex-col gap-2">
          {sorted.map((entry, i) => (
            <EntryRow key={entry.username} entry={entry} sortMode={sortMode} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

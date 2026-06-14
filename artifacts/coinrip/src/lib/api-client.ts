import { supabase } from '@/lib/supabase';
import { getRandomCoinForPack } from '@/lib/dataset';
import type { PackId } from '@/lib/dataset';

export interface OwnedCoin {
  name: string;
  quantity: number;
}

export interface GameStateResponse {
  coinBalance: number;
  totalFlips: number;
  lastFreeDailyTimestamp: number | null;
  collection: OwnedCoin[];
}

export interface FlippedCoin {
  name: string;
  ticker: string;
  tier: string;
}

export interface FlipResult {
  coins: FlippedCoin[];
  newBalance: number;
  coinsEarned: number;
  totalFlips: number;
  lastFreeDailyTimestamp: number | null;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  totalFlips: number;
  uniqueCoins: number;
  totalCoins: number;
  coinBalance: number;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
}

const COINS_PER_PACK = 6;
const COINS_EARNED_PER_PACK = COINS_PER_PACK * 2;

// Hard limits enforced client-side (mirrors DB constraints)
const MAX_COIN_BALANCE = 100_000;
const MAX_TOTAL_FLIPS = 1_000_000;
const MAX_COLLECTION_SIZE = 500;
const MAX_COIN_QUANTITY = 10_000;
const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

// Simple in-memory rate limit for flip (prevents rapid-fire spam)
let lastFlipMs = 0;
const FLIP_COOLDOWN_MS = 1000;

function sanitizeUsername(name: string): string {
  return name.trim().slice(0, 20);
}

function clampState(state: GameStateResponse): GameStateResponse {
  return {
    coinBalance: Math.max(0, Math.min(MAX_COIN_BALANCE, Math.round(state.coinBalance))),
    totalFlips: Math.max(0, Math.min(MAX_TOTAL_FLIPS, Math.round(state.totalFlips))),
    lastFreeDailyTimestamp: state.lastFreeDailyTimestamp,
    collection: state.collection
      .filter(c => c.name && typeof c.quantity === 'number' && c.quantity > 0)
      .slice(0, MAX_COLLECTION_SIZE)
      .map(c => ({ name: c.name, quantity: Math.min(MAX_COIN_QUANTITY, Math.round(c.quantity)) })),
  };
}

export const apiClient = {
  getState: async (userId: string): Promise<GameStateResponse> => {
    if (!userId) throw new Error('User ID is required');

    const { data, error } = await supabase
      .from('game_states')
      .select('coin_balance, total_flips, last_free_daily_timestamp, collection')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) {
      return { coinBalance: 500, totalFlips: 0, lastFreeDailyTimestamp: null, collection: [] };
    }
    return clampState({
      coinBalance: data.coin_balance as number,
      totalFlips: data.total_flips as number,
      lastFreeDailyTimestamp: data.last_free_daily_timestamp as number | null,
      collection: (data.collection as OwnedCoin[]) ?? [],
    });
  },

  upsertState: async (userId: string, username: string, state: GameStateResponse): Promise<void> => {
    if (!userId) throw new Error('User ID is required');

    const cleanUsername = sanitizeUsername(username);
    if (!USERNAME_RE.test(cleanUsername)) {
      // Username not yet set — still allow upsert without a username field
      const safeState = clampState(state);
      const { error } = await supabase.from('game_states').upsert(
        {
          user_id: userId,
          coin_balance: safeState.coinBalance,
          total_flips: safeState.totalFlips,
          last_free_daily_timestamp: safeState.lastFreeDailyTimestamp,
          collection: safeState.collection,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' },
      );
      if (error) throw new Error(error.message);
      return;
    }

    const safeState = clampState(state);
    const { error } = await supabase.from('game_states').upsert(
      {
        user_id: userId,
        username: cleanUsername,
        coin_balance: safeState.coinBalance,
        total_flips: safeState.totalFlips,
        last_free_daily_timestamp: safeState.lastFreeDailyTimestamp,
        collection: safeState.collection,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    );
    if (error) throw new Error(error.message);
  },

  flip: async (
    userId: string,
    username: string,
    packId: PackId,
    packCost: number,
    currentState: GameStateResponse,
  ): Promise<FlipResult> => {
    if (!userId) throw new Error('Not authenticated');

    // Client-side rate limit (belt + suspenders — DB trigger is the real guard)
    const now = Date.now();
    if (now - lastFlipMs < FLIP_COOLDOWN_MS) {
      throw new Error('Please wait a moment before flipping again');
    }
    lastFlipMs = now;

    // Validate balance before sending to DB
    const safeCost = Math.max(0, Math.round(packCost));
    if (currentState.coinBalance < safeCost) {
      throw new Error('Insufficient balance');
    }

    const coins: FlippedCoin[] = Array.from({ length: COINS_PER_PACK }, () => {
      const coin = getRandomCoinForPack(packId);
      return { name: coin.name, ticker: coin.ticker, tier: coin.tier };
    });

    const newBalance = currentState.coinBalance - safeCost + COINS_EARNED_PER_PACK;
    const newTotalFlips = currentState.totalFlips + 1;
    const lastFreeDailyTimestamp =
      packId === 'daily' ? Date.now() : currentState.lastFreeDailyTimestamp;

    let newCollection = [...currentState.collection];
    for (const coin of coins) {
      const existing = newCollection.find(c => c.name === coin.name);
      if (existing) {
        newCollection = newCollection.map(c =>
          c.name === coin.name ? { ...c, quantity: c.quantity + 1 } : c,
        );
      } else {
        newCollection = [...newCollection, { name: coin.name, quantity: 1 }];
      }
    }

    const newState: GameStateResponse = clampState({
      coinBalance: newBalance,
      totalFlips: newTotalFlips,
      lastFreeDailyTimestamp,
      collection: newCollection,
    });

    await apiClient.upsertState(userId, username, newState);

    return {
      coins,
      newBalance: newState.coinBalance,
      coinsEarned: COINS_EARNED_PER_PACK,
      totalFlips: newState.totalFlips,
      lastFreeDailyTimestamp,
    };
  },

  getLeaderboard: async (limit = 20): Promise<LeaderboardResponse> => {
    const { data, error } = await supabase
      .from('game_states')
      .select('username, total_flips, collection, coin_balance')
      .order('total_flips', { ascending: false })
      .limit(Math.min(limit, 100)); // cap at 100 to prevent large reads

    if (error) throw new Error(error.message);

    const entries: LeaderboardEntry[] = (data ?? []).map((row, i) => {
      const col = (row.collection as OwnedCoin[]) ?? [];
      return {
        rank: i + 1,
        username: (row.username as string) ?? 'Unknown',
        totalFlips: Math.max(0, row.total_flips as number),
        uniqueCoins: col.length,
        totalCoins: col.reduce((sum, c) => sum + c.quantity, 0),
        coinBalance: Math.max(0, row.coin_balance as number),
      };
    });

    return { entries };
  },
};

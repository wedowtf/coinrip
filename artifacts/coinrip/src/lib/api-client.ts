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

export const apiClient = {
  getState: async (userId: string): Promise<GameStateResponse> => {
    const { data, error } = await supabase
      .from('game_states')
      .select('coin_balance, total_flips, last_free_daily_timestamp, collection')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) {
      return { coinBalance: 500, totalFlips: 0, lastFreeDailyTimestamp: null, collection: [] };
    }
    return {
      coinBalance: data.coin_balance as number,
      totalFlips: data.total_flips as number,
      lastFreeDailyTimestamp: data.last_free_daily_timestamp as number | null,
      collection: (data.collection as OwnedCoin[]) ?? [],
    };
  },

  upsertState: async (userId: string, username: string, state: GameStateResponse): Promise<void> => {
    const { error } = await supabase.from('game_states').upsert(
      {
        user_id: userId,
        username,
        coin_balance: state.coinBalance,
        total_flips: state.totalFlips,
        last_free_daily_timestamp: state.lastFreeDailyTimestamp,
        collection: state.collection,
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
    const coins: FlippedCoin[] = Array.from({ length: COINS_PER_PACK }, () => {
      const coin = getRandomCoinForPack(packId);
      return { name: coin.name, ticker: coin.ticker, tier: coin.tier };
    });

    const newBalance = currentState.coinBalance - packCost + COINS_EARNED_PER_PACK;
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

    const newState: GameStateResponse = {
      coinBalance: newBalance,
      totalFlips: newTotalFlips,
      lastFreeDailyTimestamp,
      collection: newCollection,
    };

    await apiClient.upsertState(userId, username, newState);

    return {
      coins,
      newBalance,
      coinsEarned: COINS_EARNED_PER_PACK,
      totalFlips: newTotalFlips,
      lastFreeDailyTimestamp,
    };
  },

  getLeaderboard: async (limit = 20): Promise<LeaderboardResponse> => {
    const { data, error } = await supabase
      .from('game_states')
      .select('username, total_flips, collection, coin_balance')
      .order('total_flips', { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);

    const entries: LeaderboardEntry[] = (data ?? []).map((row, i) => {
      const col = (row.collection as OwnedCoin[]) ?? [];
      return {
        rank: i + 1,
        username: row.username as string,
        totalFlips: row.total_flips as number,
        uniqueCoins: col.length,
        totalCoins: col.reduce((sum, c) => sum + c.quantity, 0),
        coinBalance: row.coin_balance as number,
      };
    });

    return { entries };
  },
};

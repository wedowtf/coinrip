import React, { useState, useEffect, useCallback, useContext, createContext } from 'react';
import type { User } from '@supabase/supabase-js';
import { type PackId, PACKS } from '@/lib/dataset';
import { useAuth } from '@/hooks/use-auth';
import { apiClient, type FlipResult, type GameStateResponse } from '@/lib/api-client';

export interface OwnedCoin {
  name: string;
  quantity: number;
}

export interface GameState {
  username: string | null;
  coinBalance: number;
  lastFlipTimestamp: number | null;
  lastFreeDailyTimestamp: number | null;
  recentPulls: string[];
  collection: OwnedCoin[];
  totalFlips: number;
}

const DEFAULT_STATE: GameState = {
  username: null,
  coinBalance: 0,
  lastFlipTimestamp: null,
  lastFreeDailyTimestamp: null,
  recentPulls: [],
  collection: [],
  totalFlips: 0,
};

interface GameStateCtx {
  state: GameState;
  isLoaded: boolean;
  login: (username: string) => void;
  logout: () => void;
  flipPack: (packId: PackId) => Promise<FlipResult>;
  canFlipFree: () => boolean;
  getTimeUntilFreeFlip: () => string | null;
  payForFlip: (cost: number) => boolean;
  refreshState: () => Promise<void>;
  updateUsername: (newName: string) => Promise<void>;
}

const Ctx = createContext<GameStateCtx | null>(null);

function displayNameFromUser(user: User): string {
  return (
    (user.user_metadata?.display_name as string | undefined) ??
    (user.user_metadata?.full_name as string | undefined) ??
    user.email?.split('@')[0] ??
    'Flipper'
  );
}

function stateFromResponse(resp: GameStateResponse, username: string): GameState {
  return {
    username,
    coinBalance: resp.coinBalance,
    totalFlips: resp.totalFlips,
    lastFreeDailyTimestamp: resp.lastFreeDailyTimestamp,
    lastFlipTimestamp: null,
    recentPulls: [],
    collection: resp.collection,
  };
}

export function GameStateProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded: authLoaded, logOut } = useAuth();
  const [state, setState] = useState<GameState>(DEFAULT_STATE);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadFromServer = useCallback(async (u: User, displayName: string) => {
    try {
      const data = await apiClient.getState(u.id);
      setState(stateFromResponse(data, displayName));
      // Sync display name to game_states (ensures leaderboard is up to date)
      void apiClient.upsertState(u.id, displayName, data).catch(() => {});
    } catch {
      setState({ ...DEFAULT_STATE, username: displayName, coinBalance: 500 });
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!authLoaded) return;
    if (user) {
      setIsLoaded(false);
      loadFromServer(user, displayNameFromUser(user));
    } else {
      setState(DEFAULT_STATE);
      setIsLoaded(true);
    }
  }, [user, authLoaded, loadFromServer]);

  const refreshState = useCallback(async () => {
    if (!user) return;
    try {
      const data = await apiClient.getState(user.id);
      setState(stateFromResponse(data, displayNameFromUser(user)));
    } catch { /* ignore */ }
  }, [user]);

  const updateUsername = useCallback(async (newName: string) => {
    if (!user) return;
    const currentState: GameStateResponse = {
      coinBalance: state.coinBalance,
      totalFlips: state.totalFlips,
      lastFreeDailyTimestamp: state.lastFreeDailyTimestamp,
      collection: state.collection,
    };
    await apiClient.upsertState(user.id, newName, currentState);
    setState(prev => ({ ...prev, username: newName }));
  }, [user, state]);

  const login = useCallback((_username: string) => {}, []);

  const logout = useCallback(async () => {
    await logOut();
    setState(DEFAULT_STATE);
  }, [logOut]);

  const flipPack = useCallback(async (packId: PackId): Promise<FlipResult> => {
    if (!user) throw new Error('Not authenticated');
    const pack = PACKS.find(p => p.id === packId);
    const packCost = pack?.cost ?? 0;
    const username = displayNameFromUser(user);
    const currentState: GameStateResponse = {
      coinBalance: state.coinBalance,
      totalFlips: state.totalFlips,
      lastFreeDailyTimestamp: state.lastFreeDailyTimestamp,
      collection: state.collection,
    };
    const result = await apiClient.flip(user.id, username, packId, packCost, currentState);
    setState(prev => ({
      ...prev,
      coinBalance: result.newBalance,
      totalFlips: result.totalFlips,
      lastFlipTimestamp: Date.now(),
      ...(result.lastFreeDailyTimestamp != null
        ? { lastFreeDailyTimestamp: result.lastFreeDailyTimestamp }
        : {}),
    }));
    return result;
  }, [user, state]);

  const payForFlip = useCallback((cost: number): boolean => {
    return state.coinBalance >= cost;
  }, [state.coinBalance]);

  const canFlipFree = useCallback((): boolean => {
    if (!state.lastFreeDailyTimestamp) return true;
    return Date.now() - state.lastFreeDailyTimestamp > 24 * 60 * 60 * 1000;
  }, [state.lastFreeDailyTimestamp]);

  const getTimeUntilFreeFlip = useCallback((): string | null => {
    if (!state.lastFreeDailyTimestamp) return null;
    const diff = 24 * 60 * 60 * 1000 - (Date.now() - state.lastFreeDailyTimestamp);
    if (diff <= 0) return null;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return `${h}h ${m}m`;
  }, [state.lastFreeDailyTimestamp]);

  return React.createElement(
    Ctx.Provider,
    { value: { state, isLoaded, login, logout, flipPack, canFlipFree, getTimeUntilFreeFlip, payForFlip, refreshState, updateUsername } },
    children,
  );
}

export function useGameState(): GameStateCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useGameState must be used inside <GameStateProvider>');
  return ctx;
}

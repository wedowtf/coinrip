import React, { useState, useEffect, useCallback, useContext, createContext } from 'react';
import { PackId } from '@/lib/dataset';
import { useAuth } from '@/hooks/use-auth';

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

const DEMO_BALANCE = 500;

const getStorageKey = (uid: string) => `coinflip_state_${uid}`;

function loadUserState(uid: string, displayName: string): GameState {
  const raw = localStorage.getItem(getStorageKey(uid));
  if (raw) {
    const parsed: GameState = { ...DEFAULT_STATE, ...JSON.parse(raw), username: displayName };
    if ((parsed.totalFlips || 0) === 0 && parsed.coinBalance < DEMO_BALANCE) {
      parsed.coinBalance = DEMO_BALANCE;
      localStorage.setItem(getStorageKey(uid), JSON.stringify(parsed));
    }
    return parsed;
  }
  const fresh: GameState = { ...DEFAULT_STATE, username: displayName, coinBalance: DEMO_BALANCE };
  localStorage.setItem(getStorageKey(uid), JSON.stringify(fresh));
  return fresh;
}

interface GameStateCtx {
  state: GameState;
  isLoaded: boolean;
  login: (username: string) => void;
  logout: () => void;
  addCoin: (coinName: string, packId?: PackId) => void;
  addPackCoins: (coinNames: string[], packId?: PackId) => void;
  canFlipFree: () => boolean;
  getTimeUntilFreeFlip: () => string | null;
  payForFlip: (cost: number) => boolean;
}

const Ctx = createContext<GameStateCtx | null>(null);

export function GameStateProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded: authLoaded, logOut } = useAuth();
  const [state, setState] = useState<GameState>(DEFAULT_STATE);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!authLoaded) return;
    if (user) {
      const displayName = user.displayName || user.email?.split('@')[0] || 'Flipper';
      setState(loadUserState(user.uid, displayName));
    } else {
      setState(DEFAULT_STATE);
    }
    setIsLoaded(true);
  }, [user, authLoaded]);

  const persist = useCallback((next: GameState, uid: string) => {
    localStorage.setItem(getStorageKey(uid), JSON.stringify(next));
  }, []);

  // kept for interface compatibility — Firebase handles real login
  const login = useCallback((_username: string) => {}, []);

  const logout = useCallback(async () => {
    await logOut();
    setState(DEFAULT_STATE);
  }, [logOut]);

  const addCoin = useCallback((coinName: string, packId?: PackId) => {
    if (!user) return;
    setState(prev => {
      if (!prev.username) return prev;
      const existing = prev.collection.find(c => c.name === coinName);
      const newCollection = existing
        ? prev.collection.map(c => c.name === coinName ? { ...c, quantity: c.quantity + 1 } : c)
        : [...prev.collection, { name: coinName, quantity: 1 }];
      const next: GameState = {
        ...prev,
        collection: newCollection,
        coinBalance: prev.coinBalance + 2,
        lastFlipTimestamp: Date.now(),
        totalFlips: (prev.totalFlips || 0) + 1,
        recentPulls: [coinName, ...(prev.recentPulls || [])].slice(0, 20),
        ...(packId === 'daily' ? { lastFreeDailyTimestamp: Date.now() } : {}),
      };
      persist(next, user.uid);
      return next;
    });
  }, [user, persist]);

  const addPackCoins = useCallback((coinNames: string[], packId?: PackId) => {
    if (!user) return;
    setState(prev => {
      if (!prev.username) return prev;
      let newCollection = [...prev.collection];
      for (const coinName of coinNames) {
        const existing = newCollection.find(c => c.name === coinName);
        if (existing) {
          newCollection = newCollection.map(c => c.name === coinName ? { ...c, quantity: c.quantity + 1 } : c);
        } else {
          newCollection = [...newCollection, { name: coinName, quantity: 1 }];
        }
      }
      const next: GameState = {
        ...prev,
        collection: newCollection,
        coinBalance: prev.coinBalance + coinNames.length * 2,
        lastFlipTimestamp: Date.now(),
        totalFlips: (prev.totalFlips || 0) + 1,
        recentPulls: [...coinNames, ...(prev.recentPulls || [])].slice(0, 20),
        ...(packId === 'daily' ? { lastFreeDailyTimestamp: Date.now() } : {}),
      };
      persist(next, user.uid);
      return next;
    });
  }, [user, persist]);

  const payForFlip = useCallback((cost: number): boolean => {
    if (!user || state.coinBalance < cost) return false;
    setState(prev => {
      if (prev.coinBalance < cost) return prev;
      const next = { ...prev, coinBalance: prev.coinBalance - cost };
      persist(next, user.uid);
      return next;
    });
    return true;
  }, [user, state.coinBalance, persist]);

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
    { value: { state, isLoaded, login, logout, addCoin, addPackCoins, canFlipFree, getTimeUntilFreeFlip, payForFlip } },
    children
  );
}

export function useGameState(): GameStateCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useGameState must be used inside <GameStateProvider>');
  return ctx;
}

import { useState, useEffect, useCallback, useContext, createContext } from 'react';
import { PackId } from '@/lib/dataset';

export interface OwnedCoin {
  name: string;
  quantity: number;
}

export interface GameState {
  username: string | null;
  coinBalance: number;
  lastRipTimestamp: number | null;
  lastFreeDailyTimestamp: number | null;
  recentPulls: string[];
  collection: OwnedCoin[];
  totalRips: number;
}

const DEFAULT_STATE: GameState = {
  username: null,
  coinBalance: 0,
  lastRipTimestamp: null,
  lastFreeDailyTimestamp: null,
  recentPulls: [],
  collection: [],
  totalRips: 0,
};

const getStorageKey = (username: string) => `coinrip_state_${username}`;

function loadUserState(username: string): GameState {
  const raw = localStorage.getItem(getStorageKey(username));
  if (raw) {
    return { ...DEFAULT_STATE, ...JSON.parse(raw), username };
  }
  const fresh: GameState = { ...DEFAULT_STATE, username, coinBalance: 50 };
  localStorage.setItem(getStorageKey(username), JSON.stringify(fresh));
  return fresh;
}

interface GameStateCtx {
  state: GameState;
  isLoaded: boolean;
  login: (username: string) => void;
  logout: () => void;
  addCoin: (coinName: string, packId?: PackId) => void;
  canRipFree: () => boolean;
  getTimeUntilFreeRip: () => string | null;
  payForRip: (cost: number) => boolean;
}

const Ctx = createContext<GameStateCtx | null>(null);

export function GameStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameState>(DEFAULT_STATE);
  const [isLoaded, setIsLoaded] = useState(false);

  // Single init effect — sets full state THEN marks loaded.
  // isLoaded=true guarantees state.username is correct (not null mid-load).
  useEffect(() => {
    const stored = localStorage.getItem('coinrip_active_user');
    if (stored) {
      setState(loadUserState(stored));
    }
    setIsLoaded(true);
  }, []);

  const persist = useCallback((next: GameState) => {
    if (next.username) {
      localStorage.setItem(getStorageKey(next.username), JSON.stringify(next));
    }
  }, []);

  const login = useCallback((username: string) => {
    localStorage.setItem('coinrip_active_user', username);
    const next = loadUserState(username);
    setState(next);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('coinrip_active_user');
    setState(DEFAULT_STATE);
  }, []);

  const addCoin = useCallback((coinName: string, packId?: PackId) => {
    setState(prev => {
      if (!prev.username) return prev;
      const existing = prev.collection.find(c => c.name === coinName);
      const newCollection = existing
        ? prev.collection.map(c =>
            c.name === coinName ? { ...c, quantity: c.quantity + 1 } : c
          )
        : [...prev.collection, { name: coinName, quantity: 1 }];

      const next: GameState = {
        ...prev,
        collection: newCollection,
        coinBalance: prev.coinBalance + 2,
        lastRipTimestamp: Date.now(),
        totalRips: (prev.totalRips || 0) + 1,
        recentPulls: [coinName, ...(prev.recentPulls || [])].slice(0, 10),
        ...(packId === 'daily' ? { lastFreeDailyTimestamp: Date.now() } : {}),
      };
      if (next.username) {
        localStorage.setItem(getStorageKey(next.username), JSON.stringify(next));
      }
      return next;
    });
  }, []);

  const payForRip = useCallback((cost: number): boolean => {
    // Check against current state snapshot (closure is always fresh because
    // payForRip is re-created when state.coinBalance changes).
    if (state.coinBalance < cost) return false;
    setState(prev => {
      if (prev.coinBalance < cost) return prev; // safety re-check
      const next = { ...prev, coinBalance: prev.coinBalance - cost };
      persist(next);
      return next;
    });
    return true;
  }, [state.coinBalance, persist]);

  const canRipFree = useCallback((): boolean => {
    if (!state.lastFreeDailyTimestamp) return true;
    return Date.now() - state.lastFreeDailyTimestamp > 24 * 60 * 60 * 1000;
  }, [state.lastFreeDailyTimestamp]);

  const getTimeUntilFreeRip = useCallback((): string | null => {
    if (!state.lastFreeDailyTimestamp) return null;
    const diff = 24 * 60 * 60 * 1000 - (Date.now() - state.lastFreeDailyTimestamp);
    if (diff <= 0) return null;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return `${h}h ${m}m`;
  }, [state.lastFreeDailyTimestamp]);

  return (
    <Ctx.Provider
      value={{ state, isLoaded, login, logout, addCoin, canRipFree, getTimeUntilFreeRip, payForRip }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useGameState(): GameStateCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useGameState must be used inside <GameStateProvider>');
  return ctx;
}

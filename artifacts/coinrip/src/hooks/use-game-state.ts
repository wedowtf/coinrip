import { useState, useEffect, useCallback } from 'react';
import { PackId } from '@/lib/dataset';

export interface OwnedCoin {
  name: string;
  quantity: number;
}

export interface GameState {
  username: string | null;
  coinBalance: number;
  lastRipTimestamp: number | null;
  collection: OwnedCoin[];
  totalRips: number;
}

const DEFAULT_STATE: GameState = {
  username: null,
  coinBalance: 0,
  lastRipTimestamp: null,
  collection: [],
  totalRips: 0,
};

const getStorageKey = (username: string) => `coinrip_state_${username}`;

export function useGameState() {
  const [activeUser, setActiveUser] = useState<string | null>(null);
  const [state, setState] = useState<GameState>(DEFAULT_STATE);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('coinrip_active_user');
    if (storedUser) setActiveUser(storedUser);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (activeUser) {
      const storedState = localStorage.getItem(getStorageKey(activeUser));
      if (storedState) {
        setState({ ...DEFAULT_STATE, ...JSON.parse(storedState), username: activeUser });
      } else {
        const newState = { ...DEFAULT_STATE, username: activeUser };
        localStorage.setItem(getStorageKey(activeUser), JSON.stringify(newState));
        setState(newState);
      }
    } else {
      setState(DEFAULT_STATE);
    }
  }, [activeUser]);

  const saveState = useCallback((newState: Partial<GameState>) => {
    setState(prev => {
      const updated = { ...prev, ...newState };
      if (activeUser) {
        localStorage.setItem(getStorageKey(activeUser), JSON.stringify(updated));
      }
      return updated;
    });
  }, [activeUser]);

  const login = useCallback((username: string) => {
    localStorage.setItem('coinrip_active_user', username);
    setActiveUser(username);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('coinrip_active_user');
    setActiveUser(null);
  }, []);

  const addCoin = useCallback((coinName: string) => {
    if (!activeUser) return;
    const existing = state.collection.find(c => c.name === coinName);
    const newCollection = existing
      ? state.collection.map(c => c.name === coinName ? { ...c, quantity: c.quantity + 1 } : c)
      : [...state.collection, { name: coinName, quantity: 1 }];

    saveState({
      collection: newCollection,
      coinBalance: state.coinBalance + 2,
      lastRipTimestamp: Date.now(),
      totalRips: (state.totalRips || 0) + 1,
    });
  }, [state, activeUser, saveState]);

  const canRipFree = useCallback(() => {
    if (!state.lastRipTimestamp) return true;
    return (Date.now() - state.lastRipTimestamp) > 24 * 60 * 60 * 1000;
  }, [state.lastRipTimestamp]);

  const getTimeUntilFreeRip = useCallback(() => {
    if (!state.lastRipTimestamp) return null;
    const diff = 24 * 60 * 60 * 1000 - (Date.now() - state.lastRipTimestamp);
    if (diff <= 0) return null;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return `${h}h ${m}m`;
  }, [state.lastRipTimestamp]);

  const payForRip = useCallback((cost: number): boolean => {
    if (state.coinBalance >= cost) {
      saveState({ coinBalance: state.coinBalance - cost });
      return true;
    }
    return false;
  }, [state.coinBalance, saveState]);

  const ripPack = useCallback((packId: PackId, cost: number, isFreeDaily: boolean): boolean => {
    if (isFreeDaily) {
      if (!canRipFree()) return false;
      return true;
    }
    return payForRip(cost);
  }, [canRipFree, payForRip]);

  return {
    state,
    isLoaded,
    login,
    logout,
    addCoin,
    canRipFree,
    getTimeUntilFreeRip,
    payForRip,
    ripPack,
  };
}

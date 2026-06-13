import { useState, useEffect, useCallback } from 'react';

export interface OwnedCoin {
  name: string;
  quantity: number;
}

export interface GameState {
  username: string | null;
  coinBalance: number;
  lastRipTimestamp: number | null;
  collection: OwnedCoin[];
}

const DEFAULT_STATE: GameState = {
  username: null,
  coinBalance: 0,
  lastRipTimestamp: null,
  collection: []
};

const getStorageKey = (username: string) => `coinrip_state_${username}`;

export function useGameState() {
  const [activeUser, setActiveUser] = useState<string | null>(null);
  const [state, setState] = useState<GameState>(DEFAULT_STATE);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('coinrip_active_user');
    if (storedUser) {
      setActiveUser(storedUser);
    }
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
    let newCollection;
    if (existing) {
      newCollection = state.collection.map(c => 
        c.name === coinName ? { ...c, quantity: c.quantity + 1 } : c
      );
    } else {
      newCollection = [...state.collection, { name: coinName, quantity: 1 }];
    }
    
    saveState({
      collection: newCollection,
      coinBalance: state.coinBalance + 2,
      lastRipTimestamp: Date.now()
    });
  }, [state, activeUser, saveState]);

  const canRipFree = useCallback(() => {
    if (!state.lastRipTimestamp) return true;
    const hours24 = 24 * 60 * 60 * 1000;
    return (Date.now() - state.lastRipTimestamp) > hours24;
  }, [state.lastRipTimestamp]);

  const payForRip = useCallback((cost: number) => {
    if (state.coinBalance >= cost) {
      saveState({ coinBalance: state.coinBalance - cost });
      return true;
    }
    return false;
  }, [state.coinBalance, saveState]);

  return {
    state,
    isLoaded,
    login,
    logout,
    addCoin,
    canRipFree,
    payForRip
  };
}
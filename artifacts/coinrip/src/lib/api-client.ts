const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? '/api';

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

async function apiFetch<T>(
  path: string,
  token: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

async function publicFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const apiClient = {
  getState: (token: string): Promise<GameStateResponse> =>
    apiFetch<GameStateResponse>('/game/state', token),

  flip: (token: string, packId: string): Promise<FlipResult> =>
    apiFetch<FlipResult>('/game/flip', token, {
      method: 'POST',
      body: JSON.stringify({ packId }),
    }),

  getLeaderboard: (limit = 20): Promise<LeaderboardResponse> =>
    publicFetch<LeaderboardResponse>(`/game/leaderboard?limit=${limit}`),
};
